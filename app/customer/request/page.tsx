import { Info } from "lucide-react";
import { Card, hourlyRate, price } from "@/components/ui";
import { CustomerShell } from "@/components/customer-shell";
import { RequestForm } from "@/components/customer-forms";
import { RequestList } from "@/components/request-list";
import { WrongPortal } from "@/components/wrong-portal";
import { requirePortal } from "@/lib/admin";
import { loadCustomerByEmail } from "@/lib/customer";
import { RULES, addDays, occurrences, todayAmsterdam } from "@/lib/scheduling";
export const metadata = { title: "Request a cleaning", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const { session, wrongRole } = await requirePortal("customer");
  if (wrongRole) return <WrongPortal role={session.user.role} wanted="customer" />;
  const c = await loadCustomerByEmail(session.user.email);
  const today = todayAmsterdam(), min = addDays(today, RULES.minLeadDays), max = addDays(today, RULES.maxAheadDays);
  const quick = c?.schedule ? occurrences(c.schedule, min, 4).map(date => ({ date, time: c.schedule!.start_time, hours: c.schedule!.hours })) : [];
  const open = (c?.requests ?? []).filter(r => ["requested", "awaiting_payment", "confirmed"].includes(r.status) && r.requested_date >= today).sort((a, b) => a.requested_date.localeCompare(b.requested_date));

  return (
    <CustomerShell name={session.user.name} email={session.user.email} current="/customer/request">
      {!c ? <Card hover={false}><p>We need your address first. <a className="font-semibold text-primary-dark underline" href="/join">Add my details</a></p></Card> : (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <Card hover={false} className="!p-8"><h2 className="mb-1 text-2xl font-medium">Request a cleaning</h2><p className="mb-6 text-sm text-muted">Tell us when you would like your cleaner. Pick one of your regular days, or any other date.</p><RequestForm quick={quick} today={today} min={min} max={max} /></Card>
          <div className="grid content-start gap-5">
            <Card hover={false}>
              <h3 className="mb-2 flex items-center gap-2 font-semibold"><Info size={18} className="text-primary-dark" aria-hidden="true" />How payment works</h3>
              <ul className="grid gap-2 text-sm leading-relaxed text-muted">
                <li>Your account is free. You pay nothing until you make a cleaning request.</li>
                <li>With your first request you pay the {price} membership. It then renews on the same day each month.</li>
                <li>Cleaning is {hourlyRate} per hour.</li>
                {c.membership.status !== "active" && <li className="font-medium text-ink">Online payment is coming soon. After your first request we will contact you with the payment details.</li>}
              </ul>
            </Card>
            {!c.schedule && <Card hover={false}><p className="text-sm text-muted">Want the same slot every week? <a className="font-semibold text-primary-dark underline" href="/customer/schedule">Set your regular schedule</a> and its dates appear here as shortcuts.</p></Card>}
          </div>
        </div>
      )}
      {c && <><h2 className="mb-3 mt-10 text-2xl font-medium">Your open requests</h2><RequestList requests={open} empty="You have no open requests." /></>}
    </CustomerShell>
  );
}
