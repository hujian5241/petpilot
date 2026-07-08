import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { FoodCard } from "@/components/food/FoodCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import { getAllCategories, getAllFoods, getSiteConfig } from "@/lib/content";
import { buildItemListSchema } from "@/lib/jsonld";
import { buildAlternates } from "@/lib/metadata";
import type { FoodEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

function getFoodStatusPriority(food: FoodEntry): StatusGroup {
  const statuses = [food.safety.dogs.status, food.safety.cats.status];
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

interface FoodsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: FoodsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "FoodsPage" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/foods", config, locale),
  };
}

export default async function FoodsPage({ params }: FoodsPageProps) {
  const { locale } = await params;
  const [foods, categories, config] = await Promise.all([
    getAllFoods(locale),
    getAllCategories(locale),
    getSiteConfig(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "FoodsPage" });
  const tBadge = await getTranslations({ locale, namespace: "SafetyBadge" });

  const statusLabels: Record<StatusGroup, string> = {
    safe: tBadge("safe"),
    limited: tBadge("limited"),
    toxic: tBadge("toxic"),
    unknown: tBadge("unknown"),
  };

  const foodsByStatus = foods.reduce(
    (acc, food) => {
      const group = getFoodStatusPriority(food);
      acc[group].push(food);
      return acc;
    },
    {
      safe: [] as FoodEntry[],
      limited: [] as FoodEntry[],
      toxic: [] as FoodEntry[],
      unknown: [] as FoodEntry[],
    }
  );

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const itemListJsonLd = buildItemListSchema(
    foods.map((food) => ({
      name: food.name,
      url: `${baseUrl}/${locale}/foods/${food.slug}`,
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
      <Breadcrumb locale={locale} items={[{ label: t("foods") }]} />

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
              <p className="mt-1 text-3xl font-light text-foreground">{foodsByStatus[status].length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("foods")}</p>
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

      <CollapsibleGridSection title={t("allFoods")} count={foods.length}>
        {foods.map((food) => (
          <FoodCard key={food.slug} food={food} locale={locale} />
        ))}
      </CollapsibleGridSection>

      <div className="mt-16 space-y-12">
        {statusOrder.map((status) => {
          const groupFoods = foodsByStatus[status];
          if (groupFoods.length === 0) return null;
          return (
            <CollapsibleGridSection
              key={status}
              title={`${statusLabels[status]}`}
              count={groupFoods.length}
            >
              {groupFoods.map((food) => (
                <FoodCard key={food.slug} food={food} locale={locale} />
              ))}
            </CollapsibleGridSection>
          );
        })}
      </div>
    </div>
  );
}
