import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExternalLink, AlertTriangle } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getNewsBySlugCached, getAllNewsSlugs, loadClusters, getClusterBySlug } from "@/lib/news-content";
import { getSiteConfig, getSlugs, type ContentType } from "@/lib/content";
import { defaultLocale, type Locale } from "@/lib/i18n";
import type { NewsEntry, NewsSeverity } from "@/lib/news-types";

interface NewsDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params;
  let slugs = await getAllNewsSlugs(locale as Locale);
  if (slugs.length === 0) {
    slugs = await getAllNewsSlugs(defaultLocale);
  }
  return slugs.map((slug) => ({ slug }));
}

function buildDescription(entry: NewsEntry): string {
  const why =
    entry.severity === "critical"
      ? "Critical pet safety alert: "
      : entry.severity === "high"
      ? "Important pet safety update: "
      : "Pet safety news: ";
  const details = [
    entry.summary,
    entry.species.length > 0 && `Affects ${entry.species.join(", ")}`,
    entry.location && `Reported in ${entry.location}`,
  ]
    .filter(Boolean)
    .join(" | ");
  const full = `${why}${details}`;
  return full.length > 160 ? `${full.slice(0, 157).trim()}...` : full;
}

function truncateHeadline(title: string): string {
  if (title.length <= 110) return title;
  return `${title.slice(0, 107).trim()}...`;
}

