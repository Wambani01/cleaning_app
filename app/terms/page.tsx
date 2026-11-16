import { Page, company, hourlyRate, price } from "@/components/ui";
export const metadata = { title: "Terms and cancellation", alternates: { canonical: "/terms" } };
export default function Terms() {
  return (
    <Page title="Terms and cancellation" draft>
      <h2>The service</h2>
      <p>{company.legalName} gives members access to vetted regular cleaners, a backup cleaner when the regular cleaner is unavailable, and breakage cover.</p>
      <h2>Prices</h2>
      <ul><li>Creating an account is free.</li><li>Membership: {price} per 30 days. The first payment is due when you make your first cleaning request.</li><li>Cleaning: {hourlyRate} per hour, charged for the hours booked.</li></ul>
      <p>Prices include VAT where applicable. We will show the total before you confirm.</p>
      <h2>Contract term and cancellation</h2>
      <p>The membership starts with your first payment and renews every 30 days. The fee is due 30 days after the day of each payment. You can ask us to cancel your membership, and it ends at the end of the paid 30-day period. [Final term and notice period to be confirmed.]</p>
      <h2>Cleaning requests</h2>
      <p>You can request a cleaning for any date from tomorrow, up to six months ahead. A request is confirmed by us once your first payment has been received. You can cancel an open request. [Cancellation deadline for a confirmed cleaning to be confirmed.]</p>
      <h2>Backup cleaner</h2>
      <p>If your regular cleaner cannot attend we will offer your backup cleaner. If no cleaner is available we will tell you as early as possible and reschedule or refund the affected visit.</p>
      <h2>Breakage cover</h2>
      <p>Cover applies to accidental damage caused by a cleaner during a visit. Limits, exclusions and how to claim will be set out in the insurance conditions. [To be completed with the insurer.]</p>
      <h2>Complaints</h2>
      <p>Contact {company.email}. We aim to respond within two working days.</p>
    </Page>
  );
}
