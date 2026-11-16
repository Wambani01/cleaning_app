import type { Metadata } from "next";
import { Suspense } from "react";
import { BadgeCheck, CalendarDays, Check, ClipboardList, Clock, Coins, Repeat, ShieldCheck, Users, Wallet, X, Home as HomeIcon, UserCheck } from "lucide-react";
import { ButtonLink, Card, hourlyRate, price } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { Checklist, FaqJsonLd, FaqList, Section, SectionTitle, Steps, type Step } from "@/components/sections";
import { SignUpForm } from "@/components/auth-forms";
import { homeownerFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Find a regular cleaner in Amsterdam",
  description: `Create a free account, set your regular cleaning day and request a cleaning when you need one. We match you with a vetted regular cleaner and a backup. ${price} membership with your first request, then ${hourlyRate} per hour.`,
  alternates: { canonical: "/join" },
  openGraph: { images: [{ url: "/images/join-hero.jpg", width: 1920, height: 1080, alt: "A cleaner wiping a sunlit kitchen worktop in an Amsterdam home" }] },
};

const steps: Step[] = [
  { t: "Create a free account", d: "Tell us your address and phone number. It costs nothing.", icon: ClipboardList },
  { t: "Set your regular schedule", d: "Pick the day and time that suit you in your calendar. Then request a cleaning whenever you need one.", icon: CalendarDays },
  { t: "Make your first request", d: `You pay the ${price} membership with your first request. It then renews on the same day each month.`, icon: Wallet },
  { t: "We match you and call you", d: "We choose a regular cleaner and a backup near your home, and call you for a short orientation call.", icon: Users },
  { t: "Pay per hour", d: `Cleaning is ${hourlyRate} per hour. If your regular cleaner cannot make it, your backup steps in.`, icon: Coins },
];

const before = ["Scrolling through ads and profiles", "Not knowing who is turning up at your door", "Starting again when your cleaner cancels", "Wondering who pays if something breaks"];
const after = ["We do the matching for you", "Cleaners are interviewed and document-checked", "A backup cleaner is part of your membership", "Breakage cover is included"];

const why = [
  { icon: Clock, t: "You stay in control", d: "Set your regular cleaning day in a calendar, then request a cleaning whenever you need your cleaner. No commitment to a fixed schedule." },
  { icon: Repeat, t: "You are never left without", d: "Your regular cleaner has a backup lined up for the days they cannot come." },
  { icon: ShieldCheck, t: "Peace of mind at home", d: "Cleaners are checked before they start, and accidental breakage during a visit is covered." },
  { icon: Coins, t: "Free to start, clear after that", d: `Signing up is free. The ${price} membership is paid with your first request and renews on the same day each month, plus ${hourlyRate} per hour of cleaning.` },
];

