"use client";
import { useActionState, useState } from "react";
import { createRequest, saveSchedule, type FormState } from "@/app/customer/actions";
import { Field, inputClass } from "@/components/ui";
import { FREQUENCIES, HOUR_OPTIONS, RULES, TIME_SLOTS, WEEKDAYS, checkRequest, checkSchedule, formatDate, formatHours, type ISODate } from "@/lib/scheduling";

const initial: FormState = { ok: false, message: "" };
const btn = "rounded-full bg-primary px-7 py-3 font-bold text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] transition hover:bg-mint disabled:opacity-60";

function Status({ s, local }: { s: FormState; local: string }) {
  const msg = local || s.message; if (!msg) return null;
  const good = !local && s.ok;
  return <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${good ? "border-primary/40 bg-primary/10" : "border-red-300 bg-red-50 text-red-800"}`}>{msg}</p>;
}

type Slot = { date?: ISODate; time: string; hours: number };

export function ScheduleForm({ initial: init, today }: { initial: { frequency: string; weekday: number; time: string; hours: number } | null; today: ISODate }) {
  const [state, action, pending] = useActionState(saveSchedule, initial);
  const [local, setLocal] = useState("");
  const [v, setV] = useState(init ?? { frequency: "weekly", weekday: 2, time: "09:00", hours: 3 });
  void today;
  return (
    <form action={action} onSubmit={e => { const p = checkSchedule(v.frequency, v.weekday, v.time, v.hours); if (p) { e.preventDefault(); setLocal(p); } else setLocal(""); }} className="grid max-w-md gap-4" aria-label="Regular cleaning schedule">
      <Field label="How often"><select name="frequency" className={inputClass} value={v.frequency} onChange={e => setV({ ...v, frequency: e.target.value })}>{Object.entries(FREQUENCIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      <Field label="Day of the week"><select name="weekday" className={inputClass} value={v.weekday} onChange={e => setV({ ...v, weekday: Number(e.target.value) })}>{WEEKDAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time"><select name="time" className={inputClass} value={v.time} onChange={e => setV({ ...v, time: e.target.value })}>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Hours"><select name="hours" className={inputClass} value={v.hours} onChange={e => setV({ ...v, hours: Number(e.target.value) })}>{HOUR_OPTIONS.map(h => <option key={h} value={h}>{formatHours(h)}</option>)}</select></Field>
      </div>
      <Status s={state} local={local} />
      <button disabled={pending} className={btn}>{pending ? "Saving…" : init ? "Update regular schedule" : "Save regular schedule"}</button>
    </form>
  );
}

export function RequestForm({ quick, today, min, max }: { quick: { date: ISODate; time: string; hours: number }[]; today: ISODate; min: ISODate; max: ISODate }) {
  const [state, action, pending] = useActionState(createRequest, initial);
  const [local, setLocal] = useState("");
  const [v, setV] = useState<Slot>({ date: "", time: quick[0]?.time ?? "09:00", hours: quick[0]?.hours ?? 3 });
  return (
    <form action={action} onSubmit={e => { const p = checkRequest(v.date ?? "", v.time, v.hours, today); if (p) { e.preventDefault(); setLocal(p); } else setLocal(""); }} className="grid max-w-md gap-4" aria-label="Request a cleaning">
      {quick.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Your next regular cleaning days</p>
          <div className="flex flex-wrap gap-2">
            {quick.map(q => (
              <button type="button" key={q.date} onClick={() => setV({ date: q.date, time: q.time, hours: q.hours })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${v.date === q.date ? "border-primary bg-primary text-ink-deep" : "border-line bg-white hover:border-primary"}`}>{formatDate(q.date)}</button>
            ))}
          </div>
        </div>
      )}
      <Field label="Date"><input type="date" name="date" required min={min} max={max} className={inputClass} value={v.date ?? ""} onChange={e => setV({ ...v, date: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time"><select name="time" className={inputClass} value={v.time} onChange={e => setV({ ...v, time: e.target.value })}>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Hours"><select name="hours" className={inputClass} value={v.hours} onChange={e => setV({ ...v, hours: Number(e.target.value) })}>{HOUR_OPTIONS.map(h => <option key={h} value={h}>{formatHours(h)}</option>)}</select></Field>
      </div>
      <Field label="Anything we should know? (optional)"><textarea name="notes" rows={3} maxLength={1000} className={inputClass} placeholder="For example: access to the building, pets, rooms to focus on" /></Field>
      <p className="text-xs text-muted">Cleanings run between {RULES.earliestStart} and {RULES.latestEnd}, from tomorrow up to 6 months ahead.</p>
      <Status s={state} local={local} />
      <button disabled={pending} className={btn}>{pending ? "Sending…" : "Request this cleaning"}</button>
    </form>
  );
}
