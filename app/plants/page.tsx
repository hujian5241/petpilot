import Link from "next/link";
import { Leaf } from "lucide-react";

import { PlantCard } from "@/components/plant/PlantCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllPlants } from "@/lib/content";

export const metadata = {
  title: "Plants | PetPilot",
  description:
    "Browse common houseplants and outdoor plants to learn which are safe or toxic for dogs and cats.",
};

export default async function PlantsPage() {
  const plants = await getAllPlants();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Plants" }]} />
      <header className="mt-6">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Plants</h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse common houseplants, garden plants, and wild plants to see if they are safe for your
          pets.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/categories/houseplants"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          Houseplants
        </Link>
        <Link
          href="/categories/outdoor-plants"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          Outdoor Plants
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} />
        ))}
      </div>
    </div>
  );
}
