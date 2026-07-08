import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";
import { ExternalLink, AlertTriangle } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ClusterSummaryCard } from "@/components/news/ClusterSummaryCard";
import { RelatedCoverageSection } from "@/components/news/RelatedCoverageSection";
import { NewsTypeBadge } from "@/components/news/NewsTypeBadge";
import { getNewsBySlug, getAllNewsSlugs, loadClustersRaw, getClusterBySlug } from "@/lib/news-content";
import { getSiteConfig, getSlugs, type ContentType } from "@/lib/content";
import { defaultLocale, type Locale } from "@/lib/i18n";
import type { NewsEntry, NewsSeverity } from "@/lib/news-types";

interface NewsDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [slugs, clusters] = await Promise.all([
    getAllNewsSlugs(locale as Locale),
    loadClustersRaw(locale as Locale),
  ]);
  const allSlugs = new Set(slugs);
  for (const cluster of clusters) {
    allSlugs.add(cluster.canonicalSlug);
    for (const source of cluster.sources) {
      allSlugs.add(source.slug);
    }
  }
  if (allSlugs.size === 0) {
    const fallbackSlugs = await getAllNewsSlugs(defaultLocale);
    return fallbackSlugs.map((slug) => ({ slug }));
  }
  return Array.from(allSlugs).map((slug) => ({ slug }));
}

function buildDescription(entry: NewsEntry, locale: Locale): string {
  const speciesText = entry.species.length > 0 ? entry.species.join(", ") : "";
  const substanceText = entry.substances.length > 0 ? entry.substances.join(", ") : "";
  const severityText = entry.severity;

  const prefixMap: Record<NewsSeverity, string> = {
    critical: "Critical pet safety alert: ",
    high: "Important pet safety update: ",
    moderate: "Pet safety update: ",
    low: "Pet safety note: ",
  };

  let details = entry.summary;
  if (speciesText) {
    details += ` Affects ${speciesText}.`;
  }
  if (substanceText) {
    details += ` Related to ${substanceText}.`;
  }
  if (entry.location) {
    details += ` Reported in ${entry.location}.`;
  }

  const full = `${prefixMap[severityText]}${details}`;
  return full.length > 160 ? `${full.slice(0, 157).trim()}...` : full;
}

