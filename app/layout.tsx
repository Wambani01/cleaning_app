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
            <div className="flex flex-wrap items-center justify-between gap-x-4 py-2 sm:h-16 sm:py-0">
              <Link href="/" className="flex items-center gap-3 whitespace-nowrap font-heading text-xl font-bold text-primary-dark">
                <Image src="/logo.svg" alt="" width={40} height={40} priority />{brandName}
              </Link>
              <nav className="flex w-full justify-between gap-3 whitespace-nowrap sm:w-auto text-sm font-medium sm:justify-end sm:gap-5 sm:text-base">
                <Link href="/join"><span className="sm:hidden">Cleaning</span><span className="hidden sm:inline">I need regular cleaning</span></Link>
                <Link href="/apply">Work as a cleaner</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/sign-in" className="hidden font-semibold text-primary-dark sm:inline">Sign in</Link>
              </nav>
            </div>
          </Container>
        </header>
        {children}
        <footer className="mt-6 border-t border-line py-8 text-sm text-muted">
          <Container>
            <div className="mb-4 grid gap-6 sm:grid-cols-4">
              <div><p className="font-semibold text-ink">{brandName}</p><p>Regular cleaners in Amsterdam.</p></div>
              <div><p className="font-semibold text-ink">Customers</p><Link href="/join" className="block">I need regular cleaning</Link><Link href="/#faq" className="block">FAQ</Link></div>
              <div><p className="font-semibold text-ink">Company</p><Link href="/sign-in" className="block">Sign in</Link><Link href="/about" className="block">About</Link><Link href="/contact" className="block">Contact</Link><Link href="/privacy" className="block">Privacy policy</Link><Link href="/terms" className="block">Terms and cancellation</Link></div>
              <div><p className="font-semibold text-ink">Cleaners</p><Link href="/apply" className="block">Work as a cleaner</Link></div>
            </div>
            © {new Date().getFullYear()} {brandName}, Amsterdam. 
          </Container>
        </footer>
      </body>
    </html>
  );
}
