import { getTranslations } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GuideList } from "@/components/guides/GuideList";
import { Link } from "@/i18n/routing";
import { getAllGuides, getAllGuideCategories, getSiteConfig } from "@/lib/content";
import { buildItemListSchema } from "@/lib/jsonld";
import { buildAlternates } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";

interface GuidesPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: GuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const t = await getTranslations({ locale, namespace: "GuidesPage" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/guides", config, locale),
  };
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;
  const [guides, categories, config, t, tNav] = await Promise.all([
    getAllGuides(locale),
    getAllGuideCategories(locale),
    getSiteConfig(locale),
    getTranslations({ locale, namespace: "GuidesPage" }),
    getTranslations({ locale, namespace: "Header" }),
  ]);

  const featured = guides.filter((g) => g.featured);
  const regular = guides.filter((g) => !g.featured);
  const baseUrl = config.base_url.endsWith("/") ? config.base_url.slice(0, -1) : config.base_url;

  const jsonLd = buildItemListSchema(
    guides.map((g) => ({
      name: g.title,
      url: `${baseUrl}/${locale}/guides/${g.slug}`,
    }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb
        locale={locale}
        items={[{ label: tNav("guides"), href: "/guides" }]}
      />

      <header className="mt-6 text-center">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg font-light text-muted-foreground">
          {t("description")}
        </p>
      </header>

      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-medium tracking-tight text-foreground">{t("featured")}</h2>
          <div className="mt-4">
            <GuideList guides={featured} locale={locale} />
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-medium tracking-tight text-foreground">{t("categories")}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                key={category.slug}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {category.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-medium tracking-tight text-foreground">{t("allGuides")}</h2>
        <div className="mt-4">
          <GuideList guides={regular} locale={locale} />
        </div>
      </section>
    </div>
  );
}
