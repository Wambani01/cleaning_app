import "server-only";
import { pool } from "@/lib/db";

export type Candidate = {
  id: string; full_name: string; phone: string; email: string; area: string;
  street: string | null; house_number: string | null; house_number_addition: string | null; postcode: string | null; city: string | null;
  availability: string | null; experience: string | null; customers: number; distance: number | null;
};

export const postcodeNumber = (p: string | null | undefined) => {
  const m = (p ?? "").match(/^\s*([1-9][0-9]{3})/);
  return m ? Number(m[1]) : null;
};

/** How close a cleaner's postcode area is to the customer's. Rough, based on the 4 digits of the postcode. */
export function closeness(distance: number | null): { label: string; tone: "best" | "near" | "far" | "unknown" } {
  if (distance === null) return { label: "No address on file", tone: "unknown" };
  if (distance === 0) return { label: "Same postcode area", tone: "best" };
  if (distance <= 5) return { label: "Nearby postcode area", tone: "near" };
  return { label: "Further away", tone: "far" };
}

/**
 * Approved cleaners, closest postcode area first (then fewest current customers). Cleaners without a postcode come last.
 * Only applications with status "approved" are ever offered.
 */
export async function candidatesFor(customerPostcode: string | null, limit = 50): Promise<Candidate[]> {
  const target = postcodeNumber(customerPostcode);
  const { rows } = await pool.query(
    `select a.id, a.full_name, a.phone, a.email, a.area, a.street, a.house_number, a.house_number_addition, a.postcode, a.city,
            a.availability, a.experience,
            (select count(*)::int from public.customer_assignments x where x.regular_cleaner_id = a.id or x.backup_cleaner_id = a.id) as customers,
            case when $1::int is null or a.postcode !~ '^\\s*[1-9][0-9]{3}' then null
                 else abs(substring(a.postcode from '^\\s*([1-9][0-9]{3})')::int - $1::int) end as distance
       from public.cleaner_applications a
      where a.status = 'approved'
      order by distance asc nulls last, customers asc, a.created_at asc
      limit $2`,
    [target, limit],
  );
  return rows as Candidate[];
}
