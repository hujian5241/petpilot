import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { SafetyBadge, CompactSafetyBadge } from "./SafetyBadge";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ReportIssue } from "@/components/feedback/ReportIssue";
import { buildFoodFaqSchema } from "@/lib/jsonld";
import { getEmergencyInfo } from "@/lib/content";
import type { FoodEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface FoodDetailProps {
  food: FoodEntry;
  locale: Locale;
}

export async function FoodDetail({ food, locale }: FoodDetailProps) {
  const isUrgent =
    food.safety.dogs.status === "toxic" ||
    food.safety.cats.status === "toxic" ||
    food.safety.dogs.status === "limited" ||
    food.safety.cats.status === "limited";

  const jsonLd = buildFoodFaqSchema(food);
  const dogWarnings =
    food.condition_warnings?.filter((w) => w.appliesTo.includes("dogs")) ?? [];
  const catWarnings =
    food.condition_warnings?.filter((w) => w.appliesTo.includes("cats")) ?? [];

  const info = await getEmergencyInfo(locale);
  const [aspca, pph] = info.hotlines;

  const pageUrl = `/${locale}/foods/${food.slug}`;
  const t = await getTranslations("FoodDetail");
  const tNav = await getTranslations("Header");

  const recommendationLabel = (value: string) => {
    if (value === "avoid") return t("avoid");
    if (value === "limit") return t("limit");
    return t("consultVet");
  };

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
          { label: tNav("foods"), href: "/foods" },
          { label: food.name },
        ]}
      />

      <header className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-32">
            <Image
              src={food.images?.[0]?.src ?? `/images/foods/${food.slug}.svg`}
              alt={food.images?.[0]?.alt ?? food.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 112px, 128px"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("canDogsEat", { name: food.name })}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("subtitle", { name: food.name.toLowerCase() })}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <CompactSafetyBadge species="dogs" status={food.safety.dogs.status} locale={locale} />
              <CompactSafetyBadge species="cats" status={food.safety.cats.status} locale={locale} />
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
        <div dangerouslySetInnerHTML={{ __html: food.content ?? "" }} />

        <h2>{t("safeForDogs", { name: food.name })}</h2>
        <p>{food.safety.dogs.summary}</p>

        <h2>{t("safeForCats", { name: food.name })}</h2>
        <p>{food.safety.cats.summary}</p>

        {food.preparation_notes && (
          <>
            <h2>{t("preparationNotes")}</h2>
            <p>{food.preparation_notes}</p>
          </>
        )}

        {food.safe_amount && (
          <>
            <h2>{t("recommendedAmount")}</h2>
            <p>{food.safe_amount}</p>
          </>
        )}

        {food.frequency && (
          <>
            <h2>{t("howOften")}</h2>
            <p>{food.frequency}</p>
          </>
        )}

        {food.symptoms.length > 0 && (
          <>
            <h2>{t("symptoms")}</h2>
            <ul>
              {food.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </>
        )}

        <h2>{t("whatIfAte", { name: food.name })}</h2>
        <p>{food.what_to_do}</p>
        <div className="not-prose my-4 flex flex-wrap gap-3">
          {aspca && (
            <a
              href={`tel:${aspca.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-white hover:bg-emergency/90"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t("call", { name: aspca.name })}
            </a>
          )}
          {pph && (
            <a
              href={`tel:${pph.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border border-emergency bg-white px-4 py-2 text-emergency hover:bg-emergency-light"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {pph.name}
            </a>
          )}
        </div>

        {(dogWarnings.length > 0 || catWarnings.length > 0) && (
          <>
            <h2>{t("healthConditions")}</h2>
            <p>{t("healthConditionsIntro", { name: food.name.toLowerCase() })}</p>
            {dogWarnings.length > 0 && (
              <>
                <h3>{t("forDogs")}</h3>
                <ul>
                  {dogWarnings.map((w) => (
                    <li key={w.condition}>
                      <strong>{w.condition}</strong>{" "}
                      —{" "}
                      {recommendationLabel(w.recommendation)}: {w.reason}
                      {w.notes && (
                        <span className="mt-1 block text-sm text-muted-foreground">{w.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {catWarnings.length > 0 && (
              <>
                <h3>{t("forCats")}</h3>
                <ul>
                  {catWarnings.map((w) => (
                    <li key={w.condition}>
                      <strong>{w.condition}</strong>{" "}
                      —{" "}
                      {recommendationLabel(w.recommendation)}: {w.reason}
                      {w.notes && (
                        <span className="mt-1 block text-sm text-muted-foreground">{w.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {food.alternatives.length > 0 && (
          <>
            <h2>{t("safeAlternatives")}</h2>
            <ul>
              {food.alternatives.map((alt) => (
                <li key={alt}>
                  <Link href={`/foods/${alt}`} className="text-primary hover:text-primary-dark">
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

        {food.sources.length > 0 && (
          <>
            <h2>{t("sources")}</h2>
            <ul>
              {food.sources.map((source) => (
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

      <div className="mt-8 space-y-4">
        <ReportIssue itemName={food.name} pageUrl={pageUrl} locale={locale} />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-amber-950">{t("medicalDisclaimer")}</strong>
          {t.rich("medicalDisclaimerText", {
            aspca: (chunks) =>
              aspca ? (
                <a href={`tel:${aspca.phone.replace(/\D/g, "")}`} className="font-semibold underline">
                  {chunks}
                </a>
              ) : (
                <>{chunks}</>
              ),
            pph: (chunks) =>
              pph ? (
                <a href={`tel:${pph.phone.replace(/\D/g, "")}`} className="font-semibold underline">
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
