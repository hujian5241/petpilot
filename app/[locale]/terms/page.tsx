import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig, getPageMarkdown } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface TermsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const page = await getPageMarkdown(locale, "terms");
  const t = await getTranslations({ locale, namespace: "LegalPages" });
  return {
    title: page?.title ?? `Terms of Service | ${config.name}`,
    description: t("termsDescription", { name: config.name }),
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/terms", config, locale),
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const page = await getPageMarkdown(locale, "terms");
  const t = await getTranslations({ locale, namespace: "LegalPages" });

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: page.title }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{page.title}</h1>
        <p className="mt-2 text-sm font-light text-muted-foreground">{t("lastUpdated", { date: "July 1, 2026" })}</p>
      </header>

      <section
        className="prose-pet mt-8"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
