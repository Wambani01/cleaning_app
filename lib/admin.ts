import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { portals, type Portal } from "@/lib/portals";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Returns the session only if the signed-in user is an admin. Use inside server actions. */
export async function requireAdmin() {
  const session = await getSession();
  return session && session.user.role === "admin" ? session : null;
}

/**
 * For portal pages: not signed in -> that portal's sign-in. Signed in with the wrong kind of
 * account -> returns { session, wrongRole: true } so the page can explain, instead of showing data.
 */
export async function requirePortal(portal: Portal) {
  const session = await getSession();
  if (!session) redirect(`${portals[portal].signIn}?next=${portals[portal].home}`);
  return { session, wrongRole: session.user.role !== portals[portal].role };
}
