import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { HazardCard } from "@/components/hazard/HazardCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import { getAllCategories, getAllPesticides, getSiteConfig } from "@/lib/content";
import type { PesticideEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

function getStatusPriority(entry: PesticideEntry): StatusGroup {
  const statuses = [entry.safety.dogs.status, entry.safety.cats.status];
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

interface PesticidesPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PesticidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "PesticidesPage" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/pesticides", config, locale),
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

export default async function PesticidesPage({ params }: PesticidesPageProps) {
  const { locale } = await params;
  const [pesticides, categories] = await Promise.all([
    getAllPesticides(locale),
    getAllCategories(locale),
  ]);
  const t = await getTranslations("PesticidesPage");
  const tBadge = await getTranslations("SafetyBadge");

  const statusLabels: Record<StatusGroup, string> = {
    safe: tBadge("safe"),
    limited: tBadge("limited"),
    toxic: tBadge("toxic"),
    unknown: tBadge("unknown"),
  };

  const pesticidesByStatus = pesticides.reduce(
    (acc, pesticide) => {
      const group = getStatusPriority(pesticide);
      acc[group].push(pesticide);
      return acc;
    },
    {
      safe: [] as PesticideEntry[],
      limited: [] as PesticideEntry[],
      toxic: [] as PesticideEntry[],
      unknown: [] as PesticideEntry[],
    }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: t("pesticides") }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("description")}</p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">{t("quickSafetyOverview")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusOrder.map((status) => (
            <Link
              key={status}
              href={`#${status}`}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{statusLabels[status]}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{pesticidesByStatus[status].length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("pesticides")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">{t("browseByCategory")}</h2>
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

      <CollapsibleGridSection title={t("allPesticides")} count={pesticides.length}>
        {pesticides.map((pesticide) => (
          <HazardCard key={pesticide.slug} entry={pesticide} type="pesticide" locale={locale} />
        ))}
      </CollapsibleGridSection>

      <div className="mt-16 space-y-12">
        {statusOrder.map((status) => {
          const groupPesticides = pesticidesByStatus[status];
          if (groupPesticides.length === 0) return null;
          return (
            <CollapsibleGridSection
              key={status}
              title={statusLabels[status]}
              count={groupPesticides.length}
            >
              {groupPesticides.map((pesticide) => (
                <HazardCard key={pesticide.slug} entry={pesticide} type="pesticide" locale={locale} />
              ))}
            </CollapsibleGridSection>
          );
        })}
      </div>
    </div>
  );
}
