"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface YearSectionProps {
  year: string;
  monthCount: number;
  showAllLabel: string;
  showLessLabel: string;
  children: React.ReactNode;
}

export function YearSection({
  year,
  monthCount,
  showAllLabel,
  showLessLabel,
  children,
}: YearSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (!next && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section ref={sectionRef} className="scroll-mt-24 rounded-xl border border-border bg-card p-4">
      <button
        type="button"
        onClick={toggle}
        className="group flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <h2 className="text-2xl font-light tracking-tight text-foreground">{year}</h2>
        <span className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-sm font-medium text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
          {expanded ? showLessLabel : `${showAllLabel} ${monthCount}`}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>
      <div
        className={cn(
          "mt-4 space-y-6 border-t border-border pt-4",
          !expanded && "hidden"
        )}
      >
        {children}
      </div>

      {expanded && (
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
