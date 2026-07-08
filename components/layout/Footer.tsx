import { Link } from "@/i18n/routing";
import { getSiteConfig, getEmergencyInfo } from "@/lib/content";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  const config = await getSiteConfig(locale);
  const info = await getEmergencyInfo(locale);
  const [aspca, pph] = info.hotlines;
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-medium tracking-tight">{config.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground" suppressHydrationWarning>{config.tagline}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("quickLinks")}</h4>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Link href="/search" className="text-muted-foreground hover:text-foreground">
                {t("search")}
              </Link>
              <Link href="/news" className="text-muted-foreground hover:text-foreground">
                {t("news")}
              </Link>
              <Link href="/emergency" className="text-muted-foreground hover:text-foreground">
                {t("emergency")}
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                {t("about")}
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                {t("terms")}
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                {t("privacy")}
              </Link>
            </div>
            <details className="group mt-4">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                {t("categories")}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <li>
                  <Link href="/foods" className="text-muted-foreground hover:text-foreground">
                    {t("foods")}
                  </Link>
                </li>
                <li>
                  <Link href="/plants" className="text-muted-foreground hover:text-foreground">
                    {t("plants")}
                  </Link>
                </li>
                <li>
                  <Link href="/medications" className="text-muted-foreground hover:text-foreground">
                    {t("medications")}
                  </Link>
                </li>
                <li>
                  <Link href="/household-chemicals" className="text-muted-foreground hover:text-foreground">
                    {t("householdChemicals")}
                  </Link>
                </li>
                <li>
                  <Link href="/pesticides" className="text-muted-foreground hover:text-foreground">
                    {t("pesticides")}
                  </Link>
                </li>
              </ul>
            </details>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("emergency")}</h4>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {aspca && (
                <p>
                  {aspca.name}:{" "}
                  <a
                    href={`tel:${aspca.phone.replace(/\D/g, "")}`}
                    className="font-medium text-emergency hover:underline"
                  >
                    {aspca.phone}
                  </a>
                </p>
              )}
              {pph && (
                <p>
                  {pph.name}:{" "}
                  <a
                    href={`tel:${pph.phone.replace(/\D/g, "")}`}
                    className="font-medium text-emergency hover:underline"
                  >
                    {pph.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            © {new Date().getFullYear()} {config.name}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
