import "server-only";
import { pool } from "@/lib/db";
import type { Frequency, ISODate } from "@/lib/scheduling";

export type MembershipStatus = "free" | "pending_payment" | "active" | "past_due" | "cancelled";
export type RequestStatus = "requested" | "awaiting_payment" | "confirmed" | "completed" | "cancelled";

export type Membership = { status: MembershipStatus; started_on: ISODate | null; billing_day: number | null; next_billing_date: ISODate | null };
export type Schedule = { frequency: Frequency; weekday: number; anchor_date: ISODate; start_time: string; hours: number };
export type CleanerResponse = "pending" | "accepted" | "declined";
export type CleaningRequest = {
  id: string; requested_date: ISODate; start_time: string; hours: number; notes: string | null; status: RequestStatus; admin_notes: string | null; created_at: Date;
  cleaner_id: string | null; cleaner_response: CleanerResponse | null; cleaner_first_name: string | null; decline_reason: string | null;
  street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null;
  property_type: string | null; bedrooms: number | null; bathrooms: number | null; windows: number | null; tasks: string[]; has_pets: boolean | null; supplies_at_home: boolean | null; created_by: string | null;
};
export type CustomerRow = { id: string; name: string; email: string; phone: string | null; street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null };

// Dates and times are cast in SQL so they arrive as plain strings. The driver would otherwise turn them into Date objects in the server's time zone.
const D = (c: string) => `to_char(${c}, 'YYYY-MM-DD')`;
const T = (c: string) => `to_char(${c}, 'HH24:MI')`;

export const REQUEST_COLUMNS = `r.id, ${D("r.requested_date")} as requested_date, ${T("r.start_time")} as start_time, r.hours::float8 as hours, r.notes, r.status, r.admin_notes, r.created_at,
  r.cleaner_id, r.cleaner_response, r.decline_reason, (select split_part(c.full_name, ' ', 1) from public.cleaner_applications c where c.id = r.cleaner_id) as cleaner_first_name,
  r.street, r.house_number, r.house_number_addition, r.postcode, r.city, r.property_type, r.bedrooms, r.bathrooms, r.windows, r.tasks, r.has_pets, r.supplies_at_home, r.created_by`;

export async function loadCustomerByEmail(email: string) {
  const row = (await pool.query("select * from public.customer_waitlist where lower(email) = lower($1) limit 1", [email])).rows[0] as CustomerRow | undefined;
  if (!row) return null;
  return { row, ...(await loadCustomerData(row.id)) };
}

export async function loadCustomerData(waitlistId: string) {
  const membership = (await pool.query(
    `select status, ${D("started_on")} as started_on, billing_day, ${D("next_billing_date")} as next_billing_date from public.customer_memberships where waitlist_id = $1`, [waitlistId])).rows[0] as Membership | undefined;
  const schedule = (await pool.query(
    `select frequency, weekday, ${D("anchor_date")} as anchor_date, ${T("start_time")} as start_time, hours::float8 as hours from public.customer_schedules where waitlist_id = $1`, [waitlistId])).rows[0] as Schedule | undefined;
  const requests = (await pool.query(
    `select ${REQUEST_COLUMNS} from public.cleaning_requests r where r.waitlist_id = $1 order by r.requested_date desc, r.start_time desc limit 100`, [waitlistId])).rows as CleaningRequest[];
  return { membership: membership ?? { status: "free" as const, started_on: null, billing_day: null, next_billing_date: null }, schedule: schedule ?? null, requests };
}

export const requestLabel: Record<RequestStatus, string> = {
  requested: "Requested",
  awaiting_payment: "Waiting for first payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
export const membershipLabel: Record<MembershipStatus, string> = {
  free: "Free account",
  pending_payment: "Waiting for first payment",
  active: "Active",
  past_due: "Payment overdue",
  cancelled: "Cancelled",
};

export const responseLabel: Record<CleanerResponse, string> = { pending: "Waiting for cleaner", accepted: "Cleaner accepted", declined: "Cleaner declined" };

export async function loadCustomerById(id: string) {
  const row = (await pool.query("select * from public.customer_waitlist where id = $1", [id])).rows[0] as CustomerRow | undefined;
  if (!row) return null;
  return { row, ...(await loadCustomerData(row.id)) };
}
export type LoadedCustomer = NonNullable<Awaited<ReturnType<typeof loadCustomerByEmail>>>;
