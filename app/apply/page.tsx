import { Container, Field, Input, Note, inputClass } from "@/components/ui";
export const metadata = { title: "Work with us" };

const areas = ["Amsterdam Centrum", "Noord", "Oost", "Zuid", "West", "Nieuw-West", "Zuidoost"];

export default function Apply() {
  return (
    <main className="py-14"><Container>
      <h1 className="mb-3 text-3xl font-bold">Work as a cleaner</h1>
      <p className="mb-4 max-w-2xl text-muted">We are recruiting cleaners across Amsterdam. Apply below, then we will invite you to a video interview and ask for your documents.</p>
      <ol className="mb-8 list-decimal space-y-1 pl-5"><li>Submit this application</li><li>Video interview</li><li>Upload ID and documents securely</li><li>Approval and first jobs</li></ol>
      <form className="grid max-w-lg gap-4" aria-label="Cleaner application">
        <Field label="Full name"><Input name="name" required /></Field>
        <Field label="Email"><Input type="email" name="email" required /></Field>
        <Field label="Phone"><Input name="phone" required /></Field>
        <Field label="Area"><select name="area" className={inputClass}>{areas.map(a => <option key={a}>{a}</option>)}</select></Field>
        <Field label="Experience"><textarea name="exp" rows={4} className={inputClass} /></Field>
        <Note>Never send ID documents by email. We will give you a secure upload link after the interview.</Note>
        <button disabled className="rounded-lg bg-primary px-6 py-3 font-bold text-ink opacity-60">Submit (coming soon)</button>
      </form>
    </Container></main>
  );
}
