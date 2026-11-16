"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/apply", label: "Work as a cleaner" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on);
  }, []);
  const active = (h: string) => path === h || path.startsWith(h + "/");

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${scrolled || open ? "border-line bg-white/90 shadow-sm" : "border-transparent bg-white/75"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-semibold text-primary-deep">
          <Image src="/logo.svg" alt="" width={38} height={38} priority />{name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-sand ${active(l.href) ? "text-primary-deep" : "text-ink"}`}>{l.label}</Link>
          ))}
          <Link href="/sign-in" className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-sand">Sign in</Link>
          <Link href="/join" className="group ml-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-ink-deep shadow-[0_8px_20px_-8px_rgba(16,177,199,.9)] transition hover:bg-mint">
            I need regular cleaning <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </nav>

        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(o => !o)}>
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-white px-5 pb-6 pt-3 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map(l => <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-sand">{l.label}</Link>)}
            <Link href="/sign-in" className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-sand">Sign in</Link>
            <Link href="/join" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-ink-deep">I need regular cleaning <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </nav>
      )}
    </header>
  );
}
