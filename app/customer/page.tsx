import { ButtonLink, Card } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { OverviewBody } from "@/components/customer-pages";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerByEmail } from "@/lib/customer";
import { todayAmsterdam } from "@/lib/scheduling";
export const metadata = { title: "My cleaning", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  return (
    <CustomerShell name={session.user.name} email={session.user.email} current="/customer">
      {c ? <OverviewBody c={c} today={todayAmsterdam()} base="/customer" /> : <Card hover={false}><h2 className="mb-2 text-xl font-medium">We need your address</h2><p className="mb-4 text-muted">Your account is free, but we need your address and phone number before you can make a cleaning request.</p><ButtonLink href="/join">Add my details</ButtonLink></Card>}
    </CustomerShell>
  );
}
