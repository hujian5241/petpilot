import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig, getPageMarkdown } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata";
import type { Locale } from "@/lib/i18n";

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-static";

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const page = await getPageMarkdown(locale, "about");
  return {
    title: page?.title ?? `About ${config.name}`,
    description: config.description,
    metadataBase: new URL(config.base_url),
    alternates: buildAlternates("/about", config, locale),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const config = await getSiteConfig(locale);
  const page = await getPageMarkdown(locale, "about");

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb locale={locale} items={[{ label: page.title }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">{page.title}</h1>
        <p className="mt-2 text-lg font-light text-muted-foreground">{config.tagline}</p>
      </header>

      <section
        className="prose-pet mt-8"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
