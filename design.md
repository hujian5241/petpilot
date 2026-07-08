# PetPilot Design System

This document describes the visual design, component patterns, and frontend conventions used across PetPilot. It is derived from the Stripe-inspired design language and should be kept in sync with `app/globals.css`, layout components, and reusable UI patterns.

---

## 1. Design Philosophy

PetPilot is a **trustworthy, safety-focused** web application for pet owners. The Stripe-inspired redesign brings:

- **Authority** — deep navy ink and indigo primary actions signal a professional, reliable resource.
- **Clarity** — generous whitespace, thin display type, and hairline borders make information easy to scan.
- **Safety semantics** — color-coded status badges (`safe`, `limited`, `toxic`, `unknown`) remain instantly recognizable.
- **Speed** — minimal chrome, pill CTAs, and clear calls to action, especially in emergency contexts.

The design language is light but structured: white canvases, subtle indigo accents, pill buttons, and semantic status colors. Heavy shadows are avoided in favor of soft, blue-tinted elevation.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 (CSS-only configuration) |
| Animation | `tw-animate-css`, Tailwind transition utilities |
| Icons | `lucide-react` |
| Class merging | `clsx` + `tailwind-merge` via `lib/utils.ts` |
| Fonts | Google Fonts: Inter (Sohne substitute), Noto Sans JP |

There is **no `tailwind.config.ts`**. Theme tokens live in `app/globals.css` via `@theme inline` and CSS custom properties in `:root`.

### Utility function

`lib/utils.ts` exports `cn(...inputs)`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn()` everywhere class names are composed conditionally.

---

## 3. Color System

All colors are defined as CSS custom properties in `app/globals.css` and mapped into Tailwind via `@theme inline`.

### Brand & semantic colors

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--background` | `#ffffff` | `bg-background` | Page background |
| `--foreground` | `#0d253d` | `text-foreground` | Primary text (navy ink) |
| `--card` | `#ffffff` | `bg-card` | Card surfaces |
| `--card-foreground` | `#273951` | `text-card-foreground` | Text on cards |
| `--popover` | `#ffffff` | `bg-popover` | Dropdown/popover surfaces |
| `--primary` | `#533afd` | `bg-primary`, `text-primary` | Stripe indigo, primary actions |
| `--primary-foreground` | `#ffffff` | `text-primary-foreground` | Text on primary backgrounds |
| `--primary-deep` | `#4434d4` | `text-primary-deep` | Primary hover / links |
| `--primary-soft` | `#665efd` | `text-primary-soft` | Lighter indigo accents |
| `--primary-subdued` | `#b9b9f9` | `bg-primary-subdued` | Soft pill/tag backgrounds |
| `--secondary` | `#f6f9fc` | `bg-secondary` | Secondary surfaces |
| `--muted` | `#f6f9fc` | `bg-muted` | Muted tags, chips |
| `--muted-foreground` | `#64748d` | `text-muted-foreground` | Secondary text, captions |
| `--border` | `#e3e8ee` | `border-border` | Borders, dividers |
| `--input` | `#e3e8ee` | `border-input` | Form input borders |
| `--ring` | `#533afd` | `focus:ring-primary` | Focus rings |
| `--destructive` | `#ea2261` | `text-destructive` | Error text (ruby) |

### Stripe-specific accents

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-dark-900` | `#1c1e54` | Featured dark cards / dashboard chrome |
| `--canvas-soft` | `#f6f9fc` | Off-white feature-band backgrounds |
| `--canvas-cream` | `#f5e9d4` | Warm feature-band interludes |
| `--hairline-input` | `#a8c3de` | Input focus/hover border tint |
| `--ruby` | `#ea2261` | Gradient mesh stop, emergency accent |
| `--magenta` | `#f96bee` | Gradient mesh stop |
| `--lemon` | `#9b6829` | Warm sherbet mesh stop |
| `--shadow-blue` | `#003770` | Base for subtle shadows |