function buildTitle(entry: NewsEntry, locale: Locale): string {
  const speciesText = entry.species.length > 0 ? entry.species.join(", ") : "";
  const severityText = entry.severity;
  const baseTitle = entry.title;

  const severityPrefix: Record<NewsSeverity, string> = {
    critical: "Critical: ",
    high: "Warning: ",
    moderate: "Alert: ",
    low: "",
  };

  let enhanced = baseTitle;
  if (severityPrefix[severityText] && !baseTitle.toLowerCase().includes(severityText)) {
    enhanced = `${severityPrefix[severityText]}${baseTitle}`;
  }

  const suffix = speciesText ? ` | ${speciesText}` : "";
  const full = `${enhanced}${suffix}`;

  // Target ~55 chars so the parent layout template " | PetPilot" keeps the
  // final <title> under ~60 characters.
  if (full.length <= 55) return full;

  if (enhanced.length <= 55) return enhanced;

  if (enhanced.length > 50) {
    return `${enhanced.slice(0, 52).trim()}...`;
  }
  return enhanced;
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
  let news = await getNewsBySlug(slug, locale);
  let resolvedSlug = slug;

  const [config, clusters] = await Promise.all([
    getSiteConfig(locale),
    loadClustersRaw(locale),
  ]);

  // The slug may be a canonical cluster slug that does not correspond to a
  // real markdown file. Resolve it through the cluster's first source member so
  // the canonical URL can still render valid metadata.
  if (!news) {
    const clusterByCanonical = clusters.find((c) => c.canonicalSlug === slug);
    if (clusterByCanonical) {
      news = await getNewsBySlug(clusterByCanonical.sources[0]!.slug, locale);
      resolvedSlug = clusterByCanonical.sources[0]!.slug;
    }
  }

  if (!news) return {};

  const cluster = getClusterBySlug(clusters, resolvedSlug);
  const canonicalSlug = cluster?.canonicalSlug ?? resolvedSlug;
  const canonicalUrl = `${config.base_url}/${locale}/news/${canonicalSlug}`;
  const isCanonical = canonicalSlug === slug;
  const displayEntry: NewsEntry = isCanonical
    ? {
        ...news.entry,
        title: cluster?.title ?? news.entry.title,
        summary: cluster?.summary ?? news.entry.summary,
        species: cluster?.species ?? news.entry.species,
        substances: cluster?.substances ?? news.entry.substances,
        severity: cluster?.severity ?? news.entry.severity,
        date: cluster?.dateRange.end ?? news.entry.date,
      }
    : news.entry;
  const title = buildTitle(displayEntry, locale);
  const description = buildDescription(displayEntry, locale);
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
      publishedTime: displayEntry.date,
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
    getNewsBySlug(slug, locale),
    getSiteConfig(locale),
    loadClustersRaw(locale),
  ]);

  // If the slug itself is not a news file, it may be a canonical cluster slug.
  // Try to find the cluster and load its first member so the canonical URL can render.
  let resolvedNews = news;
  let resolvedSlug = slug;
  if (!resolvedNews) {
    const clusterByCanonical = clusters.find((c) => c.canonicalSlug === slug);
    if (clusterByCanonical) {
      resolvedNews = await getNewsBySlug(clusterByCanonical.sources[0]!.slug, locale);
      resolvedSlug = clusterByCanonical.sources[0]!.slug;
    }
  }

  if (!resolvedNews) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "NewsPage" });
  const entry = resolvedNews.entry;
  const related = entry.relatedSlugs ?? {};

  const cluster = getClusterBySlug(clusters, resolvedSlug);
  const canonicalSlug = cluster?.canonicalSlug ?? resolvedSlug;
  const canonicalUrl = `${config.base_url}/${locale}/news/${canonicalSlug}`;
  const isCanonical = canonicalSlug === slug;
  // For canonical cluster pages, show the synthesized cluster content. For individual source
  // pages, keep the original source title and summary so each URL remains distinct.
  const displayTitle = isCanonical ? (cluster?.title ?? entry.title) : entry.title;
  const displaySummary = isCanonical ? (cluster?.summary ?? entry.summary) : entry.summary;
  const displaySpecies = isCanonical ? (cluster?.species ?? entry.species) : entry.species;
  const displaySubstances = isCanonical ? (cluster?.substances ?? entry.substances) : entry.substances;
  const displaySeverity = isCanonical ? (cluster?.severity ?? entry.severity) : entry.severity;
  const displayDate = isCanonical ? (cluster?.dateRange.end ?? entry.date) : entry.date;
  const displayType = isCanonical ? (cluster?.type ?? entry.type) : entry.type;
  const displayContentHtml = isCanonical && cluster?.bodyHtml ? cluster.bodyHtml : resolvedNews.contentHtml;

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
    {
      ...entry,
      title: displayTitle,
      summary: displaySummary,
      species: displaySpecies,
      substances: displaySubstances,
      severity: displaySeverity,
      date: displayDate,
    },
    config.base_url,
    resolvedNews.updatedAt,
    `${config.base_url}/images/og-default.svg`,
    canonicalUrl
  );

  // Build additional related links based on species and substances when explicit related slugs are empty.
  if (relatedRoutes.length === 0) {
    if (displaySpecies.includes("dogs")) {
      relatedRoutes.push({ type: "foods", slug: "chocolate", label: "chocolate" });
      relatedRoutes.push({ type: "foods", slug: "grapes", label: "grapes" });
    }
    if (displaySpecies.includes("cats")) {
      relatedRoutes.push({ type: "plants", slug: "lily", label: "lily" });
    }
    if (displaySubstances.some((s) => s.toLowerCase().includes("xylitol"))) {
      relatedRoutes.push({ type: "foods", slug: "xylitol", label: "xylitol" });
    }
    if (displaySubstances.some((s) => s.toLowerCase().includes("grape") || s.toLowerCase().includes("raisin"))) {
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
          { label: displayTitle },
        ]}
      />

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={displayDate}>{displayDate}</time>
          <span>·</span>
          <span>{cluster ? t("coverageFrom", { count: cluster.sources.length }) : entry.source}</span>
          {entry.location && (
            <>
              <span>·</span>
              <span>{entry.location}</span>
            </>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl">{displayTitle}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <NewsTypeBadge type={displayType} />
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${severityLabelClass(
              displaySeverity
            )}`}
          >
            <AlertTriangle className="h-4 w-4" />
            {t(`severity.${displaySeverity}`)}
          </span>
          {displaySpecies.map((species) => (
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

      <p className="mt-8 text-lg font-light leading-relaxed text-foreground">{displaySummary}</p>

      {cluster && !isCanonical && (
        <ClusterSummaryCard
          cluster={cluster}
          locale={locale}
          heading={t("clusterSummaryHeading")}
          description={t("clusterSummaryDescription")}
          linkText={t("clusterSummaryLink")}
        />
      )}

      {displayContentHtml && (
        <section
          className="prose-pet mt-6"
          dangerouslySetInnerHTML={{ __html: displayContentHtml }}
        />
      )}

      {isCanonical && cluster && (
        <RelatedCoverageSection
          cluster={cluster}
          currentSlug={slug}
          locale={locale}
          showAllLabel={t("showAll")}
          showLessLabel={t("showLess")}
        />
      )}

      {!isCanonical && (
        <section className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">{t("sourceHeading")}</h2>
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
      )}

      {validRelatedRoutes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-normal tracking-tight text-foreground">{t("relatedGuides")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {validRelatedRoutes.map((route) => (
              <li key={`${route.type}-${route.slug}`}>
                <Link
                  href={`/${route.type}/${route.slug}`}
                  className="block rounded-xl border border-border bg-card p-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
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

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong className="block font-medium text-amber-950">{t("disclaimerTitle")}</strong>
        {t("disclaimerText")}
      </section>
    </article>
  );
}
