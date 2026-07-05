"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";
import type { NewsCluster, NewsSeverity } from "@/lib/news";
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

function formatDateRange(
  dateRange: { start: string; end: string },
  locale: Locale
): string {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const sameDay = dateRange.start === dateRange.end;
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  if (sameDay) {
    return start.toLocaleDateString(locale, options);
  }
  return `${start.toLocaleDateString(locale, options)} – ${end.toLocaleDateString(
    locale,
    options
  )}`;
}

export function NewsClusterCard({
  cluster,
  locale,
  className,
}: {
  cluster: NewsCluster;
  locale: Locale;
  className?: string;
}) {
  const t = useTranslations("NewsPage");

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex flex-nowrap items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={cluster.dateRange.start} className="shrink-0 whitespace-nowrap">
          {formatDateRange(cluster.dateRange, locale)}
        </time>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-tight text-foreground">
        <Link
          href={`/news/${cluster.canonicalSlug}`}
          className="hover:text-primary"
        >
          {cluster.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-snug text-muted-foreground">
        {cluster.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
            severityBadge(cluster.severity)
          )}
        >
          {t(`severity.${cluster.severity}`)}
        </span>
        {cluster.species.slice(0, 1).map((species) => (
          <span
            key={species}
            className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
          >
            {t(`species.${species}`)}
          </span>
        ))}
        {cluster.substances.slice(0, 2).map((substance) => (
          <span
            key={substance}
            className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {substance}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-medium text-muted-foreground">
            {t("coverageFrom", { count: cluster.sources.length })}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            {cluster.sources.slice(0, 3).map((source) => (
              <Link
                key={`${source.name}-${source.slug}`}
                href={`/news/${source.slug}`}
                className="text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
              >
                {source.name}
              </Link>
            ))}
            {cluster.sources.length > 3 && (
              <Link
                href={`/news/${cluster.canonicalSlug}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                +{cluster.sources.length - 3}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
