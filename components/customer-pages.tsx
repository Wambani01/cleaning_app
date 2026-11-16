import Link from "next/link";
import { CalendarDays, Info, PlusCircle, Users, Wallet } from "lucide-react";
import { ButtonLink, Card, hourlyRate, price } from "@/components/ui";
import { RequestForm } from "@/components/request-form";
import { ScheduleForm } from "@/components/customer-forms";
import { MonthGrid, type Mark } from "@/components/month-grid";
import { RequestList } from "@/components/request-list";
import { removeSchedule } from "@/app/customer/actions";
import { pool } from "@/lib/db";
import { membershipLabel, type LoadedCustomer } from "@/lib/customer";
import { BILLING_PERIOD_DAYS, FREQUENCIES, RULES, WEEKDAYS, addDays, formatDate, formatHours, occurrences, type ISODate } from "@/lib/scheduling";

type Props = { c: LoadedCustomer; today: ISODate; base: string; adminId?: string };
const long = { day: "numeric", month: "long", year: "numeric" } as const;
const first = (n: string | null) => (n ?? "").split(" ")[0];

/** The customer's overview. Shown to the customer, and to an admin looking at it for them. */
export async function OverviewBody({ c, today, base, adminId }: Props) {
  const asg = (await pool.query(
    `select r.full_name as regular_name, b.full_name as backup_name from public.customer_assignments a
       join public.cleaner_applications r on r.id = a.regular_cleaner_id left join public.cleaner_applications b on b.id = a.backup_cleaner_id where a.waitlist_id = $1`, [c.row.id])).rows[0] as { regular_name: string; backup_name: string | null } | undefined;
  const m = c.membership, s = c.schedule;
  const upcoming = c.requests.filter(r => r.requested_date >= today && r.status !== "cancelled" && r.status !== "completed").sort((a, b) => (a.requested_date + a.start_time).localeCompare(b.requested_date + b.start_time));
  const past = c.requests.filter(r => !upcoming.includes(r));
  const due = m.status === "active" && m.next_billing_date !== null && m.next_billing_date <= today;
  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <Card icon={Wallet} hover={false}>
          <h2 className="mb-1 font-bold">Membership</h2>
          <p className="mb-2 text-sm font-semibold text-primary-dark">{membershipLabel[m.status]}</p>
          {m.status === "free" && <p className="text-sm text-muted">The account is free. The {price} membership is paid with the first cleaning request.</p>}
          {m.status === "pending_payment" && <p className="text-sm text-muted">The first payment of {price} is needed to confirm the cleaning. </p>}
          {(m.status === "pending_payment" || m.status === "past_due" || due) && <Link href={`${base}/pay`} className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-ink-deep">Pay {price} now</Link>}
          {m.status === "active" && <p className="text-sm text-muted">The {price} membership renews {BILLING_PERIOD_DAYS} days after each payment. {due ? <b className="text-orange-800">The next payment is due now.</b> : <>Next payment: <b>{m.next_billing_date ? formatDate(m.next_billing_date, long) : "-"}</b>.</>} Cleaning is {hourlyRate} per hour.</p>}
          {(m.status === "past_due" || m.status === "cancelled") && <p className="text-sm text-muted">{m.status === "past_due" ? "The last membership payment is overdue." : "The membership has ended. A new request starts it again."}</p>}
        </Card>
        <Card icon={Users} hover={false}>
          <h2 className="mb-1 font-bold">Cleaner</h2>
          {asg ? <div className="text-sm"><p><b>Regular cleaner:</b> {first(asg.regular_name)}</p><p><b>Backup cleaner:</b> {asg.backup_name ? first(asg.backup_name) : "we are still arranging this"}</p><p className="mt-2 text-muted">A short orientation call comes before the first visit.</p></div>
            : <p className="text-sm text-muted">We match a regular cleaner and a backup near the home once the first request is made.</p>}
        </Card>
        <Card icon={CalendarDays} hover={false}>
          <h2 className="mb-1 font-bold">Regular schedule</h2>
          {s ? <p className="text-sm">{FREQUENCIES[s.frequency]} on <b>{WEEKDAYS[s.weekday - 1]}s</b> at <b>{s.start_time}</b>, {formatHours(s.hours)}.</p>
            : <p className="text-sm text-muted">Set the regular cleaning days in a calendar, then request a cleaning whenever one is needed.</p>}
          <Link href={`${base}/schedule`} className="mt-3 inline-block text-sm font-semibold text-primary-dark underline underline-offset-4">{s ? "Change schedule" : "Set the regular schedule"}</Link>
        </Card>
      </div>

      <div className="mb-3 mt-10 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-medium">Upcoming cleaning requests</h2><ButtonLink href={`${base}/request`}>Request a cleaning</ButtonLink></div>
      <RequestList requests={upcoming} adminId={adminId} empty="No cleaning requests yet. Request the first cleaning to get started." />
      {past.length > 0 && <><h2 className="mb-3 mt-10 text-2xl font-medium">Earlier requests</h2><RequestList requests={past} adminId={adminId} empty="" /></>}
    </>
  );
}

