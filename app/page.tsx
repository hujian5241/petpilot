import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";
import { FoodCard } from "@/components/food/FoodCard";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { getAllCategories, getAllFoods, getSiteConfig } from "@/lib/content";

export default async function HomePage() {
  const [config, foods, categories] = await Promise.all([
    getSiteConfig(),
    getAllFoods(),
    getAllCategories(),
  ]);

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
            Instantly check whether human foods are safe for your dog or cat.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-14 w-full animate-pulse rounded-full bg-muted" />}>
              <SearchBar size="large" />
            </Suspense>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:{" "}</span>
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
        <EmergencyBanner />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-foreground">Browse Categories</h2>
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
          <h2 className="text-2xl font-semibold text-foreground">Popular Searches</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularFoods.map((food) => (
            <FoodCard key={food.slug} food={food} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Why Trust PetPilot?</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Fast Answers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get clear safety information in seconds, especially in urgent moments.
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Vet-Reviewed</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Content based on authoritative sources like ASPCA and Pet Poison Helpline.
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Always Free</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No login required. Access our database anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
