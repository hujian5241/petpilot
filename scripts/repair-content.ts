import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const locales = ["en", "de", "fr", "ja"] as const;
type Locale = (typeof locales)[number];

const contentTypes = [
  "foods",
  "plants",
  "medications",
  "household-chemicals",
  "pesticides",
] as const;
type ContentType = (typeof contentTypes)[number];

const singularTypeMap: Record<ContentType, "food" | "plant" | "medication" | "household-chemical" | "pesticide"> = {
  foods: "food",
  plants: "plant",
  medications: "medication",
  "household-chemicals": "household-chemical",
  pesticides: "pesticide",
};

interface FileRef {
  locale: Locale;
  type: ContentType;
  slug: string;
  filePath: string;
}

function toISODate(value: unknown): string | undefined {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ensureArray(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return undefined;
  return [value];
}

function normalizeSignalWord(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("danger")) return "danger";
  if (lower.includes("warning")) return "warning";
  if (lower.includes("caution")) return "caution";
  return undefined;
}

async function loadCategories(): Promise<Set<string>> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "content", "en", "categories.json"),
    "utf-8"
  );
  const categories = JSON.parse(raw) as Array<{ slug: string }>;
  return new Set(categories.map((c) => c.slug));
}

async function collectFiles(): Promise<FileRef[]> {
  const refs: FileRef[] = [];
  for (const locale of locales) {
    for (const type of contentTypes) {
      const dir = path.join(process.cwd(), "content", locale, type);
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (!file.endsWith(".md")) continue;
          refs.push({
            locale,
            type,
            slug: file.replace(/\.md$/, ""),
            filePath: path.join(dir, file),
          });
        }
      } catch {
        // directory may not exist
      }
    }
  }
  return refs;
}

function inferCategory(type: ContentType, slug: string, tags: unknown[]): string {
  const tagSet = new Set(
    Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string") : []
  );

  if (type === "household-chemicals") {
    if (slug.includes("laundry") || slug.includes("fabric") || slug.includes("dryer"))
      return "laundry-products";
    if (slug.includes("paint") || slug.includes("glue") || slug.includes("candle") || slug.includes("potpourri") || slug.includes("freshener") || slug.includes("mothball"))
      return "home-improvement";
    if (slug.includes("antifreeze") || slug.includes("windshield") || slug.includes("washer"))
      return "automotive-products";
    if (slug.includes("hair") || slug.includes("nail") || slug.includes("toothpaste") || slug.includes("alcohol") || tagSet.has("essential-oil"))
      return "personal-care-products";
    return "cleaning-products";
  }

  if (type === "medications") {
    if (tagSet.has("vet")) return "vet-medications";
    return "human-medications";
  }

  if (type === "pesticides") {
    if (tagSet.has("rodenticide")) return "rodenticides";
    if (tagSet.has("herbicide")) return "herbicides";
    if (tagSet.has("fungicide")) return "fungicides";
    if (tagSet.has("molluscicide")) return "molluscicides";
    return "insecticides";
  }

  return "human-foods";
}

function fixCategories(
  data: Record<string, unknown>,
  type: ContentType,
  slug: string,
  validCategories: Set<string>
): string[] {
  const raw = ensureArray(data.categories) ?? [];
  const categories: string[] = [];
  const seen = new Set<string>();

  for (const c of raw) {
    if (typeof c !== "string") continue;
    let mapped: string | undefined;

    if (validCategories.has(c)) {
      mapped = c;
    } else if (c === "medications") {
      if (raw.includes("vet-medications") || (data.tags && Array.isArray(data.tags) && (data.tags as string[]).includes("vet"))) {
        // drop generic "medications" when vet-medications is already present
        mapped = raw.includes("vet-medications") ? undefined : "vet-medications";
      } else {
        mapped = "human-medications";
      }
    } else if (c === "pesticides") {
      mapped = inferCategory(type, slug, data.tags as unknown[]);
    } else if (c === "outdoor-chemicals") {
      mapped = inferCategory(type, slug, data.tags as unknown[]);
    } else if (c === "household-chemicals") {
      mapped = inferCategory(type, slug, data.tags as unknown[]);
    } else if (c === "grooming-products") {
      mapped = "personal-care-products";
    } else if (c === "gastrointestinal") {
      mapped = undefined; // not a valid category
    } else if (c === "plantes" || c === "plantes d'intérieur") {
      mapped = "houseplants";
    } else {
      mapped = undefined;
    }

    if (mapped && !seen.has(mapped)) {
      categories.push(mapped);
      seen.add(mapped);
    }
  }

  if (categories.length === 0) {
    categories.push(inferCategory(type, slug, data.tags as unknown[]));
  }

  return categories;
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((v) => v !== undefined);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = stripUndefined(obj[key]);
      }
    }
    return cleaned;
  }
  return value;
}

