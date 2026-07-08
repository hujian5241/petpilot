"use client";

import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type FilterMode = "list" | "chip";

interface FilterGroupProps {
  title: string;
  items: { value: string; label: string }[];
  selected: string[];
  param: string;
  mode?: FilterMode;
  pathname: string;
  currentParams: Record<string, string | undefined>;
}

function toggle(selected: string[], value: string): string {
  const next = new Set(selected);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return Array.from(next).join(",");
}

function buildHref(
  pathname: string,
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
): string {
  const next = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function FilterGroup({
  title,
  items,
  selected,
  param,
  mode = "list",
  pathname,
  currentParams,
}: FilterGroupProps) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent, value: string) {
    e.preventDefault();
    const nextValue = toggle(selected, value) || undefined;
    router.push(buildHref(pathname, currentParams, { [param]: nextValue }), {
      scroll: false,
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {mode === "chip" ? (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item) => {
            const isActive = selected.includes(item.value);
            return (
              <li key={item.value}>
                <button
                  type="button"
                  onClick={(e) => handleClick(e, item.value)}
                  className={cn(
                    "inline-flex cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item) => {
            const isActive = selected.includes(item.value);
            return (
              <li key={item.value}>
                <button
                  type="button"
                  onClick={(e) => handleClick(e, item.value)}
                  className={cn(
                    "block cursor-pointer text-left transition-colors",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
