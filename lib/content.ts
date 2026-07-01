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

const CONTENT_DIR = path.join(process.cwd(), "content")

export async function getSiteConfig(): Promise<SiteConfig> {
  const filePath = path.join(CONTENT_DIR, "site.json")
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as SiteConfig
}

export async function getAllCategories(): Promise<Category[]> {
  const filePath = path.join(CONTENT_DIR, "categories.json")
  const content = await fs.readFile(filePath, "utf-8")
  const categories = JSON.parse(content) as Category[]
  return categories.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getAllCategories()
  return categories.find((category) => category.slug === slug)
}

export async function getEmergencyInfo(): Promise<EmergencyInfo> {
  const filePath = path.join(CONTENT_DIR, "emergency.json")
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as EmergencyInfo
}

export async function getAllFoods(): Promise<FoodEntry[]> {
  const foodsDir = path.join(CONTENT_DIR, "foods")
  const files = await fs.readdir(foodsDir)
  const mdFiles = files.filter((file) => file.endsWith(".md"))

  const foods = await Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "")
      return getFoodBySlug(slug)
    })
  )

  return foods
    .filter((food): food is FoodEntry => food !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFoodBySlug(slug: string): Promise<FoodEntry | undefined> {
  const foodsDir = path.join(CONTENT_DIR, "foods")
  return processMarkdownFile<FoodEntry>(foodsDir, slug)
}

export async function getFoodsByCategory(categorySlug: string): Promise<FoodEntry[]> {
  const foods = await getAllFoods()
  return foods.filter((food) => food.categories.includes(categorySlug))
}

export async function getFoodSlugs(): Promise<string[]> {
  const foodsDir = path.join(CONTENT_DIR, "foods")
  const files = await fs.readdir(foodsDir)
  return files.filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, ""))
}

export function getCategoryDisplayName(categories: Category[], slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug
}

async function processMarkdownFile<T extends { slug: string; content?: string }>(
  dir: string,
  slug: string
): Promise<T | undefined> {
  const filePath = path.join(dir, `${slug}.md`)

  try {
    const fileContent = await fs.readFile(filePath, "utf-8")
    const { data, content } = matter(fileContent)

    const processedContent = await remark()
      .use(gfm)
      .use(remarkRehype)
      .use(sanitize)
      .use(rehypeStringify)
      .process(content)

    return {
      ...(data as Omit<T, "content">),
      slug,
      content: processedContent.toString(),
    } as T
  } catch {
    return undefined
  }
}

export async function getAllPlants(): Promise<PlantEntry[]> {
  const plantsDir = path.join(CONTENT_DIR, "plants")
  const files = await fs.readdir(plantsDir)
  const mdFiles = files.filter((file) => file.endsWith(".md"))

  const plants = await Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "")
      return getPlantBySlug(slug)
    })
  )

  return plants
    .filter((plant): plant is PlantEntry => plant !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPlantBySlug(slug: string): Promise<PlantEntry | undefined> {
  const plantsDir = path.join(CONTENT_DIR, "plants")
  return processMarkdownFile<PlantEntry>(plantsDir, slug)
}

export async function getPlantSlugs(): Promise<string[]> {
  const plantsDir = path.join(CONTENT_DIR, "plants")
  const files = await fs.readdir(plantsDir)
  return files.filter((file) => file.endsWith(".md")).map((file) => file.replace(/\.md$/, ""))
}

export async function getPlantsByCategory(categorySlug: string): Promise<PlantEntry[]> {
  const plants = await getAllPlants()
  return plants.filter((plant) => plant.categories.includes(categorySlug))
}
