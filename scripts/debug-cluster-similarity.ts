import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

interface ParsedNews {
  slug: string;
  entry: {
    title: string;
    summary: string;
    species: string[];
    substances: string[];
    date: string;
    source: string;
    sourceUrl: string;
  };
  content: string;
  filePath: string;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one",
  "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old",
  "see", "two", "who", "boy", "did", "she", "use", "way", "many", "oil", "sit", "set", "run",
  "eat", "far", "sea", "eye", "ago", "off", "too", "any", "say", "man", "try", "ask", "end",
  "why", "let", "put", "tell", "very", "when", "much", "would", "there", "their", "what",
  "said", "have", "each", "which", "will", "about", "if", "up", "do", "at", "on", "in", "to",
  "of", "a", "is", "it", "as", "be", "by", "or", "an", "we", "us", "my", "he", "no", "so", "go",
]);

const EXTRA_SUBSTANCES = [
  "xylitol", "chocolate", "grapes", "raisins", "onions", "garlic", "macadamia nuts", "alcohol",
  "caffeine", "ibuprofen", "acetaminophen", "antifreeze", "lily", "sago palm", "rodenticide",
  "slug bait", "essential oils", "pesticide", "melamine", "aflatoxin", "salmonella", "listeria",
  "e. coli", "pentobarbital", "vitamin d", "vitamin b1", "thiamine", "mycotoxin", "mold",
  "metal", "plastic", "foreign material", "glass", "sharp", "choking", "debris", "fraud",
  "diverted", "pfas", "ethylene glycol", "kidney failure", "liver failure", "renal failure",
];

const NON_BRAND_TERMS = new Set([
  "abc", "abc27", "cbs", "nbc", "fox", "cnn", "bbc", "npr", "nyt", "new york times",
  "washington post", "guardian", "reuters", "ap", "associated press", "pr newswire",
  "google news", "yahoo", "yahoo news", "msn", "usa today", "wkrc", "wbrc", "wstm", "pix11",
  "kolb", "klkn", "koln", "41nbc", "nbc chicago", "food poison journal", "petfoodindustry",
  "pet food processing", "tapinto", "houston chronicle", "derry journal", "wales online",
  "vet times", "catster", "daily paws", "spruce pets", "the spruce pets", "marthastewart",
  "pennlive", "irish mirror", "mamavation", "mainichi shimbun", "dvm360", "avma", "aspca",
  "fda", "cdc", "usda", "doh", "nbc", "cbs news", "abc news",
  "google", "usa", "today", "times", "journal", "online", "mirror", "chronicle", "paws", "spruce",
  "mainichi", "shimbun", "processing",
  "q&a", "how", "what", "are", "these", "this", "that", "with", "for", "over", "after", "from",
  "due", "can", "you", "have", "your", "about", "possible", "potential", "select", "two", "lots",
  "canned", "wet", "dry", "high", "protein", "flavor", "may", "contain", "foreign", "material",
  "sold", "nationwide", "voluntary", "recall", "recalled", "recalls", "dog", "cat", "food",
  "treats", "pet", "animal", "health", "news", "report", "reports", "article", "articles",
  "watch list", "owners", "some", "being", "those", "one", "new", "product", "products", "popular",
]);

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .filter((t) => !STOP_WORDS.has(t));
}

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
    if (lower.length >= 3 && !NON_BRAND_TERMS.has(lower)) set.add(lower);
    for (const word of lower.split(/\s+/)) {
      if (word.length >= 3 && !NON_BRAND_TERMS.has(word)) set.add(word);
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
  return summary.includes("Pet owners should be aware of this incident and take precautions");
}

function allText(item: ParsedNews): string {
  if (isFallbackText(item.entry.summary)) {
    return item.entry.title;
  }
  return `${item.entry.title} ${item.entry.summary} ${item.content}`;
}