function newsArticleJsonLd(
  entry: NewsEntry,
  baseUrl: string,
  updatedAt: string,
  imageUrl: string,
  canonicalUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: truncateHeadline(entry.title),
    description: entry.summary,
    datePublished: entry.date,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: "PetPilot",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "PetPilot",
      logo: {
        "@type": "ImageObject",
        url: imageUrl,
      },
    },
    image: [imageUrl],
    articleSection: "Pet Safety News",
    keywords: [...entry.species, ...entry.substances].join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    ...(entry.sourceUrl
      ? { isBasedOn: { "@type": "WebPage", url: entry.sourceUrl } }
      : {}),
    ...(entry.location
      ? { contentLocation: { "@type": "Place", name: entry.location } }
      : {}),
  };
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const news = await getNewsBySlugCached(slug, locale);
  if (!news) return {};
  const [config, clusters] = await Promise.all([
    getSiteConfig(locale),
    loadClusters(locale),
  ]);
  const cluster = getClusterBySlug(clusters, slug);
  const canonicalSlug = cluster?.canonicalSlug ?? slug;
  const canonicalUrl = `${config.base_url}/${locale}/news/${canonicalSlug}`;
  const title = `${news.entry.title} | PetPilot News`;
  const description = buildDescription(news.entry);
  const ogImage = `${config.base_url}/images/og-default.svg`;
  return {
    title,
    description,
    metadataBase: new URL(config.base_url),
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [{ name: "PetPilot", url: config.base_url }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: news.entry.date,
      modifiedTime: news.updatedAt,
      images: [ogImage],
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function severityLabelClass(severity: NewsEntry["severity"]): string {
  switch (severity) {
    case "critical":
      return "bg-status-toxic-bg text-status-toxic border-status-toxic-border";
    case "high":
      return "bg-status-limited-bg text-status-limited border-status-limited-border";
    case "moderate":
      return "bg-status-unknown-bg text-status-unknown border-status-unknown-border";
    default:
      return "bg-status-safe-bg text-status-safe border-status-safe-border";
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params;
  const [news, config, clusters] = await Promise.all([
    getNewsBySlugCached(slug, locale),
    getSiteConfig(locale),
    loadClusters(locale),
  ]);

  if (!news) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "NewsPage" });
  const entry = news.entry;
  const related = entry.relatedSlugs ?? {};

  const cluster = getClusterBySlug(clusters, slug);
  const canonicalSlug = cluster?.canonicalSlug ?? slug;
  const canonicalUrl = `${config.base_url}/${locale}/news/${canonicalSlug}`;
  const otherCoverage =
    cluster?.sources.filter((source) => source.slug !== slug) ?? [];

  const relatedRoutes: { type: ContentType; slug: string; label: string }[] = [
    ...(related.foods ?? []).map((s) => ({ type: "foods" as ContentType, slug: s, label: s })),
    ...(related.plants ?? []).map((s) => ({ type: "plants" as ContentType, slug: s, label: s })),
    ...(related.medications ?? []).map((s) => ({ type: "medications" as ContentType, slug: s, label: s })),
    ...(related["household-chemicals"] ?? []).map((s) => ({
      type: "household-chemicals" as ContentType,
      slug: s,
      label: s,
    })),
    ...(related.pesticides ?? []).map((s) => ({ type: "pesticides" as ContentType, slug: s, label: s })),
  ];

  const jsonLd = newsArticleJsonLd(
    entry,
    config.base_url,
    news.updatedAt,
    `${config.base_url}/images/og-default.svg`,
    canonicalUrl
  );

  // Build additional related links based on species and substances when explicit related slugs are empty.
  if (relatedRoutes.length === 0) {
    if (entry.species.includes("dogs")) {
      relatedRoutes.push({ type: "foods", slug: "chocolate", label: "chocolate" });
      relatedRoutes.push({ type: "foods", slug: "grapes", label: "grapes" });
    }
    if (entry.species.includes("cats")) {
      relatedRoutes.push({ type: "plants", slug: "lily", label: "lily" });
    }
    if (entry.substances.some((s) => s.toLowerCase().includes("xylitol"))) {
      relatedRoutes.push({ type: "foods", slug: "xylitol", label: "xylitol" });
    }
    if (entry.substances.some((s) => s.toLowerCase().includes("grape") || s.toLowerCase().includes("raisin"))) {
      relatedRoutes.push({ type: "foods", slug: "grapes", label: "grapes" });
    }
  }

  // Validate that related guide slugs actually exist in the current locale (with fallback).
  const typeSlugs = new Map<ContentType, Set<string>>();
  const validRelatedRoutes = (
    await Promise.all(
      relatedRoutes.map(async (route) => {
        if (!typeSlugs.has(route.type)) {
          const slugs = await getSlugs(route.type, locale);
          typeSlugs.set(route.type, new Set(slugs));
        }
        return typeSlugs.get(route.type)!.has(route.slug) ? route : undefined;
      })
    )
  ).filter(Boolean) as typeof relatedRoutes;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Breadcrumb
        locale={locale}
        items={[
          { label: t("news"), href: "/news" },
          { label: entry.title },
        ]}
      />

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={entry.date}>{entry.date}</time>
          <span>·</span>
          <span>{entry.source}</span>
          {entry.location && (
            <>
              <span>·</span>
              <span>{entry.location}</span>
            </>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{entry.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${severityLabelClass(
              entry.severity
            )}`}
          >
            <AlertTriangle className="h-4 w-4" />
            {t(`severity.${entry.severity}`)}
          </span>
          {entry.species.map((species) => (
            <span
              key={species}
              className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
            >
              {t(`species.${species}`)}
            </span>
          ))}
          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
            {t(`status.${entry.status}`)}
          </span>
        </div>
      </header>

      <p className="mt-8 text-lg leading-relaxed text-foreground">{entry.summary}</p>

      <section
        className="prose-pet mt-6"
        dangerouslySetInnerHTML={{ __html: news.contentHtml }}
      />

      <section className="mt-8 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">{t("sourceHeading")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("sourceDescription", { source: entry.source })}
        </p>
        <a
          href={entry.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
        >
          {t("readFullReport")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>

      {validRelatedRoutes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">{t("relatedGuides")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {validRelatedRoutes.map((route) => (
              <li key={`${route.type}-${route.slug}`}>
                <Link
                  href={`/${route.type}/${route.slug}`}
                  className="block rounded-lg border border-border bg-card p-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  {route.label
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherCoverage.length > 0 && (
        <section className="mt-8 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">{t("relatedCoverage")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {otherCoverage.map((source) => (
              <li key={source.slug}>
                <Link
                  href={`/news/${source.slug}`}
                  className="block rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  {source.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block text-amber-950">{t("disclaimerTitle")}</strong>
        {t("disclaimerText")}
      </section>
    </article>
  );
}
