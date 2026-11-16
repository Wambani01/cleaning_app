import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SignInForm, SignUpForm } from "@/components/auth-forms";
import { portals, type Portal } from "@/lib/portals";

const intro: Record<Portal, string> = {
  customer: "Manage your regular cleaning, your cleaner and your bookings.",
  cleaner: "Follow your application, upload documents and manage your jobs.",
  admin: "Staff only. Admin accounts are created by the owner.",
};

export function SignInPage({ portal }: { portal: Portal }) {
  const cfg = portals[portal];
  return (
    <main className="py-14"><Container>
      <p className="mb-1 text-sm font-bold uppercase tracking-wide text-primary-dark">{cfg.label} portal</p>
      <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
      <p className="mb-6 max-w-md text-muted">{intro[portal]}</p>
      <Suspense><SignInForm portal={portal} /></Suspense>
      <p className="mt-8 text-sm text-muted">Wrong place? <Link className="text-primary-dark underline" href="/sign-in">Choose another sign-in</Link></p>
    </Container></main>
  );
}

export function SignUpPage({ portal }: { portal: Exclude<Portal, "admin"> }) {
  const cfg = portals[portal];
  return (
    <main className="py-14"><Container>
      <p className="mb-1 text-sm font-bold uppercase tracking-wide text-primary-dark">{cfg.label} portal</p>
      <h1 className="mb-6 text-3xl font-bold">Create your {portal === "customer" ? "free " : ""}{cfg.label.toLowerCase()} account</h1>
      <SignUpForm portal={portal} withAddress={portal === "customer"} />
    </Container></main>
  );
}
