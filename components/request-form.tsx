"use client";
import { useActionState, useState } from "react";
import { createRequest, type FormState } from "@/app/customer/actions";
import { Field, inputClass } from "@/components/ui";
import { BATHROOM_OPTIONS, BEDROOM_OPTIONS, MAX_WINDOWS, PROPERTY_TYPES, TASKS, checkDetails } from "@/lib/request-details";
import { parseRequestForm } from "@/lib/request-form";
import { HOUR_OPTIONS, RULES, TIME_SLOTS, checkRequest, formatDate, formatHours, type ISODate } from "@/lib/scheduling";

const initial: FormState = { ok: false, message: "" };
type Address = { street: string; houseNumber: string; houseNumberAddition: string; postcode: string; city: string };

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-3xl border border-line bg-white p-6 shadow-card">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-ink-deep" aria-hidden="true">{n}</span>
        <div><h3 className="text-xl font-medium">{title}</h3>{hint && <p className="text-sm text-muted">{hint}</p>}</div>
      </div>
      {children}
    </fieldset>
  );
}

const Pill = ({ children }: { children: React.ReactNode }) => <span className="select-none">{children}</span>;

/**
 * The full cleaning request form: when, where, the home, what to clean, and things to know.
 * Used by customers for themselves and by admins for a customer (adminCustomerId).
 */
