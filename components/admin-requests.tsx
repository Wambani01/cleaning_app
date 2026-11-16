import Link from "next/link";
import { activateMembership, cancelMembership, updateRequest } from "@/app/admin/actions";
import { statusTone } from "@/components/request-list";
import { Card } from "@/components/ui";
import { membershipLabel, requestLabel, type MembershipStatus, type RequestStatus } from "@/lib/customer";
import { formatDate, formatHours } from "@/lib/scheduling";

export type AdminRequest = {
  id: string; requested_date: string; start_time: string; hours: number; notes: string | null; status: RequestStatus; admin_notes: string | null;
  customer_id: string; name: string; email: string; phone: string | null; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null;
  membership_status: MembershipStatus | null; regular_name: string | null;
};

const REQUEST_STATUSES: RequestStatus[] = ["requested", "awaiting_payment", "confirmed", "completed", "cancelled"];
export const memTone: Record<MembershipStatus, string> = {
  free: "bg-surface text-muted border border-line", pending_payment: "bg-orange-100 text-orange-900", active: "bg-green-100 text-green-800", past_due: "bg-red-100 text-red-800", cancelled: "bg-surface text-muted border border-line",
};
const address = (a: Pick<AdminRequest, "street" | "house_number" | "house_number_addition" | "postcode" | "city">) =>
  [a.street && `${a.street} ${a.house_number ?? ""}${a.house_number_addition ? " " + a.house_number_addition : ""}`.trim(), [a.postcode, a.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

/** One cleaning request with everything an admin needs: who, where, when, payment status, and controls. */
export function AdminRequestCard({ r, returnTo, showCustomer = true }: { r: AdminRequest; returnTo: string; showCustomer?: boolean }) {
  const mem = r.membership_status ?? "free";
  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-medium">{formatDate(r.requested_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3>
          <p className="text-sm text-muted">{r.start_time} · {formatHours(r.hours)}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className={`rounded-full px-3 py-1 ${statusTone[r.status]}`}>{requestLabel[r.status]}</span>
          <span className={`rounded-full px-3 py-1 ${memTone[mem]}`}>Membership: {membershipLabel[mem]}</span>
        </div>
      </div>
      {showCustomer && (
        <div className="mt-3 text-sm">
          <p><Link href={`/admin/customers/${r.customer_id}`} className="font-semibold text-primary-dark underline underline-offset-4">{r.name}</Link> · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <> · <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a></>}</p>
          <p className="text-muted">{address(r) || "No address on file"}{r.regular_name ? ` · Regular cleaner: ${r.regular_name}` : " · No cleaner assigned yet"}</p>
        </div>
      )}
      {r.notes && <p className="mt-2 rounded-2xl bg-sand px-4 py-2 text-sm"><b>Customer note:</b> {r.notes}</p>}

      {mem !== "active" && r.status !== "cancelled" && r.status !== "completed" && (
        <form action={activateMembership} className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
          <input type="hidden" name="waitlistId" value={r.customer_id} /><input type="hidden" name="returnTo" value={returnTo} />
          <span className="flex-1">First payment (€15) not received yet. Record it once the customer has paid. Their monthly date becomes today&apos;s day of the month.</span>
          <button className="rounded-full bg-ink-deep px-4 py-2 font-bold text-white hover:bg-primary-deep">Record payment received</button>
        </form>
      )}

      <form action={updateRequest} className="mt-4 grid gap-3 sm:grid-cols-[250px_1fr_auto] sm:items-start">
        <input type="hidden" name="id" value={r.id} /><input type="hidden" name="returnTo" value={returnTo} />
        <select name="status" defaultValue={r.status} className="rounded-xl border border-line bg-white px-3 py-2.5">{REQUEST_STATUSES.map(s => <option key={s} value={s}>{requestLabel[s]}</option>)}</select>
        <textarea name="adminNotes" defaultValue={r.admin_notes ?? ""} rows={2} placeholder="Internal notes" className="rounded-xl border border-line bg-white px-3 py-2.5" />
        <button className="rounded-full bg-primary px-5 py-2.5 font-bold text-ink-deep hover:bg-mint">Save</button>
      </form>
    </Card>
  );
}

export const REQUEST_SELECT = `r.id, to_char(r.requested_date,'YYYY-MM-DD') as requested_date, to_char(r.start_time,'HH24:MI') as start_time, r.hours::float8 as hours, r.notes, r.status, r.admin_notes,
  w.id as customer_id, w.name, w.email, w.phone, w.street, w.house_number, w.house_number_addition, w.postcode, w.city,
  m.status as membership_status, reg.full_name as regular_name`;
export const REQUEST_JOINS = `from public.cleaning_requests r join public.customer_waitlist w on w.id = r.waitlist_id
  left join public.customer_memberships m on m.waitlist_id = w.id
  left join public.customer_assignments a on a.waitlist_id = w.id left join public.cleaner_applications reg on reg.id = a.regular_cleaner_id`;

/** Membership controls for one customer. */
export function MembershipPanel({ customerId, status, startedOn, nextBilling, returnTo }: { customerId: string; status: MembershipStatus; startedOn: string | null; nextBilling: string | null; returnTo: string }) {
  return (
    <Card hover={false}>
      <h2 className="mb-2 text-lg font-bold">Membership</h2>
      <p className="mb-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${memTone[status]}`}>{membershipLabel[status]}</span></p>
      {status === "active" ? (
        <p className="text-sm">Started {startedOn ? formatDate(startedOn, { day: "numeric", month: "long", year: "numeric" }) : "-"}. Next payment due <b>{nextBilling ? formatDate(nextBilling, { day: "numeric", month: "long", year: "numeric" }) : "-"}</b>, then on the same day each month.</p>
      ) : <p className="text-sm text-muted">{status === "free" ? "Free account. No request made yet." : status === "pending_payment" ? "Waiting for the first payment of €15." : status === "past_due" ? "The last payment is overdue." : "Membership ended."}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {status !== "active" && <form action={activateMembership}><input type="hidden" name="waitlistId" value={customerId} /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-ink-deep hover:bg-mint">Record payment received</button></form>}
        {status === "active" && <form action={cancelMembership}><input type="hidden" name="waitlistId" value={customerId} /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">Cancel membership</button></form>}
      </div>
      <p className="mt-3 text-xs text-muted">Payments are recorded by hand until online payment is connected.</p>
    </Card>
  );
}
