import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import matter from "gray-matter";
import Parser from "rss-parser";

import { defaultLocale, type Locale } from "../lib/i18n";
import type { NewsEntry, NewsSeverity } from "../lib/news";

const execFileAsync = promisify(execFile);

interface SourceFeed {
  name: string;
  rssUrl?: string;
  newsUrl?: string;
}

const SOURCES: SourceFeed[] = [
  // Veterinary & regulatory authorities
  {
    name: "ASPCA Animal Poison Control",
    newsUrl: "https://www.aspca.org/pet-care/animal-poison-control",
    // ASPCA does not publish a public RSS feed; source is kept for attribution only.
  },
  {
    name: "Pet Poison Helpline",
    newsUrl: "https://www.petpoisonhelpline.com/blog/",
    rssUrl: "https://www.petpoisonhelpline.com/feed/",
  },
  {
    name: "FDA Center for Veterinary Medicine",
    newsUrl: "https://www.fda.gov/animal-veterinary/news-events",
    // FDA animal-veterinary RSS is no longer publicly available; source kept for attribution.
  },
  {
    name: "AVMA",
    newsUrl: "https://www.avma.org/news",
    rssUrl: "https://www.avma.org/news/rss.xml",
  },
  // Major international media
  {
    name: "Bloomberg",
    newsUrl: "https://www.bloomberg.com",
    rssUrl: "https://feeds.bloomberg.com/business/news.rss",
  },
  {
    name: "Bloomberg Technology",
    newsUrl: "https://www.bloomberg.com/technology",
    rssUrl: "https://feeds.bloomberg.com/technology/news.rss",
  },
  {
    name: "Bloomberg Markets",
    newsUrl: "https://www.bloomberg.com/markets",
    rssUrl: "https://feeds.bloomberg.com/markets/news.rss",
  },
  {
    name: "Bloomberg Politics",
    newsUrl: "https://www.bloomberg.com/politics",
    rssUrl: "https://feeds.bloomberg.com/politics/news.rss",
  },
  {
    name: "Bloomberg Pursuits",
    newsUrl: "https://www.bloomberg.com/pursuits",
    rssUrl: "https://feeds.bloomberg.com/pursuits/news.rss",
  },
  {
    name: "BBC News",
    newsUrl: "https://www.bbc.com/news",
    rssUrl: "https://feeds.bbci.co.uk/news/rss.xml",
  },
  {
    name: "BBC World",
    newsUrl: "https://www.bbc.com/news/world",
    rssUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
  },
  {
    name: "BBC US & Canada",
    newsUrl: "https://www.bbc.com/news/world/us_and_canada",
    rssUrl: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  },
  {
    name: "BBC Business",
    newsUrl: "https://www.bbc.com/news/business",
    rssUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
  },
  {
    name: "BBC Technology",
    newsUrl: "https://www.bbc.com/news/technology",
    rssUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  },
  {
    name: "BBC Science",
    newsUrl: "https://www.bbc.com/news/science_and_environment",
    rssUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  },
  {
    name: "BBC Health",
    newsUrl: "https://www.bbc.com/news/health",
    rssUrl: "https://feeds.bbci.co.uk/news/health/rss.xml",
  },
  {
    name: "The Guardian World",
    newsUrl: "https://www.theguardian.com/world",
    rssUrl: "https://www.theguardian.com/world/rss",
  },
  {
    name: "The Guardian US",
    newsUrl: "https://www.theguardian.com/us-news",
    rssUrl: "https://www.theguardian.com/us-news/rss",
  },
  {
    name: "The Guardian Science",
    newsUrl: "https://www.theguardian.com/science",
    rssUrl: "https://www.theguardian.com/science/rss",
  },
  {
    name: "The Guardian Life and style",
    newsUrl: "https://www.theguardian.com/lifeandstyle",
    rssUrl: "https://www.theguardian.com/lifeandstyle/rss",
  },
  {
    name: "The New York Times",
    newsUrl: "https://www.nytimes.com",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  },
  {
    name: "NYT World",
    newsUrl: "https://www.nytimes.com/section/world",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  },
  {
    name: "NYT US",
    newsUrl: "https://www.nytimes.com/section/us",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  },
  {
    name: "NYT Health",
    newsUrl: "https://www.nytimes.com/section/health",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
  },
  {
    name: "NPR News",
    newsUrl: "https://www.npr.org",
    rssUrl: "https://feeds.npr.org/1001/rss.xml",
  },
  {
    name: "NPR Health",
    newsUrl: "https://www.npr.org/sections/health/",
    rssUrl: "https://feeds.npr.org/1032/rss.xml",
  },
  {
    name: "NPR Science",
    newsUrl: "https://www.npr.org/sections/science/",
    rssUrl: "https://feeds.npr.org/1007/rss.xml",
  },
  // Google News search feeds: aggregating stories about pet poisoning and recalls
  {
    name: "Google News",
    newsUrl: "https://news.google.com",
    rssUrl: "https://news.google.com/rss/search?q=pet+poisoning+dog+cat&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News",
    newsUrl: "https://news.google.com",
    rssUrl: "https://news.google.com/rss/search?q=dog+toxic+food+recall&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News",
    newsUrl: "https://news.google.com",
    rssUrl: "https://news.google.com/rss/search?q=cat+poisoning+lily&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News",
    newsUrl: "https://news.google.com",
    rssUrl: "https://news.google.com/rss/search?q=xylitol+dog&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News",
    newsUrl: "https://news.google.com",
    rssUrl: "https://news.google.com/rss/search?q=pet+food+recall&hl=en-US&gl=US&ceid=US:en",
  },
];

