import Link from "next/link";
import { CalendarDays, Users, Wallet } from "lucide-react";
import { ButtonLink, Card, hourlyRate, price } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { RequestList } from "@/components/request-list";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
import { loadCustomerByEmail, membershipLabel } from "@/lib/customer";
import { FREQUENCIES, WEEKDAYS, formatDate, formatHours, todayAmsterdam } from "@/lib/scheduling";
export const metadata = { title: "My cleaning", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  const shell = (children: React.ReactNode) => <CustomerShell name={session.user.name} email={session.user.email} current="/customer">{children}</CustomerShell>;
  if (!c) return shell(<Card hover={false}><h2 className="mb-2 text-xl font-medium">We need your address</h2><p className="mb-4 text-muted">Your account is free, but we need your address and phone number before you can make a cleaning request.</p><ButtonLink href="/join">Add my details</ButtonLink></Card>);

  const asg = (await pool.query(
    `select r.full_name as regular_name, b.full_name as backup_name from public.customer_assignments a
       join public.cleaner_applications r on r.id = a.regular_cleaner_id left join public.cleaner_applications b on b.id = a.backup_cleaner_id where a.waitlist_id = $1`, [c.row.id])).rows[0] as { regular_name: string; backup_name: string | null } | undefined;
  const first = (n: string | null) => (n ?? "").split(" ")[0];
  const today = todayAmsterdam(), m = c.membership, s = c.schedule;
  const upcoming = c.requests.filter(r => r.requested_date >= today && r.status !== "cancelled" && r.status !== "completed").sort((a, b) => (a.requested_date + a.start_time).localeCompare(b.requested_date + b.start_time));
  const past = c.requests.filter(r => !upcoming.includes(r));

  return shell(
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <Card icon={Wallet} hover={false}>
          <h2 className="mb-1 font-bold">Membership</h2>
          <p className="mb-2 text-sm font-semibold text-primary-dark">{membershipLabel[m.status]}</p>
          {m.status === "free" && <p className="text-sm text-muted">Your account is free. You pay {price} when you make your first cleaning request.</p>}
          {m.status === "pending_payment" && <p className="text-sm text-muted">Your first payment of {price} is needed to confirm your cleaning. Online payment is coming soon, and we will contact you with the details.</p>}
          {m.status === "active" && <p className="text-sm text-muted">Your {price} membership renews on the same day each month. Next payment: <b>{m.next_billing_date ? formatDate(m.next_billing_date, { day: "numeric", month: "long", year: "numeric" }) : "-"}</b>. Cleaning is {hourlyRate} per hour.</p>}
          {(m.status === "past_due" || m.status === "cancelled") && <p className="text-sm text-muted">{m.status === "past_due" ? "Your last membership payment is overdue. Please contact us." : "Your membership has ended. Make a new request to start again."}</p>}
        </Card>
        <Card icon={Users} hover={false}>
          <h2 className="mb-1 font-bold">Your cleaner</h2>
          {asg ? <div className="text-sm"><p><b>Regular cleaner:</b> {first(asg.regular_name)}</p><p><b>Backup cleaner:</b> {asg.backup_name ? first(asg.backup_name) : "we are still arranging this"}</p><p className="mt-2 text-muted">We will contact you for a short orientation call before the first visit.</p></div>
            : <p className="text-sm text-muted">We match you with a regular cleaner and a backup near your home once you have made your first request.</p>}
        </Card>
        <Card icon={CalendarDays} hover={false}>
          <h2 className="mb-1 font-bold">Regular schedule</h2>
          {s ? <p className="text-sm">{FREQUENCIES[s.frequency]} on <b>{WEEKDAYS[s.weekday - 1]}s</b> at <b>{s.start_time}</b>, {formatHours(s.hours)}.</p>
            : <p className="text-sm text-muted">Set your regular cleaning days in a calendar, then request a cleaning whenever you need one.</p>}
          <Link href="/customer/schedule" className="mt-3 inline-block text-sm font-semibold text-primary-dark underline underline-offset-4">{s ? "Change schedule" : "Set my regular schedule"}</Link>
        </Card>
      </div>

      <div className="mb-3 mt-10 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-medium">Upcoming cleaning requests</h2><ButtonLink href="/customer/request">Request a cleaning</ButtonLink></div>
      <RequestList requests={upcoming} empty="No cleaning requests yet. Request your first cleaning to get started." />
      {past.length > 0 && <><h2 className="mb-3 mt-10 text-2xl font-medium">Earlier requests</h2><RequestList requests={past} empty="" /></>}
    </>,
  );
}
