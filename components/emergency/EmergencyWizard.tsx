"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowLeft, ArrowRight, Phone, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Locale } from "@/lib/i18n";
import type { SafetyStatus, Species, ToxicityProfile } from "@/lib/types";
import {
  calculateToxicityRisk,
  getAvailableAmountUnits,
  type RiskLevel,
} from "@/lib/toxicity";
import { cn } from "@/lib/utils";

interface WizardItem {
  slug: string;
  name: string;
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide";
  summary: string;
  safetyDogs: SafetyStatus;
  safetyCats: SafetyStatus;
  toxicityProfiles?: ToxicityProfile[];
}

interface Hotline {
  name: string;
  phone: string;
  url?: string;
}

interface EmergencyWizardProps {
  items: WizardItem[];
  commonToxinSlugs: string[];
  hotlines: Hotline[];
  locale: Locale;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type AmountUnit = "g" | "mg" | "oz" | "tablet";

const COMMON_SYMPTOMS = [
  "vomiting",
  "diarrhea",
  "lethargy",
  "weakness",
  "loss-of-appetite",
  "restlessness",
  "tremors",
  "seizures",
  "collapse",
  "difficulty-breathing",
  "pale-gums",
];

const SEVERE_SYMPTOMS = new Set(["seizures", "collapse", "difficulty-breathing"]);

export function EmergencyWizard({
  items,
  commonToxinSlugs,
  hotlines,
  locale,
}: EmergencyWizardProps) {
  const t = useTranslations();
  const [step, setStep] = useState<Step>(1);
  const [species, setSpecies] = useState<Species>("dogs");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [amountUnit, setAmountUnit] = useState<AmountUnit>("g");
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  const selectedItem = useMemo(
    () => items.find((i) => i.slug === selectedSlug) ?? null,
    [items, selectedSlug]
  );

  const profile = selectedItem?.toxicityProfiles?.find((p) => p.species === species);

  const availableAmountUnits = useMemo(() => getAvailableAmountUnits(profile), [profile]);

  if (
    availableAmountUnits.length > 0 &&
    !availableAmountUnits.some((u) => u.value === amountUnit)
  ) {
    setAmountUnit(availableAmountUnits[0]!.value);
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (q) {
      list = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)
      );
    }
    // Prioritize common toxins and toxic/limited items for the species.
    return [...list].sort((a, b) => {
      const aCommon = commonToxinSlugs.includes(a.slug) ? 1 : 0;
      const bCommon = commonToxinSlugs.includes(b.slug) ? 1 : 0;
      if (aCommon !== bCommon) return bCommon - aCommon;
      const statusPriority = { toxic: 0, limited: 1, unknown: 2, safe: 3 };
      const aStatus = statusPriority[a[`safety${species === "dogs" ? "Dogs" : "Cats"}`]];
      const bStatus = statusPriority[b[`safety${species === "dogs" ? "Dogs" : "Cats"}`]];
      return aStatus - bStatus;
    });
  }, [items, query, species, commonToxinSlugs]);

  const weightKg = Number.parseFloat(weight);
  const weightNumValid = !Number.isNaN(weightKg) && weightKg > 0;
  const weightInKg = weightUnit === "lb" ? weightKg * 0.453592 : weightKg;

  const amountNum = Number.parseFloat(amount);
  const amountValid = !Number.isNaN(amountNum) && amountNum > 0;

  const baseRisk: RiskLevel | null = useMemo(() => {
    if (!selectedItem) return null;
    const status = selectedItem[`safety${species === "dogs" ? "Dogs" : "Cats"}`];
    if (status === "safe") return "safe";
    if (profile && amountValid && weightNumValid) {
      return calculateToxicityRisk(profile, weightInKg, amountNum, amountUnit).risk;
    }
    if (status === "toxic") return "toxic";
    if (status === "limited") return "caution";
    return "unknown";
  }, [selectedItem, species, profile, amountValid, weightNumValid, weightInKg, amountNum, amountUnit]);

  const finalRisk: RiskLevel | null = useMemo(() => {
    if (!baseRisk) return null;
    const hasSevere = [...selectedSymptoms].some((s) => SEVERE_SYMPTOMS.has(s));
    if (hasSevere) {
      if (baseRisk === "safe" || baseRisk === "caution" || baseRisk === "toxic" || baseRisk === "unknown") {
        return "critical";
      }
    } else if (selectedSymptoms.size > 0) {
      const bump: Record<RiskLevel, RiskLevel> = {
        safe: "caution",
        caution: "toxic",
        toxic: "critical",
        critical: "critical",
        unknown: "toxic",
      };
      return bump[baseRisk];
    }
    return baseRisk;
  }, [baseRisk, selectedSymptoms]);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });
  }

  function reset() {
    setStep(1);
    setSpecies("dogs");
    setWeight("");
    setWeightUnit("kg");
    setQuery("");
    setSelectedSlug(null);
    setAmount("");
    setAmountUnit("g");
    setSelectedSymptoms(new Set());
  }

  const riskConfig: Record<RiskLevel, { title: string; className: string }> = {
    safe: {
      title: t("EmergencyWizard.resultSafe"),
      className: "border-status-safe-border bg-status-safe-bg text-status-safe",
    },
    caution: {
      title: t("EmergencyWizard.resultCaution"),
      className: "border-status-unknown-border bg-status-unknown-bg text-status-unknown",
    },
    toxic: {
      title: t("EmergencyWizard.resultToxic"),
      className: "border-status-limited-border bg-status-limited-bg text-status-limited",
    },
    critical: {
      title: t("EmergencyWizard.resultCritical"),
      className: "border-status-toxic-border bg-status-toxic-bg text-status-toxic",
    },
    unknown: {
      title: t("EmergencyWizard.resultUnknown"),
      className: "border-border bg-muted text-muted-foreground",
    },
  };

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return weightNumValid;
      case 3:
        return selectedSlug !== null;
      case 4:
        return amountValid;
      case 5:
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    if (step < 6) setStep((s) => ((s + 1) as Step));
  }

  function handleBack() {
    if (step > 1) setStep((s) => ((s - 1) as Step));
  }

  return (
    <Card variant="feature">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-foreground">{t("EmergencyWizard.title")}</h2>
        <span className="text-sm text-muted-foreground">{t("EmergencyWizard.stepIndicator", { current: step, total: 6 })}</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("EmergencyWizard.stepSpecies")}</p>
          <div className="grid grid-cols-2 gap-3">
            {(["dogs", "cats"] as Species[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpecies(s)}
                className={cn(
                  "rounded-xl border px-4 py-6 text-center transition-colors",
                  species === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                <span className="text-lg font-medium">{t(`SafetyBadge.${s}`)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("EmergencyWizard.stepWeight")}</p>
          <div className="flex">
            <input
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={t("EmergencyWizard.weightPlaceholder")}
              className="h-12 flex-1 rounded-l-xl border border-r-0 border-input bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as "kg" | "lb")}
              className="h-12 rounded-r-xl border border-input bg-muted px-4 text-foreground"
            >
              <option value="kg">{t("ToxicityCalculator.unitKg")}</option>
              <option value="lb">{t("ToxicityCalculator.unitLb")}</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("EmergencyWizard.stepSubstance")}</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("EmergencyWizard.substanceSearchPlaceholder")}
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="max-h-80 space-y-2 overflow-auto">
            {filteredItems.slice(0, 20).map((item) => {
              const status = item[`safety${species === "dogs" ? "Dogs" : "Cats"}`];
              const active = selectedSlug === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setSelectedSlug(item.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary-subdued"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`SearchPage.${item.type}Tag`)} · {item.summary.slice(0, 60)}
                      {item.summary.length > 60 && "..."}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      status === "toxic"
                        ? "bg-status-toxic-bg text-status-toxic"
                        : status === "limited"
                        ? "bg-status-limited-bg text-status-limited"
                        : status === "safe"
                        ? "bg-status-safe-bg text-status-safe"
                        : "bg-status-unknown-bg text-status-unknown"
                    )}
                  >
                    {t(`SafetyBadge.${status}`)}
                  </span>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">{t("EmergencyWizard.substanceNoResults")}</p>
            )}
          </div>
        </div>
      )}

      {step === 4 && selectedItem && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("EmergencyWizard.stepAmount", { name: selectedItem.name })}
          </p>
          <div className="flex">
            <input
              type="number"
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t("EmergencyWizard.amountPlaceholder")}
              className="h-12 flex-1 rounded-l-xl border border-r-0 border-input bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={amountUnit}
              onChange={(e) => setAmountUnit(e.target.value as AmountUnit)}
              className="h-12 rounded-r-xl border border-input bg-muted px-4 text-foreground"
            >
              {availableAmountUnits.map((u) => (
                <option key={u.value} value={u.value}>{t(`ToxicityCalculator.${u.labelKey}`)}</option>
              ))}
            </select>
          </div>
          {!profile && (
            <p className="text-sm text-muted-foreground">{t("EmergencyWizard.noCalculatorData")}</p>
          )}
        </div>
      )}

      {step === 5 && selectedItem && (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("EmergencyWizard.stepSymptoms")}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {COMMON_SYMPTOMS.map((symptom) => (
              <label
                key={symptom}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  selectedSymptoms.has(symptom)
                    ? "border-primary bg-primary-subdued"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSymptoms.has(symptom)}
                  onChange={() => toggleSymptom(symptom)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {t(`EmergencyWizard.symptom_${symptom}`)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 6 && selectedItem && finalRisk && (
        <div className="space-y-6">
          <div className={cn("rounded-xl border p-5", riskConfig[finalRisk].className)}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-2xl font-light">{riskConfig[finalRisk].title}</span>
            </div>
            <p className="mt-2 text-sm opacity-90">
              {t(`EmergencyWizard.resultText_${finalRisk}`, {
                name: selectedItem.name,
              })}
            </p>
          </div>

          {finalRisk !== "safe" && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">{t("EmergencyWizard.callNow")}</h3>
              <div className="flex flex-wrap gap-3">
                {hotlines.slice(0, 2).map((h) => (
                  <Button key={h.name} variant="emergency" asChild>
                    <a href={`tel:${h.phone.replace(/\D/g, "")}`}>
                      <Phone className="h-4 w-4" />
                      {h.name}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="block text-amber-950">{t("EmergencyWizard.disclaimerTitle")}</strong>
            {t("EmergencyWizard.disclaimerText")}
          </div>

          <Button variant="secondary" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            {t("EmergencyWizard.restartButton")}
          </Button>
        </div>
      )}

      {step < 6 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4" />
            {t("EmergencyWizard.backButton")}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {t("EmergencyWizard.nextButton")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
