import { Phone, AlertTriangle, Stethoscope } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Disclaimer } from "@/components/food/Disclaimer";
import { Button } from "@/components/ui/Button";
import { getAllFoods, getEmergencyInfo, getSiteConfig } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface EmergencyPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: EmergencyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "EmergencyPage" });
  return {
    title: t("poisonControlHotlines"),
    description: t("whenToCall"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/emergency", config, locale),
  };
}

export default async function EmergencyPage({ params }: EmergencyPageProps) {
  const { locale } = await params;
  const [info, foods] = await Promise.all([
    getEmergencyInfo(locale),
    getAllFoods(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "EmergencyPage" });

  const commonToxinFoods = info.common_toxins
    .map((slug) => foods.find((food) => food.slug === slug))
    .filter((food): food is NonNullable<typeof food> => food !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: t("emergency") }]} />

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-emergency" />
          <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{info.title}</h1>
        </div>
        <p className="mt-2 text-lg font-light text-muted-foreground">{info.subtitle}</p>
      </header>

      <section className="mt-6 rounded-xl border border-primary/20 bg-primary-subdued p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-medium text-foreground">{t("startWizard")}</h2>
              <p className="text-sm text-muted-foreground">{t("wizardDescription")}</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/emergency/wizard">{t("startWizard")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-emergency/20 bg-emergency-light p-6">
        <h2 className="text-xl font-medium text-emergency">{t("poisonControlHotlines")}</h2>
        <div className="mt-4 space-y-4">
          {info.hotlines.map((hotline) => (
            <div key={hotline.name} className="rounded-xl border border-border bg-background p-4 shadow-card">
              <p className="font-medium text-foreground">{hotline.name}</p>
              <a
                href={`tel:${hotline.phone.replace(/\D/g, "")}`}
                className="mt-1 inline-flex items-center gap-2 text-2xl font-light text-emergency hover:underline"
              >
                <Phone className="h-5 w-5" />
                {hotline.phone}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotline.available} · {hotline.cost}
              </p>
              {hotline.url && (
                <a
                  href={hotline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-primary hover:underline"
                >
                  {t("visitWebsite")}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("whenToCall")}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-foreground">
          {info.when_to_call.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("stepsToTake")}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-foreground">
          {info.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">{t("commonToxicFoods")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {commonToxinFoods.map((food) => (
            <Link
              key={food.slug}
              href={`/foods/${food.slug}`}
              className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card"
            >
              <p className="font-medium text-foreground">{food.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{food.safety.dogs.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Disclaimer locale={locale} />
      </div>
    </div>
  );
}