export function RequestBody({ c, today, base, adminId }: Props) {
  const min = addDays(today, RULES.minLeadDays), max = addDays(today, RULES.maxAheadDays);
  const quick = c.schedule ? occurrences(c.schedule, min, 4).map(date => ({ date, time: c.schedule!.start_time, hours: c.schedule!.hours })) : [];
  const open = c.requests.filter(r => ["requested", "awaiting_payment", "confirmed"].includes(r.status) && r.requested_date >= today).sort((a, b) => a.requested_date.localeCompare(b.requested_date));
  const defaults = { street: c.row.street ?? "", houseNumber: c.row.house_number ?? "", houseNumberAddition: c.row.house_number_addition ?? "", postcode: c.row.postcode ?? "", city: c.row.city ?? "Amsterdam" };
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <h2 className="mb-1 text-3xl font-medium">Request a cleaning</h2>
          <p className="mb-6 text-muted">Tell us about the cleaning. It takes about two minutes, and it works for the first cleaning and every one after.</p>
          <RequestForm defaults={defaults} quick={quick} today={today} min={min} max={max} adminCustomerId={adminId} />
        </div>
        <div className="grid content-start gap-5 lg:sticky lg:top-24">
          <Card hover={false}>
            <h3 className="mb-2 flex items-center gap-2 font-semibold"><Info size={18} className="text-primary-dark" aria-hidden="true" />How payment works</h3>
            <ul className="grid gap-2 text-sm leading-relaxed text-muted">
              <li>The account is free. Nothing is paid until a cleaning request is made.</li>
              <li>With the first request, the {price} membership is paid. It renews {BILLING_PERIOD_DAYS} days after each payment.</li>
              <li>Cleaning is {hourlyRate} per hour.</li>
              {c.membership.status !== "active" && <li className="font-medium text-ink">Payment runs in test mode for now. After the first request, pay on the <Link className="underline" href={`${base}/pay`}>Payments</Link> page with a test card.</li>}
            </ul>
          </Card>
          {!c.schedule && <Card hover={false}><p className="text-sm text-muted">Want the same slot every week? <Link className="font-semibold text-primary-dark underline" href={`${base}/schedule`}>Set the regular schedule</Link> and its dates appear above as shortcuts.</p></Card>}
        </div>
      </div>
      <h2 className="mb-3 mt-12 text-2xl font-medium">Open requests</h2>
      <RequestList requests={open} adminId={adminId} empty="There are no open requests." />
    </>
  );
}

export function ScheduleBody({ c, today, adminId }: Props) {
  const s = c.schedule;
  const [y, m] = [Number(today.slice(0, 4)), Number(today.slice(5, 7))];
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const months = [today.slice(0, 7), next];
  const marks: Record<ISODate, Mark> = {};
  const upcoming = s ? occurrences(s, addDays(today, RULES.minLeadDays), 60) : [];
  for (const d of upcoming) marks[d] = "regular";
  for (const r of c.requests) { if (r.status === "requested" || r.status === "awaiting_payment") marks[r.requested_date] = "requested"; else if (r.status === "confirmed") marks[r.requested_date] = "confirmed"; }
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Card hover={false} className="!p-8">
        <h2 className="mb-1 text-2xl font-medium">Regular cleaning</h2>
        <p className="mb-6 text-sm text-muted">Choose the day and time that suit. The regular days show in the calendar, and a cleaning can be requested on any of them whenever it is needed.</p>
        <ScheduleForm initial={s ? { frequency: s.frequency, weekday: s.weekday, time: s.start_time, hours: s.hours } : null} today={today} adminCustomerId={adminId} />
        {s && <form action={removeSchedule} className="mt-4">{adminId && <input type="hidden" name="waitlistId" value={adminId} />}<button className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-red-800">Remove the regular schedule</button></form>}
      </Card>
      <div className="grid content-start gap-6">
        <Card hover={false}><MonthGrid months={months} marks={marks} today={today} /></Card>
        {s && <Card hover={false}><h3 className="mb-3 font-semibold">Next regular cleaning days</h3><ul className="grid gap-1.5 text-sm">{upcoming.slice(0, 6).map(d => <li key={d} className="flex justify-between"><span>{formatDate(d, { weekday: "long", day: "numeric", month: "long" })}</span><span className="text-muted">{s.start_time} · {formatHours(s.hours)}</span></li>)}</ul><p className="mt-3 text-xs text-muted">{WEEKDAYS[s.weekday - 1]}s. A regular day is not booked until a request is made for it.</p></Card>}
      </div>
    </div>
  );
}
