"use client";

import { useState } from "react";
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

export function ReportIssue({
  pageUrl,
  itemName,
  contactEmail = "hello@petpilot.io",
  siteName = "PetPilot",
  locale = "en",
}: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("ReportIssue");

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
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
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
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3
                id="report-issue-title"
                className="text-lg font-semibold text-foreground"
              >
                {t("title")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
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
                    className="block rounded-lg border border-border p-3 hover:bg-muted"
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
