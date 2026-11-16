// Pure date and rule helpers for cleaning requests, regular schedules and the monthly membership date.
// Dates are plain "YYYY-MM-DD" strings (calendar days, no time zone) and are computed in UTC so they never shift.
// No imports from the server, so the browser can use these for instant form checks.

export type ISODate = string;

/** Business rules for requests. Change them here if the owner decides differently. */
export const RULES = {
  minLeadDays: 1,        // earliest request: tomorrow
  maxAheadDays: 180,     // furthest request: about 6 months ahead
  minHours: 1,
  maxHours: 8,
  earliestStart: "07:00",
  latestEnd: "21:00",    // the cleaning must finish by this time
  openRequestLimit: 10,  // open (not completed or cancelled) requests per customer
} as const;

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const FREQUENCIES = { weekly: "Every week", biweekly: "Every 2 weeks" } as const;
export type Frequency = keyof typeof FREQUENCIES;

const pad = (n: number) => String(n).padStart(2, "0");
const toUTC = (iso: ISODate) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const fromUTC = (ms: number): ISODate => { const t = new Date(ms); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

export const addDays = (iso: ISODate, n: number): ISODate => fromUTC(toUTC(iso) + n * 86_400_000);
/** 1 = Monday ... 7 = Sunday */
export const isoWeekday = (iso: ISODate): number => { const d = new Date(toUTC(iso)).getUTCDay(); return d === 0 ? 7 : d; };
export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-12
export const dayOfMonth = (iso: ISODate) => Number(iso.slice(8, 10));

/** Today's calendar date in Amsterdam, whatever time zone the server runs in. */
export function todayAmsterdam(now: Date = new Date()): ISODate {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return parts; // en-CA gives YYYY-MM-DD
}

/**
 * The next membership payment date: the same day of the month as the first payment ("billing day").
 * In a shorter month the last day is used (a payment on the 31st is taken on the 28th/29th/30th in short months).
 * Returns the first such date strictly AFTER `after`.
 */
export function nextBillingDate(billingDay: number, after: ISODate): ISODate {
  let y = Number(after.slice(0, 4)), m = Number(after.slice(5, 7));
  for (let i = 0; i < 14; i++) {
    const candidate = `${y}-${pad(m)}-${pad(Math.min(billingDay, daysInMonth(y, m)))}`;
    if (candidate > after) return candidate;
    m += 1; if (m > 12) { m = 1; y += 1; }
  }
  throw new Error("Could not work out the next billing date");
}

/** First date on or after `from` that falls on `weekday` (1-7). */
export function firstOnOrAfter(from: ISODate, weekday: number): ISODate {
  const diff = (weekday - isoWeekday(from) + 7) % 7;
  return addDays(from, diff);
}

export type Schedule = { frequency: Frequency; weekday: number; anchor_date: ISODate };

/** The next `count` regular cleaning dates on or after `from`. */
export function occurrences(s: Schedule, from: ISODate, count: number): ISODate[] {
  const step = s.frequency === "weekly" ? 7 : 14;
  let d = s.anchor_date;
  if (d < from) { const skip = Math.ceil((toUTC(from) - toUTC(d)) / 86_400_000 / step); d = addDays(d, skip * step); }
  return Array.from({ length: count }, (_, i) => addDays(d, i * step));
}

export const TIME_SLOTS: string[] = Array.from({ length: 27 }, (_, i) => `${pad(7 + Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`).filter(t => t <= "20:00");
export const HOUR_OPTIONS: number[] = Array.from({ length: (RULES.maxHours - RULES.minHours) * 2 + 1 }, (_, i) => RULES.minHours + i * 0.5);

const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const formatHours = (h: number) => `${h} hour${h === 1 ? "" : "s"}`;
export const formatDate = (iso: ISODate, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(toUTC(iso)));

/** Checks the time and length of a cleaning. Returns an error message, or "" when fine. */
export function checkSlot(time: string, hours: number): string {
  if (!/^\d{2}:\d{2}$/.test(time) || toMinutes(time) % 30 !== 0) return "Please choose a start time.";
  if (!Number.isFinite(hours) || hours < RULES.minHours || hours > RULES.maxHours || (hours * 2) % 1 !== 0) return `Choose between ${RULES.minHours} and ${RULES.maxHours} hours, in half-hour steps.`;
  if (toMinutes(time) < toMinutes(RULES.earliestStart)) return `Cleanings start from ${RULES.earliestStart}.`;
  if (toMinutes(time) + hours * 60 > toMinutes(RULES.latestEnd)) return `Cleanings must finish by ${RULES.latestEnd}. Choose an earlier start or fewer hours.`;
  return "";
}

export function checkRequest(date: string, time: string, hours: number, today: ISODate): string {
  if (!isValidISODate(date)) return "Please choose a date.";
  if (date < addDays(today, RULES.minLeadDays)) return "Please choose a date from tomorrow.";
  if (date > addDays(today, RULES.maxAheadDays)) return "Please choose a date within the next 6 months.";
  return checkSlot(time, hours);
}

export function checkSchedule(frequency: string, weekday: number, time: string, hours: number): string {
  if (!(frequency in FREQUENCIES)) return "Please choose how often you want cleaning.";
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) return "Please choose a day of the week.";
  return checkSlot(time, hours);
}
