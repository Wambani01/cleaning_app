import { Card } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { PayBody } from "@/components/pay-body";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerByEmail } from "@/lib/customer";
export const metadata = { title: "Payments", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PayPage() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  return (
    <CustomerShell name={session.user.name} email={session.user.email} current="/customer/pay">
      {c ? <PayBody waitlistId={c.row.id} name={c.row.name} /> : <Card hover={false}><p>We need your address first. <a className="font-semibold text-primary-dark underline" href="/join">Add my details</a></p></Card>}
    </CustomerShell>
  );
}