### Safety status colors

| Status | Text | Background | Border | Meaning |
|--------|------|------------|--------|---------|
| `safe` | `#146c3a` (`text-status-safe`) | `#e3f9e8` (`bg-status-safe-bg`) | `#8ee0a1` (`border-status-safe-border`) | Safe for pets |
| `limited` | `#7c4f0c` (`text-status-limited`) | `#fff5cf` (`bg-status-limited-bg`) | `#f5d76e` (`border-status-limited-border`) | Caution / limited |
| `toxic` | `#9e1c1c` (`text-status-toxic`) | `#ffeaed` (`bg-status-toxic-bg`) | `#f5a0a8` (`border-status-toxic-border`) | Toxic / emergency |
| `unknown` | `#3d4b5f` (`text-status-unknown`) | `#f6f9fc` (`bg-status-unknown-bg`) | `#e3e8ee` (`border-status-unknown-border`) | Insufficient data |

### Emergency colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--emergency` | `#ea2261` | Emergency buttons, banners, hotlines |
| `--emergency-light` | `#fff1f2` | Emergency banner background |

### Shadows

| Token | Value | Class |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,55,112,0.08)` | `shadow-card` |
| `--shadow-panel` | `0 8px 24px rgba(0,55,112,0.08), 0 2px 6px rgba(0,55,112,0.04)` | `shadow-panel` |
| `--shadow-colored` | `0 4px 12px rgba(83,58,253,0.12)` | `shadow-colored` |

---

## 4. Typography

### Font families

```css
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;
--font-sans-jp: "Noto Sans JP", "Inter", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
--font-heading: var(--font-sans);
```

- Default font is **Inter** (weights 300, 400, 500, 600). Inter acts as the open-source substitute for Stripe's proprietary Sohne.
- For `locale === "ja"`, the layout applies `font-sans-jp` to `<body>`.
- Display headings use `font-light` (300) with negative tracking, mirroring Stripe's editorial density.
- Body text stays at `font-normal` (400) for safety readability.
- `font-feature-settings: "ss01"` is applied globally to the body.
- Use `font-tabular` for numeric data.

### Type scale

| Element | Class | Usage |
|---------|-------|-------|
| Page title | `text-3xl font-light sm:text-4xl tracking-tight` | H1 on detail/list pages |
| Section title | `text-2xl font-normal` | List sections, filters |
| Card title | `text-base font-medium` or `text-lg font-normal` | Card headings |
| Body | `text-base leading-7` | Paragraphs |
| Small label | `text-sm font-medium` | Badges, metadata |
| Caption | `text-xs text-muted-foreground` | Counts, helper text |

### Content typography (`prose-pet`)

Long-form content (about, privacy, terms, item descriptions) uses the custom `prose-pet` class:

```css
.prose-pet h1 { @apply text-3xl font-light tracking-tight text-foreground mb-5 sm:text-4xl; }
.prose-pet h2 { @apply text-xl font-normal tracking-tight text-foreground mt-8 mb-3; }
.prose-pet h3 { @apply text-lg font-medium tracking-tight text-foreground mt-6 mb-2; }
.prose-pet p  { @apply text-base leading-7 mb-4; }
.prose-pet a  { @apply text-primary hover:text-primary-deep underline underline-offset-2; }
.prose-pet ul { @apply list-disc pl-5 mb-4 space-y-1.5; }
.prose-pet ol { @apply list-decimal pl-5 mb-4 space-y-1.5; }
```

---

## 5. Spacing & Layout

### Page wrappers

```tsx
<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  {/* list / category pages */}
</div>

<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
  {/* detail / content pages */}
