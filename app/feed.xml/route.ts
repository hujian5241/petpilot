import { NextResponse } from "next/server";

import { getSiteConfig } from "@/lib/content";
import { getAllNews } from "@/lib/news-content";
import { defaultLocale } from "@/lib/i18n";

export async function GET() {
  const config = await getSiteConfig(defaultLocale);
  const baseUrl = config.base_url.endsWith("/")
    ? config.base_url.slice(0, -1)
    : config.base_url;

  const allNews = await getAllNews(defaultLocale);
  const recentNews = allNews.slice(0, 20);

  const feedItems = recentNews
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.entry.title}]]></title>
      <link>${baseUrl}/${defaultLocale}/news/${item.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${defaultLocale}/news/${item.slug}</guid>
      <pubDate>${new Date(item.entry.date).toUTCString()}</pubDate>
      <description><![CDATA[${item.entry.summary}]]></description>
      ${item.entry.species.map((s) => `<category>${s}</category>`).join("")}
      ${item.entry.substances.map((s) => `<category>${s}</category>`).join("")}
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${config.name} — Pet Safety News &amp; Updates]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Latest pet safety news, food recalls, toxicity alerts, and vet-reviewed guides for dogs and cats.]]></description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>PetPilot</generator>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
