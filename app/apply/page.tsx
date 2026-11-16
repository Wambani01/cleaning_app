import type { Metadata } from "next";
import { BadgeCheck, CalendarClock, ClipboardList, FileCheck, HeartHandshake, Headset, IdCard, MapPin, Repeat, Rocket, Send, Users, Video, Home as HomeIcon, Clock3, Smile, Sparkles } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { Checklist, FaqJsonLd, FaqList, Section, SectionTitle, Steps, type Step } from "@/components/sections";
import { ApplicationForm } from "@/components/forms";
import { cleanerFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work as a cleaner in Amsterdam",
  description: "Work as an independent cleaner with customers close to home. Apply, meet us on video, and we match you with households in Amsterdam.",
  alternates: { canonical: "/apply" },
  openGraph: { images: [{ url: "/images/apply-hero.jpg", width: 1920, height: 1080, alt: "A cleaner standing confidently in a bright modern home, holding a cleaning caddy" }] },
};

const opportunities = [
  { icon: MapPin, t: "Households near you", d: "We match you with homes close to where you live, so you spend less time travelling and more time working." },
  { icon: Repeat, t: "Regular customers", d: "Households sign up for regular cleaning. You can be matched as a regular cleaner, or as the backup." },
  { icon: HeartHandshake, t: "We do the finding", d: "No ads, no chasing. We find the customers and handle the matching, so you can concentrate on the work." },
];

const steps: Step[] = [
  { t: "Apply online", d: "Fill in the short form below. It takes about five minutes.", icon: Send },
  { t: "We review your application", d: "We check your area, experience and availability and reply by email or phone.", icon: ClipboardList },
  { t: "Video interview", d: "A friendly video call to get to know you, explain how we work and answer your questions.", icon: Video },
  { t: "Submit your documents", d: "After the interview you get a secure link to upload your ID and other documents. Never send them by email.", icon: IdCard },
  { t: "Verification and approval", d: "We check your documents. Once approved, you set your availability.", icon: BadgeCheck },
  { t: "Your first customers", d: "We match you with households nearby and your cleaner account shows who and where, before you go.", icon: Rocket },
];

const benefits = [
  { icon: CalendarClock, t: "Be your own boss", d: "You work as an independent freelancer. You decide which days and hours you work and which jobs you accept." },
  { icon: MapPin, t: "Work close to home", d: "We match you with households in your own area." },
  { icon: Users, t: "Customers found for you", d: "We find the customers and handle the matching. You do not need to advertise." },
  { icon: Clock3, t: "Matches that fit your week", d: "You tell us when you are available and we only offer matches that fit." },
  { icon: Repeat, t: "A safety net for missed visits", d: "If you cannot make a visit, tell us. We arrange the customer's backup cleaner so the visit is covered." },
  { icon: Headset, t: "A team behind you", d: "Questions, or a difficult moment with a customer? You can reach us." },
];

const needs = [
  "Aged 18 or older",
  "Registered, or willing to register, as self-employed with the Dutch Chamber of Commerce (KvK)",
  "The right to live in the Netherlands and to work as a self-employed person",
  "Some cleaning experience, or a real willingness to learn",
  "A phone with internet, for messages and your schedule",
  "Basic Dutch or English, enough to talk with customers and our team",
];
const documents = [
  "A valid passport, ID card or residence permit",
  "Your KvK registration number and VAT number (BTW-id)",
  "Your citizen service number (BSN)",
  "Bank details (IBAN) for payment",
  "Proof of liability insurance, if you have it",
  "A certificate of conduct (VOG) if we ask for one",
];
const qualities = [
  { icon: Clock3, t: "Reliable and on time" },
  { icon: HomeIcon, t: "Respectful of people's homes" },
  { icon: Sparkles, t: "Careful and thorough" },
  { icon: Smile, t: "Friendly and clear" },
];

