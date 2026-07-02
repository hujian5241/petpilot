import { getAllCategories, getSiteConfig } from "@/lib/content";

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
  const [config, categories] = await Promise.all([
    getSiteConfig(),
    getAllCategories(),
  ]);

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: 1 },
    { loc: `${baseUrl}/foods`, priority: 0.9 },
    { loc: `${baseUrl}/plants`, priority: 0.9 },
    { loc: `${baseUrl}/search`, priority: 0.9 },
    { loc: `${baseUrl}/emergency`, priority: 0.8 },
    { loc: `${baseUrl}/about`, priority: 0.5 },
    { loc: `${baseUrl}/terms`, priority: 0.3 },
    { loc: `${baseUrl}/privacy`, priority: 0.3 },
  ];

  const categoryUrls = categories.map((category) => ({
    loc: `${baseUrl}/categories/${category.slug}`,
    priority: 0.7,
  }));

  const urls = [...staticUrls, ...categoryUrls];

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
