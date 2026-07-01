import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import { getAllCategories } from "../lib/content";
import type { FoodEntry, PlantEntry, SafetyStatus, Severity, Species } from "../lib/types";

const FOODS_DIR = path.join(process.cwd(), "content", "foods");
const PLANTS_DIR = path.join(process.cwd(), "content", "plants");

const SAFETY_STATUSES: SafetyStatus[] = ["safe", "limited", "toxic", "unknown"];
const SEVERITIES: (Severity | undefined)[] = ["low", "moderate", "high", "critical", undefined];
const SPECIES: Species[] = ["dogs", "cats"];

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
}

interface ValidationContext {
  type: "food" | "plant";
  validCategorySlugs: Set<string>;
  validSlugs: Set<string>;
}

function collectErrors(
  entry: Partial<FoodEntry> | Partial<PlantEntry>,
  slug: string,
  ctx: ValidationContext
): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(entry.id)) errors.push(`[${ctx.type}:${slug}] Missing required field: id`);
  if (!isNonEmptyString(entry.name)) errors.push(`[${ctx.type}:${slug}] Missing required field: name`);
  if (!isNonEmptyString(entry.slug)) errors.push(`[${ctx.type}:${slug}] Missing required field: slug`);
  if (isNonEmptyString(entry.slug) && entry.slug !== slug) {
    errors.push(`[${ctx.type}:${slug}] Slug mismatch: frontmatter says "${entry.slug}"`);
  }

  if (!Array.isArray(entry.aliases) || entry.aliases.length === 0) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: aliases`);
  }
  if (!Array.isArray(entry.categories) || entry.categories.length === 0) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: categories`);
  } else {
    for (const category of entry.categories) {
      if (!ctx.validCategorySlugs.has(category)) {
        errors.push(`[${ctx.type}:${slug}] Unknown category: ${category}`);
      }
    }
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: tags`);
  }
  if (!Array.isArray(entry.symptoms)) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: symptoms`);
  }
  if (!Array.isArray(entry.alternatives)) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: alternatives`);
  } else {
    for (const alternative of entry.alternatives) {
      if (!ctx.validSlugs.has(alternative)) {
        errors.push(`[${ctx.type}:${slug}] Unknown alternative slug: ${alternative}`);
      }
    }
  }
  if (!Array.isArray(entry.sources) || entry.sources.length === 0) {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: sources`);
  } else {
    for (const source of entry.sources) {
      if (typeof source?.name !== "string" || source.name.trim().length === 0) {
        errors.push(`[${ctx.type}:${slug}] Source missing name`);
      }
    }
  }

  if (!entry.safety || typeof entry.safety !== "object") {
    errors.push(`[${ctx.type}:${slug}] Missing required field: safety`);
  } else {
    for (const species of SPECIES) {
      const info = entry.safety[species];
      if (!info || typeof info !== "object") {
        errors.push(`[${ctx.type}:${slug}] Missing safety info for ${species}`);
        continue;
      }
      if (!SAFETY_STATUSES.includes(info.status)) {
        errors.push(`[${ctx.type}:${slug}] Invalid safety status for ${species}: ${info.status}`);
      }
      if (!SEVERITIES.includes(info.severity)) {
        errors.push(`[${ctx.type}:${slug}] Invalid severity for ${species}: ${info.severity}`);
      }
      if (!isNonEmptyString(info.summary)) {
        errors.push(`[${ctx.type}:${slug}] Missing safety summary for ${species}`);
      }
    }
  }

  if (!isNonEmptyString(entry.what_to_do)) {
    errors.push(`[${ctx.type}:${slug}] Missing required field: what_to_do`);
  }

  if (typeof entry.vet_reviewed !== "boolean") {
    errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: vet_reviewed`);
  }

  if (!isNonEmptyString(entry.last_reviewed) || !isValidDate(entry.last_reviewed)) {
    errors.push(`[${ctx.type}:${slug}] Invalid last_reviewed date: ${entry.last_reviewed}`);
  }

  if (ctx.type === "food") {
    const food = entry as Partial<FoodEntry>;

    if (typeof food.requires_emergency_visit !== "boolean") {
      errors.push(`[${ctx.type}:${slug}] Missing or invalid required field: requires_emergency_visit`);
    }

    if (food.preparation_notes !== undefined && !isNonEmptyString(food.preparation_notes)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: preparation_notes`);
    }
    if (food.safe_amount !== undefined && !isNonEmptyString(food.safe_amount)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: safe_amount`);
    }
    if (food.frequency !== undefined && !isNonEmptyString(food.frequency)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: frequency`);
    }
    if (food.dosage_per_weight !== undefined && !isNonEmptyString(food.dosage_per_weight)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: dosage_per_weight`);
    }
    if (food.notes_for_puppies !== undefined && !isNonEmptyString(food.notes_for_puppies)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: notes_for_puppies`);
    }
    if (food.notes_for_kittens !== undefined && !isNonEmptyString(food.notes_for_kittens)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: notes_for_kittens`);
    }

    if (food.symptoms_severity !== undefined) {
      if (!Array.isArray(food.symptoms_severity)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: symptoms_severity`);
      } else {
        for (const item of food.symptoms_severity) {
          if (!isNonEmptyString(item?.symptom)) {
            errors.push(`[${ctx.type}:${slug}] symptoms_severity item missing symptom`);
          }
          if (!SEVERITIES.includes(item?.severity)) {
            errors.push(`[${ctx.type}:${slug}] symptoms_severity item has invalid severity: ${item?.severity}`);
          }
        }
      }
    }

    if (food.related_foods !== undefined) {
      if (!Array.isArray(food.related_foods)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: related_foods`);
      } else {
        for (const related of food.related_foods) {
          if (!ctx.validSlugs.has(related)) {
            errors.push(`[${ctx.type}:${slug}] Unknown related_foods slug: ${related}`);
          }
        }
      }
    }

    if (food.lookalikes !== undefined) {
      if (!Array.isArray(food.lookalikes)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: lookalikes`);
      }
    }

    if (food.condition_warnings !== undefined) {
      if (!Array.isArray(food.condition_warnings)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: condition_warnings`);
      } else {
        for (const item of food.condition_warnings) {
          if (!isNonEmptyString(item?.condition)) {
            errors.push(`[${ctx.type}:${slug}] condition_warnings item missing condition`);
          }
          if (!isNonEmptyString(item?.reason)) {
            errors.push(`[${ctx.type}:${slug}] condition_warnings item missing reason`);
          }
          if (!["avoid", "limit", "consult_vet"].includes(item?.recommendation)) {
            errors.push(`[${ctx.type}:${slug}] condition_warnings item has invalid recommendation: ${item?.recommendation}`);
          }
          if (!Array.isArray(item?.appliesTo)) {
            errors.push(`[${ctx.type}:${slug}] condition_warnings item missing appliesTo`);
          } else {
            for (const species of item.appliesTo) {
              if (!SPECIES.includes(species as Species)) {
                errors.push(`[${ctx.type}:${slug}] condition_warnings item has invalid appliesTo species: ${species}`);
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
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: requires_emergency_visit`);
    }

    if (plant.symptoms_severity !== undefined) {
      if (!Array.isArray(plant.symptoms_severity)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: symptoms_severity`);
      } else {
        for (const item of plant.symptoms_severity) {
          if (!isNonEmptyString(item?.symptom)) {
            errors.push(`[${ctx.type}:${slug}] symptoms_severity item missing symptom`);
          }
          if (!SEVERITIES.includes(item?.severity)) {
            errors.push(`[${ctx.type}:${slug}] symptoms_severity item has invalid severity: ${item?.severity}`);
          }
        }
      }
    }

    if (plant.lookalikes !== undefined) {
      if (!Array.isArray(plant.lookalikes)) {
        errors.push(`[${ctx.type}:${slug}] Invalid optional field: lookalikes`);
      }
    }

    if (plant.notes_for_puppies !== undefined && !isNonEmptyString(plant.notes_for_puppies)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: notes_for_puppies`);
    }
    if (plant.notes_for_kittens !== undefined && !isNonEmptyString(plant.notes_for_kittens)) {
      errors.push(`[${ctx.type}:${slug}] Invalid optional field: notes_for_kittens`);
    }
  }

  return errors;
}

