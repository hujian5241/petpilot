import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SafetyStatus, Species } from "@/lib/types";

const statusConfig: Record<
  SafetyStatus,
  { label: string; icon: typeof CheckCircle2; bg: string; text: string; border: string }
> = {
  safe: {
    label: "Safe",
    icon: CheckCircle2,
    bg: "bg-status-safe-bg",
    text: "text-status-safe",
    border: "border-status-safe-border",
  },
  limited: {
    label: "Limited",
    icon: AlertTriangle,
    bg: "bg-status-limited-bg",
    text: "text-status-limited",
    border: "border-status-limited-border",
  },
  toxic: {
    label: "Toxic",
    icon: XCircle,
    bg: "bg-status-toxic-bg",
    text: "text-status-toxic",
    border: "border-status-toxic-border",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    bg: "bg-status-unknown-bg",
    text: "text-status-unknown",
    border: "border-status-unknown-border",
  },
};

interface SafetyBadgeProps {
  species: Species;
  status: SafetyStatus;
  className?: string;
}

export function SafetyBadge({ species, status, className }: SafetyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const speciesLabel = species === "dogs" ? "Dogs" : "Cats";

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
        <span className="font-semibold">{config.label}</span>
      </div>
    </div>
  );
}

interface CompactSafetyBadgeProps {
  species: Species;
  status: SafetyStatus;
}

export function CompactSafetyBadge({ species, status }: CompactSafetyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const speciesLabel = species === "dogs" ? "Dogs" : "Cats";

  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium", config.text)}>
      <Icon className="h-4 w-4" />
      <span>{speciesLabel}: {config.label}</span>
    </div>
  );
}
