"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { NewsEntry } from "@/lib/news-types";

function typeBadgeClass(type: NewsEntry["type"]): string {
  switch (type) {
    case "recall":
      return "bg-status-toxic-bg text-status-toxic border-status-toxic-border";
    case "alert":
      return "bg-status-limited-bg text-status-limited border-status-limited-border";
    case "incident":
    default:
      return "bg-status-unknown-bg text-status-unknown border-status-unknown-border";
  }
}

interface NewsTypeBadgeProps {
  type: NewsEntry["type"];
  className?: string;
}

export function NewsTypeBadge({ type, className }: NewsTypeBadgeProps) {
  const t = useTranslations("NewsPage");
  const normalizedType = type ?? "incident";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
        typeBadgeClass(normalizedType),
        className
      )}
    >
      {t(`type.${normalizedType}`)}
    </span>
  );
}
