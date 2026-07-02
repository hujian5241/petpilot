import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { getAllCategories } from "../lib/content";
import { locales, defaultLocale, type Locale } from "../lib/i18n";
import type { FoodEntry, PlantEntry, SafetyStatus, Severity, Species } from "../lib/types";

const SAFETY_STATUSES: SafetyStatus[] = ["safe", "limited", "toxic", "unknown"];
const SEVERITIES: (Severity | undefined)[] = ["low", "moderate", "high", "critical", undefined];
const SPECIES: Species[] = ["dogs", "cats"];

function contentDir(locale: Locale): string {
  return path.join(process.cwd(), "content", locale);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

async function loadMarkdownFiles(
  dir: string
): Promise<Array<{ slug: string; data: unknown; content: string }>> {
  try {
    const files = await fs.readdir(dir);
    const mdFiles = files.filter((file) => file.endsWith(".md"));

    return Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(dir, file);
        const raw = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(raw);
        return { slug: file.replace(/\.md$/, ""), data, content };
      })
    );
  } catch {
    return [];
  }
}

interface ValidationContext {
  type: "food" | "plant";
  locale: Locale;
  validCategorySlugs: Set<string>;
  validSlugs: Set<string>;
}

function collectErrors(
  entry: Partial<FoodEntry> | Partial<PlantEntry>,
  slug: string,
  ctx: ValidationContext
): string[] {
  const errors: string[] = [];
  const prefix = `[${ctx.locale}:${ctx.type}:${slug}]`;

  if (!isNonEmptyString(entry.id)) errors.push(`${prefix} Missing required field: id`);
  if (!isNonEmptyString(entry.name)) errors.push(`${prefix} Missing required field: name`);
  if (!isNonEmptyString(entry.slug)) errors.push(`${prefix} Missing required field: slug`);
  if (isNonEmptyString(entry.slug) && entry.slug !== slug) {
    errors.push(`${prefix} Slug mismatch: frontmatter says "${entry.slug}"`);
  }

  if (!Array.isArray(entry.aliases) || entry.aliases.length === 0) {
    errors.push(`${prefix} Missing or invalid required field: aliases`);
  }
  if (!Array.isArray(entry.categories) || entry.categories.length === 0) {
    errors.push(`${prefix} Missing or invalid required field: categories`);
  } else {
    for (const category of entry.categories) {
      if (!ctx.validCategorySlugs.has(category)) {
        errors.push(`${prefix} Unknown category: ${category}`);
      }
    }
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    errors.push(`${prefix} Missing or invalid required field: tags`);
  }
  if (!Array.isArray(entry.symptoms)) {
    errors.push(`${prefix} Missing or invalid required field: symptoms`);
  }
  if (!Array.isArray(entry.alternatives)) {
    errors.push(`${prefix} Missing or invalid required field: alternatives`);
  } else {
    for (const alternative of entry.alternatives) {
      if (!ctx.validSlugs.has(alternative)) {
        errors.push(`${prefix} Unknown alternative slug: ${alternative}`);
      }
    }
  }
  if (!Array.isArray(entry.sources) || entry.sources.length === 0) {
    errors.push(`${prefix} Missing or invalid required field: sources`);
  } else {
    for (const source of entry.sources) {
      if (typeof source?.name !== "string" || source.name.trim().length === 0) {
        errors.push(`${prefix} Source missing name`);
      }
    }
  }

  if (!entry.safety || typeof entry.safety !== "object") {
    errors.push(`${prefix} Missing required field: safety`);
  } else {
    for (const species of SPECIES) {
      const info = entry.safety[species];
      if (!info || typeof info !== "object") {
        errors.push(`${prefix} Missing safety info for ${species}`);
        continue;
      }
      if (!SAFETY_STATUSES.includes(info.status)) {
        errors.push(`${prefix} Invalid safety status for ${species}: ${info.status}`);
      }
      if (!SEVERITIES.includes(info.severity)) {
        errors.push(`${prefix} Invalid severity for ${species}: ${info.severity}`);
      }
      if (!isNonEmptyString(info.summary)) {
        errors.push(`${prefix} Missing safety summary for ${species}`);
      }
    }
  }

  if (!isNonEmptyString(entry.what_to_do)) {
    errors.push(`${prefix} Missing required field: what_to_do`);
  }

  if (typeof entry.vet_reviewed !== "boolean") {
    errors.push(`${prefix} Missing or invalid required field: vet_reviewed`);
  }

  if (!isNonEmptyString(entry.last_reviewed) || !isValidDate(entry.last_reviewed)) {
    errors.push(`${prefix} Invalid last_reviewed date: ${entry.last_reviewed}`);
  }

  if (ctx.type === "food") {
    const food = entry as Partial<FoodEntry>;

    if (typeof food.requires_emergency_visit !== "boolean") {
      errors.push(`${prefix} Missing or invalid required field: requires_emergency_visit`);
    }

    if (food.preparation_notes !== undefined && !isNonEmptyString(food.preparation_notes)) {
      errors.push(`${prefix} Invalid optional field: preparation_notes`);
    }
    if (food.safe_amount !== undefined && !isNonEmptyString(food.safe_amount)) {
      errors.push(`${prefix} Invalid optional field: safe_amount`);
    }
    if (food.frequency !== undefined && !isNonEmptyString(food.frequency)) {
      errors.push(`${prefix} Invalid optional field: frequency`);
    }
    if (food.dosage_per_weight !== undefined && !isNonEmptyString(food.dosage_per_weight)) {
      errors.push(`${prefix} Invalid optional field: dosage_per_weight`);
    }
    if (food.notes_for_puppies !== undefined && !isNonEmptyString(food.notes_for_puppies)) {
      errors.push(`${prefix} Invalid optional field: notes_for_puppies`);
    }
    if (food.notes_for_kittens !== undefined && !isNonEmptyString(food.notes_for_kittens)) {
      errors.push(`${prefix} Invalid optional field: notes_for_kittens`);
    }

    if (food.symptoms_severity !== undefined) {
      if (!Array.isArray(food.symptoms_severity)) {
        errors.push(`${prefix} Invalid optional field: symptoms_severity`);
      } else {
        for (const item of food.symptoms_severity) {
          if (!isNonEmptyString(item?.symptom)) {
            errors.push(`${prefix} symptoms_severity item missing symptom`);
          }
          if (!SEVERITIES.includes(item?.severity)) {
            errors.push(`${prefix} symptoms_severity item has invalid severity: ${item?.severity}`);
          }
        }
      }
    }

    if (food.related_foods !== undefined) {
      if (!Array.isArray(food.related_foods)) {
        errors.push(`${prefix} Invalid optional field: related_foods`);
      } else {
        for (const related of food.related_foods) {
          if (!ctx.validSlugs.has(related)) {
            errors.push(`${prefix} Unknown related_foods slug: ${related}`);
          }
        }
      }
    }

    if (food.lookalikes !== undefined) {
      if (!Array.isArray(food.lookalikes)) {
        errors.push(`${prefix} Invalid optional field: lookalikes`);
      }
    }

    if (food.condition_warnings !== undefined) {
      if (!Array.isArray(food.condition_warnings)) {
        errors.push(`${prefix} Invalid optional field: condition_warnings`);
      } else {
        for (const item of food.condition_warnings) {
          if (!isNonEmptyString(item?.condition)) {
            errors.push(`${prefix} condition_warnings item missing condition`);
          }
          if (!isNonEmptyString(item?.reason)) {
            errors.push(`${prefix} condition_warnings item missing reason`);
          }
          if (!["avoid", "limit", "consult_vet"].includes(item?.recommendation)) {
            errors.push(`${prefix} condition_warnings item has invalid recommendation: ${item?.recommendation}`);
          }
          if (!Array.isArray(item?.appliesTo)) {
            errors.push(`${prefix} condition_warnings item missing appliesTo`);
          } else {
            for (const species of item.appliesTo) {
              if (!SPECIES.includes(species as Species)) {
                errors.push(`${prefix} condition_warnings item has invalid appliesTo species: ${species}`);
              }
            }
          }
        }
      }
    }
  }

  if (ctx.type === "plant") {
    const plant = entry as Partial<PlantEntry>;

    if (plant.requires_emergency_visit !== undefined && typeof plant.requires_emergency_visit !== "boolean") {
      errors.push(`${prefix} Invalid optional field: requires_emergency_visit`);
    }

    if (plant.symptoms_severity !== undefined) {
      if (!Array.isArray(plant.symptoms_severity)) {
        errors.push(`${prefix} Invalid optional field: symptoms_severity`);
      } else {
        for (const item of plant.symptoms_severity) {
          if (!isNonEmptyString(item?.symptom)) {
            errors.push(`${prefix} symptoms_severity item missing symptom`);
          }
          if (!SEVERITIES.includes(item?.severity)) {
            errors.push(`${prefix} symptoms_severity item has invalid severity: ${item?.severity}`);
          }
        }
      }
    }

    if (plant.lookalikes !== undefined) {
      if (!Array.isArray(plant.lookalikes)) {
        errors.push(`${prefix} Invalid optional field: lookalikes`);
      }
    }

    if (plant.notes_for_puppies !== undefined && !isNonEmptyString(plant.notes_for_puppies)) {
      errors.push(`${prefix} Invalid optional field: notes_for_puppies`);
    }
    if (plant.notes_for_kittens !== undefined && !isNonEmptyString(plant.notes_for_kittens)) {
      errors.push(`${prefix} Invalid optional field: notes_for_kittens`);
    }
  }

  return errors;
}

