import Link from "next/link";
import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

export const brandName = "Amsta Clean";
export const tagline = "Affordable regular cleaners in Amsterdam, with a backup and breakage cover."
export const slogan = "A spotless home, without the stress.";
export const price = "€15";
export const hourlyRate = "€15";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-5">{children}</div>;
}

export function Button({ href, variant = "accent", children }: { href: string; variant?: "accent" | "light"; children: React.ReactNode }) {
  const styles = variant === "accent" ? "bg-primary text-ink hover:bg-mint" : "bg-white text-primary-deep";
  return <Link href={href} className={`inline-block rounded-lg px-6 py-3 font-bold ${styles}`}>{children}</Link>;
}

export function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary-dark">
      <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}

export function Card({ children, icon, hover = true }: { children: React.ReactNode; icon?: LucideIcon; hover?: boolean }) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-6 ${hover ? "transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg" : ""}`}>
      {icon && <IconBadge icon={icon} />}
      {children}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{children}</p>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-1.5 text-sm font-semibold">{label}{children}</label>;
}

export const inputClass = "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2.5 font-normal";

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

export function Page({ title, draft, children }: { title: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <main className="py-14"><Container>
      <article className="max-w-3xl space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <h1 className="text-4xl font-bold">{title}</h1>
        {draft && <Note>Draft text for review. It must be checked by a Dutch lawyer before launch.</Note>}
        {children}
      </article>
    </Container></main>
  );
}
