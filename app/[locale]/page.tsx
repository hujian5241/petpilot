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
import { CategoryIcon } from "@/components/category/CategoryIcon";
import {
  getAllCategories,
  getAllFoods,
  getSiteConfig,
  getHouseholdChemicalSlugs,
  getMedicationSlugs,
  getPesticideSlugs,
  getPlantSlugs,
} from "@/lib/content";
import { getAllNewsFrontmatterCached } from "@/lib/news-content";
import type { Locale } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
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
    plantSlugs,
    medicationSlugs,
    householdChemicalSlugs,
    pesticideSlugs,
  ] = await Promise.all([
    getSiteConfig(locale),
    getAllFoods(locale),
    getAllCategories(locale),
    getAllNewsFrontmatterCached(locale),
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

  const t = await getTranslations("HomePage");

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const criticalNews = allNews
    .filter((item) => item.entry.severity === "critical" && new Date(item.entry.date) >= oneYearAgo)
    .slice(0, 5);

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
      <section className="bg-gradient-to-b from-primary-light to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {config.tagline}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("heroSubtitle")}</p>
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
          <div className="rounded-lg border border-primary bg-primary/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-foreground">{t("criticalNewsTitle")}</h2>
                  <Link
                    href="/news"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("criticalNewsCta")}
                  </Link>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {criticalNews.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/news/${item.slug}`}
                        className="block rounded-md bg-background p-2.5 text-sm text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
                        title={item.entry.title}
                      >
                        <time dateTime={item.entry.date} className="text-xs text-muted-foreground">
                          {item.entry.date}
                        </time>
                        <span className="mt-0.5 block line-clamp-2">{item.entry.title}</span>
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
        <h2 className="text-2xl font-semibold text-foreground">{t("browseCategories")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
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
          <h2 className="text-2xl font-semibold text-foreground">{t("whyTrustTitle")}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.fastAnswers.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.fastAnswers.description")}</p>
            </div>
            <div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.vetReviewed.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.vetReviewed.description")}</p>
            </div>
            <div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.alwaysFree.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("whyTrust.alwaysFree.description")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
