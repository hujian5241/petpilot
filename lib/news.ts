export type NewsSource =
  | "ASPCA Animal Poison Control"
  | "Pet Poison Helpline"
  | "FDA Center for Veterinary Medicine"
  | "AVMA"
  | "Media";

export type NewsSeverity = "low" | "moderate" | "high" | "critical";

export interface NewsCluster {
  id: string;
  canonicalSlug: string;
  slugs: string[];
  title: string;
  summary: string;
  sources: { name: string; url: string; slug: string }[];
  dateRange: { start: string; end: string };
  month: string;
  species: ("dogs" | "cats" | "other")[];
  substances: string[];
  severity: NewsSeverity;
}

export interface NewsEntry {
  slug: string;
  title: string;
  date: string; // ISO 8601 date
  month: string; // YYYY-MM
  source: string;
  sourceUrl: string;
  location?: string;
  species: ("dogs" | "cats" | "other")[];
  substances: string[];
  severity: NewsSeverity;
  status: "confirmed" | "under_investigation" | "resolved" | "recovery";
  summary: string;
  body: string;
  relatedSlugs: {
    foods?: string[];
    plants?: string[];
    medications?: string[];
    "household-chemicals"?: string[];
    pesticides?: string[];
  };
  clusterId?: string;
  updatedAt?: string;
  reviewed: boolean;
}
