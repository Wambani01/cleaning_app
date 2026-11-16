import { cancelRequest } from "@/app/customer/actions";
import { requestLabel, type CleaningRequest, type RequestStatus } from "@/lib/customer";
import { summarise } from "@/lib/request-details";
import { formatDate, formatHours } from "@/lib/scheduling";

export const statusTone: Record<RequestStatus, string> = {
  requested: "bg-amber-100 text-amber-900",
  awaiting_payment: "bg-orange-100 text-orange-900",
  confirmed: "bg-primary/20 text-primary-deep",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-surface text-muted border border-line",
};
export const addressLine = (a: { street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null }) =>
  [a.street && `${a.street} ${a.house_number ?? ""}${a.house_number_addition ? " " + a.house_number_addition : ""}`.trim(), [a.postcode, a.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

/** What the customer is told about their cleaner's answer. */
function cleanerLine(r: CleaningRequest) {
  if (!r.cleaner_first_name || r.status === "cancelled" || r.status === "completed") return null;
  if (r.cleaner_response === "accepted") return <span className="text-green-800">{r.cleaner_first_name} has accepted</span>;
  if (r.cleaner_response === "declined") return <span className="text-orange-800">{r.cleaner_first_name} cannot make it. We will find another cleaner.</span>;
  return <span className="text-muted">Waiting for {r.cleaner_first_name} to accept</span>;
}

/** The customer's requests. Open requests can be cancelled. `adminId` is set when an admin is acting for the customer. */
export function RequestList({ requests, empty, adminId, payHref }: { requests: CleaningRequest[]; empty: string; adminId?: string; payHref?: string }) {
  if (!requests.length) return <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-muted">{empty}</p>;
  return (
    <ul className="grid gap-3">
      {requests.map(r => (
        <li key={r.id} className="rounded-3xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{formatDate(r.requested_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="text-sm text-muted">{r.start_time} · {formatHours(r.hours)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[r.status]}`}>{requestLabel[r.status]}</span>
              {["requested", "awaiting_payment", "confirmed"].includes(r.status) && (
                <form action={cancelRequest}><input type="hidden" name="id" value={r.id} />{adminId && <input type="hidden" name="waitlistId" value={adminId} />}<button className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:border-red-300 hover:text-red-800">Cancel</button></form>
              )}
            </div>
          </div>
          {r.status === "awaiting_payment" && payHref && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm"><span>Pay €15 to get a cleaner assigned and confirm this booking.</span><a href={payHref} className="rounded-full bg-primary px-5 py-2 font-bold text-ink-deep hover:bg-mint">Pay €15 now</a></div>
          )}
          <div className="mt-2 grid gap-0.5 text-sm">
            {addressLine(r) && <p className="text-muted">{addressLine(r)}</p>}
            {(r.property_type || r.tasks.length > 0) && <p className="text-muted">{summarise(r)}</p>}
            {r.notes && <p className="text-muted">Note: {r.notes}</p>}
            {cleanerLine(r) && <p className="font-medium">{cleanerLine(r)}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
