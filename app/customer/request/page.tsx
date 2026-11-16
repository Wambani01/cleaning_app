import { Card } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { RequestBody } from "@/components/customer-pages";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerByEmail } from "@/lib/customer";
import { todayAmsterdam } from "@/lib/scheduling";
export const metadata = { title: "Request a cleaning", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  return (
    <CustomerShell name={session.user.name} email={session.user.email} current="/customer/request">
      {c ? <RequestBody c={c} today={todayAmsterdam()} base="/customer" /> : <Card hover={false}><p>We need your address first. <a className="font-semibold text-primary-dark underline" href="/join">Add my details</a></p></Card>}
    </CustomerShell>
  );
}
