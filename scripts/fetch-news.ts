import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import matter from "gray-matter";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";

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

export interface RawNewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  source: string;
  originalUrl?: string;
}

export interface ExtractedArticle {
  brand?: string;
  product?: string;
  affectedAnimals?: string[];
  whatHappened?: string;
  reason?: string;
  recallContact?: string;
  lotUpc?: string;
  location?: string;
  summary: string;
  substances: string[];
  species: NewsEntry["species"];
  severity: NewsSeverity;
  type: NewsEntry["type"];
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

interface DecodingParams {
  signature: string;
  timestamp: string;
}

const decodingParamsCache = new Map<string, DecodingParams | undefined>();

function base64UrlDecode(segment: string): Buffer {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padding), "base64");
}

function stripProtobufWrapper(decoded: Buffer): string {
  const prefix = Buffer.from([0x08, 0x13, 0x22]);
  const suffix = Buffer.from([0xd2, 0x01, 0x00]);

  let start = 0;
  let end = decoded.length;

  if (decoded.length >= prefix.length && decoded.subarray(0, prefix.length).equals(prefix)) {
    start = prefix.length;
  }
  if (
    decoded.length >= suffix.length &&
    decoded.subarray(decoded.length - suffix.length).equals(suffix)
  ) {
    end -= suffix.length;
  }

  const payload = decoded.subarray(start, end);
  if (payload.length === 0) return "";

  // Length-prefixed string (varint).
  let length = payload[0]!;
  let offset = 1;
  if (length >= 0x80) {
    if (payload.length < 2) return "";
    length = (payload[0]! & 0x7f) | ((payload[1]! & 0x7f) << 7);
    offset = 2;
  }

  return payload.subarray(offset, offset + length).toString("utf-8");
}

async function fetchDecodingParams(segment: string): Promise<DecodingParams | undefined> {
  const cached = decodingParamsCache.get(segment);
  if (cached !== undefined || decodingParamsCache.has(segment)) return cached;

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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "-H",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        `https://news.google.com/rss/articles/${segment}`,
      ],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    const html = stdout.trim();
    if (!html) {
      decodingParamsCache.set(segment, undefined);
      return undefined;
    }

    const sgMatch = html.match(/data-n-a-sg="([^"]+)"/);
    const tsMatch = html.match(/data-n-a-ts="([^"]+)"/);
    if (!sgMatch?.[1] || !tsMatch?.[1]) {
      decodingParamsCache.set(segment, undefined);
      return undefined;
    }

    const params = { signature: sgMatch[1], timestamp: tsMatch[1] };
    decodingParamsCache.set(segment, params);
    return params;
  } catch (err) {
    console.warn(
      `Error fetching Google News decoding params for ${segment.slice(0, 20)}...:`,
      err instanceof Error ? err.message : err
    );
    decodingParamsCache.set(segment, undefined);
    return undefined;
  }
}

async function callBatchExecute(
  segment: string,
  params: DecodingParams
): Promise<string | undefined> {
  const payload = [
    "Fbv4je",
    `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${segment}",${params.timestamp},"${params.signature}"]`,
  ];
  const body = `f.req=${encodeURIComponent(JSON.stringify([[payload]]))}`;

  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sL",
        "--max-time",
        "30",
        "--retry",
        "2",
        "-X",
        "POST",
        "https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je",
        "-H",
        "Content-Type: application/x-www-form-urlencoded;charset=UTF-8",
        "-H",
        "Referer: https://news.google.com/",
        "-H",
        "Origin: https://news.google.com",
        "-H",
        "Accept: */*",
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "--data",
        body,
      ],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    const text = stdout.trim();
    const parts = text.split("\n\n");
    const jsonPart = parts.length >= 2 ? parts[1] : text;
    if (!jsonPart) return undefined;

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonPart);
    } catch {
      return undefined;
    }

    if (!Array.isArray(parsed)) return undefined;
    const batchResponses = (parsed as unknown[]).filter(
      (d) =>
        Array.isArray(d) &&
        (d[0] === "wrb.fr" || d[0] === "w779db") &&
        d[1] === "Fbv4je"
    );

    if (batchResponses.length === 0) return undefined;
    const innerDataStr = (batchResponses[0] as unknown[])[2];
    if (typeof innerDataStr !== "string") return undefined;

    const innerData = JSON.parse(innerDataStr) as unknown[];
    const resolved = innerData[1];
    return typeof resolved === "string" && resolved.startsWith("http") ? resolved : undefined;
  } catch (err) {
    console.warn(
      `Error calling Google News batchexecute for ${segment.slice(0, 20)}...:`,
      err instanceof Error ? err.message : err
    );
    return undefined;
  }
}

