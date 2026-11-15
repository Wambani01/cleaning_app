"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerCustomerInterest, validateCustomerDetails, type CustomerDetails } from "@/app/actions";
import { Field, Input } from "@/components/ui";
import { portals, type Portal } from "@/lib/portals";

const btn = "rounded-lg bg-primary px-6 py-3 font-bold text-ink hover:bg-mint disabled:opacity-60";
const errCls = "rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800";

function safeNext(n: string | null, fallback: string) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

export function SignInForm({ portal }: { portal: Portal }) {
  const cfg = portals[portal];
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), cfg.home);
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setPending(true);
    const f = new FormData(e.currentTarget);
    const { data, error } = await authClient.signIn.email({ email: String(f.get("email")), password: String(f.get("password")) });
    if (error || !data) { setPending(false); return setError("Wrong email or password."); }
    if (data.user.role !== cfg.role) {
      // Right password, wrong portal. Sign out again and point them to the right place.
      await authClient.signOut(); setPending(false);
      const own = portals[data.user.role as Portal];
      return setError(own ? `This is a ${own.label.toLowerCase()} account. Please use the ${own.label.toLowerCase()} sign-in.` : "This account cannot use this portal.");
    }
    router.push(next); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4" aria-label={`${cfg.label} sign in`}>
      <Field label="Email"><Input type="email" name="email" required autoComplete="email" /></Field>
      <Field label="Password"><Input type="password" name="password" required autoComplete="current-password" /></Field>
      {error && <p role="alert" className={errCls}>{error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Signing in…" : "Sign in"}</button>
      {cfg.signUp && <p className="text-sm text-muted">No account yet? <Link className="text-primary-dark underline" href={cfg.signUp}>Create one</Link></p>}
    </form>
  );
}

export function SignUpForm({ portal, withAddress = false }: { portal: Exclude<Portal, "admin">; withAddress?: boolean }) {
  const cfg = portals[portal];
  const router = useRouter();
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setError("The passwords do not match.");
    if (password.length < 10) return setError("Use a password of at least 10 characters.");
    const g = (k: string) => String(f.get(k) ?? "");
    const details: CustomerDetails = { phone: g("phone"), street: g("street"), houseNumber: g("houseNumber"), houseNumberAddition: g("houseNumberAddition"), postcode: g("postcode"), city: g("city") };
    setPending(true);
    if (withAddress) {
      // Check the address before creating the account, so a typo does not leave an account without an address.
      const problem = await validateCustomerDetails(details);
      if (problem) { setPending(false); return setError(problem); }
    }
    const { error } = await authClient.signUp.email({ name: String(f.get("name")).trim(), email: String(f.get("email")), password, role: cfg.role });
    setPending(false);
    if (error) return setError(error.message || "Could not create your account. Try a different email.");
    // The account exists and the browser is now signed in. For customers, join the waiting list for a cleaner.
    if (withAddress && cfg.role === "customer") { try { await registerCustomerInterest(details); } catch { /* the account is created either way */ } }
    router.push(cfg.home); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4" aria-label={`${cfg.label} sign up`}>
      <Field label="Full name"><Input name="name" required autoComplete="name" maxLength={120} /></Field>
      <Field label="Email"><Input type="email" name="email" required autoComplete="email" /></Field>
      <Field label="Password (at least 10 characters)"><Input type="password" name="password" required minLength={10} autoComplete="new-password" /></Field>
      <Field label="Repeat password"><Input type="password" name="confirm" required minLength={10} autoComplete="new-password" /></Field>
      {withAddress && (
        <>
          <Field label="Phone number"><Input type="tel" name="phone" required placeholder="06 12345678" pattern="[+0-9()\s\-]{8,20}" autoComplete="tel" /></Field>
          <p className="-mb-1 text-sm font-semibold">Address where you need cleaning</p>
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-3">
            <Field label="Street"><Input name="street" required maxLength={120} autoComplete="address-line1" /></Field>
            <Field label="No."><Input name="houseNumber" required inputMode="numeric" pattern="[0-9]{1,5}" maxLength={5} /></Field>
            <Field label="Add."><Input name="houseNumberAddition" maxLength={10} placeholder="A, 2" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Postcode"><Input name="postcode" required placeholder="1011 AB" pattern="[1-9][0-9]{3}\s?[A-Za-z]{2}" maxLength={7} autoComplete="postal-code" /></Field>
            <Field label="City"><Input name="city" required defaultValue="Amsterdam" maxLength={80} autoComplete="address-level2" /></Field>
          </div>
        </>
      )}
      <label className="flex items-start gap-2 text-sm font-normal">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I agree to the <Link href="/privacy" className="text-primary-dark underline">privacy policy</Link>.</span>
      </label>
      {error && <p role="alert" className={errCls}>{error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Creating account…" : "Create account"}</button>
      <p className="text-sm text-muted">Already have an account? <Link className="text-primary-dark underline" href={cfg.signIn}>Sign in</Link></p>
    </form>
  );
}

export function SignOutButton({ to = "/" }: { to?: string }) {
  const router = useRouter();
  return (
    <button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-primary"
      onClick={async () => { await authClient.signOut(); router.push(to); router.refresh(); }}>
      Sign out
    </button>
  );
}
