import { Page, company } from "@/components/ui";
export const metadata = { title: "Privacy policy" };
export default function Privacy() {
  return (
    <Page title="Privacy policy" draft>
      <p>This policy explains how {company.legalName} handles personal data under the General Data Protection Regulation (GDPR/AVG).</p>
      <h2>Who is responsible</h2>
      <p>{company.legalName}, {company.address}. Contact: {company.email}.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Customers: name, email, phone, address, booking history, and payment status (payments are processed by our payment provider, we do not store card numbers).</li>
        <li>Cleaners: name, contact details, area, experience, interview notes, and identity and work documents.</li>
        <li>Claims: descriptions and photos you send about damage.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul><li>To provide the service and match customers with cleaners.</li><li>To vet cleaners before they start.</li><li>To handle payments, invoices and breakage claims.</li><li>To meet legal obligations.</li></ul>
      <h2>Identity documents</h2>
      <p>Identity documents are used only to verify cleaners. They are stored securely, only authorised staff can see them, and they are deleted when we no longer need them.</p>
      <h2>Sharing</h2>
      <p>We share data only with providers who help us run the service (hosting, payments, identity checks, insurance) and when the law requires it. Customers' addresses are shared with the assigned cleaner.</p>
      <h2>Your rights</h2>
      <p>You can ask to see, correct, export or delete your data, or object to its use. Email {company.email}. You can also complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).</p>
    </Page>
  );
}
