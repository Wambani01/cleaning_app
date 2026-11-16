import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, HelpCircle, Mail, MapPin, Sparkles, Home as HomeIcon } from "lucide-react";
import { Card, company } from "@/components/ui";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { Section } from "@/components/sections";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about regular cleaning, or about working with Amsta Clean as a cleaner? Get in touch.",
  alternates: { canonical: "/contact" },
  openGraph: { images: [{ url: "/images/contact-hero.jpg", width: 1920, height: 1080, alt: "A cup of coffee and a phone on a sunlit window sill overlooking an Amsterdam canal" }] },
};

export default function Contact() {
  return (
    <main>
      <Hero
        image="/images/contact-hero.jpg" position="object-[75%_center] md:object-center"
        eyebrow="Contact"
        title={<>We would love to <em className="font-normal italic text-mint">hear from you.</em></>}
        text="Questions about regular cleaning, or about working with us as a cleaner? Send us a message and a real person will reply."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card hover={false} className="h-full">
              <h2 className="mb-5 text-3xl font-medium">Get in touch</h2>
              <ul className="grid gap-5 text-lg">
                <li className="flex items-start gap-3"><Mail size={22} className="mt-1 flex-none text-primary-dark" aria-hidden="true" /><span><span className="block text-sm font-semibold uppercase tracking-wider text-muted">Email</span><a className="font-medium text-primary-dark underline-offset-4 hover:underline" href={`mailto:${company.email}`}>{company.email}</a></span></li>
                <li className="flex items-start gap-3"><MapPin size={22} className="mt-1 flex-none text-primary-dark" aria-hidden="true" /><span><span className="block text-sm font-semibold uppercase tracking-wider text-muted">Address</span>{company.address}</span></li>
                {company.phone && <li className="flex items-start gap-3"><span><span className="block text-sm font-semibold uppercase tracking-wider text-muted">Phone</span><a className="font-medium text-primary-dark" href={`tel:${company.phone}`}>{company.phone}</a></span></li>}
                <li className="flex items-start gap-3"><Clock3 size={22} className="mt-1 flex-none text-primary-dark" aria-hidden="true" /><span><span className="block text-sm font-semibold uppercase tracking-wider text-muted">Reply time</span>We usually reply within two working days.</span></li>
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid h-full gap-6">
              <Card icon={HomeIcon}><h3 className="mb-1 text-xl font-medium">Homeowners</h3><p className="mb-3 text-sm leading-relaxed text-muted">Want regular cleaning, or have a question about your membership?</p><Link href="/join" className="font-semibold text-primary-dark underline-offset-4 hover:underline">Create free account</Link></Card>
              <Card icon={Sparkles}><h3 className="mb-1 text-xl font-medium">Cleaners</h3><p className="mb-3 text-sm leading-relaxed text-muted">Want to work with us, or checking on your application?</p><Link href="/apply" className="font-semibold text-primary-dark underline-offset-4 hover:underline">Work as a cleaner</Link></Card>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-10 flex items-center gap-3 rounded-3xl border border-line bg-white p-6 shadow-card">
          <HelpCircle size={26} className="flex-none text-primary-dark" aria-hidden="true" />
          <p className="text-muted">Looking for a quick answer? The <Link className="font-semibold text-primary-dark underline-offset-4 hover:underline" href="/join#faq">homeowner FAQ</Link> and <Link className="font-semibold text-primary-dark underline-offset-4 hover:underline" href="/apply#faq">cleaner FAQ</Link> cover the most common questions.</p>
        </Reveal>
      </Section>
    </main>
  );
}
