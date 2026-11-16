import type { Metadata } from "next";
import Link from "next/link";
import {
  AppWindow, Bath, BedDouble, BellRing, Brush, CalendarDays, CircleCheckBig, ClipboardList, Clock, Coins, FileCheck, Hourglass, Home as HomeIcon, KeyRound, ListChecks, MapPin, PawPrint,
  Refrigerator, Repeat, Send, ShieldCheck, Shirt, Sofa, Sparkles, Sun, UserCheck, Users, UtensilsCrossed, Video, Wallet, Wind, X, Check, BadgeCheck, type LucideIcon,
} from "lucide-react";
import { ButtonLink, Card, HOURLY_EUR, MEMBERSHIP_EUR, hourlyRate, price } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { Checklist, CtaBand, FaqJsonLd, FaqList, Section, SectionTitle, Steps, type Step } from "@/components/sections";
import { TASKS } from "@/lib/request-details";
import { homeownerFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "I need a cleaner in Amsterdam",
  description: `Looking for a cleaner you can rely on? Create a free account and request a cleaning. We match you with a vetted regular cleaner and a backup. ${price} membership with your first request, then ${hourlyRate} per hour.`,
  alternates: { canonical: "/i-need-a-cleaner" },
  openGraph: { images: [{ url: "/images/join-hero.jpg", width: 1920, height: 1080, alt: "A cleaner wiping a sunlit kitchen worktop in an Amsterdam home" }] },
};

const taskIcon: Record<string, LucideIcon> = {
  kitchen: UtensilsCrossed, oven_fridge: Refrigerator, windows: AppWindow, bathrooms: Bath, bedrooms: BedDouble, living: Sofa, floors: Brush, dusting: Wind, balcony: Sun, laundry: Shirt, ironing: Sparkles,
};

const before = ["Scrolling through ads and profiles", "Not knowing who is turning up at your door", "Starting again when your cleaner cancels", "Wondering who pays if something breaks"];
const after = ["We do the matching for you", "Cleaners are interviewed and document-checked", "A backup cleaner is part of your membership", "Breakage cover is included"];

const steps: Step[] = [
  { t: "Create a free account", d: "Tell us your address and phone number. It costs nothing.", icon: ClipboardList },
  { t: "Set your regular schedule", d: "Pick the day and time that suit you in your calendar. Then request a cleaning whenever you need one.", icon: CalendarDays },
  { t: "Make your first request", d: `You pay the ${price} membership with your first request. It then renews 30 days after each payment.`, icon: Wallet },
  { t: "We match you and call you", d: "We choose a regular cleaner and a backup near your home, and call you for a short orientation call.", icon: Users },
  { t: "Pay per hour", d: `Cleaning is ${hourlyRate} per hour. If your regular cleaner cannot make it, your backup steps in.`, icon: Coins },
];

const requestFlow = [
  { icon: Send, t: "You send a request", d: "Choose the date, the start time, how many hours you need, and what should be cleaned." },
  { icon: BellRing, t: "It goes to your cleaner", d: "Your regular cleaner gets the request and accepts or declines it." },
  { icon: Repeat, t: "No answer, or a no?", d: "We find another cleaner for that day, often your backup, and ask them instead." },
  { icon: CircleCheckBig, t: "We confirm it", d: "Once a cleaner has accepted and your membership is paid, your cleaning is confirmed." },
  { icon: Hourglass, t: "You pay for the hours", d: `After the cleaning you pay ${hourlyRate} for each hour your cleaner worked.` },
];

const goodFor = [
  { icon: Clock, t: "Busy weeks", d: "Set a regular slot once, and ask for a cleaning only when you need it. No back and forth to arrange it." },
  { icon: Users, t: "The same face every time", d: "You get a regular cleaner who learns your home, instead of someone new at every visit." },
  { icon: ShieldCheck, t: "Peace of mind", d: "Cleaners are interviewed and document-checked, and a backup covers the days your cleaner cannot come." },
  { icon: PawPrint, t: "Homes with pets or special wishes", d: "Tell us about pets, supplies and anything else in the request, and your cleaner sees it before they arrive." },
];

const trust = [
  { icon: ClipboardList, t: "They apply", d: "Cleaners tell us about their experience, availability and where they live." },
  { icon: Video, t: "We meet them on video", d: "Every applicant has a video interview with our team." },
  { icon: FileCheck, t: "We check their documents", d: "Cleaners submit identity documents, which are stored securely and used only for verification." },
];

