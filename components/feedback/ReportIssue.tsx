"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Locale } from "@/lib/i18n";

interface ReportIssueProps {
  pageUrl?: string;
  itemName?: string;
  contactEmail?: string;
  siteName?: string;
  locale?: Locale;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onEscape: () => void
) {
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    previouslyFocused.current = document.activeElement;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll(FOCUSABLE_SELECTOR);
    const first = focusable?.[0] as HTMLElement | undefined;
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== "Tab" || !container) return;

      const elements = Array.from(
        container.querySelectorAll(FOCUSABLE_SELECTOR)
      ) as HTMLElement[];
      if (elements.length === 0) return;

      const firstEl = elements[0]!;
      const lastEl = elements[elements.length - 1]!;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (
        previouslyFocused.current instanceof HTMLElement &&
        document.body.contains(previouslyFocused.current)
      ) {
        previouslyFocused.current.focus();
      }
    };
  }, [containerRef, enabled, onEscape]);
}

export function ReportIssue({
  pageUrl,
  itemName,
  contactEmail = "contact@petpilot.top",
  siteName = "PetPilot",
  locale = "en",
}: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("ReportIssue");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [isOpen]);

  const subject = encodeURIComponent(
    itemName ? `Feedback about ${itemName}` : `${siteName} feedback`
  );

  const options = [
    { label: t("incorrectSafety"), detail: t("incorrectSafetyDetail") },
    { label: t("missingInfo"), detail: t("missingInfoDetail") },
    { label: t("typoOrLink"), detail: t("typoOrLinkDetail") },
    { label: t("other"), detail: t("otherDetail") },
  ];

  return (
    <div className="not-prose">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        {t("button")}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-issue-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-panel"
          >
            <div className="flex items-center justify-between">
              <h3
                id="report-issue-title"
                className="text-lg font-medium tracking-tight text-foreground"
              >
                {t("title")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("description", { item: itemName ?? siteName })}
            </p>
            <div className="mt-4 space-y-2">
              {options.map((option) => {
                const body = encodeURIComponent(
                  `Issue type: ${option.label}\n\nPage: ${
                    pageUrl ?? ""
                  }\n\nPlease describe the issue:\n\n`
                );
                return (
                  <a
                    key={option.label}
                    href={`mailto:${contactEmail}?subject=${subject}&body=${body}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <span className="block font-medium text-foreground">{option.label}</span>
                    <span className="block text-sm text-muted-foreground">{option.detail}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
