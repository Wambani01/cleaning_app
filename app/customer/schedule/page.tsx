import { Card } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { ScheduleForm } from "@/components/customer-forms";
import { MonthGrid, type Mark } from "@/components/month-grid";
import { WrongPortal } from "@/components/wrong-portal";
import { removeSchedule } from "../actions";
import { requirePortal } from "@/lib/admin";
import { loadCustomerByEmail } from "@/lib/customer";
import { RULES, WEEKDAYS, addDays, formatDate, formatHours, occurrences, todayAmsterdam, type ISODate } from "@/lib/scheduling";
export const metadata = { title: "Regular schedule", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  const today = todayAmsterdam(), s = c?.schedule ?? null;
  const [y, m] = [Number(today.slice(0, 4)), Number(today.slice(5, 7))];
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const months = [today.slice(0, 7), next];

  const marks: Record<ISODate, Mark> = {};
  const upcoming = s ? occurrences(s, addDays(today, RULES.minLeadDays), 60) : [];
  for (const d of upcoming) marks[d] = "regular";
  for (const r of c?.requests ?? []) if (r.status === "requested" || r.status === "awaiting_payment") marks[r.requested_date] = "requested"; else if (r.status === "confirmed") marks[r.requested_date] = "confirmed";

  return (
    <CustomerShell name={session.user.name} email={session.user.email} current="/customer/schedule">
      {!c ? <Card hover={false}><p>We need your address first. <a className="font-semibold text-primary-dark underline" href="/join">Add my details</a></p></Card> : (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card hover={false} className="!p-8">
            <h2 className="mb-1 text-2xl font-medium">Your regular cleaning</h2>
            <p className="mb-6 text-sm text-muted">Choose the day and time that suit you. Your regular days show in the calendar, and you can request a cleaning on any of them whenever you need your cleaner.</p>
            <ScheduleForm initial={s ? { frequency: s.frequency, weekday: s.weekday, time: s.start_time, hours: s.hours } : null} today={today} />
            {s && <form action={removeSchedule} className="mt-4"><button className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-red-800">Remove my regular schedule</button></form>}
          </Card>
          <div className="grid content-start gap-6">
            <Card hover={false}><MonthGrid months={months} marks={marks} today={today} /></Card>
            {s && <Card hover={false}><h3 className="mb-3 font-semibold">Next regular cleaning days</h3><ul className="grid gap-1.5 text-sm">{upcoming.slice(0, 6).map(d => <li key={d} className="flex justify-between"><span>{formatDate(d, { weekday: "long", day: "numeric", month: "long" })}</span><span className="text-muted">{s.start_time} · {formatHours(s.hours)}</span></li>)}</ul><p className="mt-3 text-xs text-muted">{WEEKDAYS[s.weekday - 1]}s. A regular day is not booked until you make a request for it.</p></Card>}
          </div>
        </div>
      )}
    </CustomerShell>
  );
}
