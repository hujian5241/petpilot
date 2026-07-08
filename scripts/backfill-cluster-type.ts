import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { defaultLocale, type Locale } from "../lib/i18n";
import type { NewsCluster, NewsEntry } from "../lib/news-types";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readNewsEntry(
  slug: string,
  locale: Locale
): Promise<NewsEntry | undefined> {
  const filePath = path.join(process.cwd(), "data", "news", locale, `${slug}.md`);
  if (!(await fileExists(filePath))) return undefined;
  const raw = await fs.readFile(filePath, "utf-8");
  const { data } = matter(raw);
  return data as NewsEntry;
}

function inferClusterType(memberTypes: Array<NewsEntry["type"]>): NewsEntry["type"] {
  const typeOrder: Array<NonNullable<NewsEntry["type"]>> = ["recall", "alert", "incident"];
  return memberTypes
    .filter(Boolean)
    .sort((a, b) => typeOrder.indexOf(a!) - typeOrder.indexOf(b!))[0];
}

async function backfillClusterTypes(locale: Locale) {
  const clusterPath = path.join(process.cwd(), "data", "news", locale, "clusters.json");
  if (!(await fileExists(clusterPath))) {
    console.log(`[${locale}] No clusters.json found.`);
    return { processed: 0, updated: 0 };
  }

  const raw = await fs.readFile(clusterPath, "utf-8");
  const clusters = JSON.parse(raw) as NewsCluster[];
  let updated = 0;

  for (const cluster of clusters) {
    if (cluster.type) continue;
    const memberTypes = await Promise.all(
      cluster.sources.map((s) => readNewsEntry(s.slug, locale).then((e) => e?.type))
    );
    const type = inferClusterType(memberTypes);
    if (type) {
      cluster.type = type;
      updated++;
    }
  }

  if (updated > 0) {
    await fs.writeFile(clusterPath, JSON.stringify(clusters, null, 2), "utf-8");
  }

  return { processed: clusters.length, updated };
}

async function main() {
  const result = await backfillClusterTypes(defaultLocale);
  console.log(`[${defaultLocale}] Processed ${result.processed} clusters.`);
  console.log(`[${defaultLocale}] Updated ${result.updated} clusters with inferred type.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
