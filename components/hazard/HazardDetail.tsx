import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { SafetyBadge, CompactSafetyBadge } from "@/components/food/SafetyBadge";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ReportIssue } from "@/components/feedback/ReportIssue";
import { RelatedItems } from "@/components/detail/RelatedItems";
import { ToxicityCalculator } from "@/components/calculator/ToxicityCalculator";
import { findRelatedEntries, getEmergencyInfo } from "@/lib/content";
import {
  buildMedicationFaqSchema,
  buildHouseholdChemicalFaqSchema,
  buildPesticideFaqSchema,
  buildGuideFaqSchema,
} from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";
import type {
  SearchIndexItem,
  MedicationEntry,
  HouseholdChemicalEntry,
  PesticideEntry,
  FoodImage,
  ToxicityProfile,
} from "@/lib/types";

interface HazardDetailEntry {
  slug: string;
  name: string;
  images?: FoodImage[];
  categories: string[];
  tags: string[];
  safety: {
    dogs: { status: "safe" | "limited" | "toxic" | "unknown"; summary: string };
    cats: { status: "safe" | "limited" | "toxic" | "unknown"; summary: string };
  };
  symptoms: string[];
  what_to_do: string;
  alternatives: string[];
  sources: { name: string; url?: string }[];
  toxicity_profiles?: ToxicityProfile[];
  content?: string;
}

interface HazardDetailProps {
  entry: HazardDetailEntry;
  type: SearchIndexItem["type"];
  locale: Locale;
  title: string;
  subtitle: string;
  navLabel: string;
  navHref: string;
  safeForDogsTitle: string;
  safeForCatsTitle: string;
  alternativesPrefix: string;
  faqJsonLd?: object;
  children?: React.ReactNode;
}

const routePrefix: Record<SearchIndexItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

const imagePrefix: Record<SearchIndexItem["type"], string> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
};

export async function HazardDetail({
  entry,
  type,
  locale,
  title,
  subtitle,
  navLabel,
  navHref,
  safeForDogsTitle,
  safeForCatsTitle,
  alternativesPrefix,
  faqJsonLd,
  children,
}: HazardDetailProps) {
  const isUrgent =
    entry.safety.dogs.status === "toxic" ||
    entry.safety.cats.status === "toxic" ||
    entry.safety.dogs.status === "limited" ||
    entry.safety.cats.status === "limited";

  const info = await getEmergencyInfo(locale);
  const [aspca, pph] = info.hotlines;
  const related = await findRelatedEntries(entry, locale, 6);

  const prefix = routePrefix[type];
  const imgPrefix = imagePrefix[type];
  const pageUrl = `/${locale}/${prefix}/${entry.slug}`;
  const t = await getTranslations({ locale, namespace: "HazardDetail" });
  const jsonLd = faqJsonLd ?? buildGuideFaqSchema(entry);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb
        locale={locale}
        items={[
          { label: navLabel, href: navHref },
          { label: entry.name },
        ]}
      />

      <header className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-32">
            <Image
              src={entry.images?.[0]?.src ?? `/images/${imgPrefix}/${entry.slug}.svg`}
              alt={entry.images?.[0]?.alt ?? entry.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 112px, 128px"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-2 text-lg font-light text-muted-foreground">{subtitle}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <CompactSafetyBadge species="dogs" status={entry.safety.dogs.status} locale={locale} />
              <CompactSafetyBadge species="cats" status={entry.safety.cats.status} locale={locale} />
            </div>
          </div>
        </div>
      </header>

      {isUrgent && (
        <div className="mt-6">
          <EmergencyBanner locale={locale} />
        </div>
      )}

      <div className="prose-pet mt-8">
        <div dangerouslySetInnerHTML={{ __html: entry.content ?? "" }} />

        <h2>{safeForDogsTitle}</h2>
        <p>{entry.safety.dogs.summary}</p>

        <h2>{safeForCatsTitle}</h2>
        <p>{entry.safety.cats.summary}</p>

        {children}

        {entry.symptoms.length > 0 && (
          <>
            <h2>{t("symptoms")}</h2>
            <ul>
              {entry.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </>
        )}

        <h2>{t("whatIfAte", { name: entry.name })}</h2>
        <p>{entry.what_to_do}</p>
        <div className="not-prose my-4 flex flex-wrap gap-3">
          {aspca && (
            <Button variant="emergency" asChild>
              <a href={`tel:${aspca.phone.replace(/\D/g, "")}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("call", { name: aspca.name })}
              </a>
            </Button>
          )}
          {pph && (
            <Button variant="emergency-outline" asChild>
              <a href={`tel:${pph.phone.replace(/\D/g, "")}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {pph.name}
              </a>
            </Button>
          )}
        </div>

        {entry.toxicity_profiles && entry.toxicity_profiles.length > 0 && (
          <ToxicityCalculator entry={entry as MedicationEntry} locale={locale} />
        )}

        {entry.alternatives.length > 0 && (
          <>
            <h2>{t("safeAlternatives")}</h2>
            <ul>
              {entry.alternatives.map((alt) => (
                <li key={alt}>
                  <Link
                    href={`/${alternativesPrefix}/${alt}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {alt
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {entry.sources.length > 0 && (
          <>
            <h2>{t("sources")}</h2>
            <ul>
              {entry.sources.map((source) => (
                <li key={source.name}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-dark"
                    >
                      {source.name}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    source.name
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <h2>{t("vetsNote")}</h2>
        <p>{t("vetsNoteText")}</p>
      </div>

      <RelatedItems items={related} locale={locale} />

      <div className="mt-8 space-y-4">
        <ReportIssue itemName={entry.name} pageUrl={pageUrl} locale={locale} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-amber-950">{t("medicalDisclaimer")}</strong>
          {t.rich("medicalDisclaimerText", {
            aspca: (chunks) =>
              aspca ? (
                <a
                  href={`tel:${aspca.phone.replace(/\D/g, "")}`}
                  className="font-medium underline"
                >
                  {chunks}
                </a>
              ) : (
                <>{chunks}</>
              ),
            pph: (chunks) =>
              pph ? (
                <a
                  href={`tel:${pph.phone.replace(/\D/g, "")}`}
                  className="font-medium underline"
                >
                  {chunks}
                </a>
              ) : (
                <>{chunks}</>
              ),
          })}
        </div>
      </div>
    </article>
  );
}
