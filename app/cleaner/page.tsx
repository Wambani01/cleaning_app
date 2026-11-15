import Link from "next/link";
import { CircleCheck, ClipboardList, FileCheck } from "lucide-react";
import { Card, Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
export const metadata = { title: "Cleaner portal", robots: { index: false } };
export const dynamic = "force-dynamic";

const steps: Record<string, { title: string; text: string }> = {
  new: { title: "Application received", text: "We are reviewing your application and will contact you soon." },
  contacted: { title: "We have contacted you", text: "Please reply to our message so we can arrange your video interview." },
  interview_scheduled: { title: "Video interview scheduled", text: "Check your email or phone for the date and the link." },
  documents_requested: { title: "Documents needed", text: "We will send you a secure link to upload your documents. Never send ID by email." },
  approved: { title: "Approved", text: "Welcome to Amsta Clean. We will match you with your first customers." },
  rejected: { title: "Not selected", text: "Thank you for applying. We are not able to offer you work at this time." },
};

export default async function CleanerHome() {
  const { session, wrongRole } = await requirePortal("cleaner");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="cleaner" />;
  // An application is linked to this account by email address.
  const app = (await pool.query("select status, created_at from public.cleaner_applications where lower(email) = lower($1) order by created_at desc limit 1", [session.user.email])).rows[0] as { status: string } | undefined;
  const step = app ? steps[app.status] : undefined;
  // Customers assigned to this cleaner. A cleaner sees the first name and address of the home, nothing more.
  const jobs = (await pool.query(
    `select w.name, w.street, w.house_number, w.house_number_addition, w.postcode, w.city,
            case when a.regular_cleaner_id = c.id then 'regular' else 'backup' end as role
       from public.cleaner_applications c
       join public.customer_assignments a on a.regular_cleaner_id = c.id or a.backup_cleaner_id = c.id
       join public.customer_waitlist w on w.id = a.waitlist_id
      where lower(c.email) = lower($1) and c.status = 'approved'
      order by w.created_at`, [session.user.email])).rows as { name: string; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null; role: string }[];

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Cleaner portal</p><h1 className="text-3xl font-bold">Hello, {session.user.name.split(" ")[0]}</h1></div>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{session.user.email}</span><SignOutButton /></div>
      </div>
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
    </Container></main>
  );
}
