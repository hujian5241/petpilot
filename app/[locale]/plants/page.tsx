import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Leaf } from "lucide-react";

import { Link } from "@/i18n/routing";
import { PlantCard } from "@/components/plant/PlantCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import { getAllPlants, getSiteConfig } from "@/lib/content";
import { buildItemListSchema } from "@/lib/jsonld";
import { buildAlternates } from "@/lib/metadata";
import type { PlantEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

function getPlantStatusPriority(plant: PlantEntry): StatusGroup {
  const statuses = [plant.safety.dogs.status, plant.safety.cats.status];
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

interface PlantsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: PlantsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "PlantsPage" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/plants", config, locale),
  };
}

export default async function PlantsPage({ params }: PlantsPageProps) {
  const { locale } = await params;
  const [plants, config] = await Promise.all([
    getAllPlants(locale),
    getSiteConfig(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "PlantsPage" });
  const tBadge = await getTranslations({ locale, namespace: "SafetyBadge" });

  const statusLabels: Record<StatusGroup, string> = {
    safe: tBadge("safe"),
    limited: tBadge("limited"),
    toxic: tBadge("toxic"),
    unknown: tBadge("unknown"),
  };

  const plantsByStatus = plants.reduce(
    (acc, plant) => {
      const group = getPlantStatusPriority(plant);
      acc[group].push(plant);
      return acc;
    },
    {
      safe: [] as PlantEntry[],
      limited: [] as PlantEntry[],
      toxic: [] as PlantEntry[],
      unknown: [] as PlantEntry[],
    }
  );

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const itemListJsonLd = buildItemListSchema(
    plants.map((plant) => ({
      name: plant.name,
      url: `${baseUrl}/${locale}/plants/${plant.slug}`,
    }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb locale={locale} items={[{ label: t("plants") }]} />
      <header className="mt-6">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
        </div>
        <p className="mt-2 text-lg font-light text-muted-foreground">{t("description")}</p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("quickSafetyOverview")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusOrder.map((status) => (
            <Link
              key={status}
              href={`#${status}`}
              className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card"
            >
              <p className="text-sm text-muted-foreground">{statusLabels[status]}</p>
              <p className="mt-1 text-3xl font-light text-foreground">{plantsByStatus[status].length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("plants")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
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
      </section>

      <CollapsibleGridSection title={t("allPlants")} count={plants.length}>
        {plants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} locale={locale} />
        ))}
      </CollapsibleGridSection>

      <div className="mt-16 space-y-12">
        {statusOrder.map((status) => {
          const groupPlants = plantsByStatus[status];
          if (groupPlants.length === 0) return null;
          return (
            <CollapsibleGridSection
              key={status}
              title={statusLabels[status]}
              count={groupPlants.length}
            >
              {groupPlants.map((plant) => (
                <PlantCard key={plant.slug} plant={plant} locale={locale} />
              ))}
            </CollapsibleGridSection>
          );
        })}
      </div>
    </div>
  );
}
