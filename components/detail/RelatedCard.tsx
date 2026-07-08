import Image from "next/image";

import { Link } from "@/i18n/routing";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
import type { RelatedItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface RelatedCardProps {
  item: RelatedItem;
  locale: Locale;
}

const routePrefix: Record<RelatedItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

const imagePrefix: Record<RelatedItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

export function RelatedCard({ item, locale }: RelatedCardProps) {
  const prefix = routePrefix[item.type];
  const imgPrefix = imagePrefix[item.type];

  return (
    <Link
      href={`/${prefix}/${item.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-card"
    >
      <div className="mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.image?.src ?? `/images/${imgPrefix}/${item.slug}.svg`}
          alt={item.image?.alt ?? item.name}
          width={300}
          height={225}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary">{item.name}</h3>
      <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
      <div className="mt-auto pt-2 space-y-0.5">
        <CompactSafetyBadge species="dogs" status={item.safetyDogs} locale={locale} />
        <CompactSafetyBadge species="cats" status={item.safetyCats} locale={locale} />
      </div>
    </Link>
  );
}
