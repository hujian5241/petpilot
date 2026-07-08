import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { SearchPageClient } from "@/components/search/SearchPageClient";
import {
  getAllFoods,
  getAllHouseholdChemicals,
  getAllMedications,
  getAllPesticides,
  getAllPlants,
  getAllCategories,
  getSiteConfig,
} from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { buildAlternates } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface SearchPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  return {
    title: t("title"),
    description: t("emptyState"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/search", config, locale),
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;
  const [foods, plants, medications, householdChemicals, pesticides, config, categories] =
    await Promise.all([
      getAllFoods(locale),
      getAllPlants(locale),
      getAllMedications(locale),
      getAllHouseholdChemicals(locale),
      getAllPesticides(locale),
      getSiteConfig(locale),
      getAllCategories(locale),
    ]);
  const searchIndex = buildSearchIndex(
    foods,
    plants,
    medications,
    householdChemicals,
    pesticides
  );

  return (
    <Suspense fallback={<SearchFallback locale={locale} />}>
      <SearchPageClient
        locale={locale}
        initialIndex={searchIndex}
        contactEmail={config.contact_email}
        stats={{
          categories: categories.length,
          foods: foods.length,
          plants: plants.length,
          medications: medications.length,
          householdChemicals: householdChemicals.length,
          pesticides: pesticides.length,
        }}
      />
    </Suspense>
  );
}

async function SearchFallback({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
      <p className="mt-6 text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
