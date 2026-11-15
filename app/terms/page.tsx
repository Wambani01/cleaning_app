import { Page, company, hourlyRate, price } from "@/components/ui";
export const metadata = { title: "Terms and cancellation" };
export default function Terms() {
  return (
    <Page title="Terms and cancellation" draft>
      <h2>The service</h2>
      <p>{company.legalName} gives members access to vetted regular cleaners, a backup cleaner when the regular cleaner is unavailable, and breakage cover.</p>
      <h2>Prices</h2>
      <ul><li>Membership: {price} per month.</li><li>Cleaning: {hourlyRate} per hour, charged for the hours booked.</li></ul>
      <p>Prices include VAT where applicable. We will show the total before you confirm.</p>
      <h2>Contract term and cancellation</h2>
      <p>The membership renews monthly. You can cancel online at any time and it ends at the end of the paid month. [Final term and notice period to be confirmed.]</p>
      <h2>Backup cleaner</h2>
      <p>If your regular cleaner cannot attend we will offer your backup cleaner. If no cleaner is available we will tell you as early as possible and reschedule or refund the affected visit.</p>
      <h2>Breakage cover</h2>
      <p>Cover applies to accidental damage caused by a cleaner during a visit. Limits, exclusions and how to claim will be set out in the insurance conditions. [To be completed with the insurer.]</p>
      <h2>Complaints</h2>
      <p>Contact {company.email}. We aim to respond within two working days.</p>
    </Page>
  );
}
