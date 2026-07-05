import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";

import type { NewsCluster, NewsEntry, NewsSeverity } from "../lib/news";

const newsDir = path.join(process.cwd(), "data", "news", "en");
const clustersPath = path.join(newsDir, "clusters.json");

const MODEL = "claude-sonnet-4-6";
const MAX_RETRIES = 3;
const MIN_REQUEST_INTERVAL_MS = 500;
const SIMILARITY_THRESHOLD = 0.55;

interface ParsedNews {
  slug: string;
  entry: NewsEntry;
  content: string;
  filePath: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readAllNews(): Promise<ParsedNews[]> {
  const files = await fs.readdir(newsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const result: ParsedNews[] = [];

  for (const file of mdFiles) {
    const filePath = path.join(newsDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    result.push({
      slug,
      entry: { ...data, slug } as NewsEntry,
      content,
      filePath,
    });
  }

  return result;
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .filter((t) => !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "day",
  "get",
  "has",
  "him",
  "his",
  "how",
  "its",
  "may",
  "new",
  "now",
  "old",
  "see",
  "two",
  "who",
  "boy",
  "did",
  "she",
  "use",
  "her",
  "way",
  "many",
  "oil",
  "sit",
  "set",
  "run",
  "eat",
  "far",
  "sea",
  "eye",
  "ago",
  "off",
  "too",
  "any",
  "say",
  "man",
  "try",
  "ask",
  "end",
  "why",
  "let",
  "put",
  "say",
  "she",
  "try",
  "way",
  "own",
  "say",
  "too",
  "old",
  "tell",
  "very",
  "when",
  "much",
  "would",
  "there",
  "their",
  "what",
  "said",
  "have",
  "each",
  "which",
  "will",
  "about",
  "if",
  "up",
  "out",
  "do",
  "at",
  "on",
  "in",
  "to",
  "of",
  "a",
  "is",
  "it",
  "as",
  "be",
  "by",
  "or",
  "an",
  "we",
  "us",
  "my",
  "he",
  "no",
  "so",
  "go",
]);

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function similarity(a: NewsEntry, b: NewsEntry): number {
  const textA = normalizeText(`${a.title} ${a.summary}`);
  const textB = normalizeText(`${b.title} ${b.summary}`);
  let score = jaccard(textA, textB);

  const sharedSubstances = a.substances.filter((s) => b.substances.includes(s));
  if (sharedSubstances.length > 0) score += 0.3;

  const sharedSpecies = a.species.filter((s) => b.species.includes(s));
  if (sharedSpecies.length > 0) score += 0.1;

  if (a.date === b.date) score += 0.2;

  return Math.min(score, 1);
}

function findClusters(news: ParsedNews[]): NewsCluster[] {
  const byMonth = new Map<string, ParsedNews[]>();
  for (const item of news) {
    const month = item.entry.month;
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(item);
  }

  const clusters: NewsCluster[] = [];

  for (const [, monthItems] of byMonth) {
    const parent: Record<number, number> = {};
    function find(i: number): number {
      if (parent[i] === undefined) parent[i] = i;
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    }
    function union(i: number, j: number) {
      parent[find(i)] = find(j);
    }

    for (let i = 0; i < monthItems.length; i++) {
      for (let j = i + 1; j < monthItems.length; j++) {
        const score = similarity(monthItems[i]!.entry, monthItems[j]!.entry);
        if (score >= SIMILARITY_THRESHOLD) {
          union(i, j);
        }
      }
    }

    const groups = new Map<number, ParsedNews[]>();
    for (let i = 0; i < monthItems.length; i++) {
      const root = find(i);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root)!.push(monthItems[i]!);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;

      const slugs = group.map((g) => g.slug).sort();
      const id = createHash("sha256").update(slugs.join("|")).digest("hex").slice(0, 16);
      const canonicalSlug = slugs[0]!;

      const title =
        group
          .map((g) => g.entry.title.replace(/\s[-–—]\s[^-]+$/g, "").trim())
          .sort((a, b) => b.length - a.length)[0] || group[0]!.entry.title;

      const sources = group.map((g) => ({
        name: g.entry.source,
        url: g.entry.sourceUrl,
        slug: g.slug,
      }));

      const dates = group.map((g) => g.entry.date).sort();
      const severities = group.map((g) => g.entry.severity);
      const severityOrder: NewsSeverity[] = ["low", "moderate", "high", "critical"];
      const severity = severities.sort(
        (a, b) => severityOrder.indexOf(b) - severityOrder.indexOf(a)
      )[0]!;

      clusters.push({
        id,
        canonicalSlug,
        slugs,
        title,
        summary: "", // filled by LLM
        sources,
        dateRange: { start: dates[0]!, end: dates[dates.length - 1]! },
        month: group[0]!.entry.month,
        species: Array.from(new Set(group.flatMap((g) => g.entry.species))),
        substances: Array.from(new Set(group.flatMap((g) => g.entry.substances))),
        severity,
      });
    }
  }

  return clusters;
}

interface EnrichmentResult {
  clusterSummary: string;
  bodies: Record<string, string>;
}

async function callClaude(
  cluster: NewsCluster,
  members: ParsedNews[],
  attempt = 0
): Promise<EnrichmentResult> {
  const memberDescriptions = members
    .map(
      (m) =>
        `Title: ${m.entry.title}\nSource: ${m.entry.source}\nDate: ${m.entry.date}\nSummary: ${m.entry.summary}\nURL: ${m.entry.sourceUrl}\nSlug: ${m.slug}`
    )
    .join("\n\n---\n\n");

  const largeCluster = members.length > 15;
  const maxTokens = largeCluster ? 6000 : 8000;

  const prompt = largeCluster
    ? `You are a pet safety news editor for PetPilot. Synthesize the following news reports about the same pet-safety event into one coherent summary and a shared article body.\n\nReports:\n${memberDescriptions}\n\nReturn ONLY a raw JSON object with no markdown code fences, no commentary, and no text outside the JSON. Use exactly these keys:\n- clusterSummary: a factual 120-180 word summary suitable for a news card. Include what happened, which pets are affected, and why it matters.\n- sharedBody: a concise Markdown body (under 300 words) with sections: ## What happened, ## Key facts, ## What pet owners should do. Do NOT include a Related coverage section.`
    : `You are a pet safety news editor for PetPilot. Synthesize the following news reports about the same pet-safety event into one coherent summary and per-source article bodies.\n\nReports:\n${memberDescriptions}\n\nReturn ONLY a raw JSON object with no markdown code fences, no commentary, and no text outside the JSON. Use exactly these keys:\n- clusterSummary: a factual 120-180 word summary suitable for a news card. Include what happened, which pets are affected, and why it matters.\n- bodies: an object mapping each source slug (${members.map((m) => m.slug).join(", ")}) to a concise Markdown body (under 150 words each) with sections: ## What happened, ## Key facts, ## What pet owners should do, ## Related coverage.\n\nFor Related coverage, link to the other sources like: [Read the report on {source name} →]({source url}) and [Read PetPilot's coverage from {other source name} →](/news/{other slug}).`;

  const client = new Anthropic();
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim();

    const parsed = parseLLMJson(text) as unknown as EnrichmentResult & { sharedBody?: string };

    if (!parsed.clusterSummary) {
      throw new Error("LLM response missing clusterSummary");
    }

    if (largeCluster) {
      if (!parsed.sharedBody) {
        throw new Error("LLM response missing sharedBody for large cluster");
      }
      const bodies: Record<string, string> = {};
      for (const member of members) {
        const relatedLines = cluster.sources.map((source) => {
          if (source.slug === member.slug) {
            return `- [Read the full report on ${source.name} →](${source.url})`;
          }
          return `- [Read PetPilot's coverage from ${source.name} →](/news/${source.slug})`;
        });
        bodies[member.slug] = `${parsed.sharedBody}\n\n## Related coverage\n\n${relatedLines.join(
          "\n"
        )}`;
      }
      return { clusterSummary: parsed.clusterSummary, bodies };
    }

    if (typeof parsed.bodies !== "object") {
      throw new Error("LLM response missing bodies");
    }

    return parsed;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * 2 ** attempt + Math.floor(Math.random() * 1000);
      console.warn(
        `  Retry ${attempt + 1}/${MAX_RETRIES} for cluster ${cluster.id} in ${delay}ms`
      );
      await sleep(delay);
      return callClaude(cluster, members, attempt + 1);
    }
    throw error;
  }
}

