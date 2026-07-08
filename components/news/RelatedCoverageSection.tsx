"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";
import type { NewsCluster } from "@/lib/news-types";
import { cn } from "@/lib/utils";

interface RelatedCoverageSectionProps {
  cluster: NewsCluster;
  currentSlug: string;
  locale: Locale;
  showAllLabel: string;
  showLessLabel: string;
}

export function RelatedCoverageSection({
  cluster,
  currentSlug,
  locale,
  showAllLabel,
  showLessLabel,
}: RelatedCoverageSectionProps) {
  const t = useTranslations("NewsPage");
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const otherCoverage = cluster.sources.filter((source) => source.slug !== currentSlug);
  const total = otherCoverage.length;
  const visibleCount = 4; // 2 rows × 2 columns
  const needsToggle = total > visibleCount;
  const visibleSources = expanded ? otherCoverage : otherCoverage.slice(0, visibleCount);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (!next && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (total === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="mt-8 rounded-xl border border-border bg-card p-4"
    >
      <button
        type="button"
        onClick={toggle}
        disabled={!needsToggle}
        className="group flex w-full items-center justify-between text-left disabled:cursor-default"
        aria-expanded={expanded}
      >
        <h2 className="text-sm font-medium text-foreground">
          {t("relatedCoverage")}{" "}
          <span className="text-sm font-normal text-muted-foreground">({total})</span>
        </h2>
        {needsToggle && (
          <span className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
            {expanded ? showLessLabel : `${showAllLabel} ${total}`}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </span>
        )}
      </button>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {visibleSources.map((source) => (
          <li key={source.slug}>
            <Link
              href={`/news/${source.slug}`}
              className="block rounded-xl border border-border bg-background p-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <span className="block">{source.name}</span>
              {source.date && (
                <time
                  dateTime={source.date}
                  className="block text-xs text-muted-foreground"
                  suppressHydrationWarning
                >
                  {new Date(source.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {expanded && needsToggle && (
        <button
          type="button"
          onClick={toggle}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
          aria-label={showLessLabel}
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
          {showLessLabel}
        </button>
      )}
    </section>
  );
}
