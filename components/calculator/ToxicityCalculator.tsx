"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calculator, ChevronDown, ChevronUp, Phone } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FoodEntry, MedicationEntry } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type EntryWithProfiles = FoodEntry | MedicationEntry;

type WeightUnit = "kg" | "lb";
type AmountUnit = "g" | "mg" | "oz" | "tablet";
type RiskLevel = "safe" | "caution" | "toxic" | "critical" | "unknown";

interface ToxicityCalculatorProps {
  entry: EntryWithProfiles;
  locale: Locale;
}

const OZ_TO_G = 28.3495;

export function ToxicityCalculator({ entry, locale }: ToxicityCalculatorProps) {
  const t = useTranslations("ToxicityCalculator");
  const [isOpen, setIsOpen] = useState(false);
  const [species, setSpecies] = useState<"dogs" | "cats">("dogs");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [amount, setAmount] = useState("");
  const [amountUnit, setAmountUnit] = useState<AmountUnit>("g");

  const profile = entry.toxicity_profiles?.find((p) => p.species === species);

  const availableAmountUnits = useMemo(() => {
    const units: { value: AmountUnit; label: string }[] = [];
    const hasConcentration = profile?.concentration_mg_per_g !== undefined;
    const hasGPerKg = profile?.toxic_dose_g_per_kg !== undefined;
    const hasTablet = profile?.tablet_mg !== undefined;
    const hasMgPerKg = profile?.toxic_dose_mg_per_kg !== undefined;

    if (hasConcentration || hasGPerKg) {
      units.push({ value: "g", label: t("unitG") });
      units.push({ value: "oz", label: t("unitOz") });
    }
    if (hasConcentration || hasMgPerKg || (!hasConcentration && !hasGPerKg && !hasTablet)) {
      units.push({ value: "mg", label: t("unitMg") });
    }
    if (hasTablet) {
      units.push({ value: "tablet", label: t("unitTablet") });
    }
    return units;
  }, [profile, t]);

  // Reset amount unit when available units change and current is unavailable.
  useEffect(() => {
    const currentUnitAvailable = availableAmountUnits.some((u) => u.value === amountUnit);
    if (!currentUnitAvailable && availableAmountUnits.length > 0) {
      setAmountUnit(availableAmountUnits[0]!.value);
    }
  }, [availableAmountUnits, amountUnit]);

  const result = useMemo(() => {
    const weightNum = Number.parseFloat(weight);
    const amountNum = Number.parseFloat(amount);
    if (!profile || Number.isNaN(weightNum) || Number.isNaN(amountNum) || weightNum <= 0 || amountNum <= 0) {
      return null;
    }

    const weightKg = weightUnit === "lb" ? weightNum * 0.453592 : weightNum;

    let dosePerKgMg: number | undefined;
    let dosePerKgG: number | undefined;
    let computedMg: number | undefined;

    if (profile.concentration_mg_per_g !== undefined) {
      const grams = amountUnit === "oz" ? amountNum * OZ_TO_G : amountUnit === "g" ? amountNum : amountNum / profile.concentration_mg_per_g;
      computedMg = grams * profile.concentration_mg_per_g;
      dosePerKgMg = computedMg / weightKg;
    } else if (profile.tablet_mg !== undefined && amountUnit === "tablet") {
      computedMg = amountNum * profile.tablet_mg;
      dosePerKgMg = computedMg / weightKg;
    } else if (profile.toxic_dose_g_per_kg !== undefined) {
      const grams = amountUnit === "oz" ? amountNum * OZ_TO_G : amountUnit === "g" ? amountNum : amountNum;
      dosePerKgG = grams / weightKg;
    } else {
      // Treat amount as mg directly.
      const mg = amountUnit === "g" ? amountNum * 1000 : amountNum;
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
  }, [profile, weight, weightUnit, amount, amountUnit]);

  const riskConfig: Record<RiskLevel, { title: string; className: string; iconClassName: string }> = {
    safe: {
      title: t("resultSafe"),
      className: "border-status-safe-border bg-status-safe-bg text-status-safe",
      iconClassName: "text-status-safe",
    },
    caution: {
      title: t("resultCaution"),
      className: "border-status-unknown-border bg-status-unknown-bg text-status-unknown",
      iconClassName: "text-status-unknown",
    },
    toxic: {
      title: t("resultToxic"),
      className: "border-status-limited-border bg-status-limited-bg text-status-limited",
      iconClassName: "text-status-limited",
    },
    critical: {
      title: t("resultCritical"),
      className: "border-status-toxic-border bg-status-toxic-bg text-status-toxic",
      iconClassName: "text-status-toxic",
    },
    unknown: {
      title: t("resultUnknown"),
      className: "border-border bg-muted text-muted-foreground",
      iconClassName: "text-muted-foreground",
    },
  };

  return (
    <Card variant="compact" className="mt-8">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h3 className="text-base font-medium text-foreground">{t("title")}</h3>
            <p className="text-sm text-muted-foreground">{t("subtitle", { name: entry.name })}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {!profile ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
              {t("noData", { name: entry.name })}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor={`${entry.slug}-species`} className="block text-sm font-medium text-foreground">
                    {t("speciesLabel")}
                  </label>
                  <select
                    id={`${entry.slug}-species`}
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as "dogs" | "cats")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="dogs">{t("speciesDogs")}</option>
                    <option value="cats">{t("speciesCats")}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${entry.slug}-weight`} className="block text-sm font-medium text-foreground">
                    {t("weightLabel")}
                  </label>
                  <div className="flex">
                    <input
                      id={`${entry.slug}-weight`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={t("weightPlaceholder")}
                      className="h-10 flex-1 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                      className="h-10 rounded-r-md border border-input bg-muted px-3 text-sm text-foreground"
                    >
                      <option value="kg">{t("unitKg")}</option>
                      <option value="lb">{t("unitLb")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor={`${entry.slug}-amount`} className="block text-sm font-medium text-foreground">
                    {t("amountLabel")}
                  </label>
                  <div className="flex">
                    <input
                      id={`${entry.slug}-amount`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t("amountPlaceholder")}
                      className="h-10 flex-1 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                      value={amountUnit}
                      onChange={(e) => setAmountUnit(e.target.value as AmountUnit)}
                      className="h-10 rounded-r-md border border-input bg-muted px-3 text-sm text-foreground"
                    >
                      {availableAmountUnits.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {result && (
                <div className={cn("rounded-lg border p-4", riskConfig[result.risk].className)}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{riskConfig[result.risk].title}</span>
                    {result.detail && (
                      <span className="text-sm opacity-90">{result.detail}</span>
                    )}
                  </div>
                  {result.risk !== "safe" && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button variant="emergency" size="sm" asChild>
                        <a href="tel:8884264435">
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          {t("callAspca")}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