export async function resolveGoogleNewsUrl(url: string): Promise<string | undefined> {
  if (!url.includes("news.google.com/rss/articles/")) return url;

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const segment = parts[parts.length - 1];
    if (!segment) return undefined;

    const decoded = base64UrlDecode(segment);
    const resolved = stripProtobufWrapper(decoded);

    if (resolved.startsWith("http")) {
      return resolved;
    }

    // New-style IDs need a server-side batchexecute call with signature/timestamp.
    const params = await fetchDecodingParams(segment);
    if (!params) return undefined;
    return callBatchExecute(segment, params);
  } catch (err) {
    console.warn(`Error resolving Google News URL ${url}:`, err instanceof Error ? err.message : err);
    return undefined;
  }
}

export async function fetchHtml(url: string): Promise<string | undefined> {
  try {
    const resolvedUrl = await resolveGoogleNewsUrl(url);
    // Google News wrapper pages don't contain the original article text; skip if we
    // couldn't resolve the redirect to a publisher URL.
    if (url.includes("news.google.com/rss/articles/") && !resolvedUrl) {
      return undefined;
    }
    const targetUrl = resolvedUrl || url;
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sL",
        "--max-time",
        "30",
        "--retry",
        "2",
        "-A",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "-H",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "-H",
        "Accept-Language: en-US,en;q=0.9",
        targetUrl,
      ],
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    if (!stdout.trim()) return undefined;
    return stdout;
  } catch (err) {
    console.warn(`Error fetching HTML ${url}:`, err instanceof Error ? err.message : err);
    return undefined;
  }
}

