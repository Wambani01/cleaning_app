import Link from "next/link";
import { Container } from "@/components/ui";
import { SignOutButton } from "@/components/auth-forms";
import { portals, type Portal } from "@/lib/portals";

export function WrongPortal({ role, wanted }: { role: string | null | undefined; wanted: Portal }) {
  const own = portals[role as Portal];
  return (
    <main className="py-14"><Container>
      <h1 className="mb-3 text-3xl font-bold">This is not {wanted === "admin" ? "an" : "a"} {portals[wanted].label.toLowerCase()} account</h1>
      <p className="mb-4 max-w-xl text-muted">
        You are signed in with a {own ? own.label.toLowerCase() : "different"} account.{" "}
        {own && <>Go to the <Link className="text-primary-dark underline" href={own.home}>{own.label.toLowerCase()} portal</Link>, or </>}sign out and use the right account.
      </p>
      <SignOutButton to={portals[wanted].signIn} />
    </Container></main>
  );
}
