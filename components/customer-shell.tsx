import Link from "next/link";
import { CalendarDays, LayoutDashboard, PlusCircle } from "lucide-react";
import { Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";

const tabs = [
  { href: "/customer", label: "Overview", icon: LayoutDashboard },
  { href: "/customer/request", label: "Request a cleaning", icon: PlusCircle },
  { href: "/customer/schedule", label: "Regular schedule", icon: CalendarDays },
];

/** Header and tabs for every page in the customer area. */
export function CustomerShell({ name, email, current, children }: { name: string; email: string; current: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[70vh] bg-sand/60 py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Customer portal</p><h1 className="text-3xl font-medium">Hello, {name.split(" ")[0]}</h1></div>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{email}</span><SignOutButton /></div>
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
