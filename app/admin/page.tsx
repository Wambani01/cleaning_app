import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { requirePortal } from "@/lib/admin";
import { WrongPortal } from "@/components/wrong-portal";
import { pool } from "@/lib/db";
import { STATUSES } from "@/lib/statuses";
import { updateApplication, processDue } from "./actions";
import { euro } from "@/lib/fake-payments";
import { AdminRequestCard, REQUEST_JOINS, REQUEST_SELECT, memTone, type AdminRequest } from "@/components/admin-requests";
import { membershipLabel, requestLabel, type MembershipStatus } from "@/lib/customer";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type Application = {
  id: string; created_at: Date; full_name: string; email: string; phone: string; area: string;
  availability: string | null; experience: string | null; status: string; notes: string | null;
  street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null;
};
type Waiter = { id: string; created_at: Date; name: string; email: string; phone: string | null; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null; regular_name: string | null; backup_name: string | null; membership_status: MembershipStatus | null };

const label = (s: string) => s.replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
const fmt = (d: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(d);

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; rstatus?: string; msg?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;

  const { tab = "applications", status = "all", rstatus = "open", msg } = await searchParams;
  const counts = Object.fromEntries((await pool.query("select status, count(*)::int as n from public.cleaner_applications group by status")).rows.map(r => [r.status, r.n]));
  const total = Object.values(counts).reduce((a: number, b) => a + (b as number), 0);
  const waitCount = (await pool.query("select count(*)::int as n from public.customer_waitlist")).rows[0].n as number;

  const reqCounts = Object.fromEntries((await pool.query("select status, count(*)::int as n from public.cleaning_requests group by status")).rows.map(r => [r.status, r.n]));
  const openRequests = (reqCounts["requested"] ?? 0) + (reqCounts["awaiting_payment"] ?? 0) + (reqCounts["confirmed"] ?? 0);
  const requests: AdminRequest[] = tab === "requests"
    ? (await pool.query(
        `select ${REQUEST_SELECT} ${REQUEST_JOINS}
          where ${rstatus === "all" ? "true" : rstatus === "open" ? "r.status in ('requested','awaiting_payment','confirmed')" : rstatus === "cleaner_pending" ? "r.cleaner_response = 'pending' and r.status in ('requested','confirmed')" : rstatus === "cleaner_declined" ? "r.cleaner_response = 'declined' and r.status in ('requested','confirmed')" : rstatus === "no_cleaner" ? "r.cleaner_id is null and r.status in ('requested','awaiting_payment','confirmed')" : "r.status = $1"}
          order by ${rstatus === "open" ? "r.requested_date asc, r.start_time asc" : "r.requested_date desc, r.start_time desc"} limit 300`,
        ["open", "all", "cleaner_pending", "cleaner_declined", "no_cleaner"].includes(rstatus) ? [] : [rstatus])).rows
    : [];
  const apps: Application[] = tab === "applications"
    ? (await pool.query(
        status !== "all" && (STATUSES as readonly string[]).includes(status)
          ? { text: "select * from public.cleaner_applications where status = $1 order by created_at desc limit 200", values: [status] }
          : { text: "select * from public.cleaner_applications order by created_at desc limit 200" })).rows
    : [];
  const waiters: Waiter[] = tab === "waitlist"
    ? (await pool.query(`select w.id, w.created_at, w.name, w.email, w.phone, w.street, w.house_number, w.house_number_addition, w.postcode, w.city,
              r.full_name as regular_name, b.full_name as backup_name, m.status as membership_status
         from public.customer_waitlist w
         left join public.customer_memberships m on m.waitlist_id = w.id
         left join public.customer_assignments a on a.waitlist_id = w.id
         left join public.cleaner_applications r on r.id = a.regular_cleaner_id
         left join public.cleaner_applications b on b.id = a.backup_cleaner_id
        order by (a.id is null) desc, w.created_at desc limit 500`)).rows
    : [];

  const tabCls = (on: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-primary-deep text-white" : "bg-white border border-line hover:border-primary"}`;

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{session.user.email}</span><SignOutButton to="/admin/sign-in" /></div>
      </div>

      <NeedsAttention />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover={false}><p className="text-sm text-muted">Applications</p><p className="text-3xl font-bold">{total}</p></Card>
        <Card hover={false}><p className="text-sm text-muted">New, not yet contacted</p><p className="text-3xl font-bold">{counts["new"] ?? 0}</p></Card>
        <Card hover={false}><p className="text-sm text-muted">Customers</p><p className="text-3xl font-bold">{waitCount}</p></Card>
        <Card hover={false}><p className="text-sm text-muted">Open cleaning requests</p><p className="text-3xl font-bold">{openRequests}</p></Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin?tab=applications" className={tabCls(tab === "applications")}>Cleaner applications</Link>
        <Link href="/admin?tab=requests" className={tabCls(tab === "requests")}>Cleaning requests ({openRequests})</Link>
        <Link href="/admin?tab=waitlist" className={tabCls(tab === "waitlist")}>Customers</Link>
        <Link href="/admin?tab=payments" className={tabCls(tab === "payments")}>Payments</Link>
      </div>

      {msg && <p role="status" className="mb-4 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{msg}</p>}

      {tab === "requests" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {["open", "cleaner_pending", "cleaner_declined", "no_cleaner", "awaiting_payment", "requested", "confirmed", "completed", "cancelled", "all"].map(s => (
              <Link key={s} href={`/admin?tab=requests&rstatus=${s}`} className={`rounded-md px-3 py-1 ${rstatus === s ? "bg-primary text-ink font-semibold" : "bg-white border border-line"}`}>
                {s === "open" ? "Open" : s === "all" ? "All" : s === "cleaner_pending" ? "Waiting for cleaner" : s === "cleaner_declined" ? "Cleaner declined" : s === "no_cleaner" ? "No cleaner yet" : requestLabel[s as keyof typeof requestLabel]}{!["open", "all", "cleaner_pending", "cleaner_declined", "no_cleaner"].includes(s) ? ` (${reqCounts[s] ?? 0})` : ""}
              </Link>
            ))}
          </div>
          {requests.length === 0 && <p className="text-muted">No cleaning requests here yet.</p>}
          <div className="grid gap-4">{requests.map(r => <AdminRequestCard key={r.id} r={r} returnTo={`/admin?tab=requests&rstatus=${rstatus}`} />)}</div>
        </>
      )}

      {tab === "applications" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {["all", ...STATUSES].map(s => (
              <Link key={s} href={`/admin?tab=applications&status=${s}`} className={`rounded-md px-3 py-1 ${status === s ? "bg-primary text-ink font-semibold" : "bg-white border border-line"}`}>
                {label(s)}{s !== "all" ? ` (${counts[s] ?? 0})` : ""}
              </Link>
            ))}
          </div>
          {apps.length === 0 && <p className="text-muted">No applications here yet.</p>}
          <div className="grid gap-4">
            {apps.map(a => (
              <Card key={a.id} hover={false}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h2 className="text-xl font-bold">{a.full_name}</h2><p className="text-sm text-muted">{fmt(a.created_at)} · {a.area}</p></div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary-deep">{label(a.status)}</span>
                </div>
                <p className="mt-2 text-sm"><a className="text-primary-dark underline" href={`mailto:${a.email}`}>{a.email}</a> · <a className="text-primary-dark underline" href={`tel:${a.phone}`}>{a.phone}</a></p>
                {a.street && <p className="mt-2 text-sm"><b>Address:</b> {`${a.street} ${a.house_number ?? ""}${a.house_number_addition ? " " + a.house_number_addition : ""}`.trim()}, {[a.postcode, a.city].filter(Boolean).join(" ")}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/cleaners/${a.id}/view`} className="rounded-full bg-ink-deep px-4 py-1.5 text-sm font-bold text-white hover:bg-primary-deep">View cleaner dashboard</Link>
                  <a href={`tel:${a.phone}`} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:border-primary">Call cleaner</a>
                </div>
                {a.availability && <p className="mt-2 text-sm"><b>Availability:</b> {a.availability}</p>}
                {a.experience && <p className="mt-1 text-sm"><b>Experience:</b> {a.experience}</p>}
                <form action={updateApplication} className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-start">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="status" defaultValue={a.status} className="rounded-lg border border-line bg-white px-3 py-2">
                    {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                  <textarea name="notes" defaultValue={a.notes ?? ""} rows={2} placeholder="Internal notes" className="rounded-lg border border-line bg-white px-3 py-2" />
                  <button className="rounded-lg bg-primary px-4 py-2 font-bold text-ink hover:bg-mint">Save</button>
                </form>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "payments" && <AdminPayments />}

      {tab === "waitlist" && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted"><tr><th className="p-3">Date</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Address</th><th className="p-3">Membership</th><th className="p-3">Cleaner</th></tr></thead>
            <tbody>
              {waiters.length === 0 && <tr><td className="p-3 text-muted" colSpan={7}>Nobody on the waitlist yet.</td></tr>}
              {waiters.map(w => (
                <tr key={w.id} className="border-t border-line"><td className="p-3 whitespace-nowrap">{fmt(w.created_at)}</td><td className="p-3">{w.name}</td>
                  <td className="p-3"><a className="text-primary-dark underline" href={`mailto:${w.email}`}>{w.email}</a></td><td className="p-3 whitespace-nowrap">{w.phone ? <a className="text-primary-dark underline" href={`tel:${w.phone}`}>{w.phone}</a> : ""}</td>
                  <td className="p-3">{[w.street && `${w.street} ${w.house_number ?? ""}${w.house_number_addition ? " " + w.house_number_addition : ""}`.trim(), [w.postcode, w.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</td>
                  <td className="p-3 whitespace-nowrap"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${memTone[w.membership_status ?? "free"]}`}>{membershipLabel[w.membership_status ?? "free"]}</span></td>
                  <td className="p-3 whitespace-nowrap">
                    {w.regular_name ? <span className="block">{w.regular_name}{w.backup_name ? <span className="text-muted"> + {w.backup_name}</span> : <span className="text-amber-700"> (no backup)</span>}</span> : <span className="block text-amber-700">Not assigned</span>}
                    <Link className="font-semibold text-primary-dark underline" href={`/admin/customers/${w.id}`}>{w.regular_name ? "Change" : "Assign a cleaner"}</Link>
                  </td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container></main>
  );
}

async function AdminPayments() {
  const tot = (await pool.query("select coalesce(sum(amount_cents) filter (where status='succeeded'),0)::int as paid, coalesce(sum(amount_cents) filter (where status='due'),0)::int as due, count(*) filter (where status='failed')::int as failed from public.payments")).rows[0];
  const rows = (await pool.query("select p.id, p.kind, p.description, p.amount_cents, p.status, p.provider, p.card_last4, p.failure_reason, p.receipt_no, p.created_at, w.name, w.id as wid from public.payments p join public.customer_waitlist w on w.id = p.waitlist_id order by p.created_at desc limit 100")).rows;
  return (
    <div className="grid gap-5">
      <p role="note" className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm"><b>TEST MODE.</b> Payments use a fake provider. No real money moves. Stripe replaces it later.</p>
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">Collected <b>{euro(tot.paid)}</b></span>
        <span className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">Due <b>{euro(tot.due)}</b></span>
        <span className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">Failed attempts <b>{tot.failed}</b></span>
        <form action={processDue}><button className="rounded-full bg-primary-deep px-5 py-2.5 text-sm font-bold text-white">Process due payments (test)</button></form>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted"><tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">For</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Receipt</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td className="p-3 text-muted" colSpan={6}>No payments yet.</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="border-t border-line"><td className="p-3 whitespace-nowrap">{fmt(r.created_at)}</td>
                <td className="p-3"><Link className="text-primary-dark underline" href={`/admin/customers/${r.wid}/view/pay`}>{r.name}</Link></td><td className="p-3">{r.description}</td>
                <td className="p-3 whitespace-nowrap">{euro(r.amount_cents)}</td>
                <td className="p-3">{r.status === "succeeded" ? `Paid${r.provider === "manual" ? " (manual)" : r.card_last4 ? ` ****${r.card_last4}` : ""}` : r.status === "failed" ? `Failed: ${r.failure_reason}` : "Due"}</td>
                <td className="p-3 whitespace-nowrap">{r.receipt_no ?? ""}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The things an admin has to act on, each with a link to the right filtered list. */
async function NeedsAttention() {
  const n = (await pool.query(`select
      (select count(*) from public.cleaning_requests where status = 'awaiting_payment' and requested_date >= current_date)::int as unpaid,
      (select count(*) from public.cleaning_requests where cleaner_id is null and status in ('requested','awaiting_payment','confirmed') and requested_date >= current_date)::int as no_cleaner,
      (select count(*) from public.cleaning_requests where cleaner_response = 'declined' and status in ('requested','confirmed') and requested_date >= current_date)::int as declined,
      (select count(*) from public.cleaning_requests where cleaner_response = 'pending' and status in ('requested','confirmed') and requested_date >= current_date)::int as unanswered,
      (select count(*) from public.customer_memberships where status = 'past_due')::int as past_due,
      (select count(*) from public.payments where status = 'failed' and created_at > now() - interval '14 days')::int as failed,
      (select count(*) from public.cleaner_applications where status = 'new')::int as new_apps`)).rows[0];
  const items = [
    { n: n.no_cleaner, text: "requests with no cleaner", action: "Assign a cleaner", href: "/admin?tab=requests&rstatus=no_cleaner" },
    { n: n.declined, text: "requests the cleaner declined", action: "Reassign", href: "/admin?tab=requests&rstatus=cleaner_declined" },
    { n: n.unanswered, text: "requests waiting for the cleaner to answer", action: "Call the cleaner", href: "/admin?tab=requests&rstatus=cleaner_pending" },
    { n: n.unpaid, text: "requests waiting for the first payment", action: "See who has not paid", href: "/admin?tab=requests&rstatus=awaiting_payment" },
    { n: n.past_due, text: "overdue memberships", action: "Open customers", href: "/admin?tab=waitlist" },
    { n: n.failed, text: "failed payments in the last 14 days", action: "Open payments", href: "/admin?tab=payments" },
    { n: n.new_apps, text: "new cleaner applications", action: "Review", href: "/admin?tab=applications&status=new" },
  ].filter(i => i.n > 0);
  return (
    <section aria-label="Needs attention" className="mb-6 rounded-3xl border border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">Needs attention</h2>
      {items.length === 0 ? <p className="text-sm text-muted">All clear. Nothing is waiting for you.</p> : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map(i => <li key={i.text} className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-2.5 text-sm"><span><b>{i.n}</b> {i.text}</span><Link href={i.href} className="font-semibold text-primary-dark underline underline-offset-4">{i.action}</Link></li>)}
        </ul>
      )}
    </section>
  );
}
