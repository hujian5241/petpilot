import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";
import { remark } from "remark";
import gfm from "remark-gfm";
import sanitize from "rehype-sanitize";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

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
      entry: { body: "", ...data, slug } as NewsEntry,
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

const EXTRA_SUBSTANCES = [
  "xylitol",
  "chocolate",
  "grapes",
  "raisins",
  "onions",
  "garlic",
  "macadamia nuts",
  "alcohol",
  "caffeine",
  "ibuprofen",
  "acetaminophen",
  "antifreeze",
  "lily",
  "sago palm",
  "rodenticide",
  "slug bait",
  "essential oils",
  "pesticide",
  "melamine",
  "aflatoxin",
  "salmonella",
  "listeria",
  "e. coli",
  "pentobarbital",
  "vitamin d",
  "vitamin b1",
  "thiamine",
  "mycotoxin",
  "mold",
  "metal",
  "plastic",
  "foreign material",
  "glass",
  "sharp",
  "choking",
  "debris",
  "fraud",
  "diverted",
  "pfas",
  "ethylene glycol",
  "kidney failure",
  "liver failure",
  "renal failure",
];

const NON_BRAND_TERMS = new Set([
  // Media / sources
  "abc",
  "abc27",
  "cbs",
  "nbc",
  "fox",
  "cnn",
  "bbc",
  "npr",
  "nyt",
  "new york times",
  "washington post",
  "guardian",
  "reuters",
  "ap",
  "associated press",
  "pr newswire",
  "google news",
  "yahoo",
  "yahoo news",
  "msn",
  "usa today",
  "wkrc",
  "wbrc",
  "wstm",
  "pix11",
  "kolb",
  "klkn",
  "koln",
  "41nbc",
  "nbc chicago",
  "food poison journal",
  "petfoodindustry",
  "pet food processing",
  "tapinto",
  "houston chronicle",
  "derry journal",
  "wales online",
  "vet times",
  "catster",
  "daily paws",
  "spruce pets",
  "the spruce pets",
  "marthastewart",
  "pennlive",
  "irish mirror",
  "mamavation",
  "mainichi shimbun",
  "dvm360",
  "avma",
  "aspca",
  "fda",
  "cdc",
  "usda",
  "doh",
  "nbc",
  "cbs news",
  "abc news",
  "google",
  "usa",
  "today",
  "times",
  "journal",
  "online",
  "mirror",
  "chronicle",
  "paws",
  "spruce",
  "mainichi",
  "shimbun",
  "processing",
  // Generic / non-event terms
  "q&a",
  "how",
  "what",
  "are",
  "these",
  "this",
  "that",
  "with",
  "for",
  "over",
  "after",
  "from",
  "due",
  "can",
  "you",
  "have",
  "your",
  "about",
  "possible",
  "potential",
  "select",
  "two",
  "lots",
  "canned",
  "wet",
  "dry",
  "high",
  "protein",
  "flavor",
  "may",
  "contain",
  "foreign",
  "material",
  "sold",
  "nationwide",
  "voluntary",
  "recall",
  "recalled",
  "recalls",
  "dog",
  "cat",
  "food",
  "treats",
  "pet",
  "animal",
  "health",
  "news",
  "report",
  "reports",
  "article",
  "articles",
  "watch list",
  "owners",
  "some",
  "being",
  "those",
  "one",
  "new",
  "product",
  "products",
  "popular",
]);

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function jaccardSets(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function inferSubstancesFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return EXTRA_SUBSTANCES.filter((s) => lower.includes(s));
}

function extractCapitalizedPhrases(title: string): string[] {
  const matches = title.match(/\b[A-Z][a-zA-Z&]+(?:\s+[A-Z][a-zA-Z&]+){0,2}\b/g) || [];
  const set = new Set<string>();
  for (const m of matches) {
    const lower = m.toLowerCase();
    // Add the full phrase (e.g. "pedigree can high") and, crucially, each
    // individual word in it. Greedy phrase matching alone swallows single-word
    // event markers like "pedigree", so we surface them explicitly.
    if (lower.length >= 3 && !NON_BRAND_TERMS.has(lower)) {
      set.add(lower);
    }
    for (const word of lower.split(/\s+/)) {
      if (word.length >= 3 && !NON_BRAND_TERMS.has(word)) {
        set.add(word);
      }
    }
  }
  return [...set];
}

function getFrequentTerms(items: ParsedNews[], minFreq = 3): Set<string> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const term of extractCapitalizedPhrases(item.entry.title)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  return new Set([...counts.entries()].filter(([, c]) => c >= minFreq).map(([t]) => t));
}

function isFallbackText(summary: string): boolean {
  // Articles that failed extraction use a generic fallback summary.
  // Treating them as title-only prevents generic boilerplate from creating false clusters.
  return summary.includes("Pet owners should be aware of this incident and take precautions");
}