async function main() {
  const validCategories = await loadCategories();
  const files = await collectFiles();

  // Index English source files for field recovery.
  const enIndex = new Map<string, Record<string, unknown>>();
  for (const ref of files) {
    if (ref.locale !== "en") continue;
    const raw = await fs.readFile(ref.filePath, "utf-8");
    const { data } = matter(raw);
    enIndex.set(`${ref.type}/${ref.slug}`, data);
  }

  // Build valid slug set across all locales and types.
  const validSlugs = new Set(files.map((ref) => ref.slug));

  const severe: string[] = [];
  const fixed: string[] = [];

  for (const ref of files) {
    const raw = await fs.readFile(ref.filePath, "utf-8");
    let parsed: ReturnType<typeof matter>;
    try {
      parsed = matter(raw);
    } catch (error) {
      severe.push(`${ref.locale}:${ref.type}/${ref.slug} front matter parse error: ${(error as Error).message}`);
      continue;
    }
    let { data, content } = parsed;
    const prefix = `${ref.locale}:${ref.type}/${ref.slug}`;

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      severe.push(`${prefix} front matter did not parse into an object`);
      data = {};
    }

    const singularType = singularTypeMap[ref.type];

    // The original generation stored article text in a front-matter `content:`
    // field. Some translations also duplicated the English body after a second
    // `---`. Use the localized `content:` value as the Markdown body and drop
    // the redundant front-matter key so the loader sees the correct article.
    if (isNonEmptyString(data.content as unknown)) {
      content = data.content as string;
      delete data.content;
    }

    const enData = enIndex.get(`${ref.type}/${ref.slug}`) ?? {};

    // Categories
    data.categories = fixCategories(data, ref.type, ref.slug, validCategories);

    // Alternatives: keep only known slugs.
    const alternatives = ensureArray(data.alternatives) ?? [];
    data.alternatives = alternatives.filter(
      (alt): alt is string => typeof alt === "string" && validSlugs.has(alt)
    );

    // Dates
    let lastReviewed = toISODate(data.last_reviewed);
    if (!lastReviewed && enData.last_reviewed) {
      lastReviewed = toISODate(enData.last_reviewed);
    }
    if (!lastReviewed) {
      lastReviewed = "2026-07-01";
    }
    data.last_reviewed = lastReviewed;

    if (data.next_review !== undefined) {
      const next = toISODate(data.next_review);
      data.next_review = next ?? undefined;
    }

    // vet_reviewed
    if (typeof data.vet_reviewed !== "boolean") {
      data.vet_reviewed = typeof enData.vet_reviewed === "boolean" ? enData.vet_reviewed : false;
    }

    // Required common fields: copy from English if missing/empty.
    for (const field of ["id", "name", "slug", "what_to_do"] as const) {
      if (!isNonEmptyString(data[field]) && isNonEmptyString(enData[field])) {
        data[field] = enData[field];
      }
    }

    if (!Array.isArray(data.aliases) || data.aliases.length === 0) {
      data.aliases = Array.isArray(enData.aliases) ? enData.aliases : [isNonEmptyString(data.name) ? data.name : ref.slug];
    }

    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      data.tags = Array.isArray(enData.tags) ? enData.tags : [ref.type];
    }

    if (!Array.isArray(data.symptoms) || data.symptoms.length === 0) {
      data.symptoms = Array.isArray(enData.symptoms) ? enData.symptoms : [];
    }

    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      data.sources = Array.isArray(enData.sources)
        ? enData.sources
        : [{ name: "PetPoisonHelpline", url: "https://www.petpoisonhelpline.com/" }];
    }

    // Related slugs: keep only known slugs (with a small set of known aliases).
    const slugAliasMap: Record<string, string> = {
      "lactose-free": "lactose-free-milk",
    };
    function normalizeRelatedSlug(slug: unknown): string | undefined {
      if (typeof slug !== "string") return undefined;
      if (validSlugs.has(slug)) return slug;
      const mapped = slugAliasMap[slug];
      if (mapped && validSlugs.has(mapped)) return mapped;
      return undefined;
    }

    if (singularType === "food" && data.related_foods !== undefined) {
      const related = ensureArray(data.related_foods) ?? [];
      data.related_foods = related
        .map(normalizeRelatedSlug)
        .filter((s): s is string => s !== undefined);
    }

    if (singularType === "plant" && data.related_plants !== undefined) {
      const related = ensureArray(data.related_plants) ?? [];
      data.related_plants = related
        .map(normalizeRelatedSlug)
        .filter((s): s is string => s !== undefined);
    }

    // Source name recovery and null removal
    if (Array.isArray(data.sources)) {
      const enSources = Array.isArray(enData.sources) ? enData.sources : [];
      data.sources = data.sources
        .filter((source): source is Record<string, unknown> => source !== null && typeof source === "object")
        .map((source, index) => {
          if (!isNonEmptyString(source.name)) {
            const enSource = enSources[index] as Record<string, unknown> | undefined;
            if (enSource && isNonEmptyString(enSource.name)) {
              source.name = enSource.name;
            } else if (isNonEmptyString(source.url)) {
              source.name = "Source";
            } else {
              source.name = "Source";
              source.url = "https://www.petpoisonhelpline.com/";
            }
          }
          if (!isNonEmptyString(source.url)) {
            source.url = "https://www.petpoisonhelpline.com/";
          }
          return source;
        });
    }

    // Food condition_warnings: remove malformed items.
    if (singularType === "food" && data.condition_warnings !== undefined) {
      const warnings = ensureArray(data.condition_warnings) ?? [];
      const validRecommendations = ["avoid", "limit", "consult_vet"];
      data.condition_warnings = warnings.filter((item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const w = item as Record<string, unknown>;
        if (!isNonEmptyString(w.condition)) return false;
        if (!isNonEmptyString(w.reason)) return false;
        if (!validRecommendations.includes(w.recommendation as string)) return false;
        if (!Array.isArray(w.appliesTo) || w.appliesTo.length === 0) return false;
        if (!(w.appliesTo as string[]).every((s) => ["dogs", "cats"].includes(s))) return false;
        return true;
      });
    }

    // Type-specific required/optional fields
    if (singularType === "medication") {
      const medication = data as Record<string, unknown>;
      if (medication.common_uses !== undefined) {
        medication.common_uses = ensureArray(medication.common_uses);
      }
      if (medication.toxic_ingredients !== undefined) {
        medication.toxic_ingredients = ensureArray(medication.toxic_ingredients);
      }
    }

    if (singularType === "medication" || singularType === "pesticide") {
      if (!Array.isArray(data.active_ingredients) || data.active_ingredients.length === 0) {
        data.active_ingredients = Array.isArray(enData.active_ingredients) ? enData.active_ingredients : [];
      }
    }

    if (singularType === "pesticide") {
      const pestTargeted = ensureArray(data.pest_targeted);
      data.pest_targeted = pestTargeted;
      const signal = normalizeSignalWord(data.signal_word);
      data.signal_word = signal ?? undefined;
    }

    if (singularType === "food") {
      if (typeof data.requires_emergency_visit !== "boolean") {
        data.requires_emergency_visit =
          typeof enData.requires_emergency_visit === "boolean" ? enData.requires_emergency_visit : false;
      }
    }

    // Safety block validation basics
    if (!data.safety || typeof data.safety !== "object") {
      data.safety = enData.safety ?? {
        dogs: { status: "unknown", severity: undefined, summary: "" },
        cats: { status: "unknown", severity: undefined, summary: "" },
      };
    }

    // Fill missing safety summaries from English source.
    const enSafety = enData.safety as Record<string, unknown> | undefined;
    for (const species of ["dogs", "cats"] as const) {
      const info = (data.safety as Record<string, unknown>)?.[species];
      const enInfo = enSafety?.[species] as Record<string, unknown> | undefined;
      if (info === undefined || typeof info !== "object" || info === null) {
        if (enInfo) {
          ((data.safety as Record<string, unknown>)[species] as Record<string, unknown>) = { ...enInfo };
        }
        continue;
      }
      const infoObj = info as Record<string, unknown>;
      if (enInfo) {
        if (!isNonEmptyString(infoObj.status)) infoObj.status = enInfo.status ?? "unknown";
        if (!isNonEmptyString(infoObj.summary)) infoObj.summary = enInfo.summary ?? "";
        if (!isNonEmptyString(infoObj.severity)) infoObj.severity = enInfo.severity ?? undefined;
      }
    }

    // Recover translated article body from English content field when the
    // Markdown body is empty.
    if (!isNonEmptyString(content) && isNonEmptyString(enData.content as unknown)) {
      content = enData.content as string;
    }
    if (!isNonEmptyString(data.content as unknown) && isNonEmptyString(enData.content as unknown)) {
      data.content = enData.content;
    }

    // Detect severe cases: required fields still absent in English.
    const missing: string[] = [];
    if (!isNonEmptyString(data.id)) missing.push("id");
    if (!isNonEmptyString(data.name)) missing.push("name");
    if (!isNonEmptyString(data.what_to_do)) missing.push("what_to_do");
    if (!Array.isArray(data.active_ingredients) || data.active_ingredients.length === 0) {
      if (singularType === "medication" || singularType === "pesticide") missing.push("active_ingredients");
    }

    if (missing.length > 0) {
      severe.push(`${prefix} missing ${missing.join(", ")}`);
    }

    // Write repaired file.
    data = stripUndefined(data) as Record<string, unknown>;
    let output: string;
    try {
      output = matter.stringify(content.trim(), data);
    } catch (error) {
      console.error(`\nFailed to stringify ${prefix}`);
      console.error(JSON.stringify(data, null, 2));
      throw error;
    }
    await fs.writeFile(ref.filePath, output, "utf-8");
    fixed.push(prefix);
  }

  console.log(`Repaired ${fixed.length} files.`);
  if (severe.length > 0) {
    console.log(`\n${severe.length} file(s) still severely incomplete (need regeneration):`);
    for (const s of severe) console.log(`  ${s}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
