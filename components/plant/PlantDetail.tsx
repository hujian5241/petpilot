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
import { findRelatedEntries, getEmergencyInfo } from "@/lib/content";
import { buildPlantFaqSchema } from "@/lib/jsonld";
import type { PlantEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface PlantDetailProps {
  plant: PlantEntry;
  locale: Locale;
}

export async function PlantDetail({ plant, locale }: PlantDetailProps) {
  const isUrgent =
    plant.safety.dogs.status === "toxic" ||
    plant.safety.cats.status === "toxic" ||
    plant.safety.dogs.status === "limited" ||
    plant.safety.cats.status === "limited";

  const info = await getEmergencyInfo(locale);
  const [aspca, pph] = info.hotlines;
  const related = await findRelatedEntries(plant, locale, 6);

  const pageUrl = `/${locale}/plants/${plant.slug}`;
  const t = await getTranslations({ locale, namespace: "PlantDetail" });
  const tNav = await getTranslations({ locale, namespace: "Header" });
  const jsonLd = buildPlantFaqSchema(plant);

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
          { label: tNav("plants"), href: "/plants" },
          { label: plant.name },
        ]}
      />

      <header className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-32">
            <Image
              src={plant.images?.[0]?.src ?? `/images/plants/${plant.slug}.svg`}
              alt={plant.images?.[0]?.alt ?? plant.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 112px, 128px"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {t("isSafeForPets", { name: plant.name })}
            </h1>
            {plant.scientific_name && (
              <p className="mt-2 text-lg font-light italic text-muted-foreground">{plant.scientific_name}</p>
            )}
            <p className="mt-2 text-lg font-light text-muted-foreground">
              {t("subtitle", { name: plant.name.toLowerCase() })}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <CompactSafetyBadge species="dogs" status={plant.safety.dogs.status} locale={locale} />
              <CompactSafetyBadge species="cats" status={plant.safety.cats.status} locale={locale} />
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
        <div dangerouslySetInnerHTML={{ __html: plant.content ?? "" }} />

        <h2>{t("safeForDogs", { name: plant.name })}</h2>
        <p>{plant.safety.dogs.summary}</p>

        <h2>{t("safeForCats", { name: plant.name })}</h2>
        <p>{plant.safety.cats.summary}</p>

        {plant.symptoms.length > 0 && (
          <>
            <h2>{t("symptoms")}</h2>
            <ul>
              {plant.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </>
        )}

        <h2>{t("whatIfAte", { name: plant.name })}</h2>
        <p>{plant.what_to_do}</p>
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

        {plant.alternatives.length > 0 && (
          <>
            <h2>{t("safeAlternatives")}</h2>
            <ul>
              {plant.alternatives.map((alt) => (
                <li key={alt}>
                  <Link href={`/plants/${alt}`} className="text-primary hover:text-primary-dark">
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

        {plant.sources.length > 0 && (
          <>
            <h2>{t("sources")}</h2>
            <ul>
              {plant.sources.map((source) => (
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
        <ReportIssue itemName={plant.name} pageUrl={pageUrl} locale={locale} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-amber-950">{t("medicalDisclaimer")}</strong>
          {t.rich("medicalDisclaimerText", {
            aspca: (chunks) =>
              aspca ? (
                <a href={`tel:${aspca.phone.replace(/\D/g, "")}`} className="font-medium underline">
                  {chunks}
                </a>
              ) : (
                <>{chunks}</>
              ),
            pph: (chunks) =>
              pph ? (
                <a href={`tel:${pph.phone.replace(/\D/g, "")}`} className="font-medium underline">
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
