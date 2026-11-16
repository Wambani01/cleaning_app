import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Container, hourlyRate, price } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { Checklist } from "@/components/sections";
import { SignUpForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Create your free account",
  description: `Create a free account, set your regular cleaning day and request a cleaning when you need one. You pay the ${price} membership only with your first request.`,
  alternates: { canonical: "/join" },
};

/** A short, focused page for signing up. The full story lives at /i-need-a-cleaner. */
export default function Join() {
  return (
    <main>
      <div className="relative isolate overflow-hidden bg-ink-deep py-16 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_85%_0%,rgba(16,177,199,.35),transparent_70%),radial-gradient(50%_80%_at_0%_100%,rgba(7,97,112,.7),transparent_70%)]" aria-hidden="true" />
        <Container>
          <p className="rise mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-ink-deep/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-mint">Free to sign up</p>
          <h1 className="rise max-w-3xl text-4xl font-medium leading-[1.08] sm:text-6xl" style={{ "--d": "120ms" } as React.CSSProperties}>Create your free account.</h1>
          <p className="rise mt-5 max-w-2xl text-lg text-white/85" style={{ "--d": "240ms" } as React.CSSProperties}>Tell us where you live and set your regular cleaning day. You pay nothing until you make your first cleaning request.</p>
        </Container>
      </div>

      <section className="bg-surface py-14 sm:py-20"><Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="rounded-3xl border border-line bg-white p-7 shadow-card">
              <p className="font-heading text-5xl font-medium text-primary-dark">Free<span className="ml-2 font-sans text-base font-normal text-muted">to sign up</span></p>
              <p className="mb-5 mt-1 text-muted">Then, with your first cleaning request:</p>
              <Checklist items={[`${price} membership, renewing 30 days after each payment`, `${hourlyRate} per hour of cleaning`, "A regular cleaner and a backup near your home", "Breakage cover for accidental damage"]} />
              <p className="mt-5 border-t border-line pt-4 text-sm text-muted">Online payment is coming soon. Until then we contact you with payment details after your first request.</p>
            </div>
            <Link href="/i-need-a-cleaner" className="group mt-6 inline-flex items-center gap-2 font-semibold text-primary-dark underline-offset-4 hover:underline">See how it works <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" /></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-[2rem] bg-white p-7 shadow-[0_40px_80px_-40px_rgba(4,38,44,.5)] sm:p-10" id="start">
              <h2 className="mb-1 text-2xl font-medium">Create your free account</h2>
              <p className="mb-6 text-sm text-muted">Takes about two minutes.</p>
              <Suspense><SignUpForm portal="customer" withAddress /></Suspense>
            </div>
          </Reveal>
        </div>
      </Container></section>
    </main>
  );
}
