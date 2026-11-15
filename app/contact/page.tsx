import { Page, company } from "@/components/ui";
export const metadata = { title: "Contact" };
export default function Contact() {
  return (
    <Page title="Contact">
      <p>Questions about regular cleaning, or about working with us as a cleaner? Get in touch.</p>
      <ul>
        <li>Email: <a className="text-primary-dark underline" href={`mailto:${company.email}`}>{company.email}</a></li>
        <li>Address: {company.address}</li>
        {company.phone && <li>Phone: {company.phone}</li>}
      </ul>
      <p className="text-muted">We usually reply within two working days.</p>
    </Page>
  );
}
