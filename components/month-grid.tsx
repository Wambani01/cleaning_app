import { daysInMonth, isoWeekday, type ISODate } from "@/lib/scheduling";

export type Mark = "regular" | "requested" | "confirmed";
const markCls: Record<Mark, string> = {
  regular: "bg-primary/20 text-primary-deep ring-1 ring-primary/40",
  requested: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  confirmed: "bg-primary text-ink-deep font-bold",
};
const pad = (n: number) => String(n).padStart(2, "0");

function Month({ ym, marks, today }: { ym: string; marks: Record<ISODate, Mark>; today: ISODate }) {
  const [y, m] = ym.split("-").map(Number);
  const lead = isoWeekday(`${ym}-01`) - 1;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1)];
  const title = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  return (
    <div>
      <p className="mb-3 font-heading text-xl font-medium">{title}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs" role="grid" aria-label={title}>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <span key={d} className="py-1 font-semibold text-muted" role="columnheader">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const iso = `${ym}-${pad(d)}`, mark = marks[iso];
          return <span key={iso} role="gridcell" aria-label={mark ? `${iso}, ${mark}` : iso}
            className={`flex aspect-square items-center justify-center rounded-xl text-sm ${mark ? markCls[mark] : iso < today ? "text-muted/40" : ""} ${iso === today ? "outline outline-2 outline-ink-deep/60" : ""}`}>{d}</span>;
        })}
      </div>
    </div>
  );
}

/** Two month view. Highlights regular cleaning days and the customer's requests. */
export function MonthGrid({ months, marks, today }: { months: string[]; marks: Record<ISODate, Mark>; today: ISODate }) {
  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-2">{months.map(m => <Month key={m} ym={m} marks={marks} today={today} />)}</div>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        <li className="flex items-center gap-2"><span className={`h-4 w-4 rounded ${markCls.regular}`} />Regular cleaning</li>
        <li className="flex items-center gap-2"><span className={`h-4 w-4 rounded ${markCls.requested}`} />Requested</li>
        <li className="flex items-center gap-2"><span className={`h-4 w-4 rounded ${markCls.confirmed}`} />Confirmed</li>
      </ul>
    </div>
  );
}
