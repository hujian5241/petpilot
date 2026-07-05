import type { MetadataRoute } from "next";

import { getSiteConfig } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSiteConfig();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      `${config.base_url}/sitemap.xml`,
      `${config.base_url}/news-sitemap.xml`,
    ],
  };
}
