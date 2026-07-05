import { notFound } from "next/navigation";

import { PesticideDetail } from "@/components/pesticide/PesticideDetail";
import { getPesticideBySlug, getPesticideSlugs, getSiteConfig } from "@/lib/content";
import { buildPesticideMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface PesticidePageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getPesticideSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PesticidePageProps) {
  const { locale, slug } = await params;
  const pesticide = await getPesticideBySlug(slug, locale);
  if (!pesticide) return {};
  const config = await getSiteConfig(locale);
  return buildPesticideMetadata(pesticide, config, locale);
}

export default async function PesticidePage({ params }: PesticidePageProps) {
  const { locale, slug } = await params;
  const pesticide = await getPesticideBySlug(slug, locale);

  if (!pesticide) {
    notFound();
  }

  return <PesticideDetail pesticide={pesticide} locale={locale} />;
}
