"use server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

export async function joinWaitlist(_prev: FormState, f: FormData): Promise<FormState> {
  if (text(f, "website")) return { ok: true, message: "Thank you!" };
  const name = text(f, "name", 120), email = text(f, "email", 200).toLowerCase();
  if (!name || !emailOk(email)) return { ok: false, message: "Please fill in your name and a valid email." };
  if (f.get("consent") !== "on") return { ok: false, message: "Please accept the privacy policy to continue." };
  try {
    const { error } = await supabaseAdmin().from("customer_waitlist").insert({ name, email, postcode: text(f, "postcode", 12), consent: true });
    if (error) { console.error("waitlist insert failed", error.message); return SERVER_ERROR; }
  } catch (e) { console.error(e); return SERVER_ERROR; }
  return { ok: true, message: "Thank you! We will be in touch as soon as we have a regular cleaner for you." };
}
