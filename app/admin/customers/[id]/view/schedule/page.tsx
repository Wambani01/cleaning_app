import { notFound } from "next/navigation";
import { CustomerShell } from "@/components/customer-shell";
import { ScheduleBody } from "@/components/customer-pages";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerById } from "@/lib/customer";
import { todayAmsterdam } from "@/lib/scheduling";
export const metadata = { title: "Regular schedule (admin view)", robots: { index: false } };
export const dynamic = "force-dynamic";

/** An admin looking at a customer's dashboard, with the same screens and the power to act for them. */
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { session, wrongRole } = await requirePortal("admin");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="admin" />;
  const { id } = await params; const { msg } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = await loadCustomerById(id);
  if (!c) notFound();
  const base = `/admin/customers/${id}/view`;
  return (
    <CustomerShell name={c.row.name} email={c.row.email} current={`${base}/schedule`} base={base} adminFor={{ id, name: c.row.name }}>
      {msg && <p role="status" className="mb-6 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{msg}</p>}
      <ScheduleBody c={c} today={todayAmsterdam()} base={base} adminId={id} />
    </CustomerShell>
  );
}
