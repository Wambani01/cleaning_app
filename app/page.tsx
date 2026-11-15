import { Button, Card, Container, price, slogan, tagline } from "@/components/ui";

const features = [
  { t: "Affordable regular cleaners", d: "The same vetted cleaner every visit, at a fair hourly rate." },
  { t: "Backup cleaner included", d: "If your cleaner is unavailable, we send a backup so you are never left without." },
  { t: "Breakage insurance", d: "Accidents happen. Cover for breakage is part of your membership." },
];

export default function Home() {
  return (
    <main>
      <div className="bg-gradient-to-br from-primary-dark to-primary-deep py-20 text-white">
        <Container>
          <p className="mb-3 font-heading text-xl italic text-mint">{slogan}</p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">{tagline}</h1>
          <p className="mb-8 max-w-xl text-lg opacity-95">Join for {price} a month and get access to trusted cleaners across Amsterdam.</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/join">Become a member</Button>
            <Button href="/apply" variant="light">I'm a cleaner</Button>
          </div>
        </Container>
      </div>
      <section className="py-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">What you get</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map(f => <Card key={f.t}><h3 className="mb-2 text-lg font-bold">{f.t}</h3><p className="text-muted">{f.d}</p></Card>)}
        </div>
      </Container></section>
      <section className="pb-14"><Container>
        <h2 className="mb-6 text-3xl font-bold">How it works</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Join the cleaning membership.</li><li>Tell us your address and how often you need cleaning.</li>
          <li>We match you with a regular cleaner and a backup.</li><li>Pay the hourly rate for each visit.</li>
        </ol>
      </Container></section>
    </main>
  );
}
