"use server";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/admin";
import { ACCEPT_SQL, DECLINE_SQL } from "@/lib/requests";
import { todayAmsterdam } from "@/lib/scheduling";

const UUID = /^[0-9a-f-]{36}$/i;

/** A cleaner accepts or declines a cleaning request that was sent to them. */
export async function respondToRequest(f: FormData) {
  const s = await getSession();
  if (!s) throw new Error("Not allowed");
  // Who answers: a cleaner answers for themselves (taken from their session, never from the form).
  // An admin may answer for a cleaner by sending that cleaner's application id. Nobody else can.
  let me: { id: string } | undefined;
  if (s.user.role === "cleaner") {
    me = (await pool.query("select id from public.cleaner_applications where lower(email) = lower($1) and status = 'approved' limit 1", [s.user.email])).rows[0];
  } else if (s.user.role === "admin") {
    const cid = String(f.get("cleanerId") ?? "");
    if (UUID.test(cid)) me = (await pool.query("select id from public.cleaner_applications where id = $1 and status = 'approved'", [cid])).rows[0];
  }
  if (!me) throw new Error("Not allowed");
  const id = String(f.get("id") ?? ""), answer = String(f.get("answer") ?? ""), reason = String(f.get("reason") ?? "").trim().slice(0, 500);
  if (!UUID.test(id) || (answer !== "accept" && answer !== "decline")) throw new Error("Invalid input");
  const today = todayAmsterdam();
  // The WHERE clauses make sure it is this cleaner's own, still-open, future request, and that the answer is allowed from its current state.
  if (answer === "accept") {
    await pool.query(`${ACCEPT_SQL} where r.id = $1 and r.cleaner_id = $2 and r.cleaner_response = 'pending' and r.status in ('requested','confirmed') and r.requested_date >= $3`, [id, me.id, today]);
  } else {
    await pool.query(`${DECLINE_SQL} where r.id = $1 and r.cleaner_id = $3 and r.cleaner_response in ('pending','accepted') and r.status in ('requested','confirmed') and r.requested_date >= $4`, [id, reason || null, me.id, today]);
  }
  revalidatePath("/cleaner", "layout"); revalidatePath("/admin", "layout"); revalidatePath("/customer", "layout");
}
