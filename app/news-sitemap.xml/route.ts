import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { getSiteConfig } from "@/lib/content";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

export const dynamic = "force-static";
export const revalidate = 86400;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatNewsDate(date: string): string {
  return date.slice(0, 10);
}

interface NewsSitemapEntry {
  loc: string;
  title: string;
  date: string;
  locale: Locale;
}

async function readNewsEntries(locale: Locale): Promise<NewsSitemapEntry[]> {
  const baseDir = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "data",
    "news"
  );
  const dir = path.join(baseDir, locale);

  let resolvedDir = dir;
  try {
    await fs.access(dir);
  } catch {
    resolvedDir = path.join(baseDir, defaultLocale);
  }

  try {
    await fs.access(resolvedDir);
  } catch {
    return [];
  }

  const files = await fs.readdir(resolvedDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const entries: NewsSitemapEntry[] = [];
  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(resolvedDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    entries.push({
      loc: slug,
      title: data.title ? String(data.title) : slug,
      date: formatNewsDate(data.date ? String(data.date) : new Date().toISOString()),
      locale,
    });
  }

  return entries;
}

export async function GET() {
  const config = await getSiteConfig(defaultLocale);
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const entries: NewsSitemapEntry[] = [];
  for (const locale of locales) {
    const news = await readNewsEntries(locale);
    for (const item of news) {
      entries.push({
        ...item,
        loc: `${baseUrl}/${locale}/news/${item.loc}`,
      });
    }
  }

  const publicationName = escapeXml(config.name ?? "PetPilot News");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries
  .map(
    (entry) =>
      `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${publicationName}</news:name>\n        <news:language>${entry.locale}</news:language>\n      </news:publication>\n      <news:publication_date>${entry.date}</news:publication_date>\n      <news:title>${escapeXml(entry.title)}</news:title>\n    </news:news>\n  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
