"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleGridSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  initialExpanded?: boolean;
  maxRows?: number;
  columns?: number;
}

export function CollapsibleGridSection({
  title,
  count,
  children,
  initialExpanded = false,
  maxRows = 2,
  columns = 5,
}: CollapsibleGridSectionProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const sectionRef = useRef<HTMLElement>(null);

  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleCount = maxRows * columns;
  const visibleChildren = expanded
    ? childrenArray
    : childrenArray.slice(0, visibleCount);

  const needsToggle = childrenArray.length > visibleCount;

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (!next && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section ref={sectionRef} className="relative mt-12 scroll-mt-24">
      <button
        type="button"
        onClick={toggle}
        disabled={!needsToggle}
        className="group flex w-full items-center justify-between text-left disabled:cursor-default"
        aria-expanded={expanded}
      >
        <h2 className="text-2xl font-normal tracking-tight text-foreground">
          {title}{" "}
          <span className="text-base font-normal text-muted-foreground">({count})</span>
        </h2>
        {needsToggle && (
          <span className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
            {expanded ? "Show less" : `Show all ${count}`}
            <ChevronDown
              className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        )}
      </button>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {visibleChildren}
      </div>
      {expanded && needsToggle && (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-colored transition-transform hover:scale-105 hover:bg-primary-deep focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Show less"
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
          Show less
        </button>
      )}
    </section>
  );
}
