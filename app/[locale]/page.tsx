import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { AlertTriangle } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchBarSkeleton } from "@/components/search/SearchBarSkeleton";
import { FoodCard } from "@/components/food/FoodCard";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import { HeroMesh } from "@/components/home/HeroMesh";
import { CategoryIcon } from "@/components/category/CategoryIcon";
import { NewsTypeBadge } from "@/components/news/NewsTypeBadge";
import {
  getAllCategories,
  getAllFoods,
  getSiteConfig,
  getHouseholdChemicalSlugs,
  getMedicationSlugs,
  getPesticideSlugs,
  getPlantSlugs,
} from "@/lib/content";
import {
  getAllNewsFrontmatterCached,
  loadClustersRaw,
  getTopRecallClustersByCoverage,
} from "@/lib/news-content";
import { locales, type Locale } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  return {
    title: `${config.tagline} | ${config.name}`,
    description: config.description,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [
    config,
    foods,
    categories,
    allNews,
    clusters,
    plantSlugs,
    medicationSlugs,
    householdChemicalSlugs,
    pesticideSlugs,
  ] = await Promise.all([
    getSiteConfig(locale),
    getAllFoods(locale),
    getAllCategories(locale),
    getAllNewsFrontmatterCached(locale),
    loadClustersRaw(locale),
    getPlantSlugs(locale),
    getMedicationSlugs(locale),
    getHouseholdChemicalSlugs(locale),
    getPesticideSlugs(locale),
  ]);

  const totalItems =
    foods.length +
    plantSlugs.length +
    medicationSlugs.length +
    householdChemicalSlugs.length +
    pesticideSlugs.length;

  const t = await getTranslations({ locale, namespace: "HomePage" });

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const criticalNewsItems = allNews
    .filter((item) => item.entry.severity === "critical" && new Date(item.entry.date) >= oneYearAgo)
    .slice(0, 5);

  const topRecallClusters = getTopRecallClustersByCoverage(clusters, { months: 3, limit: 2 });

  const recallClusterItems = topRecallClusters
    .map((cluster) => {
      const sourceItem = allNews.find((item) => item.slug === cluster.sources[0]?.slug);
      if (!sourceItem) return undefined;
      return {
        slug: cluster.canonicalSlug,
        entry: {
          ...sourceItem.entry,
          title: cluster.title,
          summary: cluster.summary,
          date: cluster.dateRange.end,
          severity: cluster.severity,
          species: cluster.species,
          substances: cluster.substances,
        },
      };
    })
    .filter(Boolean) as typeof criticalNewsItems;

  // Merge critical items and top recall clusters, deduplicate by slug, then take top 5 by date.
  const criticalNews = [...recallClusterItems, ...criticalNewsItems]
    .filter((item, index, self) => self.findIndex((i) => i.slug === item.slug) === index)
    .sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime())
    .slice(0, 5)
    .map((item) => ({
      ...item,
      entry: {
        ...item.entry,
        type: item.entry.type ?? "incident",
      } as typeof item.entry,
    }));

  const popularSlugs = [
    "grapes",
    "chocolate",
    "blueberries",
    "carrots",
    "onions",
    "xylitol",
    "apple-slices",
    "garlic",
  ];

  const popularFoods = popularSlugs
    .map((slug) => foods.find((food) => food.slug === slug))
    .filter((food): food is NonNullable<typeof food> => food !== undefined);

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-8">
        <HeroMesh />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            {config.tagline}
          </h1>
          <p className="mt-4 text-lg font-light text-muted-foreground">{t("heroSubtitle")}</p>
          <div className="mt-8">
            <Suspense fallback={<SearchBarSkeleton size="large" />}>
              <SearchBar locale={locale} size="large" />
            </Suspense>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("stats", {
              categories: categories.length,
              total: totalItems,
              foods: foods.length,
              plants: plantSlugs.length,
              medications: medicationSlugs.length,
              householdChemicals: householdChemicalSlugs.length,
              pesticides: pesticideSlugs.length,
            })}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{t("popularLabel")}{" "}</span>
            {popularFoods.slice(0, 6).map((food, index) => (
              <span key={food.slug}>
                <Link
                  href={`/foods/${food.slug}`}
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {food.name}
                </Link>
                {index < Math.min(5, popularFoods.length - 1) && ", "}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <EmergencyBanner locale={locale} />
      </section>

      {criticalNews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-primary bg-primary/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium text-foreground">{t("criticalNewsTitle")}</h2>
                  <Link
                    href="/news"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("criticalNewsCta")}
                  </Link>
                </div>
                <ul className="mt-3 grid auto-rows-fr gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {criticalNews.map((item) => (
                    <li key={item.slug} className="h-full">
                      <Link
                        href={`/news/${item.slug}`}
                        className="flex h-full flex-col rounded-xl bg-background p-2.5 text-sm text-foreground shadow-card transition-colors hover:bg-primary/10 hover:text-primary"
                        title={item.entry.title}
                      >
                        <div className="flex items-center gap-2">
                          <NewsTypeBadge type={item.entry.type} />
                          <time
                            dateTime={item.entry.date}
                            className="text-xs text-muted-foreground"
                            suppressHydrationWarning
                          >
                            {new Date(item.entry.date).toLocaleDateString(locale, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                        <span className="mt-1.5 block line-clamp-2 min-h-[2.5rem]">
                          {item.entry.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("browseCategories")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card"
            >
              {category.icon && (
                <CategoryIcon name={category.icon} className="h-5 w-5 shrink-0 text-primary" />
              )}
              <span className="font-medium text-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CollapsibleGridSection title={t("popularSearches")} count={popularFoods.length}>
          {popularFoods.map((food) => (
            <FoodCard key={food.slug} food={food} locale={locale} />
          ))}
        </CollapsibleGridSection>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("whyTrustTitle")}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mt-4 font-medium">{t("whyTrust.fastAnswers.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.fastAnswers.description")}</p>
            </div>
            <div>
              <h3 className="mt-4 font-medium">{t("whyTrust.vetReviewed.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.vetReviewed.description")}</p>
            </div>
            <div>
              <h3 className="mt-4 font-medium">{t("whyTrust.alwaysFree.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.alwaysFree.description")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
