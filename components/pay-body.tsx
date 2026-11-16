import { Card } from "@/components/ui";
import { PayForm } from "@/components/pay-form";
import { pool } from "@/lib/db";
import { euro } from "@/lib/fake-payments";
import { outstanding, paymentHistory, savedMethod } from "@/lib/payments";
import { formatDate } from "@/lib/scheduling";

export const TestBanner = () => <p role="note" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm"><b>TEST MODE.</b> No real money moves. Only test cards work, and real card numbers are not accepted.</p>;

/** Payments page. Customers can pay; an admin (readOnly) only sees the same information. */
export async function PayBody({ waitlistId, name, readOnly }: { waitlistId: string; name: string; readOnly?: boolean }) {
  const [due, history, pm] = await Promise.all([outstanding(pool, waitlistId), paymentHistory(waitlistId), savedMethod(waitlistId)]);
  const total = due.reduce((s, i) => s + i.cents, 0);
  return (
    <>
      <TestBanner />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card hover={false}>
          <h2 className="mb-3 text-xl font-semibold">Due now</h2>
          {due.length === 0 ? <p className="text-sm text-muted">Nothing is due right now.</p> : (
            <>
              <ul className="mb-4 divide-y divide-line text-sm">{due.map(i => <li key={i.key} className="flex justify-between gap-4 py-2"><span>{i.description}</span><b>{euro(i.cents)}</b></li>)}</ul>
              <p className="mb-5 flex justify-between text-lg font-bold"><span>Total</span><span>{euro(total)}</span></p>
              {readOnly ? <p className="text-sm text-muted">Only the customer can pay with their own card.</p> : <PayForm total={euro(total)} name={name} />}
            </>
          )}
          {pm && <p className="mt-4 text-sm text-muted">Saved card: {pm.brand} ending {pm.last4}, expires {String(pm.exp_month).padStart(2, "0")}/{pm.exp_year}.</p>}
        </Card>
        <Card hover={false}>
          <h2 className="mb-3 text-xl font-semibold">Payment history</h2>
          {history.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : (
            <ul className="divide-y divide-line text-sm">
              {history.map(p => (
                <li key={p.id} className="py-2.5">
                  <div className="flex justify-between gap-4"><span>{p.description}</span><b>{euro(p.amount_cents)}</b></div>
                  <p className={p.status === "succeeded" ? "text-muted" : "text-red-700"}>
                    {p.status === "succeeded" ? `Paid ${formatDate(p.paid_at!.slice(0, 10))}${p.card_last4 ? ` with card ending ${p.card_last4}` : " (recorded by Amsta Clean)"}. Receipt ${p.receipt_no}` : `Failed: ${p.failure_reason}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
