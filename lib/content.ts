import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import gfm from "remark-gfm"
import sanitize from "rehype-sanitize"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"

import type {
  Category,
  EmergencyInfo,
  FoodEntry,
  GuideCategory,
  GuideEntry,
  HouseholdChemicalEntry,
  MedicationEntry,
  PesticideEntry,
  PlantEntry,
  RelatedEntry,
  RelatedItem,
  SafetyStatus,
  SiteConfig,
} from "./types"
import { defaultLocale, type Locale } from "./locales"

function contentDir(locale: Locale): string {
  return path.join(process.cwd(), "content", locale)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readFileWithFallback(
  locale: Locale,
  relativePath: string
): Promise<string | undefined> {
  const localizedPath = path.join(contentDir(locale), relativePath)
  if (await fileExists(localizedPath)) {
    return fs.readFile(localizedPath, "utf-8")
  }

  if (locale !== defaultLocale) {
    const fallbackPath = path.join(contentDir(defaultLocale), relativePath)
    if (await fileExists(fallbackPath)) {
      return fs.readFile(fallbackPath, "utf-8")
    }
  }

  return undefined
}

export { fileExists }

async function readJsonWithFallback<T>(locale: Locale, relativePath: string): Promise<T> {
  const content = await readFileWithFallback(locale, relativePath)
  if (!content) {
    throw new Error(`Missing content file: ${relativePath} for locale ${locale}`)
  }
  return JSON.parse(content) as T
}

export async function getSiteConfig(locale: Locale = defaultLocale): Promise<SiteConfig> {
  return readJsonWithFallback<SiteConfig>(locale, "site.json")
}

export async function getAllCategories(locale: Locale = defaultLocale): Promise<Category[]> {
  const categories = await readJsonWithFallback<Category[]>(locale, "categories.json")
  return categories.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Category | undefined> {
  const categories = await getAllCategories(locale)
  return categories.find((category) => category.slug === slug)
}

export async function getEmergencyInfo(locale: Locale = defaultLocale): Promise<EmergencyInfo> {
  return readJsonWithFallback<EmergencyInfo>(locale, "emergency.json")
}

export type ContentType = "foods" | "plants" | "medications" | "household-chemicals" | "pesticides"

async function getSlugs(type: ContentType, locale: Locale = defaultLocale): Promise<string[]> {
  const dir = path.join(contentDir(locale), type)

  if (!(await fileExists(dir))) {
    return []
  }

  const files = await fs.readdir(dir)
  return files.filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, ""))
}

export { getSlugs }

async function parseMarkdownEntry<T extends { slug: string; content?: string }>(
  locale: Locale,
  type: ContentType,
  slug: string
): Promise<T | undefined> {
  const content = await readFileWithFallback(locale, path.join(type, `${slug}.md`))
  if (!content) return undefined

  const { data, content: body } = matter(content)

  const processedContent = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(body)

  return {
    ...(data as Omit<T, "content" | "slug">),
    slug,
    content: processedContent.toString(),
  } as T
}

async function getAllEntries<T extends { slug: string; name: string; categories: string[]; content?: string }>(
  type: ContentType,
  locale: Locale
): Promise<T[]> {
  const slugs = await getSlugs(type, defaultLocale)
  const entries = await Promise.all(slugs.map((slug) => parseMarkdownEntry<T>(locale, type, slug)))
  return (entries.filter((entry) => entry !== undefined) as T[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

async function getEntriesByCategory<T extends { slug: string; name: string; categories: string[]; content?: string }>(
  type: ContentType,
  categorySlug: string,
  locale: Locale
): Promise<T[]> {
  const entries = await getAllEntries<T>(type, locale)
  return entries.filter((entry) => entry.categories.includes(categorySlug))
}

export async function getFoodSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("foods", defaultLocale)
}

export async function getPlantSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("plants", defaultLocale)
}

export async function getMedicationSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("medications", defaultLocale)
}

export async function getHouseholdChemicalSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("household-chemicals", defaultLocale)
}

export async function getPesticideSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("pesticides", defaultLocale)
}

export async function getAllFoods(locale: Locale = defaultLocale): Promise<FoodEntry[]> {
  return getAllEntries<FoodEntry>("foods", locale)
}

export async function getFoodBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<FoodEntry | undefined> {
  return parseMarkdownEntry<FoodEntry>(locale, "foods", slug)
}

export async function getFoodsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<FoodEntry[]> {
  return getEntriesByCategory<FoodEntry>("foods", categorySlug, locale)
}

export async function getAllGuides(locale: Locale = defaultLocale): Promise<GuideEntry[]> {
  const dir = path.join(contentDir(locale), "guides")
  if (!(await fileExists(dir))) {
    return []
  }
  const slugs = await getSlugs("guides" as ContentType, defaultLocale)
  const entries = await Promise.all(slugs.map((slug) => parseMarkdownEntry<GuideEntry>(locale, "guides" as ContentType, slug)))
  return (entries.filter((entry) => entry !== undefined) as GuideEntry[]).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )
}

export async function getGuideSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  const dir = path.join(contentDir(defaultLocale), "guides")
  if (!(await fileExists(dir))) {
    return []
  }
  return getSlugs("guides" as ContentType, defaultLocale)
}

