import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getEmergencyInfo } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

interface EmergencyBannerProps {
  locale: Locale;
  variant?: "inline" | "card";
  className?: string;
}

export async function EmergencyBanner({
  locale,
  variant = "inline",
  className,
}: EmergencyBannerProps) {
  const info = await getEmergencyInfo(locale);
  const primary = info.hotlines[0];
  const t = await getTranslations("EmergencyBanner");

  return (
    <div
      className={cn(
        "border-l-4 border-emergency bg-emergency-light p-4",
        variant === "card" && "rounded-lg border",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-emergency" aria-hidden="true" />
        <div>
          <p className="font-semibold text-emergency">{t("title")}</p>
          <p className="mt-1 text-sm text-foreground">
            {t("call", { name: primary?.name ?? "ASPCA Poison Control" })}{" "}
            <a
              href={`tel:${primary?.phone?.replace(/\D/g, "") ?? "8884264435"}`}
              className="font-semibold text-emergency hover:underline"
            >
              {primary?.phone ?? "(888) 426-4435"}
            </a>
            {" "}{t("or")}{" "}
            <Link href="/emergency" className="font-semibold text-emergency hover:underline">
              {t("viewEmergencyGuide")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
