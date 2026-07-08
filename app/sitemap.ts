import type { MetadataRoute } from "next";

import {
  getAllCategories,
  getAllGuides,
  getFoodSlugs,
  getHouseholdChemicalSlugs,
  getMedicationSlugs,
  getPesticideSlugs,
  getPlantSlugs,
  getSiteConfig,
} from "@/lib/content";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

type Sitemap = MetadataRoute.Sitemap;

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function entry(
  url: string,
  options: {
    priority?: number;
    changeFrequency?: Sitemap[number]["changeFrequency"];
    lastModified?: Date;
  } = {}
): Sitemap[number] {
  return {
    url,
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.6,
  };
}

export default async function sitemap(): Promise<Sitemap> {
  const config = await getSiteConfig(defaultLocale);
  const baseUrl = normalizeBaseUrl(config.base_url);

  const [
    categories,
    foodSlugs,
    plantSlugs,
    medicationSlugs,
    householdChemicalSlugs,
    pesticideSlugs,
  ] = await Promise.all([
    getAllCategories(defaultLocale),
    getFoodSlugs(defaultLocale),
    getPlantSlugs(defaultLocale),
    getMedicationSlugs(defaultLocale),
    getHouseholdChemicalSlugs(defaultLocale),
    getPesticideSlugs(defaultLocale),
  ]);

  const guidesByLocale = await Promise.all(
    locales.map((locale) => getAllGuides(locale))
  );

  const routes: Sitemap = [];

  for (const [localeIndex, locale] of locales.entries()) {
    const prefix = `${baseUrl}/${locale}`;
    const guides = guidesByLocale[localeIndex];

    // Core pages (no news detail pages; those live in news-sitemap.xml)
    routes.push(entry(`${prefix}/`, { priority: 1.0, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/search`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/news`, { priority: 0.8, changeFrequency: "daily" }));
    routes.push(entry(`${prefix}/guides`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/emergency`, { priority: 0.9, changeFrequency: "monthly" }));
    routes.push(entry(`${prefix}/emergency/wizard`, { priority: 0.8, changeFrequency: "monthly" }));
    routes.push(entry(`${prefix}/about`, { priority: 0.5, changeFrequency: "monthly" }));
    routes.push(entry(`${prefix}/privacy`, { priority: 0.3, changeFrequency: "yearly" }));
    routes.push(entry(`${prefix}/terms`, { priority: 0.3, changeFrequency: "yearly" }));

    // Category list pages
    routes.push(entry(`${prefix}/foods`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/plants`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/medications`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(
      entry(`${prefix}/household-chemicals`, { priority: 0.8, changeFrequency: "weekly" })
    );
    routes.push(entry(`${prefix}/pesticides`, { priority: 0.8, changeFrequency: "weekly" }));

    // Category detail pages
    for (const category of categories) {
      routes.push(
        entry(`${prefix}/categories/${category.slug}`, {
          priority: 0.7,
          changeFrequency: "weekly",
        })
      );
    }

    // Item detail pages
    for (const slug of foodSlugs) {
      routes.push(entry(`${prefix}/foods/${slug}`, { priority: 0.6, changeFrequency: "monthly" }));
    }
    for (const slug of plantSlugs) {
      routes.push(entry(`${prefix}/plants/${slug}`, { priority: 0.6, changeFrequency: "monthly" }));
    }
    for (const slug of medicationSlugs) {
      routes.push(
        entry(`${prefix}/medications/${slug}`, { priority: 0.6, changeFrequency: "monthly" })
      );
    }
    for (const slug of householdChemicalSlugs) {
      routes.push(
        entry(`${prefix}/household-chemicals/${slug}`, {
          priority: 0.6,
          changeFrequency: "monthly",
        })
      );
    }
    for (const slug of pesticideSlugs) {
      routes.push(
        entry(`${prefix}/pesticides/${slug}`, { priority: 0.6, changeFrequency: "monthly" })
      );
    }

    // Guide detail pages
    for (const guide of guides ?? []) {
      routes.push(
        entry(`${prefix}/guides/${guide.slug}`, {
          priority: 0.7,
          changeFrequency: "monthly",
          lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(guide.published_at),
        })
      );
    }
  }

  return routes;
}
