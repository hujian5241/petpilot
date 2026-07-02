import { Metadata } from "next";

import type { FoodEntry, PlantEntry, Category, SiteConfig } from "./types";
import { locales, type Locale, defaultLocale } from "./i18n";

function buildAlternates(
  path: string,
  config: SiteConfig,
  locale: Locale
): NonNullable<Metadata["alternates"]> {
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages["x-default"] = `${baseUrl}/${defaultLocale}${path}`;

  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages,
  };
}

export function buildSiteMetadata(
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const path = "/";

  return {
    title: {
      default: `${config.name} — ${config.tagline}`,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    metadataBase: new URL(config.base_url),
    openGraph: {
      type: "website",
      siteName: config.name,
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      images: [config.default_og_image],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      images: [config.default_og_image],
    },
    alternates: buildAlternates(path, config, locale),
  };
}

export function buildFoodMetadata(
  food: FoodEntry,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    food.meta_title ?? `Can Dogs Eat ${food.name}? Safety, Risks & Alternatives`;
  const description =
    food.meta_description ??
    `${food.name} is ${food.safety.dogs.status} for dogs and ${food.safety.cats.status} for cats. Learn why, what symptoms to watch for, and find safe alternatives. Vet-reviewed guide from PetPilot.`;
  const path = `/foods/${food.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: buildAlternates(path, config, locale),
  };
}

export function buildPlantMetadata(
  plant: PlantEntry,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    plant.meta_title ?? `${plant.name} and Pets — Safety Guide | PetPilot`;
  const description =
    plant.meta_description ??
    `Is ${plant.name} safe for dogs and cats? Learn symptoms, risks, and what to do if your pet eats it.`;
  const path = `/plants/${plant.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: buildAlternates(path, config, locale),
  };
}

export function buildCategoryMetadata(
  category: Category,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    category.meta_title ??
    `${category.name} Dogs & Cats Can Eat: Safe & Toxic List`;
  const description =
    category.meta_description ??
    `Explore ${category.name.toLowerCase()} that are safe, limited, or toxic for dogs and cats. Vet-reviewed information from PetPilot.`;
  const path = `/categories/${category.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      locale,
    },
    alternates: buildAlternates(path, config, locale),
  };
}
