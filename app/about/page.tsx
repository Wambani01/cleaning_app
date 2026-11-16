import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Eye, HandCoins, Users, ShieldCheck, Home as HomeIcon, Sparkles } from "lucide-react";
import { Card, price, hourlyRate } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { CtaBand, Section, SectionTitle } from "@/components/sections";

export const metadata: Metadata = {
  title: "About us",
  description: "Amsta Clean connects Amsterdam homeowners with vetted regular cleaners, and gives independent cleaners customers close to home.",
  alternates: { canonical: "/about" },
  openGraph: { images: [{ url: "/images/about-hero.jpg", width: 1920, height: 1080, alt: "An Amsterdam canal at golden hour" }] },
};

const principles = [
  { icon: Users, t: "We do the matching", d: "Homeowners should not have to compare strangers, and cleaners should not have to chase customers. Our team makes each match by hand." },
  { icon: ShieldCheck, t: "We check before we introduce", d: "Every cleaner applies, has a video interview with us and submits identity documents before they are approved." },
  { icon: Eye, t: "We are clear about prices", d: `${price} a month and ${hourlyRate} per hour of cleaning. You see the numbers before you sign up.` },
  { icon: HandCoins, t: "We plan for things going wrong", d: "A backup cleaner is part of every membership, and breakage cover applies to accidental damage during a visit." },
];

export default function About() {
  return (
    <main>
      <Hero
        image="/images/about-hero.jpg" position="object-[30%_center] md:object-center"
        eyebrow="About Amsta Clean"
        title={<>Regular cleaning, made <em className="font-normal italic text-mint">simple for Amsterdam.</em></>}
        text="We connect homeowners who want a cleaner they can rely on with independent cleaners who want steady work close to home."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <SectionTitle eyebrow="What we do" title="A platform that brings two sides together." />
          <Reveal delay={100}>
            <div className="grid gap-5 text-lg leading-relaxed text-muted">
              <p>Amsta Clean helps households in Amsterdam find affordable, reliable regular cleaners. For a monthly membership you are matched with a vetted regular cleaner, a backup cleaner for the days your regular cleaner is unavailable, and breakage cover. You then pay an hourly rate for the cleaning.</p>
              <p>For cleaners, we are a way to find regular customers near home. Cleaners join as independent freelancers, choose their own days and hours, and we find the households and make the match.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="sand">
        <SectionTitle eyebrow="Two sides, one platform" title="Built for the people on both sides of the door." center />
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal><Card icon={HomeIcon} className="h-full"><h3 className="mb-2 text-2xl font-medium">For homeowners</h3><p className="mb-5 leading-relaxed text-muted">Create an account and tell us where you live. We find you a regular cleaner and a backup, and call you before the first visit.</p><Link href="/join" className="inline-flex items-center gap-1.5 font-semibold text-primary-dark underline-offset-4 hover:underline">I need regular cleaning <ArrowUpRight size={18} aria-hidden="true" /></Link></Card></Reveal>
          <Reveal delay={120}><Card icon={Sparkles} className="h-full"><h3 className="mb-2 text-2xl font-medium">For cleaners</h3><p className="mb-5 leading-relaxed text-muted">Apply, meet us on video, and we introduce you to households near you. You stay independent and choose your own availability.</p><Link href="/apply" className="inline-flex items-center gap-1.5 font-semibold text-primary-dark underline-offset-4 hover:underline">Work as a cleaner <ArrowUpRight size={18} aria-hidden="true" /></Link></Card></Reveal>
        </div>
      </Section>

      <Section>
        <SectionTitle eyebrow="How we work" title="Four things we hold ourselves to." />
        <div className="grid gap-6 sm:grid-cols-2">
          {principles.map((p, i) => <Reveal key={p.t} delay={(i % 2) * 100}><Card icon={p.icon} className="h-full"><h3 className="mb-2 text-2xl font-medium">{p.t}</h3><p className="leading-relaxed text-muted">{p.d}</p></Card></Reveal>)}
        </div>
      </Section>

      <CtaBand title="Whichever side you are on, getting started is simple." primary={{ href: "/join", label: "I need regular cleaning" }} secondary={{ href: "/apply", label: "Work as a cleaner" }} />
    </main>
  );
}
