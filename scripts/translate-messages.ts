import fs from "fs/promises"
import path from "path"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()
const MODEL = "claude-sonnet-4-6"
const MAX_RETRIES = 5
const MAX_TOKENS = 16384
const MIN_REQUEST_INTERVAL_MS = 500

let lastRequestTime = 0

const sourcePath = path.join(process.cwd(), "messages", "en.json")
const targetLocales = ["de", "fr", "ja"] as const
type TargetLocale = (typeof targetLocales)[number]

const instructions: Record<TargetLocale, string> = {
  de: "Translate the UI strings into natural, neutral German (European). Use formal 'Sie' only for direct instructions to the user; otherwise use clear, friendly language suitable for pet owners. Preserve all interpolation placeholders like {name}, {count}, {query}, {alias}, {item} exactly as they appear, including any plural syntax {count, plural, ...}. Keep HTML/JSX-style apostrophes and special characters valid JSON.",
  fr: "Translate the UI strings into natural European French. Use a clear, friendly tone suitable for pet owners. Preserve all interpolation placeholders like {name}, {count}, {query}, {alias}, {item} exactly as they appear, including any plural syntax {count, plural, ...}. Keep HTML/JSX-style apostrophes and special characters valid JSON.",
  ja: "Translate the UI strings into polite, natural Japanese suitable for pet owners. Use 「です/ます」 style. Preserve all interpolation placeholders like {name}, {count}, {query}, {alias}, {item} exactly as they appear, including any plural syntax {count, plural, ...}. Keep HTML/JSX-style apostrophes and special characters valid JSON.",
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRateLimitError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const typed = error as { type?: string; error?: { type?: string } }
  return typed.type === "rate_limit_error" || typed.error?.type === "rate_limit_error"
}

async function translateMessages(locale: TargetLocale, source: string, attempt = 0): Promise<string> {
  try {
    // Enforce a minimum interval between API requests to reduce rate limits.
    const now = Date.now()
    const elapsed = now - lastRequestTime
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
    }
    lastRequestTime = Date.now()

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: `You are a UI translation assistant. ${instructions[locale]}\n\nReturn ONLY the translated JSON object with the exact same structure as the input. Do not include any markdown code fences or explanatory text. Ensure the output is complete, valid JSON.`,
      messages: [
        {
          role: "user",
          content: `Translate the following JSON messages into ${locale}.\n\n${source}`,
        },
      ],
    })

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim()

    // Strip possible markdown fences and any trailing explanation.
    let json = text
      .replace(/^[\s\S]*?```json\s*/, "")
      .replace(/```\s*[\s\S]*$/, "")
      .trim()

    // If there is no code fence, strip any leading explanation before the JSON object.
    const objectStart = json.indexOf("{")
    if (objectStart > 0) {
      json = json.slice(objectStart)
    }

    JSON.parse(json)
    return json
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = (isRateLimitError(error) ? 5000 : 2000) * 2 ** attempt + Math.floor(Math.random() * 1000)
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for ${locale} messages in ${delay}ms`)
      await sleep(delay)
      return translateMessages(locale, source, attempt + 1)
    }
    throw error
  }
}

async function main() {
  const source = await fs.readFile(sourcePath, "utf-8")

  for (const locale of targetLocales) {
    const targetPath = path.join(process.cwd(), "messages", `${locale}.json`)
    console.log(`Translating messages for ${locale}...`)
    const translated = await translateMessages(locale, source)
    await fs.writeFile(targetPath, translated, "utf-8")
    console.log(`  Wrote ${targetPath}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
