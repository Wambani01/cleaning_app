import { Card, Container, Field, Input, Note, price } from "@/components/ui";
export const metadata = { title: "Become a member" };

export default function Join() {
  return (
    <main className="py-14"><Container>
      <h1 className="mb-6 text-3xl font-bold">Cleaning membership</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="text-4xl font-extrabold text-primary">{price}<span className="text-base font-normal text-muted"> / month</span></div>
          <ul className="my-4 list-disc space-y-1 pl-5"><li>Regular cleaner at an hourly rate</li><li>Backup cleaner if yours is unavailable</li><li>Breakage insurance</li></ul>
          <Note>Online sign-up and payment (Stripe, incl. iDEAL) is coming soon. Leave your details and we will contact you.</Note>
        </Card>
        <form className="grid max-w-md content-start gap-4" aria-label="Waitlist">
          <Field label="Name"><Input name="name" required /></Field>
          <Field label="Email"><Input type="email" name="email" required /></Field>
          <Field label="Postcode"><Input name="postcode" placeholder="1011 AB" /></Field>
          <button disabled className="rounded-lg bg-accent px-6 py-3 font-bold text-ink opacity-60">Join waitlist (coming soon)</button>
        </form>
      </div>
    </Container></main>
  );
}
