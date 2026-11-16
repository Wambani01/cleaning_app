import Link from "next/link";
import { CalendarDays, LayoutDashboard, PlusCircle, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";

/**
 * Header and tabs for every page in the customer area.
 * `base` is "/customer" for customers, or the admin's "view as customer" path. `adminFor` shows the banner when an admin is looking.
 */
export function CustomerShell({ name, email, current, base = "/customer", adminFor, children }: { name: string; email: string; current: string; base?: string; adminFor?: { id: string; name: string }; children: React.ReactNode }) {
  const tabs = [
    { href: base, label: "Overview", icon: LayoutDashboard },
    { href: `${base}/request`, label: "Request a cleaning", icon: PlusCircle },
    { href: `${base}/schedule`, label: "Regular schedule", icon: CalendarDays },
  ];
  return (
    <main className="min-h-[70vh] bg-sand/60 py-10"><Container>
      {adminFor && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm">
          <span className="flex items-start gap-2"><ShieldCheck size={18} className="mt-0.5 flex-none text-amber-700" aria-hidden="true" /><span>You are viewing <b>{adminFor.name}</b>&apos;s dashboard as an admin. Anything you do here is done for this customer.</span></span>
          <Link href={`/admin/customers/${adminFor.id}`} className="font-semibold underline underline-offset-4">Back to the customer in admin</Link>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Customer portal</p><h1 className="text-3xl font-medium">{adminFor ? name : `Hello, ${name.split(" ")[0]}`}</h1></div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`${base}/request`} className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] transition hover:-translate-y-0.5 hover:bg-mint"><PlusCircle size={18} aria-hidden="true" />Request a cleaning</Link>
          {!adminFor && <><span className="hidden text-sm text-muted sm:inline">{email}</span><SignOutButton /></>}
        </div>
      </div>
      <nav aria-label="Customer area" className="mb-8 flex flex-wrap gap-2">
        {tabs.map(t => { const Icon = t.icon, on = current === t.href; return (
          <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${on ? "bg-primary-deep text-white" : "border border-line bg-white hover:border-primary"}`}><Icon size={16} aria-hidden="true" />{t.label}</Link>
        ); })}
      </nav>
      {children}
    </Container></main>
  );
}
