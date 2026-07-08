import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { CompactSafetyBadge } from "@/components/food/SafetyBadge";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ReportIssue } from "@/components/feedback/ReportIssue";
import { RelatedItems } from "@/components/detail/RelatedItems";
import { ToxicityCalculator } from "@/components/calculator/ToxicityCalculator";
import { FoodFaqSection } from "@/components/food/FoodFaqSection";
import { findRelatedEntries, getEmergencyInfo } from "@/lib/content";
import { buildFoodFaqSchema } from "@/lib/jsonld";
import type { FoodEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface FoodDetailProps {
  food: FoodEntry;
  locale: Locale;
}

export async function FoodDetail({ food, locale }: FoodDetailProps) {
  const isUrgent =
    food.requires_emergency_visit ||
    food.safety.dogs.status === "toxic" ||
    food.safety.cats.status === "toxic" ||
    food.safety.dogs.status === "limited" ||
    food.safety.cats.status === "limited";

  const info = await getEmergencyInfo(locale);
  const [aspca, pph] = info.hotlines;
  const related = await findRelatedEntries(food, locale, 6);
  const isBeverage = food.categories.includes("beverages");

  const pageUrl = `/${locale}/foods/${food.slug}`;
  const t = await getTranslations({ locale, namespace: "FoodDetail" });
  const tNav = await getTranslations({ locale, namespace: "Header" });
  const jsonLd = buildFoodFaqSchema(food);

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
            <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              {isBeverage ? t("canDogsDrink", { name: food.name }) : t("canDogsEat", { name: food.name })}
            </h1>
            {food.scientific_name && (
              <p className="mt-2 text-lg font-light italic text-muted-foreground">{food.scientific_name}</p>
            )}
            <p className="mt-2 text-lg font-light text-muted-foreground">
              {isBeverage ? t("drinkSubtitle", { name: food.name }) : t("subtitle", { name: food.name })}
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

        {food.why_it_matters && (
          <>
            <h2>{t("whyItMatters")}</h2>
            <p>{food.why_it_matters}</p>
          </>
        )}

        {food.how_it_works && (
          <>
            <h2>{t("howItWorks")}</h2>
            <p>{food.how_it_works}</p>
          </>
        )}

        {food.species_differences && (
          <>
            <h2>{t("speciesDifferences")}</h2>
            <p>{food.species_differences}</p>
          </>
        )}

        {food.common_scenarios && food.common_scenarios.length > 0 && (
          <>
            <h2>{t("commonScenarios")}</h2>
            <ul>
              {food.common_scenarios.map((scenario, idx) => (
                <li key={idx}>{scenario}</li>
              ))}
            </ul>
          </>
        )}

        {food.timeline && (
          <>
            <h2>{t("timeline")}</h2>
            <p>{food.timeline}</p>
          </>
        )}

        {food.quick_facts && food.quick_facts.length > 0 && (
          <>
            <h2>{t("quickFacts")}</h2>
            <ul>
              {food.quick_facts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          </>
        )}

        <h2>{isBeverage ? t("safeForDogsDrink", { name: food.name }) : t("safeForDogs", { name: food.name })}</h2>
        <p>{food.safety.dogs.summary}</p>

        <h2>{isBeverage ? t("safeForCatsDrink", { name: food.name }) : t("safeForCats", { name: food.name })}</h2>
        <p>{food.safety.cats.summary}</p>

        {food.preparation_notes && (
          <>
            <h2>{t("preparationNotes")}</h2>
            <p>{food.preparation_notes}</p>
          </>
        )}

        {(food.safe_amount || food.frequency || food.dosage_per_weight) && (
          <>
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

        <h2>{isBeverage ? t("whatIfDrank", { name: food.name }) : t("whatIfAte", { name: food.name })}</h2>
        <p>{food.what_to_do}</p>
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

        {food.toxicity_profiles && food.toxicity_profiles.length > 0 && (
          <ToxicityCalculator entry={food} locale={locale} />
        )}

        {food.condition_warnings && food.condition_warnings.length > 0 && (
          <>
            <h2>{t("healthConditions")}</h2>
            <p>{t("healthConditionsIntro", { name: food.name })}</p>
            <div className="not-prose mt-4 space-y-4">
              {food.condition_warnings.map((warning) => (
                <div key={warning.condition} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-medium">{warning.condition}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("forDogs")}: {warning.appliesTo.includes("dogs") ? t(warning.recommendation === "consult_vet" ? "consultVet" : warning.recommendation) : t("consultVet")} · {" "}
                    {t("forCats")}: {warning.appliesTo.includes("cats") ? t(warning.recommendation === "consult_vet" ? "consultVet" : warning.recommendation) : t("consultVet")}
                  </p>
                  <p className="mt-1 text-sm">{warning.reason}</p>
                </div>
              ))}
            </div>
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
      </div>

      <FoodFaqSection food={food} locale={locale} />

      <RelatedItems items={related} locale={locale} />

      <div className="mt-8 space-y-4">
        <ReportIssue itemName={food.name} pageUrl={pageUrl} locale={locale} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block text-amber-950">{t("vetsNote")}</strong>
          {t("vetsNoteText")}
        </div>
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
