"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";
import type { NewsEntry, NewsSeverity } from "@/lib/news";
import { cn } from "@/lib/utils";

function severityBadge(severity: NewsSeverity): string {
  switch (severity) {
    case "critical":
      return "bg-status-toxic-bg text-status-toxic border-status-toxic-border";
    case "high":
      return "bg-status-limited-bg text-status-limited border-status-limited-border";
    case "moderate":
      return "bg-status-unknown-bg text-status-unknown border-status-unknown-border";
    default:
      return "bg-status-safe-bg text-status-safe border-status-safe-border";
  }
}

export function NewsCard({
  item,
  locale,
  className,
}: {
  item: { entry: NewsEntry; slug: string };
  locale: Locale;
  className?: string;
}) {
  const t = useTranslations("NewsPage");
  const entry = item.entry;
  const formattedDate = new Date(entry.date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm",
        className
      )}
    >
      {/* Date + location */}
      <div className="flex flex-nowrap items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={entry.date} className="shrink-0 whitespace-nowrap">
          {formattedDate}
        </time>
        {entry.location && (
          <>
            <span>·</span>
            <span className="truncate">{entry.location}</span>
          </>
        )}
      </div>

      {/* Source */}
      <div className="mt-1 h-4 truncate text-xs text-muted-foreground">
        {entry.source}
      </div>

      {/* Title: clamped to 2 lines with fixed min-height */}
      <h3 className="mt-2 min-h-[2.5rem] text-base font-semibold leading-tight text-foreground">
        <Link href={`/news/${item.slug}`} className="line-clamp-2 hover:text-primary">
          {entry.title}
        </Link>
      </h3>

      {/* Summary: clamped to 2 lines with fixed min-height */}
      <p className="mt-1 min-h-[2.5rem] line-clamp-2 text-sm leading-snug text-muted-foreground">
        {entry.summary}
      </p>

      {/* Tags: pushed to the bottom and limited to a single line */}
      <div className="mt-auto flex flex-nowrap items-center gap-2 overflow-hidden">
        <span
          className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${severityBadge(entry.severity)}`}
        >
          {t(`severity.${entry.severity}`)}
        </span>
        {entry.species.slice(0, 1).map((species) => (
          <span
            key={species}
            className="inline-flex shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
          >
            {t(`species.${species}`)}
          </span>
        ))}
        {entry.substances.slice(0, 2).map((substance) => (
          <span
            key={substance}
            className="inline-flex shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {substance}
          </span>
        ))}
      </div>
    </article>
  );
}
