// Reads the cleaning request form. Pure (no server imports), so the browser and the server parse it identically.
import type { RequestDetails } from "@/lib/request-details";

export type RequestInput = { date: string; time: string; hours: number; notes: string; details: RequestDetails };
const val = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

/** Reads the full request form. Nothing here is trusted: every value is checked again by checkRequest and checkDetails. */
export function parseRequestForm(f: FormData): RequestInput {
  const tasks = f.getAll("tasks").map(String);
  return {
    date: val(f, "date", 10), time: val(f, "time", 5), hours: Number(val(f, "hours", 4)), notes: val(f, "notes", 1000),
    details: {
      street: val(f, "street", 120), houseNumber: val(f, "houseNumber", 5), houseNumberAddition: val(f, "houseNumberAddition", 10), postcode: val(f, "postcode", 7), city: val(f, "city", 80),
      propertyType: val(f, "propertyType", 12), bedrooms: Number(val(f, "bedrooms", 2)), bathrooms: Number(val(f, "bathrooms", 2)),
      tasks, windows: tasks.includes("windows") ? Number(val(f, "windows", 3)) : 0,
      hasPets: val(f, "hasPets", 3) === "yes", suppliesAtHome: val(f, "suppliesAtHome", 3) !== "no",
    },
  };
}

