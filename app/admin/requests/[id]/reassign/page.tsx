import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { Card, Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { WrongPortal } from "@/components/wrong-portal";
import { respTone } from "@/components/admin-requests";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
import { candidatesFor, closeness } from "@/lib/matching";
import { responseLabel, type CleanerResponse } from "@/lib/customer";
import { summarise } from "@/lib/request-details";
import { formatDate, formatHours } from "@/lib/scheduling";
import { assignRequestCleaner } from "../../../actions";
export const metadata = { title: "Reassign cleaner", robots: { index: false } };
export const dynamic = "force-dynamic";

const tone = { best: "bg-green-100 text-green-800", near: "bg-primary/15 text-primary-deep", far: "bg-surface text-muted border border-line", unknown: "bg-amber-100 text-amber-800" } as const;

export default async function ReassignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;
  const { id } = await params; const { msg } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const r = (await pool.query(
    `select r.id, r.waitlist_id, to_char(r.requested_date,'YYYY-MM-DD') as date, to_char(r.start_time,'HH24:MI') as time, r.hours::float8 as hours, r.status, r.cleaner_id, r.cleaner_response, r.decline_reason,
            r.postcode as r_postcode, r.property_type, r.bedrooms, r.bathrooms, r.windows, r.tasks, w.name, w.postcode as home_postcode, a.backup_cleaner_id, a.regular_cleaner_id
       from public.cleaning_requests r join public.customer_waitlist w on w.id = r.waitlist_id left join public.customer_assignments a on a.waitlist_id = r.waitlist_id where r.id = $1`, [id])).rows[0];
  if (!r) notFound();
  const open = ["requested", "awaiting_payment", "confirmed"].includes(r.status);
  const candidates = await candidatesFor(r.r_postcode ?? r.home_postcode);
  const back = `/admin/requests/${id}/reassign`;

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin?tab=requests" className="text-sm font-semibold text-primary-dark underline">← Back to cleaning requests</Link>
        <SignOutButton to="/admin/sign-in" />
      </div>
      <h1 className="mb-1 text-3xl font-bold">{r.cleaner_id ? "Reassign the cleaner" : "Assign a cleaner"}</h1>
      <p className="mb-6 text-muted">{r.name} · {formatDate(r.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at {r.time}, {formatHours(r.hours)}{r.tasks.length ? ` · ${summarise(r)}` : ""}</p>
      {msg && <p role="status" className="mb-6 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{msg}</p>}
      {!open && <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">This request is {r.status}, so the cleaner can no longer be changed.</p>}
      <p className="mb-6 text-sm text-muted">Approved cleaners, closest postcode area first. The cleaner you choose is asked to accept the request. The customer&apos;s backup cleaner is marked, as a good first choice when the regular cleaner cannot make it.</p>

      <div className="grid gap-4">
        {candidates.length === 0 && <p className="text-muted">There are no approved cleaners yet.</p>}
        {candidates.map(c => {
          const near = closeness(c.distance), current = r.cleaner_id === c.id, isBackup = r.backup_cleaner_id === c.id, isRegular = r.regular_cleaner_id === c.id;
          return (
            <Card key={c.id} hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h2 className="text-xl font-bold">{c.full_name}</h2><p className="text-sm text-muted">Works in {c.area} · <a className="inline-flex items-center gap-1 underline" href={`tel:${c.phone}`}><Phone size={12} aria-hidden="true" />{c.phone}</a></p></div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className={`rounded-full px-3 py-1 ${tone[near.tone]}`}>{near.label}</span>
                  <span className="rounded-full border border-line px-3 py-1">{c.customers} customer{c.customers === 1 ? "" : "s"}</span>
                  {isBackup && <span className="rounded-full bg-primary px-3 py-1 text-ink">Customer&apos;s backup</span>}
                  {isRegular && <span className="rounded-full bg-primary px-3 py-1 text-ink">Customer&apos;s regular</span>}
                  {current && <span className={`rounded-full px-3 py-1 ${respTone[(r.cleaner_response ?? "pending") as CleanerResponse]}`}>Assigned now: {responseLabel[(r.cleaner_response ?? "pending") as CleanerResponse]}</span>}
                </div>
              </div>
              {c.availability && <p className="mt-2 text-sm"><b>Availability:</b> {c.availability}</p>}
              <p className="mt-2 text-sm"><Link className="font-semibold text-primary-dark underline underline-offset-4" href={`/admin/cleaners/${c.id}/view`}>View cleaner dashboard</Link></p>
              {open && !current && (
                <form action={assignRequestCleaner} className="mt-3 flex flex-wrap items-center gap-4">
                  <input type="hidden" name="id" value={id} /><input type="hidden" name="cleanerId" value={c.id} /><input type="hidden" name="returnTo" value={back} />
                  <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-ink-deep hover:bg-mint">{r.cleaner_id ? "Reassign to this cleaner" : "Assign this cleaner"}</button>
                  {!isRegular && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="makeRegular" className="accent-primary-deep" />Also make them the regular cleaner for future requests</label>}
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </Container></main>
  );
}
