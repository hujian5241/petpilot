import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import gfm from "remark-gfm"
import sanitize from "rehype-sanitize"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"

import type { Category, EmergencyInfo, FoodEntry, PlantEntry, SiteConfig } from "./types"
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

async function getSlugs(
  type: "foods" | "plants",
  locale: Locale = defaultLocale
): Promise<string[]> {
  const dir = path.join(contentDir(locale), type)

  if (!(await fileExists(dir))) {
    return []
  }

  const files = await fs.readdir(dir)
  return files.filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, ""))
}

export async function getFoodSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  // Use default locale as the source of truth for available slugs so all locales
  // share the same slug set and fall back cleanly when a translation is missing.
  return getSlugs("foods", defaultLocale)
}

export async function getPlantSlugs(locale: Locale = defaultLocale): Promise<string[]> {
  return getSlugs("plants", defaultLocale)
}

export async function getAllFoods(locale: Locale = defaultLocale): Promise<FoodEntry[]> {
  const slugs = await getFoodSlugs(locale)
  const foods = await Promise.all(slugs.map((slug) => getFoodBySlug(slug, locale)))

  return foods
    .filter((food): food is FoodEntry => food !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFoodBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<FoodEntry | undefined> {
  const content = await readFileWithFallback(locale, path.join("foods", `${slug}.md`))
  if (!content) return undefined

  const { data, content: body } = matter(content)

  const processedContent = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(body)

  return {
    ...(data as Omit<FoodEntry, "content">),
    slug,
    content: processedContent.toString(),
  } as FoodEntry
}

export async function getFoodsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<FoodEntry[]> {
  const foods = await getAllFoods(locale)
  return foods.filter((food) => food.categories.includes(categorySlug))
}

export async function getAllPlants(locale: Locale = defaultLocale): Promise<PlantEntry[]> {
  const slugs = await getPlantSlugs(locale)
  const plants = await Promise.all(slugs.map((slug) => getPlantBySlug(slug, locale)))

  return plants
    .filter((plant): plant is PlantEntry => plant !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPlantBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<PlantEntry | undefined> {
  const content = await readFileWithFallback(locale, path.join("plants", `${slug}.md`))
  if (!content) return undefined

  const { data, content: body } = matter(content)

  const processedContent = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(sanitize)
    .use(rehypeStringify)
    .process(body)

  return {
    ...(data as Omit<PlantEntry, "content">),
    slug,
    content: processedContent.toString(),
  } as PlantEntry
}

export async function getPlantsByCategory(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<PlantEntry[]> {
  const plants = await getAllPlants(locale)
  return plants.filter((plant) => plant.categories.includes(categorySlug))
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
