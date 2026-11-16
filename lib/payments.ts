import "server-only";
import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { todayAmsterdam } from "@/lib/scheduling";
import { applyMembershipPayment } from "@/lib/membership";
import { DECLINE_MESSAGE, MEMBERSHIP_CENTS, euro, type CardCheck } from "@/lib/fake-payments";

/**
 * TEST MODE payment provider. Nothing here moves real money. To go live, replace chargeFake() with a Stripe call
 * (PaymentIntent with a saved payment method) and keep the rest.
 */
export type Outcome = "ok" | "declined" | "no_funds";
type Charge = { ok: true; reference: string } | { ok: false; reason: string };
export const chargeFake = (outcome: Outcome): Charge =>
  outcome === "ok" ? { ok: true, reference: `fake_ch_${randomBytes(8).toString("hex")}` } : { ok: false, reason: DECLINE_MESSAGE[outcome] };

export type DueItem = { key: string; kind: "membership" | "cleaning"; description: string; cents: number; paymentId?: string };
export type PaymentRow = { id: string; kind: string; description: string; amount_cents: number; status: string; provider: string | null; card_last4: string | null; failure_reason: string | null; receipt_no: string | null; paid_at: string | null; created_at: string };

type Q = Pick<PoolClient, "query">;

/** What this customer owes right now. */
export async function outstanding(db: Q, waitlistId: string): Promise<DueItem[]> {
  const items: DueItem[] = [];
  const m = (await db.query("select status, to_char(next_billing_date,'YYYY-MM-DD') as next from public.customer_memberships where waitlist_id = $1", [waitlistId])).rows[0];
  const today = todayAmsterdam();
  const awaiting = (await db.query("select 1 from public.cleaning_requests where waitlist_id = $1 and status = 'awaiting_payment' limit 1", [waitlistId])).rowCount;
  const memberDue = m ? (m.status === "pending_payment" || m.status === "past_due" || (m.status === "active" && m.next && m.next <= today)) : !!awaiting;
  if (memberDue) items.push({ key: "membership", kind: "membership", description: "Amsta Clean membership (30 days)", cents: MEMBERSHIP_CENTS });
  const due = (await db.query("select id, description, amount_cents from public.payments where waitlist_id = $1 and kind = 'cleaning' and status = 'due' order by created_at", [waitlistId])).rows;
  for (const d of due) items.push({ key: d.id, kind: "cleaning", description: d.description, cents: d.amount_cents, paymentId: d.id });
  return items;
}

async function receipt(db: Q) {
  const n = (await db.query("select nextval('public.payment_receipt_seq') as n")).rows[0].n;
  return `AC-${todayAmsterdam().slice(0, 4)}-${String(n).padStart(6, "0")}`;
}

/** Records a membership payment attempt and, if it succeeds, activates the membership. */
async function settleMembership(db: PoolClient, waitlistId: string, charge: Charge, last4: string | null, provider: "fake" | "manual", by: string) {
  if (!charge.ok) {
    await db.query("insert into public.payments (waitlist_id, kind, description, amount_cents, status, provider, card_last4, failure_reason, created_by) values ($1,'membership','Amsta Clean membership (30 days)',$2,'failed',$3,$4,$5,$6)", [waitlistId, MEMBERSHIP_CENTS, provider, last4, charge.reason, by]);
    await db.query("update public.customer_memberships set status = 'past_due', updated_at = now() where waitlist_id = $1 and status = 'active' and next_billing_date <= $2", [waitlistId, todayAmsterdam()]);
    return;
  }
  await db.query("insert into public.payments (waitlist_id, kind, description, amount_cents, status, provider, reference, card_last4, receipt_no, paid_at, created_by) values ($1,'membership','Amsta Clean membership (30 days)',$2,'succeeded',$3,$4,$5,$6,now(),$7)", [waitlistId, MEMBERSHIP_CENTS, provider, charge.reference, last4, await receipt(db), by]);
  await applyMembershipPayment(db, waitlistId, by);
}

async function settleCleaning(db: PoolClient, item: DueItem, charge: Charge, last4: string | null) {
  if (!charge.ok) { await db.query("update public.payments set failure_reason = $2 where id = $1", [item.paymentId, charge.reason]); return; }
  await db.query("update public.payments set status = 'succeeded', provider = 'fake', reference = $2, card_last4 = $3, receipt_no = $4, paid_at = now(), failure_reason = null where id = $1 and status = 'due'", [item.paymentId, charge.reference, last4, await receipt(db)]);
}

export type PayResult = { ok: boolean; message: string };

/** The customer pays everything outstanding with one card. Runs in a transaction that locks the customer, so a double click cannot charge twice. */
export async function payOutstanding(waitlistId: string, card: Extract<CardCheck, { ok: true }>, save: boolean, by: string): Promise<PayResult> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select 1 from public.customer_waitlist where id = $1 for update", [waitlistId]);
    const items = await outstanding(client, waitlistId);
    if (!items.length) { await client.query("rollback"); return { ok: false, message: "Nothing is due right now." }; }
    const charge = chargeFake(card.outcome);
    for (const it of items) it.kind === "membership" ? await settleMembership(client, waitlistId, charge, card.last4, "fake", by) : await settleCleaning(client, it, charge, card.last4);
    if (charge.ok && save) await saveMethod(client, waitlistId, card);
    await client.query("commit");
    const total = items.reduce((s, i) => s + i.cents, 0);
    return charge.ok ? { ok: true, message: `Payment received (test mode). Total ${euro(total)}.` } : { ok: false, message: `${charge.reason} Nothing was charged. Try another test card.` };
  } catch (e) { await client.query("rollback").catch(() => {}); throw e; } finally { client.release(); }
}

