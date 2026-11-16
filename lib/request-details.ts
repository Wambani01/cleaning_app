// What a customer tells us about a cleaning. Pure rules, shared by the form (browser) and the server.
import { checkAddress } from "@/lib/validate";

export const PROPERTY_TYPES = { apartment: "Apartment", house: "House" } as const;
export type PropertyType = keyof typeof PROPERTY_TYPES;

export const TASKS = [
  { id: "kitchen", label: "Kitchen", hint: "Surfaces, sink, hob" },
  { id: "oven_fridge", label: "Oven and fridge (inside)", hint: "" },
  { id: "windows", label: "Windows (inside)", hint: "Tell us how many" },
  { id: "bathrooms", label: "Bathrooms and toilets", hint: "" },
  { id: "bedrooms", label: "Bedrooms", hint: "Dusting, floors, changing beds if asked" },
  { id: "living", label: "Living areas", hint: "" },
  { id: "floors", label: "Floors", hint: "Vacuum and mop" },
  { id: "dusting", label: "Dusting", hint: "" },
  { id: "balcony", label: "Balcony or terrace", hint: "" },
  { id: "laundry", label: "Laundry", hint: "" },
  { id: "ironing", label: "Ironing", hint: "" },
] as const;
export const TASK_IDS: string[] = TASKS.map(t => t.id);
export const taskLabel = (id: string) => TASKS.find(t => t.id === id)?.label ?? id;

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;   // 0 = studio
export const BATHROOM_OPTIONS = [1, 2, 3, 4] as const;
export const MAX_WINDOWS = 60;

export type RequestDetails = {
  street: string; houseNumber: string; houseNumberAddition: string; postcode: string; city: string;
  propertyType: string; bedrooms: number; bathrooms: number;
  tasks: string[]; windows: number; hasPets: boolean; suppliesAtHome: boolean;
};

/** Returns an error message, or "" when the details are valid. */
export function checkDetails(d: RequestDetails): string {
  const a = checkAddress(d); if (a) return a;
  if (!(d.propertyType in PROPERTY_TYPES)) return "Please choose apartment or house.";
  if (!(BEDROOM_OPTIONS as readonly number[]).includes(d.bedrooms)) return "Please choose the number of bedrooms.";
  if (!(BATHROOM_OPTIONS as readonly number[]).includes(d.bathrooms)) return "Please choose the number of bathrooms.";
  if (d.tasks.length === 0) return "Please choose at least one thing you want cleaned.";
  if (d.tasks.some(t => !TASK_IDS.includes(t)) || new Set(d.tasks).size !== d.tasks.length) return "Something in the list of tasks is not valid.";
  if (d.tasks.includes("windows")) {
    if (!Number.isInteger(d.windows) || d.windows < 1 || d.windows > MAX_WINDOWS) return `Please tell us how many windows (1 to ${MAX_WINDOWS}).`;
  } else if (d.windows !== 0) return "Windows are only counted when you choose to have them cleaned.";
  return "";
}

/** A short one-line description for lists, for example "2 bedrooms, 1 bathroom · Kitchen, Windows (12)". */
export function summarise(r: { bedrooms: number | null; bathrooms: number | null; tasks: string[]; windows: number | null; property_type?: string | null }): string {
  const home = [r.property_type ? PROPERTY_TYPES[r.property_type as PropertyType] : null, r.bedrooms === null ? null : r.bedrooms === 0 ? "studio" : `${r.bedrooms} bedroom${r.bedrooms === 1 ? "" : "s"}`, r.bathrooms === null ? null : `${r.bathrooms} bathroom${r.bathrooms === 1 ? "" : "s"}`].filter(Boolean).join(", ");
  const what = r.tasks.map(t => (t === "windows" && r.windows ? `Windows (${r.windows})` : taskLabel(t))).join(", ");
  return [home, what].filter(Boolean).join(" · ");
}
