"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import type { NewsCluster, NewsItem } from "@/lib/news-types";
import { cn } from "@/lib/utils";
import { NewsCard } from "./NewsCard";
import { NewsClusterCard } from "./NewsClusterCard";

export type MonthItem =
  | { type: "article"; data: NewsItem }
  | { type: "cluster"; data: NewsCluster };

interface MonthSectionProps {
  monthLabel: string;
  items: MonthItem[];
  locale: Locale;
  showAllLabel: string;
  showLessLabel: string;
  /** When true the section starts expanded. */
  initialExpanded?: boolean;
  /** "clip" shows the first rows and hides the rest; "hide" hides the whole grid. */
  collapseMode?: "clip" | "hide";
  /** Force the toggle to always be hidden (e.g. for a filtered single-month view). */
  hideToggle?: boolean;
}

export function MonthSection({
  monthLabel,
  items,
  locale,
  showAllLabel,
  showLessLabel,
  initialExpanded = false,
  collapseMode = "clip",
  hideToggle = false,
}: MonthSectionProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const sectionRef = useRef<HTMLElement>(null);

  if (items.length === 0) return null;

  const showGrid = expanded || collapseMode === "clip";
  const isClipped = !expanded && collapseMode === "clip";
  const canExpand = collapseMode === "hide" ? items.length > 0 : items.length > 3;
  const canToggle = !hideToggle && canExpand;

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    // Do not scroll; let the user stay in place.
  }

  return (
    <section ref={sectionRef} className="scroll-mt-24">
      <button
        type="button"
        onClick={toggle}
        disabled={!canToggle}
        className="group flex w-full items-center justify-between text-left disabled:cursor-default"
        aria-expanded={expanded}
      >
        <h3 className="text-lg font-medium text-primary">
          {monthLabel}{" "}
          <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
        </h3>
        {canToggle && (
          <span className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-sm font-medium text-primary transition-colors group-hover:border-primary group-hover:text-primary-foreground hover:bg-primary">
            {expanded ? showLessLabel : `${showAllLabel} ${items.length}`}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </span>
        )}
      </button>

      {showGrid && (
        <div
          className={cn(
            "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            isClipped &&
              "[&>:nth-child(n+4)]:hidden sm:[&>:nth-child(n+7)]:hidden lg:[&>:nth-child(n+10)]:hidden"
          )}
        >
          {items.map((item) =>
            item.type === "cluster" ? (
              <NewsClusterCard
                key={item.data.id}
                cluster={item.data}
                locale={locale}
              />
            ) : (
              <NewsCard key={item.data.slug} item={item.data} locale={locale} />
            )
          )}
        </div>
      )}

      {canToggle && expanded && (
        <button
          type="button"
          onClick={toggle}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
          aria-label={showLessLabel}
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
          {showLessLabel}
        </button>
      )}
    </section>
  );
}
