# PetPilot

A pet safety and nutrition platform for North American pet owners, starting with a searchable database of foods that dogs and cats can or cannot eat.

## Product Vision

PetPilot helps pet owners make fast, confident decisions about what their pets can safely consume. We begin with a focused food safety database and expand into personalized nutrition planning, plant identification, calorie calculation, and preventive care tools.

## Current Phase

**Post-MVP**

- 300 searchable human foods with safety ratings for dogs and cats
- 128 common plants with pet safety guidance
- Health-condition warnings for safe foods
- SEO-optimized detail pages and sitemap
- Emergency guidance, safe alternatives, and reporting

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Base UI)
- **Content**: Markdown/JSON
- **Deployment**: Static export (default) or Vercel
- **Analytics**: Google Analytics 4 + Search Console

## Project Structure

```
PetPilot/
├── app/                    # Next.js app router
├── components/             # React components
├── content/                # Foods, plants, categories, site config
├── docs/                   # Project documentation
├── lib/                    # Utilities, types, search, metadata
├── public/                 # Static assets (images, favicon)
├── scripts/                # Content generation and validation scripts
└── tests/                  # Test files
```

## Documentation

- [Product Requirements Document](./docs/PRD.md)
- [Technical Architecture](./docs/ARCHITECTURE.md)
- [Content Model & Data Spec](./docs/CONTENT_MODEL.md)
- [SEO & Content Strategy](./docs/SEO_STRATEGY.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Development Workflow](./docs/DEV_WORKFLOW.md)
- [Compliance & Disclaimers](./docs/COMPLIANCE.md)
- [Roadmap](./docs/ROADMAP.md)

## Getting Started

```bash
npm install
npm run content:validate
npm run build
```

See [Development Workflow](./docs/DEV_WORKFLOW.md) for detailed setup instructions.

## Legal Notice

PetPilot provides educational information only and does not constitute veterinary advice. Always consult a licensed veterinarian for medical concerns.
