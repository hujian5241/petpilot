import type { Metadata } from "next";
import Link from "next/link";

import { FoodCard } from "@/components/food/FoodCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllCategories, getAllFoods } from "@/lib/content";
import type { FoodEntry } from "@/lib/types";

type StatusGroup = "safe" | "limited" | "toxic" | "unknown";

const statusOrder: StatusGroup[] = ["toxic", "limited", "safe", "unknown"];

const statusLabels: Record<StatusGroup, string> = {
  safe: "Safe",
  limited: "Limited",
  toxic: "Toxic",
  unknown: "Unknown",
};

function getFoodStatusPriority(food: FoodEntry): StatusGroup {
  const statuses = [food.safety.dogs.status, food.safety.cats.status];
  if (statuses.includes("toxic")) return "toxic";
  if (statuses.includes("limited")) return "limited";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}

export const metadata: Metadata = {
  title: "Food Safety Guide for Dogs & Cats",
  description:
    "Browse PetPilot's vet-reviewed database of human foods. Learn what is safe, limited, or toxic for dogs and cats.",
};

export default async function FoodsPage() {
  const [foods, categories] = await Promise.all([getAllFoods(), getAllCategories()]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Foods" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-foreground">Food Safety Guide for Dogs & Cats</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our vet-reviewed database of human foods and learn what is safe, limited, or toxic
          for your pets.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Quick Safety Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusOrder.map((status) => (
            <Link
              key={status}
              href={`#${status}`}
              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{statusLabels[status]}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{foodsByStatus[status].length}</p>
              <p className="mt-1 text-xs text-muted-foreground">foods</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Browse by Category</h2>
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

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">All Foods</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {foods.map((food) => (
            <FoodCard key={food.slug} food={food} />
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-12">
        {statusOrder.map((status) => {
          const groupFoods = foodsByStatus[status];
          if (groupFoods.length === 0) return null;
          return (
            <div key={status} id={status}>
              <h2 className="text-2xl font-semibold text-foreground">{statusLabels[status]} ({groupFoods.length})</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {groupFoods.map((food) => (
                  <FoodCard key={food.slug} food={food} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