function similarity(a: ParsedNews, b: ParsedNews, frequentTerms: Set<string>): number {
  const wordsA = normalizeText(allText(a));
  const wordsB = normalizeText(allText(b));
  const wordScore = jaccard(wordsA, wordsB);

  const titleTokensA = normalizeText(a.entry.title);
  const titleTokensB = normalizeText(b.entry.title);
  const bigramsA = new Set<string>();
  const bigramsB = new Set<string>();
  for (let i = 0; i <= titleTokensA.length - 2; i++) bigramsA.add(titleTokensA.slice(i, i + 2).join(" "));
  for (let i = 0; i <= titleTokensB.length - 2; i++) bigramsB.add(titleTokensB.slice(i, i + 2).join(" "));
  const bigramScore = jaccardSets(bigramsA, bigramsB);

  let score = Math.max(wordScore, bigramScore);

  const substancesA = a.entry.substances.length > 0 ? a.entry.substances : inferSubstancesFromText(allText(a));
  const substancesB = b.entry.substances.length > 0 ? b.entry.substances : inferSubstancesFromText(allText(b));
  const sharedSubstances = substancesA.filter((s) => substancesB.includes(s));
  if (sharedSubstances.length > 0) score += 0.25;

  const termsA = extractCapitalizedPhrases(a.entry.title);
  const termsB = extractCapitalizedPhrases(b.entry.title);
  const sharedFrequent = termsA.filter((t) => termsB.includes(t) && frequentTerms.has(t));
  if (sharedFrequent.length > 0) score += 0.4;

  const nonOtherSpeciesA = a.entry.species.filter((s) => s !== "other");
  const nonOtherSpeciesB = b.entry.species.filter((s) => s !== "other");
  const sharedSpecies = nonOtherSpeciesA.filter((s) => nonOtherSpeciesB.includes(s));

  if (nonOtherSpeciesA.length > 0 && nonOtherSpeciesB.length > 0 && sharedSpecies.length === 0) {
    return 0;
  }

  if (sharedSpecies.length > 0) score += 0.05;
  if (a.entry.date === b.entry.date) score += 0.1;

  return Math.min(score, 1);
}

async function main() {
  const newsDir = path.join(process.cwd(), "data", "news", "en");
  const files = (await fs.readdir(newsDir)).filter((f) => f.startsWith("2026-07") && f.endsWith(".md"));
  const items: ParsedNews[] = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(newsDir, file), "utf-8");
    const { data, content } = matter(raw);
    items.push({
      slug: file.replace(/\.md$/, ""),
      entry: data as ParsedNews["entry"],
      content,
      filePath: file,
    });
  }

  const frequentTerms = getFrequentTerms(items, 3);
  console.log("frequent terms:", [...frequentTerms].sort().join(", "));

  const targetSlugs = [
    "2026-07-03-some-pedigree-dog-food-cans-being-recalled---wbrc",
    "2026-07-06-pedigree-can-high-protein-chopped-chicken-duck-dog-food",
    "2026-07-07-pedigree-recalls-two-lots-of-canned-dog-food-after-products",
  ];

  const pedRef = items.find((i) => i.slug === "2026-07-02-voluntary-recall-of-two-lots-of-pedigree-can-high-protein-ch")!;

  for (const slug of targetSlugs) {
    const item = items.find((i) => i.slug === slug);
    if (!item) continue;
    console.log(`\n${slug}`);
    console.log(`  title: ${item.entry.title}`);
    console.log(`  fallback: ${isFallbackText(item.entry.summary)}`);
    console.log(`  phrases: ${extractCapitalizedPhrases(item.entry.title).join(", ")}`);
    console.log(`  sim with detailed Pedigree: ${similarity(item, pedRef, frequentTerms).toFixed(3)}`);

    const top = items
      .filter((i) => i.slug !== slug)
      .map((i) => ({ item: i, score: similarity(item, i, frequentTerms) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    console.log("  top similar:");
    for (const { item: i, score } of top) {
      console.log(`    ${score.toFixed(3)} ${i.slug.slice(0, 60)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