export function extractReadableText(html: string): string {
  const $ = cheerio.load(html);
  // Remove non-content elements
  $("script, style, nav, header, footer, aside, .advertisement, .ads, .comments, .social-share").remove();

  // Try common article content selectors
  const selectors = [
    "article",
    "[role='main']",
    "main",
    ".article-body",
    ".article-content",
    ".story-body",
    ".story-content",
    ".entry-content",
    ".post-content",
    ".content-body",
    "#article-body",
    "#story-body",
  ];

  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length && el.text().trim().length > 200) {
      return cleanText(el.text());
    }
  }

  // Fallback: extract paragraphs and headings
  const text = $("p, h1, h2, h3, li")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 0)
    .join("\n\n");

  return cleanText(text);
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
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
          originalUrl: link,
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
  const lowerText = text.toLowerCase();

  // Explicitly exclude advice columns, human-focused lifestyle articles, and off-topic content.
  const offTopicPatterns = [
    /\bask\s+annalisa\b/i,
    /\bask\s+hadley\b/i,
    /\bdear\s+(carolyn|abby|prudence|polly|annalisa)\b/i,
    /\badvice\s+column\b/i,
    /\bhow\s+do\s+i\s+(cope|deal|handle)\b/i,
    /\bmy\s+(husband|wife|partner|boyfriend|girlfriend|mother|father|child|daughter|son)\b/i,
    /\bgrief\b/i,
    /\bguilt\b/i,
    /\bbereavement\b/i,
    /\bdivorce\b/i,
    /\bbreakup\b/i,
    /\bmental\s+health\b/i,
    /\bdepression\b/i,
    /\banxiety\b/i,
    /\btherapy\b/i,
    /\brelationship\s+advice\b/i,
    /\bpolitics\b/i,
    /\belection\b/i,
    /\bolympics\b/i,
    /\bsports?\b/i,
    /\bfootball\b/i,
    /\bbasketball\b/i,
    /\bbaseball\b/i,
    /\bcelebrity\b/i,
    /\bentertainment\b/i,
    /\bweather\b/i,
    /\bstock\s+market\b/i,
    /\bfinance\b/i,
    /\binflation\b/i,
    /\bmortgage\b/i,
    // Birding, wildlife watching, and nature content that is not about pet poisoning.
    /\bbirding\b/i,
    /\bbirdwatcher\b/i,
    /\bbird[-\s]?watching\b/i,
    /\bornithology\b/i,
    /\bwildlife\s+watching\b/i,
    /\bnature\s+documentary\b/i,
    /\bpodcast\b/i,
    /\bbook\s+review\b/i,
    /\bmovie\s+review\b/i,
    /\bfilm\s+review\b/i,
    /\btravel\s+(guide|tips)\b/i,
    /\bfashion\b/i,
    /\bbeauty\b/i,
    /\bfitness\s+trend\b/i,
    /\bhome\s+decor\b/i,
    /\bgardening\s+tips\b/i,
    /\bpet\s+adoption\s+success\b/i,
    /\brescue\s+story\b/i,
  ];
  if (offTopicPatterns.some((pattern) => pattern.test(text))) {
    return false;
  }

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

  // Strong relevance signals: the article must mention an actual poisoning, recall, contamination,
  // foreign material, or serious health outcome. General pet-health articles without these signals
  // are too broad and should be skipped.
  const strongIncidentTerms = [
    "poison",
    "poisoning",
    "poisoned",
    "toxic",
    "toxin",
    "toxicity",
    "intoxicate",
    "ingested",
    "contaminated",
    "contamination",
    "recall",
    "recalled",
    "foreign material",
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
    "ethylene glycol",
    "lily",
    "sago palm",
    "rodenticide",
    "rat poison",
    "slug bait",
    "essential oil",
    "pesticide",
    "melamine",
    "aflatoxin",
    "salmonella",
    "listeria",
    "e. coli",
    "pentobarbital",
    "vitamin d",
    "mycotoxin",
    "mold",
    "kidney failure",
    "liver failure",
    "renal failure",
    "death",
    "died",
    "fatal",
    "euthanized",
    "hospital",
    "emergency",
    "severe",
    "life-threatening",
    "dog food",
    "cat food",
    "pet food",
    "pet treat",
    "chew toy",
    "raw food",
    "wet food",
    "dry food",
    "kibble",
    "canned food",
  ];

  const hasStrongSignal = strongIncidentTerms.some((t) => lowerText.includes(t));
  if (!hasStrongSignal) return false;

  // Secondary terms are used only after a strong signal is present.
  const secondaryTerms = [
    "symptoms",
    "sickened",
    "illness",
    "vomiting",
    "diarrhea",
    "seizure",
    "lethargy",
    "warning",
    "caution",
    "advisory",
    "alert",
    "outbreak",
    "withdrawn",
    "voluntary recall",
    "market withdrawal",
    "elevated vitamin",
    "rickets",
    "neurological issues",
    "malnutrition",
  ];

  return secondaryTerms.some((t) => lowerText.includes(t)) || hasStrongSignal;
}

export function inferNewsType(title: string, description?: string): NewsEntry["type"] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const recallTerms = [
    "recall",
    "recalled",
    "recalls",
    "withdrawal",
    "withdrawn",
    "voluntary recall",
    "market withdrawal",
    "product recall",
    "food recall",
    "pet food recall",
    "dog food recall",
    "cat food recall",
    "treat recall",
    "chew recall",
    "expanded recall",
    "recall expanded",
    "recall issued",
    "recall announced",
  ];
  if (recallTerms.some((t) => text.includes(t))) return "recall";
  const alertTerms = ["alert", "warning", "advisory", "outbreak", "health alert"];
  if (alertTerms.some((t) => text.includes(t))) return "alert";
  return "incident";
}

export function inferSeverity(title: string, description?: string): NewsSeverity {
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

export function inferSpecies(title: string, description?: string): NewsEntry["species"] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const species: NewsEntry["species"] = [];
  if (text.includes("dog") || text.includes("puppy") || text.includes("canine")) species.push("dogs");
  if (text.includes("cat") || text.includes("kitten") || text.includes("feline")) species.push("cats");
  if (species.length === 0) species.push("other");
  return species;
}