</div>
```

Common max-widths:

| Class | Usage |
|-------|-------|
| `max-w-3xl` | Detail pages, about/privacy/terms |
| `max-w-4xl` | Search results |
| `max-w-7xl` | List pages, category pages, home |

### Section spacing

- `mt-6` — immediate spacing below breadcrumb
- `mt-8` — standard section gaps
- `mt-10` — safety overview / key sections
- `mt-12` — major section dividers
- `mt-16` — secondary group dividers

### Grid patterns

```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4   /* status overview cards */
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5  /* card grids */
grid grid-cols-2 gap-2                      /* filter selects */
grid-cols-4 gap-1                           /* compact button groups */
```

### Header & footer

- Header: `sticky top-0 z-50`, `bg-background/95 backdrop-blur`, hairline border-bottom.
- Footer: full-width `border-t border-border` or `bg-muted`.
- Skip link: visible on focus only, absolute top-left, indigo background.

---

## 6. Border Radius & Shadows

### Radius scale

Base radius: `--radius: 0.75rem`.

| Token | Value | Class |
|-------|-------|-------|
| `--radius-sm` | 0.375rem | `rounded-sm` |
| `--radius-md` | 0.5625rem | `rounded-md` |
| `--radius-lg` | 0.75rem | `rounded-lg` |
| `--radius-xl` | 1rem | `rounded-xl` |
| `--radius-2xl` | 1.25rem | `rounded-2xl` |
| `--radius-3xl` | 1.5rem | `rounded-3xl` |
| `--radius-4xl` | 1.75rem | `rounded-4xl` |

### Usage by radius

| Class | Usage |
|-------|-------|
| `rounded-sm` | Inputs, small buttons |
| `rounded-lg` | Compact cards, alerts |
| `rounded-xl` | Feature cards, pricing cards |
| `rounded-2xl` | Detail-page header cards |
| `rounded-full` | Pill buttons, pill tags, search bar |

### Shadows

| Class | Usage |
|-------|-------|
| `shadow-card` | Card lift on white |
| `shadow-panel` | Floating panels, dashboard mockups |
| `shadow-colored` | Indigo-tinted hover elevation |

---

## 7. Components

Shared primitives live in `components/ui/`. Other components are styled inline with `cn()` and Tailwind utilities.

### Buttons / CTAs

All buttons are **pill-shaped** (`rounded-full`) with `8px 16px` padding.

Primary action:

```tsx
className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-base font-normal text-primary-foreground transition-colors hover:bg-primary-deep focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

Secondary / outline:

```tsx
className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary bg-transparent px-4 py-2 text-base font-normal text-primary transition-colors hover:bg-primary-subdued"
```

Emergency primary:

```tsx
className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emergency px-4 py-2 text-base font-normal text-white transition-colors hover:bg-emergency/90"
```

Emergency outline:

```tsx
className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emergency bg-transparent px-4 py-2 text-base font-normal text-emergency transition-colors hover:bg-emergency-light"
```

### Cards

Standard card:

```tsx
className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-card"
```

Card with image:

```tsx
<div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-card">
  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
    <Image className="h-full w-full object-cover transition-transform group-hover:scale-105" />
  </div>
  <div className="p-5">...</div>
</div>
```

### Badges

Safety status badge (`SafetyBadge`):

```tsx
className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 ${statusColorClasses}`}
```

Compact safety badge (`CompactSafetyBadge`):

```tsx
className="inline-flex items-center gap-1.5 text-sm font-medium"
// text color only, e.g. text-status-safe
```

News severity badge:

```tsx
className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium"
```

Chip / tag:

```tsx
className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
```

### Alerts

Emergency banner:

```tsx
className="border-l-4 border-emergency bg-emergency-light p-4"
// optional card variant adds: rounded-xl border
```

Medical disclaimer:

```tsx
className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
```

Generic disclaimer:

```tsx
className="rounded-xl bg-muted p-4 text-sm text-muted-foreground"
```

### Chips / filters

Active pill:

```tsx
className="rounded-full bg-primary px-3 py-1 text-sm font-normal text-primary-foreground"
```

Inactive pill:

```tsx
className="rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
```

### Form inputs

```tsx
className="flex h-9 w-full items-center rounded-sm border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
```

### Modals / dialogs

Report-issue modal pattern:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-issue-title">
  <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-panel" ref={dialogRef}>
    ...
  </div>
</div>
```

