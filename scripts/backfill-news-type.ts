import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { locales, defaultLocale, type Locale } from "../lib/i18n";
import type { NewsEntry } from "../lib/news-types";

function inferNewsType(title: string, body?: string): "recall" | "incident" | "alert" {
  const text = `${title} ${body ?? ""}`.toLowerCase();
  const recallTerms = [
    "recall",
    "recalled",
    "recalls",
    "withdrawal",
    "withdrawn",
    "voluntary recall",
    "market withdrawal",
    "product recall",
  ];
  if (recallTerms.some((t) => text.includes(t))) return "recall";
  const alertTerms = ["alert", "warning", "advisory", "outbreak", "health alert"];
  if (alertTerms.some((t) => text.includes(t))) return "alert";
  return "incident";
}

async function backfillLocale(locale: Locale) {
  const dir = path.join(process.cwd(), "data", "news", locale);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    if (locale === defaultLocale) {
      console.warn(`News directory not found for default locale ${locale}`);
      return { processed: 0, updated: 0, counts: { recall: 0, alert: 0, incident: 0 } };
    }
    return { processed: 0, updated: 0, counts: { recall: 0, alert: 0, incident: 0 } };
  }
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  let updated = 0;
  const counts: Record<string, number> = { recall: 0, alert: 0, incident: 0 };

  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const entry = data as NewsEntry;

    const type = inferNewsType(entry.title, content);
    counts[type] = (counts[type] ?? 0) + 1;

    if (entry.type === type) continue;

    entry.type = type;
    const updatedRaw = matter.stringify(content, entry);
    await fs.writeFile(filePath, updatedRaw, "utf-8");
    updated++;
  }

  return { processed: mdFiles.length, updated, counts };
}

async function main() {
  for (const locale of locales) {
    const result = await backfillLocale(locale);
    console.log(`[${locale}] Processed ${result.processed} news files.`);
    console.log(`[${locale}] Updated ${result.updated} files with inferred type.`);
    console.log(`[${locale}] Counts:`, result.counts);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
