import { Metadata } from "next";

import type {
  Category,
  FoodEntry,
  HouseholdChemicalEntry,
  MedicationEntry,
  PesticideEntry,
  PlantEntry,
  SiteConfig,
} from "./types";
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

export function buildMedicationMetadata(
  medication: MedicationEntry,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    medication.meta_title ??
    `${medication.name} Poisoning in Dogs & Cats — PetPilot`;
  const description =
    medication.meta_description ??
    `Is ${medication.name} toxic to dogs and cats? Learn symptoms, emergency steps, and safer alternatives.`;
  const path = `/medications/${medication.slug}`;

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

export function buildHouseholdChemicalMetadata(
  chemical: HouseholdChemicalEntry,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    chemical.meta_title ??
    `${chemical.name} and Pets — Poisoning Risks | PetPilot`;
  const description =
    chemical.meta_description ??
    `Is ${chemical.name} safe around dogs and cats? Learn symptoms, what to do, and pet-safe alternatives.`;
  const path = `/household-chemicals/${chemical.slug}`;

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

export function buildPesticideMetadata(
  pesticide: PesticideEntry,
  config: SiteConfig,
  locale: Locale = defaultLocale
): Metadata {
  const title =
    pesticide.meta_title ??
    `${pesticide.name} and Pets — Toxicity Guide | PetPilot`;
  const description =
    pesticide.meta_description ??
    `Is ${pesticide.name} toxic to dogs and cats? Learn symptoms, emergency steps, and how to keep pets safe.`;
  const path = `/pesticides/${pesticide.slug}`;

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
