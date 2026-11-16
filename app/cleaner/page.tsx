import { SignOutButton } from "@/components/auth-forms";
import { Container } from "@/components/ui";
import { CleanerDashboardBody } from "@/components/cleaner-dashboard";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
export const metadata = { title: "Cleaner portal", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CleanerHome() {
  const { session, wrongRole } = await requirePortal("cleaner");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="cleaner" />;
  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Cleaner portal</p><h1 className="text-3xl font-bold">Hello, {session.user.name.split(" ")[0]}</h1></div>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{session.user.email}</span><SignOutButton /></div>
      </div>
      <CleanerDashboardBody email={session.user.email} />
    </Container></main>
  );
}
