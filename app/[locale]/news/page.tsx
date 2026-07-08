import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Newspaper } from "lucide-react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MonthFilter } from "@/components/news/MonthFilter";
import { MonthSection, type MonthItem } from "@/components/news/MonthSection";
import { YearSection } from "@/components/news/YearSection";
import { SourceFilter } from "@/components/news/SourceFilter";
import { FilterGroup } from "@/components/news/FilterGroup";
import { ClearFilters } from "@/components/news/ClearFilters";
import {
  getAllNewsFrontmatter,
  groupNewsByMonth,
  getUniqueNewsValues,
  loadClustersRaw,
  buildClusterMap,
} from "@/lib/news-content";
import { getSiteConfig } from "@/lib/content";
import { buildItemListSchema } from "@/lib/jsonld";
import { type Locale } from "@/lib/i18n";
import type { NewsSeverity, NewsCluster, NewsItem, NewsEntry } from "@/lib/news-types";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    month?: string;
    all?: string;
    severity?: string;
    source?: string;
    species?: string;
    substance?: string;
    type?: string;
  }>;
}

const SEVERITIES: NewsSeverity[] = ["critical", "high", "moderate", "low"];
const NEWS_TYPES: Array<NonNullable<NewsEntry["type"]>> = ["recall", "alert", "incident"];

function groupMonthsByYear(months: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const month of months) {
    const year = month.split("-")[0];
    if (!year) continue;
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(month);
  }
  return grouped;
}

interface NewsArchiveProps {
  months: string[];
  grouped: Record<string, MonthItem[]>;
  locale: Locale;
  showAllLabel: string;
  showLessLabel: string;
}

function NewsArchive({
  months,
  grouped,
  locale,
  showAllLabel,
  showLessLabel,
}: NewsArchiveProps) {
  const recentMonths = months.slice(0, 2);
  const olderMonths = months.slice(2);
  const olderByYear = groupMonthsByYear(olderMonths);
  const yearEntries = Object.entries(olderByYear).sort(
    ([a], [b]) => Number(b) - Number(a)
  );

  return (
    <>
      {recentMonths.map((month) => (
        <MonthSection
          key={month}
          monthLabel={formatMonthLabel(month, locale)}
          items={grouped[month] ?? []}
          locale={locale}
          showAllLabel={showAllLabel}
          showLessLabel={showLessLabel}
          initialExpanded={false}
          collapseMode="clip"
        />
      ))}

      {yearEntries.map(([year, yearMonths]) => (
        <YearSection
          key={year}
          year={year}
          monthCount={yearMonths.length}
          showAllLabel={showAllLabel}
          showLessLabel={showLessLabel}
        >
          {yearMonths.map((month) => (
            <MonthSection
              key={month}
              monthLabel={formatMonthLabel(month, locale)}
              items={grouped[month] ?? []}
              locale={locale}
              showAllLabel={showAllLabel}
              showLessLabel={showLessLabel}
              initialExpanded={false}
              collapseMode="hide"
            />
          ))}
        </YearSection>
      ))}
    </>
  );
}

function buildBreadcrumbJsonLd(locale: Locale, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "News",
        item: `${baseUrl}/${locale}/news`,
      },
    ],
  };
}

function buildWebSiteJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PetPilot",
    url: baseUrl,
  };
}

export async function generateMetadata({ params, searchParams }: NewsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "NewsPage" });

  const {
    month,
    severity,
    source,
    species,
    substance,
  } = await searchParams;

  const hasActiveFilters = Boolean(
    month || severity || source || species || substance
  );

  const ogImage = `${config.base_url}/images/og-default.svg`;
  const metadata: Metadata = {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: {
      canonical: `${config.base_url}/${locale}/news`,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };

  if (hasActiveFilters) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

function formatMonthLabel(month: string, locale: Locale): string {
  return new Date(`${month}-01`).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
  });
}

