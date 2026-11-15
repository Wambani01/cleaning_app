import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";

const vercelHosts = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map(h => `https://${h}`);

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || vercelHosts[0] || "http://localhost:3000",
  trustedOrigins: [...vercelHosts, "http://localhost:3000"],
  emailAndPassword: { enabled: true, minPasswordLength: 10, autoSignIn: true },
  user: {
    additionalFields: {
      // Which portal the account belongs to. Sign-up may choose customer or cleaner only (enforced in the hook below).
      role: { type: "string", required: false, defaultValue: "customer", input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async user => {
          // Nobody can create an admin through sign-up, whatever they send. Admins are promoted in the database.
          const role = (user as { role?: string }).role;
          return { data: { ...user, role: role === "cleaner" ? "cleaner" : "customer" } };
        },
      },
      update: {
        before: async data => {
          // The role can be chosen at sign-up only. Changing it afterwards through the API is never allowed,
          // otherwise any signed-in user could make themselves an admin. Admins are promoted in the database.
          if ("role" in (data as object)) throw new APIError("FORBIDDEN", { message: "The role cannot be changed." });
          return { data };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
