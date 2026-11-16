import { Check, type LucideIcon } from "lucide-react";
import { Container, ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/motion";

export type Tone = "light" | "sand" | "dark" | "white";
const tones: Record<Tone, string> = {
  light: "bg-surface",
  white: "bg-white",
  sand: "bg-sand",
  dark: "relative isolate overflow-hidden bg-ink-deep text-white",
};

export function Section({ id, tone = "light", children, className = "" }: { id?: string; tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`${tones[tone]} py-20 sm:py-28 ${className}`}>
      {tone === "dark" && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(55%_80%_at_90%_0%,rgba(16,177,199,.28),transparent_70%),radial-gradient(45%_70%_at_0%_100%,rgba(7,97,112,.65),transparent_70%)]" />}
      <Container>{children}</Container>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, intro, center = false, dark = false }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; center?: boolean; dark?: boolean }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`mb-3 text-xs font-bold uppercase tracking-[0.16em] ${dark ? "text-mint" : "text-primary-dark"}`}>{eyebrow}</p>}
      <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">{title}</h2>
      {intro && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/80" : "text-muted"}`}>{intro}</p>}
    </Reveal>
  );
}

export type Step = { t: string; d: string; icon: LucideIcon };

/** Numbered process with a connecting line on wide screens. */
export function Steps({ steps, dark = false }: { steps: Step[]; dark?: boolean }) {
  const cols = steps.length >= 5 ? "lg:grid-cols-5" : steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <ol className={`relative grid gap-x-6 gap-y-10 sm:grid-cols-2 ${cols}`}>
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <Reveal as="li" key={s.t} delay={i * 90} className="relative">
            {i < steps.length - 1 && <span aria-hidden="true" className={`absolute left-[calc(4.2rem+12px)] right-[calc(-1.5rem+12px)] top-[2.1rem] hidden h-px lg:block ${dark ? "bg-white/20" : "bg-line"}`} />}
            <div className={`relative mb-5 flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-full ring-8 ${dark ? "bg-primary-deep text-mint ring-ink-deep" : "bg-white text-primary-dark shadow-card ring-surface"}`}>
              <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
              <span className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${dark ? "bg-mint text-ink-deep" : "bg-primary text-ink-deep"}`}>{i + 1}</span>
            </div>
            <h3 className="mb-2 text-xl font-medium">{s.t}</h3>
            <p className={`text-[0.95rem] leading-relaxed ${dark ? "text-white/75" : "text-muted"}`}>{s.d}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}

export function Checklist({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="grid gap-3.5">
      {items.map(i => (
        <li key={i} className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${dark ? "bg-mint/20 text-mint" : "bg-primary/15 text-primary-dark"}`}><Check size={15} strokeWidth={3} aria-hidden="true" /></span>
          <span className={dark ? "text-white/90" : ""}>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export type Faq = { q: string; a: string };

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      {faqs.map(f => (
        <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
            {f.q}
            <span aria-hidden="true" className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sand text-xl leading-none transition duration-300 group-open:rotate-45 group-open:bg-primary">+</span>
          </summary>
          <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Structured data so search engines can show the questions. Content is exactly what is on the page. */
export function FaqJsonLd({ faqs }: { faqs: Faq[] }) {
  const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function CtaBand({ title, text, primary, secondary }: { title: React.ReactNode; text?: string; primary: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <Section tone="dark" className="!py-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">{title}</h2>
        {text && <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{text}</p>}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          {secondary && <ButtonLink href={secondary.href} variant="ghost">{secondary.label}</ButtonLink>}
        </div>
      </Reveal>
    </Section>
  );
}
