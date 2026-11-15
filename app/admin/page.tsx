import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { requirePortal } from "@/lib/admin";
import { WrongPortal } from "@/components/wrong-portal";
import { pool } from "@/lib/db";
import { STATUSES } from "@/lib/statuses";
import { updateApplication } from "./actions";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type Application = {
  id: string; created_at: Date; full_name: string; email: string; phone: string; area: string;
  availability: string | null; experience: string | null; status: string; notes: string | null;
};
type Waiter = { id: string; created_at: Date; name: string; email: string; postcode: string | null };

const label = (s: string) => s.replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
const fmt = (d: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(d);

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;

  const { tab = "applications", status = "all" } = await searchParams;
  const counts = Object.fromEntries((await pool.query("select status, count(*)::int as n from public.cleaner_applications group by status")).rows.map(r => [r.status, r.n]));
  const total = Object.values(counts).reduce((a: number, b) => a + (b as number), 0);
  const waitCount = (await pool.query("select count(*)::int as n from public.customer_waitlist")).rows[0].n as number;

  const apps: Application[] = tab === "applications"
    ? (await pool.query(
        status !== "all" && (STATUSES as readonly string[]).includes(status)
          ? { text: "select * from public.cleaner_applications where status = $1 order by created_at desc limit 200", values: [status] }
          : { text: "select * from public.cleaner_applications order by created_at desc limit 200" })).rows
    : [];
  const waiters: Waiter[] = tab === "waitlist"
    ? (await pool.query("select id, created_at, name, email, postcode from public.customer_waitlist order by created_at desc limit 500")).rows
    : [];

  const tabCls = (on: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-primary-deep text-white" : "bg-white border border-line hover:border-primary"}`;

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{session.user.email}</span><SignOutButton to="/admin/sign-in" /></div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card hover={false}><p className="text-sm text-muted">Applications</p><p className="text-3xl font-bold">{total}</p></Card>
        <Card hover={false}><p className="text-sm text-muted">New, not yet contacted</p><p className="text-3xl font-bold">{counts["new"] ?? 0}</p></Card>
        <Card hover={false}><p className="text-sm text-muted">Customer waitlist</p><p className="text-3xl font-bold">{waitCount}</p></Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin?tab=applications" className={tabCls(tab === "applications")}>Cleaner applications</Link>
        <Link href="/admin?tab=waitlist" className={tabCls(tab === "waitlist")}>Customer waitlist</Link>
      </div>

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

      {tab === "waitlist" && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted"><tr><th className="p-3">Date</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Postcode</th></tr></thead>
            <tbody>
              {waiters.length === 0 && <tr><td className="p-3 text-muted" colSpan={4}>Nobody on the waitlist yet.</td></tr>}
              {waiters.map(w => (
                <tr key={w.id} className="border-t border-line"><td className="p-3 whitespace-nowrap">{fmt(w.created_at)}</td><td className="p-3">{w.name}</td>
                  <td className="p-3"><a className="text-primary-dark underline" href={`mailto:${w.email}`}>{w.email}</a></td><td className="p-3">{w.postcode ?? ""}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container></main>
  );
}
