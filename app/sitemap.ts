import { MetadataRoute } from "next";

import {
  getAllCategories,
  getFoodSlugs,
  getPlantSlugs,
  getSiteConfig,
} from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [config, categories, foodSlugs, plantSlugs] = await Promise.all([
    getSiteConfig(),
    getAllCategories(),
    getFoodSlugs(),
    getPlantSlugs(),
  ]);

  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, priority: 1 },
    { url: `${baseUrl}/foods`, priority: 0.9 },
    { url: `${baseUrl}/plants`, priority: 0.9 },
    { url: `${baseUrl}/search`, priority: 0.9 },
    { url: `${baseUrl}/emergency`, priority: 0.8 },
    { url: `${baseUrl}/about`, priority: 0.5 },
    { url: `${baseUrl}/terms`, priority: 0.3 },
    { url: `${baseUrl}/privacy`, priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    priority: 0.7,
  }));

  const foodRoutes: MetadataRoute.Sitemap = foodSlugs.map((slug) => ({
    url: `${baseUrl}/foods/${slug}`,
    priority: 0.8,
  }));

  const plantRoutes: MetadataRoute.Sitemap = plantSlugs.map((slug) => ({
    url: `${baseUrl}/plants/${slug}`,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...foodRoutes,
    ...plantRoutes,
  ];
}
