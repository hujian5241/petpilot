import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { getAllCategories } from "../lib/content";
import { locales, defaultLocale, type Locale } from "../lib/i18n";
import type {
  FoodEntry,
  HouseholdChemicalEntry,
  MedicationEntry,
  PesticideEntry,
  PlantEntry,
  SafetyStatus,
  Severity,
  Species,
} from "../lib/types";

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
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide";
  locale: Locale;
  validCategorySlugs: Set<string>;
  validSlugs: Set<string>;
}

type EntryUnion = Partial<FoodEntry> | Partial<PlantEntry> | Partial<MedicationEntry> | Partial<HouseholdChemicalEntry> | Partial<PesticideEntry>;

function collectErrors(
  entry: EntryUnion,
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

  if (ctx.type === "medication") {
    const medication = entry as Partial<MedicationEntry>;

    if (!Array.isArray(medication.active_ingredients) || medication.active_ingredients.length === 0) {
      errors.push(`${prefix} Missing or invalid required field: active_ingredients`);
    }
    if (medication.brand_names !== undefined && !Array.isArray(medication.brand_names)) {
      errors.push(`${prefix} Invalid optional field: brand_names`);
    }
    if (medication.common_uses !== undefined && !Array.isArray(medication.common_uses)) {
      errors.push(`${prefix} Invalid optional field: common_uses`);
    }
    if (medication.toxic_ingredients !== undefined && !Array.isArray(medication.toxic_ingredients)) {
      errors.push(`${prefix} Invalid optional field: toxic_ingredients`);
    }
  }

  if (ctx.type === "household-chemical") {
    const chemical = entry as Partial<HouseholdChemicalEntry>;

    if (chemical.active_ingredients !== undefined && !Array.isArray(chemical.active_ingredients)) {
      errors.push(`${prefix} Invalid optional field: active_ingredients`);
    }
    if (chemical.common_products !== undefined && !Array.isArray(chemical.common_products)) {
      errors.push(`${prefix} Invalid optional field: common_products`);
    }
  }

  if (ctx.type === "pesticide") {
    const pesticide = entry as Partial<PesticideEntry>;

    if (!Array.isArray(pesticide.active_ingredients) || pesticide.active_ingredients.length === 0) {
      errors.push(`${prefix} Missing or invalid required field: active_ingredients`);
    }
    if (pesticide.pest_targeted !== undefined && !Array.isArray(pesticide.pest_targeted)) {
      errors.push(`${prefix} Invalid optional field: pest_targeted`);
    }
    if (pesticide.signal_word !== undefined && !["caution", "warning", "danger"].includes(pesticide.signal_word)) {
      errors.push(`${prefix} Invalid optional field: signal_word`);
    }
  }

  return errors;
}

async function validateDirectory(
  dir: string,
  type: "food" | "plant" | "medication" | "household-chemical" | "pesticide",
  locale: Locale,
  validCategorySlugs: Set<string>,
  validSlugs: Set<string>
): Promise<{ errors: number; files: number }> {
  const files = await loadMarkdownFiles(dir);
  const ctx: ValidationContext = { type, locale, validCategorySlugs, validSlugs };
  let totalErrors = 0;

  for (const file of files) {
    const entry = (file.data ?? {}) as EntryUnion;
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

  const typeConfigs = [
    { key: "foods", type: "food" as const, dirName: "foods" },
    { key: "plants", type: "plant" as const, dirName: "plants" },
    { key: "medications", type: "medication" as const, dirName: "medications" },
    { key: "householdChemicals", type: "household-chemical" as const, dirName: "household-chemicals" },
    { key: "pesticides", type: "pesticide" as const, dirName: "pesticides" },
  ];

  type TypeKey = (typeof typeConfigs)[number]["key"];

  let totalErrors = 0;
  const localeStats: Record<Locale, Record<TypeKey, number>> = {} as Record<
    Locale,
    Record<TypeKey, number>
  >;
  const slugIndex: Record<Locale, Record<TypeKey, Set<string>>> = {} as Record<
    Locale,
    Record<TypeKey, Set<string>>
  >;

  // Validate each locale independently.
  for (const locale of locales) {
    const localeResults: Record<TypeKey, { errors: number; files: number }> = {} as Record<
      TypeKey,
      { errors: number; files: number }
    >;

    for (const config of typeConfigs) {
      const dir = path.join(contentDir(locale), config.dirName);
      const files = await loadMarkdownFiles(dir);
      const validSlugs = new Set(files.map((f) => f.slug));

      if (!slugIndex[locale]) {
        slugIndex[locale] = {} as Record<TypeKey, Set<string>>;
      }
      slugIndex[locale][config.key] = validSlugs;

      const referenceSlugs =
        locale === defaultLocale
          ? validSlugs
          : new Set([
              ...validSlugs,
              ...(slugIndex[defaultLocale]?.[config.key] ?? new Set()),
            ]);

      const result = await validateDirectory(
        dir,
        config.type,
        locale,
        validCategorySlugs,
        referenceSlugs
      );
      localeResults[config.key] = result;
      totalErrors += result.errors;
    }

    localeStats[locale] = Object.fromEntries(
      typeConfigs.map((config) => [config.key, localeResults[config.key]!.files])
    ) as Record<TypeKey, number>;
  }

  // Cross-locale consistency: report missing translations (warn only).
  for (const locale of locales) {
    if (locale === defaultLocale) continue;

    for (const config of typeConfigs) {
      const enSlugs = slugIndex[defaultLocale]![config.key]!;
      const missing = [...enSlugs].filter(
        (slug) => !slugIndex[locale]![config.key]!.has(slug)
      );
      for (const slug of missing) {
        console.warn(
          `[${locale}:${config.type}:${slug}] Missing translation (falling back to ${defaultLocale}).`
        );
      }
    }
  }

  // Validate id/slug consistency across locales.
  for (const locale of locales) {
    if (locale === defaultLocale) continue;

    for (const config of typeConfigs) {
      const enFiles = await loadMarkdownFiles(
        path.join(contentDir(defaultLocale), config.dirName)
      );
      const localeFiles = await loadMarkdownFiles(
        path.join(contentDir(locale), config.dirName)
      );
      const enBySlug = new Map(enFiles.map((f) => [f.slug, f.data]));

      for (const file of localeFiles) {
        const enData = enBySlug.get(file.slug);
        if (!enData) continue;
        const enId = (enData as { id?: string }).id;
        const localeId = (file.data as { id?: string }).id;
        if (enId !== localeId) {
          console.error(
            `[${locale}:${config.type}:${file.slug}] ID mismatch with ${defaultLocale}: ${localeId} vs ${enId}`
          );
          totalErrors++;
        }
      }
    }
  }

  for (const locale of locales) {
    const stats = localeStats[locale];
    const entries = typeConfigs
      .map((config) => `${stats[config.key]} ${config.dirName}`)
      .join(", ");
    const fallbackNote =
      locale !== defaultLocale ? " (entries present locally)" : "";
    console.log(
      `✓ ${locale}: validated ${entries}${fallbackNote}.`
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