function allText(item: ParsedNews): string {
  // For fallback articles, rely almost entirely on the title to avoid generic summary pollution.
  if (isFallbackText(item.entry.summary)) {
    return item.entry.title;
  }
  return `${item.entry.title} ${item.entry.summary} ${item.content}`;
}

function similarity(a: ParsedNews, b: ParsedNews, frequentTerms: Set<string>): number {
  // Use the full article text (title + summary + original body) so articles about the
  // same event but with thin summaries can still match via shared structured details.
  const wordsA = normalizeText(allText(a));
  const wordsB = normalizeText(allText(b));
  const wordScore = jaccard(wordsA, wordsB);

  // Title bigrams catch brand + product phrasing that bag-of-words misses.
  const titleTokensA = normalizeText(a.entry.title);
  const titleTokensB = normalizeText(b.entry.title);
  const bigramsA = new Set<string>();
  const bigramsB = new Set<string>();
  for (let i = 0; i <= titleTokensA.length - 2; i++) {
    bigramsA.add(titleTokensA.slice(i, i + 2).join(" "));
  }
  for (let i = 0; i <= titleTokensB.length - 2; i++) {
    bigramsB.add(titleTokensB.slice(i, i + 2).join(" "));
  }
  const bigramScore = jaccardSets(bigramsA, bigramsB);

  let score = Math.max(wordScore, bigramScore);

  // Substance overlap: fall back to inferring from full text when frontmatter is empty.
  const substancesA =
    a.entry.substances.length > 0
      ? a.entry.substances
      : inferSubstancesFromText(allText(a));
  const substancesB =
    b.entry.substances.length > 0
      ? b.entry.substances
      : inferSubstancesFromText(allText(b));
  const sharedSubstances = substancesA.filter((s) => substancesB.includes(s));
  if (sharedSubstances.length > 0) score += 0.25;

  // Frequent capitalized phrases (brand / product names that appear in 3+ titles this
  // month) are strong event markers. Give them a large boost.
  const termsA = extractCapitalizedPhrases(a.entry.title);
  const termsB = extractCapitalizedPhrases(b.entry.title);
  const sharedFrequent = termsA.filter((t) => termsB.includes(t) && frequentTerms.has(t));
  if (sharedFrequent.length > 0) score += 0.4;

  const nonOtherSpeciesA = a.entry.species.filter((s) => s !== "other");
  const nonOtherSpeciesB = b.entry.species.filter((s) => s !== "other");
  const sharedSpecies = nonOtherSpeciesA.filter((s) => nonOtherSpeciesB.includes(s));

  // Hard constraint: entries with explicit, conflicting species should not cluster.
  if (nonOtherSpeciesA.length > 0 && nonOtherSpeciesB.length > 0 && sharedSpecies.length === 0) {
    return 0;
  }

  if (sharedSpecies.length > 0) score += 0.05;

  if (a.entry.date === b.entry.date) score += 0.1;

  return Math.min(score, 1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90)
    .replace(/-+$/, "");
}

function uniqueSlug(base: string, used: Set<string>): string {
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    const suffixStr = `-${suffix}`;
    candidate = `${base.slice(0, 90 - suffixStr.length)}${suffixStr}`;
    suffix++;
  }
  used.add(candidate);
  return candidate;
}

function findClusters(news: ParsedNews[]): NewsCluster[] {
  const byMonth = new Map<string, ParsedNews[]>();
  for (const item of news) {
    const month = item.entry.month;
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(item);
  }

  const clusters: NewsCluster[] = [];
  const usedSlugs = new Set<string>();

  for (const [, monthItems] of byMonth) {
    const frequentTerms = getFrequentTerms(monthItems, 3);

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
        const score = similarity(monthItems[i]!, monthItems[j]!, frequentTerms);
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

      const title =
        group
          .map((g) => g.entry.title.replace(/\s[-–—]\s[^-]+$/g, "").trim())
          .sort((a, b) => b.length - a.length)[0] || group[0]!.entry.title;

      const sources = group.map((g) => ({
        name: g.entry.source,
        url: g.entry.sourceUrl,
        slug: g.slug,
        date: g.entry.date,
      }));

      const dates = group.map((g) => g.entry.date).sort();
      const severities = group.map((g) => g.entry.severity);
      const severityOrder: NewsSeverity[] = ["low", "moderate", "high", "critical"];
      const severity = severities.sort(
        (a, b) => severityOrder.indexOf(b) - severityOrder.indexOf(a)
      )[0]!;

      const explicitSpecies = group
        .flatMap((g) => g.entry.species)
        .filter((s) => s !== "other");
      const speciesCounts = new Map<string, number>();
      for (const s of explicitSpecies) {
        speciesCounts.set(s, (speciesCounts.get(s) ?? 0) + 1);
      }
      const speciesThreshold = Math.max(1, Math.floor(group.length / 2));
      const species = Array.from(speciesCounts.entries())
        .filter(([, count]) => count >= speciesThreshold)
        .map(([s]) => s);

      const typeOrder: Array<NonNullable<NewsEntry["type"]>> = ["recall", "alert", "incident"];
      const clusterType = group
        .map((g) => g.entry.type)
        .filter(Boolean)
        .sort((a, b) => typeOrder.indexOf(a!) - typeOrder.indexOf(b!))[0];

      clusters.push({
        id,
        canonicalSlug: uniqueSlug(slugify(title), usedSlugs),
        slugs,
        title,
        summary: "", // filled by LLM
        sources,
        dateRange: { start: dates[0]!, end: dates[dates.length - 1]! },
        month: group[0]!.entry.month,
        species: species as ("other" | "dogs" | "cats")[],
        substances: Array.from(new Set(group.flatMap((g) => g.entry.substances))),
        severity,
        type: clusterType,
      });
    }
  }

  return clusters;
}

