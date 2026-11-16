import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Card } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
import { candidatesFor, closeness } from "@/lib/matching";
import { assignCleaner, removeAssignment } from "../../actions";
import { AdminRequestCard, MembershipPanel, REQUEST_JOINS, REQUEST_SELECT, type AdminRequest } from "@/components/admin-requests";
import { loadCustomerData } from "@/lib/customer";
import { FREQUENCIES, WEEKDAYS, formatHours } from "@/lib/scheduling";

export const metadata = { title: "Assign a cleaner", robots: { index: false } };
export const dynamic = "force-dynamic";

const addr = (a: { street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null }) =>
  [a.street && `${a.street} ${a.house_number ?? ""}${a.house_number_addition ? " " + a.house_number_addition : ""}`.trim(), [a.postcode, a.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

const tone = { best: "bg-green-100 text-green-800", near: "bg-primary/15 text-primary-deep", far: "bg-surface text-muted border border-line", unknown: "bg-amber-100 text-amber-800" } as const;

export default async function AssignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;
  const { id } = await params; const { msg } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const customer = (await pool.query("select * from public.customer_waitlist where id = $1", [id])).rows[0];
  if (!customer) notFound();
  const asg = (await pool.query(
    `select a.*, r.full_name as regular_name, r.phone as regular_phone, r.area as regular_area, b.full_name as backup_name, b.phone as backup_phone, b.area as backup_area
       from public.customer_assignments a join public.cleaner_applications r on r.id = a.regular_cleaner_id left join public.cleaner_applications b on b.id = a.backup_cleaner_id
      where a.waitlist_id = $1`, [id])).rows[0];
  const candidates = await candidatesFor(customer.postcode);
  const { membership, schedule } = await loadCustomerData(id);
  const requests: AdminRequest[] = (await pool.query(`select ${REQUEST_SELECT} ${REQUEST_JOINS} where r.waitlist_id = $1 order by r.requested_date desc, r.start_time desc`, [id])).rows;

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin?tab=waitlist" className="text-sm font-semibold text-primary-dark underline">← Back to the customer waitlist</Link>
        <SignOutButton to="/admin/sign-in" />
      </div>
      <h1 className="mb-1 text-3xl font-bold">Assign a cleaner</h1>
      <p className="mb-6 text-muted">Choose a cleaner for {customer.name}&apos;s home. Only approved cleaners are listed, the closest postcode area first.</p>
      {msg && <p role="status" className="mb-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{msg}</p>}

      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <Card hover={false}>
          <h2 className="mb-2 text-lg font-bold">Customer</h2>
          <p className="font-semibold">{customer.name}</p>
          <p className="text-sm">{addr(customer) || "No address on file"}</p>
          <p className="mt-2 text-sm"><a className="text-primary-dark underline" href={`mailto:${customer.email}`}>{customer.email}</a>{customer.phone && <> · <a className="text-primary-dark underline" href={`tel:${customer.phone}`}>{customer.phone}</a></>}</p>
        </Card>
        <Card hover={false}>
          <h2 className="mb-2 text-lg font-bold">Current assignment</h2>
          {!asg ? <p className="text-sm text-muted">No cleaner assigned yet.</p> : (
            <div className="grid gap-3 text-sm">
              <p><b>Regular:</b> {asg.regular_name} <span className="text-muted">({asg.regular_area})</span> · <a className="text-primary-dark underline" href={`tel:${asg.regular_phone}`}>{asg.regular_phone}</a></p>
              <p><b>Backup:</b> {asg.backup_name ? <>{asg.backup_name} <span className="text-muted">({asg.backup_area})</span> · <a className="text-primary-dark underline" href={`tel:${asg.backup_phone}`}>{asg.backup_phone}</a></> : <span className="text-muted">none yet</span>}</p>
              <div className="flex flex-wrap gap-2">
                {asg.backup_name && <form action={removeAssignment}><input type="hidden" name="waitlistId" value={id} /><input type="hidden" name="what" value="backup" /><button className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-primary">Remove backup</button></form>}
                <form action={removeAssignment}><input type="hidden" name="waitlistId" value={id} /><input type="hidden" name="what" value="all" /><button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50">Remove assignment</button></form>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <MembershipPanel customerId={id} status={membership.status} startedOn={membership.started_on} nextBilling={membership.next_billing_date} returnTo={`/admin/customers/${id}`} />
        <Card hover={false}><h2 className="mb-2 text-lg font-bold">Regular schedule</h2>
          {schedule ? <p className="text-sm">{FREQUENCIES[schedule.frequency]} on <b>{WEEKDAYS[schedule.weekday - 1]}s</b> at <b>{schedule.start_time}</b>, {formatHours(schedule.hours)}.</p> : <p className="text-sm text-muted">No regular schedule set.</p>}
        </Card>
      </div>
      <h2 className="mb-3 text-2xl font-bold">Cleaning requests ({requests.length})</h2>
      {requests.length === 0 ? <p className="mb-8 text-muted">This customer has not made a cleaning request yet.</p> : <div className="mb-10 grid gap-4">{requests.map(r => <AdminRequestCard key={r.id} r={r} returnTo={`/admin/customers/${id}`} showCustomer={false} />)}</div>}

      <h2 className="mb-3 text-2xl font-bold">Approved cleaners ({candidates.length})</h2>
      {candidates.length === 0 && <p className="text-muted">No approved cleaners yet. Approve an application first (set its status to Approved in <Link className="text-primary-dark underline" href="/admin">Cleaner applications</Link>).</p>}
      <div className="grid gap-4">
        {candidates.map(c => {
          const near = closeness(c.distance); const isRegular = asg?.regular_cleaner_id === c.id, isBackup = asg?.backup_cleaner_id === c.id;
          return (
            <Card key={c.id} hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h3 className="text-xl font-bold">{c.full_name}</h3><p className="text-sm text-muted">{addr(c) || "No address on file"} · works in {c.area}</p></div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className={`rounded-full px-3 py-1 ${tone[near.tone]}`}>{near.label}</span>
                  <span className="rounded-full border border-line px-3 py-1">{c.customers} customer{c.customers === 1 ? "" : "s"}</span>
                  {isRegular && <span className="rounded-full bg-primary px-3 py-1 text-ink">Regular here</span>}
                  {isBackup && <span className="rounded-full bg-primary px-3 py-1 text-ink">Backup here</span>}
                </div>
              </div>
              {c.availability && <p className="mt-2 text-sm"><b>Availability:</b> {c.availability}</p>}
              {c.experience && <p className="mt-1 text-sm"><b>Experience:</b> {c.experience}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {(["regular", "backup"] as const).map(role => (
                  <form key={role} action={assignCleaner}>
                    <input type="hidden" name="waitlistId" value={id} /><input type="hidden" name="cleanerId" value={c.id} /><input type="hidden" name="role" value={role} />
                    <button disabled={role === "regular" ? isRegular : isBackup || !asg} className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40 ${role === "regular" ? "bg-primary text-ink hover:bg-mint" : "border border-line bg-white hover:border-primary"}`}>
                      {role === "regular" ? "Assign as regular cleaner" : "Assign as backup"}
                    </button>
                  </form>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </Container></main>
  );
}
