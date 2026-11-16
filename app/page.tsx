import Image from "next/image";
import type { Metadata } from "next";
import { BadgeCheck, CalendarCheck, CalendarDays, Coins, LifeBuoy, Repeat, ShieldCheck, UserCheck, Users, Video, FileCheck, Wallet, ClipboardList } from "lucide-react";
import { ButtonLink, Card, Container, hourlyRate, price } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { Checklist, CtaBand, FaqJsonLd, FaqList, Section, SectionTitle, Steps, type Step } from "@/components/sections";
import { homeownerFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Amsta Clean | Regular cleaners in Amsterdam, matched to your home" },
  description: `Create a free account and request a vetted regular cleaner with a backup. You pay the ${price} membership with your first request, then ${hourlyRate} per hour. Cleaners: work independently with customers near you.`,
  alternates: { canonical: "/" },
};

const why = [
  { t: "A regular cleaner, matched to you", d: `The same vetted cleaner every visit, from ${hourlyRate} per hour. We do the searching and matching.`, icon: Users },
  { t: "A backup, built in", d: "If your cleaner is unavailable, your backup steps in, so you are never left without.", icon: Repeat },
  { t: "Breakage cover", d: "Accidents happen. Cover for accidental breakage during a visit is part of your membership.", icon: ShieldCheck },
  { t: "Checked before they start", d: "Every cleaner has a video interview with us and a document check before they are approved.", icon: UserCheck },
  { t: "A free account that works for you", d: "Set your regular cleaning day in a calendar, request a cleaning when you need one, and see who your regular and backup cleaners are.", icon: CalendarCheck },
  { t: "A team to talk to", d: "Questions or a problem? Contact us and we will help.", icon: LifeBuoy },
];

const steps: Step[] = [
  { t: "Create a free account", d: "Tell us your address and phone number. It costs nothing.", icon: ClipboardList },
  { t: "Set your regular schedule", d: "Pick the day and time that suit you in your calendar. Then request a cleaning whenever you need one.", icon: CalendarDays },
  { t: "Make your first request", d: `You pay the ${price} membership with your first request. It then renews on the same day each month.`, icon: Wallet },
  { t: "We match you and call you", d: "We choose a regular cleaner and a backup near your home, and call you for a short orientation call.", icon: Users },
  { t: "Pay per hour", d: `Cleaning is ${hourlyRate} per hour. If your regular cleaner cannot make it, your backup steps in.`, icon: Coins },
];

