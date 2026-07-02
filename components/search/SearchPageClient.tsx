"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, Leaf, UtensilsCrossed } from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
import type { SearchIndexItem } from "@/lib/types";

interface SearchResult {
  item: SearchIndexItem;
  matchType: "name" | "alias" | "fuzzy";
  matchedAlias?: string;
}

interface SearchPageClientProps {
  initialIndex: SearchIndexItem[];
  contactEmail?: string;
}

export function SearchPageClient({
  initialIndex,
  contactEmail = "hello@petpilot.io",
}: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const trimmedQuery = query.trim().toLowerCase();

  const nameFuse = useMemo(
    () =>
      new Fuse(initialIndex, {
        keys: ["name", "aliases"],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: false,
        findAllMatches: false,
        useExtendedSearch: true,
      }),
    [initialIndex]
  );

  const results = useMemo((): SearchResult[] => {
    if (!trimmedQuery) return [];

    const queryParts = trimmedQuery.split(/\s+/);

    // 1. Exact/prefix matches in name or aliases
    const exactMatches: SearchResult[] = [];
    for (const item of initialIndex) {
      const nameHit = queryParts.every((part) =>
        item.name.toLowerCase().includes(part)
      );
      if (nameHit) {
        exactMatches.push({ item, matchType: "name" });
        continue;
      }

      const matchedAlias = item.aliases.find((a) =>
        queryParts.every((part) => a.toLowerCase().includes(part))
      );
      if (matchedAlias) {
        exactMatches.push({ item, matchType: "alias", matchedAlias });
      }
    }

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // 2. Fuzzy fallback on name and aliases only (not summary)
    const fuzzyResults = nameFuse.search(trimmedQuery);
    return fuzzyResults.map((result) => ({ item: result.item, matchType: "fuzzy" }));
  }, [trimmedQuery, initialIndex, nameFuse]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Search</h1>
      <div className="mt-6">
        <SearchBar />
      </div>

      {query && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 && "s"} for &quot;{query}&quot;
          </p>

          {results.length > 0 ? (
            <div className="mt-4 space-y-3">
              {results.map(({ item, matchType, matchedAlias }) => (
                <Link
                  key={`${item.type}-${item.slug}`}
                  href={`/${item.type}s/${item.slug}`}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {item.type === "food" ? (
                          <>
                            <UtensilsCrossed className="h-3 w-3" aria-hidden="true" /> Food
                          </>
                        ) : (
                          <>
                            <Leaf className="h-3 w-3" aria-hidden="true" /> Plant
                          </>
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                    {matchType === "alias" && matchedAlias && (
                      <p className="mt-1 text-xs text-primary">
                        Also known as: {matchedAlias}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <CompactSafetyBadge species="dogs" status={item.safetyDogs} />
                    <CompactSafetyBadge species="cats" status={item.safetyCats} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No results for &quot;{query}&quot;
              </h2>
              <p className="mt-2 text-muted-foreground">
                We couldn&apos;t find any foods or plants matching your search.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["grapes", "chocolate", "lilies", "blueberries", "carrots"].map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Think something is missing?{" "}
                <a
                  href={`mailto:${contactEmail}?subject=Search%20suggestion`}
                  className="text-primary hover:underline"
                >
                  Suggest an item
                </a>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Enter a food or plant above to see if it&apos;s safe for your pet.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["apple", "tulips", "onions", "spider plant"].map((suggestion) => (
              <Link
                key={suggestion}
                href={`/search?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
