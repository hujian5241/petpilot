"use client";

import { useTranslations } from "next-intl";

import { RelatedCard } from "./RelatedCard";
import type { RelatedItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface RelatedItemsProps {
  items: RelatedItem[];
  locale: Locale;
}

export function RelatedItems({ items, locale }: RelatedItemsProps) {
  const t = useTranslations("RelatedItems");

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-normal tracking-tight text-foreground">{t("title")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <RelatedCard key={`${item.type}-${item.slug}`} item={item} locale={locale} />
        ))}
      </div>
    </section>
  );
}
