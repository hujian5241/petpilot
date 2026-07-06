import {
  getAllFoods,
  getAllPlants,
  getAllMedications,
  getAllHouseholdChemicals,
  getAllPesticides,
} from "./content";
import { defaultLocale, type Locale } from "./locales";

type ContentType = "foods" | "plants" | "medications" | "household-chemicals" | "pesticides";

interface LinkTarget {
  type: ContentType;
  slug: string;
  term: string;
}

const indexPromises = new Map<Locale, Promise<Map<string, LinkTarget>>>();

async function buildTermIndex(locale: Locale): Promise<Map<string, LinkTarget>> {
  const index = new Map<string, LinkTarget>();

  const [foods, plants, medications, chemicals, pesticides] = await Promise.all([
    getAllFoods(locale),
    getAllPlants(locale),
    getAllMedications(locale),
    getAllHouseholdChemicals(locale),
    getAllPesticides(locale),
  ]);

  const add = (type: ContentType, slug: string, term: string) => {
    const normalized = term.toLowerCase().trim();
    if (!normalized || normalized.length < 3) return;
    if (index.has(normalized)) return;
    index.set(normalized, { type, slug, term });
  };

  for (const item of foods) {
    add("foods", item.slug, item.name);
    item.aliases.forEach((a) => add("foods", item.slug, a));
  }

  for (const item of plants) {
    add("plants", item.slug, item.name);
    add("plants", item.slug, item.scientific_name ?? "");
    item.aliases.forEach((a) => add("plants", item.slug, a));
  }

  for (const item of medications) {
    add("medications", item.slug, item.name);
    item.aliases.forEach((a) => add("medications", item.slug, a));
    item.active_ingredients.forEach((i) => add("medications", item.slug, i));
  }

  for (const item of chemicals) {
    add("household-chemicals", item.slug, item.name);
    item.aliases.forEach((a) => add("household-chemicals", item.slug, a));
    item.common_products?.forEach((p) => add("household-chemicals", item.slug, p));
  }

  for (const item of pesticides) {
    add("pesticides", item.slug, item.name);
    item.aliases.forEach((a) => add("pesticides", item.slug, a));
    item.active_ingredients.forEach((i) => add("pesticides", item.slug, i));
  }

  return index;
}

async function getTermIndex(locale: Locale): Promise<Map<string, LinkTarget>> {
  let promise = indexPromises.get(locale);
  if (!promise) {
    promise = buildTermIndex(locale);
    indexPromises.set(locale, promise);
  }
  return promise;
}

export function clearTermIndexCache(): void {
  indexPromises.clear();
}

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkHtml(href: string, text: string): string {
  return `<a href="${escapeHtml(href)}" class="text-primary hover:text-primary-dark hover:underline">${text}</a>`;
}

export async function linkifyNewsContent(
  html: string,
  locale: Locale,
  fallbackToDefault = true
): Promise<string> {
  let index = await getTermIndex(locale);

  if (index.size === 0 && fallbackToDefault && locale !== defaultLocale) {
    index = await getTermIndex(defaultLocale);
  }

  if (index.size === 0) return html;

  // Sort terms by length descending so longer matches take priority.
  const terms = Array.from(index.entries()).sort((a, b) => b[0].length - a[0].length);

  // Split HTML into text nodes and tags to avoid replacing inside attributes or existing links.
  const tokens: string[] = [];
  let current = 0;

  for (let i = 0; i < html.length; i++) {
    if (html[i] === "<") {
      if (i > current) {
        tokens.push(html.slice(current, i));
      }
      const tagEnd = html.indexOf(">", i);
      if (tagEnd === -1) break;
      const tag = html.slice(i, tagEnd + 1);
      tokens.push(tag);
      i = tagEnd;
      current = tagEnd + 1;
    }
  }
  if (current < html.length) {
    tokens.push(html.slice(current));
  }

  // Track which text node indices are inside anchors.
  let anchorDepth = 0;
  const processed = tokens.map((token, idx) => {
    const isTag = token.startsWith("<");
    if (isTag) {
      if (/^<a\b/i.test(token)) anchorDepth++;
      else if (/^<\/a\b/i.test(token)) anchorDepth = Math.max(0, anchorDepth - 1);
      return token;
    }

    if (anchorDepth > 0) return token;

    // Replace terms with links, marking replaced ranges to avoid overlapping matches.
    const result = token;
    const applied: { start: number; end: number; target: LinkTarget }[] = [];

    for (const [normalized, target] of terms) {
      const regex = new RegExp(`\\b${escapeRegex(normalized)}\\b`, "gi");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(result)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        const overlaps = applied.some(
          (r) => matchStart < r.end && matchEnd > r.start
        );
        if (overlaps) continue;

        applied.push({ start: matchStart, end: matchEnd, target });
      }
    }

    if (applied.length === 0) return token;

    // Sort applied matches by position and build the final string.
    applied.sort((a, b) => a.start - b.start);
    let output = "";
    let lastEnd = 0;
    for (const { start, end, target } of applied) {
      output += result.slice(lastEnd, start);
      const href = `/${locale === defaultLocale ? "" : `${locale}/`}${target.type}/${target.slug}`;
      output += linkHtml(href, escapeHtml(result.slice(start, end)));
      lastEnd = end;
    }
    output += result.slice(lastEnd);
    return output;
  });

  return processed.join("");
}
