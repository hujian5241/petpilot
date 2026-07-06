"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Fuse from "fuse.js";
import {
  Search,
  Leaf,
  UtensilsCrossed,
  Pill,
  FlaskConical,
  Bug,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { SearchBar } from "@/components/search/SearchBar";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
import type { SearchIndexItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface SearchResult {
  item: SearchIndexItem;
  matchType: "name" | "alias" | "fuzzy";
  matchedAlias?: string;
}

interface SearchPageClientProps {
  locale: Locale;
  initialIndex: SearchIndexItem[];
  contactEmail?: string;
  stats?: {
    categories: number;
    foods: number;
    plants: number;
    medications: number;
    householdChemicals: number;
    pesticides: number;
  };
}

const routePrefix: Record<SearchIndexItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

// Split query into tokens. For CJK scripts we treat each character as a token
// because CJK languages do not use spaces between words.
function tokenizeQuery(query: string): string[] {
  const cjkRegex = /[一-鿿぀-ゟ゠-ヿ가-힯]/;
  const tokens: string[] = [];
  for (const part of query.split(/\s+/)) {
    if (part.length === 0) continue;
    if (cjkRegex.test(part)) {
      for (const char of part) {
        if (cjkRegex.test(char)) tokens.push(char);
      }
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

function matchesTokens(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.every((token) => lower.includes(token));
}

export function SearchPageClient({
  locale,
  initialIndex,
  contactEmail = "hello@petpilot.io",
  stats,
}: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const trimmedQuery = query.trim().toLowerCase();
  const t = useTranslations("SearchPage");
  const tHome = useTranslations("HomePage");

  const totalItems = stats
    ? stats.foods + stats.plants + stats.medications + stats.householdChemicals + stats.pesticides
    : initialIndex.length;

  const nameFuse = new Fuse(initialIndex, {
    keys: ["name", "aliases"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: false,
    findAllMatches: false,
    useExtendedSearch: true,
  });

  const results: SearchResult[] = (() => {
    if (!trimmedQuery) return [];

    const tokens = tokenizeQuery(trimmedQuery);
    if (tokens.length === 0) return [];

    // 1. Exact/prefix matches in name or aliases
    const exactMatches: SearchResult[] = [];
    for (const item of initialIndex) {
      const nameHit = matchesTokens(item.name, tokens);
      if (nameHit) {
        exactMatches.push({ item, matchType: "name" });
        continue;
      }

      const matchedAlias = item.aliases.find((a) => matchesTokens(a, tokens));
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
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <SearchBar locale={locale} />
      </div>

      {stats && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {tHome("stats", {
            categories: stats.categories,
            total: totalItems,
            foods: stats.foods,
            plants: stats.plants,
            medications: stats.medications,
            householdChemicals: stats.householdChemicals,
            pesticides: stats.pesticides,
          })}
        </p>
      )}

      {query && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            {t("resultsFor", { count: results.length, query })}
          </p>

          {results.length > 0 ? (
            <div className="mt-4 space-y-3">
              {results.map(({ item, matchType, matchedAlias }) => (
                <Link
                  key={`${item.type}-${item.slug}`}
                  href={`/${routePrefix[item.type]}/${item.slug}`}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                      <TypeTag type={item.type} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                    {matchType === "alias" && matchedAlias && (
                      <p className="mt-1 text-xs text-primary">
                        {t("alsoKnownAs", { alias: matchedAlias })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <CompactSafetyBadge species="dogs" status={item.safetyDogs} locale={locale} />
                    <CompactSafetyBadge species="cats" status={item.safetyCats} locale={locale} />
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
                {t("noResults", { query })}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("noResultsDescription")}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(t.raw("noResultsSuggestions") as string[]).map((suggestion) => {
                  const parts = suggestion.split("|");
                  const query = parts[0] ?? suggestion;
                  const label = parts[1] ?? query;
                  return (
                    <Link
                      key={query}
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {t("suggestItem")}:{" "}
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(t("suggestItem"))}`}
                  className="text-primary hover:underline"
                >
                  {contactEmail}
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
            {t("emptyState")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(t.raw("emptyStateSuggestions") as string[]).map((suggestion) => {
              const parts = suggestion.split("|");
              const query = parts[0] ?? suggestion;
              const label = parts[1] ?? query;
              return (
                <Link
                  key={query}
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TypeTag({ type }: { type: SearchIndexItem["type"] }) {
  const t = useTranslations("SearchPage");

  const config: Record<
    SearchIndexItem["type"],
    { icon: React.ReactNode; label: string }
  > = {
    food: {
      icon: <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />,
      label: t("foodTag"),
    },
    plant: {
      icon: <Leaf className="h-3 w-3" aria-hidden="true" />,
      label: t("plantTag"),
    },
    medication: {
      icon: <Pill className="h-3 w-3" aria-hidden="true" />,
      label: t("medicationTag"),
    },
    "household-chemical": {
      icon: <FlaskConical className="h-3 w-3" aria-hidden="true" />,
      label: t("householdChemicalTag"),
    },
    pesticide: {
      icon: <Bug className="h-3 w-3" aria-hidden="true" />,
      label: t("pesticideTag"),
    },
  };

  const { icon, label } = config[type];

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {icon} {label}
    </span>
  );
}
