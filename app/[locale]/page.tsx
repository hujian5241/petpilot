import { Suspense } from "react";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { SearchBar } from "@/components/search/SearchBar";
import { FoodCard } from "@/components/food/FoodCard";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { getAllCategories, getAllFoods, getSiteConfig } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  return {
    title: config.tagline,
    description: config.description,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [config, foods, categories] = await Promise.all([
    getSiteConfig(locale),
    getAllFoods(locale),
    getAllCategories(locale),
  ]);

  const t = await getTranslations("HomePage");

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
          <p className="mt-4 text-lg text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-14 w-full animate-pulse rounded-full bg-muted" />}>
              <SearchBar locale={locale} size="large" />
            </Suspense>
          </div>
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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-foreground">{t("browseCategories")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <Search className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">{t("popularSearches")}</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:text-primary-dark">
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularFoods.map((food) => (
            <FoodCard key={food.slug} food={food} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">{t("whyTrustTitle")}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.fastAnswers.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("whyTrust.fastAnswers.description")}
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.vetReviewed.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("whyTrust.vetReviewed.description")}
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t("whyTrust.alwaysFree.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("whyTrust.alwaysFree.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
