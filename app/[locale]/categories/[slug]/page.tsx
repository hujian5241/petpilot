import { notFound } from "next/navigation";

import { FoodCard } from "@/components/food/FoodCard";
import { PlantCard } from "@/components/plant/PlantCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllCategories, getAllFoods, getAllPlants, getCategoryBySlug, getSiteConfig } from "@/lib/content";
import { buildCategoryMetadata } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface CategoryPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
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
  const [category, foods, plants] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getAllFoods(locale),
    getAllPlants(locale),
  ]);

  if (!category) {
    notFound();
  }

  const categoryFoods = foods.filter((food) => food.categories.includes(slug));
  const categoryPlants = plants.filter((plant) => plant.categories.includes(slug));
  const hasItems = categoryFoods.length > 0 || categoryPlants.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: category.name }]} />
      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
      </header>

      {categoryFoods.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Foods</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryFoods.map((food) => (
              <FoodCard key={food.slug} food={food} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {categoryPlants.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Plants</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryPlants.map((plant) => (
              <PlantCard key={plant.slug} plant={plant} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {!hasItems && (
        <p className="mt-8 text-muted-foreground">No items in this category yet.</p>
      )}
    </div>
  );
}
