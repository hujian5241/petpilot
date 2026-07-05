import { getTranslations } from "next-intl/server";

import { HazardDetail } from "@/components/hazard/HazardDetail";
import type { Locale } from "@/lib/i18n";
import type { MedicationEntry } from "@/lib/types";

interface MedicationDetailProps {
  medication: MedicationEntry;
  locale: Locale;
}

export async function MedicationDetail({ medication, locale }: MedicationDetailProps) {
  const t = await getTranslations("MedicationDetail");
  const tNav = await getTranslations("Header");

  return (
    <HazardDetail
      entry={medication}
      type="medication"
      locale={locale}
      title={t("title", { name: medication.name })}
      subtitle={t("subtitle", { name: medication.name })}
      navLabel={tNav("medications")}
      navHref="/medications"
      safeForDogsTitle={t("safeForDogs", { name: medication.name })}
      safeForCatsTitle={t("safeForCats", { name: medication.name })}
      alternativesPrefix="medications"
    >
      <>
        <h2>{t("activeIngredients")}</h2>
        <ul>
          {medication.active_ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        {medication.brand_names && medication.brand_names.length > 0 && (
          <>
            <h2>{t("brandNames")}</h2>
            <ul>
              {medication.brand_names.map((brand) => (
                <li key={brand}>{brand}</li>
              ))}
            </ul>
          </>
        )}

        {medication.dosage_form && (
          <>
            <h2>{t("dosageForm")}</h2>
            <p>{medication.dosage_form}</p>
          </>
        )}

        {medication.common_uses && medication.common_uses.length > 0 && (
          <>
            <h2>{t("commonUses")}</h2>
            <ul>
              {medication.common_uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </>
        )}

        {medication.toxic_ingredients && medication.toxic_ingredients.length > 0 && (
          <>
            <h2>{t("toxicIngredients")}</h2>
            <ul>
              {medication.toxic_ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </>
        )}
      </>
    </HazardDetail>
  );
}
