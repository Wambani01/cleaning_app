import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Container, brandName, tagline } from "@/components/ui";

export const metadata: Metadata = {
  title: `${brandName} – regular cleaners in Amsterdam`,
  description: tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-line bg-white">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="text-xl font-extrabold text-primary">{brandName}</Link>
              <nav className="flex gap-5 font-medium">
                <Link href="/join">Become a member</Link>
                <Link href="/apply">Work with us</Link>
              </nav>
            </div>
          </Container>
        </header>
        {children}
        <footer className="mt-6 border-t border-line py-8 text-sm text-muted">
          <Container>© {new Date().getFullYear()} {brandName}, Amsterdam. <Link href="/admin" className="underline">Admin</Link></Container>
        </footer>
      </body>
    </html>
  );
}
