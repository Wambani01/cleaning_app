import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

export const brandName = "Amsta Clean";
export const tagline = "Affordable regular cleaners in Amsterdam, with a backup and breakage cover.";
export const slogan = "A spotless home, without the stress.";
export const price = "€15";
export const hourlyRate = "€15";

export function Container({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto px-5 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>{children}</div>;
}

type Variant = "primary" | "light" | "ghost" | "dark";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-ink-deep shadow-[0_10px_28px_-10px_rgba(16,177,199,.95)] hover:bg-mint",
  light: "bg-white text-primary-deep shadow-[0_10px_28px_-12px_rgba(0,0,0,.5)] hover:bg-sand",
  ghost: "border border-white/50 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15",
  dark: "bg-ink-deep text-white hover:bg-primary-deep",
};

/** Pill button with an arrow that nudges forward on hover. */
export function ButtonLink({ href, variant = "primary", children, arrow = true }: { href: string; variant?: Variant; children: React.ReactNode; arrow?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold transition duration-300 hover:-translate-y-0.5 ${variants[variant]}`}>
      {children}{arrow && <ArrowRight size={18} className="transition duration-300 group-hover:translate-x-1" aria-hidden="true" />}
    </Link>
  );
}

/** Kept for older pages: "accent" is the primary teal button. */
export function Button({ href, variant = "accent", children }: { href: string; variant?: "accent" | "light"; children: React.ReactNode }) {
  return <ButtonLink href={href} variant={variant === "accent" ? "primary" : "light"}>{children}</ButtonLink>;
}

export function IconBadge({ icon: Icon, tone = "soft" }: { icon: LucideIcon; tone?: "soft" | "solid" | "glass" }) {
  const tones = { soft: "bg-primary/12 text-primary-dark", solid: "bg-primary text-ink-deep", glass: "bg-white/10 text-mint ring-1 ring-white/20" };
  return (
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
      <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}

export function Card({ children, icon, hover = true, className = "" }: { children: React.ReactNode; icon?: LucideIcon; hover?: boolean; className?: string }) {
  return (
    <div className={`rounded-3xl border border-line bg-white p-7 shadow-card ${hover ? "transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_24px_48px_-20px_rgba(4,38,44,.3)]" : ""} ${className}`}>
      {icon && <IconBadge icon={icon} />}
      {children}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">{children}</p>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-1.5 text-sm font-semibold">{label}{children}</label>;
}

export const inputClass = "w-full min-w-0 rounded-xl border border-line bg-white px-3.5 py-3 font-normal shadow-sm transition placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20";

export function Input(props: ComponentProps<"input">) { return <input className={inputClass} {...props} />; }

// TEMPORARY company details copied from lloydcleaningservices.nl. Replace with Amsta Clean's own before launch.
export const company = {
  legalName: "Amsta Clean",
  address: "W. Dreesweg 145, Almere, the Netherlands",
  email: "enquiries@lloydcleaningservices.nl",
  phone: "",
  kvk: "",
  vat: "",
};

/** Text page (privacy, terms) with a compact branded banner. */
export function Page({ title, draft, children }: { title: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <main>
      <div className="relative isolate overflow-hidden bg-ink-deep py-16 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_85%_0%,rgba(16,177,199,.35),transparent_70%),radial-gradient(50%_80%_at_0%_100%,rgba(7,97,112,.7),transparent_70%)]" aria-hidden="true" />
        <Container><h1 className="rise text-4xl font-semibold sm:text-5xl">{title}</h1></Container>
      </div>
      <div className="py-14"><Container narrow>
        <article className="space-y-4 leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {draft && <Note>Draft text for review. It must be checked by a Dutch lawyer before launch.</Note>}
          {children}
        </article>
      </Container></div>
    </main>
  );
}
