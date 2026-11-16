"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { STATUSES } from "@/lib/statuses";
import { nextBillingDate, todayAmsterdam } from "@/lib/scheduling";
import { ACCEPT_SQL, DECLINE_SQL } from "@/lib/requests";


export async function updateApplication(formData: FormData) {
  // Every admin action re-checks the session. Never trust that the page was hidden.
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 4000);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(STATUSES as readonly string[]).includes(status)) throw new Error("Invalid input");
  await pool.query("update public.cleaner_applications set status = $1, notes = $2 where id = $3", [status, notes, id]);
  revalidatePath("/admin");
}

const UUID = /^[0-9a-f-]{36}$/i;
const back = (id: string, msg: string): never => redirect(`/admin/customers/${id}?msg=${encodeURIComponent(msg)}`);

/** Assign an approved cleaner to a customer's home, as the regular cleaner or as the backup. */
export async function assignCleaner(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), cleanerId = String(formData.get("cleanerId") ?? ""), role = String(formData.get("role") ?? "");
  if (!UUID.test(waitlistId) || !UUID.test(cleanerId) || (role !== "regular" && role !== "backup")) throw new Error("Invalid input");

  // Only approved cleaners can be assigned, whatever the browser sent.
  const ok = await pool.query("select 1 from public.cleaner_applications where id = $1 and status = 'approved'", [cleanerId]);
  if (!ok.rowCount) return back(waitlistId, "That cleaner is not approved.");
  if (!(await pool.query("select 1 from public.customer_waitlist where id = $1", [waitlistId])).rowCount) throw new Error("Unknown customer");

  if (role === "regular") {
    const cur = (await pool.query("select backup_cleaner_id from public.customer_assignments where waitlist_id = $1", [waitlistId])).rows[0];
    if (cur?.backup_cleaner_id === cleanerId) return back(waitlistId, "This cleaner is already the backup. Choose a different cleaner or remove the backup first.");
    await pool.query(
      `insert into public.customer_assignments (waitlist_id, regular_cleaner_id, assigned_by) values ($1, $2, $3)
       on conflict (waitlist_id) do update set regular_cleaner_id = excluded.regular_cleaner_id, assigned_by = excluded.assigned_by, updated_at = now()`,
      [waitlistId, cleanerId, admin.user.email],
    );
  } else {
    const cur = (await pool.query("select regular_cleaner_id from public.customer_assignments where waitlist_id = $1", [waitlistId])).rows[0];
    if (!cur) return back(waitlistId, "Assign a regular cleaner first, then a backup.");
    if (cur.regular_cleaner_id === cleanerId) return back(waitlistId, "The backup must be a different cleaner than the regular cleaner.");
    await pool.query("update public.customer_assignments set backup_cleaner_id = $2, assigned_by = $3, updated_at = now() where waitlist_id = $1", [waitlistId, cleanerId, admin.user.email]);
  }
  revalidatePath("/admin");
  back(waitlistId, role === "regular" ? "Regular cleaner assigned." : "Backup cleaner assigned.");
}

/** Remove the backup only (what = "backup"), or the whole assignment (what = "all"). */
export async function removeAssignment(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), what = String(formData.get("what") ?? "");
  if (!UUID.test(waitlistId) || (what !== "backup" && what !== "all")) throw new Error("Invalid input");
  if (what === "backup") await pool.query("update public.customer_assignments set backup_cleaner_id = null, updated_at = now() where waitlist_id = $1", [waitlistId]);
  else await pool.query("delete from public.customer_assignments where waitlist_id = $1", [waitlistId]);
  revalidatePath("/admin");
  back(waitlistId, what === "backup" ? "Backup removed." : "Assignment removed.");
}

