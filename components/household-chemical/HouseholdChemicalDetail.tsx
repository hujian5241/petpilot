import { getTranslations } from "next-intl/server";

import { HazardDetail } from "@/components/hazard/HazardDetail";
import type { Locale } from "@/lib/i18n";
import type { HouseholdChemicalEntry } from "@/lib/types";

interface HouseholdChemicalDetailProps {
  chemical: HouseholdChemicalEntry;
  locale: Locale;
}

export async function HouseholdChemicalDetail({ chemical, locale }: HouseholdChemicalDetailProps) {
  const t = await getTranslations("HouseholdChemicalDetail");
  const tNav = await getTranslations("Header");

  return (
    <HazardDetail
      entry={chemical}
      type="household-chemical"
      locale={locale}
      title={t("title", { name: chemical.name })}
      subtitle={t("subtitle", { name: chemical.name })}
      navLabel={tNav("householdChemicals")}
      navHref="/household-chemicals"
      safeForDogsTitle={t("safeForDogs", { name: chemical.name })}
      safeForCatsTitle={t("safeForCats", { name: chemical.name })}
      alternativesPrefix="household-chemicals"
    >
      <>
        {chemical.active_ingredients && chemical.active_ingredients.length > 0 && (
          <>
            <h2>{t("activeIngredients")}</h2>
            <ul>
              {chemical.active_ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </>
        )}

        {chemical.common_products && chemical.common_products.length > 0 && (
          <>
            <h2>{t("commonProducts")}</h2>
            <ul>
              {chemical.common_products.map((product) => (
                <li key={product}>{product}</li>
              ))}
            </ul>
          </>
        )}

        {chemical.room && (
          <>
            <h2>{t("commonLocation")}</h2>
            <p>{chemical.room}</p>
          </>
        )}

        {chemical.ventilation_notes && (
          <>
            <h2>{t("ventilationNotes")}</h2>
            <p>{chemical.ventilation_notes}</p>
          </>
        )}

        {chemical.dilution_warning && (
          <>
            <h2>{t("dilutionWarning")}</h2>
            <p>{chemical.dilution_warning}</p>
          </>
        )}
      </>
    </HazardDetail>
  );
}
