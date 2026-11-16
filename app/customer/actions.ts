"use server";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/admin";
import { RULES, addDays, checkSchedule, firstOnOrAfter, formatDate, todayAmsterdam, FREQUENCIES, type Frequency } from "@/lib/scheduling";

import { createCleaningRequest, parseRequestForm, type FormState } from "@/lib/requests";
export type { FormState };
const fail = (message: string): FormState => ({ ok: false, message });
const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Who is acting, and for which customer. A customer always acts for themselves, taken from their session.
 * An admin may act for a customer by sending that customer's id. Nobody else can. The browser never chooses a customer on its own.
 */
async function actor(f?: FormData): Promise<{ id: string; by: string } | null> {
  const s = await getSession();
  if (!s) return null;
  if (s.user.role === "customer") {
    const row = (await pool.query("select id from public.customer_waitlist where lower(email) = lower($1) limit 1", [s.user.email])).rows[0];
    return row ? { id: row.id, by: "customer" } : null;
  }
  if (s.user.role === "admin") {
    const wid = String(f?.get("waitlistId") ?? "");
    if (UUID.test(wid) && (await pool.query("select 1 from public.customer_waitlist where id = $1", [wid])).rowCount) return { id: wid, by: s.user.email };
  }
  return null;
}
const refresh = () => { revalidatePath("/customer", "layout"); revalidatePath("/admin", "layout"); revalidatePath("/cleaner", "layout"); };

const val = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveSchedule(_p: FormState, f: FormData): Promise<FormState> {
  const who = await actor(f); const id = who?.id;
  if (!id) return fail("Please sign in as a customer to set the schedule.");
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
  refresh();
  return { ok: true, message: `Saved. Your regular cleaning is ${FREQUENCIES[frequency as Frequency].toLowerCase()}, starting ${formatDate(anchor)}.` };
}

export async function removeSchedule(f: FormData) {
  const who = await actor(f);
  if (!who) throw new Error("Not allowed");
  await pool.query("delete from public.customer_schedules where waitlist_id = $1", [who.id]);
  refresh();
}

export async function createRequest(_p: FormState, f: FormData): Promise<FormState> {
  const who = await actor(f);
  if (!who) return fail("Please sign in as a customer to make a request.");
  const result = await createCleaningRequest(who.id, who.by, parseRequestForm(f));
  if (result.ok) refresh();
  return result;
}

export async function cancelRequest(f: FormData) {
  const who = await actor(f);
  if (!who) throw new Error("Not allowed");
  const reqId = String(f.get("id") ?? "");
  if (!UUID.test(reqId)) throw new Error("Invalid input");
  // Only this customer's own requests that have not been completed. The WHERE clause enforces both.
  await pool.query("update public.cleaning_requests set status = 'cancelled', updated_at = now() where id = $1 and waitlist_id = $2 and status in ('requested','awaiting_payment','confirmed')", [reqId, who.id]);
  refresh();
}
