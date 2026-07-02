import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SafetyStatus, Species } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

const statusLabels: Record<Locale, Record<SafetyStatus, string>> = {
  en: { safe: "Safe", limited: "Limited", toxic: "Toxic", unknown: "Unknown" },
  de: { safe: "Unbedenklich", limited: "Eingeschränkt", toxic: "Giftig", unknown: "Unbekannt" },
  fr: { safe: "Sûr", limited: "Limité", toxic: "Toxique", unknown: "Inconnu" },
  ja: { safe: "安全", limited: "制限あり", toxic: "有毒", unknown: "不明" },
};

const speciesLabels: Record<Locale, Record<Species, string>> = {
  en: { dogs: "Dogs", cats: "Cats" },
  de: { dogs: "Hunde", cats: "Katzen" },
  fr: { dogs: "Chiens", cats: "Chats" },
  ja: { dogs: "犬", cats: "猫" },
};

const statusConfig: Record<
  SafetyStatus,
  { icon: typeof CheckCircle2; bg: string; text: string; border: string }
> = {
  safe: {
    icon: CheckCircle2,
    bg: "bg-status-safe-bg",
    text: "text-status-safe",
    border: "border-status-safe-border",
  },
  limited: {
    icon: AlertTriangle,
    bg: "bg-status-limited-bg",
    text: "text-status-limited",
    border: "border-status-limited-border",
  },
  toxic: {
    icon: XCircle,
    bg: "bg-status-toxic-bg",
    text: "text-status-toxic",
    border: "border-status-toxic-border",
  },
  unknown: {
    icon: HelpCircle,
    bg: "bg-status-unknown-bg",
    text: "text-status-unknown",
    border: "border-status-unknown-border",
  },
};

interface SafetyBadgeProps {
  species: Species;
  status: SafetyStatus;
  locale?: Locale;
  className?: string;
}

export function SafetyBadge({ species, status, locale = "en", className }: SafetyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const speciesLabel = speciesLabels[locale]?.[species] ?? speciesLabels.en[species];
  const statusLabel = statusLabels[locale]?.[status] ?? statusLabels.en[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-80">{speciesLabel}</span>
        <span className="font-semibold">{statusLabel}</span>
      </div>
    </div>
  );
}

interface CompactSafetyBadgeProps {
  species: Species;
  status: SafetyStatus;
  locale?: Locale;
}

export function CompactSafetyBadge({ species, status, locale = "en" }: CompactSafetyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const speciesLabel = speciesLabels[locale]?.[species] ?? speciesLabels.en[species];
  const statusLabel = statusLabels[locale]?.[status] ?? statusLabels.en[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium", config.text)}>
      <Icon className="h-4 w-4" />
      <span>{speciesLabel}: {statusLabel}</span>
    </div>
  );
}