export function inferSubstances(title: string, description?: string): string[] {
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
    "listeria",
    "e. coli",
    "mycotoxin",
    "mold",
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

export function inferLocation(title: string, description?: string): string | undefined {
  const text = `${title} ${description ?? ""}`;
  for (const hint of LOCATION_HINTS) {
    if (hint.pattern.test(text)) return hint.name;
  }
  return undefined;
}

export function normalizeLocation(location: string | undefined): string | undefined {
  if (!location) return undefined;
  const trimmed = location.trim();
  const lower = trimmed.toLowerCase();
  for (const hint of LOCATION_HINTS) {
    if (hint.pattern.test(lower)) return hint.name;
  }
  return trimmed;
}

function parseLLMJson(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // ignore
  }

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

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const MAX_RETRIES = 2;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractArticleWithLLM(
  item: RawNewsItem,
  articleText: string,
  attempt = 0
): Promise<ExtractedArticle | undefined> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined;

  const prompt = `You are a pet-safety research assistant. Read the following news article carefully and extract structured information. Be precise and only include facts stated in the article.

Article title: ${item.title}
Source: ${item.source}
Date: ${item.pubDate || "unknown"}
Article text:
${articleText.slice(0, 12000)}

Return ONLY a raw JSON object (no markdown code fences, no commentary) with exactly these keys:
- brand: the company/brand name responsible for the product (string or null if unknown)
- product: specific product names, flavors, or types involved (string or null if unknown)
- affectedAnimals: array of affected animals, e.g. ["dogs"], ["cats"], ["dogs", "cats"] (use "other pets" if vague)
- whatHappened: a concise description of the incident/recall/contamination in 1-2 sentences
- reason: why the recall/incident happened (e.g., Salmonella contamination, elevated vitamin D, foreign material)
- recallContact: recall contact information, refund/replacement instructions, or customer service number from the article (string or null)
- lotUpc: lot numbers, UPC codes, best-by dates, or size information (string or null)
- location: geographic region or country (string or null)
- summary: a thorough, factual 80-150 word summary of the article. Include brand, product, affected animals, what happened, and what owners should do. Do NOT hedge with "The article reports" unless the fact is uncertain.
- substances: array of hazardous substances mentioned (e.g., "Salmonella", "Listeria", "vitamin D", "xylitol"). Infer from the article even if not in a fixed list.
- species: array from ["dogs", "cats", "other"]. Pick the most specific set based on the article.
- severity: one of ["critical", "high", "moderate", "low"]. "critical" only for deaths or organ failure. "high" for recalls and confirmed contamination. "moderate" for warnings and symptoms without recalls.
- type: one of ["recall", "alert", "incident"]. "recall" if a product recall/withdrawal is announced.

If the article is behind a paywall, is not about a pet-safety incident, or lacks any useful details, return the JSON with all string values as null/empty and severity "low", but still include a brief summary.`;

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim();

    const parsed = parseLLMJson(text) as Record<string, unknown>;

    return {
      brand: typeof parsed.brand === "string" ? parsed.brand : undefined,
      product: typeof parsed.product === "string" ? parsed.product : undefined,
      affectedAnimals: Array.isArray(parsed.affectedAnimals)
        ? parsed.affectedAnimals.filter((a): a is string => typeof a === "string")
        : undefined,
      whatHappened: typeof parsed.whatHappened === "string" ? parsed.whatHappened : undefined,
      reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
      recallContact: typeof parsed.recallContact === "string" ? parsed.recallContact : undefined,
      lotUpc: typeof parsed.lotUpc === "string" ? parsed.lotUpc : undefined,
      location: typeof parsed.location === "string" ? parsed.location : undefined,
      summary: typeof parsed.summary === "string" ? parsed.summary : `${item.title}. ${item.description ?? ""}`,
      substances: Array.isArray(parsed.substances)
        ? parsed.substances.filter((s): s is string => typeof s === "string")
        : [],
      species: Array.isArray(parsed.species)
        ? (parsed.species.filter((s): s is string => ["dogs", "cats", "other"].includes(s)) as NewsEntry["species"])
        : inferSpecies(item.title, item.description),
      severity: ["critical", "high", "moderate", "low"].includes(String(parsed.severity))
        ? (String(parsed.severity) as NewsSeverity)
        : inferSeverity(item.title, item.description),
      type: ["recall", "alert", "incident"].includes(String(parsed.type))
        ? (String(parsed.type) as NewsEntry["type"])
        : inferNewsType(item.title, item.description),
    };
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = 1000 * 2 ** attempt;
      console.warn(`  LLM extraction retry ${attempt + 1} for "${item.title}" in ${delay}ms`);
      await sleep(delay);
      return extractArticleWithLLM(item, articleText, attempt + 1);
    }
    console.warn(`  LLM extraction failed for "${item.title}": ${(error as Error).message}`);
    return undefined;
  }
}

