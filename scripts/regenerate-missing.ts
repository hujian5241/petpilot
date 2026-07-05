import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = "claude-sonnet-4-6";
const MAX_RETRIES = 3;
const MIN_REQUEST_INTERVAL_MS = 500;

interface SeedEntry {
  type: "medications" | "household-chemicals" | "pesticides";
  slug: string;
  name: string;
  aliases: string[];
  categories: string[];
  tags: string[];
  notes?: string;
}

const targets: SeedEntry[] = [
  {
    type: "medications",
    slug: "bisacodyl",
    name: "Bisacodyl",
    aliases: ["Dulcolax"],
    categories: ["human-medications"],
    tags: ["otc", "laxative"],
    notes: "Can cause severe cramping and electrolyte imbalance.",
  },
  {
    type: "medications",
    slug: "furosemide",
    name: "Furosemide",
    aliases: ["Lasix"],
    categories: ["human-medications", "heart-blood-pressure"],
    tags: ["prescription", "diuretic"],
    notes: "Causes dehydration and electrolyte imbalances.",
  },
  {
    type: "household-chemicals",
    slug: "rubbing-alcohol",
    name: "Rubbing Alcohol",
    aliases: ["isopropyl alcohol", "isopropanol"],
    categories: ["personal-care-products", "cleaning-products"],
    tags: ["disinfectant", "alcohol"],
    notes: "Causes vomiting, ataxia, respiratory depression, hypoglycemia.",
  },
];

const systemPrompt = `You are a veterinary toxicology content writer for PetPilot, a pet safety website. Your task is to write accurate, responsible Markdown articles about medications, household chemicals, and pesticides that may be toxic to dogs and cats.

Rules:
- Output ONLY a valid Markdown file with YAML front matter between --- lines, followed by a brief Markdown body.
- Use these exact front matter keys and types:
  - id: string
  - name: string
  - slug: string
  - aliases: string[]
  - categories: string[]
  - tags: string[]
  - safety: { dogs: { status, severity, summary }, cats: { status, severity, summary } } where status is one of safe/limited/toxic/unknown and severity is one of low/moderate/high/critical.
  - symptoms: string[]
  - what_to_do: string (concise emergency instructions)
  - requires_emergency_visit: boolean
  - alternatives: string[] (slugs of safer alternatives, e.g. ["vet-prescribed-pain-relief"])
  - active_ingredients: string[] (required for medications and pesticides; optional for household chemicals)
  - sources: [{ name, url }]
  - vet_reviewed: boolean (always false)
  - last_reviewed: YYYY-MM-DD
  - meta_title: string
  - meta_description: string
- Add type-specific fields when relevant:
  - medications: brand_names, dosage_form, common_uses, toxic_ingredients, is_veterinary, requires_prescription
  - household-chemicals: common_products, room, ventilation_notes, dilution_warning, contains_bleach, contains_ammonia, contains_phenols
  - pesticides: pest_targeted, formulation, signal_word (caution/warning/danger), application_area, epa_registration_number
- The Markdown body should be 2-4 short paragraphs with a clear warning, how exposure happens, and prevention tips.
- Be accurate and conservative. If unsure, mark status as unknown or limited rather than safe.
- Do not invent EPA registration numbers; either omit or use a placeholder like "EPA Reg. No. varies by product".
- Keep all summaries factual and avoid minimizing risk.`;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateMarkdown(seed: SeedEntry, attempt = 0): Promise<string> {
  const identifier = `${seed.type}/${seed.slug}`;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Write a complete Markdown article for PetPilot with YAML front matter for the following item:

Type: ${seed.type}
Name: ${seed.name}
Slug: ${seed.slug}
Aliases: ${seed.aliases.join(", ")}
Categories: ${seed.categories.join(", ")}
Tags: ${seed.tags.join(", ")}
Notes: ${seed.notes || ""}

Include the field
content: |
  <2-4 paragraphs of Markdown body>
in the front matter. Return only the Markdown file.`,
        },
      ],
    });

    let text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("");

    const frontMatterStart = text.indexOf("---");
    if (frontMatterStart === -1) {
      throw new Error(`Model did not return YAML front matter for ${identifier}`);
    }
    if (frontMatterStart > 0) {
      text = text.slice(frontMatterStart);
    }
    text = text.replace(/\s*```\s*$/g, "");

    matter(text);
    return text;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * 2 ** attempt + Math.floor(Math.random() * 1000);
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for ${identifier} in ${delay}ms`);
      await sleep(delay);
      return generateMarkdown(seed, attempt + 1);
    }
    throw error;
  }
}

async function main() {
  let lastRequestTime = 0;

  for (const seed of targets) {
    const targetPath = path.join(process.cwd(), "content", "en", seed.type, `${seed.slug}.md`);

    // Remove broken existing file.
    try {
      await fs.unlink(targetPath);
      console.log(`Removed broken ${seed.type}/${seed.slug}`);
    } catch {
      // may not exist
    }

    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
    lastRequestTime = Date.now();

    try {
      const markdown = await generateMarkdown(seed);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, markdown, "utf-8");
      console.log(`Regenerated ${seed.type}/${seed.slug}`);
    } catch (error) {
      console.error(`Failed ${seed.type}/${seed.slug}: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
