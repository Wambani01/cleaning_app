import "./globals.css";
import Link from "next/link";
import Image from "next/image";
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
              <Link href="/" className="flex items-center gap-3 whitespace-nowrap font-heading text-xl font-bold text-primary-dark">
                <Image src="/logo.svg" alt="" width={40} height={40} priority />{brandName}
              </Link>
              <nav className="flex gap-4 whitespace-nowrap text-sm font-medium sm:gap-5 sm:text-base">
                <Link href="/join">Join</Link>
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
