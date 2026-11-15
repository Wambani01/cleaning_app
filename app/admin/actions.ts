"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { STATUSES } from "@/lib/statuses";


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
