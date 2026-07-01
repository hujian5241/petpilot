export type SafetyStatus = "safe" | "limited" | "toxic" | "unknown"
export type Severity = "low" | "moderate" | "high" | "critical"
export type Species = "dogs" | "cats"

export interface SafetyInfo {
  status: SafetyStatus
  severity?: Severity
  summary: string
  detailed?: string
}

export interface FoodImage {
  src: string
  alt: string
  caption?: string
}

export interface Source {
  name: string
  url?: string
}

export interface NutritionInfo {
  calories_per_100g?: number
  protein_per_100g?: number
  fat_per_100g?: number
  carbs_per_100g?: number
  notes?: string
}

export interface SymptomSeverity {
  symptom: string
  severity: Severity
}

export interface ConditionWarning {
  condition: string
  appliesTo: Species[]
  recommendation: "avoid" | "limit" | "consult_vet"
  reason: string
  notes?: string
}

export interface FoodEntry {
  id: string
  name: string
  slug: string
  aliases: string[]
  scientific_name?: string
  categories: string[]
  tags: string[]
  images?: FoodImage[]
  safety: Record<Species, SafetyInfo>
  preparation_notes?: string
  safe_amount?: string
  frequency?: string
  dosage_per_weight?: string
  symptoms: string[]
  symptoms_severity?: SymptomSeverity[]
  what_to_do: string
  requires_emergency_visit: boolean
  nutrition?: NutritionInfo
  alternatives: string[]
  related_foods?: string[]
  lookalikes?: string[]
  sources: Source[]
  vet_reviewed: boolean
  reviewed_by?: string
  last_reviewed: string
  next_review?: string
  notes_for_puppies?: string
  notes_for_kittens?: string
  condition_warnings?: ConditionWarning[]
  meta_title?: string
  meta_description?: string
  content?: string
}

export interface PlantEntry {
  id: string
  name: string
  slug: string
  scientific_name?: string
  aliases: string[]
  categories: string[]
  tags: string[]
  images?: FoodImage[]
  safety: Record<Species, SafetyInfo>
  symptoms: string[]
  symptoms_severity?: SymptomSeverity[]
  what_to_do: string
  requires_emergency_visit?: boolean
  alternatives: string[]
  related_plants?: string[]
  lookalikes?: string[]
  notes_for_puppies?: string
  notes_for_kittens?: string
  sources: Source[]
  vet_reviewed: boolean
  reviewed_by?: string
  last_reviewed: string
  next_review?: string
  meta_title?: string
  meta_description?: string
  content?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  meta_title?: string
  meta_description?: string
  icon?: string
  sort_order: number
}

export interface Hotline {
  name: string
  phone: string
  url?: string
  note?: string
  available?: string
  cost?: string
}

export interface EmergencyInfo {
  title: string
  subtitle?: string
  hotlines: Hotline[]
  when_to_call: string[]
  common_toxins: string[]
  steps: string[]
  disclaimer: string
}

export interface SiteConfig {
  name: string
  tagline: string
  description: string
  base_url: string
  author: string
  contact_email: string
  social_links?: { platform: string; url: string }[]
  default_og_image: string
}

export interface SearchIndexItem {
  slug: string
  name: string
  aliases: string[]
  categories: string[]
  summary: string
  safetyDogs: SafetyStatus
  safetyCats: SafetyStatus
  type: "food" | "plant"
}
