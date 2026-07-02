import { getSiteConfig } from "@/lib/content";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const config = await getSiteConfig();
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-foods.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-plants.xml</loc></sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
