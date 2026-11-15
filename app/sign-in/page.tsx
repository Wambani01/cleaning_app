import Link from "next/link";
import { Building2, Sparkles, User } from "lucide-react";
import { Card, Container } from "@/components/ui";
export const metadata = { title: "Sign in" };

export default function SignInHub() {
  return (
    <main className="py-14"><Container>
      <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
      <p className="mb-8 text-muted">Choose the account you have with us.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <Card icon={User}>
          <h2 className="mb-1 text-xl font-bold">I need regular cleaning</h2>
          <p className="mb-4 text-sm text-muted">Customer portal</p>
          <div className="flex flex-wrap gap-3"><Link href="/customer/sign-in" className="rounded-lg bg-primary px-4 py-2 font-bold text-ink hover:bg-mint">Sign in</Link><Link href="/customer/sign-up" className="rounded-lg border border-line px-4 py-2 font-semibold">Create account</Link></div>
        </Card>
        <Card icon={Sparkles}>
          <h2 className="mb-1 text-xl font-bold">I work as a cleaner</h2>
          <p className="mb-4 text-sm text-muted">Cleaner portal</p>
          <div className="flex flex-wrap gap-3"><Link href="/cleaner/sign-in" className="rounded-lg bg-primary px-4 py-2 font-bold text-ink hover:bg-mint">Sign in</Link><Link href="/cleaner/sign-up" className="rounded-lg border border-line px-4 py-2 font-semibold">Create account</Link></div>
        </Card>
      </div>
      <p className="mt-8 flex items-center gap-2 text-sm text-muted"><Building2 size={16} aria-hidden="true" /> Amsta Clean staff? <Link className="text-primary-dark underline" href="/admin/sign-in">Admin sign-in</Link></p>
    </Container></main>
  );
}
