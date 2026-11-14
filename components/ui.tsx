import Link from "next/link";
import type { ComponentProps } from "react";

export const brandName = "Lloyd Cleaning";
export const tagline = "Affordable regular cleaners in Amsterdam, with a backup and breakage cover.";
export const price = "€15";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-5">{children}</div>;
}

export function Button({ href, variant = "accent", children }: { href: string; variant?: "accent" | "light"; children: React.ReactNode }) {
  const styles = variant === "accent" ? "bg-accent text-ink" : "bg-white text-primary";
  return <Link href={href} className={`inline-block rounded-lg px-6 py-3 font-bold ${styles}`}>{children}</Link>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-6">{children}</div>;
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{children}</p>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-semibold">{label}{children}</label>;
}

export const inputClass = "rounded-lg border border-line bg-white px-3 py-2.5 font-normal";

export function Input(props: ComponentProps<"input">) { return <input className={inputClass} {...props} />; }
