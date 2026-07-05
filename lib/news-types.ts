export interface NewsFile {
  slug: string;
  entry: NewsEntry;
  contentHtml: string;
  updatedAt: string;
}

export interface NewsEntry {
  slug: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  date: string;
  month: string;
  severity: NewsSeverity;
  species: string[];
  substances: string[];
  status: string;
  location?: string;
  relatedSlugs?: {
    foods?: string[];
    plants?: string[];
    medications?: string[];
    "household-chemicals"?: string[];
    pesticides?: string[];
  };
  clusterId?: string;
  updatedAt?: string;
}

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
  species: string[];
  substances: string[];
  severity: NewsSeverity;
}

export interface NewsSitemapEntry {
  loc: string;
  title: string;
  date: string;
  locale: string;
}
