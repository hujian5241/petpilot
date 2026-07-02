import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const defaultLocale = "en"
const targetLocales = ["de", "fr", "ja"] as const
type TargetLocale = (typeof targetLocales)[number]

const contentTypes = ["foods", "plants"] as const
type ContentType = (typeof contentTypes)[number]

const MODEL = "claude-sonnet-4-6"
const MAX_CONCURRENCY = 1
const MAX_RETRIES = 5
const MIN_REQUEST_INTERVAL_MS = 500

const systemPrompt = `You are a professional veterinary-content translator. Your task is to translate pet-safety articles from English into the requested locale while preserving every technical and structural detail.

Rules:
- Keep YAML front matter keys exactly as they appear.
- Do NOT translate: id, slug, categories, tags, scientific_name, safety.status, safety.severity, recommendation (avoid/limit/consult_vet), appliesTo, source URLs, lookalikes, alternatives, related_foods, related_plants, image src paths, numeric values, dates, booleans, vet_reviewed, requires_emergency_visit.
- Translate these fields into natural, accurate target-language text: name, aliases, safety.*.summary, symptoms, symptoms_severity.*.symptom, what_to_do, preparation_notes, safe_amount, frequency, dosage_per_weight, notes_for_puppies, notes_for_kittens, condition_warnings.*.condition, condition_warnings.*.reason, condition_warnings.*.notes, nutrition.notes, source names only when they contain descriptive English (keep proper nouns like ASPCA, AKC, AVMA, Pet Poison Helpline, Cornell, MSD Veterinary Manual exactly as-is), meta_title, meta_description, and the Markdown body.
- For German: use formal tone (Sie) only for direct-user instructions; otherwise clear, neutral German. For French: European French. For Japanese: polite, natural Japanese suitable for pet owners; use 「です/ます」 style.
- Localize symptom terms into the target language as plain readable phrases (e.g., "vomiting" -> "Erbrechen" / "vomissements" / "嘔吐").
- Keep aliases useful for search in the target language.
- Preserve Markdown formatting (# headings, lists, bold, links). Do not alter tel: or mailto: links.
- Return ONLY the complete translated Markdown file, starting with --- and ending with the body. Do not include any explanatory text before or after.
- Make sure the returned content is valid YAML front matter followed by valid Markdown.`

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRateLimitError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const typed = error as { type?: string; error?: { type?: string } }
  return typed.type === "rate_limit_error" || typed.error?.type === "rate_limit_error"
}

function retryDelayMs(attempt: number, error: unknown): number {
  const base = isRateLimitError(error) ? 5000 : 2000
  const exponential = base * 2 ** attempt
  const jitter = Math.floor(Math.random() * 1000)
  return exponential + jitter
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
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Translate the following article into ${locale}. Return only the translated Markdown file.\n\n${raw}`,
        },
      ],
    })

    let text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")

    // Sometimes the model prefixes the YAML with a short explanation. Strip
    // everything before the first `---` and any trailing code fence.
    const frontMatterStart = text.indexOf("---")
    if (frontMatterStart === -1) {
      throw new Error(`Model did not return YAML front matter for ${identifier}`)
    }
    if (frontMatterStart > 0) {
      text = text.slice(frontMatterStart)
    }
    text = text.replace(/\s*```\s*$/g, "")

    // Validate that the returned content parses as valid front matter + markdown.
    matter(text)

    return text
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = retryDelayMs(attempt, error)
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for ${identifier} (${locale}) in ${delay}ms: ${(error as Error).message}`)
      await sleep(delay)
      return translateWithRetry(locale, raw, identifier, attempt + 1)
    }
    throw error
  }
}

async function getSourceFiles(type: ContentType): Promise<string[]> {
  const dir = path.join(process.cwd(), "content", defaultLocale, type)
  const files = await fs.readdir(dir)
  return files.filter((file) => file.endsWith(".md")).sort()
}

async function processFile(
  type: ContentType,
  locale: TargetLocale,
  file: string,
  force: boolean
): Promise<{ ok: boolean; type: ContentType; file: string; locale: TargetLocale; error?: string }> {
  const slug = file.replace(/\.md$/, "")
  const sourcePath = path.join(process.cwd(), "content", defaultLocale, type, file)
  const targetPath = path.join(process.cwd(), "content", locale, type, file)
  const identifier = `${locale}:${type}/${slug}`

  if (!force) {
    try {
      await fs.access(targetPath)
      return { ok: true, type, file, locale }
    } catch {
      // target does not exist; proceed
    }
  }

  try {
    const raw = await fs.readFile(sourcePath, "utf-8")
    const translated = await translateWithRetry(locale, raw, identifier)
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, translated, "utf-8")
    return { ok: true, type, file, locale }
  } catch (error) {
    const message = (error as Error).message
    console.error(`  Failed ${identifier}: ${message}`)
    return { ok: false, type, file, locale, error: message }
  }
}

async function runPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  const executing: Promise<void>[] = []

  for (const item of items) {
    const promise = fn(item).then((result) => {
      results.push(result)
    })
    executing.push(promise)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      )
    }
  }

  await Promise.all(executing)
  return results
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const onlyLocale = args.find((arg) => arg.startsWith("--locale="))?.split("=")[1] as TargetLocale | undefined
  const onlyType = args.find((arg) => arg.startsWith("--type="))?.split("=")[1] as ContentType | undefined
  const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1]
  const limit = limitArg ? parseInt(limitArg, 10) : undefined

  const locales = onlyLocale ? [onlyLocale] : targetLocales
  const types = onlyType ? [onlyType] : contentTypes

  const jobs: { type: ContentType; locale: TargetLocale; file: string }[] = []

  for (const type of types) {
    const files = await getSourceFiles(type)
    const limitedFiles = limit ? files.slice(0, limit) : files
    for (const locale of locales) {
      for (const file of limitedFiles) {
        jobs.push({ type, locale, file })
      }
    }
  }

  console.log(`Translating ${jobs.length} files (model: ${MODEL}, concurrency: ${MAX_CONCURRENCY})...`)

  let completed = 0
  let lastRequestTime = 0
  const results = await runPool(jobs, MAX_CONCURRENCY, async (job) => {
    // Enforce a minimum interval between API requests to reduce rate limits.
    const now = Date.now()
    const elapsed = now - lastRequestTime
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
    }
    lastRequestTime = Date.now()

    const result = await processFile(job.type, job.locale, job.file, force)
    completed++
    if (completed % 10 === 0) {
      console.log(`  Progress: ${completed}/${jobs.length}`)
    }
    return result
  })

  const failures = results.filter((r) => !r.ok)
  console.log(`\nDone. ${results.length - failures.length}/${results.length} succeeded.`)

  if (failures.length > 0) {
    console.error("\nFailures:")
    for (const f of failures) {
      console.error(`  ${f.locale}:${f.type}/${f.file} - ${f.error}`)
    }
    // Do not exit with error so partial progress is preserved and the build
    // can still use fallback English content for failed files.
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
