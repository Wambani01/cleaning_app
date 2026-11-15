// Generates SQL that loads clearly-marked TEST data (every row uses an @amstaclean.test email).
//   node scripts/seed.mjs > /tmp/seed.sql        (the login password is printed to stderr)
// Remove it again with scripts/unseed.sql. Re-running first removes the previous test data.
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const password = process.env.SEED_PASSWORD || randomBytes(9).toString("base64url");
const hash = await hashPassword(password);
const q = s => (s === null || s === undefined ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const D = "@amstaclean.test";

// [name, email-local, phone, street, no, add, postcode, city, area, availability, experience, status]
const cleaners = [
  ["Ewa Kowalska",     "ewa.kowalska",   "06 11 22 33 01", "Egelantiersgracht", "112", "",  "1015 RJ", "Amsterdam", "Centrum",     "Mon-Fri mornings",       "6 years cleaning private homes",          "approved"],
  ["Sofia Rossi",      "sofia.rossi",    "06 11 22 33 02", "Van Woustraat",     "88",  "2", "1072 LL", "Amsterdam", "Zuid",        "Tue, Thu all day",       "4 years, apartments and offices",         "approved"],
  ["Fatima El Idrissi","fatima.elidrissi","06 11 22 33 03","Jan Evertsenstraat","204", "",  "1056 CB", "Amsterdam", "West",        "Mon-Sat flexible",       "8 years, deep cleaning",                  "approved"],
  ["Mehmet Yilmaz",    "mehmet.yilmaz",  "06 11 22 33 04", "Javastraat",        "57",  "H", "1094 HJ", "Amsterdam", "Oost",        "Wed-Fri, weekends",      "3 years",                                 "approved"],
  ["Joao Pereira",     "joao.pereira",   "06 11 22 33 05", "Bijlmerplein",      "310", "",  "1102 DR", "Amsterdam", "Zuidoost",   "Mon-Thu afternoons",     "5 years, hotels and homes",               "approved"],
  ["Lina Haddad",      "lina.haddad",    "06 11 22 33 06", "Mosplein",          "15",  "",  "1031 AB", "Amsterdam", "Noord",       "Weekdays",               "New to cleaning, eager to learn",         "new"],
  ["Marta Nowak",      "marta.nowak",    "06 11 22 33 07", "Delflandplein",     "23",  "1", "1063 AB", "Amsterdam", "Nieuw-West", "Mon, Wed, Fri",          "2 years",                                 "contacted"],
  ["Karim Benali",     "karim.benali",   "06 11 22 33 08", "Insulindeweg",      "190", "",  "1093 CD", "Amsterdam", "Oost",        "Flexible",               "4 years",                                 "interview_scheduled"],
  ["Ana Silva",        "ana.silva",      "06 11 22 33 09", "Beethovenstraat",   "42",  "",  "1077 HV", "Amsterdam", "Zuid",        "Tue-Sat",                "7 years, references available",           "documents_requested"],
  ["Peter Jansen",     "peter.jansen",   "06 11 22 33 10", "Nieuwmarkt",        "4",   "",  "1011 JR", "Amsterdam", "Centrum",     "Evenings only",          "1 year",                                  "rejected"],
];
// [name, email-local, phone, street, no, add, postcode, city]
const customers = [
  ["Emma de Boer",   "emma.deboer",   "06 55 00 00 01", "Westerstraat",       "75",  "",  "1015 MK", "Amsterdam"],
  ["Lars Visser",    "lars.visser",   "06 55 00 00 02", "Ceintuurbaan",       "120", "3", "1072 GD", "Amsterdam"],
  ["Noor Bakker",    "noor.bakker",   "06 55 00 00 03", "Bilderdijkstraat",   "31",  "",  "1053 KE", "Amsterdam"],
  ["Daan Mulder",    "daan.mulder",   "06 55 00 00 04", "Linnaeusstraat",     "9",   "B", "1093 EE", "Amsterdam"],
  ["Sanne Smit",     "sanne.smit",    "06 55 00 00 05", "Ganzenhoef",         "66",  "",  "1103 SA", "Amsterdam"],
  ["Tim Hendriks",   "tim.hendriks",  "06 55 00 00 06", "Kloveniersburgwal",  "44",  "",  "1012 CW", "Amsterdam"],
];
// customer email-local -> [regular cleaner, backup cleaner or null]
const assignments = { "emma.deboer": ["ewa.kowalska", "sofia.rossi"], "lars.visser": ["sofia.rossi", null] };
// logins you can use to test each portal (the admin is your own account)
const logins = [
  ["Emma de Boer", "emma.deboer", "customer"],
  ["Ewa Kowalska", "ewa.kowalska", "cleaner"],
  ["Lina Haddad", "lina.haddad", "cleaner"],
];

let sql = readFileSync(new URL("./unseed.sql", import.meta.url), "utf8") + "\n";
for (const c of cleaners) sql += `insert into public.cleaner_applications (full_name,email,phone,street,house_number,house_number_addition,postcode,city,area,availability,experience,status,consent,notes) values (${[c[0], c[1] + D, c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11]].map(q).join(",")},true,'SEED DATA');\n`;
for (const c of customers) sql += `insert into public.customer_waitlist (name,email,phone,street,house_number,house_number_addition,postcode,city,consent) values (${[c[0], c[1] + D, c[2], c[3], c[4], c[5], c[6], c[7]].map(q).join(",")},true);\n`;
for (const [cust, [reg, bak]] of Object.entries(assignments))
  sql += `insert into public.customer_assignments (waitlist_id, regular_cleaner_id, backup_cleaner_id, assigned_by) values ((select id from public.customer_waitlist where email='${cust + D}'),(select id from public.cleaner_applications where email='${reg + D}'),${bak ? `(select id from public.cleaner_applications where email='${bak + D}')` : "null"},'seed');\n`;
for (const [name, local, role] of logins) {
  const id = "seed-" + local.replace(/\./g, "-");
  sql += `insert into public."user" (id,name,email,"emailVerified",role) values (${q(id)},${q(name)},${q(local + D)},true,${q(role)});\n`;
  sql += `insert into public."account" (id,"accountId","providerId","userId",password,"createdAt","updatedAt") values (${q(id + "-cred")},${q(id)},'credential',${q(id)},${q(hash)},now(),now());\n`;
}
process.stdout.write(sql);
console.error(`SEED_PASSWORD=${password}`);
