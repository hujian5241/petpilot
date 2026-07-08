import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";

import { FoodCard } from "@/components/food/FoodCard";
import { PlantCard } from "@/components/plant/PlantCard";
import { HazardCard } from "@/components/hazard/HazardCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CollapsibleGridSection } from "@/components/layout/CollapsibleGridSection";
import {
  getAllCategories,
  getAllFoods,
  getAllHouseholdChemicals,
  getAllMedications,
  getAllPesticides,
  getAllPlants,
  getCategoryBySlug,
  getSiteConfig,
} from "@/lib/content";
import { buildCategoryMetadata } from "@/lib/metadata";
import { buildItemListSchema } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";
import type { SafetyStatus } from "@/lib/types";

interface CategoryPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

function getStatusPriority(statuses: SafetyStatus[]): StatusGroup {
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

function groupByStatus<T extends { safety: { dogs: { status: SafetyStatus }; cats: { status: SafetyStatus } } }>(
  items: T[]
) {
  return items.reduce(
    (acc, item) => {
      const group = getStatusPriority([item.safety.dogs.status, item.safety.cats.status]);
      acc[group].push(item);
      return acc;
    },
    {
      safe: [] as T[],
      limited: [] as T[],
      toxic: [] as T[],
      unknown: [] as T[],
    }
  );
}

export async function generateStaticParams({ params }: { params: { locale: string; slug: string } }) {
  const { locale } = params;
  const categories = await getAllCategories(locale as Locale);
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale);
  if (!category) return {};
  const config = await getSiteConfig(locale);
  return buildCategoryMetadata(category, config, locale);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const [category, foods, plants, medications, householdChemicals, pesticides] =
    await Promise.all([
      getCategoryBySlug(slug, locale),
      getAllFoods(locale),
      getAllPlants(locale),
      getAllMedications(locale),
      getAllHouseholdChemicals(locale),
      getAllPesticides(locale),
    ]);

  if (!category) {
    notFound();
  }

  const categoryFoods = foods.filter((food) => food.categories.includes(slug));
  const categoryPlants = plants.filter((plant) => plant.categories.includes(slug));
  const categoryMedications = medications.filter((medication) =>
    medication.categories.includes(slug)
  );
  const categoryHouseholdChemicals = householdChemicals.filter((chemical) =>
    chemical.categories.includes(slug)
  );
  const categoryPesticides = pesticides.filter((pesticide) =>
    pesticide.categories.includes(slug)
  );

  const hasItems =
    categoryFoods.length > 0 ||
    categoryPlants.length > 0 ||
    categoryMedications.length > 0 ||
    categoryHouseholdChemicals.length > 0 ||
    categoryPesticides.length > 0;

  const t = await getTranslations({ locale, namespace: "SearchPage" });
  const tCategory = await getTranslations({ locale, namespace: "CategoryPage" });
  const tBadge = await getTranslations({ locale, namespace: "SafetyBadge" });

  const statusLabels: Record<StatusGroup, string> = {
    safe: tBadge("safe"),
    limited: tBadge("limited"),
    toxic: tBadge("toxic"),
    unknown: tBadge("unknown"),
  };

  const allCategoryItems = [
    ...categoryFoods.map((item) => ({ name: item.name, slug: item.slug, type: "foods" as const })),
    ...categoryPlants.map((item) => ({ name: item.name, slug: item.slug, type: "plants" as const })),
    ...categoryMedications.map((item) => ({ name: item.name, slug: item.slug, type: "medications" as const })),
    ...categoryHouseholdChemicals.map((item) => ({ name: item.name, slug: item.slug, type: "household-chemicals" as const })),
    ...categoryPesticides.map((item) => ({ name: item.name, slug: item.slug, type: "pesticides" as const })),
  ];

  const config = await getSiteConfig(locale);
  const baseUrl = config.base_url.endsWith("/") ? config.base_url.slice(0, -1) : config.base_url;
  const itemListJsonLd = buildItemListSchema(
    allCategoryItems.map((item) => ({
      name: item.name,
      url: `${baseUrl}/${locale}/${item.type}/${item.slug}`,
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
      <Breadcrumb locale={locale} items={[{ label: category.name }]} />
      <header className="mt-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{category.name}</h1>
        <p className="mt-2 text-lg font-light text-muted-foreground">{category.description}</p>
      </header>

      {categoryFoods.length > 0 && (
        <TypeSection title={t("foodTag")} items={categoryFoods} type="food" locale={locale} statusLabels={statusLabels} />
      )}

      {categoryPlants.length > 0 && (
        <TypeSection title={t("plantTag")} items={categoryPlants} type="plant" locale={locale} statusLabels={statusLabels} />
      )}

      {categoryMedications.length > 0 && (
        <TypeSection
          title={t("medicationTag")}
          items={categoryMedications}
          type="medication"
          locale={locale}
          statusLabels={statusLabels}
        />
      )}

      {categoryHouseholdChemicals.length > 0 && (
        <TypeSection
          title={t("householdChemicalTag")}
          items={categoryHouseholdChemicals}
          type="household-chemical"
          locale={locale}
          statusLabels={statusLabels}
        />
      )}

      {categoryPesticides.length > 0 && (
        <TypeSection
          title={t("pesticideTag")}
          items={categoryPesticides}
          type="pesticide"
          locale={locale}
          statusLabels={statusLabels}
        />
      )}

      {!hasItems && (
        <p className="mt-8 text-muted-foreground">{tCategory("noItems")}</p>
      )}
    </div>
  );
}

interface TypeSectionProps<T extends { slug: string; name: string; safety: { dogs: { status: SafetyStatus }; cats: { status: SafetyStatus } } }> {
  title: string;
  items: T[];
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide";
  locale: Locale;
  statusLabels: Record<StatusGroup, string>;
}

function TypeSection<T extends { slug: string; name: string; safety: { dogs: { status: SafetyStatus }; cats: { status: SafetyStatus } } }>({
  title,
  items,
  type,
  locale,
  statusLabels,
}: TypeSectionProps<T>) {
  const grouped = groupByStatus(items);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-normal tracking-tight text-foreground">{title}</h2>
      <CollapsibleGridSection title={`All ${title}`} count={items.length}>
        {items.map((item) => renderCard(item, type, locale))}
      </CollapsibleGridSection>

      <div className="mt-12 space-y-10">
        {statusOrder.map((status) => {
          const groupItems = grouped[status];
          if (groupItems.length === 0) return null;
          return (
            <CollapsibleGridSection
              key={status}
              title={statusLabels[status]}
              count={groupItems.length}
            >
              {groupItems.map((item) => renderCard(item, type, locale))}
            </CollapsibleGridSection>
          );
        })}
      </div>
    </section>
  );
}

function renderCard(
  item: { slug: string; name: string; safety: { dogs: { status: SafetyStatus }; cats: { status: SafetyStatus } } },
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide",
  locale: Locale
) {
  if (type === "food") {
    return <FoodCard key={item.slug} food={item as never} locale={locale} />;
  }
  if (type === "plant") {
    return <PlantCard key={item.slug} plant={item as never} locale={locale} />;
  }
  return <HazardCard key={item.slug} entry={item as never} type={type} locale={locale} />;
}
