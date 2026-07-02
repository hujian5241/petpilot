import fs from "fs/promises";
import path from "path";

import {
  getAllCategories,
  getFoodSlugs,
  getPlantSlugs,
  getSiteConfig,
} from "../lib/content";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface UrlEntry {
  loc: string;
  priority: number;
}

function buildUrlSet(urls: UrlEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;
}

async function main() {
  const [config, categories, foodSlugs, plantSlugs] = await Promise.all([
    getSiteConfig(),
    getAllCategories(),
    getFoodSlugs(),
    getPlantSlugs(),
  ]);

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const outDir = path.join(process.cwd(), "public", "sitemaps");
  await fs.mkdir(outDir, { recursive: true });

  const staticUrls: UrlEntry[] = [
    { loc: `${baseUrl}/`, priority: 1 },
    { loc: `${baseUrl}/foods`, priority: 0.9 },
    { loc: `${baseUrl}/plants`, priority: 0.9 },
    { loc: `${baseUrl}/search`, priority: 0.9 },
    { loc: `${baseUrl}/emergency`, priority: 0.8 },
    { loc: `${baseUrl}/about`, priority: 0.5 },
    { loc: `${baseUrl}/terms`, priority: 0.3 },
    { loc: `${baseUrl}/privacy`, priority: 0.3 },
    ...categories.map((c) => ({
      loc: `${baseUrl}/categories/${c.slug}`,
      priority: 0.7,
    })),
  ];

  const foodUrls: UrlEntry[] = foodSlugs.map((slug) => ({
    loc: `${baseUrl}/foods/${slug}`,
    priority: 0.8,
  }));

  const plantUrls: UrlEntry[] = plantSlugs.map((slug) => ({
    loc: `${baseUrl}/plants/${slug}`,
    priority: 0.8,
  }));

  await fs.writeFile(
    path.join(outDir, "sitemap-static.xml"),
    buildUrlSet(staticUrls),
    "utf-8"
  );
  await fs.writeFile(
    path.join(outDir, "sitemap-foods.xml"),
    buildUrlSet(foodUrls),
    "utf-8"
  );
  await fs.writeFile(
    path.join(outDir, "sitemap-plants.xml"),
    buildUrlSet(plantUrls),
    "utf-8"
  );

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemaps/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemaps/sitemap-foods.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemaps/sitemap-plants.xml</loc></sitemap>
</sitemapindex>`;

  await fs.writeFile(path.join(process.cwd(), "public", "sitemap.xml"), indexXml, "utf-8");

  console.log("Generated static sitemaps:");
  console.log(`- public/sitemap.xml (${3} sub-sitemaps)`);
  console.log(`- public/sitemaps/sitemap-static.xml (${staticUrls.length} URLs)`);
  console.log(`- public/sitemaps/sitemap-foods.xml (${foodUrls.length} URLs)`);
  console.log(`- public/sitemaps/sitemap-plants.xml (${plantUrls.length} URLs)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
