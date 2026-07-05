# Plant Derivatives SEO Usage Plan

## Generated Assets

1. **content/en/plant-derivatives.json**
   - 128 plants → 5,631 derivative terms
   - Includes question forms, animal-specific phrases, preparation states, and plant part variants
   - Maps each derivative to the most specific existing plant slug

2. **content/en/plant-derivatives-high-value.json**
   - 3,604 prioritized derivative terms
   - Focused on high-search-intent question forms, animal-specific phrases, leaf/part toxicity questions, and form-part variants for toxic/high-priority plants

## Recommended Usage (no new pages)

### 1. Search Index Expansion
- Load `plant-derivatives-high-value.json` into the search indexer alongside `food-derivatives-high-value.json`.
- Each derivative points to its `target_slug` plant page.
- Example: "are tulip leaves toxic to cats" → `/plants/tulips`

### 2. Internal Auto-Linking
- When rendering plant pages, news articles, and hazard guides, link the first occurrence of derivative terms to the target plant page.
- Example: "lily pollen" links to `/plants/lily`, "sago palm seeds" links to `/plants/sago-palm`.

### 3. Search Autocomplete
- Feed plant derivative terms into autocomplete, prioritizing question forms.
- "Are lily leaves toxic to dogs" and "aloe for cats" are high-value autocomplete candidates.

### 4. Sitemap & Meta Enrichment
- Include derivative terms in plant page meta descriptions and JSON-LD keywords.
- Ensure target pages mention common part variants (leaves, pollen, bulbs, berries) since these are common toxic exposure routes.

### 5. FAQ Structured Data
- Add FAQ schema to plant pages using derivative questions:
  - "Are [plant] leaves toxic to dogs?"
  - "Is [plant] safe for cats?"
  - "Can dogs eat [plant] berries?"
- Answers derived from existing safety summaries.

### 6. Related Searches Module
- On each plant page, show a "People also ask" block with derivative questions.
- Keep SEO value on the canonical plant page.

## Next Implementation Steps

1. Merge plant derivatives into the search index builder.
2. Add plant derivative questions to plant detail page FAQ schema.
3. Add related-searches component to plant detail pages.

## Caveats

- Plant aliases include scientific names; some generated terms may use Latin names (e.g., "Cycad" for sago palm). Keep these in the full file but consider pruning non-English terms from the high-value subset.
- Part-derivative terms like "asparagus fern berries" can be low-volume; prioritize toxic plants for form-part generation.