const REQUEST_STATUSES = ["requested", "awaiting_payment", "confirmed", "completed", "cancelled"] as const;
const backTo = (path: string, msg: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}`);
const adminReturn = (f: FormData, fallback = "/admin") => { const r = String(f.get("returnTo") ?? fallback); if (!r.startsWith("/admin")) throw new Error("Invalid input"); return r; };
const refreshAll = () => { revalidatePath("/admin", "layout"); revalidatePath("/customer", "layout"); revalidatePath("/cleaner", "layout"); };

/**
 * Records a payment of the €15 membership (done by hand until online payment is connected).
 *  - First payment: the membership starts today. Requests waiting for it are released.
 *  - Renewal payment: the next payment moves to 30 days after today.
 * Either way, the next payment is due 30 days after the day of payment.
 */
export async function activateMembership(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), returnTo = adminReturn(formData);
  if (!UUID.test(waitlistId)) throw new Error("Invalid input");
  if (!(await pool.query("select 1 from public.customer_waitlist where id = $1", [waitlistId])).rowCount) throw new Error("Unknown customer");
  const today = todayAmsterdam(), next = nextBillingDate(today);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const prev = (await client.query("select status, started_on from public.customer_memberships where waitlist_id = $1", [waitlistId])).rows[0];
    const renewing = prev?.status === "active";
    await client.query(
      `insert into public.customer_memberships (waitlist_id, status, started_on, billing_day, next_billing_date, activated_by) values ($1,'active',$2,null,$3,$4)
       on conflict (waitlist_id) do update set status = 'active', started_on = case when public.customer_memberships.status = 'active' then public.customer_memberships.started_on else excluded.started_on end,
         billing_day = null, next_billing_date = excluded.next_billing_date, activated_by = excluded.activated_by, updated_at = now()`,
      [waitlistId, today, next, admin.user.email]);
    // Requests that were waiting for payment move on: confirmed if their cleaner already accepted, otherwise just requested.
    await client.query("update public.cleaning_requests set status = case when cleaner_response = 'accepted' then 'confirmed' else 'requested' end, updated_at = now() where waitlist_id = $1 and status = 'awaiting_payment'", [waitlistId]);
    await client.query("commit");
    refreshAll();
    return backTo(returnTo, renewing ? `Renewal recorded. The next payment is due on ${next}.` : `Membership activated. The next payment is due on ${next} (30 days from today).`);
  } catch (e) { await client.query("rollback").catch(() => {}); throw e; } finally { client.release(); }
}

/** Ends a membership. */
export async function cancelMembership(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), returnTo = adminReturn(formData);
  if (!UUID.test(waitlistId)) throw new Error("Invalid input");
  await pool.query("update public.customer_memberships set status = 'cancelled', next_billing_date = null, updated_at = now() where waitlist_id = $1", [waitlistId]);
  refreshAll();
  backTo(returnTo, "Membership cancelled.");
}

export async function updateRequest(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? ""), status = String(formData.get("status") ?? ""), notes = String(formData.get("adminNotes") ?? "").slice(0, 2000);
  const returnTo = adminReturn(formData, "/admin?tab=requests");
  if (!UUID.test(id) || !(REQUEST_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid input");
  if (status === "confirmed" || status === "completed") {
    const r = (await pool.query("select m.status as membership, r.cleaner_id, r.cleaner_response from public.cleaning_requests r left join public.customer_memberships m on m.waitlist_id = r.waitlist_id where r.id = $1", [id])).rows[0];
    // A cleaning is confirmed only when the customer has paid AND a cleaner has accepted it.
    if (!r || r.membership !== "active") return backTo(returnTo, "This customer has not paid yet. Record their payment first.");
    if (!r.cleaner_id) return backTo(returnTo, "No cleaner is assigned to this request yet. Use Reassign to choose one.");
    if (r.cleaner_response !== "accepted") return backTo(returnTo, "The cleaner has not accepted this request yet.");
  }
  await pool.query("update public.cleaning_requests set status = $2, admin_notes = $3, updated_at = now() where id = $1", [id, status, notes || null]);
  refreshAll();
  backTo(returnTo, "Request updated.");
}

/**
 * Chooses the cleaner for one request (a reassign, or the first assignment). The new cleaner has to accept it again.
 * "makeRegular" also makes them the customer's regular cleaner for future requests.
 */
export async function assignRequestCleaner(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? ""), cleanerId = String(formData.get("cleanerId") ?? ""), makeRegular = formData.get("makeRegular") === "on";
  const returnTo = adminReturn(formData, "/admin?tab=requests");
  if (!UUID.test(id) || !UUID.test(cleanerId)) throw new Error("Invalid input");
  if (!(await pool.query("select 1 from public.cleaner_applications where id = $1 and status = 'approved'", [cleanerId])).rowCount) return backTo(returnTo, "That cleaner is not approved.");
  const client = await pool.connect();
  try {
    await client.query("begin");
    const r = (await client.query("select waitlist_id from public.cleaning_requests where id = $1 and status in ('requested','awaiting_payment','confirmed') for update", [id])).rows[0];
    if (!r) { await client.query("rollback"); return backTo(returnTo, "This request is no longer open."); }
    // The new cleaner must answer again. A confirmed cleaning goes back to "requested" until they accept.
    await client.query("update public.cleaning_requests set cleaner_id = $2, cleaner_response = 'pending', cleaner_responded_at = null, decline_reason = null, status = case when status = 'confirmed' then 'requested' else status end, updated_at = now() where id = $1", [id, cleanerId]);
    const asg = (await client.query("select regular_cleaner_id, backup_cleaner_id from public.customer_assignments where waitlist_id = $1", [r.waitlist_id])).rows[0];
    if (!asg) {
      await client.query("insert into public.customer_assignments (waitlist_id, regular_cleaner_id, assigned_by) values ($1,$2,$3)", [r.waitlist_id, cleanerId, admin.user.email]);
    } else if (makeRegular && asg.regular_cleaner_id !== cleanerId) {
      await client.query("update public.customer_assignments set regular_cleaner_id = $2, backup_cleaner_id = case when backup_cleaner_id = $2 then null else backup_cleaner_id end, assigned_by = $3, updated_at = now() where waitlist_id = $1", [r.waitlist_id, cleanerId, admin.user.email]);
    }
    await client.query("commit");
  } catch (e) { await client.query("rollback").catch(() => {}); throw e; } finally { client.release(); }
  refreshAll();
  backTo(returnTo, "Cleaner assigned. They have been asked to accept the request.");
}

/** Admin records the cleaner's answer after speaking to them (for example by phone). */
export async function setCleanerResponse(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? ""), answer = String(formData.get("answer") ?? "");
  const returnTo = adminReturn(formData, "/admin?tab=requests");
  if (!UUID.test(id) || (answer !== "accept" && answer !== "decline")) throw new Error("Invalid input");
  const open = "r.cleaner_id is not null and r.status in ('requested','confirmed')";
  if (answer === "accept") await pool.query(`${ACCEPT_SQL} where r.id = $1 and ${open} and r.cleaner_response in ('pending','declined')`, [id]);
  else await pool.query(`${DECLINE_SQL} where r.id = $1 and ${open} and r.cleaner_response in ('pending','accepted')`, [id, "Recorded by admin"]);
  refreshAll();
  backTo(returnTo, answer === "accept" ? "Recorded: the cleaner accepted." : "Recorded: the cleaner declined. Use Reassign to choose someone else.");
}
