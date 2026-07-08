import { getSiteConfig } from "@/lib/content";
import { getAllNews, loadClustersRaw, getClusterBySlug } from "@/lib/news-content";
import { locales } from "@/lib/i18n";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function toW3cDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const config = await getSiteConfig("en");
  const baseUrl = normalizeBaseUrl(config.base_url);

  const urls: string[] = [];

  for (const locale of locales) {
    const [newsFiles, clusters] = await Promise.all([
      getAllNews(locale),
      loadClustersRaw(locale),
    ]);
    for (const file of newsFiles) {
      const cluster = getClusterBySlug(clusters, file.slug);
      const slug = cluster?.canonicalSlug ?? file.slug;
      const loc = escapeXml(`${baseUrl}/${locale}/news/${slug}`);
      const lastmod = escapeXml(toW3cDate(file.updatedAt));
      urls.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
