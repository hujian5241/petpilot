import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import {
  extractArticleWithLLM,
  extractReadableText,
  fetchHtml,
  findRelatedSlugs,
  formatBody,
  inferLocation,
  inferSeverity,
  inferSpecies,
  inferSubstances,
  normalizeLocation,
  type RawNewsItem,
} from "./fetch-news";
import type { NewsEntry } from "../lib/news";

const newsDir = path.join(process.cwd(), "data", "news", "en");

function looksLikeFallback(entry: NewsEntry, content: string): boolean {
  // A fallback article has an empty body or a body that is just the summary + source link.
  if (!entry.summary) return true;
  const hasStructuredDetails =
    content.includes("**Brand/Company:**") ||
    content.includes("**Product:**") ||
    content.includes("**Reason:**");
  return !hasStructuredDetails;
}

async function main() {
  const targetSlugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const files = await fs.readdir(newsDir);
  const mdFiles = files
    .filter((f) => f.endsWith(".md"))
    .filter((f) => {
      if (targetSlugs.length === 0) return true;
      const slug = f.replace(/\.md$/, "");
      return targetSlugs.some((t) => slug.includes(t));
    });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is required for re-enrichment.");
    process.exit(1);
  }

  let examined = 0;
  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of mdFiles) {
    const filePath = path.join(newsDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const entry = { body: "", ...data } as NewsEntry;

    if (!looksLikeFallback(entry, content)) {
      skipped++;
      continue;
    }

    examined++;
    const sourceUrl = entry.sourceUrl;
    if (!sourceUrl) {
      console.log(`  ${entry.slug}: no sourceUrl`);
      failed++;
      continue;
    }

    console.log(`Enriching ${entry.slug}...`);
    const html = await fetchHtml(sourceUrl);
    if (!html) {
      console.log(`  ${entry.slug}: could not fetch HTML`);
      failed++;
      continue;
    }

    const articleText = extractReadableText(html);
    if (articleText.length < 100) {
      console.log(`  ${entry.slug}: extracted text too short`);
      failed++;
      continue;
    }

    const item: RawNewsItem = {
      title: entry.title,
      link: sourceUrl,
      pubDate: entry.date,
      description: entry.summary,
      source: entry.source,
    };

    const extracted = await extractArticleWithLLM(item, articleText);
    if (!extracted) {
      console.log(`  ${entry.slug}: LLM extraction failed`);
      failed++;
      continue;
    }

    const relatedSlugs = await findRelatedSlugs(extracted.substances);
    const location = normalizeLocation(extracted.location ?? inferLocation(entry.title, entry.summary));

    const updatedEntry: NewsEntry = {
      ...entry,
      location,
      species: extracted.species,
      substances: extracted.substances,
      severity: extracted.severity,
      type: extracted.type,
      summary: extracted.summary,
      relatedSlugs,
      updatedAt: new Date().toISOString(),
      reviewed: false,
    };

    const body = formatBody(extracted, item);
    const frontmatter = JSON.parse(JSON.stringify(updatedEntry)) as NewsEntry;
    const md = matter.stringify(body, frontmatter);
    await fs.writeFile(filePath, md, "utf-8");
    enriched++;
    console.log(`  ${entry.slug}: enriched ✓`);
  }

  console.log(`\nExamined ${examined} fallback articles.`);
  console.log(`Enriched ${enriched}, skipped ${skipped}, failed ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
