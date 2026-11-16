import type { MetadataRoute } from "next";

const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [["/", 1], ["/i-need-a-cleaner", 0.9], ["/join", 0.7], ["/apply", 0.9], ["/about", 0.6], ["/contact", 0.5], ["/privacy", 0.3], ["/terms", 0.3]];
  return pages.map(([path, priority]) => ({ url: `${origin}${path}`, changeFrequency: "monthly", priority }));
}
