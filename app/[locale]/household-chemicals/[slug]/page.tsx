import { notFound } from "next/navigation";

import { HouseholdChemicalDetail } from "@/components/household-chemical/HouseholdChemicalDetail";

export const dynamic = "force-static";
import { getHouseholdChemicalBySlug, getHouseholdChemicalSlugs, getSiteConfig } from "@/lib/content";
import { buildHouseholdChemicalMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface HouseholdChemicalPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getHouseholdChemicalSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HouseholdChemicalPageProps) {
  const { locale, slug } = await params;
  const chemical = await getHouseholdChemicalBySlug(slug, locale);
  if (!chemical) return {};
  const config = await getSiteConfig(locale);
  return buildHouseholdChemicalMetadata(chemical, config, locale);
}

export default async function HouseholdChemicalPage({ params }: HouseholdChemicalPageProps) {
  const { locale, slug } = await params;
  const chemical = await getHouseholdChemicalBySlug(slug, locale);

  if (!chemical) {
    notFound();
  }

  return <HouseholdChemicalDetail chemical={chemical} locale={locale} />;
}
