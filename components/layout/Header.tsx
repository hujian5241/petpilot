import { PawPrint } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { getSiteConfig } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
}

export async function Header({ locale }: HeaderProps) {
  const config = await getSiteConfig(locale);
  const t = await getTranslations("Header");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <PawPrint className="h-7 w-7 text-primary" aria-hidden="true" />
          <span>{config.name}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/search"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("search")}
          </Link>
          <Link
            href="/foods"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("foods")}
          </Link>
          <Link
            href="/plants"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("plants")}
          </Link>
          <Link
            href="/emergency"
            className="text-emergency transition-colors hover:text-emergency/80"
          >
            {t("emergency")}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("about")}
          </Link>
        </nav>
        <div className="md:hidden">
          <Link
            href="/search"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            {t("search")}
          </Link>
        </div>
      </div>
    </header>
  );
}