interface RawNewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  source: string;
}

const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    "User-Agent": "PetPilot-NewsBot/1.0 (+https://petpilot.example.com)",
  },
});

async function fetchXml(url: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sL",
        "--max-time",
        "30",
        "--retry",
        "2",
        "-A",
        "PetPilot-NewsBot/1.0 (+https://petpilot.example.com)",
        "-H",
        "Accept: application/rss+xml, application/atom+xml, application/xml, text/xml",
        url,
      ],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    if (!stdout.trim()) return undefined;
    return stdout;
  } catch (err) {
    console.warn(`Error fetching ${url}:`, err instanceof Error ? err.message : err);
    return undefined;
  }
}

async function fetchRssSource(source: SourceFeed): Promise<RawNewsItem[]> {
  if (!source.rssUrl) return [];
  const xml = await fetchXml(source.rssUrl);
  if (!xml) return [];
  try {
    const feed = await parser.parseString(xml);
    return (feed.items || [])
      .map((item) => {
        const title = item.title?.trim();
        const link = item.link?.trim() || item.guid?.trim();
        if (!title || !link) return undefined;
        // Google News feeds expose the original publisher in the <source> element.
        const originalSource =
          typeof item.source === "string"
            ? item.source.trim()
            : item.source?.name?.trim() || source.name;
        return {
          title,
          link,
          pubDate: item.isoDate || item.pubDate,
          description: item.contentSnippet || item.summary || item.content,
          source: originalSource,
        } as RawNewsItem;
      })
      .filter((item): item is RawNewsItem => item !== undefined);
  } catch (err) {
    console.warn(`Failed to parse ${source.rssUrl}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

function isPetPoisoningRelevant(title: string, description?: string): boolean {
  const text = `${title} ${description ?? ""}`;
  const petPatterns = [
    /\bdogs?\b/i,
    /\bcats?\b/i,
    /\bpets?\b/i,
    /\bpupp(ies|y)\b/i,
    /\bkittens?\b/i,
    /\bcanines?\b/i,
    /\bfelines?\b/i,
  ];
  const hasPet = petPatterns.some((pattern) => pattern.test(text));
  if (!hasPet) return false;

  const incidentTerms = [
    "poison",
    "poisoning",
    "toxic",
    "toxin",
    "intoxicate",
    "ingested",
    "contaminated",
    "recall",
    "xylitol",
    "chocolate",
    "grape",
    "raisin",
    "onion",
    "garlic",
    "macadamia",
    "alcohol",
    "caffeine",
    "ibuprofen",
    "acetaminophen",
    "antifreeze",
    "lily",
    "sago palm",
    "rodenticide",
    "slug bait",
    "essential oil",
    "pesticide",
    "medication",
    "melamine",
    "aflatoxin",
    "salmonella",
    "pentobarbital",
    "vitamin d",
    "kidney failure",
    "liver failure",
    "death",
    "died",
    "fatal",
    "hospital",
    "emergency",
    "severe",
  ];
  const lowerText = text.toLowerCase();
  return incidentTerms.some((t) => lowerText.includes(t));
}

function inferSeverity(title: string, description?: string): NewsSeverity {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (
    text.includes("death") ||
    text.includes("died") ||
    text.includes("fatal") ||
    text.includes("critical") ||
    text.includes("kidney failure") ||
    text.includes("liver failure") ||
    text.includes("euthanized")
  ) {
    return "critical";
  }
  if (
    text.includes("hospital") ||
    text.includes("severe") ||
    text.includes("emergency") ||
    text.includes("recall") ||
    text.includes("contaminated") ||
    text.includes("poisoned")
  ) {
    return "high";
  }
  if (
    text.includes("warning") ||
    text.includes("caution") ||
    text.includes("illness") ||
    text.includes("symptoms") ||
    text.includes("sickened") ||
    text.includes("poison") ||
    text.includes("toxic") ||
    text.includes("toxin")
  ) {
    return "moderate";
  }
  return "low";
}

function inferSpecies(title: string, description?: string): NewsEntry["species"] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const species: NewsEntry["species"] = [];
  if (text.includes("dog") || text.includes("puppy") || text.includes("canine")) species.push("dogs");
  if (text.includes("cat") || text.includes("kitten") || text.includes("feline")) species.push("cats");
  if (species.length === 0) species.push("other");
  return species;
}

function inferSubstances(title: string, description?: string): string[] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const substances = [
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
    "pentobarbital",
    "vitamin D",
  ];
  return substances.filter((s) => text.includes(s.toLowerCase()));
}

const LOCATION_HINTS: { pattern: RegExp; name: string }[] = [
  { pattern: /\b(United States|U\.S\.|US|USA)\b/i, name: "United States" },
  { pattern: /\b(United Kingdom|UK)\b/i, name: "United Kingdom" },
  { pattern: /\bAustralia\b/i, name: "Australia" },
  { pattern: /\bCanada\b/i, name: "Canada" },
  { pattern: /\bIndia\b/i, name: "India" },
  { pattern: /\bChina\b/i, name: "China" },
  { pattern: /\bJapan\b/i, name: "Japan" },
  { pattern: /\bGermany\b/i, name: "Germany" },
  { pattern: /\bFrance\b/i, name: "France" },
  { pattern: /\bBrazil\b/i, name: "Brazil" },
  { pattern: /\bMexico\b/i, name: "Mexico" },
  { pattern: /\bItaly\b/i, name: "Italy" },
  { pattern: /\bSpain\b/i, name: "Spain" },
  { pattern: /\bNetherlands\b/i, name: "Netherlands" },
  { pattern: /\bSouth Korea\b/i, name: "South Korea" },
];

function inferLocation(title: string, description?: string): string | undefined {
  const text = `${title} ${description ?? ""}`;
  for (const hint of LOCATION_HINTS) {
    if (hint.pattern.test(text)) return hint.name;
  }
  return undefined;
}

function normalizeLocation(location: string | undefined): string | undefined {
  if (!location) return undefined;
  const trimmed = location.trim();
  const lower = trimmed.toLowerCase();
  for (const hint of LOCATION_HINTS) {
    if (hint.pattern.test(lower)) return hint.name;
  }
  return trimmed;
}

function summarize(title: string, description?: string): string {
  const text = description?.trim() || title;
  return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text;
}

function expandSummary(
  title: string,
  description: string | undefined,
  source: string,
  severity: NewsSeverity,
  species: string[],
  substances: string[],
  location: string | undefined
): string {
  const summary = summarize(title, description);
  const whyItMatters =
    severity === "critical"
      ? "This is a critical pet safety incident that requires immediate attention from pet owners."
      : severity === "high"
      ? "Pet owners should be aware of this incident and take precautions."
      : "This report may be useful for pet owners monitoring potential risks.";

  const speciesText = species.length > 0 ? `Affected animals: ${species.join(", ")}.` : "";
  const substancesText =
    substances.length > 0 ? `Substances or products mentioned: ${substances.join(", ")}.` : "";
  const locationText = location ? `Location: ${location}.` : "";

  const expanded = `${summary} ${whyItMatters} ${speciesText} ${substancesText} ${locationText}`.replace(/\s+/g, " ").trim();
  return expanded.length > 400 ? `${expanded.slice(0, 397).trim()}...` : expanded;
}

function toSlug(title: string, date: string): string {
  let base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const maxBaseLength = 60;
  if (base.length > maxBaseLength) {
    // Try to truncate at a word boundary to avoid cutting words in half.
    const truncated = base.slice(0, maxBaseLength);
    const lastHyphen = truncated.lastIndexOf("-");
    base = lastHyphen > 20 ? truncated.slice(0, lastHyphen) : truncated;
  }
  const d = new Date(date);
  const datePart = isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  return `${datePart}-${base}`;
}

async function findRelatedSlugs(substances: string[]): Promise<NewsEntry["relatedSlugs"]> {
  const related: NewsEntry["relatedSlugs"] = {};
  const { getAllFoods, getAllPlants, getAllMedications, getAllHouseholdChemicals, getAllPesticides } = await import(
    "../lib/content"
  );

  const [foods, plants, medications, chemicals, pesticides] = await Promise.all([
    getAllFoods(defaultLocale),
    getAllPlants(defaultLocale),
    getAllMedications(defaultLocale),
    getAllHouseholdChemicals(defaultLocale),
    getAllPesticides(defaultLocale),
  ]);

  for (const substance of substances) {
    const term = substance.toLowerCase();
    foods
      .filter(
        (f) => f.name.toLowerCase().includes(term) || f.aliases.some((a) => a.toLowerCase().includes(term))
      )
      .forEach((f) => {
        related.foods ??= [];
        if (!related.foods.includes(f.slug)) related.foods.push(f.slug);
      });

    plants
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.scientific_name?.toLowerCase().includes(term) ?? false) ||
          p.aliases.some((a) => a.toLowerCase().includes(term))
      )
      .forEach((p) => {
        related.plants ??= [];
        if (!related.plants.includes(p.slug)) related.plants.push(p.slug);
      });

    medications
      .filter(
        (m) => m.name.toLowerCase().includes(term) || m.active_ingredients.some((i) => i.toLowerCase().includes(term))
      )
      .forEach((m) => {
        related.medications ??= [];
        if (!related.medications.includes(m.slug)) related.medications.push(m.slug);
      });

    chemicals
      .filter(
        (c) => c.name.toLowerCase().includes(term) || (c.common_products?.some((p) => p.toLowerCase().includes(term)) ?? false)
      )
      .forEach((c) => {
        related["household-chemicals"] ??= [];
        if (!related["household-chemicals"].includes(c.slug)) related["household-chemicals"].push(c.slug);
      });

    pesticides
      .filter(
        (p) => p.name.toLowerCase().includes(term) || p.active_ingredients.some((i) => i.toLowerCase().includes(term))
      )
      .forEach((p) => {
        related.pesticides ??= [];
        if (!related.pesticides.includes(p.slug)) related.pesticides.push(p.slug);
      });
  }

  return related;
}

async function loadExistingSlugs(locale: Locale): Promise<Set<string>> {
  const dir = path.join(process.cwd(), "content", "news", locale);
  try {
    const files = await fs.readdir(dir);
    return new Set(files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
  } catch {
    return new Set();
  }
}

function buildMarkdown(entry: NewsEntry, body: string): string {
  // Drop undefined values so gray-matter/js-yaml can safely dump the front matter.
  const frontmatter = JSON.parse(JSON.stringify(entry)) as NewsEntry;
  return matter.stringify(body, frontmatter);
}

async function main() {
  const locale: Locale = defaultLocale;
  const publish = process.env.NEWS_PUBLISH === "true";
  const outDir = publish
    ? path.join(process.cwd(), "content", "news", locale)
    : path.join(process.cwd(), "content", "news", locale, "drafts");
  await fs.mkdir(outDir, { recursive: true });

  const existingSlugs = await loadExistingSlugs(locale);
  const now = new Date();
  const envDays = process.env.INITIAL_FETCH_DAYS ? parseInt(process.env.INITIAL_FETCH_DAYS, 10) : NaN;
  const lookbackDays = Number.isFinite(envDays) && envDays > 0 ? envDays : 35;
  const cutoff = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

  console.log(`Fetching news from the last ${lookbackDays} day(s)...`);

  const sourceResults = await Promise.all(SOURCES.map((source) => fetchRssSource(source)));
  const rawItems = sourceResults.flat();

  // Deduplicate by link.
  const seenLinks = new Set<string>();
  const uniqueItems = rawItems.filter((item) => {
    if (seenLinks.has(item.link)) return false;
    seenLinks.add(item.link);
    return true;
  });

  const relevantItems = uniqueItems
    .filter((item) => isPetPoisoningRelevant(item.title, item.description))
    .filter((item) => {
      const d = item.pubDate ? new Date(item.pubDate) : now;
      return !isNaN(d.getTime()) && d >= cutoff;
    });

  const generated: string[] = [];
  const skipped: string[] = [];

  for (const item of relevantItems) {
    const date = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : now.toISOString().slice(0, 10);
    const slug = toSlug(item.title, date);

    if (existingSlugs.has(slug) || existingSlugs.has(slug.replace(/^\d{4}-\d{2}-\d{2}-/, ""))) {
      skipped.push(slug);
      continue;
    }

    const substances = inferSubstances(item.title, item.description);
    const relatedSlugs = await findRelatedSlugs(substances);
    const species = inferSpecies(item.title, item.description);
    const severity = inferSeverity(item.title, item.description);
    const location = normalizeLocation(inferLocation(item.title, item.description));

    const entry: NewsEntry = {
      slug,
      title: item.title,
      date,
      month: date.slice(0, 7),
      source: item.source,
      sourceUrl: item.link,
      location,
      species,
      substances,
      severity,
      status: "confirmed",
      summary: expandSummary(item.title, item.description, item.source, severity, species, substances, location),
      body: "",
      relatedSlugs,
      updatedAt: now.toISOString(),
      reviewed: false,
    };

    const body = `${entry.summary}\n\n[Read the full report on ${entry.source} →](${entry.sourceUrl})`;
    const md = buildMarkdown(entry, body);

    await fs.writeFile(path.join(outDir, `${slug}.md`), md, "utf-8");
    generated.push(slug);
  }

  console.log(`Fetched ${rawItems.length} raw items from ${SOURCES.length} sources.`);
  console.log(`Found ${relevantItems.length} relevant items.`);
  console.log(`Generated ${generated.length} draft(s) in ${outDir}:`);
  for (const slug of generated) {
    console.log(`  - ${slug}.md`);
  }
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} duplicate(s).`);
  }

  if (generated.length === 0) {
    console.log("No new drafts to create.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
