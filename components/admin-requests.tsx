import Link from "next/link";
import { Phone } from "lucide-react";
import { activateMembership, cancelMembership, setCleanerResponse, updateRequest } from "@/app/admin/actions";
import { statusTone } from "@/components/request-list";
import { Card } from "@/components/ui";
import { membershipLabel, requestLabel, responseLabel, type CleanerResponse, type MembershipStatus, type RequestStatus } from "@/lib/customer";
import { summarise } from "@/lib/request-details";
import { BILLING_PERIOD_DAYS, formatDate, formatHours } from "@/lib/scheduling";

export type AdminRequest = {
  id: string; requested_date: string; start_time: string; hours: number; notes: string | null; status: RequestStatus; admin_notes: string | null;
  customer_id: string; name: string; email: string; phone: string | null; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null;
  membership_status: MembershipStatus | null; regular_name: string | null;
  cleaner_id: string | null; cleaner_name: string | null; cleaner_phone: string | null; cleaner_response: CleanerResponse | null; decline_reason: string | null;
  r_street: string | null; r_house_number: string | null; r_house_number_addition: string | null; r_postcode: string | null; r_city: string | null;
  property_type: string | null; bedrooms: number | null; bathrooms: number | null; windows: number | null; tasks: string[]; has_pets: boolean | null; supplies_at_home: boolean | null; created_by: string | null;
};

