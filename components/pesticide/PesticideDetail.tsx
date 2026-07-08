import { getTranslations } from "next-intl/server";

import { HazardDetail } from "@/components/hazard/HazardDetail";
import { buildPesticideFaqSchema } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";
import type { PesticideEntry } from "@/lib/types";

interface PesticideDetailProps {
  pesticide: PesticideEntry;
  locale: Locale;
}

export async function PesticideDetail({ pesticide, locale }: PesticideDetailProps) {
  const t = await getTranslations({ locale, namespace: "PesticideDetail" });
  const tNav = await getTranslations({ locale, namespace: "Header" });

  return (
    <HazardDetail
      entry={pesticide}
      type="pesticide"
      locale={locale}
      title={t("title", { name: pesticide.name })}
      subtitle={t("subtitle", { name: pesticide.name })}
      navLabel={tNav("pesticides")}
      navHref="/pesticides"
      safeForDogsTitle={t("safeForDogs", { name: pesticide.name })}
      safeForCatsTitle={t("safeForCats", { name: pesticide.name })}
      alternativesPrefix="pesticides"
      faqJsonLd={buildPesticideFaqSchema(pesticide)}
    >
      <>
        <h2>{t("activeIngredients")}</h2>
        <ul>
          {pesticide.active_ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        {pesticide.pest_targeted && pesticide.pest_targeted.length > 0 && (
          <>
            <h2>{t("pestTargeted")}</h2>
            <ul>
              {pesticide.pest_targeted.map((pest) => (
                <li key={pest}>{pest}</li>
              ))}
            </ul>
          </>
        )}

        {pesticide.formulation && (
          <>
            <h2>{t("formulation")}</h2>
            <p>{pesticide.formulation}</p>
          </>
        )}

        {pesticide.signal_word && (
          <>
            <h2>{t("signalWord")}</h2>
            <p>{pesticide.signal_word}</p>
          </>
        )}

        {pesticide.application_area && (
          <>
            <h2>{t("applicationArea")}</h2>
            <p>{pesticide.application_area}</p>
          </>
        )}

        {pesticide.epa_registration_number && (
          <>
            <h2>{t("epaRegistration")}</h2>
            <p>{pesticide.epa_registration_number}</p>
          </>
        )}
      </>
    </HazardDetail>
  );
}
