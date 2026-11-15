"use server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/admin";
import { checkAddressDetails, tidyPostcode, type AddressDetails } from "@/lib/validate";

export type FormState = { ok: boolean; message: string };
export type CustomerDetails = AddressDetails;

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const text = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const SERVER_ERROR: FormState = { ok: false, message: "Something went wrong on our side. Please try again in a moment." };

export async function submitApplication(_prev: FormState, f: FormData): Promise<FormState> {
  if (text(f, "website")) return { ok: true, message: "Thank you!" }; // honeypot: bots fill this
  const full_name = text(f, "name", 120), email = text(f, "email", 200).toLowerCase();
  if (!full_name || !emailOk(email)) return { ok: false, message: "Please fill in your name and a valid email." };
  const d: AddressDetails = { phone: text(f, "phone", 40), street: text(f, "street", 120), houseNumber: text(f, "houseNumber", 5), houseNumberAddition: text(f, "houseNumberAddition", 10), postcode: text(f, "postcode", 7), city: text(f, "city", 80) };
  const problem = checkAddressDetails(d);
  if (problem) return { ok: false, message: problem };
  if (f.get("consent") !== "on") return { ok: false, message: "Please accept the privacy policy to continue." };
  try {
    await pool.query(
      `insert into public.cleaner_applications (full_name, email, phone, street, house_number, house_number_addition, postcode, city, area, availability, experience, consent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)`,
      [full_name, email, d.phone, d.street, d.houseNumber, d.houseNumberAddition, tidyPostcode(d.postcode), d.city, text(f, "area", 80), text(f, "availability"), text(f, "exp")],
    );
  } catch (e) { console.error("application insert failed", e instanceof Error ? e.message : e); return SERVER_ERROR; }
  return { ok: true, message: "Thank you! We have received your application and will contact you to arrange a video interview." };
}

/** Server-side check of a customer's phone number and address. Returns an error message, or "" when valid. */
export async function validateCustomerDetails(d: CustomerDetails): Promise<string> {
  return checkAddressDetails(d);
}

/**
 * Called right after a customer creates an account on /join. Saves their phone and address and puts them on the
 * waiting list for a regular cleaner. It uses the signed-in session (never a name or email sent by the browser),
 * and it is safe to call twice.
 */
export async function registerCustomerInterest(d: CustomerDetails): Promise<void> {
  const session = await getSession();
  if (!session || session.user.role !== "customer") return;
  if (checkAddressDetails(d)) return;
  await pool.query(
    `insert into public.customer_waitlist (name, email, phone, street, house_number, house_number_addition, postcode, city, consent)
     select $1, $2, $3, $4, $5, $6, $7, $8, true
     where not exists (select 1 from public.customer_waitlist where lower(email) = lower($2))`,
    [session.user.name.slice(0, 120), session.user.email.toLowerCase(), d.phone.trim(), d.street.trim().slice(0, 120),
     d.houseNumber.trim(), d.houseNumberAddition.trim(), tidyPostcode(d.postcode), d.city.trim().slice(0, 80)],
  );
}
