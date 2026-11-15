import Link from "next/link";
import { CalendarCheck, Users, Wallet } from "lucide-react";
import { Card, Container, hourlyRate, price } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { pool } from "@/lib/db";
export const metadata = { title: "My cleaning", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const onList = (await pool.query("select 1 from public.customer_waitlist where lower(email) = lower($1) limit 1", [session.user.email])).rowCount! > 0;

  return (
    <main className="py-10"><Container>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-primary-dark">Customer portal</p><h1 className="text-3xl font-bold">Hello, {session.user.name.split(" ")[0]}</h1></div>
        <div className="flex items-center gap-3"><span className="text-sm text-muted">{session.user.email}</span><SignOutButton /></div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Card icon={Wallet} hover={false}><h2 className="mb-1 font-bold">Membership</h2>
          <p className="text-sm text-muted">{price} per month plus {hourlyRate} per hour of cleaning.</p>
          <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm">Online payment is coming soon.</p></Card>
        <Card icon={Users} hover={false}><h2 className="mb-1 font-bold">Your cleaner</h2>
          <p className="text-sm text-muted">{onList ? "You are on our list. We will contact you as soon as we have a regular cleaner and a backup for you." : "You have not asked for regular cleaning yet."}</p>
          {!onList && <Link className="mt-3 inline-block text-sm font-semibold text-primary-dark underline" href="/join">Ask for regular cleaning</Link>}</Card>
        <Card icon={CalendarCheck} hover={false}><h2 className="mb-1 font-bold">Bookings</h2>
          <p className="text-sm text-muted">Your upcoming visits will appear here.</p></Card>
      </div>
    </Container></main>
  );
}
