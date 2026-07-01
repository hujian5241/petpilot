import { notFound } from "next/navigation";

import { FoodCard } from "@/components/food/FoodCard";
import { PlantCard } from "@/components/plant/PlantCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllCategories, getAllFoods, getAllPlants, getCategoryBySlug } from "@/lib/content";
import { buildCategoryMetadata } from "@/lib/metadata";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return buildCategoryMetadata(category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, foods, plants] = await Promise.all([
    getCategoryBySlug(slug),
    getAllFoods(),
    getAllPlants(),
  ]);

  if (!category) {
    notFound();
  }

  const categoryFoods = foods.filter((food) => food.categories.includes(slug));
  const categoryPlants = plants.filter((plant) => plant.categories.includes(slug));
  const hasItems = categoryFoods.length > 0 || categoryPlants.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: category.name }]} />
      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
      </header>

      {categoryFoods.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Foods</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryFoods.map((food) => (
              <FoodCard key={food.slug} food={food} />
            ))}
          </div>
        </section>
      )}

      {categoryPlants.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Plants</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryPlants.map((plant) => (
              <PlantCard key={plant.slug} plant={plant} />
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
