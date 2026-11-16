import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Sparkles, User } from "lucide-react";
import { Card, Container } from "@/components/ui";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInHub() {
  return (
    <main className="bg-sand">
      <div className="relative isolate overflow-hidden bg-ink-deep py-14 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_85%_0%,rgba(16,177,199,.35),transparent_70%)]" aria-hidden="true" />
        <Container><h1 className="rise text-4xl font-medium sm:text-5xl">Sign in</h1><p className="rise mt-3 text-lg text-white/80" style={{ "--d": "120ms" } as React.CSSProperties}>Choose the account you have with us.</p></Container>
      </div>
      <div className="py-14"><Container>
        <div className="grid gap-6 md:grid-cols-2">
          <Card icon={User}>
            <h2 className="mb-1 text-2xl font-medium">I need regular cleaning</h2>
            <p className="mb-5 text-sm text-muted">Customer portal</p>
            <div className="flex flex-wrap gap-3"><Link href="/customer/sign-in" className="rounded-full bg-primary px-5 py-2.5 font-bold text-ink-deep hover:bg-mint">Sign in</Link><Link href="/customer/sign-up" className="rounded-full border border-line px-5 py-2.5 font-semibold hover:border-primary">Create free account</Link></div>
          </Card>
          <Card icon={Sparkles}>
            <h2 className="mb-1 text-2xl font-medium">I work as a cleaner</h2>
            <p className="mb-5 text-sm text-muted">Cleaner portal</p>
            <div className="flex flex-wrap gap-3"><Link href="/cleaner/sign-in" className="rounded-full bg-primary px-5 py-2.5 font-bold text-ink-deep hover:bg-mint">Sign in</Link><Link href="/cleaner/sign-up" className="rounded-full border border-line px-5 py-2.5 font-semibold hover:border-primary">Create account</Link></div>
          </Card>
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-muted"><Building2 size={16} aria-hidden="true" /> Amsta Clean staff? <Link className="text-primary-dark underline" href="/admin/sign-in">Admin sign-in</Link></p>
      </Container></div>
    </main>
  );
}
