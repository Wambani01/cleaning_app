"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { STATUSES } from "@/lib/statuses";
import { dayOfMonth, nextBillingDate, todayAmsterdam } from "@/lib/scheduling";


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

/**
 * Records that the customer's first payment arrived (done by hand until online payment is connected).
 * The membership starts today. From then on the fee is due on the same day each month.
 * Requests that were waiting for this payment become normal requests.
 */
export async function activateMembership(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), returnTo = String(formData.get("returnTo") ?? "/admin");
  if (!UUID.test(waitlistId) || !returnTo.startsWith("/admin")) throw new Error("Invalid input");
  if (!(await pool.query("select 1 from public.customer_waitlist where id = $1", [waitlistId])).rowCount) throw new Error("Unknown customer");
  const today = todayAmsterdam(), day = dayOfMonth(today);
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      `insert into public.customer_memberships (waitlist_id, status, started_on, billing_day, next_billing_date, activated_by) values ($1,'active',$2,$3,$4,$5)
       on conflict (waitlist_id) do update set status = 'active', started_on = excluded.started_on, billing_day = excluded.billing_day,
         next_billing_date = excluded.next_billing_date, activated_by = excluded.activated_by, updated_at = now()`,
      [waitlistId, today, day, nextBillingDate(day, today), admin.user.email]);
    await client.query("update public.cleaning_requests set status = 'requested', updated_at = now() where waitlist_id = $1 and status = 'awaiting_payment'", [waitlistId]);
    await client.query("commit");
  } catch (e) { await client.query("rollback").catch(() => {}); throw e; } finally { client.release(); }
  revalidatePath("/admin");
  backTo(returnTo, `Membership activated. Next payment is due on ${nextBillingDate(day, today)}.`);
}

/** Ends a membership. Requests that are not yet completed are cancelled too, since the service is not paid for. */
export async function cancelMembership(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const waitlistId = String(formData.get("waitlistId") ?? ""), returnTo = String(formData.get("returnTo") ?? "/admin");
  if (!UUID.test(waitlistId) || !returnTo.startsWith("/admin")) throw new Error("Invalid input");
  await pool.query("update public.customer_memberships set status = 'cancelled', next_billing_date = null, updated_at = now() where waitlist_id = $1", [waitlistId]);
  revalidatePath("/admin");
  backTo(returnTo, "Membership cancelled.");
}

export async function updateRequest(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? ""), status = String(formData.get("status") ?? ""), notes = String(formData.get("adminNotes") ?? "").slice(0, 2000);
  const returnTo = String(formData.get("returnTo") ?? "/admin?tab=requests");
  if (!UUID.test(id) || !(REQUEST_STATUSES as readonly string[]).includes(status) || !returnTo.startsWith("/admin")) throw new Error("Invalid input");
  // A request cannot be confirmed or completed while the customer's first payment is still outstanding.
  if (status === "confirmed" || status === "completed") {
    const m = (await pool.query("select m.status from public.cleaning_requests r left join public.customer_memberships m on m.waitlist_id = r.waitlist_id where r.id = $1", [id])).rows[0];
    if (!m || m.status !== "active") return backTo(returnTo, "This customer has not paid yet. Record their payment first.");
  }
  await pool.query("update public.cleaning_requests set status = $2, admin_notes = $3, updated_at = now() where id = $1", [id, status, notes || null]);
  revalidatePath("/admin");
  backTo(returnTo, "Request updated.");
}