function parseLLMJson(text: string): Record<string, unknown> {
  // Strip markdown fences if present.
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/g, "")
    .trim();

  // Try direct parse first.
  try {
    return JSON.parse(cleaned);
  } catch {
    // ignore
  }

  // Find the outermost JSON object by bracket balance.
  let start = -1;
  let balance = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"' && !inString) {
      inString = true;
      continue;
    }
    if (char === '"' && inString) {
      inString = false;
      continue;
    }
    if (inString) continue;

    if (char === "{") {
      if (balance === 0) start = i;
      balance++;
    } else if (char === "}") {
      balance--;
      if (balance === 0 && start !== -1) {
        const candidate = cleaned.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          start = -1;
        }
      }
    }
  }

  throw new Error("Could not extract valid JSON from LLM response");
}

function generateLocalSummary(cluster: NewsCluster, members: ParsedNews[]): string {
  const combined = members.map((m) => m.entry.summary).join(" ");
  const sentences = Array.from(
    new Set(
      combined
        .replace(/\([\s\S]*?\)/g, "")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20)
    )
  );
  let summary = sentences.slice(0, 3).join(" ");
  if (summary.length > 320) summary = summary.slice(0, 317).trim() + "...";
  return summary;
}

function generateLocalBody(entry: NewsEntry, cluster: NewsCluster, members: ParsedNews[]): string {
  const allSummaries = members.map((m) => m.entry.summary).join(" ");
  const sentences = Array.from(
    new Set(
      allSummaries
        .replace(/\([\s\S]*?\)/g, "")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20)
    )
  );
  const synthesized = sentences.slice(0, 4).join(" ");

  const lines = [
    "## What happened",
    synthesized || entry.summary,
    "",
    "## Key facts",
    `- **Date:** ${entry.date}`,
    entry.location ? `- **Location:** ${entry.location}` : null,
    `- **Affected pets:** ${entry.species.join(", ") || "Unknown"}`,
    entry.substances.length > 0
      ? `- **Substances or products involved:** ${entry.substances.join(", ")}`
      : null,
    `- **Severity:** ${entry.severity}`,
    `- **Status:** ${entry.status}`,
    "",
    "## What pet owners should do",
    "Monitor your pet closely for any symptoms described in the reports. Keep potentially dangerous foods, plants, medications, and chemicals out of reach. If you suspect your pet has been exposed to something harmful, contact your veterinarian or an animal poison control center right away. Early intervention can make a significant difference.",
    "",
    "## Related coverage",
  ];

  for (const source of cluster.sources) {
    if (source.slug === entry.slug) {
      lines.push(`- [Read the full report on ${source.name} →](${source.url})`);
    } else {
      lines.push(
        `- [Read PetPilot's coverage from ${source.name} →](/news/${source.slug})`
      );
    }
  }

  return lines.filter(Boolean).join("\n");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const forceLocal = process.argv.includes("--local");
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log("Reading news files...");
  const news = await readAllNews();
  console.log(`Found ${news.length} articles.`);

  console.log("Clustering articles...");
  const clusters = findClusters(news);
  const clusterableCount = clusters.reduce((sum, c) => sum + c.slugs.length, 0);
  console.log(
    `Found ${clusters.length} clusters covering ${clusterableCount} articles.`
  );

  const slugToNews = new Map(news.map((n) => [n.slug, n]));
  const useLLM = !forceLocal && !!apiKey;

  if (!useLLM) {
    console.log(
      forceLocal
        ? "Using local fallback generation (--local)."
        : "ANTHROPIC_API_KEY not found, using local fallback generation."
    );
  }

  let lastRequestTime = 0;
  let enriched = 0;

  for (const cluster of clusters) {
    const members = cluster.slugs
      .map((slug) => slugToNews.get(slug))
      .filter(Boolean) as ParsedNews[];

    if (members.length === 0) continue;

    let result: EnrichmentResult | undefined;

    if (useLLM) {
      const now = Date.now();
      const elapsed = now - lastRequestTime;
      if (elapsed < MIN_REQUEST_INTERVAL_MS) {
        await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
      }
      lastRequestTime = Date.now();

      try {
        console.log(`Enriching cluster ${cluster.id} (${members.length} sources)...`);
        result = await callClaude(cluster, members);
        enriched++;
      } catch (error) {
        console.error(
          `  LLM enrichment failed for cluster ${cluster.id}: ${(error as Error).message}`
        );
        console.log("  Falling back to local generation.");
      }
    }

    if (!result) {
      const summary = generateLocalSummary(cluster, members);
      const bodies: Record<string, string> = {};
      for (const member of members) {
        bodies[member.slug] = generateLocalBody(member.entry, cluster, members);
      }
      result = { clusterSummary: summary, bodies };
    }

    cluster.summary = result.clusterSummary;

    if (!dryRun) {
      const now = new Date().toISOString();
      for (const member of members) {
        const body = result.bodies[member.slug] || generateLocalBody(member.entry, cluster, members);
        const updatedEntry: NewsEntry = {
          ...member.entry,
          clusterId: cluster.id,
          updatedAt: now,
        };
        const newMd = matter.stringify(body, JSON.parse(JSON.stringify(updatedEntry)));
        await fs.writeFile(member.filePath, newMd, "utf-8");
      }
    }
  }

  if (!dryRun) {
    await fs.writeFile(clustersPath, JSON.stringify(clusters, null, 2), "utf-8");
    console.log(`Wrote ${clustersPath}`);
  }

  if (useLLM) {
    console.log(`\nDone. ${enriched}/${clusters.length} clusters enriched with LLM.`);
  } else {
    console.log(`\nDone. All ${clusters.length} clusters generated locally.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
