"use client";
import { useActionState, useState } from "react";
import { payNow, type FormState } from "@/app/customer/actions";
import { Field, Input } from "@/components/ui";
import { TEST_CARDS, formatCardNumber } from "@/lib/fake-payments";

const initial: FormState = { ok: false, message: "" };

export function PayForm({ total, name }: { total: string; name: string }) {
  const [state, action, pending] = useActionState(payNow, initial);
  const [num, setNum] = useState("4242 4242 4242 4242");
  return (
    <form action={action} className="grid gap-4" aria-label="Pay with a test card">
      <Field label="Name on card"><Input name="name" defaultValue={name} autoComplete="off" required /></Field>
      <Field label="Card number (test cards only)"><Input name="number" inputMode="numeric" autoComplete="off" value={num} onChange={e => setNum(formatCardNumber(e.target.value))} required /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Expiry (MM/YY)"><Input name="expiry" defaultValue="12/30" autoComplete="off" required /></Field>
        <Field label="Security code"><Input name="cvc" defaultValue="123" inputMode="numeric" autoComplete="off" required /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="save" /> Save this card for the monthly renewal</label>
      <details className="rounded-2xl border border-line bg-white p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Test cards</summary>
        <ul className="mt-2 grid gap-1">{Object.entries(TEST_CARDS).map(([n, c]) => <li key={n}><button type="button" className="underline underline-offset-4" onClick={() => setNum(formatCardNumber(n))}>{formatCardNumber(n)}</button> <span className="text-muted">{c.label}</span></li>)}</ul>
      </details>
      <button disabled={pending} className="rounded-full bg-primary px-7 py-3.5 font-bold text-ink-deep transition hover:bg-mint disabled:opacity-60">{pending ? "Paying..." : `Pay ${total}`}</button>
      {state.message && <p role="status" className={`rounded-2xl px-4 py-3 text-sm ${state.ok ? "border border-primary/40 bg-primary/10" : "border border-red-300 bg-red-50 text-red-800"}`}>{state.message}</p>}
    </form>
  );
}
