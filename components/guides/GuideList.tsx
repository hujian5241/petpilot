import { GuideCard } from "./GuideCard";
import type { Locale } from "@/lib/i18n";
import type { GuideEntry } from "@/lib/types";

interface GuideListProps {
  guides: GuideEntry[];
  locale: Locale;
}

export function GuideList({ guides, locale }: GuideListProps) {
  if (guides.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <GuideCard key={guide.slug} guide={guide} locale={locale} />
      ))}
    </div>
  );
}