export function RequestForm({ defaults, quick, today, min, max, adminCustomerId, payHref }: { defaults: Address; quick: { date: ISODate; time: string; hours: number }[]; today: ISODate; min: ISODate; max: ISODate; adminCustomerId?: string; payHref?: string }) {
  const [state, action, pending] = useActionState(createRequest, initial);
  const [local, setLocal] = useState("");
  const [when, setWhen] = useState({ date: "", time: quick[0]?.time ?? "09:00", hours: quick[0]?.hours ?? 3 });
  const [tasks, setTasks] = useState<string[]>([]);
  const toggle = (id: string) => setTasks(t => (t.includes(id) ? t.filter(x => x !== id) : [...t, id]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const input = parseRequestForm(new FormData(e.currentTarget));
    const problem = checkRequest(input.date, input.time, input.hours, today) || checkDetails(input.details);
    if (problem) { e.preventDefault(); setLocal(problem); } else setLocal("");
  }
  const msg = local || state.message, good = !local && state.ok;

  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-5" aria-label="Request a cleaning">
      {adminCustomerId && <input type="hidden" name="waitlistId" value={adminCustomerId} />}

      <Section n={1} title="When do you need the cleaner?" hint="Pick a date, a start time, and how many hours you need.">
        {quick.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Your next regular cleaning days</p>
            <div className="flex flex-wrap gap-2">
              {quick.map(q => (
                <button type="button" key={q.date} onClick={() => setWhen({ date: q.date, time: q.time, hours: q.hours })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${when.date === q.date ? "border-primary bg-primary text-ink-deep" : "border-line bg-white hover:border-primary"}`}>{formatDate(q.date)}</button>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date"><input type="date" name="date" required min={min} max={max} className={inputClass} value={when.date} onChange={e => setWhen({ ...when, date: e.target.value })} /></Field>
          <Field label="Start time"><select name="time" className={inputClass} value={when.time} onChange={e => setWhen({ ...when, time: e.target.value })}>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Hours of cleaning needed"><select name="hours" className={inputClass} value={when.hours} onChange={e => setWhen({ ...when, hours: Number(e.target.value) })}>{HOUR_OPTIONS.map(h => <option key={h} value={h}>{formatHours(h)}</option>)}</select></Field>
        </div>
        <p className="text-xs text-muted">Cleanings run between {RULES.earliestStart} and {RULES.latestEnd}, from tomorrow up to 6 months ahead.</p>
      </Section>

      <Section n={2} title="Where is the cleaning?" hint="We filled in your home address. Change it if the cleaning is somewhere else.">
        <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-3">
          <Field label="Street"><input name="street" required maxLength={120} defaultValue={defaults.street} className={inputClass} autoComplete="address-line1" /></Field>
          <Field label="No."><input name="houseNumber" required inputMode="numeric" pattern="[0-9]{1,5}" maxLength={5} defaultValue={defaults.houseNumber} className={inputClass} /></Field>
          <Field label="Add."><input name="houseNumberAddition" maxLength={10} defaultValue={defaults.houseNumberAddition} className={inputClass} placeholder="A, 2" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postcode"><input name="postcode" required pattern="[1-9][0-9]{3}\s?[A-Za-z]{2}" maxLength={7} defaultValue={defaults.postcode} className={inputClass} autoComplete="postal-code" /></Field>
          <Field label="City"><input name="city" required maxLength={80} defaultValue={defaults.city} className={inputClass} autoComplete="address-level2" /></Field>
        </div>
      </Section>

      <Section n={3} title="Tell us about the home">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Type of home"><select name="propertyType" className={inputClass} defaultValue="apartment">{Object.entries(PROPERTY_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="Bedrooms"><select name="bedrooms" className={inputClass} defaultValue={1}>{BEDROOM_OPTIONS.map(b => <option key={b} value={b}>{b === 0 ? "Studio (no separate bedroom)" : b}</option>)}</select></Field>
          <Field label="Bathrooms"><select name="bathrooms" className={inputClass} defaultValue={1}>{BATHROOM_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}</select></Field>
        </div>
      </Section>

      <Section n={4} title="What should be cleaned?" hint="Choose everything you would like done.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TASKS.map(t => (
            <label key={t.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${tasks.includes(t.id) ? "border-primary bg-primary/10" : "border-line bg-white hover:border-primary/60"}`}>
              <input type="checkbox" name="tasks" value={t.id} checked={tasks.includes(t.id)} onChange={() => toggle(t.id)} className="mt-1 h-4 w-4 accent-primary-deep" />
              <span><Pill><span className="font-medium">{t.label}</span></Pill>{t.hint && <span className="block text-xs text-muted">{t.hint}</span>}</span>
            </label>
          ))}
        </div>
        {tasks.includes("windows") && (
          <div className="max-w-xs"><Field label="How many windows?"><input type="number" name="windows" required min={1} max={MAX_WINDOWS} inputMode="numeric" className={inputClass} placeholder="For example 8" /></Field></div>
        )}
      </Section>

      <Section n={5} title="Good to know">
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset><legend className="mb-2 text-sm font-semibold">Pets at home?</legend>
            <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="hasPets" value="no" defaultChecked className="accent-primary-deep" />No</label><label className="flex items-center gap-2"><input type="radio" name="hasPets" value="yes" className="accent-primary-deep" />Yes</label></div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold">Cleaning supplies at home?</legend>
            <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="suppliesAtHome" value="yes" defaultChecked className="accent-primary-deep" />Yes</label><label className="flex items-center gap-2"><input type="radio" name="suppliesAtHome" value="no" className="accent-primary-deep" />No</label></div></fieldset>
        </div>
        <Field label="Anything else? (optional)"><textarea name="notes" rows={3} maxLength={1000} className={inputClass} placeholder="For example: how to get in, parking, rooms to focus on" /></Field>
      </Section>

      {good && state.needsPayment && payHref && (
        <div className="rounded-3xl border border-orange-300 bg-orange-50 p-5">
          <p className="font-bold">One more step: pay €15 to get a cleaner assigned.</p>
          <p className="mb-3 text-sm text-muted">Your request is saved. Once the membership is paid, we assign your regular cleaner and a backup, and the booking is confirmed when your cleaner accepts.</p>
          <a href={payHref} className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] transition hover:bg-mint">Pay €15 now</a>
        </div>
      )}
      {msg && <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${good ? "border-primary/40 bg-primary/10" : "border-red-300 bg-red-50 text-red-800"}`}>{msg}</p>}
      <div><button disabled={pending} className="rounded-full bg-primary px-8 py-3.5 text-lg font-bold text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] transition hover:bg-mint disabled:opacity-60">{pending ? "Sending…" : "Send cleaning request"}</button></div>
    </form>
  );
}