interface EnrichmentResult {
  clusterTitle: string;
  clusterSummary: string;
  clusterBody: string;
  sharedBody?: string;
  bodies?: Record<string, string>;
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const processed = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(markdown);
  return processed.toString();
}

async function callClaude(
  cluster: NewsCluster,
  members: ParsedNews[],
  attempt = 0
): Promise<EnrichmentResult> {
  const memberDescriptions = members
    .map(
      (m) =>
        `Title: ${m.entry.title}\nSource: ${m.entry.source}\nDate: ${m.entry.date}\nURL: ${m.entry.sourceUrl}\nSummary: ${m.entry.summary}\nFull article text:\n${m.content}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a senior pet-safety news editor for PetPilot. Your task is to synthesize multiple news reports about the same pet-safety event into one authoritative, detailed cluster page. Read the reports carefully and extract concrete facts.

Reports:
${memberDescriptions}

Most reports should describe the same core event. If any report is clearly about a different incident, ignore it and do not mention it in the output.

Return ONLY a raw JSON object with no markdown code fences, no commentary, and no text outside the JSON. Use exactly these keys:
- clusterTitle: a concise, informative headline (max 90 characters). Prefer "Brand product recalled over issue" format. Include brand name if known.
- clusterSummary: a factual 150-220 word summary suitable for a news card. Include: brand/company, specific product(s), affected animals, what happened, reason for recall/incident, geographic scope, and what pet owners should do.
- clusterBody: a detailed Markdown body (under 500 words) with these sections:
  ## What happened
  ## Affected products (include brand, product names, lot/UPC if available)
  ## Which pets are at risk
  ## Why it matters
  ## What pet owners should do (include recall contact / refund info if known)
  Do NOT include a Related coverage section; related links will be rendered by the page template.`;

  const client = new Anthropic();
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim();

    const parsed = parseLLMJson(text) as unknown as EnrichmentResult & { sharedBody?: string; bodies?: Record<string, string> };

    if (!parsed.clusterSummary || !parsed.clusterBody) {
      throw new Error("LLM response missing clusterSummary or clusterBody");
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

function generateLocalClusterBody(cluster: NewsCluster, members: ParsedNews[]): string {
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
  const canonical = members.find((m) => m.slug === cluster.canonicalSlug)?.entry ?? members[0]!.entry;

  const lines = [
    "## What happened",
    synthesized || canonical.summary,
    "",
    "## Key facts",
    `- **Date:** ${cluster.dateRange.start}${cluster.dateRange.start !== cluster.dateRange.end ? ` to ${cluster.dateRange.end}` : ""}`,
    canonical.location ? `- **Location:** ${canonical.location}` : null,
    `- **Affected pets:** ${cluster.species.join(", ") || "Unknown"}`,
    cluster.substances.length > 0
      ? `- **Substances or products involved:** ${cluster.substances.join(", ")}`
      : null,
    `- **Severity:** ${cluster.severity}`,
    `- **Status:** ${canonical.status}`,
    "",
    "## What pet owners should do",
    "Monitor your pet closely for any symptoms described in the reports. Keep potentially dangerous foods, plants, medications, and chemicals out of reach. If you suspect your pet has been exposed to something harmful, contact your veterinarian or an animal poison control center right away. Early intervention can make a significant difference.",
  ];

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
      const body = generateLocalClusterBody(cluster, members);
      const bodyHtml = await renderMarkdownToHtml(body);
      result = { clusterTitle: cluster.title, clusterSummary: summary, clusterBody: body };
      cluster.bodyHtml = bodyHtml;
    } else {
      cluster.bodyHtml = await renderMarkdownToHtml(result.clusterBody);
    }

    cluster.title = result.clusterTitle ?? cluster.title;
    cluster.summary = result.clusterSummary;

    if (!dryRun) {
      const now = new Date().toISOString();
      for (const member of members) {
        // Keep the member's original structured body so each source detail page remains
        // useful. Only update cluster linkage metadata; do not overwrite the body with the
        // synthesized cluster content.
        const body =
          member.content.trim() ||
          `${member.entry.summary}\n\n[Read the full report on ${member.entry.source} →](${member.entry.sourceUrl})`;
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
