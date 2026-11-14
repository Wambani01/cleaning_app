import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} – regular cleaners in Amsterdam`,
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav"><div className="wrap">
          <Link className="logo" href="/">{brand.name}</Link>
          <nav><Link href="/join">Become a member</Link><Link href="/apply">Work with us</Link></nav>
        </div></header>
        {children}
        <footer><div className="wrap">© {new Date().getFullYear()} {brand.name}, Amsterdam. <Link href="/admin">Admin</Link></div></footer>
      </body>
    </html>
  );
}
