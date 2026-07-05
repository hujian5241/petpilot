import type {
  FoodEntry,
  HouseholdChemicalEntry,
  MedicationEntry,
  PesticideEntry,
  PlantEntry,
  SearchIndexItem,
} from "./types"

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

export function buildMedicationSearchIndex(medications: MedicationEntry[]): SearchIndexItem[] {
  return medications.map((medication) => ({
    slug: medication.slug,
    name: medication.name,
    aliases: medication.aliases,
    categories: medication.categories,
    summary: medication.safety.dogs.summary,
    safetyDogs: medication.safety.dogs.status,
    safetyCats: medication.safety.cats.status,
    type: "medication" as const,
  }))
}

export function buildHouseholdChemicalSearchIndex(
  chemicals: HouseholdChemicalEntry[]
): SearchIndexItem[] {
  return chemicals.map((chemical) => ({
    slug: chemical.slug,
    name: chemical.name,
    aliases: chemical.aliases,
    categories: chemical.categories,
    summary: chemical.safety.dogs.summary,
    safetyDogs: chemical.safety.dogs.status,
    safetyCats: chemical.safety.cats.status,
    type: "household-chemical" as const,
  }))
}

export function buildPesticideSearchIndex(pesticides: PesticideEntry[]): SearchIndexItem[] {
  return pesticides.map((pesticide) => ({
    slug: pesticide.slug,
    name: pesticide.name,
    aliases: pesticide.aliases,
    categories: pesticide.categories,
    summary: pesticide.safety.dogs.summary,
    safetyDogs: pesticide.safety.dogs.status,
    safetyCats: pesticide.safety.cats.status,
    type: "pesticide" as const,
  }))
}

export function buildSearchIndex(
  foods: FoodEntry[] = [],
  plants: PlantEntry[] = [],
  medications: MedicationEntry[] = [],
  householdChemicals: HouseholdChemicalEntry[] = [],
  pesticides: PesticideEntry[] = []
): SearchIndexItem[] {
  return [
    ...buildFoodSearchIndex(foods),
    ...buildPlantSearchIndex(plants),
    ...buildMedicationSearchIndex(medications),
    ...buildHouseholdChemicalSearchIndex(householdChemicals),
    ...buildPesticideSearchIndex(pesticides),
  ]
}
