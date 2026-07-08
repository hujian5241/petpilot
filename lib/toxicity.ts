import type { Species } from "./types";
import type { ToxicityProfile } from "./types";

const OZ_TO_G = 28.3495;

export type RiskLevel = "safe" | "caution" | "toxic" | "critical" | "unknown";

export interface ToxicityResult {
  risk: RiskLevel;
  detail: string;
  computedMg?: number;
}

export function calculateToxicityRisk(
  profile: ToxicityProfile | undefined,
  weightKg: number,
  amount: number,
  amountUnit: "g" | "mg" | "oz" | "tablet"
): ToxicityResult {
  if (!profile || weightKg <= 0 || amount <= 0) {
    return { risk: "unknown", detail: "" };
  }

  let dosePerKgMg: number | undefined;
  let dosePerKgG: number | undefined;
  let computedMg: number | undefined;

  if (profile.concentration_mg_per_g !== undefined) {
    const grams = amountUnit === "oz" ? amount * OZ_TO_G : amountUnit === "g" ? amount : amount / profile.concentration_mg_per_g;
    computedMg = grams * profile.concentration_mg_per_g;
    dosePerKgMg = computedMg / weightKg;
  } else if (profile.tablet_mg !== undefined && amountUnit === "tablet") {
    computedMg = amount * profile.tablet_mg;
    dosePerKgMg = computedMg / weightKg;
  } else if (profile.toxic_dose_g_per_kg !== undefined) {
    const grams = amountUnit === "oz" ? amount * OZ_TO_G : amountUnit === "g" ? amount : amount;
    dosePerKgG = grams / weightKg;
  } else {
    const mg = amountUnit === "g" ? amount * 1000 : amount;
    dosePerKgMg = mg / weightKg;
  }

  let risk: RiskLevel = "unknown";
  let detail = "";

  if (dosePerKgMg !== undefined) {
    if (profile.lethal_dose_mg_per_kg !== undefined && dosePerKgMg >= profile.lethal_dose_mg_per_kg) {
      risk = "critical";
    } else if (profile.toxic_dose_mg_per_kg !== undefined) {
      if (dosePerKgMg >= profile.toxic_dose_mg_per_kg) {
        risk = "toxic";
      } else if (dosePerKgMg >= profile.toxic_dose_mg_per_kg * 0.5) {
        risk = "caution";
      } else {
        risk = "safe";
      }
    } else if (profile.note) {
      risk = "unknown";
    } else {
      risk = "safe";
    }
    detail = `${Math.round(dosePerKgMg)} mg/kg`;
  } else if (dosePerKgG !== undefined) {
    if (profile.toxic_dose_g_per_kg !== undefined) {
      if (dosePerKgG >= profile.toxic_dose_g_per_kg) {
        risk = "toxic";
      } else if (dosePerKgG >= profile.toxic_dose_g_per_kg * 0.5) {
        risk = "caution";
      } else {
        risk = "safe";
      }
    }
    detail = `${dosePerKgG.toFixed(1)} g/kg`;
  } else if (profile.note) {
    risk = "unknown";
    detail = profile.note;
  }

  return { risk, detail, computedMg };
}

export function getAvailableAmountUnits(
  profile: ToxicityProfile | undefined
): Array<{ value: "g" | "mg" | "oz" | "tablet"; labelKey: string }> {
  if (!profile) return [{ value: "mg", labelKey: "unitMg" }];

  const hasConcentration = profile.concentration_mg_per_g !== undefined;
  const hasGPerKg = profile.toxic_dose_g_per_kg !== undefined;
  const hasTablet = profile.tablet_mg !== undefined;
  const hasMgPerKg = profile.toxic_dose_mg_per_kg !== undefined;

  const units: Array<{ value: "g" | "mg" | "oz" | "tablet"; labelKey: string }> = [];
  if (hasConcentration || hasGPerKg) {
    units.push({ value: "g", labelKey: "unitG" });
    units.push({ value: "oz", labelKey: "unitOz" });
  }
  if (hasConcentration || hasMgPerKg || (!hasConcentration && !hasGPerKg && !hasTablet)) {
    units.push({ value: "mg", labelKey: "unitMg" });
  }
  if (hasTablet) {
    units.push({ value: "tablet", labelKey: "unitTablet" });
  }
  if (units.length === 0) {
    units.push({ value: "mg", labelKey: "unitMg" });
  }
  return units;
}
