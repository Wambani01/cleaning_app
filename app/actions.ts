"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/admin";

export type FormState = { ok: boolean; message: string };

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const text = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const SERVER_ERROR: FormState = { ok: false, message: "Something went wrong on our side. Please try again in a moment." };

export async function submitApplication(_prev: FormState, f: FormData): Promise<FormState> {
  if (text(f, "website")) return { ok: true, message: "Thank you!" }; // honeypot: bots fill this
  const full_name = text(f, "name", 120), email = text(f, "email", 200).toLowerCase(), phone = text(f, "phone", 40);
  if (!full_name || !phone || !emailOk(email)) return { ok: false, message: "Please fill in your name, a valid email and your phone number." };
  if (f.get("consent") !== "on") return { ok: false, message: "Please accept the privacy policy to continue." };
  try {
    const { error } = await supabaseAdmin().from("cleaner_applications").insert({
      full_name, email, phone, consent: true,
      area: text(f, "area", 80), availability: text(f, "availability"), experience: text(f, "exp"),
    });
    if (error) { console.error("application insert failed", error.message); return SERVER_ERROR; }
  } catch (e) { console.error(e); return SERVER_ERROR; }
  return { ok: true, message: "Thank you! We have received your application and will contact you to arrange a video interview." };
}

export type CustomerDetails = { phone: string; street: string; houseNumber: string; houseNumberAddition: string; postcode: string; city: string };

const POSTCODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
const PHONE = /^[+0-9()\s-]{8,20}$/;

/** Server-side check of the customer's phone number and address. Returns an error message, or "" when valid. */
export async function validateCustomerDetails(d: CustomerDetails): Promise<string> {
  if (!PHONE.test(d.phone.trim())) return "Please enter a valid phone number.";
  if (d.street.trim().length < 2) return "Please enter your street name.";
  if (!/^[0-9]{1,5}$/.test(d.houseNumber.trim())) return "Please enter your house number (numbers only, for example 12).";
  if (d.houseNumberAddition.trim().length > 10) return "The house number addition is too long.";
  if (!POSTCODE.test(d.postcode.trim())) return "Please enter a valid postcode, for example 1011 AB.";
  if (d.city.trim().length < 2) return "Please enter your city.";
  return "";
}

/**
 * Called right after a customer creates an account on /join. Saves their phone and address and puts them on the
 * waiting list for a regular cleaner. It uses the signed-in session (never a name or email sent by the browser),
 * and it is safe to call twice.
 */
export async function registerCustomerInterest(d: CustomerDetails): Promise<void> {
  const session = await getSession();
  if (!session || session.user.role !== "customer") return;
  if (await validateCustomerDetails(d)) return;
  await pool.query(
    `insert into public.customer_waitlist (name, email, phone, street, house_number, house_number_addition, postcode, city, consent)
     select $1, $2, $3, $4, $5, $6, $7, $8, true
     where not exists (select 1 from public.customer_waitlist where lower(email) = lower($2))`,
    [session.user.name.slice(0, 120), session.user.email.toLowerCase(), d.phone.trim(), d.street.trim().slice(0, 120),
     d.houseNumber.trim(), d.houseNumberAddition.trim(), d.postcode.trim().toUpperCase().replace(/^(\d{4})\s?/, "$1 "), d.city.trim().slice(0, 80)],
  );
}
