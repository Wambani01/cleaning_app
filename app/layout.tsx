import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";
import { brandName, tagline } from "@/components/ui";

const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: `${brandName} | Regular cleaners in Amsterdam`, template: `%s | ${brandName}` },
  description: tagline,
  openGraph: { type: "website", siteName: brandName, locale: "en_NL", title: `${brandName} | Regular cleaners in Amsterdam`, description: tagline, images: [{ url: "/images/home-hero.jpg", width: 1920, height: 1080, alt: "A cleaner and a homeowner greeting each other at the door of a bright Amsterdam home" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#04262c" };

const orgJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: brandName, description: tagline, areaServed: "Amsterdam, Netherlands", logo: `${origin}/logo.svg` };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Lets scroll reveals hide content only while JavaScript is running. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[60] rounded-full bg-white px-5 py-3 font-semibold text-ink-deep focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
        <SiteHeader name={brandName} />
        <div id="main" tabIndex={-1} className="outline-none">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
