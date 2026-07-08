import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { HazardCard } from "@/components/hazard/HazardCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import { getAllCategories, getAllHouseholdChemicals, getSiteConfig } from "@/lib/content";
import { buildItemListSchema } from "@/lib/jsonld";
import { buildAlternates } from "@/lib/metadata";
import type { HouseholdChemicalEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

function getStatusPriority(entry: HouseholdChemicalEntry): StatusGroup {
  const statuses = [entry.safety.dogs.status, entry.safety.cats.status];
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

interface HouseholdChemicalsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: HouseholdChemicalsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "HouseholdChemicalsPage" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/household-chemicals", config, locale),
  };
}

export default async function HouseholdChemicalsPage({ params }: HouseholdChemicalsPageProps) {
  const { locale } = await params;
  const [chemicals, categories, config] = await Promise.all([
    getAllHouseholdChemicals(locale),
    getAllCategories(locale),
    getSiteConfig(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "HouseholdChemicalsPage" });
  const tBadge = await getTranslations({ locale, namespace: "SafetyBadge" });

  const statusLabels: Record<StatusGroup, string> = {
    safe: tBadge("safe"),
    limited: tBadge("limited"),
    toxic: tBadge("toxic"),
    unknown: tBadge("unknown"),
  };

  const chemicalsByStatus = chemicals.reduce(
    (acc, chemical) => {
      const group = getStatusPriority(chemical);
      acc[group].push(chemical);
      return acc;
    },
    {
      safe: [] as HouseholdChemicalEntry[],
      limited: [] as HouseholdChemicalEntry[],
      toxic: [] as HouseholdChemicalEntry[],
      unknown: [] as HouseholdChemicalEntry[],
    }
  );

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const itemListJsonLd = buildItemListSchema(
    chemicals.map((chemical) => ({
      name: chemical.name,
      url: `${baseUrl}/${locale}/household-chemicals/${chemical.slug}`,
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
      <Breadcrumb locale={locale} items={[{ label: t("householdChemicals") }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
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
              <p className="mt-1 text-3xl font-light text-foreground">{chemicalsByStatus[status].length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("householdChemicals")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("browseByCategory")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <CollapsibleGridSection title={t("allHouseholdChemicals")} count={chemicals.length}>
        {chemicals.map((chemical) => (
          <HazardCard key={chemical.slug} entry={chemical} type="household-chemical" locale={locale} />
        ))}
      </CollapsibleGridSection>

      <div className="mt-16 space-y-12">
        {statusOrder.map((status) => {
          const groupChemicals = chemicalsByStatus[status];
          if (groupChemicals.length === 0) return null;
          return (
            <CollapsibleGridSection
              key={status}
              title={statusLabels[status]}
              count={groupChemicals.length}
            >
              {groupChemicals.map((chemical) => (
                <HazardCard key={chemical.slug} entry={chemical} type="household-chemical" locale={locale} />
              ))}
            </CollapsibleGridSection>
          );
        })}
      </div>
    </div>
  );
}