export async function findRelatedSlugs(substances: string[]): Promise<NewsEntry["relatedSlugs"]> {
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
  const dir = path.join(process.cwd(), "data", "news", locale);
  try {
    const files = await fs.readdir(dir);
    return new Set(files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
  } catch {
    return new Set();
  }
}

export function buildMarkdown(entry: NewsEntry, body: string): string {
  // Drop undefined values so gray-matter/js-yaml can safely dump the front matter.
  const frontmatter = JSON.parse(JSON.stringify(entry)) as NewsEntry;
  return matter.stringify(body, frontmatter);
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

export function formatBody(extracted: ExtractedArticle, item: RawNewsItem): string {
  const lines: string[] = [];
  lines.push(extracted.summary);
  lines.push("");

  const details: string[] = [];
  if (extracted.brand) details.push(`**Brand/Company:** ${extracted.brand}`);
  if (extracted.product) details.push(`**Product:** ${extracted.product}`);
  if (extracted.affectedAnimals && extracted.affectedAnimals.length > 0) {
    details.push(`**Affected animals:** ${extracted.affectedAnimals.join(", ")}`);
  }
  if (extracted.reason) details.push(`**Reason:** ${extracted.reason}`);
  if (extracted.lotUpc) details.push(`**Lot / UPC / Best by:** ${extracted.lotUpc}`);
  if (extracted.location) details.push(`**Location:** ${extracted.location}`);
  if (extracted.recallContact) details.push(`**Recall contact / what to do:** ${extracted.recallContact}`);

  if (details.length > 0) {
    lines.push(details.join("\n\n"));
    lines.push("");
  }

  lines.push(`[Read the full report on ${item.source} →](${item.link})`);
  return lines.join("\n");
}

async function main() {
  const locale: Locale = defaultLocale;
  const publish = process.env.NEWS_PUBLISH === "true";
  const outDir = publish
    ? path.join(process.cwd(), "data", "news", locale)
    : path.join(process.cwd(), "data", "news", locale, "drafts");
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

  console.log(`Found ${relevantItems.length} relevant items to enrich.`);

  const generated: string[] = [];
  const skipped: string[] = [];

  let enrichedCount = 0;
  let fallbackCount = 0;

  for (const item of relevantItems) {
    const date = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : now.toISOString().slice(0, 10);
    const slug = toSlug(item.title, date);

    if (existingSlugs.has(slug) || existingSlugs.has(slug.replace(/^\d{4}-\d{2}-\d{2}-/, ""))) {
      skipped.push(slug);
      continue;
    }

    let extracted: ExtractedArticle | undefined;
    const html = await fetchHtml(item.link);
    if (html) {
      const articleText = extractReadableText(html);
      if (articleText.length > 100) {
        extracted = await extractArticleWithLLM(item, articleText);
      }
    }

    if (!extracted) {
      fallbackCount++;
      const substances = inferSubstances(item.title, item.description);
      extracted = {
        summary: `${item.title}. ${item.description ?? ""}`,
        substances,
        species: inferSpecies(item.title, item.description),
        severity: inferSeverity(item.title, item.description),
        type: inferNewsType(item.title, item.description),
      };
    } else {
      enrichedCount++;
    }

    const relatedSlugs = await findRelatedSlugs(extracted.substances);
    const location = normalizeLocation(extracted.location ?? inferLocation(item.title, item.description));

    const entry: NewsEntry = {
      slug,
      title: item.title,
      date,
      month: date.slice(0, 7),
      source: item.source,
      sourceUrl: item.link,
      location,
      species: extracted.species,
      substances: extracted.substances,
      severity: extracted.severity,
      status: "confirmed",
      type: extracted.type,
      summary: extracted.summary,
      body: "",
      relatedSlugs,
      updatedAt: now.toISOString(),
      reviewed: false,
    };

    const body = formatBody(extracted, item);
    const md = buildMarkdown(entry, body);

    await fs.writeFile(path.join(outDir, `${slug}.md`), md, "utf-8");
    generated.push(slug);
  }

  console.log(`Fetched ${rawItems.length} raw items from ${SOURCES.length} sources.`);
  console.log(`Found ${relevantItems.length} relevant items.`);
  console.log(`LLM enriched ${enrichedCount}, fallback ${fallbackCount}.`);
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

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
