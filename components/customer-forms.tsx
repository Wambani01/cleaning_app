"use client";
import { useActionState, useState } from "react";
import { saveSchedule, type FormState } from "@/app/customer/actions";
import { Field, inputClass } from "@/components/ui";
import { FREQUENCIES, HOUR_OPTIONS, TIME_SLOTS, WEEKDAYS, checkSchedule, formatHours, type ISODate } from "@/lib/scheduling";

const initial: FormState = { ok: false, message: "" };
const btn = "rounded-full bg-primary px-7 py-3 font-bold text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] transition hover:bg-mint disabled:opacity-60";

function Status({ s, local }: { s: FormState; local: string }) {
  const msg = local || s.message; if (!msg) return null;
  const good = !local && s.ok;
  return <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${good ? "border-primary/40 bg-primary/10" : "border-red-300 bg-red-50 text-red-800"}`}>{msg}</p>;
}

export function ScheduleForm({ initial: init, today, adminCustomerId }: { initial: { frequency: string; weekday: number; time: string; hours: number } | null; today: ISODate; adminCustomerId?: string }) {
  const [state, action, pending] = useActionState(saveSchedule, initial);
  const [local, setLocal] = useState("");
  const [v, setV] = useState(init ?? { frequency: "weekly", weekday: 2, time: "09:00", hours: 3 });
  void today;
  return (
    <form action={action} onSubmit={e => { const p = checkSchedule(v.frequency, v.weekday, v.time, v.hours); if (p) { e.preventDefault(); setLocal(p); } else setLocal(""); }} className="grid max-w-md gap-4" aria-label="Regular cleaning schedule">
      {adminCustomerId && <input type="hidden" name="waitlistId" value={adminCustomerId} />}
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
