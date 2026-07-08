"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface SearchBarProps {
  locale?: Locale;
  size?: "default" | "large";
  className?: string;
}

export function SearchBar({ locale = "en", size = "default", className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const t = useTranslations("SearchPage");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-full border border-border bg-background shadow-sm",
          size === "large" ? "h-14" : "h-11"
        )}
      >
        <Search
          className={cn(
            "absolute left-4 text-muted-foreground",
            size === "large" ? "h-6 w-6" : "h-5 w-5"
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className={cn(
            "h-full w-full rounded-full bg-transparent pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
            size === "large" ? "text-lg" : "text-base"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
