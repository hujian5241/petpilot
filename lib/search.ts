import type { FoodEntry, PlantEntry, SearchIndexItem } from "./types"

export function buildFoodSearchIndex(foods: FoodEntry[]): SearchIndexItem[] {
  return foods.map((food) => ({
    slug: food.slug,
    name: food.name,
    aliases: food.aliases,
    categories: food.categories,
    summary: food.safety.dogs.summary,
    safetyDogs: food.safety.dogs.status,
    safetyCats: food.safety.cats.status,
    type: "food" as const,
  }))
}

export function buildPlantSearchIndex(plants: PlantEntry[]): SearchIndexItem[] {
  return plants.map((plant) => ({
    slug: plant.slug,
    name: plant.name,
    aliases: plant.aliases,
    categories: plant.categories,
    summary: plant.safety.dogs.summary,
    safetyDogs: plant.safety.dogs.status,
    safetyCats: plant.safety.cats.status,
    type: "plant" as const,
  }))
}

export function buildSearchIndex(foods: FoodEntry[], plants: PlantEntry[] = []): SearchIndexItem[] {
  return [...buildFoodSearchIndex(foods), ...buildPlantSearchIndex(plants)]
}
