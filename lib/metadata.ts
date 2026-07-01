import { Metadata } from "next";

import type { FoodEntry, PlantEntry, Category, SiteConfig } from "./types";

export function buildSiteMetadata(config: SiteConfig): Metadata {
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
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} — ${config.tagline}`,
      description: config.description,
      images: [config.default_og_image],
    },
  };
}

export function buildFoodMetadata(food: FoodEntry): Metadata {
  const title =
    food.meta_title ?? `Can Dogs Eat ${food.name}? Safety, Risks & Alternatives`;
  const description =
    food.meta_description ??
    `${food.name} is ${food.safety.dogs.status} for dogs and ${food.safety.cats.status} for cats. Learn why, what symptoms to watch for, and find safe alternatives. Vet-reviewed guide from PetPilot.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/foods/${food.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildPlantMetadata(plant: PlantEntry): Metadata {
  const title =
    plant.meta_title ?? `${plant.name} and Pets — Safety Guide | PetPilot`;
  const description =
    plant.meta_description ??
    `Is ${plant.name} safe for dogs and cats? Learn symptoms, risks, and what to do if your pet eats it.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/plants/${plant.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildCategoryMetadata(category: Category): Metadata {
  const title =
    category.meta_title ??
    `${category.name} Dogs & Cats Can Eat: Safe & Toxic List`;
  const description =
    category.meta_description ??
    `Explore ${category.name.toLowerCase()} that are safe, limited, or toxic for dogs and cats. Vet-reviewed information from PetPilot.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/categories/${category.slug}`,
    },
  };
}