export default function WorkAsACleaner() {
  return (
    <main>
      <Hero
        image="/images/apply-hero.jpg" position="object-[74%_center] md:object-center"
        eyebrow="For cleaners"
        title={<>Work as a cleaner, with <em className="font-normal italic text-mint">customers close to home.</em></>}
        text="Join Amsta Clean as an independent cleaner. We find households in Amsterdam and match them with you, so you can spend your time doing what you do best."
        footer={<p className="text-sm text-white/80">You are not asked to pay to apply.</p>}
      >
        <ButtonLink href="#apply-form">Work as a cleaner</ButtonLink>
        <ButtonLink href="#how-it-works" variant="ghost" arrow={false}>See how it works</ButtonLink>
      </Hero>

      <Section>
        <SectionTitle eyebrow="The opportunity" title="More cleaning opportunities, without chasing customers." intro="Homeowners in Amsterdam come to us looking for a regular cleaner. Once you are approved, we introduce you to households near you." />
        <div className="grid gap-6 md:grid-cols-3">
          {opportunities.map((o, i) => <Reveal key={o.t} delay={i * 100}><Card icon={o.icon} className="h-full"><h3 className="mb-2 text-2xl font-medium">{o.t}</h3><p className="leading-relaxed text-muted">{o.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <Section id="how-it-works" tone="white">
        <SectionTitle eyebrow="How joining works" title="Six clear steps from application to first customer." center />
        <Steps steps={steps} />
        <Reveal className="mx-auto mt-14 max-w-2xl rounded-3xl border border-primary/25 bg-primary/10 p-7 text-center">
          <p className="text-lg font-medium">After a match</p>
          <p className="mt-2 leading-relaxed text-muted">Your cleaner account shows each household you are matched with: the first name, the address, and whether you are the regular cleaner or the backup. We stay in touch from there.</p>
        </Reveal>
      </Section>

      <Section id="why">
        <SectionTitle eyebrow="Why join" title="Independent work, with the finding done for you." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => <Reveal key={b.t} delay={(i % 3) * 90}><Card icon={b.icon} className="h-full"><h3 className="mb-2 text-xl font-medium">{b.t}</h3><p className="leading-relaxed text-muted">{b.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <Section id="who" tone="sand">
        <SectionTitle eyebrow="Who can join" title="What we look for, and what you will need." intro="Homeowners are inviting you into their home. These are the qualities and requirements that matter." />
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {qualities.map((q, i) => { const Icon = q.icon; return (
            <Reveal key={q.t} delay={i * 80}><div className="flex h-full flex-col items-center rounded-3xl bg-white p-6 text-center shadow-card"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary-dark"><Icon size={24} aria-hidden="true" /></span><p className="font-medium">{q.t}</p></div></Reveal>
          ); })}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal><Card hover={false} icon={BadgeCheck} className="h-full"><h3 className="mb-5 text-2xl font-medium">Requirements</h3><Checklist items={needs} /></Card></Reveal>
          <Reveal delay={100}><Card hover={false} icon={FileCheck} className="h-full"><h3 className="mb-5 text-2xl font-medium">Documents you will need</h3><Checklist items={documents} /><p className="mt-5 text-sm text-muted">We confirm the exact list in the interview.</p></Card></Reveal>
        </div>
      </Section>

      <Section id="faq" tone="white">
        <SectionTitle eyebrow="Questions" title="Things cleaners ask us." center />
        <FaqList faqs={cleanerFaqs} />
        <FaqJsonLd faqs={cleanerFaqs} />
      </Section>

      <Section id="apply-form" tone="dark">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-mint">Get started</p>
            <h2 className="text-4xl font-medium leading-[1.1] sm:text-5xl">Ready to find customers near you?</h2>
            <p className="mb-8 mt-5 max-w-md text-lg leading-relaxed text-white/80">Tell us a little about yourself. We will contact you to arrange a video interview.</p>
            <div className="max-w-md rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-sm">
              <p className="mb-4 font-semibold text-mint">What happens next</p>
              <Checklist dark items={["We review your application", "A short video interview", "A secure link to upload your documents", "Approval, then your first matches"]} />
              <p className="mt-5 border-t border-white/15 pt-4 text-sm text-white/75">Never send ID documents by email. We give you a secure upload link after the interview.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-[2rem] bg-white p-7 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] sm:p-10">
              <h2 className="mb-1 text-2xl font-medium">Apply now</h2>
              <p className="mb-6 text-sm text-muted">Takes about five minutes.</p>
              <ApplicationForm />
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
