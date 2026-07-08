import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { execFile } from "child_process";
import { promisify } from "util";

import {
  extractArticleWithLLM,
  extractReadableText,
  formatBody,
  type RawNewsItem,
} from "./fetch-news";
import type { NewsEntry } from "../lib/news";

const execFileAsync = promisify(execFile);

const yahooUrl =
  "https://www.yahoo.com/news/science/articles/pet-food-recall-expanded-rickets-165119952.html";

const targetSlugs = [
  "2026-06-29-pet-food-recall-expanded-after-rickets-elevated-vitamin",
  "2026-06-29-pet-food-recall-expanded-after-rickets-elevated-vitamin-leve",
  "2026-06-29-revival-animal-health-expands-recall-for-canine-milk",
  "2026-04-21-revival-animal-health-recalls-canine-milk-replacers-for-elev",
];

async function fetchYahooText(): Promise<string> {
  const { stdout } = await execFileAsync("curl", [
    "-sL",
    "--max-time",
    "30",
    "-A",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    yahooUrl,
  ]);
  return extractReadableText(stdout);
}

async function main() {
  const articleText = await fetchYahooText();
  if (articleText.length < 200) {
    console.error("Could not extract enough text from Yahoo News article.");
    process.exit(1);
  }

  for (const slug of targetSlugs) {
    const filePath = path.join(process.cwd(), "data", "news", "en", `${slug}.md`);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const { data, content } = matter(raw);
    const entry = { body: "", ...data } as NewsEntry;

    const item: RawNewsItem = {
      title: entry.title,
      link: yahooUrl,
      pubDate: entry.date,
      description: entry.summary,
      source: "Yahoo News",
    };

    const extracted = await extractArticleWithLLM(item, articleText);
    if (!extracted) {
      console.warn(`LLM extraction failed for ${slug}`);
      continue;
    }

    const updatedEntry: NewsEntry = {
      ...entry,
      location: extracted.location ?? entry.location,
      species: extracted.species,
      substances: extracted.substances,
      severity: extracted.severity,
      type: extracted.type,
      summary: extracted.summary,
      updatedAt: new Date().toISOString(),
      reviewed: false,
    };

    const body = formatBody(extracted, item);
    const frontmatter = JSON.parse(JSON.stringify(updatedEntry)) as NewsEntry;
    const md = matter.stringify(body, frontmatter);
    await fs.writeFile(filePath, md, "utf-8");
    console.log(`Updated ${slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
