"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Field, Input, inputClass } from "@/components/ui";
import { joinWaitlist, submitApplication, type FormState } from "@/app/actions";

const initial: FormState = { ok: false, message: "" };
const areas = ["Amsterdam Centrum", "Noord", "Oost", "Zuid", "West", "Nieuw-West", "Zuidoost"];

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-primary/40 bg-primary/10" : "border-red-300 bg-red-50 text-red-800"}`}>{state.message}</p>;
}

function Consent() {
  return (
    <label className="flex items-start gap-2 text-sm font-normal">
      <input type="checkbox" name="consent" required className="mt-1" />
      <span>I agree to the <Link href="/privacy" className="text-primary-dark underline">privacy policy</Link>.</span>
    </label>
  );
}

const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />;
const Submit = ({ pending, children }: { pending: boolean; children: React.ReactNode }) => (
  <button disabled={pending} className="rounded-lg bg-primary px-6 py-3 font-bold text-ink hover:bg-mint disabled:opacity-60">{pending ? "Sending…" : children}</button>
);

export function ApplicationForm() {
  const [state, action, pending] = useActionState(submitApplication, initial);
  if (state.ok) return <Status state={state} />;
  return (
    <form action={action} className="grid max-w-lg gap-4" aria-label="Cleaner application">
      <Honeypot />
      <Field label="Full name"><Input name="name" required maxLength={120} /></Field>
      <Field label="Email"><Input type="email" name="email" required maxLength={200} /></Field>
      <Field label="Phone"><Input name="phone" required maxLength={40} /></Field>
      <Field label="Area"><select name="area" className={inputClass}>{areas.map(a => <option key={a}>{a}</option>)}</select></Field>
      <Field label="Days and hours you can work"><textarea name="availability" rows={3} maxLength={2000} className={inputClass} /></Field>
      <Field label="Experience"><textarea name="exp" rows={4} maxLength={2000} className={inputClass} /></Field>
      <p className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">Never send ID documents by email. We will give you a secure upload link after the interview.</p>
      <Consent />
      <Status state={state} />
      <Submit pending={pending}>Submit application</Submit>
    </form>
  );
}

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initial);
  if (state.ok) return <Status state={state} />;
  return (
    <form action={action} className="grid max-w-md content-start gap-4" aria-label="Waitlist">
      <Honeypot />
      <Field label="Name"><Input name="name" required maxLength={120} /></Field>
      <Field label="Email"><Input type="email" name="email" required maxLength={200} /></Field>
      <Field label="Postcode"><Input name="postcode" placeholder="1011 AB" maxLength={12} /></Field>
      <Consent />
      <Status state={state} />
      <Submit pending={pending}>I need regular cleaning</Submit>
    </form>
  );
}
