import { BadgeCheck, CalendarClock, ClipboardList, FileCheck, HeartHandshake, Headset, IdCard, MapPin, Repeat, Rocket, Send, ShieldCheck, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Container, Field, Input, Note, inputClass } from "@/components/ui";
export const metadata = { title: "Work with us" };

const areas = ["Amsterdam Centrum", "Noord", "Oost", "Zuid", "West", "Nieuw-West", "Zuidoost"];

const benefits: { t: string; d: string; icon: LucideIcon }[] = [
  { t: "Regular work", icon: Repeat, d: "Steady, repeat customers instead of chasing one-off jobs." },
  { t: "Work near home", icon: MapPin, d: "We match you with households in your own area, so you spend less time travelling." },
  { t: "Your availability", icon: CalendarClock, d: "Tell us which days and hours suit you, and we match around them." },
  { t: "We find the customers", icon: HeartHandshake, d: "We do the marketing, matching and invoicing, so you can focus on cleaning." },
  { t: "Backup and insurance", icon: ShieldCheck, d: "Customers are covered for accidental breakage, so one mistake does not become your problem alone." },
  { t: "Support from a real team", icon: Headset, d: "Questions, a difficult visit or a customer issue? You can reach us." },
];

const process: { t: string; d: string; icon: LucideIcon }[] = [
  { t: "Apply online", icon: Send, d: "Fill in the short form below. It takes about five minutes." },
  { t: "We review your application", icon: ClipboardList, d: "We check your area, experience and availability and reply by email or phone." },
  { t: "Video interview", icon: Video, d: "A friendly video call to get to know you, explain how we work and answer your questions." },
  { t: "Submit your documents", icon: IdCard, d: "After the interview you get a secure link to upload your ID and other documents. Never send them by email." },
  { t: "Verification and approval", icon: BadgeCheck, d: "We check your documents. Once approved, you set up your profile and availability." },
  { t: "Your first customers", icon: Rocket, d: "We match you with households nearby and tell you the details of each visit before you go." },
];

const needs = [
  "Aged 18 or older",
  "Right to live and work in the Netherlands",
  "Some cleaning experience, or a real willingness to learn",
  "Reliable, on time and respectful in customers' homes",
  "A phone with internet, for messages and your schedule",
  "Basic Dutch or English, enough to talk with customers and our team",
];

const documents = [
  "A valid passport, ID card or residence permit",
  "Your citizen service number (BSN)",
  "Bank details (IBAN) for payment",
  "Proof of registration if you work as a self-employed person",
  "A certificate of conduct (VOG) if we ask for one",
];

const faqs = [
  { q: "How much will I earn?", a: "We explain pay, how and when you are paid, and how you work with us during the interview, so you can decide with all the facts." },
  { q: "Do I need my own cleaning supplies?", a: "We will tell you what is provided for each customer and what to bring." },
  { q: "Can I choose my days and hours?", a: "Yes. You tell us when you are available and we only offer jobs that fit." },
  { q: "What if I cannot make a visit?", a: "Tell us as early as possible. We arrange the customer's backup cleaner so the visit is covered." },
  { q: "Is my personal data safe?", a: "Your documents are used only to verify you, are stored securely, and are seen only by authorised staff. See our privacy policy." },
  { q: "Do I need experience?", a: "Experience helps, but it is not always required. Tell us about yourself in the application." },
];

export default function Apply() {
  return (
    <main>
      <div className="bg-primary-deep py-16">
        <Container>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">Work as a cleaner in Amsterdam</h1>
          <p className="mb-8 max-w-2xl text-lg text-white">Regular customers near your home, flexible hours, and a team behind you. Apply in a few minutes.</p>
          <a href="#apply-form" className="inline-block rounded-lg bg-primary px-6 py-3 font-bold text-ink hover:bg-mint">Apply now</a>
        </Container>
      </div>

      <section className="py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">Why work with Amsta Clean</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(b => <Card key={b.t} icon={b.icon}><h3 className="mb-2 text-lg font-bold">{b.t}</h3><p className="text-muted">{b.d}</p></Card>)}
        </div>
      </Container></section>

      <section className="bg-white py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">How it works</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((s, i) => (
            <li key={s.t}><Card icon={s.icon}>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary-dark">Step {i + 1}</p>
              <h3 className="mb-1 font-bold">{s.t}</h3><p className="text-sm text-muted">{s.d}</p>
            </Card></li>
          ))}
        </ol>
      </Container></section>

      <section className="py-14"><Container>
        <div className="grid gap-6 md:grid-cols-2">
          <Card icon={BadgeCheck} hover={false}><h2 className="mb-3 text-2xl font-bold">What we look for</h2><ul className="list-disc space-y-2 pl-5">{needs.map(n => <li key={n}>{n}</li>)}</ul></Card>
          <Card icon={FileCheck} hover={false}><h2 className="mb-3 text-2xl font-bold">Documents you will need</h2>
            <ul className="list-disc space-y-2 pl-5">{documents.map(n => <li key={n}>{n}</li>)}</ul>
            <p className="mt-3 text-sm text-muted">The exact list depends on how you work with us. We confirm it in the interview.</p></Card>
        </div>
      </Container></section>

      <section className="bg-white py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">Questions from cleaners</h2>
        <div className="max-w-3xl divide-y divide-line rounded-2xl border border-line">
          {faqs.map(f => (
            <details key={f.q} className="p-5"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-2 text-muted">{f.a}</p></details>
          ))}
        </div>
      </Container></section>

      <section id="apply-form" className="py-14"><Container>
        <h2 className="mb-2 text-3xl font-bold">Apply now</h2>
        <p className="mb-6 max-w-2xl text-muted">Tell us a little about yourself. We will contact you to arrange a video interview.</p>
        <form className="grid max-w-lg gap-4" aria-label="Cleaner application">
          <Field label="Full name"><Input name="name" required /></Field>
          <Field label="Email"><Input type="email" name="email" required /></Field>
          <Field label="Phone"><Input name="phone" required /></Field>
          <Field label="Area"><select name="area" className={inputClass}>{areas.map(a => <option key={a}>{a}</option>)}</select></Field>
          <Field label="Days and hours you can work"><textarea name="availability" rows={3} className={inputClass} /></Field>
          <Field label="Experience"><textarea name="exp" rows={4} className={inputClass} /></Field>
          <Note>Never send ID documents by email. We will give you a secure upload link after the interview.</Note>
          <button disabled className="rounded-lg bg-primary px-6 py-3 font-bold text-ink opacity-60">Submit (coming soon)</button>
        </form>
      </Container></section>
    </main>
  );
}