async function validateDirectory(
  dir: string,
  type: "food" | "plant",
  locale: Locale,
  validCategorySlugs: Set<string>,
  validSlugs: Set<string>
): Promise<{ errors: number; files: number }> {
  const files = await loadMarkdownFiles(dir);
  const ctx: ValidationContext = { type, locale, validCategorySlugs, validSlugs };
  let totalErrors = 0;

  for (const file of files) {
    const entry = (file.data ?? {}) as Partial<FoodEntry> | Partial<PlantEntry>;
    const errors = collectErrors(entry, file.slug, ctx);
    if (errors.length > 0) {
      totalErrors += errors.length;
      for (const error of errors) {
        console.error(error);
      }
    }
  }

  return { errors: totalErrors, files: files.length };
}

async function main() {
  const categories = await getAllCategories(defaultLocale);
  const validCategorySlugs = new Set(categories.map((c) => c.slug));

  // Validate each locale independently.
  let totalErrors = 0;
  const localeStats: Record<Locale, { foods: number; plants: number }> = {} as Record<
    Locale,
    { foods: number; plants: number }
  >;
  const slugIndex: Record<Locale, { foods: Set<string>; plants: Set<string> }> = {} as Record<
    Locale,
    { foods: Set<string>; plants: Set<string> }
  >;

  for (const locale of locales) {
    const foodsDir = path.join(contentDir(locale), "foods");
    const plantsDir = path.join(contentDir(locale), "plants");

    const [foodFiles, plantFiles] = await Promise.all([
      loadMarkdownFiles(foodsDir),
      loadMarkdownFiles(plantsDir),
    ]);

    const validFoodSlugs = new Set(foodFiles.map((f) => f.slug));
    const validPlantSlugs = new Set(plantFiles.map((f) => f.slug));

    slugIndex[locale] = {
      foods: validFoodSlugs,
      plants: validPlantSlugs,
    };

    // For non-default locales, allow cross-references to default-locale slugs
    // that have not been translated yet (the site falls back to English).
    const referenceFoodSlugs =
      locale === defaultLocale ? validFoodSlugs : new Set([...validFoodSlugs, ...slugIndex[defaultLocale]?.foods ?? new Set()]);
    const referencePlantSlugs =
      locale === defaultLocale
        ? validPlantSlugs
        : new Set([...validPlantSlugs, ...slugIndex[defaultLocale]?.plants ?? new Set()]);

    const foodResult = await validateDirectory(
      foodsDir,
      "food",
      locale,
      validCategorySlugs,
      referenceFoodSlugs
    );
    const plantResult = await validateDirectory(
      plantsDir,
      "plant",
      locale,
      validCategorySlugs,
      referencePlantSlugs
    );

    totalErrors += foodResult.errors + plantResult.errors;
    localeStats[locale] = { foods: foodResult.files, plants: plantResult.files };
  }

  // Cross-locale consistency: report missing translations (warn only).
  const enFoodSlugs = slugIndex[defaultLocale].foods;
  const enPlantSlugs = slugIndex[defaultLocale].plants;

  for (const locale of locales) {
    if (locale === defaultLocale) continue;

    const missingFoods = [...enFoodSlugs].filter((slug) => !slugIndex[locale].foods.has(slug));
    const missingPlants = [...enPlantSlugs].filter((slug) => !slugIndex[locale].plants.has(slug));

    for (const slug of missingFoods) {
      console.warn(
        `[${locale}:food:${slug}] Missing translation (falling back to ${defaultLocale}).`
      );
    }
    for (const slug of missingPlants) {
      console.warn(
        `[${locale}:plant:${slug}] Missing translation (falling back to ${defaultLocale}).`
      );
    }
  }

  // Validate id/slug consistency across locales.
  for (const locale of locales) {
    if (locale === defaultLocale) continue;

    const enFoods = await loadMarkdownFiles(path.join(contentDir(defaultLocale), "foods"));
    const localeFoods = await loadMarkdownFiles(path.join(contentDir(locale), "foods"));
    const enFoodsBySlug = new Map(enFoods.map((f) => [f.slug, f.data]));

    for (const file of localeFoods) {
      const enData = enFoodsBySlug.get(file.slug);
      if (!enData) continue;
      const enId = (enData as Partial<FoodEntry>).id;
      const localeId = (file.data as Partial<FoodEntry>).id;
      if (enId !== localeId) {
        console.error(
          `[${locale}:food:${file.slug}] ID mismatch with ${defaultLocale}: ${localeId} vs ${enId}`
        );
        totalErrors++;
      }
    }

    const enPlants = await loadMarkdownFiles(path.join(contentDir(defaultLocale), "plants"));
    const localePlants = await loadMarkdownFiles(path.join(contentDir(locale), "plants"));
    const enPlantsBySlug = new Map(enPlants.map((f) => [f.slug, f.data]));

    for (const file of localePlants) {
      const enData = enPlantsBySlug.get(file.slug);
      if (!enData) continue;
      const enId = (enData as Partial<PlantEntry>).id;
      const localeId = (file.data as Partial<PlantEntry>).id;
      if (enId !== localeId) {
        console.error(
          `[${locale}:plant:${file.slug}] ID mismatch with ${defaultLocale}: ${localeId} vs ${enId}`
        );
        totalErrors++;
      }
    }
  }

  for (const locale of locales) {
    const stats = localeStats[locale];
    const fallbackNote =
      locale !== defaultLocale
        ? ` (${stats.foods} foods, ${stats.plants} plants present locally)`
        : "";
    console.log(
      `✓ ${locale}: validated ${stats.foods} food entries and ${stats.plants} plant entries${fallbackNote}.`
    );
  }

  if (totalErrors > 0) {
    console.error(`\nValidation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log("\n✓ Content validation passed for all locales.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
