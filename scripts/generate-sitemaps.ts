import fs from "fs/promises";
import path from "path";

import {
  getAllCategories,
  getFoodSlugs,
  getHouseholdChemicalSlugs,
  getMedicationSlugs,
  getPesticideSlugs,
  getPlantSlugs,
  getSiteConfig,
} from "../lib/content";
import { getAllNews } from "../lib/news-content";
import { locales, defaultLocale } from "../lib/i18n";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface UrlEntry {
  loc: string;
  path: string;
  priority: number;
  lastmod?: string;
}

function buildAlternateLinks(baseUrl: string, path: string): string {
  const links = locales
    .map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(
          `${baseUrl}/${locale}${path}`
        )}" />`
    )
    .join("\n");

  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
    `${baseUrl}/${defaultLocale}${path}`
  )}" />`;

  return `${links}\n${xDefault}`;
}

function buildUrlSet(urls: UrlEntry[], baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n${buildAlternateLinks(
        baseUrl,
        u.path
      )}${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;
}

async function main() {
  const [config, categories, foodSlugs, plantSlugs, medicationSlugs, householdChemicalSlugs, pesticideSlugs, newsFiles] = await Promise.all([
    getSiteConfig(defaultLocale),
    getAllCategories(defaultLocale),
    getFoodSlugs(defaultLocale),
    getPlantSlugs(defaultLocale),
    getMedicationSlugs(defaultLocale),
    getHouseholdChemicalSlugs(defaultLocale),
    getPesticideSlugs(defaultLocale),
    getAllNews(defaultLocale),
  ]);

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const outDir = path.join(process.cwd(), "public", "sitemaps");
  await fs.mkdir(outDir, { recursive: true });

  for (const locale of locales) {
    const localePrefix = `/${locale}`;

    const staticUrls: UrlEntry[] = [
      { loc: `${baseUrl}${localePrefix}/`, path: "/", priority: 1 },
      { loc: `${baseUrl}${localePrefix}/foods`, path: "/foods", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/plants`, path: "/plants", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/medications`, path: "/medications", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/household-chemicals`, path: "/household-chemicals", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/pesticides`, path: "/pesticides", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/search`, path: "/search", priority: 0.9 },
      { loc: `${baseUrl}${localePrefix}/emergency`, path: "/emergency", priority: 0.8 },
      { loc: `${baseUrl}${localePrefix}/news`, path: "/news", priority: 0.7 },
      { loc: `${baseUrl}${localePrefix}/about`, path: "/about", priority: 0.5 },
      { loc: `${baseUrl}${localePrefix}/terms`, path: "/terms", priority: 0.3 },
      { loc: `${baseUrl}${localePrefix}/privacy`, path: "/privacy", priority: 0.3 },
      ...categories.map((c) => ({
        loc: `${baseUrl}${localePrefix}/categories/${c.slug}`,
        path: `/categories/${c.slug}`,
        priority: 0.7,
      })),
      ...newsFiles.map((n) => ({
        loc: `${baseUrl}${localePrefix}/news/${n.slug}`,
        path: `/news/${n.slug}`,
        priority: 0.6,
        lastmod: n.updatedAt,
      })),
    ];

    const foodUrls: UrlEntry[] = foodSlugs.map((slug) => ({
      loc: `${baseUrl}${localePrefix}/foods/${slug}`,
      path: `/foods/${slug}`,
      priority: 0.8,
    }));

    const plantUrls: UrlEntry[] = plantSlugs.map((slug) => ({
      loc: `${baseUrl}${localePrefix}/plants/${slug}`,
      path: `/plants/${slug}`,
      priority: 0.8,
    }));

    const medicationUrls: UrlEntry[] = medicationSlugs.map((slug) => ({
      loc: `${baseUrl}${localePrefix}/medications/${slug}`,
      path: `/medications/${slug}`,
      priority: 0.8,
    }));

    const householdChemicalUrls: UrlEntry[] = householdChemicalSlugs.map((slug) => ({
      loc: `${baseUrl}${localePrefix}/household-chemicals/${slug}`,
      path: `/household-chemicals/${slug}`,
      priority: 0.8,
    }));

    const pesticideUrls: UrlEntry[] = pesticideSlugs.map((slug) => ({
      loc: `${baseUrl}${localePrefix}/pesticides/${slug}`,
      path: `/pesticides/${slug}`,
      priority: 0.8,
    }));

    const allUrls = [
      ...staticUrls,
      ...foodUrls,
      ...plantUrls,
      ...medicationUrls,
      ...householdChemicalUrls,
      ...pesticideUrls,
    ];

    await fs.writeFile(
      path.join(outDir, `sitemap-${locale}.xml`),
      buildUrlSet(allUrls, baseUrl),
      "utf-8"
    );
  }

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locales
  .map(
    (locale) =>
      `  <sitemap><loc>${escapeXml(`${baseUrl}/sitemaps/sitemap-${locale}.xml`)}</loc></sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  await fs.writeFile(path.join(process.cwd(), "public", "sitemap.xml"), indexXml, "utf-8");

  console.log("Generated static sitemaps:");
  console.log(`- public/sitemap.xml (${locales.length} sub-sitemaps)`);
  for (const locale of locales) {
    console.log(`- public/sitemaps/sitemap-${locale}.xml`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
