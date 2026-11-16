// TEST MODE payment rules. Pure functions, safe in the browser and on the server.
// The fake checkout accepts ONLY published test card numbers, so a real card number can never be entered, charged or stored.

export const MEMBERSHIP_CENTS = 1500;
export const HOURLY_CENTS = 1500;
export const euro = (cents: number) => `€${cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)}`;
export const centsForHours = (hours: number) => Math.round(hours * HOURLY_CENTS);

/** The published test cards. Anything else is refused. */
export const TEST_CARDS: Record<string, { brand: string; outcome: "ok" | "declined" | "no_funds"; label: string }> = {
  "4242424242424242": { brand: "Visa", outcome: "ok", label: "Visa, always succeeds" },
  "5555555555554444": { brand: "Mastercard", outcome: "ok", label: "Mastercard, always succeeds" },
  "4000000000000002": { brand: "Visa", outcome: "declined", label: "Visa, always declined" },
  "4000000000009995": { brand: "Visa", outcome: "no_funds", label: "Visa, insufficient funds" },
};
export const DECLINE_MESSAGE = { declined: "The card was declined.", no_funds: "The card has insufficient funds." } as const;

export const digitsOnly = (s: string) => s.replace(/\D/g, "");
export const formatCardNumber = (s: string) => digitsOnly(s).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

export function luhn(num: string): boolean {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) { let n = Number(num[i]); if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
  return num.length > 0 && sum % 10 === 0;
}

/** MM/YY or MM/YYYY. Returns the month and four-digit year, or null. */
export function parseExpiry(s: string): { month: number; year: number } | null {
  const m = s.trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]); let year = Number(m[2]); if (year < 100) year += 2000;
  return month >= 1 && month <= 12 ? { month, year } : null;
}

export type CardInput = { number: string; expiry: string; cvc: string; name: string };
export type CardCheck = { ok: true; last4: string; brand: string; outcome: "ok" | "declined" | "no_funds"; month: number; year: number } | { ok: false; message: string };

/** Checks what was typed. Never returns or logs the full number or the code. `now` is injectable for tests. */
export function checkCard(c: CardInput, now: Date = new Date()): CardCheck {
  const num = digitsOnly(c.number);
  if (c.name.trim().length < 2) return { ok: false, message: "Please enter the name on the card." };
  if (!luhn(num) || num.length < 12) return { ok: false, message: "That card number is not valid." };
  const known = TEST_CARDS[num];
  if (!known) return { ok: false, message: "Test mode: only test cards work, for example 4242 4242 4242 4242. Real card numbers are not accepted." };
  const exp = parseExpiry(c.expiry);
  if (!exp) return { ok: false, message: "Enter the expiry date as MM/YY." };
  const y = now.getUTCFullYear(), m = now.getUTCMonth() + 1;
  if (exp.year < y || (exp.year === y && exp.month < m)) return { ok: false, message: "That card has expired." };
  if (!/^\d{3,4}$/.test(c.cvc.trim())) return { ok: false, message: "Enter the 3 or 4 digit security code (any number works in test mode)." };
  return { ok: true, last4: num.slice(-4), brand: known.brand, outcome: known.outcome, month: exp.month, year: exp.year };
}
