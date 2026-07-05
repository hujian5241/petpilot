import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = "claude-sonnet-4-6";
const MAX_RETRIES = 2;
const MIN_REQUEST_INTERVAL_MS = 1500;

const targetLocales = ["de", "fr", "ja"] as const;
type TargetLocale = (typeof targetLocales)[number];

const systemPrompt = `You are a professional veterinary-content translator. Your task is to translate pet-safety articles from English into the requested locale while preserving every technical and structural detail.

Rules:
- Keep YAML front matter keys exactly as they appear.
- Do NOT translate: id, slug, categories, tags, scientific_name, safety.status, safety.severity, recommendation (avoid/limit/consult_vet), appliesTo, source URLs, lookalikes, alternatives, related_foods, related_plants, image src paths, numeric values, dates, booleans, vet_reviewed, requires_emergency_visit, active_ingredients, brand_names, dosage_form, toxic_ingredients, is_veterinary, requires_prescription, common_products, room, contains_bleach, contains_ammonia, contains_phenols, pest_targeted, formulation, signal_word, application_area, epa_registration_number.
- Translate these fields into natural, accurate target-language text: name, aliases, safety.*.summary, symptoms, symptoms_severity.*.symptom, what_to_do, preparation_notes, safe_amount, frequency, dosage_per_weight, notes_for_puppies, notes_for_kittens, condition_warnings.*.condition, condition_warnings.*.reason, condition_warnings.*.notes, nutrition.notes, common_uses, ventilation_notes, dilution_warning, meta_title, meta_description, and the Markdown body.
- For German: use formal tone (Sie) only for direct-user instructions; otherwise clear, neutral German. For French: European French. For Japanese: polite, natural Japanese suitable for pet owners; use 「です/ます」 style.
- Localize symptom terms into the target language as plain readable phrases (e.g., "vomiting" -> "Erbrechen" / "vomissements" / "嘔吐").
- Keep aliases useful for search in the target language.
- Preserve Markdown formatting (# headings, lists, bold, links). Do not alter tel: or mailto: links.
- Return ONLY the complete translated Markdown file, starting with --- and ending with the body. Do not include any explanatory text before or after.
- Make sure the returned content is valid YAML front matter followed by valid Markdown.`;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithRetry(
  locale: TargetLocale,
  raw: string,
  identifier: string,
  attempt = 0
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 6000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Translate the following article into ${locale}. Return ONLY the complete translated Markdown file, starting with --- and ending with the Markdown body. Do not include any explanatory text before or after.\n\n${raw}`,
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
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for ${identifier} in ${delay}ms: ${(error as Error).message}`);
      await sleep(delay);
      return translateWithRetry(locale, raw, identifier, attempt + 1);
    }
    throw error;
  }
}

interface Job {
  type: string;
  slug: string;
  locale: TargetLocale;
}

async function main() {
  const args = process.argv.slice(2);
  const jobs: Job[] = [];

  for (const arg of args) {
    const match = arg.match(/^(.+):(.+)$/);
    if (!match) {
      console.error(`Invalid job format: ${arg}. Expected type:slug`);
      process.exit(1);
    }
    const [, type, slug] = match as [string, string, string];
    for (const locale of targetLocales) {
      jobs.push({ type, slug, locale });
    }
  }

  if (jobs.length === 0) {
    console.log("Usage: tsx scripts/translate-specific.ts medications:bisacodyl household-chemicals:glue");
    process.exit(0);
  }

  console.log(`Translating ${jobs.length} files...`);
  let lastRequestTime = 0;

  for (const job of jobs) {
    const sourcePath = path.join(process.cwd(), "content", "en", job.type, `${job.slug}.md`);
    const targetPath = path.join(process.cwd(), "content", job.locale, job.type, `${job.slug}.md`);
    const identifier = `${job.locale}:${job.type}/${job.slug}`;

    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
    lastRequestTime = Date.now();

    try {
      const raw = await fs.readFile(sourcePath, "utf-8");
      const translated = await translateWithRetry(job.locale, raw, identifier);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, translated, "utf-8");
      console.log(`  Translated ${identifier}`);
    } catch (error) {
      console.error(`  Failed ${identifier}: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
