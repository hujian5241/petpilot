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
  bodyHtml?: string;
  sources: { name: string; url: string; slug: string; date: string }[];
  dateRange: { start: string; end: string };
  month: string;
  species: ("dogs" | "cats" | "other")[];
  substances: string[];
  severity: NewsSeverity;
  type?: NewsEntry["type"];
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
  type?: "recall" | "incident" | "alert";
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
