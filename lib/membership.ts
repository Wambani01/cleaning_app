import "server-only";
import type { PoolClient } from "pg";
import { nextBillingDate, todayAmsterdam } from "@/lib/scheduling";

/**
 * Marks a membership as paid today. The next payment is due 30 days later.
 * Requests that were waiting for payment move on: confirmed if their cleaner already accepted, otherwise requested.
 * Call inside a transaction.
 */
export async function applyMembershipPayment(client: PoolClient, waitlistId: string, by: string) {
  const today = todayAmsterdam(), next = nextBillingDate(today);
  const prev = (await client.query("select status from public.customer_memberships where waitlist_id = $1", [waitlistId])).rows[0];
  const renewing = prev?.status === "active";
  await client.query(
    `insert into public.customer_memberships (waitlist_id, status, started_on, billing_day, next_billing_date, activated_by) values ($1,'active',$2,null,$3,$4)
     on conflict (waitlist_id) do update set status = 'active', started_on = case when public.customer_memberships.status = 'active' then public.customer_memberships.started_on else excluded.started_on end,
       billing_day = null, next_billing_date = excluded.next_billing_date, activated_by = excluded.activated_by, updated_at = now()`,
    [waitlistId, today, next, by]);
  await client.query("update public.cleaning_requests set status = case when cleaner_response = 'accepted' then 'confirmed' else 'requested' end, updated_at = now() where waitlist_id = $1 and status = 'awaiting_payment'", [waitlistId]);
  return { renewing, next };
}
