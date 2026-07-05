import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import type { NewsEntry, NewsSeverity } from "../lib/news";

const newsDir = path.join(process.cwd(), "content", "news", "en");

function inferSpecies(title: string, summary: string): NewsEntry["species"] {
  const text = `${title} ${summary}`.toLowerCase();
  const species: NewsEntry["species"] = [];
  if (text.includes("dog") || text.includes("puppy") || text.includes("canine")) species.push("dogs");
  if (text.includes("cat") || text.includes("kitten") || text.includes("feline")) species.push("cats");
  if (species.length === 0) species.push("other");
  return species;
}

function inferSubstances(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
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

function inferSeverity(title: string, summary: string): NewsSeverity {
  const text = `${title} ${summary}`.toLowerCase();
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

function inferLocation(title: string, summary: string): string | undefined {
  const text = `${title} ${summary}`;
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

function extractSourceFromTitle(title: string): string | undefined {
  const match = title.match(/\s[-–—]\s([^-]+)$/);
  return match?.[1]?.trim();
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

async function main() {
  const files = await fs.readdir(newsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  let updated = 0;

  for (const file of mdFiles) {
    const filePath = path.join(newsDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const entry = data as NewsEntry;

    const description = content.replace(/\[Read the full report on[^\]]+\]\([^)]+\)/, "").trim();

    const inferredSource = extractSourceFromTitle(entry.title);
    const source = inferredSource || entry.source;

    const species = inferSpecies(entry.title, entry.summary);
    const substances = inferSubstances(entry.title, entry.summary);
    const severity = inferSeverity(entry.title, entry.summary);
    const location = normalizeLocation(inferLocation(entry.title, description) || entry.location);

    const newSummary = expandSummary(
      entry.title,
      description,
      source,
      severity,
      species,
      substances,
      location
    );

    const updatedEntry: NewsEntry = {
      ...entry,
      source,
      species,
      substances,
      severity,
      location,
      summary: newSummary,
    };

    const body = `${newSummary}\n\n[Read the full report on ${source} →](${entry.sourceUrl})`;
    const newMd = matter.stringify(body, JSON.parse(JSON.stringify(updatedEntry)));

    await fs.writeFile(filePath, newMd, "utf-8");
    updated++;
  }

  console.log(`Updated ${updated} news files in ${newsDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
