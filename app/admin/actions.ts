"use server";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { STATUSES } from "@/lib/statuses";


export async function updateApplication(formData: FormData) {
  // Every admin action re-checks the session. Never trust that the page was hidden.
  if (!(await requireAdmin())) throw new Error("Not allowed");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 4000);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(STATUSES as readonly string[]).includes(status)) throw new Error("Invalid input");
  await pool.query("update public.cleaner_applications set status = $1, notes = $2 where id = $3", [status, notes, id]);
  revalidatePath("/admin");
}
