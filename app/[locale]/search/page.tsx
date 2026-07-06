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
  getSiteConfig,
} from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
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

function buildAlternates(
  path: string,
  config: Awaited<ReturnType<typeof getSiteConfig>>,
  locale: Locale
) {
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;
  const languages: Record<string, string> = {};
  for (const loc of ["en", "de", "fr", "ja"] as const) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages["x-default"] = `${baseUrl}/en${path}`;
  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages,
  };
}

interface SearchPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;
  const [foods, plants, medications, householdChemicals, pesticides, config] =
    await Promise.all([
      getAllFoods(locale),
      getAllPlants(locale),
      getAllMedications(locale),
      getAllHouseholdChemicals(locale),
      getAllPesticides(locale),
      getSiteConfig(locale),
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
      />
    </Suspense>
  );
}

async function SearchFallback({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-6 text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
