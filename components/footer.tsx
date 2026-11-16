import Link from "next/link";
import Image from "next/image";
import { Container, brandName, company } from "@/components/ui";

const col = "grid content-start gap-2.5 text-sm";
const link = "text-white/70 transition hover:text-white";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-deep text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-heading text-2xl font-semibold"><Image src="/logo.svg" alt="" width={40} height={40} />{brandName}</Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">Regular cleaners for homes in Amsterdam, matched by us. A backup cleaner and breakage cover come with every membership.</p>
          </div>
          <nav aria-label="For homeowners" className={col}><p className="mb-1 font-semibold text-mint">For homeowners</p>
            <Link className={link} href="/join">Create free account</Link><Link className={link} href="/#how-it-works">How it works</Link><Link className={link} href="/#pricing">Pricing</Link><Link className={link} href="/join#faq">FAQ</Link><Link className={link} href="/customer/sign-in">Customer sign in</Link></nav>
          <nav aria-label="For cleaners" className={col}><p className="mb-1 font-semibold text-mint">For cleaners</p>
            <Link className={link} href="/apply">Work as a cleaner</Link><Link className={link} href="/apply#how-it-works">How joining works</Link><Link className={link} href="/apply#faq">Cleaner FAQ</Link><Link className={link} href="/cleaner/sign-in">Cleaner sign in</Link></nav>
          <nav aria-label="Company" className={col}><p className="mb-1 font-semibold text-mint">Company</p>
            <Link className={link} href="/">Home</Link><Link className={link} href="/about">About</Link><Link className={link} href="/contact">Contact</Link><Link className={link} href="/privacy">Privacy policy</Link><Link className={link} href="/terms">Terms and cancellation</Link></nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/55">
          <p>© {new Date().getFullYear()} {company.legalName}, Amsterdam</p>
          <p><Link className="hover:text-white" href="/admin/sign-in">Staff sign in</Link></p>
        </div>
      </Container>
    </footer>
  );
}
