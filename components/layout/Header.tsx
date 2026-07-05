import { PawPrint } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { LocaleSwitcher, NavDropdown } from "./HeaderClient";
import type { Locale } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("Header");

  const categoryItems = [
    { href: "/foods", label: t("foods") },
    { href: "/plants", label: t("plants") },
    { href: "/medications", label: t("medications") },
    { href: "/household-chemicals", label: t("householdChemicals") },
    { href: "/pesticides", label: t("pesticides") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <PawPrint className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">PetPilot</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 text-sm font-medium md:flex">
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
          <NavDropdown label={t("categories")} items={categoryItems} />
          <Link
            href="/news"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("news")}
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
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <LocaleSwitcher locale={locale} />
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LocaleSwitcher locale={locale} />
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
