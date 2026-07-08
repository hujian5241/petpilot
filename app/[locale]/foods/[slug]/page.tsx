import { notFound } from "next/navigation";

import { FoodDetail } from "@/components/food/FoodDetail";
import { getFoodBySlug, getFoodSlugs, getSiteConfig } from "@/lib/content";
import { buildFoodMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-static";

interface FoodPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getFoodSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FoodPageProps) {
  const { locale, slug } = await params;
  const food = await getFoodBySlug(slug, locale);
  if (!food) return {};
  const config = await getSiteConfig(locale);
  return buildFoodMetadata(food, config, locale);
}

export default async function FoodPage({ params }: FoodPageProps) {
  const { locale, slug } = await params;
  const food = await getFoodBySlug(slug, locale);

  if (!food) {
    notFound();
  }

  return <FoodDetail food={food} locale={locale} />;
}
