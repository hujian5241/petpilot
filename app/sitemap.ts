import type { MetadataRoute } from "next";

import {
  getAllCategories,
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
  } = {}
): Sitemap[number] {
  return {
    url,
    lastModified: new Date(),
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

  const routes: Sitemap = [];

  for (const locale of locales) {
    const prefix = `${baseUrl}/${locale}`;

    // Core pages
    routes.push(entry(`${prefix}/`, { priority: 1.0, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/search`, { priority: 0.8, changeFrequency: "weekly" }));
    routes.push(entry(`${prefix}/news`, { priority: 0.8, changeFrequency: "daily" }));
    routes.push(entry(`${prefix}/emergency`, { priority: 0.9, changeFrequency: "monthly" }));
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
  }

  return routes;
}
