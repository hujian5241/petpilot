import Image from "next/image";

import { Link } from "@/i18n/routing";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
import type { Locale } from "@/lib/i18n";
import type { SearchIndexItem } from "@/lib/types";

interface HazardCardEntry {
  slug: string;
  name: string;
  images?: { src: string; alt?: string }[];
  safety: {
    dogs: { status: "safe" | "limited" | "toxic" | "unknown" };
    cats: { status: "safe" | "limited" | "toxic" | "unknown" };
  };
}

interface HazardCardProps {
  entry: HazardCardEntry;
  type: SearchIndexItem["type"];
  locale: Locale;
}

const routePrefix: Record<SearchIndexItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

const imagePrefix: Record<SearchIndexItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

export function HazardCard({ entry, type, locale }: HazardCardProps) {
  const prefix = routePrefix[type];
  const imgPrefix = imagePrefix[type];

  return (
    <Link
      href={`/${prefix}/${entry.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <Image
          src={entry.images?.[0]?.src ?? `/images/${imgPrefix}/${entry.slug}.svg`}
          alt={entry.images?.[0]?.alt ?? entry.name}
          width={300}
          height={225}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
        {entry.name}
      </h3>
      <div className="mt-1.5 space-y-0.5">
        <CompactSafetyBadge species="dogs" status={entry.safety.dogs.status} />
        <CompactSafetyBadge species="cats" status={entry.safety.cats.status} />
      </div>
    </Link>
  );
}
