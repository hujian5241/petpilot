import Image from "next/image";

import { Link } from "@/i18n/routing";
import { SafetyBadge } from "@/components/food/SafetyBadge";
import type { PlantEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface PlantCardProps {
  plant: PlantEntry;
  locale: Locale;
}

export function PlantCard({ plant, locale }: PlantCardProps) {
  return (
    <Link
      href={`/plants/${plant.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <Image
          src={plant.images?.[0]?.src ?? `/images/plants/${plant.slug}.svg`}
          alt={plant.images?.[0]?.alt ?? plant.name}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{plant.name}</h2>
      {plant.scientific_name && (
        <p className="text-xs italic text-muted-foreground">{plant.scientific_name}</p>
      )}
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{plant.safety.dogs.summary}</p>
      <div className="mt-4 flex flex-col gap-2">
        <SafetyBadge species="dogs" status={plant.safety.dogs.status} />
        <SafetyBadge species="cats" status={plant.safety.cats.status} />
      </div>
    </Link>
  );
}
