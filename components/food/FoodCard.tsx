import Image from "next/image";

import { Link } from "@/i18n/routing";
import { CompactSafetyBadge } from "./SafetyBadge";
import type { FoodEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface FoodCardProps {
  food: FoodEntry;
  locale: Locale;
}

export function FoodCard({ food, locale }: FoodCardProps) {
  return (
    <Link
      href={`/foods/${food.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-md bg-muted">
        <Image
          src={food.images?.[0]?.src ?? `/images/foods/${food.slug}.svg`}
          alt={food.images?.[0]?.alt ?? food.name}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
        {food.name}
      </h3>
      <div className="mt-2 space-y-1">
        <CompactSafetyBadge species="dogs" status={food.safety.dogs.status} />
        <CompactSafetyBadge species="cats" status={food.safety.cats.status} />
      </div>
    </Link>
  );
}
