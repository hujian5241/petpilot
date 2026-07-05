import { Link } from "@/i18n/routing";

import { cn } from "@/lib/utils";

export type FilterMode = "list" | "chip";

interface FilterGroupProps {
  title: string;
  items: { value: string; label: string }[];
  selected: string[];
  param: string;
  mode?: FilterMode;
  buildHref: (params: Record<string, string | undefined>) => string;
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

export function FilterGroup({
  title,
  items,
  selected,
  param,
  mode = "list",
  buildHref,
}: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {mode === "chip" ? (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item) => {
            const isActive = selected.includes(item.value);
            const nextValue = toggle(selected, item.value) || undefined;
            return (
              <li key={item.value}>
                <Link
                  href={buildHref({ [param]: nextValue })}
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item) => {
            const isActive = selected.includes(item.value);
            const nextValue = toggle(selected, item.value) || undefined;
            return (
              <li key={item.value}>
                <Link
                  href={buildHref({ [param]: nextValue })}
                  className={cn(
                    "block transition-colors",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
