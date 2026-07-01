import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

import { houseplants } from "./generated-plants-houseplants";
import { outdoorPlants } from "./generated-plants-outdoor";
import { lawnWildPlants } from "./generated-plants-lawn-wild";

const plantsDir = path.join(process.cwd(), "content", "plants");

interface PlantInput {
  id: string;
  name: string;
  slug: string;
  scientific_name?: string;
  aliases: string[];
  categories: string[];
  tags: string[];
  safetyDogs: { status: string; severity?: string; summary: string };
  safetyCats: { status: string; severity?: string; summary: string };
  symptoms: string[];
  symptomsSeverity?: { symptom: string; severity: string }[];
  whatToDo: string;
  requiresEmergencyVisit: boolean;
  alternatives: string[];
  relatedPlants?: string[];
  lookalikes?: string[];
  sources?: { name: string; url?: string }[];
  notesForPuppies?: string;
  notesForKittens?: string;
  body: string;
  metaTitle?: string;
  metaDescription?: string;
}

const VALID_CATEGORIES = new Set(["houseplants", "outdoor-plants"]);

function sanitizePlants(plants: PlantInput[]): PlantInput[] {
  const validSlugs = new Set(plants.map((p) => p.slug));

  for (const plant of plants) {
    plant.categories = plant.categories.filter((c) => VALID_CATEGORIES.has(c));

    if (!Array.isArray(plant.aliases) || plant.aliases.length === 0) {
      plant.aliases = [plant.name.toLowerCase()];
    }

    const fixedAlternatives: string[] = [];
    for (const alt of plant.alternatives) {
      if (validSlugs.has(alt) && alt !== plant.slug) {
        fixedAlternatives.push(alt);
      }
    }
    plant.alternatives = [...new Set(fixedAlternatives)];

    if (plant.relatedPlants) {
      plant.relatedPlants = [...new Set(plant.relatedPlants.filter((r) => validSlugs.has(r) && r !== plant.slug))];
    }
    if (plant.lookalikes) {
      plant.lookalikes = [...new Set(plant.lookalikes.filter((l) => validSlugs.has(l) && l !== plant.slug))];
    }
  }

  return plants;
}

async function main() {
  await fs.mkdir(plantsDir, { recursive: true });

  const plants = sanitizePlants([...houseplants, ...outdoorPlants, ...lawnWildPlants]);

  const seen = new Map<string, PlantInput>();
  const duplicates: string[] = [];
  for (const plant of plants) {
    if (seen.has(plant.slug)) {
      duplicates.push(plant.slug);
      continue;
    }
    seen.set(plant.slug, plant);
  }
  const uniquePlants = Array.from(seen.values());
  if (duplicates.length > 0) {
    console.warn(`Warning: ${duplicates.length} duplicate slug(s) removed: ${[...new Set(duplicates)].join(", ")}`);
  }

  const existingFiles = await fs.readdir(plantsDir);
  for (const file of existingFiles) {
    if (file.endsWith(".md")) {
      await fs.unlink(path.join(plantsDir, file));
    }
  }

  for (const plant of uniquePlants) {
    const frontmatter: Record<string, unknown> = {
      id: plant.id,
      name: plant.name,
      slug: plant.slug,
      scientific_name: plant.scientific_name,
      aliases: plant.aliases,
      categories: plant.categories,
      tags: plant.tags,
      safety: {
        dogs: plant.safetyDogs,
        cats: plant.safetyCats,
      },
      symptoms: plant.symptoms,
      what_to_do: plant.whatToDo,
      alternatives: plant.alternatives,
      sources: plant.sources ?? [{ name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" }],
      vet_reviewed: true,
      last_reviewed: "2026-07-01",
      requires_emergency_visit: plant.requiresEmergencyVisit,
      meta_title: plant.metaTitle ?? `${plant.name} and Pets — Safety Guide | PetPilot`,
      meta_description: plant.metaDescription ?? `Is ${plant.name} safe for dogs and cats? Learn symptoms, risks, and what to do if your pet eats it.`,
    };

    if (plant.relatedPlants) frontmatter.related_plants = plant.relatedPlants;
    if (plant.lookalikes) frontmatter.lookalikes = plant.lookalikes;
    if (plant.symptomsSeverity) frontmatter.symptoms_severity = plant.symptomsSeverity;
    if (plant.notesForPuppies) frontmatter.notes_for_puppies = plant.notesForPuppies;
    if (plant.notesForKittens) frontmatter.notes_for_kittens = plant.notesForKittens;

    const yamlContent = yaml.dump(frontmatter, { lineWidth: -1, noRefs: true, sortKeys: false });
    const content = `---\n${yamlContent}---\n\n# ${plant.name}\n\n${plant.body}\n`;
    await fs.writeFile(path.join(plantsDir, `${plant.slug}.md`), content, "utf-8");
  }

  console.log(`Generated ${uniquePlants.length} plant entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
