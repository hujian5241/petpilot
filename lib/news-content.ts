import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import gfm from "remark-gfm";
import sanitize from "rehype-sanitize";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import { defaultLocale, type Locale } from "./locales";
import type { NewsCluster, NewsEntry } from "./news";

export interface NewsFile {
  slug: string;
  entry: NewsEntry;
  contentHtml: string;
  updatedAt: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function newsDir(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "news");
}

function newsLocaleDir(locale: Locale): string {
  return path.join(newsDir(), locale);
}

async function readNewsFile(
  slug: string,
  locale: Locale = defaultLocale
): Promise<{ raw: string; resolvedLocale: Locale; resolvedPath: string } | undefined> {
  const localizedPath = path.join(newsLocaleDir(locale), `${slug}.md`);
  if (await fileExists(localizedPath)) {
    return { raw: await fs.readFile(localizedPath, "utf-8"), resolvedLocale: locale, resolvedPath: localizedPath };
  }

  if (locale !== defaultLocale) {
    const fallbackPath = path.join(newsLocaleDir(defaultLocale), `${slug}.md`);
    if (await fileExists(fallbackPath)) {
      return { raw: await fs.readFile(fallbackPath, "utf-8"), resolvedLocale: defaultLocale, resolvedPath: fallbackPath };
    }
  }

  return undefined;
}

async function parseNewsFile(
  slug: string,
  locale: Locale = defaultLocale
): Promise<NewsFile | undefined> {
  const file = await readNewsFile(slug, locale);
  if (!file) return undefined;

  const { data, content } = matter(file.raw);

  const processedContent = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(content);

  const stat = await fs.stat(file.resolvedPath);
  const updatedAt = data.updatedAt
    ? String(data.updatedAt)
    : stat.mtime.toISOString();

  return {
    slug,
    entry: data as NewsEntry,
    contentHtml: processedContent.toString(),
    updatedAt,
  };
}

export async function getAllNewsSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  const dir = newsLocaleDir(locale);
  if (!(await fileExists(dir))) {
    if (locale !== defaultLocale) {
      return getAllNewsSlugs(defaultLocale);
    }
    return [];
  }
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export async function getNewsBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<NewsFile | undefined> {
  return parseNewsFile(slug, locale);
}

export async function getAllNews(locale: Locale = defaultLocale): Promise<NewsFile[]> {
  const slugs = await getAllNewsSlugs(locale);
  const files = await Promise.all(slugs.map((slug) => parseNewsFile(slug, locale)));
  return (files.filter(Boolean) as NewsFile[]).sort(
    (a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime()
  );
}

export function groupNewsByMonth(news: NewsFile[]): Record<string, NewsFile[]> {
  return news.reduce((acc, item) => {
    const month = item.entry.month;
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, NewsFile[]>);
}

export function getUniqueNewsValues<T extends keyof NewsEntry>(
  news: NewsFile[],
  key: T
): NewsEntry[T] extends string[]
  ? string[]
  : NewsEntry[T] extends string
  ? string[]
  : never {
  const values = new Set<string>();
  for (const item of news) {
    const value = item.entry[key];
    if (Array.isArray(value)) {
      for (const v of value) values.add(String(v));
    } else if (value !== undefined && value !== null) {
      values.add(String(value));
    }
  }
  return Array.from(values).sort() as never;
}

export async function loadClusters(locale: Locale = defaultLocale): Promise<NewsCluster[]> {
  const clusterPath = path.join(newsDir(), locale, "clusters.json");
  if (!(await fileExists(clusterPath))) {
    if (locale !== defaultLocale) {
      return loadClusters(defaultLocale);
    }
    return [];
  }
  const raw = await fs.readFile(clusterPath, "utf-8");
  return JSON.parse(raw) as NewsCluster[];
}

export function getClusterBySlug(
  clusters: NewsCluster[],
  slug: string
): NewsCluster | undefined {
  return clusters.find((c) => c.slugs.includes(slug));
}

export function buildClusterMap(clusters: NewsCluster[]): Map<string, NewsCluster> {
  const map = new Map<string, NewsCluster>();
  for (const cluster of clusters) {
    for (const slug of cluster.slugs) {
      map.set(slug, cluster);
    }
  }
  return map;
}