async function validateDirectory(
  dir: string,
  type: "food" | "plant",
  validCategorySlugs: Set<string>,
  validSlugs: Set<string>
): Promise<number> {
  const files = await loadMarkdownFiles(dir);
  const ctx: ValidationContext = { type, validCategorySlugs, validSlugs };
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

  return totalErrors;
}

async function main() {
  const categories = await getAllCategories();
  const validCategorySlugs = new Set(categories.map((c) => c.slug));

  const [foodFiles, plantFiles] = await Promise.all([
    loadMarkdownFiles(FOODS_DIR),
    loadMarkdownFiles(PLANTS_DIR),
  ]);

  const validFoodSlugs = new Set(foodFiles.map((f) => f.slug));
  const validPlantSlugs = new Set(plantFiles.map((f) => f.slug));

  // Foods can reference foods; plants can reference plants.
  const foodErrors = await validateDirectory(FOODS_DIR, "food", validCategorySlugs, validFoodSlugs);
  const plantErrors = await validateDirectory(
    PLANTS_DIR,
    "plant",
    validCategorySlugs,
    validPlantSlugs
  );

  const totalErrors = foodErrors + plantErrors;

  if (totalErrors > 0) {
    console.error(`\nValidation failed with ${totalErrors} error(s).`);
    process.exit(1);
  }

  console.log(
    `✓ Validated ${foodFiles.length} food entries and ${plantFiles.length} plant entries.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