const REQUEST_STATUSES: RequestStatus[] = ["requested", "awaiting_payment", "confirmed", "completed", "cancelled"];
export const respTone: Record<CleanerResponse, string> = { pending: "bg-amber-100 text-amber-900", accepted: "bg-green-100 text-green-800", declined: "bg-red-100 text-red-800" };
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
          <p><Link href={`/admin/customers/${r.customer_id}`} className="font-semibold text-primary-dark underline underline-offset-4">{r.name}</Link> · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <> · <a className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-0.5 font-semibold underline-offset-4 hover:underline" href={`tel:${r.phone}`}><Phone size={13} aria-hidden="true" />Call client {r.phone}</a></>}</p>
          <p className="text-muted">{address(r) || "No address on file"}{r.regular_name ? ` · Regular cleaner: ${r.regular_name}` : " · No cleaner assigned yet"}</p>
        </div>
      )}
      <div className="mt-3 grid gap-1 rounded-2xl bg-sand/70 px-4 py-3 text-sm">
        <p><b>Cleaning at:</b> {address({ street: r.r_street, house_number: r.r_house_number, house_number_addition: r.r_house_number_addition, postcode: r.r_postcode, city: r.r_city } as never) || "same as the customer's address"}</p>
        {(r.property_type || r.tasks.length > 0) && <p><b>Job:</b> {summarise(r)}</p>}
        {(r.has_pets !== null || r.supplies_at_home !== null) && <p><b>Good to know:</b> {r.has_pets ? "pets at home" : "no pets"} · {r.supplies_at_home === false ? "no cleaning supplies at home" : "cleaning supplies at home"}</p>}
        {r.created_by && r.created_by !== "customer" && <p className="text-muted">Created by admin ({r.created_by})</p>}
      </div>
      {r.notes && <p className="mt-2 rounded-2xl bg-sand px-4 py-2 text-sm"><b>Customer note:</b> {r.notes}</p>}

      {r.status !== "cancelled" && r.status !== "completed" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
          {r.cleaner_id && r.cleaner_response ? (
            <>
              <span><b>Cleaner:</b> <Link href={`/admin/cleaners/${r.cleaner_id}/view`} className="font-semibold text-primary-dark underline underline-offset-4">{r.cleaner_name}</Link></span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${respTone[r.cleaner_response]}`}>{responseLabel[r.cleaner_response]}</span>
              {r.cleaner_phone && <a href={`tel:${r.cleaner_phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-ink-deep px-4 py-1.5 font-semibold text-white hover:bg-primary-deep"><Phone size={14} aria-hidden="true" />Call cleaner</a>}
              <Link href={`/admin/requests/${r.id}/reassign`} className="rounded-full border border-line px-4 py-1.5 font-semibold hover:border-primary">Reassign</Link>
              {r.cleaner_response === "pending" && (
                <span className="flex flex-wrap gap-2">
                  <form action={setCleanerResponse}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="answer" value="accept" /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">Cleaner agreed by phone</button></form>
                  <form action={setCleanerResponse}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="answer" value="decline" /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50">Cleaner declined by phone</button></form>
                </span>
              )}
              {r.cleaner_response === "declined" && <span className="w-full text-red-800">Declined{r.decline_reason ? `: ${r.decline_reason}` : "."} Choose another cleaner with Reassign.</span>}
            </>
          ) : (
            <><span className="text-muted">No cleaner assigned yet.</span><Link href={`/admin/requests/${r.id}/reassign`} className="rounded-full bg-primary px-4 py-1.5 font-bold text-ink-deep hover:bg-mint">Assign a cleaner</Link></>
          )}
        </div>
      )}

      {mem !== "active" && r.status !== "cancelled" && r.status !== "completed" && (
        <form action={activateMembership} className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
          <input type="hidden" name="waitlistId" value={r.customer_id} /><input type="hidden" name="returnTo" value={returnTo} />
          <span className="flex-1">First payment (€15) not received yet. Record it once the customer has paid. The next payment will then be due 30 days later.</span>
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
  m.status as membership_status, reg.full_name as regular_name,
  r.cleaner_id, cl.full_name as cleaner_name, cl.phone as cleaner_phone, r.cleaner_response, r.decline_reason,
  r.street as r_street, r.house_number as r_house_number, r.house_number_addition as r_house_number_addition, r.postcode as r_postcode, r.city as r_city,
  r.property_type, r.bedrooms, r.bathrooms, r.windows, r.tasks, r.has_pets, r.supplies_at_home, r.created_by`;
export const REQUEST_JOINS = `from public.cleaning_requests r join public.customer_waitlist w on w.id = r.waitlist_id
  left join public.customer_memberships m on m.waitlist_id = w.id
  left join public.customer_assignments a on a.waitlist_id = w.id left join public.cleaner_applications reg on reg.id = a.regular_cleaner_id
  left join public.cleaner_applications cl on cl.id = r.cleaner_id`;

/** Membership controls for one customer. */
export function MembershipPanel({ customerId, status, startedOn, nextBilling, returnTo }: { customerId: string; status: MembershipStatus; startedOn: string | null; nextBilling: string | null; returnTo: string }) {
  return (
    <Card hover={false}>
      <h2 className="mb-2 text-lg font-bold">Membership</h2>
      <p className="mb-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${memTone[status]}`}>{membershipLabel[status]}</span></p>
      {status === "active" ? (
        <p className="text-sm">Started {startedOn ? formatDate(startedOn, { day: "numeric", month: "long", year: "numeric" }) : "-"}. Next payment due <b>{nextBilling ? formatDate(nextBilling, { day: "numeric", month: "long", year: "numeric" }) : "-"}</b>. It renews {BILLING_PERIOD_DAYS} days after each payment.</p>
      ) : <p className="text-sm text-muted">{status === "free" ? "Free account. No request made yet." : status === "pending_payment" ? "Waiting for the first payment of €15." : status === "past_due" ? "The last payment is overdue." : "Membership ended."}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {status !== "active" && <form action={activateMembership}><input type="hidden" name="waitlistId" value={customerId} /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-ink-deep hover:bg-mint">Record payment received</button></form>}
        {status === "active" && <form action={activateMembership}><input type="hidden" name="waitlistId" value={customerId} /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-ink-deep hover:bg-mint">Record renewal payment</button></form>}
        {status === "active" && <form action={cancelMembership}><input type="hidden" name="waitlistId" value={customerId} /><input type="hidden" name="returnTo" value={returnTo} /><button className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">Cancel membership</button></form>}
      </div>
      <p className="mt-3 text-xs text-muted">Payments are recorded by hand until online payment is connected.</p>
    </Card>
  );
}
