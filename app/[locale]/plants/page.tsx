import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Leaf } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PlantCard } from "@/components/plant/PlantCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllPlants, getSiteConfig } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

interface PlantsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PlantsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "PlantsPage" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: {
      canonical: `${config.base_url}/${locale}/plants`,
    },
  };
}

export default async function PlantsPage({ params }: PlantsPageProps) {
  const { locale } = await params;
  const plants = await getAllPlants(locale);
  const t = await getTranslations("PlantsPage");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: t("plants") }]} />
      <header className="mt-6">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/categories/houseplants"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          {t("houseplants")}
        </Link>
        <Link
          href="/categories/outdoor-plants"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          {t("outdoorPlants")}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} locale={locale} />
        ))}
      </div>
    </div>
  );
}
