import { Suspense } from "react";

import { SearchPageClient } from "@/components/search/SearchPageClient";
import { getAllFoods, getAllPlants, getSiteConfig } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";

export default async function SearchPage() {
  const [foods, plants, config] = await Promise.all([
    getAllFoods(),
    getAllPlants(),
    getSiteConfig(),
  ]);
  const searchIndex = buildSearchIndex(foods, plants);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Search</h1>
          <p className="mt-6 text-muted-foreground">Loading search...</p>
        </div>
      }
    >
      <SearchPageClient
        initialIndex={searchIndex}
        contactEmail={config.contact_email}
      />
    </Suspense>
  );
}
