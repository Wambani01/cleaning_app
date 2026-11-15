import { Button, Card, Container, hourlyRate, price, slogan, tagline } from "@/components/ui";

const features = [
  { t: "Affordable regular cleaners", d: `The same vetted cleaner every visit, from ${hourlyRate} per hour.` },
  { t: "Backup cleaner included", d: "If your cleaner is unavailable, we send a backup so you are never left without." },
  { t: "Breakage insurance", d: "Accidents happen. Cover for breakage is part of your membership." },
  { t: "Vetted cleaners", d: "Every cleaner has a video interview and a document check before they start." },
  { t: "One simple account", d: "Book, reschedule and see your visits and invoices in the app or on the web." },
  { t: "Help if something goes wrong", d: "Questions or complaints? We handle them and re-match you if it is not a fit." },
];

const steps = [
  { t: "Join", d: `Sign up for the ${price} per month membership.` },
  { t: "Tell us what you need", d: "Your address, how often, and any preferences." },
  { t: "Meet your cleaner", d: "We match you with a regular cleaner and a backup." },
  { t: "Relax", d: `Pay ${hourlyRate} per hour for each visit. Cancel the membership any time.` },
];

const cleanerPoints = [
  "Choose your own area and availability",
  "Regular work close to home in Amsterdam",
  "Clear process: apply, video interview, document check, start",
  "Support from our team when you need it",
];

const faqs = [
  { q: "What does the membership cost?", a: `${price} per month, plus ${hourlyRate} per hour for each hour of cleaning.` },
  { q: "What if my regular cleaner is ill or on holiday?", a: "We send your backup cleaner. If neither is available we will arrange a replacement or tell you in good time." },
  { q: "What does the breakage insurance cover?", a: "Accidental damage to your belongings during a visit. Full conditions will be published before launch." },
  { q: "Can I cancel?", a: "Yes. You can cancel your membership online. The cancellation terms will be shown clearly before you sign up." },
  { q: "How are cleaners checked?", a: "Cleaners apply, have a video interview with us and submit their identity documents before they are approved." },
  { q: "Which areas do you cover?", a: "Amsterdam. Tell us your postcode when you join and we will confirm." },
  { q: "I want to work as a cleaner. How do I start?", a: "Use the Work with us page. We will invite you to a video interview and ask for your documents securely." },
];

export default function Home() {
  return (
    <main>
      <div className="bg-primary-deep py-20">
        <Container>
          <p className="mb-3 font-heading text-xl italic text-mint">{slogan}</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">{tagline}</h1>
          <p className="mb-8 max-w-xl text-lg text-white">Join for {price} a month, then pay just {hourlyRate} per hour for trusted cleaners across Amsterdam.</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/join">Become a member</Button>
            <Button href="/apply" variant="light">I'm a cleaner</Button>
          </div>
        </Container>
      </div>

      <section className="py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">Why Amsta Clean</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => <Card key={f.t}><h3 className="mb-2 text-lg font-bold">{f.t}</h3><p className="text-muted">{f.d}</p></Card>)}
        </div>
      </Container></section>

      <section className="pb-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">How it works</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.t}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold">{i + 1}</div>
              <h3 className="mb-1 font-bold">{s.t}</h3><p className="text-sm text-muted">{s.d}</p>
            </Card>
          ))}
        </div>
      </Container></section>

      <section className="bg-white py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">Simple pricing</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Card><div className="text-4xl font-bold text-primary-dark">{price}<span className="text-base font-normal text-muted"> / month</span></div>
            <p className="mt-2 font-semibold">Membership</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted"><li>Access to vetted regular cleaners</li><li>Backup cleaner</li><li>Breakage insurance</li></ul></Card>
          <Card><div className="text-4xl font-bold text-primary-dark">{hourlyRate}<span className="text-base font-normal text-muted"> / hour</span></div>
            <p className="mt-2 font-semibold">Cleaning</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted"><li>Pay only for the hours you book</li><li>No hidden fees</li></ul></Card>
        </div>
        <div className="mt-6"><Button href="/join">Become a member</Button></div>
      </Container></section>

      <section className="py-14"><Container>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-3 text-3xl font-bold">Work as a cleaner</h2>
            <p className="mb-4 text-muted">We are recruiting cleaners across Amsterdam. Apply in a few minutes.</p>
            <Button href="/apply">Apply now</Button>
          </div>
          <Card><ul className="list-disc space-y-2 pl-5">{cleanerPoints.map(c => <li key={c}>{c}</li>)}</ul></Card>
        </div>
      </Container></section>

      <section id="faq" className="bg-white py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">Frequently asked questions</h2>
        <div className="max-w-3xl divide-y divide-line rounded-2xl border border-line">
          {faqs.map(f => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container></section>
    </main>
  );
}
