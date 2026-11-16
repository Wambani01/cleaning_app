import { notFound } from "next/navigation";
import { CustomerShell } from "@/components/customer-shell";
import { PayBody } from "@/components/pay-body";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerById } from "@/lib/customer";
export const metadata = { title: "Payments (admin view)", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = await loadCustomerById(id);
  if (!c) notFound();
  const base = `/admin/customers/${id}/view`;
  return (
    <CustomerShell name={c.row.name} email={c.row.email} current={`${base}/pay`} base={base} adminFor={{ id, name: c.row.name }}>
      <PayBody waitlistId={id} name={c.row.name} readOnly />
    </CustomerShell>
  );
}
