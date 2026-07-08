import { getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface DisclaimerProps {
  locale?: Locale;
  className?: string;
}

export async function Disclaimer({ locale = "en", className }: DisclaimerProps) {
  const t = await getTranslations({ locale, namespace: "Disclaimer" });

  return (
    <div
      className={cn(
        "rounded-xl bg-muted p-4 text-sm text-muted-foreground",
        className
      )}
    >
      <strong className="text-foreground">{t("important")}{" "}</strong>
      {t("text")}
    </div>
  );
}
