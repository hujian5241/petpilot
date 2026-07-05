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
  const t = await getTranslations("Footer");
  const d = await getTranslations("Disclaimer");

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">{config.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{config.tagline}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t("quickLinks")}</h4>
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
              <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
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
            <h4 className="text-sm font-semibold">{t("emergency")}</h4>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {aspca && (
                <p>
                  {aspca.name}:{" "}
                  <a
                    href={`tel:${aspca.phone.replace(/\D/g, "")}`}
                    className="text-emergency hover:underline"
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
                    className="text-emergency hover:underline"
                  >
                    {pph.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="block text-amber-950">{t("medicalDisclaimer")}</strong>
            {d("text")}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {config.name}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
