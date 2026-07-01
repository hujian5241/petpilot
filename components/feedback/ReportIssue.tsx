"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";

interface ReportIssueProps {
  pageUrl?: string;
  itemName?: string;
  contactEmail?: string;
  siteName?: string;
}

export function ReportIssue({
  pageUrl,
  itemName,
  contactEmail = "hello@petpilot.io",
  siteName = "PetPilot",
}: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);

  const subject = encodeURIComponent(
    itemName ? `Feedback about ${itemName}` : `${siteName} feedback`
  );

  return (
    <div className="not-prose">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report an issue
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
                Report an issue
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
              Help us improve{" "}
              {itemName ? `the information about ${itemName}` : siteName}. Let us know if something is
              incorrect, outdated, or missing.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { label: "Incorrect safety info", detail: "The safety status or symptoms seem wrong." },
                { label: "Missing information", detail: "Something important is not covered." },
                { label: "Typo or broken link", detail: "There is a text error or link issue." },
                { label: "Other", detail: "Something else." },
              ].map((option) => {
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
