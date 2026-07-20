# SEO Growth Hub — Phase 8.1: Project Foundation

## Stack

- Next.js 15 (App Router, Turbopack dev server)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 3 + `tailwindcss-animate`
- shadcn/ui (`new-york` style, CSS-variable theming)
- Framer Motion (via `LazyMotion`/`domAnimation` for bundle size)
- next-themes (light/dark/system)
- ESLint 9 (flat config) + Prettier (with Tailwind class sorting)

## Getting started

```bash
nvm use            # Node 20.11+ (see .nvmrc)
npm install
cp .env.example .env.local
npm run dev
```

Other scripts: `npm run lint`, `npm run format`, `npm run typecheck`, `npm run build`.

## Folder structure

```
src/
  app/                  # App Router routes, layouts, route handlers
  components/
    ui/                 # shadcn/ui primitives (generated via `npx shadcn add ...`)
    layout/             # Header/Footer/Shell-level composed components
    providers/          # App-wide React context/providers (theme, motion, ...)
  config/               # env.ts and other static app configuration
  hooks/                # Shared client hooks
  lib/                  # Framework-agnostic utilities (cn, formatting, etc.)
  styles/               # tokens.css and any non-Tailwind stylesheets
  types/                # Shared TypeScript types (domain model lives here)
```

This mirrors a conventional Next.js App Router layout. **It has not been
verified against your Phase 5A Technical Architecture doc**, which I
don't yet have access to — treat this as a starting point to diff
against that spec, not as confirmation that it matches.

## Known placeholders — replace once specs are available

| Area | File(s) | Status |
|---|---|---|
| Design tokens (colors, radius) | `src/styles/tokens.css` | Placeholder values, wired end-to-end |
| Typefaces | `src/app/layout.tsx` (Inter/Lora/JetBrains Mono) | Placeholder, swap imports only |
| Folder structure | `src/*` | Conventional default, not diffed against Phase 5A |
| Domain types | `src/types/index.ts` | Empty barrel, awaiting Phase 5B |
| SEO/AEO/GEO (structured data, sitemap, OG images) | `src/app/layout.tsx` metadata | Framework defaults only, awaiting Phase 6 |
| Component variants (Button shown) | `src/components/ui/*` | shadcn defaults, awaiting Phase 7 specs |

## Environment strategy

- `.env.example` documents required variables; copy to `.env.local` for
  local dev (never committed).
- `src/config/env.ts` validates `process.env` with `zod` at import time
  so misconfiguration fails fast instead of silently.
- Client-exposed variables must be prefixed `NEXT_PUBLIC_`.
