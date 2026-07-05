"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X, Check, ChevronDown } from "lucide-react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface SourceFilterProps {
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  allLabel?: string;
  noResultsLabel?: string;
  clearSearchLabel?: string;
  items: { value: string; label: string }[];
  selected: string[];
  param: string;
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

export function SourceFilter({
  label,
  placeholder = "Select sources",
  searchPlaceholder = "Search sources...",
  allLabel = "All sources",
  noResultsLabel = "No sources found",
  clearSearchLabel = "Clear search",
  items,
  selected,
  param,
  pathname,
  currentParams,
}: SourceFilterProps) {
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerId = useId();
  const listId = useId();

  function setOpen(next: boolean) {
    setOpenState(next);
    if (!next) setQuery("");
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  const triggerLabel = selected.length === 0 ? allLabel : `${selected.length} selected`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={triggerId}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(!open)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:bg-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 flex w-full flex-col overflow-hidden rounded-md border border-input bg-background py-1 text-sm shadow-lg"
          >
            <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={clearSearchLabel}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-auto">
              {filteredItems.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {noResultsLabel}
                </div>
              )}
              {filteredItems.map((item) => {
                const isSelected = selected.includes(item.value);
                const nextValue = toggle(selected, item.value) || undefined;
                return (
                  <Link
                    key={item.value}
                    role="option"
                    aria-selected={isSelected}
                    href={buildHref(pathname, currentParams, { [param]: nextValue })}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