---

## 8. Icons

- **Library:** `lucide-react`
- **Sizing:** `h-4 w-4` (inline), `h-5 w-5` (buttons), `h-8 w-8` (section icons)
- **Accessibility:** decorative icons use `aria-hidden="true"`; interactive icons get `aria-label` on the parent.

### Common icon usage

| Icon | Usage |
|------|-------|
| `CheckCircle2` | Safe status |
| `AlertTriangle` | Toxic / warning status |
| `XCircle` | Danger / error |
| `HelpCircle` | Unknown status |
| `Phone` | Emergency hotlines |
| `PawPrint` | Logo |
| `Globe`, `ChevronDown`, `Menu`, `X` | Header controls |
| `Search`, `Leaf`, `UtensilsCrossed`, `Pill`, `FlaskConical`, `Bug` | Search / type tags |
| `ExternalLink` | External source links |
| `Flag` | Report issue trigger |

`CategoryIcon` resolves Lucide icon names dynamically from category slugs.

---

## 9. Homepage Gradient Mesh Hero

The homepage uses a static SVG gradient mesh behind the hero search. The mesh blends cream, sherbet orange, lavender, indigo, and ruby/magenta blobs with heavy blur.

- Component: `components/home/HeroMesh.tsx`
- Placement: absolute, full-width, behind hero content, pointer-events-none
- No animation; respects reduced motion and performance budgets
- Can be replaced with a simpler CSS gradient band if the mesh becomes too heavy

---

## 10. Responsive Design

Standard Tailwind breakpoints are used:

| Breakpoint | Width | Usage frequency |
|------------|-------|-----------------|
| `sm` | 640px | Very high — card grids, page padding, detail headers |
| `md` | 768px | Medium — navigation, search grids |
| `lg` | 1024px | High — page max-widths, multi-column layouts |
| `xl` | 1280px | Low |
| `2xl` | 1536px | Minimal |

### Common responsive patterns

- Page padding: `px-4 sm:px-6 lg:px-8`
- Card grids: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
- Detail header: `flex-col sm:flex-row sm:items-start`
- Navigation: `hidden md:flex` desktop, `md:hidden` mobile

---

## 11. Dark Mode

Dark mode is **declared but not implemented**.

- `@custom-variant dark (&:is(.dark *));` exists in `globals.css`.
- No dark color overrides are defined.
- Only a handful of `dark:` or `.dark` utility usages exist in the codebase.

If dark mode is added later, it should define a full second color map in `:root.dark` or a media-query variant and update all hardcoded status colors.

---

## 12. Animations & Transitions

The project uses Tailwind utility transitions rather than custom keyframes.

| Utility | Usage |
|---------|-------|
| `transition-colors` | Nav links, dropdown items, buttons |
| `transition-shadow` | Card hover elevation |
| `transition-transform` | Image zoom on hover, rotating chevrons |
| `hover:scale-105` | Floating actions, card images |
| `hover:shadow-card` / `hover:shadow-panel` | Card hover states |
| `animate-pulse` | Loading / skeleton states (rare) |

No custom `@keyframes` are defined. The `tw-animate-css` package is installed but not heavily used.

---

## 13. Accessibility

### Core patterns

- **Skip link:** Visible on focus, targets `#main-content`.
- **Focus rings:** `focus:ring-2 focus:ring-primary` or `focus:ring-1 focus:ring-primary`.
- **Semantic HTML:** `nav`, `main`, `header`, `footer`, `article`, `section`, `ol` breadcrumbs.
- **ARIA:** Extensive use of `aria-label`, `aria-hidden`, `aria-expanded`, `aria-haspopup`, `aria-current`, `aria-selected`, `aria-controls`, `aria-modal`, `aria-labelledby`.
- **Focus trapping:** Custom `useFocusTrap` hook for mobile menu and report-issue modal.
- **Click-outside + Escape:** Custom hooks for dropdowns and modals.
- **Body scroll lock:** Mobile menu and modal set `document.body.style.overflow = "hidden"`.

