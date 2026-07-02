import { notFound } from "next/navigation";

import { PlantDetail } from "@/components/plant/PlantDetail";
import { getPlantBySlug, getPlantSlugs, getSiteConfig } from "@/lib/content";
import { buildPlantMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface PlantPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getPlantSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PlantPageProps) {
  const { locale, slug } = await params;
  const plant = await getPlantBySlug(slug, locale);
  if (!plant) return {};
  const config = await getSiteConfig(locale);
  return buildPlantMetadata(plant, config, locale);
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { locale, slug } = await params;
  const plant = await getPlantBySlug(slug, locale);

  if (!plant) {
    notFound();
  }

  return <PlantDetail plant={plant} locale={locale} />;
}
