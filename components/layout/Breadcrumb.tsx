import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { getSiteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  locale: Locale;
  className?: string;
}

export async function Breadcrumb({ items, locale, className }: BreadcrumbProps) {
  const t = await getTranslations("Breadcrumb");
  const config = await getSiteConfig(locale);
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: { "@type": "Thing"; "@id": string; name: string };
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: t("home"),
      item: {
        "@type": "Thing",
        "@id": `${baseUrl}/${locale}`,
        name: t("home"),
      },
    },
    ...items.map((item, index) => {
      const position = index + 2;
      if (item.href) {
        return {
          "@type": "ListItem" as const,
          position,
          name: item.label,
          item: {
            "@type": "Thing" as const,
            "@id": `${baseUrl}/${locale}${item.href}`,
            name: item.label,
          },
        };
      }
      return {
        "@type": "ListItem" as const,
        position,
        name: item.label,
      };
    }),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
