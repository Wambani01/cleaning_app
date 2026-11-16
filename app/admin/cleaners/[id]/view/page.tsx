import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui";
import { CleanerDashboardBody } from "@/components/cleaner-dashboard";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
export const metadata = { title: "Cleaner dashboard (admin view)", robots: { index: false } };
export const dynamic = "force-dynamic";

/** An admin looking at a cleaner's dashboard, with the power to answer requests for them (for example after a phone call). */
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;
  const { id } = await params; const { msg } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = (await pool.query("select id, full_name, email, phone, status from public.cleaner_applications where id = $1", [id])).rows[0] as { id: string; full_name: string; email: string; phone: string; status: string } | undefined;
  if (!c) notFound();
  return (
    <main className="min-h-[70vh] bg-sand/60 py-10"><Container>
      <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm">
        <span className="flex items-start gap-2"><ShieldCheck size={18} className="mt-0.5 flex-none text-amber-700" aria-hidden="true" /><span>You are viewing <b>{c.full_name}</b>&apos;s dashboard as an admin. Anything you answer here is answered for this cleaner.</span></span>
        <Link href="/admin?tab=applications" className="font-semibold underline underline-offset-4">Back to cleaner applications</Link>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Cleaner portal</p><h1 className="text-3xl font-bold">{c.full_name}</h1><p className="text-sm text-muted">{c.email} · {c.status.replace(/_/g, " ")}</p></div>
        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-deep"><Phone size={15} aria-hidden="true" />Call cleaner {c.phone}</a>
      </div>
      {msg && <p role="status" className="mb-6 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{msg}</p>}
      <CleanerDashboardBody email={c.email} adminId={c.id} />
    </Container></main>
  );
}