export default function FindACleaner() {
  return (
    <main>
      <Hero
        image="/images/join-hero.jpg" position="object-[72%_center] md:object-center"
        eyebrow="For homeowners"
        title={<>Find a regular cleaner <em className="font-normal italic text-mint">you can rely on.</em></>}
        text={`Skip the searching. Create a free account, set your regular cleaning day and request a cleaning when you need one. We match your home with a vetted regular cleaner and a backup. You pay the ${price} membership only with your first request, then ${hourlyRate} per hour.`}
        footer={<p className="text-sm text-white/80">Free to sign up. No payment until your first cleaning request.</p>}
      >
        <ButtonLink href="#start">Create free account</ButtonLink>
        <ButtonLink href="#how-it-works" variant="ghost" arrow={false}>See how it works</ButtonLink>
      </Hero>

      <Section>
        <SectionTitle eyebrow="The problem, and the fix" title="Finding good cleaning help is harder than it should be." intro="Most people end up searching, guessing and hoping. We took that work out." />
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[2rem] border border-line bg-sand p-8 sm:p-10">
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.14em] text-muted">The usual way</p>
              <ul className="grid gap-4">{before.map(t => <li key={t} className="flex items-start gap-3 text-muted"><span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white text-accent"><X size={14} strokeWidth={3} aria-hidden="true" /></span>{t}</li>)}</ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-[2rem] bg-primary-deep p-8 text-white shadow-[0_30px_60px_-30px_rgba(4,38,44,.6)] sm:p-10">
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.14em] text-mint">With Amsta Clean</p>
              <ul className="grid gap-4">{after.map(t => <li key={t} className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-mint/25 text-mint"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>{t}</li>)}</ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="how-it-works" tone="white">
        <SectionTitle eyebrow="How it works" title="Five steps from sign-up to a clean home." center />
        <Steps steps={steps} />
      </Section>

      <Section id="why">
        <SectionTitle eyebrow="Why use Amsta Clean" title="Less effort for you. More certainty at home." />
        <div className="grid gap-6 sm:grid-cols-2">
          {why.map((w, i) => <Reveal key={w.t} delay={(i % 2) * 100}><Card icon={w.icon} className="h-full"><h3 className="mb-2 text-2xl font-medium">{w.t}</h3><p className="leading-relaxed text-muted">{w.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <Section id="matching" tone="sand">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">Finding the right cleaner</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">We choose carefully, so you do not have to.</h2>
            <p className="mb-8 mt-5 text-lg leading-relaxed text-muted">You do not scroll through profiles. Our team picks the cleaner who fits your home, and tells you who they are.</p>
            <Checklist items={["Close to your home, based on your address", "Interviewed on video and document-checked by us", "A regular cleaner plus a backup, so you are covered", "Your wishes are discussed on the orientation call"]} />
          </Reveal>

          {/* Illustration of the customer's account. Marked as an example, not a real person. */}
          <Reveal delay={140} className="mx-auto w-full max-w-md">
            <div className="float-soft relative rounded-[2rem] border border-line bg-white p-6 shadow-[0_40px_80px_-30px_rgba(4,38,44,.45)]">
              <span className="absolute -top-3 right-6 rounded-full bg-ink-deep px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white">Example</span>
              <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary-dark"><HomeIcon size={22} aria-hidden="true" /></span><div><p className="font-semibold">Your cleaning</p><p className="text-sm text-muted">Amsterdam Centrum</p></div></div>
              {[["Regular cleaner", "Ewa", Users], ["Backup cleaner", "Sofia", Repeat]].map(([label, name, Icon]) => {
                const I = Icon as typeof Users;
                return (
                  <div key={label as string} className="mb-3 flex items-center gap-4 rounded-2xl bg-surface p-4">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary text-lg font-bold text-ink-deep">{(name as string)[0]}</span>
                    <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-muted">{label as string}</p><p className="text-lg font-semibold">{name as string}</p></div>
                    <I size={20} className="text-primary-dark" aria-hidden="true" />
                  </div>
                );
              })}
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm"><UserCheck size={18} className="text-primary-dark" aria-hidden="true" />Interviewed and document-checked</p>
              <p className="mt-2 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm"><BadgeCheck size={18} className="text-primary-dark" aria-hidden="true" />Breakage cover included</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="faq" tone="white">
        <SectionTitle eyebrow="Questions" title="Things homeowners ask us." center />
        <FaqList faqs={homeownerFaqs} />
        <FaqJsonLd faqs={homeownerFaqs} />
      </Section>

      <Section id="start" tone="dark">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-mint">Get started</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">Create your free account and find your regular cleaner.</h2>
            <p className="mb-8 mt-5 max-w-md text-lg leading-relaxed text-white/80">Tell us where you need cleaning and set your regular day. When you make your first request we match you with a regular cleaner and a backup, and call you for a short orientation call.</p>
            <div className="max-w-md rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-sm">
              <p className="font-heading text-5xl font-medium">Free<span className="ml-2 font-sans text-base font-normal text-white/70">to sign up</span></p>
              <p className="mb-5 mt-1 text-white/80">Then, with your first cleaning request:</p>
              <Checklist dark items={[`${price} per month membership, renewing on the same day each month`, `${hourlyRate} per hour of cleaning`, "A backup cleaner if yours is unavailable", "Breakage cover for accidental damage"]} />
              <p className="mt-5 border-t border-white/15 pt-4 text-sm text-white/75">Online payment is coming soon. Until then we contact you with payment details after your first request.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-[2rem] bg-white p-7 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] sm:p-10">
              <h2 className="mb-1 text-2xl font-medium">Create your free account</h2>
              <p className="mb-6 text-sm text-muted">Takes about two minutes.</p>
              <Suspense><SignUpForm portal="customer" withAddress /></Suspense>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
