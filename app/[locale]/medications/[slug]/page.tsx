import { notFound } from "next/navigation";

import { MedicationDetail } from "@/components/medication/MedicationDetail";
import { getMedicationBySlug, getMedicationSlugs, getSiteConfig } from "@/lib/content";
import { buildMedicationMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface MedicationPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const slugs = await getMedicationSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MedicationPageProps) {
  const { locale, slug } = await params;
  const medication = await getMedicationBySlug(slug, locale);
  if (!medication) return {};
  const config = await getSiteConfig(locale);
  return buildMedicationMetadata(medication, config, locale);
}

export default async function MedicationPage({ params }: MedicationPageProps) {
  const { locale, slug } = await params;
  const medication = await getMedicationBySlug(slug, locale);

  if (!medication) {
    notFound();
  }

  return <MedicationDetail medication={medication} locale={locale} />;
}