function currentMonthLabel(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseFilterParam(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function matchesFilters(
  item: NewsItem,
  filters: {
    severities: string[];
    sources: string[];
    species: string[];
    substances: string[];
    types: string[];
  }
): boolean {
  const entry = item.entry;
  if (filters.severities.length > 0 && !filters.severities.includes(entry.severity)) {
    return false;
  }
  if (filters.sources.length > 0 && !filters.sources.includes(entry.source)) {
    return false;
  }
  if (filters.species.length > 0 && !entry.species.some((s) => filters.species.includes(s))) {
    return false;
  }
  if (filters.substances.length > 0 && !entry.substances.some((s) => filters.substances.includes(s))) {
    return false;
  }
  if (filters.types.length > 0 && !filters.types.includes(entry.type ?? "incident")) {
    return false;
  }
  return true;
}

function buildHref(
  pathname: string,
  current: {
    month?: string;
    all?: string;
    severity?: string;
    source?: string;
    species?: string;
    substance?: string;
  },
  updates: Record<string, string | undefined>
): string {
  const next = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      next[key as keyof typeof next] = value;
    } else {
      delete next[key as keyof typeof next];
    }
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function buildMonthItems(
  items: NewsItem[],
  clusterMap: Map<string, NewsCluster>
): MonthItem[] {
  const seenClusters = new Set<string>();
  const result: MonthItem[] = [];

  for (const item of items) {
    const cluster = clusterMap.get(item.slug);
    if (cluster) {
      if (seenClusters.has(cluster.id)) continue;
      seenClusters.add(cluster.id);
      result.push({ type: "cluster", data: cluster });
    } else {
      result.push({ type: "article", data: item });
    }
  }

  return result;
}

function groupMonthItemsByMonth(
  grouped: Record<string, NewsItem[]>,
  clusterMap: Map<string, NewsCluster>
): Record<string, MonthItem[]> {
  return Object.fromEntries(
    Object.entries(grouped).map(([month, items]) => [
      month,
      buildMonthItems(items, clusterMap),
    ])
  );
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params;
  const {
    month: rawMonth,
    all: rawAll,
    severity: rawSeverity,
    source: rawSource,
    species: rawSpecies,
    substance: rawSubstance,
    type: rawType,
  } = await searchParams;

  const showAllMonths = rawAll === "true";
  const severityFilter = parseFilterParam(rawSeverity);
  const sourceFilter = parseFilterParam(rawSource);
  const speciesFilter = parseFilterParam(rawSpecies);
  const substanceFilter = parseFilterParam(rawSubstance);
  const typeFilter = parseFilterParam(rawType);

  const [allNews, config, clusters] = await Promise.all([
    getAllNewsFrontmatter(locale),
    getSiteConfig(locale),
    loadClustersRaw(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "NewsPage" });

  const clusterMap = buildClusterMap(clusters);

  const activeFilters = {
    severities: severityFilter,
    sources: sourceFilter,
    species: speciesFilter,
    substances: substanceFilter,
    types: typeFilter,
  };

  const hasActiveFilters =
    severityFilter.length > 0 ||
    sourceFilter.length > 0 ||
    speciesFilter.length > 0 ||
    substanceFilter.length > 0 ||
    typeFilter.length > 0 ||
    !!rawMonth;

  const filteredNews = hasActiveFilters
    ? allNews.filter((item) => matchesFilters(item, activeFilters))
    : allNews;

  const grouped = groupNewsByMonth(filteredNews);
  const groupedItems = groupMonthItemsByMonth(grouped, clusterMap);
  const months = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  const sources = getUniqueNewsValues(allNews, "source");
  const species = getUniqueNewsValues(allNews, "species");
  const substances = getUniqueNewsValues(allNews, "substances");

  const currentMonth = currentMonthLabel();

  let selectedMonth: string | null = null;
  let isAllMonths = showAllMonths;

  if (rawMonth && months.includes(rawMonth)) {
    selectedMonth = rawMonth;
  } else if (!isAllMonths) {
    if (months.includes(currentMonth)) {
      selectedMonth = currentMonth;
    } else if (months.length > 0) {
      selectedMonth = months[0] ?? null;
    } else {
      isAllMonths = true;
    }
  }

  const monthFilterValue = selectedMonth ?? "";

  const currentParams = {
    month: rawMonth,
    all: rawAll,
    severity: rawSeverity,
    source: rawSource,
    species: rawSpecies,
    substance: rawSubstance,
    type: rawType,
  };

  const pathname = "/news";

  const baseUrl = config.base_url.endsWith("/") ? config.base_url.slice(0, -1) : config.base_url;
  const newsItemListJsonLd = buildItemListSchema(
    allNews.map((item) => ({
      name: item.entry.title,
      url: `${baseUrl}/${locale}/news/${item.slug}`,
    }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildWebSiteJsonLd(config.base_url),
            buildBreadcrumbJsonLd(locale, config.base_url),
            newsItemListJsonLd,
          ]).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb locale={locale} items={[{ label: t("news") }]} />

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
        </div>
        <p className="mt-2 text-lg font-light text-muted-foreground">{t("description")}</p>
      </header>

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block font-medium text-amber-950">{t("disclaimerTitle")}</strong>
        {t("disclaimerText")}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-4">
        <aside className="space-y-6 lg:col-span-1">
          <ClearFilters
            label={t("clearFilters")}
            href={pathname}
            visible={hasActiveFilters}
          />

          <MonthFilter
            key={monthFilterValue}
            locale={locale}
            months={Object.keys(grouped)}
            defaultValue={monthFilterValue}
            label={t("filterMonth")}
            buttonLabel={t("filterMonthButton")}
            allMonthsLabel={t("allMonths")}
            prevYearLabel={t("prevYear")}
            nextYearLabel={t("nextYear")}
            prevMonthLabel={t("prevMonth")}
            nextMonthLabel={t("nextMonth")}
            yearLabel={t("yearLabel")}
            yearPlaceholder={t("yearPlaceholder")}
            monthLabel={t("monthLabel")}
            monthPlaceholder={t("monthPlaceholder")}
            otherParams={{
              severity: rawSeverity,
              source: rawSource,
              species: rawSpecies,
              substance: rawSubstance,
              type: rawType,
            }}
          />

          <FilterGroup
            title={t("filterSeverity")}
            param="severity"
            mode="chip"
            items={SEVERITIES.map((severity) => ({
              value: severity,
              label: t(`severity.${severity}`),
            }))}
            selected={severityFilter}
            pathname={pathname}
            currentParams={currentParams}
          />

          <FilterGroup
            title={t("filterType")}
            param="type"
            mode="chip"
            items={NEWS_TYPES.map((type) => ({
              value: type,
              label: t(`type.${type}`),
            }))}
            selected={typeFilter}
            pathname={pathname}
            currentParams={currentParams}
          />

          <SourceFilter
            label={t("filterSource")}
            placeholder={t("sourcePlaceholder")}
            searchPlaceholder={t("searchSources")}
            allLabel={t("allSources")}
            noResultsLabel={t("noSourcesFound")}
            clearSearchLabel={t("clearSearch")}
            items={sources.map((source) => ({ value: source, label: source }))}
            selected={sourceFilter}
            param="source"
            pathname={pathname}
            currentParams={currentParams}
          />

          <FilterGroup
            title={t("filterSpecies")}
            param="species"
            mode="chip"
            items={species.map((s) => ({ value: s, label: t(`species.${s}`) }))}
            selected={speciesFilter}
            pathname={pathname}
            currentParams={currentParams}
          />

          <FilterGroup
            title={t("filterSubstance")}
            param="substance"
            mode="chip"
            items={substances.map((substance) => ({ value: substance, label: substance }))}
            selected={substanceFilter}
            pathname={pathname}
            currentParams={currentParams}
          />
        </aside>

        <div className="space-y-8 lg:col-span-3">
          {months.length === 0 && (
            <p className="text-muted-foreground">{t("noNews")}</p>
          )}

          {selectedMonth ? (
            <MonthSection
              key={selectedMonth}
              monthLabel={formatMonthLabel(selectedMonth, locale)}
              items={groupedItems[selectedMonth] ?? []}
              locale={locale}
              showAllLabel={t("showAll")}
              showLessLabel={t("showLess")}
              initialExpanded={true}
              collapseMode="clip"
              hideToggle
            />
          ) : (
            <NewsArchive
              months={months}
              grouped={groupedItems}
              locale={locale}
              showAllLabel={t("showAll")}
              showLessLabel={t("showLess")}
            />
          )}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-primary/5 px-6 py-10 text-center">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("subscribeTitle")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{t("subscribeDescription")}</p>
        <a
          href="/sitemap.xml"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
        >
          {t("rssCta")}
        </a>
      </section>
    </div>
  );
}
