import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllGuides, getAllGuideCategories, getGuideBySlug, getGuideSlugs, getSiteConfig } from "@/lib/content";
import { Link } from "@/i18n/routing";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import type { WithContext, Article, FAQPage, Question } from "schema-dts";

export const dynamic = "force-static";

interface GuideDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const slugs = [
    "top-10-toxic-foods",
    "complete-guide-dog-nutrition",
    "best-10-low-calorie-treats",
    "complete-guide-kitten-puppy-nutrition",
    "top-10-safe-houseplants-toxic-ones",
  ];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuideDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [guide, config] = await Promise.all([
    getGuideBySlug(slug, locale),
    getSiteConfig(locale),
  ]);

  if (!guide) {
    return { title: "Not Found" };
  }

  const title = guide.meta_title ?? guide.title;
  const description = guide.meta_description ?? guide.description;
  const baseUrl = normalizeBaseUrl(config.base_url);
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/guides/${guide.slug}`;
  }
  languages["x-default"] = `${baseUrl}/en/guides/${guide.slug}`;

  return {
    title,
    description,
    metadataBase: new URL(config.base_url),
    alternates: {
      canonical: `${baseUrl}/${locale}/guides/${guide.slug}`,
      languages,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${baseUrl}/${locale}/guides/${guide.slug}`,
      locale,
      images: [guide.image?.src ?? config.default_og_image],
      siteName: config.name,
      publishedTime: guide.published_at,
      modifiedTime: guide.updated_at ?? guide.published_at,
      authors: guide.author ? [guide.author] : undefined,
      section: guide.category,
      tags: guide.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [guide.image?.src ?? config.default_og_image],
    },
  };
}

function buildArticleSchema(
  guide: NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>>,
  config: Awaited<ReturnType<typeof getSiteConfig>>,
  locale: Locale
): WithContext<Article> {
  const baseUrl = normalizeBaseUrl(config.base_url);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: guide.image?.src ?? `${baseUrl}${config.default_og_image}`,
    author: guide.author
      ? { "@type": "Organization", name: guide.author }
      : { "@type": "Organization", name: config.name, url: `${baseUrl}/${locale}` },
    publisher: {
      "@type": "Organization",
      name: config.name,
      url: `${baseUrl}/${locale}`,
    },
    datePublished: guide.published_at,
    dateModified: guide.updated_at ?? guide.published_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${locale}/guides/${guide.slug}`,
    },
    keywords: guide.tags.join(", "),
    articleSection: guide.category,
  };
}

function buildFaqSchemaFromHeadings(
  guide: NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>>
): WithContext<FAQPage> | null {
  const headings = (guide.content?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) ?? []).map((tag) =>
    tag.replace(/<\/?[^>]+>/g, "").trim()
  );
  if (headings.length === 0) return null;

  const questions: Question[] = headings.map((heading) => ({
    "@type": "Question",
    name: heading,
    acceptedAnswer: {
      "@type": "Answer",
      text: `This guide covers ${heading.toLowerCase()} for pet owners.`,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { locale, slug } = await params;
  const [guide, config, categories, tNav] = await Promise.all([
    getGuideBySlug(slug, locale),
    getSiteConfig(locale),
    getAllGuideCategories(locale),
    getTranslations({ locale, namespace: "Header" }),
  ]);

  if (!guide) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-light tracking-tight">404 — Guide Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested guide could not be found.</p>
        <Link href="/guides" className="mt-6 inline-block text-primary hover:underline">
          Browse all guides
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === guide.category);
  const baseUrl = normalizeBaseUrl(config.base_url);
  const articleSchema = buildArticleSchema(guide, config, locale);
  const faqSchema = buildFaqSchemaFromHeadings(guide);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Breadcrumb
        locale={locale}
        items={[
          { label: tNav("guides"), href: "/guides" },
          { label: guide.title },
        ]}
      />

      <header className="mt-8">
        <div className="text-sm font-medium uppercase tracking-wide text-primary">
          {category?.name ?? guide.category}
        </div>
        <h1 className="mt-2 text-3xl font-light tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg font-light text-muted-foreground">{guide.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {guide.author && <span>By {guide.author}</span>}
          <span>{new Date(guide.published_at).toLocaleDateString(locale)}</span>
          {guide.read_time_minutes && <span>{guide.read_time_minutes} min read</span>}
          {guide.updated_at && guide.updated_at !== guide.published_at && (
            <span>Updated {new Date(guide.updated_at).toLocaleDateString(locale)}</span>
          )}
        </div>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={guide.image?.src ?? `/images/guides/${guide.slug}.svg`}
            alt={guide.image?.alt ?? guide.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      </header>

      {guide.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="prose-pet mt-10"
        dangerouslySetInnerHTML={{ __html: guide.content ?? "" }}
      />

      <footer className="mt-12 border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong>{" "}
          This guide is for educational purposes only and does not replace professional veterinary
          advice. If your pet is sick or may have eaten something harmful, contact your veterinarian
          or a poison control center immediately.
        </p>
      </footer>
    </article>
  );
}
