import { Suspense } from "react";
import { Card, Container, hourlyRate, price } from "@/components/ui";
import { SignUpForm } from "@/components/auth-forms";
export const metadata = { title: "I need regular cleaning" };

export default function Join() {
  return (
    <main className="py-14"><Container>
      <h1 className="mb-2 text-3xl font-bold">I need regular cleaning</h1>
      <p className="mb-8 max-w-2xl text-muted">Create your account and tell us where you need cleaning. We will match you with a regular cleaner and a backup, and contact you for a short orientation call.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card hover={false}>
          <div className="text-4xl font-extrabold text-primary-dark">{price}<span className="text-base font-normal text-muted"> / month</span></div>
          <div className="mt-1 text-lg font-semibold">+ {hourlyRate} per hour of cleaning</div>
          <ul className="my-4 list-disc space-y-1 pl-5"><li>Regular cleaner at {hourlyRate} per hour</li><li>Backup cleaner if yours is unavailable</li><li>Breakage insurance</li></ul>
          <p className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">You will not be charged today. Online payment is coming soon.</p>
        </Card>
        <div>
          <h2 className="mb-4 text-xl font-bold">Create your customer account</h2>
          <Suspense><SignUpForm portal="customer" withAddress /></Suspense>
        </div>
      </div>
    </Container></main>
  );
}
