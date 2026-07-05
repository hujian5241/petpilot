# Food Derivatives SEO Usage Plan

## Generated Assets

1. **content/en/food-derivatives.json**
   - 300 foods → 11,936 derivative terms
   - Includes all patterns: question, amount, animal, preparation, form-part
   - Maps each derivative to the most specific existing food slug

2. **content/en/food-derivatives-high-value.json**
   - 5,636 prioritized derivative terms
   - Focused on question forms, animal-specific phrases, amount/preparation questions, and form-part variants for toxic/high-priority foods
   - Better signal-to-noise ratio for immediate SEO use

## Recommended Usage (no new pages)

### 1. Search Index Expansion
- Load `food-derivatives-high-value.json` in the search indexer.
- Each derivative term points to its `target_slug` food page.
- Users searching "can dogs eat apple skin" or "apple for puppies" will find the `apple-slices` page.
- Implementation: extend the existing search index builder in `lib/search.ts` or similar to include derivative terms with `type: "derivative"`.

### 2. Internal Auto-Linking
- When rendering food pages, news articles, or guides, scan content for derivative terms.
- Link the first occurrence to the target food page.
- Example: in a news article about xylitol, "birch sugar" links to `/foods/xylitol`.
- Avoid double-linking and respect existing links.

### 3. Search Autocomplete / Suggestions
- Feed derivative terms into the search autocomplete dataset.
- Prioritize question forms (e.g., "can dogs eat grapes") since they match natural search queries.

### 4. Sitemap Enrichment
- Add canonical URLs for derivative terms as alternate query-string anchors or xhtml links.
- Simpler approach: ensure the target food pages have strong meta descriptions that include common derivative terms.

### 5. Meta Keywords & Descriptions
- Use derivative terms to enrich food page `<meta name="description">` and JSON-LD `keywords`.
- Example apple-slices description can mention "apple skin, apple core, apple for dogs, can dogs eat apple".
- Do not stuff; keep descriptions readable.

### 6. FAQ / Structured Data
- Add FAQ structured data to food pages using derivative question forms:
  - "Can dogs eat apple skin?"
  - "Is apple safe for puppies?"
- Answers are derived from the existing safety summary and status.

### 7. Related Searches Module
- On each food page, show a "People also ask" or "Related searches" block:
  - can dogs eat [food]
  - is [food] safe for cats
  - [food] for puppies
- Clicking links to the same page with an anchor, keeping SEO value on the canonical page.

### 8. Redirects / Canonical Handling
- If you later create dedicated long-tail pages, use 301 redirects or canonical tags back to the main food page until content is unique enough.
- For now, keep all SEO value on the existing food pages.

## Next Implementation Steps

1. Add a search-index builder that loads `food-derivatives-high-value.json`.
2. Add a food-page helper that extracts top derivative questions for FAQ schema.
3. Add a related-searches component to food detail pages.
4. (Optional) Build a small admin/validation script to review derivative quality monthly.

## Caveats

- Some generated terms use aliases that may be obscure (e.g., "birch sugar" for xylitol). Review and prune periodically.
- Form-part terms like "blueberry rind" are lower value; keep them in the full file but prioritize high-value subset for user-facing features.
- There is no unified "chicken" or "beef" page; derivatives route to the most specific existing entry. Consider adding umbrella pages for these high-volume categories if search demand justifies it.
