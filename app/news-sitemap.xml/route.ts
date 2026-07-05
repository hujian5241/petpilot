import { getSiteConfig } from "@/lib/content";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";
import { getAllNews } from "@/lib/news-content";

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
  // Google News expects YYYY-MM-DD format.
  return date.slice(0, 10);
}

export async function GET() {
  const config = await getSiteConfig(defaultLocale);
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const entries: { loc: string; title: string; date: string; locale: Locale }[] = [];
  for (const locale of locales) {
    const news = await getAllNews(locale);
    for (const item of news) {
      entries.push({
        loc: `${baseUrl}/${locale}/news/${item.slug}`,
        title: item.entry.title,
        date: formatNewsDate(item.entry.date),
        locale,
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
