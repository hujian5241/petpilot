import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { EmergencyWizard } from "@/components/emergency/EmergencyWizard";
import {
  getAllFoods,
  getAllHouseholdChemicals,
  getAllMedications,
  getAllPesticides,
  getAllPlants,
  getEmergencyInfo,
  getSiteConfig,
} from "@/lib/content";
import { locales, type Locale } from "@/lib/i18n";
import type { SafetyStatus } from "@/lib/types";

interface WizardPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: WizardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "EmergencyWizard" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: {
      canonical: `${config.base_url}/${locale}/emergency/wizard`,
    },
  };
}

interface WizardItem {
  slug: string;
  name: string;
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide";
  summary: string;
  safetyDogs: SafetyStatus;
  safetyCats: SafetyStatus;
  toxicityProfiles?: { species: "dogs" | "cats"; toxic_dose_mg_per_kg?: number; lethal_dose_mg_per_kg?: number; toxic_dose_g_per_kg?: number; concentration_mg_per_g?: number; tablet_mg?: number; note?: string }[];
}

export default async function EmergencyWizardPage({ params }: WizardPageProps) {
  const { locale } = await params;
  const [info, foods, plants, medications, chemicals, pesticides] = await Promise.all([
    getEmergencyInfo(locale),
    getAllFoods(locale),
    getAllPlants(locale),
    getAllMedications(locale),
    getAllHouseholdChemicals(locale),
    getAllPesticides(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "EmergencyWizard" });
  const tNav = await getTranslations({ locale, namespace: "Header" });

  const items: WizardItem[] = [
    ...foods.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: "food" as const,
      summary: item.safety.dogs.summary,
      safetyDogs: item.safety.dogs.status,
      safetyCats: item.safety.cats.status,
      toxicityProfiles: item.toxicity_profiles,
    })),
    ...plants.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: "plant" as const,
      summary: item.safety.dogs.summary,
      safetyDogs: item.safety.dogs.status,
      safetyCats: item.safety.cats.status,
      toxicityProfiles: undefined,
    })),
    ...medications.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: "medication" as const,
      summary: item.safety.dogs.summary,
      safetyDogs: item.safety.dogs.status,
      safetyCats: item.safety.cats.status,
      toxicityProfiles: item.toxicity_profiles,
    })),
    ...chemicals.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: "household-chemical" as const,
      summary: item.safety.dogs.summary,
      safetyDogs: item.safety.dogs.status,
      safetyCats: item.safety.cats.status,
      toxicityProfiles: undefined,
    })),
    ...pesticides.map((item) => ({
      slug: item.slug,
      name: item.name,
      type: "pesticide" as const,
      summary: item.safety.dogs.summary,
      safetyDogs: item.safety.dogs.status,
      safetyCats: item.safety.cats.status,
      toxicityProfiles: undefined,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        locale={locale}
        items={[
          { label: tNav("emergency"), href: "/emergency" },
          { label: t("breadcrumb") },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-lg font-light text-muted-foreground">{t("description")}</p>
      </header>

      <div className="mt-8">
        <EmergencyWizard
          items={items}
          commonToxinSlugs={info.common_toxins}
          hotlines={info.hotlines}
          locale={locale}
        />
      </div>
    </div>
  );
}