export async function getGuideBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<GuideEntry | undefined> {
  return parseMarkdownEntry<GuideEntry>(locale, "guides" as ContentType, slug)
}

export async function getAllGuideCategories(locale: Locale = defaultLocale): Promise<GuideCategory[]> {
  return readJsonWithFallback<GuideCategory[]>(locale, "guide-categories.json")
}

export async function getAllPlants(locale: Locale = defaultLocale): Promise<PlantEntry[]> {
  return getAllEntries<PlantEntry>("plants", locale)
}

export async function getPlantBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<PlantEntry | undefined> {
  return parseMarkdownEntry<PlantEntry>(locale, "plants", slug)
}

export async function getPlantsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<PlantEntry[]> {
  return getEntriesByCategory<PlantEntry>("plants", categorySlug, locale)
}

export async function getAllMedications(locale: Locale = defaultLocale): Promise<MedicationEntry[]> {
  return getAllEntries<MedicationEntry>("medications", locale)
}

export async function getMedicationBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<MedicationEntry | undefined> {
  return parseMarkdownEntry<MedicationEntry>(locale, "medications", slug)
}

export async function getMedicationsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<MedicationEntry[]> {
  return getEntriesByCategory<MedicationEntry>("medications", categorySlug, locale)
}

export async function getAllHouseholdChemicals(
  locale: Locale = defaultLocale
): Promise<HouseholdChemicalEntry[]> {
  return getAllEntries<HouseholdChemicalEntry>("household-chemicals", locale)
}

export async function getHouseholdChemicalBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<HouseholdChemicalEntry | undefined> {
  return parseMarkdownEntry<HouseholdChemicalEntry>(locale, "household-chemicals", slug)
}

export async function getHouseholdChemicalsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<HouseholdChemicalEntry[]> {
  return getEntriesByCategory<HouseholdChemicalEntry>("household-chemicals", categorySlug, locale)
}

export async function getAllPesticides(locale: Locale = defaultLocale): Promise<PesticideEntry[]> {
  return getAllEntries<PesticideEntry>("pesticides", locale)
}

export async function getPesticideBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<PesticideEntry | undefined> {
  return parseMarkdownEntry<PesticideEntry>(locale, "pesticides", slug)
}

export async function getPesticidesByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<PesticideEntry[]> {
  return getEntriesByCategory<PesticideEntry>("pesticides", categorySlug, locale)
}

export function getCategoryDisplayName(categories: Category[], slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug
}

export async function getPageMarkdown(
  locale: Locale,
  page: "about" | "terms" | "privacy"
): Promise<{ title: string; content: string } | undefined> {
  const raw = await readFileWithFallback(locale, path.join("pages", `${page}.md`))
  if (!raw) return undefined

  const { data, content: body } = matter(raw)

  const processedContent = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(body)

  return {
    title: (data.title as string) ?? page,
    content: processedContent.toString(),
  }
}

const routePrefixByType: Record<
  "food" | "plant" | "medication" | "household-chemical" | "pesticide",
  ContentType
> = {
  food: "foods",
  plant: "plants",
  medication: "medications",
  "household-chemical": "household-chemicals",
  pesticide: "pesticides",
}

function getTypePrefix(type: RelatedItem["type"]): string {
  return routePrefixByType[type]
}

const statusPriority: Record<SafetyStatus, number> = {
  toxic: 0,
  limited: 1,
  unknown: 2,
  safe: 3,
}

export async function findRelatedEntries(
  entry: RelatedEntry,
  locale: Locale,
  limit = 6
): Promise<RelatedItem[]> {
  const [foods, plants, medications, householdChemicals, pesticides] = await Promise.all([
    getAllFoods(locale),
    getAllPlants(locale),
    getAllMedications(locale),
    getAllHouseholdChemicals(locale),
    getAllPesticides(locale),
  ])

  const allEntries: { item: RelatedEntry; type: RelatedItem["type"] }[] = [
    ...foods.map((item) => ({ item, type: "food" as const })),
    ...plants.map((item) => ({ item, type: "plant" as const })),
    ...medications.map((item) => ({ item, type: "medication" as const })),
    ...householdChemicals.map((item) => ({ item, type: "household-chemical" as const })),
    ...pesticides.map((item) => ({ item, type: "pesticide" as const })),
  ]

  const scored = allEntries
    .filter(({ item }) => item.slug !== entry.slug)
    .map(({ item, type }) => {
      const categoryMatches = item.categories.filter((c) => entry.categories.includes(c)).length
      const tagMatches = item.tags.filter((t) => entry.tags.includes(t)).length
      const priority = Math.min(
        statusPriority[item.safety.dogs.status],
        statusPriority[item.safety.cats.status]
      )
      return {
        item,
        type,
        score: categoryMatches * 3 + tagMatches * 2 - priority,
      }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)

  return scored.map(({ item, type }) => ({
    slug: item.slug,
    name: item.name,
    type,
    summary: item.safety.dogs.summary,
    safetyDogs: item.safety.dogs.status,
    safetyCats: item.safety.cats.status,
    image: item.images?.[0],
  }))
}
