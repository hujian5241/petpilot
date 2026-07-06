import type { MetadataRoute } from "next";

import { getSiteConfig } from "@/lib/content";
import { getAllNewsSlugs } from "@/lib/news-content";
import { defaultLocale, locales } from "@/lib/i18n";

type Sitemap = MetadataRoute.Sitemap;

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export default async function newsSitemap(): Promise<Sitemap> {
  const config = await getSiteConfig(defaultLocale);
  const baseUrl = normalizeBaseUrl(config.base_url);
  const slugs = await getAllNewsSlugs(defaultLocale);

  const routes: Sitemap = [];

  for (const locale of locales) {
    for (const slug of slugs) {
      routes.push({
        url: `${baseUrl}/${locale}/news/${slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return routes;
}