async function saveMethod(db: Q, waitlistId: string, c: Extract<CardCheck, { ok: true }>) {
  await db.query(
    `insert into public.payment_methods (waitlist_id, provider, token, brand, last4, exp_month, exp_year, will_decline) values ($1,'fake',$2,$3,$4,$5,$6,$7)
     on conflict (waitlist_id) do update set token = excluded.token, brand = excluded.brand, last4 = excluded.last4, exp_month = excluded.exp_month, exp_year = excluded.exp_year, will_decline = excluded.will_decline, updated_at = now()`,
    [waitlistId, `fake_pm_${randomBytes(8).toString("hex")}`, c.brand, c.last4, c.month, c.year, c.outcome !== "ok"]);
}

/** Lets a customer save a test card without paying (used to demo a failing renewal). */
export async function saveCard(waitlistId: string, c: Extract<CardCheck, { ok: true }>) { await saveMethod(pool, waitlistId, c); }

/** Admin action: charges every customer with a saved card whose payment is due. Failures mark the membership past due. */
export async function processDuePayments(by: string): Promise<{ charged: number; failed: number; skipped: number }> {
  const today = todayAmsterdam();
  const ids = (await pool.query(
    `select distinct w.id from public.customer_waitlist w
     left join public.customer_memberships m on m.waitlist_id = w.id
     where (m.status = 'active' and m.next_billing_date <= $1) or m.status = 'past_due'
        or exists (select 1 from public.payments p where p.waitlist_id = w.id and p.kind = 'cleaning' and p.status = 'due')`, [today])).rows.map(r => r.id as string);
  let charged = 0, failed = 0, skipped = 0;
  for (const id of ids) {
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select 1 from public.customer_waitlist where id = $1 for update", [id]);
      const pm = (await client.query("select will_decline, last4 from public.payment_methods where waitlist_id = $1", [id])).rows[0];
      const items = await outstanding(client, id);
      if (!pm || !items.length) { await client.query("rollback"); skipped++; continue; }
      const charge = chargeFake(pm.will_decline ? "declined" : "ok");
      for (const it of items) it.kind === "membership" ? await settleMembership(client, id, charge, pm.last4, "fake", by) : await settleCleaning(client, it, charge, pm.last4);
      await client.query("commit");
      charge.ok ? charged++ : failed++;
    } catch { await client.query("rollback").catch(() => {}); failed++; } finally { client.release(); }
  }
  return { charged, failed, skipped };
}

/** Admin records a payment taken outside the app (bank transfer, cash). Same effect as a successful payment. */
export async function recordManualMembership(waitlistId: string, by: string) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select 1 from public.customer_waitlist where id = $1 for update", [waitlistId]);
    await settleMembership(client, waitlistId, { ok: true, reference: `manual_${randomBytes(6).toString("hex")}` }, null, "manual", by);
    const m = (await client.query("select to_char(next_billing_date,'YYYY-MM-DD') as next from public.customer_memberships where waitlist_id = $1", [waitlistId])).rows[0];
    await client.query("commit");
    return m.next as string;
  } catch (e) { await client.query("rollback").catch(() => {}); throw e; } finally { client.release(); }
}

/** Creates the charge for a completed cleaning: hours x hourly rate. One per request. */
export async function chargeCompletedRequest(db: Q, requestId: string, by: string) {
  const r = (await db.query("select waitlist_id, hours::float8 as hours, to_char(requested_date,'YYYY-MM-DD') as d from public.cleaning_requests where id = $1", [requestId])).rows[0];
  if (!r) return;
  const cents = Math.round(r.hours * 1500);
  await db.query("insert into public.payments (waitlist_id, kind, request_id, description, amount_cents, status, due_on, created_by) values ($1,'cleaning',$2,$3,$4,'due',$5,$6) on conflict do nothing",
    [r.waitlist_id, requestId, `Cleaning on ${r.d} (${r.hours} hours)`, cents, todayAmsterdam(), by]);
}

export async function paymentHistory(waitlistId: string): Promise<PaymentRow[]> {
  return (await pool.query("select id, kind, description, amount_cents, status, provider, card_last4, failure_reason, receipt_no, paid_at::text, created_at::text from public.payments where waitlist_id = $1 and status <> 'due' order by created_at desc limit 100", [waitlistId])).rows;
}
export async function savedMethod(waitlistId: string) {
  return (await pool.query("select brand, last4, exp_month, exp_year, will_decline from public.payment_methods where waitlist_id = $1", [waitlistId])).rows[0] as { brand: string; last4: string; exp_month: number; exp_year: number; will_decline: boolean } | undefined;
}
