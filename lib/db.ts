import "server-only";
import { Pool } from "pg";

// One shared Postgres pool (the Supabase pooler connection string in DATABASE_URL).
// It does not connect until the first query, so importing it at build time is safe.
declare global { var __pgPool: Pool | undefined; }

export const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalThis.__pgPool = pool;
