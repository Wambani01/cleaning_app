import "server-only";
import { pool } from "@/lib/db";
import { RULES, checkRequest, formatDate, todayAmsterdam } from "@/lib/scheduling";
import { MAX_WINDOWS, checkDetails } from "@/lib/request-details";
import { parseRequestForm, type RequestInput } from "@/lib/request-form";
export { parseRequestForm };
export type { RequestInput };
import { tidyPostcode } from "@/lib/validate";

export type FormState = { ok: boolean; message: string; needsPayment?: boolean };

/**
 * Creates a cleaning request. Used for customers asking for themselves and for admins asking on a customer's behalf.
 *  - The first request (or one after a lapsed membership) waits for payment; later requests go straight through.
 *  - If the customer already has a regular cleaner, the request goes to that cleaner to accept or decline.
 */
export async function createCleaningRequest(waitlistId: string, by: string, input: RequestInput): Promise<FormState> {
  const today = todayAmsterdam();
  const problem = checkRequest(input.date, input.time, input.hours, today) || checkDetails(input.details);
  if (problem) return { ok: false, message: problem };
  const d = input.details;

  const client = await pool.connect();
  try {
    await client.query("begin");
    // Serialise this customer's requests so two quick submissions cannot slip past the limit.
    await client.query("select 1 from public.customer_waitlist where id = $1 for update", [waitlistId]);
    const open = Number((await client.query("select count(*) from public.cleaning_requests where waitlist_id = $1 and status in ('requested','awaiting_payment','confirmed')", [waitlistId])).rows[0].count);
    if (open >= RULES.openRequestLimit) { await client.query("rollback"); return { ok: false, message: `There are already ${RULES.openRequestLimit} open requests. Please cancel one, or wait until some are completed.` }; }
    const dup = await client.query("select 1 from public.cleaning_requests where waitlist_id = $1 and requested_date = $2 and start_time = $3 and status <> 'cancelled'", [waitlistId, input.date, input.time]);
    if (dup.rowCount) { await client.query("rollback"); return { ok: false, message: "There is already a request for that date and time." }; }

    const m = (await client.query("select status from public.customer_memberships where waitlist_id = $1", [waitlistId])).rows[0];
    const paid = m?.status === "active";
    if (!paid) await client.query(
      `insert into public.customer_memberships (waitlist_id, status) values ($1, 'pending_payment')
       on conflict (waitlist_id) do update set status = case when public.customer_memberships.status = 'past_due' then 'past_due' else 'pending_payment' end, updated_at = now()`, [waitlistId]);

    const asg = (await client.query(
      `select a.regular_cleaner_id, split_part(c.full_name, ' ', 1) as first_name from public.customer_assignments a join public.cleaner_applications c on c.id = a.regular_cleaner_id
        where a.waitlist_id = $1 and c.status = 'approved'`, [waitlistId])).rows[0] as { regular_cleaner_id: string; first_name: string } | undefined;

    await client.query(
      `insert into public.cleaning_requests (waitlist_id, requested_date, start_time, hours, notes, status, cleaner_id, cleaner_response, street, house_number, house_number_addition, postcode, city,
         property_type, bedrooms, bathrooms, windows, tasks, has_pets, supplies_at_home, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [waitlistId, input.date, input.time, input.hours, input.notes || null, paid ? "requested" : "awaiting_payment", asg?.regular_cleaner_id ?? null, asg ? "pending" : null,
       d.street, d.houseNumber, d.houseNumberAddition || null, tidyPostcode(d.postcode), d.city, d.propertyType, d.bedrooms, d.bathrooms, Math.min(d.windows, MAX_WINDOWS), d.tasks, d.hasPets, d.suppliesAtHome, by]);
    await client.query("commit");

    const when = `${formatDate(input.date)} at ${input.time}`;
    return paid
      ? { ok: true, message: asg ? `Request received for ${when}. We have sent it to ${asg.first_name} to accept, and we will confirm it shortly.` : `Request received for ${when}. We will confirm it shortly.` }
      : { ok: true, message: `Request received for ${when}. To confirm it, the first payment of €15 is needed. Pay it below to lock in the booking (test mode, no real money).`, needsPayment: true };
  } catch (e) {
    await client.query("rollback").catch(() => {});
    console.error("createCleaningRequest failed", e instanceof Error ? e.message : e);
    return { ok: false, message: "Something went wrong on our side. Please try again in a moment." };
  } finally { client.release(); }
}

/**
 * Applies a cleaner's answer to a request. A confirmed cleaning needs both an accepting cleaner and a paid membership:
 *  - accepted + paid membership  -> confirmed
 *  - declined while confirmed    -> back to requested (admin must reassign)
 */
export const ACCEPT_SQL = `update public.cleaning_requests r set cleaner_response = 'accepted', cleaner_responded_at = now(), decline_reason = null, updated_at = now(),
    status = case when r.status in ('requested','confirmed') and exists (select 1 from public.customer_memberships m where m.waitlist_id = r.waitlist_id and m.status = 'active') then 'confirmed' else r.status end`;
export const DECLINE_SQL = `update public.cleaning_requests r set cleaner_response = 'declined', cleaner_responded_at = now(), decline_reason = $2, updated_at = now(),
    status = case when r.status = 'confirmed' then 'requested' else r.status end`;
