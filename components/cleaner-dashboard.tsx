import Link from "next/link";
import { CircleCheck, ClipboardList, FileCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { pool } from "@/lib/db";
import { respondToRequest } from "@/app/cleaner/actions";
import { summarise } from "@/lib/request-details";
import { addressLine, statusTone } from "@/components/request-list";
import { formatDate, formatHours, todayAmsterdam } from "@/lib/scheduling";
import { requestLabel, type CleaningRequest } from "@/lib/customer";

const steps: Record<string, { title: string; text: string }> = {
  new: { title: "Application received", text: "We are reviewing your application and will contact you soon." },
  contacted: { title: "We have contacted you", text: "Please reply to our message so we can arrange your video interview." },
  interview_scheduled: { title: "Video interview scheduled", text: "Check your email or phone for the date and the link." },
  documents_requested: { title: "Documents needed", text: "We will send you a secure link to upload your documents. Never send ID by email." },
  approved: { title: "Approved", text: "Welcome to Amsta Clean. We will match you with your first customers." },
  rejected: { title: "Not selected", text: "Thank you for applying. We are not able to offer you work at this time." },
};

/**
 * The cleaner's dashboard: application status, customers and cleaning requests to accept or decline.
 * Shown to the cleaner, and to an admin looking at it for them (adminId = the cleaner's application id).
 */
export async function CleanerDashboardBody({ email, adminId }: { email: string; adminId?: string }) {
  // An application is linked to this account by email address.
  const app = (await pool.query("select status, created_at from public.cleaner_applications where lower(email) = lower($1) order by created_at desc limit 1", [email])).rows[0] as { status: string } | undefined;
  const step = app ? steps[app.status] : undefined;
  const meId = app ? (await pool.query("select id from public.cleaner_applications where lower(email) = lower($1) and status = 'approved' limit 1", [email])).rows[0]?.id as string | undefined : undefined;
  // Cleaning requests sent to this cleaner. Requests still waiting for the customer's first payment are not shown yet.
  const today = todayAmsterdam();
  const reqs = meId ? (await pool.query(
    `select r.id, to_char(r.requested_date,'YYYY-MM-DD') as requested_date, to_char(r.start_time,'HH24:MI') as start_time, r.hours::float8 as hours, r.notes, r.status, r.cleaner_response, r.decline_reason,
            r.street, r.house_number, r.house_number_addition, r.postcode, r.city, r.property_type, r.bedrooms, r.bathrooms, r.windows, r.tasks, r.has_pets, r.supplies_at_home, split_part(w.name, ' ', 1) as customer_first_name
       from public.cleaning_requests r join public.customer_waitlist w on w.id = r.waitlist_id
      where r.cleaner_id = $1 and r.status <> 'awaiting_payment' order by r.requested_date asc, r.start_time asc limit 100`, [meId])).rows as (CleaningRequest & { customer_first_name: string })[] : [];
  const isOpen = (r: { status: string; requested_date: string }) => ["requested", "confirmed"].includes(r.status) && r.requested_date >= today;
  const toAnswer = reqs.filter(r => isOpen(r) && r.cleaner_response === "pending");
  const accepted = reqs.filter(r => isOpen(r) && r.cleaner_response === "accepted");
  const history = reqs.filter(r => !isOpen(r) || r.cleaner_response === "declined").sort((a, b) => b.requested_date.localeCompare(a.requested_date)).slice(0, 10);
  // Customers assigned to this cleaner. A cleaner sees the first name and address of the home, nothing more.
  const jobs = (await pool.query(
    `select w.name, w.street, w.house_number, w.house_number_addition, w.postcode, w.city,
            case when a.regular_cleaner_id = c.id then 'regular' else 'backup' end as role
       from public.cleaner_applications c
       join public.customer_assignments a on a.regular_cleaner_id = c.id or a.backup_cleaner_id = c.id
       join public.customer_waitlist w on w.id = a.waitlist_id
      where lower(c.email) = lower($1) and c.status = 'approved'
      order by w.created_at`, [email])).rows as { name: string; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null; role: string }[];

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <Card icon={ClipboardList} hover={false}><h2 className="mb-1 font-bold">Your application</h2>
          {step ? <><p className="font-semibold text-primary-dark">{step.title}</p><p className="mt-1 text-sm text-muted">{step.text}</p></> :
            <><p className="text-sm text-muted">We cannot find an application with this email address yet.</p><Link href="/apply" className="mt-3 inline-block text-sm font-semibold text-primary-dark underline">Apply now</Link></>}</Card>
        <Card icon={FileCheck} hover={false}><h2 className="mb-1 font-bold">Documents</h2><p className="text-sm text-muted">Secure document upload is coming soon. We will tell you when it is your turn.</p></Card>
        <Card icon={CircleCheck} hover={false}><h2 className="mb-1 font-bold">Your customers</h2>
          {jobs.length === 0 ? <p className="text-sm text-muted">Once you are approved and matched, your customers will appear here.</p> : (
            <ul className="grid gap-3 text-sm">
              {jobs.map((j, i) => (
                <li key={i}><p className="font-semibold">{j.name.split(" ")[0]} <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary-deep">{j.role === "regular" ? "Regular" : "Backup"}</span></p>
                  <p className="text-muted">{[j.street && `${j.street} ${j.house_number ?? ""}${j.house_number_addition ? " " + j.house_number_addition : ""}`.trim(), [j.postcode, j.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p></li>
              ))}
            </ul>
          )}</Card>
      </div>

      {meId && (
        <div className="mt-10">
          <h2 className="mb-3 text-2xl font-medium">Cleaning requests</h2>
          {toAnswer.length === 0 && accepted.length === 0 && <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-muted">No cleaning requests for you right now. New requests appear here for you to accept or decline.</p>}
          {toAnswer.length > 0 && <><h3 className="mb-3 mt-2 text-lg font-semibold">New: please answer ({toAnswer.length})</h3><div className="grid gap-4">{toAnswer.map(r => <RequestCard key={r.id} r={r} adminId={adminId} answer />)}</div></>}
          {accepted.length > 0 && <><h3 className="mb-3 mt-8 text-lg font-semibold">Accepted</h3><div className="grid gap-4">{accepted.map(r => <RequestCard key={r.id} r={r} adminId={adminId} withdraw />)}</div></>}
          {history.length > 0 && <><h3 className="mb-3 mt-8 text-lg font-semibold">Earlier</h3><div className="grid gap-3">{history.map(r => <RequestCard key={r.id} r={r} compact />)}</div></>}
        </div>
      )}
    </>
  );
}

type CardReq = CleaningRequest & { customer_first_name: string };
function RequestCard({ r, answer, withdraw, compact, adminId }: { r: CardReq; answer?: boolean; withdraw?: boolean; compact?: boolean; adminId?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{formatDate(r.requested_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="text-sm text-muted">{r.start_time} · {formatHours(r.hours)} · for {r.customer_first_name}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.cleaner_response === "declined" ? "bg-red-100 text-red-800" : r.cleaner_response === "accepted" ? "bg-green-100 text-green-800" : statusTone[r.status]}`}>
          {r.cleaner_response === "declined" ? "You declined" : r.status === "cancelled" || r.status === "completed" ? requestLabel[r.status] : r.cleaner_response === "accepted" ? (r.status === "confirmed" ? "Accepted and confirmed" : "Accepted") : "Waiting for your answer"}
        </span>
      </div>
      {!compact && (
        <div className="mt-3 grid gap-1 text-sm">
          <p><b>Address:</b> {addressLine(r) || "-"}</p>
          {(r.property_type || r.tasks.length > 0) && <p><b>Job:</b> {summarise(r)}</p>}
          <p><b>Good to know:</b> {r.has_pets ? "pets at home" : "no pets"} · {r.supplies_at_home === false ? "no cleaning supplies at home" : "cleaning supplies at home"}</p>
          {r.notes && <p><b>Note from the customer:</b> {r.notes}</p>}
        </div>
      )}
      {answer && (
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <form action={respondToRequest}><input type="hidden" name="id" value={r.id} />{adminId && <input type="hidden" name="cleanerId" value={adminId} />}<input type="hidden" name="answer" value="accept" /><button className="rounded-full bg-primary px-6 py-2.5 font-bold text-ink-deep hover:bg-mint">Accept</button></form>
          <form action={respondToRequest} className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={r.id} />{adminId && <input type="hidden" name="cleanerId" value={adminId} />}<input type="hidden" name="answer" value="decline" /><input name="reason" maxLength={500} placeholder="Reason (optional)" aria-label="Reason for declining" className="rounded-xl border border-line px-3 py-2 text-sm" /><button className="rounded-full border border-red-300 px-5 py-2.5 font-semibold text-red-800 hover:bg-red-50">Decline</button></form>
        </div>
      )}
      {withdraw && <form action={respondToRequest} className="mt-4 flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={r.id} />{adminId && <input type="hidden" name="cleanerId" value={adminId} />}<input type="hidden" name="answer" value="decline" /><input name="reason" maxLength={500} placeholder="Reason (optional)" aria-label="Reason for withdrawing" className="rounded-xl border border-line px-3 py-2 text-sm" /><button className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:border-red-300 hover:text-red-800">I can no longer make it</button></form>}
      {r.cleaner_response === "declined" && r.decline_reason && <p className="mt-2 text-sm text-muted">Your reason: {r.decline_reason}</p>}
    </div>
  );
}
