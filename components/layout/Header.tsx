"use client";

import { useState, useEffect } from "react";
import { PawPrint } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";
import { LocaleSwitcher, NavDropdown, MobileMenu } from "./HeaderClient";
import type { Locale } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categoryItems = [
    { href: "/foods", label: t("foods") },
    { href: "/plants", label: t("plants") },
    { href: "/medications", label: t("medications") },
    { href: "/household-chemicals", label: t("householdChemicals") },
    { href: "/pesticides", label: t("pesticides") },
  ];

  const mainNavItems = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: "/news", label: t("news") },
    { href: "/guides", label: t("guides") },
    { href: "/emergency", label: t("emergency"), variant: "emergency" as const },
    { href: "/about", label: t("about") },
  ];

  function isActive(href: string): boolean {
    if (!mounted) return false;
    return href === pathname;
  }

  function navLinkClass(href: string, variant?: "default" | "emergency"): string {
    const active = isActive(href);
    const base = "text-sm font-medium transition-colors";
    if (variant === "emergency") {
      return `${base} ${active ? "font-semibold underline underline-offset-4" : ""} text-emergency hover:text-emergency/80`;
    }
    return `${base} ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-medium tracking-tight text-foreground"
        >
          <PawPrint className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">PetPilot</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
          <Link href="/" className={navLinkClass("/")} aria-current={isActive("/") ? "page" : undefined}>
            {t("home")}
          </Link>
          <Link href="/search" className={navLinkClass("/search")} aria-current={isActive("/search") ? "page" : undefined}>
            {t("search")}
          </Link>
          <NavDropdown
            label={t("categories")}
            items={categoryItems}
            active={categoryItems.some((item) => isActive(item.href))}
          />
          <Link href="/news" className={navLinkClass("/news")} aria-current={isActive("/news") ? "page" : undefined}>
            {t("news")}
          </Link>
          <Link href="/guides" className={navLinkClass("/guides")} aria-current={isActive("/guides") ? "page" : undefined}>
            {t("guides")}
          </Link>
          <Link href="/emergency" className={navLinkClass("/emergency", "emergency")} aria-current={isActive("/emergency") ? "page" : undefined}>
            {t("emergency")}
          </Link>
          <Link href="/about" className={navLinkClass("/about")} aria-current={isActive("/about") ? "page" : undefined}>
            {t("about")}
          </Link>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <LocaleSwitcher locale={locale} />
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LocaleSwitcher locale={locale} />
          <MobileMenu locale={locale} navItems={mainNavItems} categoryItems={categoryItems} />
        </div>
      </div>
    </header>
  );
}