### Required practices

1. Decorative icons must have `aria-hidden="true"`.
2. Interactive icons must be wrapped in a button/link with `aria-label`.
3. All form inputs need an associated `<label>`.
4. Modal triggers must point to the dialog with `aria-controls` / `aria-expanded`.
5. Color must not be the only indicator of meaning; pair status colors with icons and text.

---

## 14. SEO & Structured Data

JSON-LD is injected via inline `<script type="application/ld+json">` inside `<body>` (not `<head>`) to avoid hydration errors.

Current schema types:

- `WebSite` — site name, URL, search action
- `Organization` — logo, contact email
- `BreadcrumbList` — page breadcrumbs
- `FAQPage` — item detail pages (food, plant, medication, household chemical, pesticide)
- `ItemList` — list pages
- `NewsArticle` — news detail pages

All JSON-LD is escaped with `.replace(/</g, "\\u003c")` to prevent HTML injection.

---

## 15. Localization

- Supported locales: `en`, `de`, `fr`, `ja`.
- Default locale: `en`.
- `localePrefix: "always"` — all routes include the locale segment.
- `<html lang={locale}>` is set per page.
- Japanese pages apply `font-sans-jp` class.
- Text content is stored in `messages/<locale>.json` for UI and `content/<locale>/` for Markdown content.

---

## 16. File Organization

```
app/
  globals.css           # Tailwind v4 theme, tokens, prose-pet
  [locale]/             # Localized routes
    layout.tsx          # Root layout: fonts, providers, skip link, JSON-LD
    page.tsx            # Home page
    foods/              # List + detail pages
    plants/
    medications/
    household-chemicals/
    pesticides/
    news/
    categories/
    about/
    emergency/
    privacy/
    terms/
    search/
components/
  ui/                   # Button, Card shared primitives
  layout/               # Header, Footer, Breadcrumb
  food/                 # FoodCard, SafetyBadge, FoodDetail
  plant/                # PlantCard, PlantDetail
  hazard/               # HazardCard, HazardDetail (shared by med/chemical/pesticide)
  medication/           # MedicationDetail
  household-chemical/   # HouseholdChemicalDetail
  pesticide/            # PesticideDetail
  news/                 # NewsCard, MonthFilter, etc.
  emergency/            # EmergencyBanner
  search/               # SearchBar, SearchPageClient
  feedback/             # ReportIssue
  layout/               # CollapsibleGridSection, etc.
lib/
  utils.ts              # cn() helper
  jsonld.ts             # Structured data builders
  content.ts            # Content loading utilities
  news-content.ts       # News content utilities
  types.ts              # TypeScript models
content/
  en/                   # English Markdown + JSON content
  de/
  fr/
  ja/
messages/
  en.json               # UI translations
  de.json
  fr.json
  ja.json
```

---

## 17. Maintenance Notes

1. **Keep this doc in sync.** When adding a new color token, component pattern, or animation, update `design.md`.
2. **Prefer tokens over hardcoded values.** If a new color is needed, add it to `:root` and `@theme inline` before using a raw hex.
3. **Use `cn()` for conditional classes.** Avoid string concatenation.
4. **Test accessibility.** Run Lighthouse and keyboard navigation checks after UI changes.
5. **Verify JSON-LD.** After changing detail/list pages, confirm structured data still renders with `curl | grep '"@type":"..."'`.
6. **Dark mode is stubbed.** Do not add `dark:` utilities until a full dark palette is defined.

---

*Last updated: 2026-07-07*
