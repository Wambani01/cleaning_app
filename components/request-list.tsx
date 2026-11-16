import { cancelRequest } from "@/app/customer/actions";
import { requestLabel, type CleaningRequest, type RequestStatus } from "@/lib/customer";
import { formatDate, formatHours } from "@/lib/scheduling";

export const statusTone: Record<RequestStatus, string> = {
  requested: "bg-amber-100 text-amber-900",
  awaiting_payment: "bg-orange-100 text-orange-900",
  confirmed: "bg-primary/20 text-primary-deep",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-surface text-muted border border-line",
};

/** The customer's requests, newest dates first. Open requests can be cancelled. */
export function RequestList({ requests, empty }: { requests: CleaningRequest[]; empty: string }) {
  if (!requests.length) return <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-muted">{empty}</p>;
  return (
    <ul className="grid gap-3">
      {requests.map(r => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white p-5 shadow-card">
          <div>
            <p className="font-semibold">{formatDate(r.requested_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="text-sm text-muted">{r.start_time} · {formatHours(r.hours)}{r.notes ? ` · ${r.notes}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[r.status]}`}>{requestLabel[r.status]}</span>
            {["requested", "awaiting_payment", "confirmed"].includes(r.status) && (
              <form action={cancelRequest}><input type="hidden" name="id" value={r.id} /><button className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:border-red-300 hover:text-red-800">Cancel</button></form>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
