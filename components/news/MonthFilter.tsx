"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  id?: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function CustomSelect({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedLabel =
    options.find((o) => o.value === value && !o.disabled)?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
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
    if (!open) return;
    const selected = panelRef.current?.querySelector(
      `[data-option-value="${value}"]`
    );
    if (selected instanceof HTMLElement) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [open, value]);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-xs text-muted-foreground"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:bg-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selectedLabel}</span>
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
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 text-sm shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                data-option-value={option.value}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
                className={
                  "flex cursor-pointer items-center justify-between px-2 py-1.5 " +
                  (option.disabled
                    ? "cursor-not-allowed text-muted-foreground/60"
                    : isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted")
                }
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MonthFilterProps {
  locale: Locale;
  months: string[];
  defaultValue?: string;
  label: string;
  buttonLabel: string;
  allMonthsLabel: string;
  prevYearLabel: string;
  nextYearLabel: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  yearLabel: string;
  yearPlaceholder: string;
  monthLabel: string;
  monthPlaceholder: string;
  otherParams?: Record<string, string | undefined>;
}

export function MonthFilter({
  locale,
  months,
  defaultValue,
  label,
  buttonLabel,
  allMonthsLabel,
  prevYearLabel,
  nextYearLabel,
  prevMonthLabel,
  nextMonthLabel,
  yearLabel,
  yearPlaceholder,
  monthLabel,
  monthPlaceholder,
  otherParams = {},
}: MonthFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [year, setYear] = useState(() => defaultValue?.split("-")[0] ?? "");
  const [month, setMonth] = useState(() => defaultValue?.split("-")[1] ?? "");

  const { years, yearMonthMap } = useMemo(() => {
    const sorted = [...months].sort();
    const map = new Map<number, number[]>();
    for (const m of sorted) {
      const [yStr, moStr] = m.split("-");
      const y = Number(yStr);
      const mo = Number(moStr);
      if (!map.has(y)) map.set(y, []);
      map.get(y)?.push(mo);
    }
    for (const [, mos] of map) {
      mos.sort((a, b) => a - b);
    }
    const ys = Array.from(map.keys()).sort((a, b) => b - a);
    return { years: ys, yearMonthMap: map };
  }, [months]);

  const availableMonths = year ? yearMonthMap.get(Number(year)) ?? [] : [];

  function buildHref(updates: Record<string, string | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(otherParams)) {
      if (val) search.set(key, val);
    }
    for (const [key, val] of Object.entries(updates)) {
      if (val) search.set(key, val);
      else search.delete(key);
    }
    const qs = search.toString();
    return qs ? `/${locale}/news?${qs}` : `/${locale}/news`;
  }

  function navigateTo(newYear: string, newMonth: string) {
    setYear(newYear);
    setMonth(newMonth);
    const value = `${newYear}-${newMonth}`;
    const href = buildHref({ month: value, all: undefined });
    startTransition(() => {
      router.push(href);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!year || !month) return;
    navigateTo(year, month);
  }

  function goPrevYear() {
    if (!year || !month) return;
    const y = Number(year);
    const targetYear = y - 1;
    const available = yearMonthMap.get(targetYear);
    if (!available) return;
    const m = Number(month);
    const targetMonth = available.includes(m)
      ? m
      : available[available.length - 1];
    navigateTo(String(targetYear), String(targetMonth).padStart(2, "0"));
  }

  function goNextYear() {
    if (!year || !month) return;
    const y = Number(year);
    const targetYear = y + 1;
    const available = yearMonthMap.get(targetYear);
    if (!available) return;
    const m = Number(month);
    const targetMonth = available.includes(m) ? m : available[0];
    navigateTo(String(targetYear), String(targetMonth).padStart(2, "0"));
  }

  function goPrevMonth() {
    if (!year || !month) return;
    const y = Number(year);
    const m = Number(month);
    const currentYearMonths = yearMonthMap.get(y) ?? [];
    const prevInSameYear = currentYearMonths
      .slice()
      .reverse()
      .find((mo) => mo < m);
    if (prevInSameYear) {
      navigateTo(String(y), String(prevInSameYear).padStart(2, "0"));
      return;
    }
    const prevYear = y - 1;
    const prevYearMonths = yearMonthMap.get(prevYear);
    if (!prevYearMonths) return;
    navigateTo(
      String(prevYear),
      String(prevYearMonths[prevYearMonths.length - 1]).padStart(2, "0")
    );
  }

  function goNextMonth() {
    if (!year || !month) return;
    const y = Number(year);
    const m = Number(month);
    const currentYearMonths = yearMonthMap.get(y) ?? [];
    const nextInSameYear = currentYearMonths.find((mo) => mo > m);
    if (nextInSameYear) {
      navigateTo(String(y), String(nextInSameYear).padStart(2, "0"));
      return;
    }
    const nextYear = y + 1;
    const nextYearMonths = yearMonthMap.get(nextYear);
    if (!nextYearMonths) return;
    navigateTo(String(nextYear), String(nextYearMonths[0]).padStart(2, "0"));
  }

  const canGoPrevYear = year ? yearMonthMap.has(Number(year) - 1) : false;
  const canGoNextYear = year ? yearMonthMap.has(Number(year) + 1) : false;

  const canGoPrevMonth = useMemo(() => {
    if (!year || !month) return false;
    const y = Number(year);
    const m = Number(month);
    const currentYearMonths = yearMonthMap.get(y) ?? [];
    return currentYearMonths.some((mo) => mo < m) || yearMonthMap.has(y - 1);
  }, [year, month, yearMonthMap]);

  const canGoNextMonth = useMemo(() => {
    if (!year || !month) return false;
    const y = Number(year);
    const m = Number(month);
    const currentYearMonths = yearMonthMap.get(y) ?? [];
    return currentYearMonths.some((mo) => mo > m) || yearMonthMap.has(y + 1);
  }, [year, month, yearMonthMap]);

  return (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <CustomSelect
            id="year-filter"
            label={yearLabel}
            value={year}
            placeholder={yearPlaceholder}
            disabled={isPending}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            onChange={(newYear) => {
              setYear(newYear);
              const available = newYear ? yearMonthMap.get(Number(newYear)) ?? [] : [];
              if (newYear && (!month || !available.includes(Number(month)))) {
                setMonth(String(available[available.length - 1]).padStart(2, "0"));
              }
            }}
          />
          <CustomSelect
            id="month-filter"
            label={monthLabel}
            value={month}
            placeholder={monthPlaceholder}
            disabled={!year || isPending}
            options={Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const value = String(m).padStart(2, "0");
              return {
                value,
                label: value,
                disabled: !year || !availableMonths.includes(m),
              };
            })}
            onChange={(newMonth) => setMonth(newMonth)}
          />
        </div>

        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={goPrevYear}
            disabled={!canGoPrevYear || isPending}
            aria-label={prevYearLabel}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Y</span>
          </button>
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canGoPrevMonth || isPending}
            aria-label={prevMonthLabel}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">M</span>
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canGoNextMonth || isPending}
            aria-label={nextMonthLabel}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">M</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={goNextYear}
            disabled={!canGoNextYear || isPending}
            aria-label={nextYearLabel}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Y</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="submit"
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending || !year || !month}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {buttonLabel}
        </button>
      </form>
      <Link
        href={buildHref({ all: "true", month: undefined })}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        {allMonthsLabel}
      </Link>
    </div>
  );
}
