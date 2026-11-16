"use server";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/admin";
import {
  RULES, addDays, checkRequest, checkSchedule, firstOnOrAfter, formatDate, todayAmsterdam, FREQUENCIES, type Frequency,
} from "@/lib/scheduling";

export type FormState = { ok: boolean; message: string };
const fail = (message: string): FormState => ({ ok: false, message });

/** The signed-in customer's row. Always derived from the session, never from anything the browser sends. */
async function customerId(): Promise<string | null> {
  const s = await getSession();
  if (!s || s.user.role !== "customer") return null;
  return (await pool.query("select id from public.customer_waitlist where lower(email) = lower($1) limit 1", [s.user.email])).rows[0]?.id ?? null;
}

const val = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveSchedule(_p: FormState, f: FormData): Promise<FormState> {
  const id = await customerId();
  if (!id) return fail("Please sign in as a customer to set your schedule.");
  const frequency = val(f, "frequency"), weekday = Number(val(f, "weekday")), time = val(f, "time", 5), hours = Number(val(f, "hours", 4));
  const problem = checkSchedule(frequency, weekday, time, hours);
  if (problem) return fail(problem);
  const anchor = firstOnOrAfter(addDays(todayAmsterdam(), RULES.minLeadDays), weekday);
  await pool.query(
    `insert into public.customer_schedules (waitlist_id, frequency, weekday, anchor_date, start_time, hours)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (waitlist_id) do update set frequency = excluded.frequency, weekday = excluded.weekday, anchor_date = excluded.anchor_date,
       start_time = excluded.start_time, hours = excluded.hours, updated_at = now()`,
    [id, frequency, weekday, anchor, time, hours],
  );
  revalidatePath("/customer", "layout");
  return { ok: true, message: `Saved. Your regular cleaning is ${FREQUENCIES[frequency as Frequency].toLowerCase()}, starting ${formatDate(anchor)}.` };
}

export async function removeSchedule() {
  const id = await customerId();
  if (!id) throw new Error("Not allowed");
  await pool.query("delete from public.customer_schedules where waitlist_id = $1", [id]);
  revalidatePath("/customer", "layout");
}

export async function createRequest(_p: FormState, f: FormData): Promise<FormState> {
  const id = await customerId();
  if (!id) return fail("Please sign in as a customer to make a request.");
  const date = val(f, "date", 10), time = val(f, "time", 5), hours = Number(val(f, "hours", 4)), notes = val(f, "notes", 1000);
  const problem = checkRequest(date, time, hours, todayAmsterdam());
  if (problem) return fail(problem);

  const client = await pool.connect();
  try {
    await client.query("begin");
    // Serialise this customer's requests so two quick submissions cannot slip past the limit.
    await client.query("select 1 from public.customer_waitlist where id = $1 for update", [id]);
    const open = Number((await client.query("select count(*) from public.cleaning_requests where waitlist_id = $1 and status in ('requested','awaiting_payment','confirmed')", [id])).rows[0].count);
    if (open >= RULES.openRequestLimit) { await client.query("rollback"); return fail(`You already have ${RULES.openRequestLimit} open requests. Please cancel one, or wait until some are completed.`); }
    const dup = await client.query("select 1 from public.cleaning_requests where waitlist_id = $1 and requested_date = $2 and start_time = $3 and status <> 'cancelled'", [id, date, time]);
    if (dup.rowCount) { await client.query("rollback"); return fail("You already have a request for that date and time."); }

    const m = (await client.query("select status from public.customer_memberships where waitlist_id = $1", [id])).rows[0];
    const paid = m?.status === "active";
    // The first request is what triggers payment: a free account (or a lapsed membership) moves to "pending payment".
    if (!paid) await client.query(
      `insert into public.customer_memberships (waitlist_id, status) values ($1, 'pending_payment')
       on conflict (waitlist_id) do update set status = case when public.customer_memberships.status = 'past_due' then 'past_due' else 'pending_payment' end, updated_at = now()`, [id]);
    await client.query(
      "insert into public.cleaning_requests (waitlist_id, requested_date, start_time, hours, notes, status) values ($1,$2,$3,$4,$5,$6)",
      [id, date, time, hours, notes || null, paid ? "requested" : "awaiting_payment"]);
    await client.query("commit");
    revalidatePath("/customer", "layout");
    return paid
      ? { ok: true, message: `Request received for ${formatDate(date)} at ${time}. We will confirm it shortly.` }
      : { ok: true, message: `Request received for ${formatDate(date)} at ${time}. To confirm it, your first payment of €15 is needed. Online payment is coming soon, and we will contact you with the details.` };
  } catch (e) {
    await client.query("rollback").catch(() => {});
    console.error("createRequest failed", e instanceof Error ? e.message : e);
    return fail("Something went wrong on our side. Please try again in a moment.");
  } finally { client.release(); }
}

export async function cancelRequest(f: FormData) {
  const id = await customerId();
  if (!id) throw new Error("Not allowed");
  const reqId = String(f.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(reqId)) throw new Error("Invalid input");
  // Only the customer's own requests that have not been completed. The WHERE clause enforces both.
  await pool.query("update public.cleaning_requests set status = 'cancelled', updated_at = now() where id = $1 and waitlist_id = $2 and status in ('requested','awaiting_payment','confirmed')", [reqId, id]);
  revalidatePath("/customer", "layout");
}
