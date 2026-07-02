import { getPlantSlugs, getSiteConfig } from "@/lib/content";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const [config, plantSlugs] = await Promise.all([
    getSiteConfig(),
    getPlantSlugs(),
  ]);

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const urls = plantSlugs.map((slug) => ({
    loc: `${baseUrl}/plants/${slug}`,
    priority: 0.8,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