const districts = ["Centrum", "Noord", "Oost", "Zuid", "West", "Nieuw-West", "Zuidoost"];
const examples = [2, 3, 4];

export default function INeedACleaner() {
  return (
    <main>
      <Hero
        image="/images/join-hero.jpg" position="object-[72%_center] md:object-center"
        eyebrow="I need a cleaner"
        title={<>A cleaner you can rely on, <em className="font-normal italic text-mint">found for you.</em></>}
        text={`Create a free account, set your regular cleaning day and request a cleaning when you need one. We match your home with a vetted regular cleaner and a backup. You pay the ${price} membership only with your first request, then ${hourlyRate} per hour.`}
        footer={<ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">{["Free to sign up", "Regular cleaner and a backup", "Breakage cover", "Checked cleaners"].map(t => <li key={t} className="flex items-center gap-2"><BadgeCheck size={16} className="text-mint" aria-hidden="true" />{t}</li>)}</ul>}
      >
        <ButtonLink href="/join">Create free account</ButtonLink>
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
        <SectionTitle eyebrow="How it works" title="From sign-up to a clean home in five steps." center />
        <Steps steps={steps} />
      </Section>

      <Section id="what-we-clean">
        <SectionTitle eyebrow="What we can clean" title="Tell us exactly what you need." intro="When you request a cleaning, you choose from this list and say how many hours you want. Your cleaner sees it all before they arrive." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TASKS.map((t, i) => { const Icon = taskIcon[t.id] ?? Sparkles; return (
            <Reveal key={t.id} delay={(i % 4) * 70}>
              <div className="flex h-full flex-col items-center rounded-3xl border border-line bg-white p-6 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/50">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary-dark"><Icon size={24} aria-hidden="true" /></span>
                <p className="font-medium">{t.label}</p>{t.hint && <p className="mt-1 text-xs text-muted">{t.hint}</p>}
              </div>
            </Reveal>
          ); })}
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-muted"><ListChecks size={16} aria-hidden="true" />You also tell us the type of home, how many bedrooms and bathrooms, and whether there are pets.</p>
      </Section>

      <Section id="after-you-request" tone="sand">
        <SectionTitle eyebrow="After you request" title="What happens to your request." intro="You always know where your cleaning stands. You see whether your cleaner has accepted, right in your account." />
        <ol className="grid gap-5 md:grid-cols-5">
          {requestFlow.map((s, i) => { const Icon = s.icon; return (
            <Reveal as="li" key={s.t} delay={i * 80} className="rounded-3xl bg-white p-6 shadow-card">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary-dark"><Icon size={22} aria-hidden="true" /></span>
              <h3 className="mb-1.5 text-lg font-medium">{s.t}</h3><p className="text-sm leading-relaxed text-muted">{s.d}</p>
            </Reveal>
          ); })}
        </ol>
      </Section>

      <Section id="regular-cleaner">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">Your regular cleaner and a backup</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">The same cleaner, and someone ready when they cannot come.</h2>
            <p className="mb-8 mt-5 text-lg leading-relaxed text-muted">You do not scroll through profiles. Our team picks the cleaner who fits your home and tells you who they are.</p>
            <Checklist items={["Close to your home, based on your address", "Interviewed on video and document-checked by us", "A regular cleaner plus a backup, so you are covered", "Your wishes are discussed on the orientation call"]} />
          </Reveal>
          <Reveal delay={140} className="mx-auto w-full max-w-md">
            <div className="float-soft relative rounded-[2rem] border border-line bg-white p-6 shadow-[0_40px_80px_-30px_rgba(4,38,44,.45)]">
              <span className="absolute -top-3 right-6 rounded-full bg-ink-deep px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white">Example</span>
              <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary-dark"><HomeIcon size={22} aria-hidden="true" /></span><div><p className="font-semibold">Your cleaning</p><p className="text-sm text-muted">Amsterdam Centrum</p></div></div>
              {([["Regular cleaner", "Ewa", Users], ["Backup cleaner", "Sofia", Repeat]] as [string, string, LucideIcon][]).map(([label, name, Icon]) => (
                <div key={label} className="mb-3 flex items-center gap-4 rounded-2xl bg-surface p-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary text-lg font-bold text-ink-deep">{name[0]}</span>
                  <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p><p className="text-lg font-semibold">{name}</p></div>
                  <Icon size={20} className="text-primary-dark" aria-hidden="true" />
                </div>
              ))}
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm"><UserCheck size={18} className="text-primary-dark" aria-hidden="true" />Interviewed and document-checked</p>
              <p className="mt-2 flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm"><CircleCheckBig size={18} className="text-primary-dark" aria-hidden="true" />Accepted by your cleaner</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="pricing" tone="dark">
        <SectionTitle dark eyebrow="Pricing" title="Free to join. Two simple prices after that." intro="Creating an account costs nothing. You pay the membership with your first cleaning request, and it renews 30 days after each payment. Then you pay only for the hours your cleaner works." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { big: "Free", unit: "to sign up", title: "Your account", items: ["Create your account at no cost", "Set your regular cleaning schedule", "No payment until you make a cleaning request"] },
            { big: price, unit: "per 30 days", title: "Membership", items: ["Paid with your first cleaning request", "Then renewed every 30 days", "A regular cleaner, a backup and breakage cover"] },
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
        <Reveal className="mt-10 rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 backdrop-blur-sm">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-mint">What a cleaning costs (examples)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {examples.map(h => (
              <div key={h} className="rounded-2xl bg-white/10 p-5"><p className="text-sm text-white/70">{h} hours of cleaning</p><p className="font-heading text-4xl font-medium">€{h * HOURLY_EUR}</p></div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/75">Plus the {price} membership, paid with your first request and then every 30 days. For example, four 3-hour cleanings in 30 days cost €{MEMBERSHIP_EUR} + 4 × €{3 * HOURLY_EUR} = €{MEMBERSHIP_EUR + 4 * 3 * HOURLY_EUR}. These are examples to help you plan, not a quote.</p>
          <p className="mt-3 text-sm text-white/65">Online payment is coming soon. Until then we contact you with payment details after your first request.</p>
        </Reveal>
      </Section>

      <Section id="good-for">
        <SectionTitle eyebrow="Who it is for" title="Made for homes that want it simple." />
        <div className="grid gap-6 sm:grid-cols-2">
          {goodFor.map((g, i) => <Reveal key={g.t} delay={(i % 2) * 100}><Card icon={g.icon} className="h-full"><h3 className="mb-2 text-2xl font-medium">{g.t}</h3><p className="leading-relaxed text-muted">{g.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <Section id="trust" tone="white">
        <SectionTitle eyebrow="Trust" title="Every cleaner is checked before they start." intro="You let someone into your home, so we do not skip the basics." />
        <div className="grid gap-6 md:grid-cols-3">
          {trust.map((s, i) => <Reveal key={s.t} delay={i * 100}><Card icon={s.icon} className="h-full"><h3 className="mb-2 text-xl font-medium">{s.t}</h3><p className="leading-relaxed text-muted">{s.d}</p></Card></Reveal>)}
        </div>
        <p className="mt-8 flex items-start gap-2 text-sm text-muted"><ShieldCheck size={16} className="mt-0.5 flex-none" aria-hidden="true" />Accidental damage during a visit is covered by the breakage cover that comes with your membership. The full conditions will be published before launch.</p>
      </Section>

      <Section id="areas" tone="sand">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">Where we work</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">Amsterdam, district by district.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">We start in Amsterdam. Enter your postcode when you create your account and we will confirm we can serve your address.</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="flex flex-wrap gap-3">{districts.map(d => <li key={d} className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 font-medium shadow-card"><MapPin size={16} className="text-primary-dark" aria-hidden="true" />{d}</li>)}</ul>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted"><KeyRound size={16} aria-hidden="true" />Tell us how to get in when you request. Your cleaner sees it before they arrive.</p>
          </Reveal>
        </div>
      </Section>

      <Section id="faq" tone="white">
        <SectionTitle eyebrow="Questions" title="Things homeowners ask us." center />
        <FaqList faqs={homeownerFaqs} />
        <FaqJsonLd faqs={homeownerFaqs} />
      </Section>

      <CtaBand title="Ready for a cleaner you can rely on?" text="Create your free account in two minutes. You pay nothing until you make your first cleaning request." primary={{ href: "/join", label: "Create free account" }} secondary={{ href: "/apply", label: "I'm a cleaner" }} />
    </main>
  );
}
