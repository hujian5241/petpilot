import Image from "next/image";

import { Link } from "@/i18n/routing";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
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
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card"
    >
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <Image
          src={plant.images?.[0]?.src ?? `/images/plants/${plant.slug}.svg`}
          alt={plant.images?.[0]?.alt ?? plant.name}
          width={300}
          height={225}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <h2 className="text-base font-medium text-foreground">{plant.name}</h2>
      {plant.scientific_name && (
        <p className="text-xs italic text-muted-foreground">{plant.scientific_name}</p>
      )}
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{plant.safety.dogs.summary}</p>
      <div className="mt-2 flex flex-col gap-0.5">
        <CompactSafetyBadge species="dogs" status={plant.safety.dogs.status} />
        <CompactSafetyBadge species="cats" status={plant.safety.cats.status} />
      </div>
    </Link>
  );
}