export default function Home() {
  return (
    <main>
      <Hero
        tall image="/images/home-hero.jpg" position="object-[68%_center] md:object-center"
        eyebrow="Regular cleaning in Amsterdam"
        title={<>Your regular cleaner, <em className="font-normal italic text-mint">matched to your home.</em></>}
        text={`Create a free account and set your regular cleaning day. You pay the ${price} membership only when you make your first cleaning request, then ${hourlyRate} per hour of cleaning.`}
        footer={<ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">{["Free to sign up", "Backup cleaner included", "Breakage cover", "Checked cleaners"].map(t => <li key={t} className="flex items-center gap-2"><BadgeCheck size={16} className="text-mint" aria-hidden="true" />{t}</li>)}</ul>}
      >
        <ButtonLink href="/join">Create free account</ButtonLink>
        <ButtonLink href="/apply" variant="ghost">I&apos;m a cleaner</ButtonLink>
      </Hero>

      {/* Two journeys, one glance */}
      <section aria-label="Choose your journey" className="relative z-10 -mt-16 pb-6 sm:-mt-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { img: "/images/journey-homeowner.jpg", pos: "object-[50%_30%]", alt: "A homeowner relaxing on her sofa in a clean, sunlit living room", tag: "For homeowners", title: "Find a regular cleaner", text: "Create a free account, set your regular cleaning day, and request a cleaning when you need one. We match you with a regular cleaner and a backup.", href: "/join", cta: "Create free account", variant: "primary" as const },
              { img: "/images/journey-cleaner.jpg", pos: "object-[50%_6%]", alt: "A smiling cleaner carrying a cleaning caddy through a bright hallway", tag: "For cleaners", title: "Work as an independent cleaner", text: "Apply, meet us on video, and we introduce you to households near you in Amsterdam.", href: "/apply", cta: "Work as a cleaner", variant: "dark" as const },
            ].map((j, i) => (
              <Reveal key={j.href} delay={i * 120}>
                <article className="group overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_60px_-30px_rgba(4,38,44,.45)] transition duration-500 hover:-translate-y-1.5">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={j.img} alt={j.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-cover ${j.pos} transition duration-[1200ms] group-hover:scale-105`} />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-deep backdrop-blur">{j.tag}</span>
                  </div>
                  <div className="p-7 sm:p-8">
                    <h2 className="text-3xl font-medium">{j.title}</h2>
                    <p className="mb-6 mt-3 leading-relaxed text-muted">{j.text}</p>
                    <ButtonLink href={j.href} variant={j.variant}>{j.cta}</ButtonLink>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Section id="why">
        <SectionTitle eyebrow="Why Amsta Clean" title="Regular cleaning without the hassle of finding it." intro="We take care of the matching, the backup and the checks, so you can simply come home to a clean house." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((f, i) => <Reveal key={f.t} delay={(i % 3) * 90}><Card icon={f.icon} className="h-full"><h3 className="mb-2 text-xl font-medium">{f.t}</h3><p className="leading-relaxed text-muted">{f.d}</p></Card></Reveal>)}
        </div>
        <p className="mt-8 text-sm text-muted">Full breakage cover conditions will be published before launch.</p>
      </Section>

      <Section id="how-it-works" tone="white">
        <SectionTitle eyebrow="How it works" title="From sign-up to a clean home in five steps." center />
        <Steps steps={steps} />
        <Reveal className="mt-14 text-center"><ButtonLink href="/join">Create free account</ButtonLink></Reveal>
      </Section>

      <Section id="pricing" tone="dark">
        <SectionTitle dark eyebrow="Pricing" title="Free to join. Two simple prices after that." intro="Creating an account costs nothing. You pay the membership with your first cleaning request, and it renews on the same day each month. Then you pay only for the hours your cleaner works." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { big: "Free", unit: "to sign up", title: "Your account", items: ["Create your account at no cost", "Set your regular cleaning schedule", "No payment until you make a cleaning request"] },
            { big: price, unit: "per month", title: "Membership", items: ["Paid with your first cleaning request", "Then renewed on the same day each month", "A regular cleaner, a backup and breakage cover"] },
            { big: hourlyRate, unit: "per hour", title: "Cleaning", items: ["Pay only for the hours your cleaner works", "Your regular cleaner, every visit", "No hidden fees"] },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 110}>
              <div className="h-full rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-mint">{p.title}</p>
                <p className="mt-3 font-heading text-6xl font-medium">{p.big}<span className="ml-2 font-sans text-base font-normal text-white/70">{p.unit}</span></p>
                <div className="mt-7"><Checklist dark items={p.items} /></div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm text-white/65">Online payment is coming soon. Until then we contact you with payment details after your first request.</p>
      </Section>

      <Section id="vetting">
        <SectionTitle eyebrow="Trust" title="Every cleaner is checked before they start." intro="You let someone into your home, so we do not skip the basics." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ClipboardList, t: "They apply", d: "Cleaners tell us about their experience, availability and where they live." },
            { icon: Video, t: "We meet them on video", d: "Every applicant has a video interview with our team." },
            { icon: FileCheck, t: "We check their documents", d: "Cleaners submit identity documents, which are stored securely and used only for verification." },
          ].map((s, i) => <Reveal key={s.t} delay={i * 100}><Card icon={s.icon} className="h-full"><h3 className="mb-2 text-xl font-medium">{s.t}</h3><p className="leading-relaxed text-muted">{s.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <Section id="for-cleaners" tone="sand">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">For cleaners</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">Looking for cleaning work? We bring the customers to you.</h2>
            <p className="mb-8 mt-5 text-lg leading-relaxed text-muted">Work as an independent cleaner. We match you with households in Amsterdam, so you spend your time cleaning, not searching.</p>
            <ButtonLink href="/apply" variant="dark">Work as a cleaner</ButtonLink>
          </Reveal>
          <Reveal delay={120}>
            <Card hover={false} className="!p-9"><Checklist items={["Choose your own area, days and hours", "Households matched near where you live", "A clear process: apply, video interview, document check, start", "Support from our team when you need it"]} /></Card>
          </Reveal>
        </div>
      </Section>

      <Section id="faq" tone="white">
        <SectionTitle eyebrow="Questions" title="Good to know before you start." center />
        <FaqList faqs={homeownerFaqs} />
        <FaqJsonLd faqs={homeownerFaqs} />
      </Section>

      <CtaBand title={<>Ready for a regular cleaner you can rely on?</>} text="Create your free account in two minutes. You pay nothing until you make your first cleaning request." primary={{ href: "/join", label: "Create free account" }} secondary={{ href: "/apply", label: "I'm a cleaner" }} />
    </main>
  );
}
