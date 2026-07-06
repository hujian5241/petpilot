import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteConfig, getPageMarkdown } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

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

function buildAlternates(
  path: string,
  config: Awaited<ReturnType<typeof getSiteConfig>>,
  locale: Locale
) {
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;
  const languages: Record<string, string> = {};
  for (const loc of ["en", "de", "fr", "ja"] as const) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages["x-default"] = `${baseUrl}/en${path}`;
  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages,
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
        <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.tagline}</p>
      </header>

      <section
        className="prose-pet mt-8"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
