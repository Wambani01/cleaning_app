import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Never import this from a client component.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not set");
  return createClient(url, key, { auth: { persistSession: false } });
}
