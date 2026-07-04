Phases 1–5B remain frozen and unmodified. Beginning Phase 6.

---

# SEO Growth Hub — SEO, AEO & GEO Technical Implementation Specification (Phase 6)

**Document Owner:** Lead SEO Strategist / Lead GEO Specialist / Lead AEO Specialist / Senior Technical SEO Engineer
**Status:** Draft v1.0 — Built on Approved PRD, IA, UX Blueprint, Design System, Phase 5A, Phase 5B
**Classification:** Internal — Foundational Blueprint Document

---

# 1. SEO Architecture Philosophy

### 1.1 Objectives

**Technical SEO as Architecture, Not Overlay**
SEO is not a layer applied after pages are built — it is a constraint that shaped decisions already frozen in Phases 5A and 5B: the SSG-first Rendering Strategy (Phase 5A §3) exists because search visibility demanded it; the `SEOMetadata` value object (Phase 5B §3.16) is embedded in the shared content kernel (Phase 5B §2.2), not bolted onto individual entities; build-time validation fails the build on missing metadata (Phase 5B §5.5) rather than allowing an unoptimized page to ship. Phase 6's role is to specify *how* these already-committed architectural decisions are technically realized — not to introduce new SEO requirements that would contradict what has already been approved.

**Search-First Information Design**
The Information Architecture (Phase 2) — hub-and-spoke topical clusters (IA §17), the Entity Relationship model (IA §16), the Keyword Cluster Architecture (IA §18) — was designed with search and AI-retrieval consumption as a primary audience, co-equal with the human visitor described in the UX Blueprint (Phase 3). Phase 6 does not redesign this structure; it specifies the technical mechanisms (structured data, internal linking implementation, crawl paths) that make the already-approved information architecture legible to machines.

**Human-First, Crawler-Friendly Implementation**
No technical SEO mechanism in this specification may degrade the human experience defined in Phase 3, nor may it violate the Design System's accessibility rules (Phase 4 §26) or the Animation Principles (Phase 4 §24). Where a technical SEO technique would require hidden text, cloaked content, or a divergence between what a crawler sees and what a user sees, it is excluded by design. The governing test for every mechanism specified in this document: *does this make genuinely present content more legible to machines, or does it manufacture content solely for machines?* Only the former is in scope.

**CMS-Agnostic Principles**
Consistent with Phase 5B §11.3, every SEO mechanism specified in this document operates against the canonical domain models (Phase 5B §3) and the `SEOMetadata`/`RichContent` value objects (Phase 5B §3.16, §4.5) — never against a specific CMS vendor's native SEO plugin or field format. The CMS vendor decision remains open (Phase 5A §2.1) and nothing in Phase 6 narrows that decision space.

**AI-Search Readiness**
Per the PRD's explicit AI Search Goals (PRD §3.9) and the AEO/GEO Requirements already enumerated at the requirements level (IA §37–39, FR-37 through FR-39), this specification treats answer-engine and generative-engine retrieval as co-equal architectural targets alongside traditional search — not an afterthought layered on top of conventional SEO. The `directAnswer` field on Blog Post (Phase 5B §3.4) is the clearest existing evidence of this: it was modeled as an enforced, validated field specifically so AI-extractability would be a build-time guarantee, not an editorial hope.

### 1.2 Core Principles

**Crawlability**
Every publicly resolvable URL in the sitemap (IA §1) must be reachable via a discoverable link path with no dependency on client-side-only navigation, authentication, or JavaScript execution to expose its primary content. This principle governs, but does not yet specify, the sitemap generation and internal-linking implementation covered in later sections of this document.

**Indexability**
Indexability is treated as a deliberate, per-page decision expressed through the `noIndex` field already defined on `SEOMetadata` (Phase 5B §3.16) — defaulting to indexable, with exclusion always explicit and intentional, never accidental. A page's Publishing Workflow status (Phase 5B §2.4) and its indexability are related but distinct concerns: only `PUBLISHED` content is indexable at all, but not all `PUBLISHED` content is necessarily desired in the index (e.g., a thin utility page).

**Renderability**
Because the Rendering Strategy (Phase 5A §3) is SSG-first with content delivered as fully-formed HTML at the CDN edge, renderability is architecturally guaranteed rather than dependent on a crawler's JavaScript execution capability — this principle is largely already satisfied by decisions frozen in Phase 5A and is restated here as a governing constraint that later sections (structured data injection, metadata generation) must not violate by introducing client-side-only rendering paths for SEO-critical content.

**Performance**
Core Web Vitals (PRD §9.1, §11.4) are treated as a search-relevance signal, not merely a UX quality measure — the Image Delivery Strategy (Phase 5A §10) and Caching Strategy (Phase 5A §7) already committed to this discipline; Phase 6 inherits it as a constraint on every technical SEO mechanism added (e.g., structured data payload size, metadata generation cost) so that SEO implementation itself never becomes a performance regression.

**Semantic HTML**
Document structure (heading hierarchy, landmark regions, list/table semantics) is the foundation search engines and AI retrieval systems use to parse meaning independent of visual styling — this principle governs the eventual Component Engineering Spec (future Phase 7) and is stated here as a non-negotiable constraint: no component may achieve a visual effect through non-semantic markup where a semantic equivalent exists.

**Accessibility**
Accessibility (Phase 4 §26, Phase 3 §18) and SEO are treated as the same underlying discipline viewed from two audiences — a screen reader and a crawler both depend on the same semantic clarity, alt text discipline (Phase 5B §3.17's mandatory `altText`), and logical document structure. This document does not introduce separate, competing accessibility-vs-SEO tradeoffs; where the two could theoretically diverge, accessibility requirements (already frozen) take precedence.

**Structured Data First**
Structured data (JSON-LD) is treated as a primary data-modeling concern, not a post-hoc markup exercise — this is why `SEOMetadata` (Phase 5B §3.16) already includes a `structuredDataOverride` escape hatch, and why every content entity's relationship fields (Phase 5B §3, throughout) were modeled as explicit typed references rather than loose text — those relationships are exactly what structured data needs to express machine-readably. Later sections of this document specify the structured-data schema mapping per entity type; this principle establishes that the mapping is a natural extension of already-approved data models, not new data collection.

**Entity-Based SEO**
Following the Entity Relationship model already approved in IA Phase 2 §16 (Organization → Service, Industry, Place, Person, CreativeWork, Review, FAQPage), this architecture optimizes for how search and AI systems understand *entities and their relationships* — not merely keyword-to-page matching. This is a direct continuation of an already-frozen decision, not a new strategic direction.

**Content Relationships**
The internal linking blueprint, content relationships, and topical authority map (IA §13, §15, §17) are the human-readable specification of what this document's structured-data and internal-linking implementation sections will express machine-readably — every relationship that exists in the approved IA must have a corresponding technical expression (a link, a schema property, or both) by the end of this document.

**Future-Proof Architecture**
SEO mechanisms specified here must accommodate the same future-expansion vectors already approved in IA §20 and Phase 5B §11.5 (location scaling into the hundreds, potential localization, gated resources) without requiring re-architecture — a pattern that works for ten Location pages must work identically for one thousand.

### 1.3 Search Ecosystem Support

| Ecosystem | How This Architecture Supports It |
|---|---|
| **Traditional Search (Google/Bing)** | SSG-first rendering (Phase 5A §3) guarantees fully-formed HTML at first response; the sitemap/robots generation already scaffolded (Phase 5A §4's `app/sitemap.ts`/`robots.ts`) gives crawlers a complete, current discovery path; structured data and semantic HTML (§1.2 above) support rich-result eligibility |
| **AI Search (Google AI Overviews, Bing Copilot, etc.)** | These systems synthesize answers from indexed, crawled content — meaning traditional crawlability/indexability is a *prerequisite* for AI Search visibility, not a separate track. The `directAnswer` field (Phase 5B §3.4) and the FAQ domain model's concise-answer constraint (Phase 5B §3.8) exist specifically to make content extractable into synthesized answers |
| **LLM Retrieval (RAG-style retrieval by third-party LLM products, and any future direct crawling/training access by model providers)** | Content structured as discrete, well-bounded `RichContentBlock` units (Phase 5B §4.5) rather than undifferentiated prose is inherently more retrievable as discrete passages; explicit entity relationships (§1.2 above) give retrieval systems disambiguation signals a flat text corpus lacks |
| **Answer Engines (Perplexity, ChatGPT Search, and similar)** | These platforms weight authoritative sourcing, clear attribution, and direct-answer formatting heavily — the Author domain model's E-E-A-T fields (Phase 5B §3.7), the `updatedAt`/freshness signal already in the shared kernel (Phase 5B §2.2), and FAQ schema eligibility (Phase 5B §3.8) are the structural inputs these platforms are known to favor |
| **Voice Search** | Voice search results are overwhelmingly sourced from featured-snippet/direct-answer-eligible content — the same `directAnswer` and FAQ structures serving AI Search and Answer Engines serve voice search by extension; no separate voice-specific architecture is required beyond what is already specified for AEO |
| **Knowledge Graphs** | The `Organization` entity (Site Settings, Phase 5B §3.15) and its `sameAs` field (social profile URLs) are the standard mechanism by which search engines connect a website to an existing or new Knowledge Graph entry; consistent, canonical entity naming and relationship data (§1.2, Entity-Based SEO) across every content type reduces ambiguity in how the business and its services are graphed |

**Governing Observation:** No row in the table above requires a *separate* technical implementation from the others — traditional SEO crawlability is the substrate every other ecosystem builds on. This document does not propose parallel, redundant systems for "SEO" versus "AEO" versus "GEO"; it proposes one architecture whose outputs (structured data, semantic markup, direct-answer content, entity relationships) serve all six ecosystems simultaneously, differentiated only by which existing signal each ecosystem weights most heavily.

### 1.4 Architectural Goals

Stated as verifiable, engineering-testable conditions — not marketing KPIs (those are already defined in PRD §11 and remain that document's responsibility):

1. **Zero Unintended Non-Indexable Pages** — Every `PUBLISHED`, non-`noIndex` page in the content graph must be present in the generated sitemap and free of conflicting robots directives; verifiable by an automated sitemap-vs-published-content diff.
2. **100% Structured Data Validity** — Every page type produces zero critical errors under schema validation (mirrors PRD §11.4's KPI, restated here as a build-time-checkable architectural condition rather than a post-launch measurement).
3. **Zero Client-Side-Only Content Dependencies on SEO-Critical Paths** — No primary page content (service descriptions, blog bodies, FAQ answers, structured data) may depend on client-side JavaScript execution to be present in the initial server response; verifiable by comparing server-rendered HTML against client-hydrated DOM for content parity.
4. **Deterministic Metadata Completeness** — Every entity extending `BaseContentEntity` (Phase 5B §2.2) resolves to a complete, schema-valid `SEOMetadata` object with no fallback-to-empty condition possible, given the `Site Settings.defaultSEO` safety net (Phase 5B §3.15) — verifiable as a build-time invariant, not a spot-check.
5. **Single-Source Relationship Consistency** — Every relationship expressed in structured data (e.g., a Service's linked Case Studies) must trace to the exact same typed reference field already validated in Phase 5B §3 — zero divergence between what internal links show a user and what structured data tells a machine.
6. **AEO Extractability Coverage** — 100% of Blog Posts and FAQ Items satisfy their respective direct-answer/concise-answer validation constraints (Phase 5B §5.3) as a precondition of `PUBLISHED` status — already enforced at the data layer; this document's role is to ensure the *rendering and markup* of that validated content preserves its extractability rather than diluting it with surrounding structural noise.
7. **Performance-Neutral SEO Implementation** — No structured-data payload, metadata-generation routine, or internal-linking mechanism specified in this document may measurably regress the Core Web Vitals thresholds already committed to in Phase 5A §9.1/§10 — verifiable via the same monitoring stack (Phase 5A §9) already in place.

---

**End of Section 1 — SEO Architecture Philosophy.**

This section establishes the governing philosophy every subsequent Phase 6 section (Metadata Architecture, Structured Data Implementation, Sitemap/Robots Strategy, AEO/GEO Content Technical Requirements, etc.) must comply with. Ready to proceed to the next section on your instruction.

Sections 1 (Phase 6) and all of Phases 1–5B remain frozen and unmodified. Continuing with Section 2.

---

# 2. Metadata Architecture

### 2.1 Metadata Philosophy

Metadata is treated as **derived, not authored twice** — every metadata field specified in this section resolves from data already modeled in Phase 5B, never from a parallel, independently-maintained metadata record. This is the direct application of Section 1.2's "Structured Data First" and "Content Relationships" principles to the specific domain of `<head>`-level metadata: the `SEOMetadata` value object (Phase 5B §3.16) is the single canonical source, and this section specifies how it is *generated, resolved, and rendered* — it does not introduce new fields beyond what Phase 5B already approved.

Two categories of metadata exist, and this document is precise about which is which:
- **Editor-authored metadata** — the explicit `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `noIndex`, and `structuredDataOverride` fields an editor may set directly (Phase 5B §3.16).
- **System-derived metadata** — values computed at build/request time from other already-validated fields (e.g., a canonical URL derived from an entity's `slug` and route pattern, per IA Phase 2 §4) when no explicit override exists.

The Metadata Architecture's job is to specify the **resolution order** between these two categories for every metadata field — never leaving ambiguity about which value wins when both could theoretically apply.

### 2.2 Metadata Hierarchy

A strict, four-tier fallback chain governs every metadata field, ensuring the Architectural Goal of "Deterministic Metadata Completeness" (Section 1.4, Goal 4) is mechanically satisfiable rather than aspirational:

```
Tier 1 — Page-Specific Editor Override
   (entity.seo.metaTitle, entity.seo.metaDescription, etc. — Phase 5B §3.16)
        ↓ (if absent/empty)
Tier 2 — System-Derived, Entity-Aware Default
   (computed from other validated fields on the same entity —
    e.g., Service.name + a fixed template pattern)
        ↓ (if computation is not possible for this field type)
Tier 3 — Site-Wide Default
   (Site Settings.defaultSEO — Phase 5B §3.15)
        ↓ (Tier 3 is itself schema-guaranteed non-empty,
           per Phase 5B §5.5's build-time validation)
Tier 4 — N/A
   (unreachable in production; a Tier 3 gap is a build-time
    failure per Phase 5B §5.5, not a runtime fallback condition)
```

**Why Four Tiers, Not Two:** A naive "editor value or site default" model would produce generic, low-differentiation metadata for the large majority of pages (every Service, Industry, Blog Post, Case Study, and — critically — every Location page at scale) whenever an editor leaves a field blank. Tier 2 exists specifically to prevent this: system-derived, entity-aware defaults are always more specific than a flat site-wide fallback, which matters most for the Location entity given IA Phase 2 §11.2's explicit warning against thin/templated content at scale — a computed title/description drawing on `cityName`, `region`, and the service context is architecturally required to avoid every unedited city page collapsing to identical metadata.

**Field-by-Field Tier 2 Availability:** Not every metadata field has a meaningful Tier 2 computation. `metaTitle` and `metaDescription` do (Section 2.4–2.5 specify the per-entity-type templates). `canonicalUrl` has a Tier 2 by construction (Section 2.6 — it is *always* system-derived unless explicitly overridden, effectively inverting the usual tier priority for this one field). `ogImage` falls back through Tier 2 to the entity's own primary image field where one exists (e.g., a Blog Post's `featuredImage`, a Case Study's `featuredImage`) before reaching Tier 3's `Site Settings.organizationLogo`.

### 2.3 Metadata Generation Strategy

Metadata generation is implemented exclusively through the App Router's native `generateMetadata` function per route (Phase 5A §5.4), which was already established as the mandated mechanism — Section 2.3 specifies its internal architecture, not its existence.

**Single Resolution Function Per Field Category:** Rather than each `page.tsx`'s `generateMetadata` implementing tier-resolution logic inline (which would risk the seven-eighths of the site's Location/Service/Industry/Blog/Case-Study pages drifting into inconsistent resolution behavior over time), a shared `lib/seo/` module (Phase 5A §4) exposes one resolution function per metadata field category (title, description, canonical, OG, robots), each implementing the exact Section 2.2 tier chain. Every route's `generateMetadata` composes these shared functions against its own entity data — the tier-resolution logic itself has exactly one implementation in the entire codebase.

**Data Dependency:** `generateMetadata` for any dynamic-segment route depends on the same Content Service call (Phase 5B §6.2) already used for page rendering — metadata generation does not issue a separate, redundant data fetch. Next.js's native request memoization (Phase 5B §6.4's `cache()` wrapping) guarantees the underlying Repository/CMS fetch executes once per request regardless of whether `generateMetadata` and the page component both request the same entity.

**Static vs. Dynamic Resolution:** For SSG routes (the overwhelming majority per Phase 5A §3), metadata is resolved once at build time and cached identically to the page's HTML. For the one `dynamicParams: true` exception (Location pages, Phase 5A §3.2), metadata resolution follows the same on-demand-then-cached pattern as the page content itself — a newly requested city's metadata is computed on first request and persists in cache thereafter, never recomputed per request.

### 2.4 Title Architecture

**Tier 1:** `entity.seo.metaTitle` (Phase 5B §3.16, 10–60 char validated) used verbatim.

**Tier 2 — Per-Entity-Type Title Templates** (system-derived when Tier 1 is absent):

| Entity Type | Template Pattern | Example Output |
|---|---|---|
| Service | `{name} Services \| {organizationName}` | "Local SEO Services \| SEO Growth Hub" |
| Industry | `SEO for {name} \| {organizationName}` | "SEO for Healthcare \| SEO Growth Hub" |
| Location | `{cityName} SEO Agency \| {organizationName}` | "Austin SEO Agency \| SEO Growth Hub" |
| Blog Post | `{title} \| {organizationName} Blog` | "What Is Generative Engine Optimization? \| SEO Growth Hub Blog" |
| Case Study | `{clientDisplayName} Case Study: {headlineMetric.value} {headlineMetric.label} \| {organizationName}` | "A Regional Dental Practice Case Study: +300% Organic Traffic \| SEO Growth Hub" |
| Hub/Index pages (Services, Industries, Blog, Case Studies, Locations) | `{Hub Name} \| {organizationName}` | "SEO Services \| SEO Growth Hub" |

**Tier 3:** `Site Settings.defaultSEO.metaTitle`.

**Length Governance:** Because Tier 2 templates concatenate a variable-length entity field with a fixed suffix, the resolution function truncates the variable portion (never the organization-name suffix, which anchors brand recognition per Section 1.1's brand-positioning inheritance from PRD §2) to keep the composed title within the same 10–60 character validation bound already enforced on editor-authored titles (Phase 5B §5.1) — Tier 2 output is validated against the identical `seoMetadataSchema` as Tier 1, not exempted from it.

### 2.5 Description Architecture

**Tier 1:** `entity.seo.metaDescription` (Phase 5B §3.16, 50–160 char validated) used verbatim.

**Tier 2 — Per-Entity-Type Description Sourcing:** Unlike titles, description templates draw from **existing, already-validated content fields** rather than a separate authored string, directly implementing Section 2.1's "derived, not authored twice" philosophy:

| Entity Type | Tier 2 Source Field | Truncation Rule |
|---|---|---|
| Service | `shortDescription` (Phase 5B §3.1, already 20–160 chars) | Used near-verbatim; already within description bounds by construction |
| Industry | `description` (Phase 5B §3.2, 20–500 chars) | Truncated to 160 chars at nearest sentence boundary |
| Location | First 160 characters of `uniqueLocalContent` (Phase 5B §3.3), truncated at nearest sentence boundary | Directly reinforces the anti-thin-content constraint — the description is guaranteed unique per city because it is drawn from the mandatorily-unique 300+ word field |
| Blog Post | `excerpt` (Phase 5B §3.4, already 50–200 chars) | Truncated to 160 if at the upper end of its own valid range |
| Case Study | Composed from `headlineMetric` + `industryId`-resolved industry name (e.g., "See how we delivered +300% organic traffic for a healthcare client.") | Fixed compositional template, not raw truncation |

**Tier 3:** `Site Settings.defaultSEO.metaDescription`.

**Truncation Governance:** All truncation operations are **sentence-boundary-aware**, never a hard character-count cut mid-word or mid-clause — a truncated description that ends mid-sentence would misrepresent content in a search snippet, which Section 1.1's "human-first, crawler-friendly" principle explicitly prohibits (a snippet is user-facing content, not machine-only markup).

### 2.6 Canonical URL Generation

Canonical URL resolution inverts the usual Section 2.2 tier priority: **system-derived is the default expectation, editor override is the exception.**

- **Default (system-derived):** Every route's canonical URL is deterministically computed from the site's canonical host (Phase 5A §6.3's redirect-handling middleware already established host-normalization) plus the route's URL pattern (IA Phase 2 §4) plus the entity's validated `slug` — there is exactly one function producing this value, shared across every entity type, since the URL Structure (IA §4) already defines a uniform pattern per content type.
- **Override (`entity.seo.canonicalUrl`, Phase 5B §3.16):** Reserved for genuine exceptions — e.g., a future syndicated content scenario, or a deliberate consolidation of two thin/overlapping pages onto one canonical target. An override is never used to "boost" an unrelated page; the Validation Layer's `structuredDataOverride`-style escape-hatch philosophy (Phase 5B §3.16) applies identically here — an explicit, auditable exception, not a routine mechanism.
- **Consistency with Trailing-Slash/Host Normalization:** The canonical URL generator and the Phase 5A §6.3 redirect middleware draw from the **same** canonical-host configuration constant — preventing the drift scenario where middleware redirects to one host variant while generated canonical tags point to another, which would send search engines contradictory signals.
- **Pagination/Filtered Views:** Blog category and tag index pages (IA §4) generate canonical URLs pointing to themselves (each category/tag is a genuinely distinct, indexable resource per the approved IA), not consolidated to the parent `/blog` index — consistent with IA Phase 2 Section 4's decision to give filterable content "a real indexable path" rather than query-parameter-based pages.

### 2.7 Open Graph Metadata

Open Graph fields are resolved through the same Section 2.2 tier structure, scoped specifically to social-sharing consumption (PRD FR-33):

| OG Field | Resolution |
|---|---|
| `og:title` | Reuses the Section 2.4 resolved title (no separate OG-specific title authoring — one title, multiple consumption contexts) |
| `og:description` | Reuses the Section 2.5 resolved description |
| `og:image` | Tier 1: `entity.seo.ogImage` (Phase 5B §3.16). Tier 2: entity's own primary image field where present (`featuredImage` on Blog Post/Case Study; `icon` on Service/Industry — upscaled/reframed per Design System §10's aspect-ratio rules where the source asset's native ratio differs from the OG-optimal ratio). Tier 3: `Site Settings.organizationLogo` |
| `og:url` | Reuses the Section 2.6 resolved canonical URL — OG url and canonical must never diverge |
| `og:type` | System-derived from entity type: `website` for hub/utility pages, `article` for Blog Post and Case Study, `profile`-adjacent handling deferred (Team Member pages are not currently independently routable per the approved IA, so this case does not arise) |
| `og:site_name` | `Site Settings.organizationName` (Phase 5B §3.15), constant across all pages |

**Image Dimension Governance:** Tier 2/3 image fallbacks pass through the same `next/image`-backed Image Delivery Strategy (Phase 5A §10) for dimension/format handling, but Open Graph consumption (external platforms fetching the raw image URL directly, not through Next.js's image-optimization pipeline at request time) requires the resolution function to output a **stable, pre-sized, absolute URL** rather than a responsive `srcset` — a distinct requirement from in-page `next/image` usage, specified here as an architectural constraint on the OG resolution function.

### 2.8 Twitter/X Metadata

Twitter/X Card metadata is treated as a **thin derivation of the already-resolved Open Graph values** (Section 2.7), not an independently authored or independently tiered field set — avoiding the drift risk of maintaining two parallel social-metadata systems for what is, for this site's content types, functionally identical output.

| Twitter Field | Resolution |
|---|---|
| `twitter:card` | Fixed value: `summary_large_image` for all page types (uniform choice, consistent with the Design Philosophy's Section 2/Phase 4 preference for restrained, consistent presentation over per-page customization) |
| `twitter:title` | = `og:title` |
| `twitter:description` | = `og:description` |
| `twitter:image` | = `og:image` |
| `twitter:site` | `Site Settings` gains no new field here — sourced from the same `socialProfileUrls` array (Phase 5B §3.15) by matching the Twitter/X entry, not a duplicate dedicated field |

### 2.9 Robots Metadata

Robots directives are resolved from two inputs, kept architecturally distinct because they answer different questions:

1. **`entity.seo.noIndex`** (Phase 5B §3.16) — the editor-facing, per-entity indexability decision (Section 1.2's "Indexability" principle) — governs the page-level `<meta name="robots">` tag's `index`/`noindex` directive.
2. **`entity.status` and `entity.deletedAt`** (Phase 5B §2.4, §3.18.2) — the Publishing Workflow and Soft Delete state — govern whether the page is *reachable at all*, which is a precondition to the robots directive being relevant in the first place. A `DRAFT` or soft-deleted entity never reaches a rendering path where `generateMetadata` would even execute against it (Phase 5B §2.4/§9.3), so no robots directive is needed to hide it — it is structurally absent, not merely tagged `noindex`.

**Follow Directive:** `follow` is the universal default across every page — there is no architectural scenario in this site's structure (per the approved IA) where a page should be indexed-but-not-crawled-for-links, or vice versa; a single, uniform `index, follow` / `noindex, follow` binary (never `nofollow`) is the entirety of the robots-meta decision space, keeping this simple and auditable rather than introducing per-page directive combinations the content model doesn't actually need.

**Archived Content Handling:** Per Section 9.3's established precedent (Phase 5B), `ARCHIVED` status content remains reachable and defaults to `index, follow` unless an editor explicitly sets `noIndex` — archiving is a navigational/promotional demotion (removed from hubs/nav), not an automatic de-indexing decision, preserving accumulated authority per PRD §3.7's Authority Goals.

### 2.10 Alternate Languages Strategy

**Current State:** No multi-language/locale routing exists in the approved scope (PRD §2 marks target locations as pending; IA §20 and Phase 5A §6.2/§6.4 note internationalization as a future, non-blocking readiness item only). Accordingly, `hreflang` alternate-language tags are **not emitted at launch** — there is exactly one locale (implicit, unmarked) for every URL, and emitting a single-locale `hreflang` tag would add no signal value while adding maintenance surface.

**Future-Readiness Contract:** Should locale routing be adopted later (Phase 5A §6.2's middleware geo-detection hook, and the `middleware.ts` locale-routing placeholder already reserved in the folder structure, Phase 5A §4), the Metadata Architecture's tier system (Section 2.2) is designed to extend cleanly: `hreflang` generation would become a fifth resolution function alongside title/description/canonical/OG, iterating over whatever locale variants of an entity exist — no restructuring of the existing four tiers would be required, only an additive function following the same shared-module pattern established in Section 2.3.

### 2.11 Metadata Validation

Metadata validation is not a separate mechanism from the general Validation Layer already frozen in Phase 5B §5 — it is that layer's `seoMetadataSchema` (Phase 5B §5.1, Tier 1) applied at two distinct points, consistent with the boundaries already established:

1. **Editor Input Boundary (Tier 1 values):** Any `entity.seo.*` field an editor sets is validated against `seoMetadataSchema` at the CMS-response/Repository boundary (Phase 5B §5.2, §5.3) — identical to how every other content field is validated; metadata receives no special exemption.
2. **Generation-Time Boundary (Tier 2/3 computed values):** Because Section 2.4–2.7's templates are deterministic functions over already-validated input fields, their output is **provably within the schema's bounds by construction** (per Section 2.4's explicit truncation-governance rule) rather than re-validated at runtime — avoiding redundant validation overhead on every request while still guaranteeing the Architectural Goal of zero-empty-metadata (Section 1.4, Goal 4). The one exception is build-time: the full Build-Time Validation sweep (Phase 5B §5.5) includes resolved metadata output in its scope, so a template producing an out-of-bounds result for some unanticipated edge-case input (e.g., an unusually short `organizationName`) would still fail the build rather than silently ship.

**Cross-Field Consistency Check:** Build-time validation additionally verifies that `og:url`/`twitter:*` fields resolved per Section 2.7–2.8 exactly equal their Section 2.6 canonical-URL/title/description source values — a structural equality check, not a content-quality check, that catches any future implementation bug where OG resolution drifts from the canonical resolution function it's supposed to derive from.

### 2.12 Metadata Rendering Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
generateMetadata(params) invoked (Next.js native, Phase 5A §5.4)
        │
        ▼
Content Service call (Phase 5B §6.2) — same memoized call
the page component itself uses (Phase 5B §6.4 cache() dedup)
        │
        ▼
{ ok: false } ──► notFound() (Phase 5B §9.3) — no metadata generated
        │ { ok: true }
        ▼
lib/seo/ resolution functions invoked (Section 2.3), each
independently walking its own Section 2.2 tier chain:
  • resolveTitle(entity, siteSettings)        → Section 2.4
  • resolveDescription(entity, siteSettings)  → Section 2.5
  • resolveCanonical(entity, routePattern)    → Section 2.6
  • resolveOpenGraph(entity, siteSettings)    → Section 2.7 (depends on resolved title/description/canonical above)
  • resolveTwitterCard(openGraphResult)       → Section 2.8 (pure derivation, no independent tier walk)
  • resolveRobots(entity)                     → Section 2.9
        │
        ▼
Composed Next.js Metadata object returned
        │
        ▼
Next.js injects resolved <head> tags into the
statically generated (or on-demand-generated) HTML response
— identical caching/CDN behavior as the page body itself
(Phase 5A §7.2–7.3), never a separate cache lifecycle
```

**Key Property:** Metadata and page-body content share one generation pass, one cache entry, and one revalidation trigger (Phase 5A §7.3's `revalidateTag`/webhook flow, Phase 5B §8.4) — there is no scenario in this architecture where a page's visible content and its `<head>` metadata could independently go stale relative to each other, since both are derived from the identical Content Service call within the identical request/build cycle.

---

**End of Section 2 — Metadata Architecture.**

Ready to proceed to the next section (Structured Data / JSON-LD Implementation) on your instruction.

Sections 1–2 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 3.

---

# 3. Structured Data (JSON-LD) Architecture

### 3.1 Structured Data Philosophy

Structured data is the machine-readable expression of relationships and entity facts that **already exist as validated, typed fields** in the Phase 5B domain models — this section defines no new data, only the mapping from existing fields to Schema.org vocabulary. This is the direct continuation of Section 1.2's "Structured Data First" and "Entity-Based SEO" principles: because every relationship field in Phase 5B (`relatedCaseStudyIds`, `recommendedServiceIds`, `authorId`, and so on) was modeled as an explicit typed reference rather than free text, the JSON-LD layer specified here is a **projection**, not a parallel authoring surface. An editor never fills in a separate "schema markup" field disconnected from the content itself (with the single, deliberate exception of `structuredDataOverride`, Phase 5B §3.16, reserved for genuine edge cases per Section 2.6's override-governance precedent).

**Format Decision:** JSON-LD is the exclusive structured-data format — not Microdata, not RDFa. This is consistent with Section 1.2's "Semantic HTML" principle: JSON-LD is injected as a discrete `<script type="application/ld+json">` block, fully decoupled from the visual DOM, meaning structured-data architecture never constrains or distorts component markup decisions (a future Phase 7 concern) to accommodate inline microdata attributes.

**One Graph Per Page, Not One Schema Per Page:** Every page emits a single `@graph` array containing multiple interlinked schema nodes (e.g., a Service page emits `Service`, `BreadcrumbList`, and `FAQPage` nodes together, cross-referenced by `@id`) rather than multiple disconnected `<script>` blocks. This is the technical mechanism that fulfills Section 1.4's Architectural Goal 5 (Single-Source Relationship Consistency) — nodes reference each other by stable `@id` rather than being independently repeated, so the *structure* of the graph mirrors the *structure* of the Entity Relationship model already approved in IA Phase 2 §16.

### 3.2 Schema Selection Strategy

Schema type selection per page is **deterministic, driven by entity type**, not an editorial choice made per page — this prevents the drift risk of two structurally identical Service pages emitting different schema types due to inconsistent editorial judgment.

| Content Entity (Phase 5B §3) | Route Pattern (IA §4) | Primary Schema.org Type(s) | Governing IA/PRD Reference |
|---|---|---|---|
| Service | `/services/[service]` | `Service` | IA §7 |
| Industry | `/industries/[industry]` | `Service` (as an `ItemList`/collection context) — Industry itself has no direct Schema.org equivalent; modeled as the *audience/context* for its recommended Services, not a standalone typed entity | IA §2 |
| Location | `/locations/[city]` | `LocalBusiness` (or `ProfessionalService`, per Section 3.5) | IA §11, FR-29 |
| Blog Post | `/blog/[slug]` | `BlogPosting` | IA §8, FR-29 |
| Blog Category / Tag index | `/blog/category/[category]`, `/blog/tag/[tag]` | `CollectionPage` | IA §8.2 |
| Case Study | `/case-studies/[slug]` | `Article` (+ `Review` where a linked Testimonial exists) | IA §9, FR-29 |
| FAQ (standalone + embedded) | `/faq`, scoped sections | `FAQPage` | IA §10, FR-38 |
| Homepage | `/` | `Organization` + `WebSite` | IA Phase 2 Sitemap, FR-29 |
| Hub/index pages (Services, Industries, Case Studies index) | `/services`, `/industries`, `/case-studies` | `CollectionPage` | IA §7.1, §9.1 |
| Every routable page (universal) | all | `BreadcrumbList` (except pages excluded per UX Phase 3 §24) | IA §14 |

**Rejection Criterion:** A schema type is only emitted if the underlying entity satisfies that type's Schema.org-required properties using data that **already exists** in the Phase 5B model — no page emits a schema type for which the site would need to fabricate placeholder values to satisfy required properties. This is the concrete test implementing Section 1.1's "does this make genuinely present content more legible, or manufacture content solely for machines" principle at the schema-selection level.

### 3.3 Global Organization Schema

**Source Entity:** `Site Settings` (Phase 5B §3.15), singleton.

**Emission Pattern:** The `Organization` node is emitted **once, on every page**, as a shared graph member — not duplicated per page-type logic, but resolved through the identical singleton-fetch path already established for Navigation/Footer (Phase 5B §6.5's singleton caching treatment). Every other schema node on every page (Service, BlogPosting, LocalBusiness, etc.) references this single `Organization` node by `@id` for its `provider`/`publisher`/`author`-organization property, rather than re-declaring organization details inline per page — directly satisfying Section 3.1's "single graph, cross-referenced by `@id`" principle at the site-wide scale.

**Field Mapping Source:**
- `name` ← `Site Settings.organizationName`
- `logo` ← `Site Settings.organizationLogo` (resolved through the same `MediaAsset` model, Phase 5B §3.17)
- `sameAs` ← `Site Settings.socialProfileUrls`
- `email`/`telephone` (via `contactPoint`) ← `Site Settings.contactEmail`/`contactPhone`
- `url` ← the site's canonical host (Section 2.6's shared canonical-host configuration)

**Knowledge Graph Linkage:** This node is the specific technical mechanism fulfilling Section 1.3's "Knowledge Graphs" row — a consistent, singleton-sourced `Organization` entity with stable `sameAs` links is the standard signal search engines use to disambiguate and connect a site to an existing (or establish a new) Knowledge Graph entry.

### 3.4 Website Schema

**Source Entity:** `Site Settings` (name/URL) + a system-derived `SearchAction` pointing at the Search Experience already specified in UX Phase 3 §23.

**Purpose:** The `WebSite` node exists to declare the site's canonical root URL and, where applicable, a `potentialAction` of type `SearchAction` describing the site-wide search endpoint (Phase 5B §8.4's server-side search backend) — enabling sitelinks-searchbox eligibility in traditional search results.

**Relationship to `Organization`:** `WebSite.publisher` references the `Organization` node's `@id` (Section 3.3) — never a redeclared, inline organization object — reinforcing the single-graph-per-page discipline.

**Emission Scope:** Unlike `Organization` (emitted on every page), `WebSite` is emitted only on the homepage (`/`) — consistent with Schema.org convention that `WebSite` describes the site as a whole and does not need per-page repetition; every other page's implicit site identity is already carried by the shared `Organization` reference.

### 3.5 LocalBusiness Schema

**Source Entity:** `Location` (Phase 5B §3.3).

**Type Selection Governance:** `LocalBusiness` (or its more specific subtype `ProfessionalService`, which better matches an SEO agency's service model than the more retail-oriented base type) is emitted **only when `Location.geoCoordinates` is non-null** — per Phase 5B §3.3's own field-level note that `geoCoordinates` is optional and reserved for locations with "a physical/serviceable presence." A Location entity lacking geo-coordinates (a purely content-marketing local-SEO-targeting page, per IA §11.2's rationale, rather than a genuine office/service address) emits `Service`-in-locational-context schema instead (reusing the Section 3.6 Service schema pattern, scoped by the Location's `cityName`/`region`), never a fabricated `LocalBusiness` node with placeholder geo data — directly enforcing Section 3.2's rejection criterion.

**Field Mapping Source (where `LocalBusiness` is emitted):**
- `name` ← composed from `Site Settings.organizationName` + `Location.cityName` (consistent with the Title Architecture pattern, Section 2.4)
- `address` (`PostalAddress`) ← `Location.cityName`, `Location.region`, `Location.countryCode`
- `geo` (`GeoCoordinates`) ← `Location.geoCoordinates`
- `parentOrganization` ← references the `Organization` node's `@id` (Section 3.3)
- `areaServed` ← `Location.neighboringCityIds`, resolved to their `cityName` values (Phase 5B §6.3's `resolveMany` pattern applies identically here — batched, output-validated against `publishedRelationGuard`)
- `review`/`aggregateRating` ← where `Location.localTestimonialIds` resolves to Testimonials carrying a `rating` value (Phase 5B §3.10)

### 3.6 Service Schema

**Source Entity:** `Service` (Phase 5B §3.1), and reused in Location context per Section 3.5's governance.

**Field Mapping Source:**
- `name` ← `Service.name`
- `description` ← `Service.shortDescription`
- `provider` ← references `Organization` `@id` (Section 3.3)
- `serviceType` ← `Service.category` (Phase 5B §3.1's `ServiceCategory` enum, mapped to a human-readable label)
- `areaServed` ← omitted at the base `/services/[service]` page (national/general scope implied) but populated with the specific `Location.cityName` when the Service schema is reused within a Location page's context per Section 3.5

**Relationship Emission:** `Service.relatedCaseStudyIds` and `Service.relatedIndustryIds` (Phase 5B §3.1) are **not** re-emitted as separate top-level schema nodes on the Service page — they are represented via the `BreadcrumbList`/internal-link graph (Section 3.10–3.11) rather than inflating the `Service` node itself with non-standard properties, since Schema.org's `Service` type has no well-supported property for "related case study." This is a deliberate scope boundary: not every Phase 5B relationship field needs a corresponding JSON-LD property — only those with a genuine Schema.org vocabulary match (Section 3.2's rejection criterion applies here too).

**FAQ Integration:** Where `Service.faqItems` (Phase 5B §3.1) resolves to one or more `PUBLISHED` FAQ Items, the Service page's graph additionally includes an `FAQPage` node (Section 3.9) as a sibling graph member — not nested inside `Service`, since `FAQPage` is Schema.org's own top-level type for this purpose.

### 3.7 BlogPosting Schema

**Source Entity:** `Blog Post` (Phase 5B §3.4).

**Field Mapping Source:**
- `headline` ← `BlogPost.title`
- `description` ← `BlogPost.excerpt`
- `articleBody`-equivalent — **not emitted**; Schema.org's `articleBody` is optional and this architecture deliberately omits it, since duplicating the full `RichContent` body (Phase 5B §4.5) into JSON-LD would violate Section 1.4's Architectural Goal 7 (Performance-Neutral SEO Implementation) by inflating payload size for a property search engines already retrieve from the rendered HTML itself
- `datePublished` ← `BlogPost.publishedAt` (inherited kernel field, Phase 5B §2.2)
- `dateModified` ← `BlogPost.updatedAt` (inherited kernel field) — this is the direct technical payoff of that field's original justification in Phase 5B §2.2 ("freshness signal") now expressed machine-readably, which matters specifically for AEO/GEO freshness weighting per Section 1.3
- `author` (`Person`) ← resolved via `BlogPost.authorId` → `Author` entity (Phase 5B §3.7); references a distinct `Person` node (Section 3.10) rather than inlining author fields redundantly if the same author is referenced across multiple posts on the same page-render context (rare, but the graph-referencing discipline holds regardless)
- `publisher` ← references `Organization` `@id` (Section 3.3)
- `image` ← `BlogPost.featuredImage` (Phase 5B §3.4)
- `mainEntityOfPage` ← the page's own resolved canonical URL (Section 2.6) — closing the loop between the JSON-LD graph and the metadata layer

### 3.8 BreadcrumbList Schema

**Source:** Not a standalone content entity — derived from the same trail data already specified structurally in IA Phase 2 §14 and behaviorally in UX Phase 3 §24, applied to the resolved page hierarchy (Phase 5B §5, Section 5.5 of that phase's build-time entity relationships).

**Emission Scope:** Emitted on every Level 2+ page per IA Phase 2 §14's existing rule — the JSON-LD layer introduces no new inclusion/exclusion logic beyond what IA and UX already froze; it mirrors the visible breadcrumb component's trail exactly. **Consistency Constraint:** the `BreadcrumbList` schema's `itemListElement` sequence must be byte-for-byte consistent (same labels, same order, same URLs) with what the visible Breadcrumb component (Design System Phase 4 §26.10) renders — this is a hard architectural constraint, not a stylistic preference, because a mismatch between visible breadcrumbs and structured-data breadcrumbs is a known search-engine rich-result rejection trigger.

**Position Derivation:** Each `ListItem`'s `position` and `item` (URL) values are derived from the same Page Hierarchy levels already defined in IA Phase 2 §5 — Homepage (Level 0) is never included as an explicit `ListItem` per standard breadcrumb schema convention (it's implied as the root), consistent with UX Phase 3 §24's decision to omit breadcrumbs entirely from the Homepage.

### 3.9 FAQPage Schema

**Source Entity:** `FAQ Item` (Phase 5B §3.8), aggregated per-context.

**Two Distinct Emission Contexts** (mirroring the "two-layer" architecture already established in IA Phase 2 §10):
1. **Standalone `/faq` hub:** Emits one `FAQPage` node containing **all** `PUBLISHED` FAQ Items across all `FAQCategory` values (Phase 5B §3.8), ordered by `displayOrder`.
2. **Scoped embeds (Service, Industry, Location pages):** Emits a `FAQPage` node containing only the subset of FAQ Items referenced by that entity's own `faqItems` array (Phase 5B §3.1/§3.2) — a genuinely different, smaller node, not a filtered view of the same node reused across contexts.

**Field Mapping Source:** Each `Question`/`Answer` pair maps `FAQItem.question` → `Question.name` and `FAQItem.answer` → `Question.acceptedAnswer.text` directly — no transformation, since Phase 5B §3.8's `answer` field validation (concise, non-`RichContent` plain text) was specifically constrained during the domain-modeling phase to already match `FAQPage` schema's expectation of a concise, self-contained answer string.

**Duplicate-Node Governance:** Because the same `FAQItem` may legitimately appear in both the standalone hub and one or more scoped embeds (Phase 5B §3.8's `associatedPage(s)` relationship), each emission context produces its **own** `FAQPage` node scoped to that page's URL (`mainEntity` sequence differs per page) — this is not schema duplication in the problematic sense, since each page's `FAQPage` node correctly describes the FAQ content genuinely present on *that specific page*, consistent with Section 3.1's "genuinely present content" test.

### 3.10 Article Relationships

**Cross-Node Reference Discipline:** Every schema node that conceptually references another entity does so via `@id` reference into the same page's `@graph`, or — where the referenced entity is not otherwise represented on the current page — via a direct URL reference to that entity's own canonical page (Section 2.6), never via inline duplication of the referenced entity's full field set. Three concrete patterns:

1. **`Person` (Author) Nodes:** A Blog Post's `author` property (Section 3.7) references a `Person` node built from the `Author` entity (Phase 5B §3.7) — `name`, `description` (← `bio`), `image` (← `photo`). Where `Author.linkedTeamMemberId` resolves to a `TeamMember` (Phase 5B §3.11), the `Person` node's `worksFor` property references the `Organization` `@id`, and `sameAs` includes `TeamMember.linkedInUrl` where present — connecting the Author entity's E-E-A-T fields (already justified in Phase 5B §3.7) to actual Schema.org `Person`/`sameAs` machinery rather than leaving them as display-only bio text.
2. **`Review` Nodes (Case Study ↔ Testimonial):** Where `CaseStudy.testimonialId` (Phase 5B §3.9) resolves to a `PUBLISHED`, authorization-confirmed Testimonial (Phase 5B §3.10, §5.3's gate), the Case Study page's graph includes a `Review` node with `reviewBody` ← `Testimonial.quote`, `author` ← a `Person` node from `Testimonial.authorName`/`authorTitle`, and `itemReviewed` referencing the `Service` `@id` corresponding to `CaseStudy.serviceId` — directly connecting the proof-content relationship already modeled in Phase 5B §3.9 to Schema.org's review vocabulary.
3. **Cross-Page Entity References (no shared graph):** Where a relationship crosses pages (e.g., a Service page's `relatedIndustryIds`), the reference is expressed as a plain URL link within the rendered content and internal-linking structure (Section 3.11), **not** as a cross-page JSON-LD reference — JSON-LD graphs do not span pages; entity continuity across pages is Google's own responsibility to resolve via matching `@id`/`sameAs` conventions, not something this architecture attempts to force via non-standard cross-document schema linking.

### 3.11 Entity Linking Strategy

**`@id` Convention:** Every schema node that represents a genuinely identifiable, potentially-cross-referenced entity (Organization, and any Service/Person/Review node that might be referenced from more than one place within the same page's graph) is assigned a stable `@id` built from its resolved canonical URL (Section 2.6) plus a type-scoped fragment (e.g., the Organization's `@id` is its site root URL plus a fixed `#organization` fragment) — guaranteeing the same real-world entity always resolves to the identical `@id` string wherever it's referenced, both within a single page's graph and, by construction, across every page on the site that references that same entity (e.g., every page's `Organization` node shares the identical `@id`).

**Internal Linking ↔ Structured Data Correspondence:** This is the direct technical fulfillment of Section 1.4's Architectural Goal 5 and Section 1.2's "Content Relationships" principle: the Internal Linking Blueprint already frozen in IA Phase 2 §13 (hub-to-spoke, spoke-to-hub, cross-hub, proof-injection linking rules) is not a separate concern from the JSON-LD graph — every internal link IA §13 mandates between two entities has a corresponding, traceable structured-data relationship wherever Schema.org vocabulary supports expressing it (Sections 3.5–3.10 above), and where vocabulary support doesn't exist (Section 3.6's Service↔CaseStudy note), the relationship is carried by the visible internal link alone, with no structured-data gap treated as an architectural failure — it's a deliberate, documented scope boundary (Section 3.2's rejection criterion).

**Governance Rule:** No JSON-LD relationship may exist that does **not** trace back to an explicit typed reference field already defined in Phase 5B §3 — structured data is never permitted to assert a relationship the underlying content model doesn't itself contain, which would violate both Section 3.1's philosophy and Phase 5B §11.2's type-safety guarantee (an untyped, schema-only relationship would be exactly the kind of drift risk that domain layer was built to prevent).

### 3.12 JSON-LD Rendering Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body (Section 2.12) —
memoized via Phase 5B §6.4 cache(), zero additional fetch
        │
        ▼
lib/seo/ structured-data builder invoked, selected by entity type
per Section 3.2's deterministic mapping table:
  • buildOrganizationNode(siteSettings)         → Section 3.3 (always)
  • buildWebsiteNode(siteSettings)               → Section 3.4 (homepage only)
  • buildServiceNode(service) /
    buildLocalBusinessNode(location) /
    buildBlogPostingNode(post) / etc.            → Sections 3.5–3.7
  • buildBreadcrumbListNode(resolvedTrail)        → Section 3.8
  • buildFAQPageNode(resolvedFaqItems)            → Section 3.9 (conditional on presence)
        │
        ▼
Nodes assembled into a single @graph array,
cross-referenced by @id per Section 3.11
        │
        ▼
Graph validated against Section 3.13's validation rules
        │
   ┌────┴────┐
  fail       pass
   │           │
   ▼           ▼
BUILD FAILS   Serialized into a single <script type="application/ld+json">
(Phase 5B      block, injected into the page's <head> alongside the
 §5.5-class     metadata resolved in Section 2.12 — same generation pass,
 governance)    same cache lifecycle, same revalidation trigger (Phase 5A §7.3)
```

**Key Property, Consistent with Section 2.12:** The JSON-LD graph shares its cache/revalidation lifecycle with the page body and the `<head>` metadata — there is no scenario where visible content, metadata, and structured data could independently drift stale relative to one another, since all three are produced from the identical Content Service call within the identical generation pass.

### 3.13 Validation Strategy

Structured-data validation operates at the same three checkpoints already established for content and metadata generally (Phase 5B §5.5–5.6, Section 2.11), applied specifically to graph output:

1. **Build-Time Schema Conformance Check:** Every generated `@graph` is validated against the Schema.org vocabulary constraints for each emitted type (required properties present, correct value types) — a missing required property (e.g., a `BlogPosting` somehow lacking a resolvable `author` due to an upstream data gap) fails the build per Phase 5B §5.5's governance rule, rather than shipping a structurally invalid graph that search engines would reject at crawl time.
2. **Cross-Reference Integrity Check:** Every `@id` reference within a graph is verified to resolve to an actually-present node within that same graph (no dangling internal references) — implemented as an extension of the same build-time referential-integrity sweep already specified in Phase 5B §5.5 for content relationships generally, applied here to the JSON-LD layer specifically.
3. **Breadcrumb Parity Check (Section 3.8):** An automated build-time comparison confirms the `BreadcrumbList` JSON-LD sequence exactly matches the visible Breadcrumb component's rendered trail for the same page — the specific, named check implementing Section 3.8's "hard architectural constraint," not left to manual QA.

**Architectural Goal Traceability:** This three-checkpoint validation is the direct mechanism satisfying Section 1.4's Architectural Goal 2 (100% Structured Data Validity) as a build-time-checkable condition — consistent with how every other Phase 6 goal has been treated as an engineering invariant rather than a post-launch measurement.

---

**End of Section 3 — Structured Data (JSON-LD) Architecture.**

Ready to proceed to the next section on your instruction.

Sections 1–3 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 4.

---

# 4. Canonical URL Strategy

### 4.1 Canonical Philosophy

Canonical URL strategy extends, rather than re-derives, the resolution mechanism already frozen in Section 2.6 — this section's role is to specify the **governing rules and edge-case handling** that the Section 2.6 resolution function must satisfy, not to introduce a second canonical mechanism. The governing philosophy is unchanged from Section 2.1: canonical URLs are **system-derived by default, editor-overridden only as a deliberate, auditable exception** — inverted from the usual editor-first tier priority used elsewhere in the Metadata Architecture, because canonical correctness is a structural property of the URL Structure (IA Phase 2 §4) itself, not an editorial judgment call.

**One Canonical URL Per Resource, One Resource Per Canonical URL:** Every distinct, indexable piece of content resolves to exactly one canonical URL, and every canonical URL resolves to exactly one piece of content. This bidirectional guarantee is what Sections 4.4–4.6 exist to protect against the specific mechanisms (query parameters, pagination, filtered views) that most commonly violate it on content-heavy sites.

### 4.2 Canonical URL Rules

1. **Canonical Host Singularity:** Exactly one host variant (e.g., the `www` or non-`www` form, decided once) is canonical for the entire site — every canonical URL uses this host, without exception, regardless of which host variant a request arrived on. This is the same canonical-host configuration constant Section 2.6 already established as shared with the Phase 5A §6.3 redirect middleware; Section 4 restates it here as a rule, not a new decision.
2. **Protocol Singularity:** All canonical URLs use `https://` — never `http://`, never protocol-relative — consistent with the Security non-functional requirement (PRD §9.2) already mandating HTTPS enforcement site-wide.
3. **Trailing Slash Normalization:** Canonical URLs never carry a trailing slash (consistent with the URL Structure convention already frozen in IA Phase 2 §4 — "no trailing slashes"). A request arriving with a trailing slash is redirected (Section 4.7), never merely canonicalized while leaving the trailing-slash version independently crawlable.
4. **Lowercase Enforcement:** Canonical URLs are always lowercase, matching the Slug Rule Governance already established in Phase 5B §2.3 — since slugs are validated lowercase at the data layer, this rule is largely automatically satisfied, but is restated here as a defense-in-depth check at the URL-generation layer in case a route segment is ever derived from a non-slug source.
5. **No Session, Tracking, or User-State Parameters:** Canonical URLs never include UTM parameters, session identifiers, or any request-specific query string — canonical URLs represent the *resource*, independent of how a specific visitor arrived at it (Section 4.4 details the mechanism enforcing this).
6. **Self-Referencing by Default:** Every page's canonical URL, absent an explicit override (Rule 7), points to itself — not to a parent, category, or related page. Self-referencing canonicals are the default posture for every one of the seventeen content types in Phase 5B §3, reinforcing IA Phase 2 §4's decision to give every distinct content type (including filtered views like category/tag) "a real indexable path" rather than being silently consolidated.
7. **Override Is Exceptional, Not Routine:** The one authorized departure from self-referencing is the editor-set `entity.seo.canonicalUrl` override (Phase 5B §3.16, Section 2.6) — reserved for genuine content-consolidation scenarios, never used as a routine mechanism, and always an auditable, logged editorial decision (Phase 5B §3.18.1's Revision History applies to this field like any other).

### 4.3 Route-by-Route Canonical Strategy

Applying Section 4.2's rules against the complete sitemap (IA Phase 2 §1):

| Route Category | Canonical Behavior |
|---|---|
| Homepage (`/`) | Self-referencing, fixed — the one canonical URL with no dynamic segment or query-parameter interaction to consider |
| Service / Industry / Case Study detail pages | Self-referencing, derived from `slug` per the entity's fixed route pattern (IA §4) — no parameter or filter variants exist for these routes, so canonical resolution is the simplest case in the system |
| Location pages (`/locations/[city]`) | Self-referencing, derived from `slug`. Given the scale trajectory already established (Phase 5A §3.2 — hundreds of cities via on-demand ISR), canonical resolution for this route category must remain a pure function of `slug` with no dependency on generation order or timing, so a city generated on-demand post-launch resolves an identical canonical URL to one generated at build time |
| Blog Post (`/blog/[slug]`) | Self-referencing. A Blog Post's presence in one or more Category/Tag listings (Phase 5B §3.4's `categoryId`/`tagIds`) never alters its own canonical — the post itself has exactly one home, regardless of how many index pages link to it |
| Blog Category / Tag index (`/blog/category/[category]`, `/blog/tag/[tag]`) | Self-referencing per Section 4.6 — each is treated as a genuinely distinct, canonical-worthy resource, not consolidated to `/blog` |
| Blog index, Services hub, Industries hub, Case Studies index, Locations hub | Self-referencing. Where these support pagination (Section 4.5), canonical behavior for page 2+ is specified there |
| FAQ (standalone `/faq` + scoped embeds on Service/Industry/Location pages) | The standalone `/faq` page is self-referencing. Scoped FAQ *content* embedded within a Service/Industry/Location page carries **no independent canonical of its own** — it is not a separate resource; it is part of the host page's canonical resource, consistent with Phase 5B §3.8's modeling of embedded FAQ as page-scoped, not independently routable |
| Legal pages (`/legal/*`) | Self-referencing, static, no variant scenarios apply |
| Conversion pages (`/free-audit`, `/consultation`, `/contact`) | Self-referencing. Note: any future query-parameter-driven pre-fill behavior on these forms (e.g., a `?service=local-seo` deep link from a Service page's CTA) must not alter the canonical URL — covered generally by Section 4.4 |

### 4.4 Query Parameter Handling

**Default Rule:** No query parameter, of any kind, ever appears in a canonical URL. The canonical URL generator (Section 2.6's shared function) strips the entire query string before composing the canonical value — this is unconditional, not a conditional allowlist/blocklist of "safe" versus "unsafe" parameters, because Section 4.2 Rule 5 already establishes that canonical URLs represent the resource, not the request.

**Distinction: Stripped from Canonical vs. Stripped from the Actual URL:** This rule governs only the **canonical tag's value** — it does not mean query parameters are forbidden from appearing in the browser's address bar or from being functionally used (e.g., UTM campaign tracking for the Marketing Goals already established in UX Phase 3 §12, or the hypothetical CTA-driven pre-fill parameter noted in Section 4.3). A page loaded with `?utm_source=newsletter` renders normally and remains functionally identical, but its `<link rel="canonical">` tag points to the clean, parameter-free URL — telling search engines these are the same resource regardless of how a given visitor arrived.

**No Query-Parameter-Based Content Variants Exist by Design:** This rule is easy to state simply *because* the IA (Phase 2 §4) already made the architectural decision that filterable content (blog category/tag) gets real, indexable paths rather than query-parameter-based filtering — Section 4.4 inherits a problem space that was already substantially simplified at the Information Architecture phase, not one this document is solving from scratch.

**Search Overlay Exception:** The Search Experience (UX Phase 3 §23) is explicitly a non-routed, client-side overlay interaction — it has no corresponding indexable URL/query-parameter combination at all, and therefore no canonical consideration applies to it; this is noted here only to confirm it is out of scope, not an exception to the no-query-parameter rule.

### 4.5 Pagination Canonicals

**Governing Constraint (inherited from Phase 5A §5.3):** Pagination applies only to the Blog index and any future paginated listing (Blog Category/Tag indexes at sufficient volume) — Phase 5A §5.3 already established that numbered, crawlable pagination URLs are preferred over infinite-scroll-only presentation specifically for crawlability.

**Canonical Rule:** Each paginated page is **self-referencing**, not canonicalized back to page 1. This is a deliberate choice, consistent with current search-engine guidance treating paginated series as independent, individually indexable pages rather than requiring `rel=canonical` consolidation to the first page (a legacy pattern Google has explicitly deprecated) — Section 4.2 Rule 6's self-referencing default applies here without exception, avoiding the outdated anti-pattern of hiding page 2+ content from the index entirely.

**Page-Specific Metadata Interaction:** Because each paginated page is independently canonical, its Title/Description resolution (Sections 2.4–2.5) must produce a distinguishable value per page (e.g., appending "— Page 2" to the Tier 2 template) rather than identical metadata across the series — flagged here as a cross-reference back to Section 2's Metadata Architecture rather than a new rule, since duplicate metadata across a self-canonicalizing paginated series would otherwise reintroduce the exact duplicate-content risk pagination canonicalization is meant to avoid.

**URL Pattern:** Paginated URLs follow a `?page=N`-style parameter **only insofar as it deviates from Section 4.4's default query-stripping rule** — pagination is the one deliberate, named exception to that rule, since the page number is not incidental request metadata (like a UTM tag) but a defining characteristic of which resource is being requested. The Section 2.6 canonical-generation function treats `page` specifically as a preserved parameter, and strips every other query parameter as normal.

### 4.6 Category & Tag Canonicals

**Self-Referencing, Not Consolidated:** As established in Section 4.3 and reinforced here, `/blog/category/[category]` and `/blog/tag/[tag]` each canonicalize to themselves — this is the direct technical enforcement of IA Phase 2 §4's decision that these are genuinely distinct resources, not filtered views of `/blog`.

**Cross-Taxonomy Overlap:** A single Blog Post may belong to one Category (Phase 5B §3.4's `categoryId`, many-to-one) and multiple Tags (`tagIds`, many-to-many) — meaning the same post appears in multiple index listings. This does **not** create a canonicalization problem, because the *post itself* has one canonical URL (Section 4.3) and the *index pages* are legitimately distinct resources describing different content collections (all posts in Category X vs. all posts tagged Y) — Section 4.2's "one resource per canonical URL" guarantee holds because each index page's resource is genuinely "this specific collection," not "this post."

**Empty or Thin Category/Tag Pages:** Where a Category or Tag currently resolves to zero or very few `PUBLISHED` posts (the Empty State scenario already specified in UX Phase 3 §19), the page remains self-canonical and indexable by default rather than being suppressed — content thinness at a point in time is an editorial/content-calendar concern (addressed by the Publishing Workflow, Phase 5B §2.4) and is not, on its own, sufficient grounds for altering canonical or indexability behavior; that determination is a `noIndex` editorial decision (Section 2.9) if a Category/Tag proves persistently unpopulated, not an automatic architectural rule.

### 4.7 Redirect Relationship

Canonical tags and redirects are **complementary, not interchangeable** mechanisms, and this architecture deliberately does not conflate them:

- **Redirects (Phase 5A §6.3)** are used when a URL should no longer resolve at all under its old path — a slug rename (Phase 5B §2.3's governance rule already requires a redirect-map entry on slug change), a legacy-site migration, or a trailing-slash/host-normalization mismatch (Section 4.2 Rules 1–3). A redirect means "this exact URL is gone; go here instead," enforced at the middleware layer before a response is even generated.
- **Canonical tags (this section)** are used when a URL *does* legitimately resolve and render — successfully, with real content — but should not be treated as the primary indexed version because another URL is preferred (the `entity.seo.canonicalUrl` override case, Section 4.2 Rule 7). A canonical tag means "this URL works, but that one is authoritative."

**Non-Overlapping Enforcement:** No URL in this system is ever governed by both mechanisms simultaneously — a redirect target is never itself canonicalized elsewhere (that would create a redirect-then-canonical chain, an anti-pattern this architecture avoids by design), and a canonicalized-away URL is never also redirected (since it must remain independently resolvable, per its definition above). The Redirect Handling strategy (Phase 5A §6.3) and this section's canonical strategy share the same canonical-host configuration constant (Section 4.2 Rule 1, restated from Section 2.6) specifically so the two mechanisms never issue contradictory signals about which host/path variant is authoritative.

### 4.8 Duplicate Content Prevention

This subsection consolidates the specific duplicate-content risks already identified across Phases 1–6 and confirms each has an architectural owner:

| Duplicate Content Risk | Governing Mechanism | Reference |
|---|---|---|
| Host/protocol/trailing-slash variants of the same URL | Redirect middleware + canonical host singularity | Section 4.2 Rules 1–3, Phase 5A §6.3 |
| Query-parameter (tracking/session) variants | Query-stripped canonical generation | Section 4.4 |
| Paginated series treated as duplicate pages of page 1 | Self-referencing pagination canonicals + distinguishable per-page metadata | Section 4.5 |
| Category/Tag index overlap with parent Blog index | Self-referencing, IA-mandated distinct resource treatment | Section 4.6, IA Phase 2 §4 |
| Location pages at scale producing near-identical templated content | **Not a canonical-strategy concern at all** — prevented upstream at the data layer via the mandatory 300+ word unique-content validation on `Location.uniqueLocalContent` (Phase 5B §3.3) | Phase 5B §3.3, PRD §10.4 |
| Archived content remaining resolvable | Not treated as duplicate — deliberately distinct, self-canonical resource retained for authority preservation | Section 2.9, Phase 5B §2.4 |
| Same Testimonial/FAQ Item appearing in multiple embed contexts | Not a page-level duplicate-content risk — these are content *fragments* embedded within distinct host pages (Section 4.3's FAQ row), each host page's canonical governs the whole page, not the fragment | Section 4.3, Phase 5B §3.8 |

**Governing Observation:** Every genuine duplicate-content vector in this architecture already has a single, named owning mechanism — this table exists to make that ownership explicit and auditable, not to introduce new prevention logic beyond what Sections 4.1–4.7 and the cross-referenced prior-phase decisions already establish.

### 4.9 Canonical Validation

Consistent with the validation-checkpoint pattern already established for Metadata (Section 2.11) and Structured Data (Section 3.13):

1. **Build-Time Uniqueness Sweep:** Across the full set of statically generated pages (Phase 5A §3), the build pipeline verifies no two distinct entities resolve to the identical canonical URL — extending Phase 5B §5.5's existing slug-collision sweep to operate on the *fully-composed* canonical URL rather than the bare slug, catching cross-content-type collisions a per-type slug check alone would miss (e.g., a Service and a Blog Post could theoretically share a slug string without violating Phase 5B §2.2's per-namespace uniqueness constraint, but must still never collide once composed into full canonical paths — in practice prevented by each type's distinct route prefix, and this check is the automated confirmation of that fact, not a redundant re-litigation of it).
2. **Self-Reference Consistency Check:** For every page without an explicit `entity.seo.canonicalUrl` override, the build verifies the resolved canonical URL exactly equals that page's own request URL (Section 4.2 Rule 6) — catching any implementation bug in the resolution function itself.
3. **Override Justification Presence:** Where `entity.seo.canonicalUrl` is set (Section 4.2 Rule 7), the build-time check confirms a corresponding `changeSummary` exists in that field's most recent `ContentRevision` entry (Phase 5B §3.18.1) — operationalizing the "auditable exception" requirement from Section 4.1/4.2 as an enforced check, not just a documented expectation.
4. **Cross-Field Parity with Open Graph (restated from Section 2.11):** The canonical URL and `og:url` must be identical — this check already exists in Section 2.11 and is not re-implemented here, only re-confirmed as within scope of "canonical validation" broadly understood.

### 4.10 Canonical Generation Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body and
metadata (Section 2.12, Section 3.12) — memoized, zero
additional fetch
        │
        ▼
resolveCanonical(entity, routePattern, requestQueryParams)
invoked (Section 2.3's shared lib/seo/ module)
        │
        ▼
entity.seo.canonicalUrl present? ──yes──► use verbatim
        │ no                                  (Section 4.2 Rule 7)
        ▼
Compose from: canonical host (§4.2 Rule 1)
            + https:// (§4.2 Rule 2)
            + route pattern (IA §4)
            + entity.slug (Phase 5B §2.2, lowercase-guaranteed)
        │
        ▼
Strip trailing slash (§4.2 Rule 3)
        │
        ▼
Query parameters: strip all except `page` where
pagination context applies (§4.4, §4.5)
        │
        ▼
Resolved canonical URL — feeds into:
  • <link rel="canonical"> tag (Section 2.12's metadata flow)
  • og:url / twitter:image parity source (Section 2.7–2.8)
  • JSON-LD mainEntityOfPage / node @id construction (Section 3.11)
        │
        ▼
Build-time validation (Section 4.9) applied across the
full generated set before deploy
```

**Key Property, Consistent with Sections 2.12 and 3.12:** Canonical resolution is not an independent generation pass — it is one function within the same shared `lib/seo/` module, invoked from the same memoized Content Service call, feeding three downstream consumers (metadata tag, Open Graph, JSON-LD) that all must agree on this single resolved value. There is exactly one place in the codebase where a canonical URL is computed; every other SEO mechanism in this document that needs a canonical URL reads it from here rather than recomputing it.

---

**End of Section 4 — Canonical URL Strategy.**

Ready to proceed to the next section on your instruction.

Sections 1–4 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 5.

---

# 5. Robots & Indexability Strategy

### 5.1 Robots Philosophy

Robots and indexability control are treated as **two distinct, layered decisions**, not one — a distinction Section 2.9 already introduced at the metadata level and which this section now formalizes as full architecture. **Crawl control** (robots.txt, Section 5.4) governs whether a crawler is permitted to *request* a URL at all. **Indexability control** (robots meta tags, Section 5.3) governs whether a URL a crawler *has already fetched* is permitted to appear in a search index. These operate at different points in a crawler's lifecycle and are frequently confused in less rigorous SEO implementations — this architecture keeps them structurally separate, consistent with Section 1.1's "technical SEO as architecture" principle: conflating the two would mean, for example, blocking a URL in robots.txt while also expecting a `noindex` meta tag on it to take effect, when in fact a crawler that cannot fetch the page can never see the meta tag at all.

**Default Posture: Open Unless Deliberately Restricted.** Consistent with Section 2.9's existing rule that `noIndex` is always an explicit, intentional editorial act rather than a default, robots.txt in this architecture is similarly permissive by default — disallow rules are named, justified exceptions applied to specific route categories, never a broad default-deny posture that individual pages must opt out of. This mirrors the PRD's own constraint (§10.4) against any architecture decision that could inadvertently harm crawlability.

**Single Source of Truth Per Decision Layer:** Crawl-control rules live in exactly one place (the generated `robots.txt`, Section 5.4); indexability rules live in exactly one place per page (the resolved `robots` meta value, Section 5.3, itself sourced from the Section 2.2 tier chain). Neither layer duplicates or overrides the other's domain.

### 5.2 Indexability Principles

1. **Indexability Is a Property of the Resource, Not the Request.** A given URL's indexability does not vary by who is asking or how they arrived — no cloaking, no crawler-specific content variation for indexability purposes (distinct from the AI-crawler *access* considerations in Section 5.7, which govern crawl permission, not content variation).
2. **Publishing Status Gates Reachability; `noIndex` Gates Preference.** As established in Section 2.9 and Phase 5B §2.4/§9.3, `DRAFT`/`IN_REVIEW`/soft-deleted content is structurally unreachable — there is no URL to index in the first place. `noIndex` operates only on content that *is* reachable and rendered, expressing "this real, resolvable page should not be indexed" — a narrower, more surgical tool than publishing status, reserved for the cases enumerated in Section 5.6.
3. **Indexability Defaults to True for Every Content Type in Phase 5B §3.** No entity type is indexability-restricted by category — the decision is always per-instance (via `entity.seo.noIndex`), never per-type, since even a type generally expected to be fully indexable (e.g., Service pages) could theoretically contain a one-off exception (a draft-quality page an editor wants live for internal review purposes without indexing).
4. **Indexability and Canonicalization Are Independent Decisions (cross-reference to Section 4).** A page can be self-canonical and `noindex` (a legitimately standalone but intentionally unindexed resource), or canonicalized-away and inherently non-competing for the index regardless of its own `noIndex` value (since a properly canonicalized page's indexing signal is superseded by its canonical target). This architecture does not use `noIndex` as a substitute for proper canonicalization, or vice versa — each Section 4/5 mechanism is applied for its own distinct purpose.

### 5.3 Robots Meta Strategy

This subsection extends Section 2.9's existing resolution (index/noindex + universal `follow`) with the full decision architecture governing *when* each state applies, building the Section 5.6 matrix's inputs.

**Resolution Source (restated, not modified, from Section 2.9):** `entity.seo.noIndex` (Phase 5B §3.16) is the sole editorial input; `entity.status`/`deletedAt` (Phase 5B §2.4, §3.18.2) govern reachability as a precondition. Section 5.3's contribution is specifying the **system-derived default** for `noIndex` per route category — i.e., what value Tier 2/3 of the Section 2.2 hierarchy resolves to when an editor has not made an explicit choice, since `noIndex` was previously specified only at the field-validation level (Phase 5B §3.16: "defaults `false`") without route-category nuance.

| Route Category | System-Derived `noIndex` Default | Rationale |
|---|---|---|
| Service, Industry, Location, Blog Post, Case Study, FAQ, About, Testimonials detail/hub pages | `false` (indexable) | Primary commercial and authority content — the entire purpose of the site per PRD §1 |
| Homepage | `false`, non-overridable in practice (no legitimate scenario for excluding the homepage) | — |
| Free Audit / Consultation / Contact (conversion pages) | `false` — these are legitimate, valuable landing pages users may search for directly (e.g., "SEO Growth Hub contact") | Consistent with UX Phase 3 §10's treatment of Contact as a real destination, not a throwaway utility screen |
| Legal pages | `false` — commonly and legitimately indexed, low risk, occasionally searched directly | — |
| 404 / error pages | `true`, system-enforced, non-editable — these are never legitimate index targets by definition | Distinct from all other rows: this is the one case where the default is hardcoded at the route level (Phase 5A §4's `app/not-found.tsx`, `app/error.tsx`) rather than resolved from a content entity, since these routes have no backing Phase 5B entity at all |
| Blog Category / Tag index pages with thin/empty content | `false` by default (per Section 4.6's existing ruling — thinness alone doesn't trigger exclusion), but the **editorially-set** `true` override is the expected mechanism if a specific Category/Tag proves persistently unpopulated | Restates Section 4.6, confirms it as this section's authority on the matter rather than re-litigating |

**No Route-Category Override for Individual Entities:** The table above defines *defaults*, not mandates — every row remains overridable via `entity.seo.noIndex: true` at the individual-entity level (Section 5.2 Principle 3), since route-category defaults describe the common case, not an inviolable rule.

### 5.4 robots.txt Architecture

**Generation Mechanism:** `robots.txt` is generated dynamically via the `app/robots.ts` file already scaffolded in the folder structure (Phase 5A §4, FR-31) — not a static, hand-maintained file — so that its content is derivable from the same configuration constants (canonical host, Section 4.2 Rule 1) and route-category knowledge already centralized elsewhere in this architecture, rather than a second, independently-maintained source of truth for URL patterns.

**Disallow Rule Scope — Named, Justified Exceptions Only:**

| Path Pattern | Disallow? | Justification |
|---|---|---|
| All content routes cataloged in IA Phase 2 §1 (`/services/*`, `/industries/*`, `/locations/*`, `/blog/*`, `/case-studies/*`, `/about/*`, `/faq`, `/testimonials`, `/legal/*`, conversion pages) | No | Default-open posture (Section 5.1) |
| `/api/*` (Phase 5A §4 — Route Handlers, webhook receivers) | **Yes** | These are machine-to-machine endpoints (Phase 5A §5.6, Phase 5B §8.4) with no HTML content of any kind to index; disallowing prevents wasted crawl attempts against non-content endpoints |
| Any future authenticated `(portal)` route group (Phase 5A §5.2, §6.4 readiness) | **Yes**, reserved rule, currently inert since no such routes exist yet | Pre-emptively documented so the rule is already in place the moment the route group is introduced, rather than requiring a robots.txt update coordinated with that future launch |
| Server Action endpoints | N/A — Server Actions are not independently fetchable URLs (Phase 5A §5.6); no robots.txt entry is meaningful or necessary for them | — |

**Sitemap Directive:** `robots.txt` includes a `Sitemap:` directive pointing to the generated sitemap's absolute URL — the specific content and generation mechanics of the sitemap itself are explicitly out of scope for this section per your instruction, but its *reference* from `robots.txt` is a robots.txt-architecture concern and is noted here as a required line item.

**Per-Crawler Rule Governance (bridges to Section 5.7):** `robots.txt` supports user-agent-scoped rule groups — this architecture uses that capability only for the AI-crawler access decisions specified in Section 5.7, never to serve different disallow rules to different traditional search crawlers (Googlebot, Bingbot receive identical treatment, consistent with Section 1.3 treating traditional search as a unified ecosystem rather than a per-engine-optimized one).

### 5.5 Crawl Budget Strategy

**Relevance Threshold:** Crawl budget is a meaningful architectural concern primarily at scale — the PRD (§8.9, FR-53) and IA (§20) both anticipate Location pages growing into the hundreds, which is the one content category in this system large enough for crawl budget to matter in practice; the remaining sixteen content types (Phase 5B §3) are unlikely, at any realistic content volume for this business, to approach a scale where crawl budget is a binding constraint. This section's guidance is therefore weighted toward the Location category, consistent with how Phase 5A §3.2 and Phase 5B §11.1 already singled out Location as the system's designated scale-stress case.

**Crawl-Budget-Conscious Mechanisms Already in Place (cross-referenced, not newly introduced):**
- **SSG-first rendering (Phase 5A §3):** Every crawlable page is served as pre-rendered static HTML from CDN edge (Phase 5A §7.2) — crawlers spend zero budget waiting on server-side computation per request, meaning more of a search engine's allotted crawl budget for this site translates into pages actually fetched, rather than being consumed by rendering latency.
- **Internal Linking Blueprint's orphan-prevention rule (IA Phase 2 §13):** Every page has a minimum of two inbound internal links — crawl budget is most efficiently spent when crawlers can discover pages via link-following rather than relying solely on sitemap submission, and this rule (already frozen) ensures no page depends on sitemap discovery alone.
- **Soft-deleted/archived content exclusion from navigation (Phase 5B §2.4, §3.18.2):** `ARCHIVED` content is removed from hub/nav listings while remaining resolvable — this means crawl budget is not actively *directed* toward archived content via internal links (it can still be reached via external backlinks or historical sitemap entries), a deliberate middle ground between full removal (losing link equity, PRD §3.7) and active promotion (wasting budget on demoted content).

**Location-Specific Crawl Budget Governance:** As the Location category scales, two safeguards apply, both extending already-frozen decisions rather than introducing new ones:
1. The mandatory unique-content validation on `Location.uniqueLocalContent` (Phase 5B §3.3) indirectly protects crawl budget by ensuring every crawled Location page represents genuinely distinct content worth the crawl expenditure — a corpus of near-duplicate thin pages is the classic crawl-budget-wasting anti-pattern this constraint was already designed to prevent for content-quality reasons (Section 4.8), with crawl-budget efficiency as a secondary, compounding benefit.
2. `Location.neighboringCityIds`-driven internal linking (Phase 5B §3.3, IA §11.2) ensures new Location pages are discoverable via link-following from already-indexed neighboring cities immediately upon publication, rather than depending solely on sitemap re-crawl timing.

**No Dedicated Crawl-Rate Throttling:** This architecture does not implement server-side crawl-rate limiting or `Crawl-delay` directives — SSG/CDN serving (Phase 5A §7.2) makes server load from crawler traffic a non-issue at this site's anticipated scale, so no mechanism exists to intentionally slow crawlers down; the concern this section addresses is efficient budget *allocation* (what gets crawled and discovered efficiently), not budget *rate limiting* (which would be counterproductive here).

### 5.6 Index / Noindex Decision Matrix

Consolidating Sections 5.2–5.3 into a single authoritative decision table, covering every state combination the system can produce:

| `entity.status` | `deletedAt` | `entity.seo.noIndex` | Reachable? | Indexable? | Governing Section |
|---|---|---|---|---|---|
| `DRAFT` / `IN_REVIEW` | any | any | No — structurally absent from rendering | N/A | Phase 5B §2.4 |
| `PUBLISHED` | `null` | `false` (explicit or default) | Yes | **Yes** | Section 5.3 |
| `PUBLISHED` | `null` | `true` (explicit) | Yes | **No** | Section 5.2 Principle 3 |
| `ARCHIVED` | `null` | `false` (default, unless editor sets `true`) | Yes, but excluded from nav/hub listings | **Yes** by default | Section 2.9, §4.6, §4.8 |
| any | non-`null` (soft-deleted) | any | No — structurally absent | N/A | Phase 5B §3.18.2 |
| N/A (404/error routes) | N/A | N/A (hardcoded) | Yes (renders, but is not "content") | **No**, hardcoded | Section 5.3 table, row 5 |
| Paginated series, page 2+ | — | `false` (self-canonical default) | Yes | **Yes**, distinguishable metadata required | Section 4.5 |
| Canonicalized-away page (`entity.seo.canonicalUrl` override set) | `null` | irrespective of own `noIndex` value | Yes | Effectively no — canonical signal supersedes; the page's own `noIndex` state is moot since search engines consolidate to the canonical target | Section 4.2 Rule 7, Section 5.2 Principle 4 |

**Matrix Completeness Claim:** Every row in this table maps to a state combination the domain model in Phase 5B §3 and §2.4/§3.18.2 can actually produce — there is no reachable-and-rendered state left unaddressed, satisfying Section 1.4's Architectural Goal 1 (Zero Unintended Non-Indexable Pages) by making every possible state's indexability outcome an explicit, verifiable row rather than an implicit fallback.

### 5.7 AI Crawler Considerations

**Framing:** Per Section 1.3's established position that traditional crawlability is a *prerequisite* for AI Search visibility, AI crawler access is not treated as a separate technical track requiring different content or rendering — it is the same SSG-served HTML, the same structured data (Section 3), the same semantic markup, made available to a defined set of additional user-agents. This section's scope is narrow and specific: **which AI-related crawlers are permitted, and how that permission is expressed**, not a restatement of AEO/GEO content strategy (already covered in Section 1).

**Named Crawler Categories:**

| Crawler Category | Examples | Default Access Posture |
|---|---|---|
| **Search-index-affiliated AI crawlers** (crawlers whose output feeds a search product's AI-generated answers, where distinguishable from the base search crawler) | Google-Extended (feeds Google's AI features), Bingbot's AI-answer-affiliated crawling | **Allowed** — blocking these would directly contradict the AI Search Goals in PRD §3.9 and the Search Ecosystem Support already committed to in Section 1.3; these crawlers are functionally an extension of the traditional search crawling this site already fully permits |
| **Answer-engine/LLM-product crawlers** (crawlers operated by conversational AI/answer-engine products, distinct from a traditional search index) | PerplexityBot, ChatGPT-User/OAI-SearchBot-class agents, ClaudeBot | **Allowed** — directly serves the AEO/GEO differentiation strategy that is the business's core USP (PRD §2, IA §17's Core Topic 2); blocking these would be self-defeating given the entire premise of the AEO/GEO service offering this site sells |
| **General-purpose AI training/data-collection crawlers** (crawlers whose primary purpose is corpus collection for model training, not live retrieval for a user-facing product) | CCBot and similarly categorized broad-training crawlers | **Deliberately left as an open business decision, not a default-allow** — this is the one category where the "open by default" philosophy (Section 5.1) does not automatically apply, since training-corpus inclusion serves a different purpose (long-horizon model influence) than retrieval-time citation (immediate AEO/GEO visibility), and reasonable businesses differ on this tradeoff |

**Governing Rule for the Open Decision:** Robots.txt's per-user-agent rule-group capability (Section 5.4) is the correct and sufficient technical mechanism to express whichever decision is made for the third category — no additional architecture is required to support either choice; this document specifies the *capability*, not the *decision itself*, since the latter is a business/brand-strategy call outside a technical architecture document's authority to resolve unilaterally, and is flagged here as an open item consistent with how the CMS vendor (Phase 5A §2.1) and pricing model (multiple prior phases) have similarly been flagged rather than silently decided.

**Content Parity Guarantee:** Whichever crawlers are permitted, none receive content different from what a human visitor or traditional search crawler receives (Section 5.2 Principle 1) — no AI-crawler-specific content stripping, simplification, or augmentation. The `directAnswer` field (Phase 5B §3.4) and FAQ structuring (Phase 5B §3.8) that serve AEO/GEO goals are present in the standard rendered HTML for every visitor class, not conditionally served.

### 5.8 Validation Strategy

Consistent with the validation-checkpoint pattern established in Sections 2.11, 3.13, and 4.9:

1. **Build-Time Matrix Conformance Check:** Every generated page's actual `(status, deletedAt, noIndex)` combination is verified against Section 5.6's matrix — confirming no page produces an indexability outcome outside the matrix's defined rows (a defensive check against future entity-type additions that might introduce an unanticipated state combination).
2. **robots.txt Structural Validation:** The generated `robots.txt` is validated for syntactic correctness (proper directive format, valid user-agent group syntax) and checked against Section 5.4's named-exception table to confirm no unintended path is disallowed and no intended-disallow path (`/api/*`) is missing.
3. **404/Error Route noIndex Enforcement:** Build-time check confirming the hardcoded `noIndex: true` on error routes (Section 5.3 table) is actually present in the rendered output — the one row in the matrix not derived from Phase 5B content data, and therefore not automatically covered by the standard content-validation sweep, so it receives its own explicit check.
4. **Cross-Reference to Section 4.9:** Canonicalized-away pages' indexability moot-ness (Section 5.6, final row) is validated jointly with Section 4.9's override-justification check — a single build-time pass covers both the canonical-override audit trail and its indexability implication, rather than two disconnected checks.

### 5.9 Rendering Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
and structured data (Sections 2.12, 3.12, 4.10) — memoized,
zero additional fetch
        │
        ▼
resolveRobotsMeta(entity) invoked (Section 2.3's shared
lib/seo/ module, already named in Section 2.12's flow —
now fully specified by this section)
        │
        ▼
entity.status ∈ {DRAFT, IN_REVIEW} or deletedAt !== null?
        │ yes ──► page never reaches this flow at all
        │         (Phase 5B §2.4/§9.3 — not a robots-meta outcome,
        │          a reachability outcome)
        │ no
        ▼
Route category default noIndex value resolved (Section 5.3 table)
        │
        ▼
entity.seo.noIndex explicit override present? ──yes──► use override
        │ no
        ▼
Use route-category default
        │
        ▼
Compose final robots meta value: {index|noindex}, follow
(follow is universal and non-conditional, per Section 2.9)
        │
        ▼
Injected into <head> alongside title/description/canonical/OG
(Section 2.12's flow) — same generation pass, same cache lifecycle
        │
        ▼
[Separately, build-pipeline-level, not per-request:]
app/robots.ts generates robots.txt once per build/deploy
(Phase 5A §7.5's moderate-revalidation caching already governs
its refresh cadence) — independent of any single page's
robots-meta resolution above, per Section 5.1's layering principle
```

**Key Property, Consistent with Sections 2.12/3.12/4.10:** Robots-meta resolution is one more function within the same shared `lib/seo/` module and the same single generation pass — title, description, canonical, structured data, and robots directives are all resolved together, from the same memoized data, and injected into the same `<head>` in the same request/build cycle. `robots.txt` generation is the one exception explicitly noted as operating on a build/deploy cadence rather than a per-page cadence, since it is a single site-wide artifact, not a per-entity resolution.

---

**End of Section 5 — Robots & Indexability Strategy.**

Ready to proceed to the next section (Sitemap Architecture) on your instruction.

Sections 1–5 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 6.

---

# 6. Sitemap Architecture

### 6.1 Sitemap Philosophy

The sitemap is treated as a **derived discovery artifact, not a primary discovery mechanism** — consistent with Section 5.5's Crawl Budget Strategy, which already established that the Internal Linking Blueprint's orphan-prevention rule (IA Phase 2 §13) is this site's primary discovery path, with the sitemap serving as a comprehensive, machine-readable supplement rather than the sole means by which any page becomes known to search engines. This framing matters architecturally: the sitemap must never be treated as compensating for a linking gap, and it is never the arbiter of what *should* exist on the site — it is a faithful, mechanically-generated reflection of what the Indexability Strategy (Section 5) has already determined is indexable.

**Single Source of Truth Inheritance:** The sitemap introduces no new decision-making of its own. Every URL's inclusion, exclusion, and metadata (last-modified, priority) is derived entirely from decisions already frozen in Sections 2 through 5 and Phase 5B's domain models — the sitemap generator is a *consumer* of those decisions, never an independent authority that could drift out of sync with them.

**Generation Mechanism (restated from Phase 5A, now elaborated):** `app/sitemap.ts` (Phase 5A §4, FR-30) is the sole generation point — consistent with the `robots.txt` architecture in Section 5.4, this is a dynamically generated artifact, not a hand-maintained file, ensuring it can never fall out of sync with the actual published content graph.

### 6.2 Sitemap Generation Strategy

**Data Source:** The sitemap generator queries across all seventeen Repository interfaces (Phase 5B §6.1) via their `listPublished()` methods — the same method signature already defined in Phase 5B §6.1's example (`ServiceRepository.listPublished()`), applied uniformly across every content type. No separate "sitemap query" exists at the Repository layer; the sitemap consumes the identical `PUBLISHED`-filtered, non-soft-deleted result set that every other public read path already uses (Phase 5B §2.4).

**Generation Timing:** Given the SSG-first Rendering Strategy (Phase 5A §3), the sitemap is regenerated on the same cadence as the content it describes:
- On every full build/deploy, the sitemap reflects the complete, current published-content graph.
- Between builds, on-demand ISR content changes (webhook-triggered revalidation, Phase 5A §7.3, Phase 5B §8.4) do **not** individually trigger a sitemap regeneration per change — the sitemap itself follows the moderate, time-based revalidation window already established in Phase 5A §7.5 ("not `immutable`, since sitemap content changes as new pages are added"), balancing crawler-freshness against unnecessary regeneration cost, exactly as that section anticipated.
- **Exception:** A new Location page generated via on-demand ISR (Phase 5A §3.2) becomes reachable and indexable (per Section 5.6's matrix) before its next scheduled sitemap regeneration — this is an accepted, bounded staleness window, not an architectural gap, since Section 6.1 already established the sitemap as a supplement to (not the sole enabler of) discovery; the page remains discoverable via its neighboring-city internal links (Section 5.5) in the interim.

**Locale Scope:** Consistent with Section 2.10's Alternate Languages Strategy, the sitemap at launch describes a single, unmarked locale — no locale-partitioned sitemap variants exist until internationalization (a deferred future item per IA §20, Phase 5A §6.2/§6.4) is adopted, at which point the sitemap partitioning strategy (Section 6.3) would extend to include a locale dimension without restructuring the mechanism described here.

### 6.3 Sitemap Partitioning

**Sitemap Index Pattern:** Rather than a single monolithic sitemap file, this architecture uses a **sitemap index** (a top-level sitemap referencing multiple child sitemaps) — required groundwork given the Location category's anticipated scale (hundreds of entries, per Phase 5A §3.2/Phase 5B §11.1), and good practice regardless of current volume, since it means no future restructuring is needed purely because content volume crossed a per-file URL-count threshold.

**Partitioning Boundary — By Bounded Context, Mirroring Phase 5B §2.1:** Child sitemaps are partitioned along the same four Bounded Contexts already established in the Data Layer (Phase 5B §2.1), rather than an arbitrary or purely volume-driven split — this keeps the partitioning scheme legible and stable as content evolves, since it maps to a boundary that already exists and is independently governed:

| Child Sitemap | Contents | Bounded Context (Phase 5B §2.1) |
|---|---|---|
| `sitemap-marketing.xml` | Services, Industries, Locations (+ hub pages) | Marketing Content Context |
| `sitemap-editorial.xml` | Blog Posts, Blog Category/Tag indexes, Case Studies | Editorial Context |
| `sitemap-trust.xml` | standalone `/faq`, `/testimonials`, `/about/team` | Trust & Social Proof Context |
| `sitemap-core.xml` | Homepage, `/about`, `/about/methodology`, conversion pages, legal pages | Structural/utility pages not otherwise partitioned |

**Location Sub-Partitioning (Scale Provision):** Within `sitemap-marketing.xml`, should Location page volume approach the practical per-sitemap URL ceiling as the business scales (per the "hundreds of cities" trajectory already anticipated in Phase 5A §3.2), Locations are architected to split into their own dedicated, further-partitioned child sitemap set (e.g., alphabetically or by `region`) — this is specified here as a **readiness provision**, not an active partition at current anticipated launch volume, consistent with how Architecture Philosophy Principle 6 (Phase 5A §1) treats future scale as "designed for, not built out, ahead of need."

**Why Not Partition by Rendering Strategy Instead:** An alternative partitioning axis (e.g., grouping by SSG vs. ISR-with-`dynamicParams`, per Phase 5A §3's rendering table) was considered and rejected — rendering strategy is an implementation detail invisible to and irrelevant for a search engine consuming the sitemap; partitioning by Bounded Context instead keeps the sitemap's structure meaningful to content governance and editorial ownership, which is who actually interacts with sitemap health during operation.

### 6.4 URL Inclusion Rules

The sitemap's inclusion logic is a direct, mechanical application of Section 5.6's Index/Noindex Decision Matrix — restated here specifically as sitemap-inclusion rules, since matrix rows map to sitemap presence but are not identical concepts (a page can be indexable-by-default per the robots-meta matrix while still correctly excluded from the sitemap under narrower circumstances noted below):

| Condition | Included in Sitemap? |
|---|---|
| `status: PUBLISHED`, `deletedAt: null`, `noIndex: false` (default or explicit) | **Yes** |
| `status: PUBLISHED`, `deletedAt: null`, `noIndex: true` | **No** — a page explicitly excluded from indexing has no reason to be actively submitted for crawling via the sitemap; this is the primary case where "indexable-eligible-by-matrix" and "sitemap-included" would diverge if not for this explicit rule, since a `noIndex` page is *reachable* (per §5.6) but should never be *sitemap-promoted* |
| `status: ARCHIVED`, `deletedAt: null`, `noIndex: false` (default) | **No** — this is the second, deliberate divergence from raw indexability: archived content remains *indexable* if already indexed (Section 2.9's authority-preservation rationale) and remains *reachable*, but is excluded from **active sitemap promotion**, consistent with its removal from navigation/hub listings (Phase 5B §2.4) — the sitemap actively promotes current, promoted content; it does not need to re-assert pages the site itself has editorially demoted, even though those pages remain crawlable via existing external links and prior index presence |
| `status: DRAFT / IN_REVIEW`, or `deletedAt` non-null | **No** — structurally unreachable (Phase 5B §2.4/§3.18.2), never a sitemap candidate |
| Canonicalized-away pages (`entity.seo.canonicalUrl` override set, Section 4.2 Rule 7) | **No** — only the canonical target is sitemap-included; including both the canonicalized-away URL and its target would contradict the very purpose of the canonical override |
| Paginated series, page 2+ (Section 4.5) | **Yes** — self-canonical, independently indexable pages per Section 4.5's ruling, therefore correctly included |
| Blog Category/Tag index with thin/empty content, `noIndex` not explicitly set | **Yes** — per Section 4.6/5.3's existing ruling that thinness alone doesn't trigger exclusion |
| 404/error routes | **No** — never applicable; these have no backing Phase 5B entity and are excluded by construction, not by rule evaluation |
| Scoped FAQ embeds (Service/Industry/Location page FAQ sections) | **No independent entry** — per Section 4.3's ruling, these are not independently canonical resources; only their host page appears in the sitemap |

**Governing Distinction Restated:** Sitemap inclusion is *indexability-eligible AND actively promoted* — a strictly narrower set than "indexability-eligible" alone (Section 5.6's matrix), with the `ARCHIVED`-exclusion and `noIndex`-exclusion rows above being the two specific, named narrowing conditions.

### 6.5 Last Modified Strategy

**Source Field:** Every sitemap entry's `<lastmod>` value derives directly from `entity.updatedAt` (the inherited kernel field, Phase 5B §2.2) — the identical field already serving as the `dateModified` source for `BlogPosting` structured data (Section 3.7) and as the ISR freshness/revalidation signal referenced throughout Phase 5A §7.3. This is a deliberate, single-source reuse: the sitemap introduces no separate "last modified for sitemap purposes" tracking, since Phase 5B §2.2's original justification for `updatedAt` ("drives ISR revalidation freshness signals... and blog Updated Date UX requirement") already anticipated this exact reuse pattern.

**Accuracy Guarantee:** Because `updatedAt` is incremented on every successful content save (Phase 5B §2.2, tied to the `version` counter formalized in §3.18.1), `<lastmod>` is guaranteed to reflect genuine content changes — it is never a synthetic "last sitemap regeneration" timestamp, which would provide search engines a materially less useful (and potentially misleading) freshness signal.

**Singleton and Structural Pages:** `Navigation`, `Footer`, and `Site Settings` (Phase 5B §3.12, §3.13, §3.15) do not themselves appear as sitemap entries (they are not independently routable resources), but pages whose rendered content is *materially* affected by a singleton change (e.g., a Homepage hero section sourced partly from Site Settings) do **not** have their own `<lastmod>` bumped purely by a singleton edit — `updatedAt` reflects changes to the entity's *own* fields only, consistent with Phase 5B's field-level change semantics (§3.18.1's revision snapshots are per-entity, not cascading). This is a deliberate scope boundary: `<lastmod>` answers "when did this specific resource last change," not "when did anything potentially influencing this resource's rendering last change."

### 6.6 Priority & Change Frequency Philosophy

**Governing Position:** This architecture **omits both `<priority>` and `<changefreq>` sitemap elements entirely**, rather than populating them with per-route-category values. This is a deliberate architectural decision, not an oversight, for two converging reasons directly traceable to Section 1's governing philosophy:

1. **Signal Value Has Materially Declined:** Major search engines have publicly and consistently indicated these two elements are largely ignored in practice — populating them with confident-looking values would create false precision (implying a signal strength that doesn't exist) without any corresponding architectural or business benefit, violating Section 1.1's "human-first, crawler-friendly" test applied by extension to "genuinely useful to crawler infrastructure, not merely present."
2. **Maintenance Surface Without Payoff:** Any priority/change-frequency scheme would require an ongoing, editorially-invisible mapping (e.g., "Service pages = priority 0.8, Blog posts = priority 0.5") that risks silent drift from actual content importance as the site evolves, for a mechanism with negligible practical effect — this contradicts Section 1.2's "Future-Proof Architecture" principle, which favors mechanisms whose maintenance cost is justified by real utility.

**What Replaces Priority Signaling:** To the extent search engines do weight relative page importance, this architecture communicates it through mechanisms already established and known to carry genuine signal weight: the Internal Linking Blueprint's hub-to-spoke link density (IA Phase 2 §13 — pillar pages receive more inbound internal links than leaf content by structural design), and the Entity Relationship graph's centrality (Section 3.11 — the `Organization` node's near-universal cross-referencing). Relative importance is expressed structurally, not declared via a sitemap attribute.

### 6.7 Image Sitemap Strategy

**Scope Decision:** This architecture does **not** implement a dedicated, separate image sitemap (a distinct `<image:image>`-extended sitemap or standalone image-sitemap file). Instead, image discoverability is achieved through the mechanisms already frozen in prior phases:

- Every `MediaAsset` (Phase 5B §3.17) referenced by a `PUBLISHED` entity is embedded, with mandatory `altText` (Phase 5B §3.17's hard validation rule), directly within that entity's rendered HTML — served via `next/image` per the Image Delivery Strategy (Phase 5A §10).
- Structured data's `image` properties (Section 3.7's `BlogPosting.image`, Section 3.5's implicit Location imagery, etc.) already provide search engines a machine-readable image reference tied to its parent content resource.

**Rationale for Omission:** A standalone image sitemap's primary historical value was surfacing images that might otherwise be difficult for a crawler to associate with meaningful page content (e.g., JavaScript-injected galleries, image-only pages). Given this architecture's SSG-first rendering (Phase 5A §3) and the mandatory `altText`/structured-data association already required at the domain-model level (Phase 5B §3.17), every image on this site is already fully discoverable and contextually associated through standard page crawling — a separate image sitemap would duplicate signal already present, without addressing any gap this architecture actually has.

**Future Revisit Condition:** Should the future `/resources` gated-content hub or a future interactive audit tool (both flagged as future items in IA Phase 2 §20) introduce image-heavy content with a materially different discoverability profile than the current content types, this decision is revisitable — noted here as a scoped, named condition rather than a closed door.

### 6.8 Future Video Sitemap Readiness

**Current State:** No content entity in Phase 5B §3 includes a video field, and no approved page template (Phase 3 UX Blueprint) specifies video content — video sitemap architecture is therefore **entirely out of current scope**, not merely deprioritized.

**Readiness Posture (consistent with the pattern already established for Authentication, Phase 5A §6.4, and CRM Integration, Phase 5B §8.6):** Should video content be introduced in the future (e.g., a future case-study video testimonial, or educational video content extending the Blog domain model), the `RichContentBlock` discriminated union (Phase 5B §4.5) is structurally extensible — a new `{ type: 'video'; ... }` block variant could be added without restructuring `RichContent` itself — and the sitemap partitioning scheme (Section 6.3, partitioned by Bounded Context) already accommodates an additional per-context video sitemap or extended `<video:video>` elements within existing child sitemaps without requiring a redesign of the partitioning boundary itself.

**No Speculative Implementation:** Consistent with Architecture Philosophy Principle 6 (Phase 5A §1), this section documents *only* the readiness — it does not define a video content model, video-specific metadata fields, or video sitemap schema, since no approved requirement in Phases 1–5B currently calls for one.

### 6.9 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11, 3.13, 4.9, and 5.8:

1. **Build-Time Inclusion Parity Check:** The generated sitemap's URL set is programmatically diffed against the Section 6.4 inclusion-rule evaluation run independently over the full published-content graph — any discrepancy (a URL present in one but not the other) fails the build, directly operationalizing Section 1.4's Architectural Goal 1 (Zero Unintended Non-Indexable Pages) as a two-sided guarantee: nothing indexable-and-promotable is missing from the sitemap, and nothing excluded by Section 6.4's rules is mistakenly present.
2. **`<lastmod>` Format and Recency Validation:** Every entry's `<lastmod>` is validated as a well-formed date and checked to be chronologically consistent with (never later than) the build/generation timestamp itself — catching any clock-skew or data-integrity anomaly in the underlying `updatedAt` field before it reaches a published sitemap.
3. **Sitemap Index Structural Validation:** The top-level sitemap index (Section 6.3) is validated to correctly reference every child sitemap with a resolvable, canonical-host-consistent URL (Section 4.2 Rule 1) — reusing the same canonical-host configuration constant already governing Sections 2, 4, and 5, so the sitemap can never point to a non-canonical host variant of itself.
4. **Cross-Reference to robots.txt (Section 5.8):** Build-time validation confirms the `Sitemap:` directive in `robots.txt` (Section 5.4) points to the exact sitemap-index URL this section's generator produces — a single check spanning both Section 5 and Section 6's validation scope, preventing the two artifacts from independently drifting.
5. **Per-Child-Sitemap Size Governance:** Each child sitemap (Section 6.3) is checked against standard sitemap protocol URL-count and file-size ceilings at build time, triggering the Location-specific sub-partitioning readiness provision (Section 6.3) automatically flagged (not automatically executed) if a threshold is approached — a build warning rather than a failure, since crossing this threshold is a scale milestone requiring a deliberate partitioning decision, not an error condition.

### 6.10 Sitemap Generation Flow

```
Build/deploy triggered, or scheduled sitemap revalidation window
elapses (Section 6.2 — moderate, time-based cadence per
Phase 5A §7.5)
        │
        ▼
For each of the seventeen Repository interfaces (Phase 5B §6.1):
  listPublished() invoked — identical method already used by
  every other public read path, no sitemap-specific query
        │
        ▼
Section 6.4's inclusion rules applied per entity:
  status/deletedAt/noIndex/ARCHIVED/canonical-override checks
        │
   ┌────┴────┐
 excluded    included
   │           │
   │           ▼
   │      Resolve canonical URL (Section 4.6/4.10's shared
   │      resolveCanonical() function — identical source used
   │      by <link rel="canonical">, og:url, and JSON-LD)
   │           │
   │           ▼
   │      Resolve <lastmod> from entity.updatedAt (Section 6.5)
   │           │
   │           ▼
   │      Assign to Bounded-Context child sitemap partition
   │      (Section 6.3)
   │           │
   ▼           ▼
(no entry)  Entry written to appropriate child sitemap
        │
        ▼
Child sitemaps assembled; sitemap index generated referencing
all child sitemaps (Section 6.3)
        │
        ▼
Build-time validation suite executed (Section 6.9)
        │
   ┌────┴────┐
  fail       pass
   │           │
   ▼           ▼
BUILD FAILS   Sitemap index + child sitemaps deployed to CDN,
(Phase 5B      cached per Phase 5A §7.5's moderate revalidation
 §5.5-class     window; robots.txt's Sitemap: directive (Section
 governance)    5.4) already points to the stable sitemap-index URL
```

**Key Property, Consistent with Sections 2.12/3.12/4.10/5.9:** The sitemap generator draws from the exact same `listPublished()` Repository methods and the exact same `resolveCanonical()` function already powering every page's own `<link rel="canonical">` tag — there is no scenario in this architecture where a page's self-declared canonical URL could differ from its sitemap-listed URL, since both trace to the identical shared resolution function. The sitemap is architecturally incapable of asserting a URL inconsistent with what the page itself asserts about its own identity.

---


**End of Section 6 — Sitemap Architecture.**

Ready to proceed to the next section (Internal Linking Implementation Architecture) on your instruction.


Sections 1–6 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 7.

---

# 7. Internal Linking Architecture

### 7.1 Internal Linking Philosophy

Internal linking is treated as the **technical realization of relationships already declared as typed data**, not an independent editorial or presentational layer laid on top of finished pages. Every internal link this architecture specifies traces to one of two already-frozen sources: (1) an explicit typed reference field on a Phase 5B §3 domain model (e.g., `Service.relatedCaseStudyIds`), or (2) a structural relationship already defined in the Information Architecture (IA Phase 2 §13, §15) — the Internal Linking Blueprint and Content Relationships map. This section's role is to specify **how** those already-approved relationships become actual rendered `<a>` elements, following the exact discipline Section 3.11 established for structured-data entity linking: no internal link may assert a relationship the underlying content model doesn't itself contain, and conversely, no typed relationship field may go unexpressed as a visible link without a documented reason.

**Consistency with the Structured-Data Graph:** Because Section 3.11 already established that JSON-LD relationships trace to the same typed reference fields, internal linking and structured data are two renderings of one underlying relationship graph — a human clicking a "Related Case Studies" link and a crawler parsing a `Service` node's implicit case-study association (Section 3.6's scope note) are being told the same fact through two different channels. This section never introduces a link that structured data doesn't know about, or vice versa, beyond the specific, named scope exceptions already documented in Section 3.6.

**Governing Test:** Consistent with Section 1.1's "does this make genuinely present content more legible, or manufacture content solely for machines" principle, every link specified in this section exists because a human user benefits from it (per the UX Blueprint's journeys, Phase 3) — link placement is never justified by SEO value alone, divorced from genuine navigational or informational usefulness to the visitor reading that page.

### 7.2 Link Equity Distribution

**Governing Principle:** Link equity distribution is not manipulated through artificial means (hidden links, disproportionate footer link-stuffing, or link-equity-optimized-but-user-hostile placement) — it is an emergent property of the Page Hierarchy (Phase 5B-adjacent IA Phase 2 §5) and the Internal Linking Blueprint's structural rules (IA §13), which this section implements faithfully rather than re-optimizes around.

**Structural Equity Flow, By Hierarchy Level:**
- **Level 0 (Homepage):** Receives the highest inbound link count by construction — every Level 1 hub is one click from it, and it is the universal `Organization`/`WebSite` schema anchor (Sections 3.3–3.4). It distributes equity outward to all Level 1 hubs via the persistent header navigation (Section 7.6).
- **Level 1 (Category Hubs — Services, Industries, Locations, Blog, Case Studies, About):** Receive equity from the Homepage and from every Level 2 child page's "back to hub" contextual link (Section 7.5), concentrating equity at the hub before it fans back out — this is the direct link-equity expression of the Hub & Spoke pattern (Section 7.3).
- **Level 2 (Detail Pages):** Receive equity from their parent hub, from sibling cross-references (Section 7.4), and from any Level 3 conversion page's upstream context (rare, since conversion pages are typically link *targets*, not link *sources*, per Section 7.5).
- **Level 3 (Conversion/Utility Pages):** Deliberately **equity sinks, not equity distributors** — `/free-audit`, `/consultation`, `/contact` receive substantial inbound linking (every CTA Band, per Design System Phase 4 §26.4, links here) but themselves link outward minimally, consistent with UX Phase 3 §10's framing of these as action-focused, low-distraction destinations rather than further navigational hubs.

**No Artificial Equity Sculpting:** This architecture does not employ `rel="nofollow"` on internal links as an equity-sculpting technique (a historically common but since-devalued practice) — every internal link in this system passes full link equity by default, consistent with Section 5.3's earlier ruling that `follow` is the universal, non-conditional directive; equity distribution is governed entirely through *structural* decisions (which pages link to which, per Sections 7.3–7.4), never through selective `nofollow` application on individual links.

### 7.3 Hub & Spoke Strategy

**Direct Implementation of IA Phase 2 §13's Core Principles:** This subsection specifies the mechanical link-rendering rules that satisfy the two already-frozen linking principles — "hub-to-spoke linking" and "spoke-to-hub linking":

| Direction | Rule | Source Data | Rendered Location |
|---|---|---|---|
| **Hub → Spoke** | Every Service/Industry pillar page links to all of its directly subordinate content | Service hub links to every `Service` entity via `listPublished()` (Phase 5B §6.1); Industry hub links to every `Industry` entity identically | Hub page's card-grid body (Design System Phase 4 §13, Card System) |
| **Spoke → Hub** | Every Service/Industry detail page links back to its parent hub | The route pattern itself (IA §4 — `/services/[service]` implies `/services` as parent) — no additional relationship field needed, since hub membership is structural, not a modeled relationship | Breadcrumb trail (deferred to a future section per your instruction) **and** an explicit in-content link, since breadcrumbs alone are not sufficient — Section 7.5 governs the in-content instance |
| **Pillar → Cluster (Blog)** | Service/Industry pillar pages link to relevant Blog cluster content | `Service`/`Industry` pages surface Blog Posts where `BlogPost.relatedServiceId` (Phase 5B §3.4) matches the current Service — a reverse lookup, not a field stored on `Service` itself | Dedicated "Related Reading" section, positioned per UX Phase 3 §6's Service Page Journey scroll order (after Proof, before FAQ) |
| **Cluster → Pillar (Blog)** | Every Blog Post links back to its associated Service pillar | `BlogPost.relatedServiceId` (Phase 5B §3.4) — direct forward reference | In-content contextual link (Section 7.5) and/or end-of-post CTA context, per UX Phase 3 §7's Blog Reading Journey |

**Why Reverse Lookups Are Architecturally Sound, Not a Workaround:** The Pillar → Cluster relationship above is resolved by querying Blog Posts *whose* `relatedServiceId` matches the current Service, rather than maintaining a duplicate `relatedBlogPostIds` array on `Service` itself. This is a deliberate modeling choice consistent with Phase 5B's Data Architecture Philosophy (§1, Principle 3 — "Single Source of Truth Per Entity"): storing the relationship once, on the Blog Post (the more naturally "owning" side of a one-to-many relationship), and resolving it bidirectionally via query rather than data duplication, avoids the exact synchronization-drift risk that duplicating the reference in both directions would introduce.

### 7.4 Cross-Entity Relationships

Beyond the strict Hub & Spoke pattern (Section 7.3), the following cross-entity links are rendered, each traceable to a specific Phase 5B §3 typed reference field — this table is the internal-linking counterpart to Section 3's structured-data field-mapping tables, applied to visible `<a>` elements rather than JSON-LD properties:

| Source Entity | Target Entity | Source Field (Phase 5B §3) | Rendered As |
|---|---|---|---|
| Service | Case Study | `relatedCaseStudyIds` | "Proof" card-grid section (UX Phase 3 §6 Scroll Journey, step 5) |
| Service | Industry | `relatedIndustryIds` | "Who This Is For" or cross-sell section |
| Industry | Service | `recommendedServiceIds` | Primary service-recommendation card grid (UX Phase 3 §27.3's core purpose for this field) |
| Industry | Case Study | `relatedCaseStudyIds` | Industry-matched proof section |
| Case Study | Industry | `industryId` | Contextual tag/link near hero (per UX Phase 3 §8 Case Study Journey's "client/industry snapshot") |
| Case Study | Service | `serviceId` | Contextual tag/link near hero |
| Case Study | Testimonial | `testimonialId` | Embedded testimonial block (not a separate navigable link — Testimonials are not independently routable per Phase 5B §3.10's note) |
| Blog Post | Blog Post (self-referential) | `relatedPostIds` | "Related Posts" grid (UX Phase 3 §7 Scroll Journey, step 8) |
| Location | Location (self-referential) | `neighboringCityIds` | "Nearby Locations" section (IA §11.2's explicit rationale) |
| Location | Case Study | `relatedCaseStudyId` | Local proof section, where present |
| Author | Team Member | `linkedTeamMemberId` | Byline "About the Author" link, where a staff link exists |
| FAQ Item | (host page only) | `associatedPage(s)` | Not an independent link target — governs *which pages embed* the FAQ item (Section 7.5's scoped-embed logic), not a link the FAQ item itself renders |

**Completeness Discipline:** Every relationship field cataloged across Phase 5B §3.1–3.11 that has a plausible, user-meaningful link rendering appears in this table. Fields intentionally excluded (e.g., `Service.targetKeywords`, internal-only per Phase 5B §3.1) are excluded because they have no corresponding link-worthy relationship, not because of an oversight — mirroring the same rejection-criterion discipline already applied to structured-data schema selection in Section 3.2.

### 7.5 Contextual Linking Rules

**In-Content vs. Structural Links — A Deliberate Distinction:** Sections 7.3–7.4 specify *structural* links (rendered in dedicated sections — card grids, related-content blocks) that exist regardless of surrounding prose. **Contextual links** are those embedded *within* `RichContent` body text itself (Phase 5B §4.5) — e.g., a Blog Post's prose mentioning "our approach to local SEO" with "local SEO" hyperlinked to the corresponding Service page.

**Governance Rule for Contextual Links:** A contextual, in-prose link is only ever inserted where the referenced entity is *already* a valid typed relationship for that content item (per Section 7.4's table) or where it points to a Level 1 hub (Services, Industries, Blog, Case Studies) that requires no relationship modeling at all, since hub pages are universally linkable navigational anchors. This prevents contextual linking from becoming an unconstrained, editorially-arbitrary practice disconnected from the modeled relationship graph — an editor cannot casually hyperlink an arbitrary phrase in a Blog Post's body to an unrelated Service page without that relationship first existing as a proper `relatedServiceId` reference (Phase 5B §3.4), preserving Section 7.1's "no link may assert an unmodeled relationship" discipline even at the prose level.

**Density Governance:** Consistent with UX Phase 3 §3's Information Consumption Strategy chunking rules, contextual links within body content are capped at a reasonable density (no more than one contextual link per ~150–200 words of `RichContent`) to avoid the link-stuffing anti-pattern this architecture's "no artificial equity sculpting" principle (Section 7.2) already rejects — link density is a content-quality concern here, not merely an aesthetic one.

**FAQ Scoped-Embed Linking (extends Section 3.9's two-context model):** Where a `FAQItem` is embedded on a Service/Industry/Location page (Phase 5B §3.8's `associatedPage(s)`), its `answer` text may contain a contextual link back to that same host page's other sections or to a directly related entity — but never to an unrelated page, applying the identical governance rule above.

### 7.6 Navigation Linking

**Direct Implementation of the Navigation Domain Model (Phase 5B §3.12):** Header navigation links are not hand-coded per page but rendered entirely from the singleton `Navigation` entity's `primaryItems` structure — meaning the internal-linking architecture for header navigation is, in practice, *already fully specified* by the domain model itself (Phase 5B §3.12's `NavItem` shape, mega-menu vs. dropdown `type` discriminator).

**Universal Reach:** Because `Navigation` is fetched on every page render via the singleton-caching pattern (Phase 5B §6.5), every page on the site carries an identical, complete set of links to every Level 1 hub — satisfying IA Phase 2 §13's "no page more than 3 clicks from homepage" rule for all hub-level content by construction, not through per-page link curation.

**Mega-Menu Link Equity Consideration:** The Services mega-menu (UX Phase 3 §15, Design System Phase 4 §26.2) renders links to all 8–11 individual Service pages from every single page on the site — this is architecturally acceptable and consistent with Section 7.2's no-artificial-sculpting stance precisely *because* it reflects a genuine, user-beneficial navigational structure already approved in the UX Blueprint, not a link-equity-optimization tactic dressed as navigation.

### 7.7 Footer Linking

**Direct Implementation of the Footer Domain Model (Phase 5B §3.13):** Identical governing logic to Section 7.6 — footer links render from the singleton `Footer` entity's `columns` structure, which IA Phase 2 §3 already specified mirrors the primary navigation's Services/Industries categories while additionally surfacing secondary-priority pages (FAQ, Testimonials) not present in the header.

**Footer's Distinct Equity Role:** Where the header navigation (Section 7.6) distributes equity primarily to Level 1 hubs, the Footer's inclusion of `/faq`, `/testimonials`, and legal pages (Phase 5B §3.13's `legalLinks`) gives these Level 3/utility pages a baseline of site-wide inbound linking they would not otherwise receive from the Hub & Spoke structure (Section 7.3) alone — satisfying IA Phase 2 §13's orphan-prevention rule (minimum two inbound links per page) for exactly this category of page that sits outside the primary hub hierarchy.

**No Footer Link-Stuffing:** Consistent with Section 7.2, the Footer's four-column structure (Phase 5B §3.13, mirroring IA §3) is fixed and finite — it is not expanded opportunistically to include every possible internal link for equity-distribution purposes; its scope is exactly the set of links IA Phase 2 §3 already approved, no more.

### 7.8 Related Content Strategy

**Consolidation of Prior Sections:** "Related content" as a UX pattern (UX Phase 3 §26.5's Card component, used for Related Posts, Related Case Studies, etc.) is the rendering surface for the relationship fields already cataloged in Section 7.4 — this subsection specifies the **selection and ordering logic** for those related-content blocks, which Section 7.4 did not yet address.

**Selection Logic:**
- Where a relationship field is a bounded array (`relatedCaseStudyIds`, `relatedPostIds`, `neighboringCityIds` — all capped per their Phase 5B §3 validation rules, e.g., Blog Post's `relatedPostIds` "Max 4"), the related-content block renders the editor-curated set in the array's stored order, respecting explicit editorial curation rather than an algorithmic re-ranking.
- Where a relationship is resolved via reverse lookup (Section 7.3's Pillar↔Cluster pattern), ordering defaults to `publishedAt` descending (most recent first) — the same freshness-oriented default already implicitly used elsewhere in the system (e.g., Blog index ordering, Phase 5A §3's ISR revalidation rationale for the Blog index).

**Graceful Degradation (restates Phase 5B §5.4, applied to rendering):** Per the `publishedRelationGuard` output-validation pattern already established, a related-content block whose resolved set is empty (all references archived/unpublished, or genuinely none authored) renders as an *absent section*, not an empty-state placeholder — distinct from the Empty State System (Design System Phase 4 §21), which governs user-initiated empty results (search, filters), not passive content-relationship gaps. A missing "Related Case Studies" section is simply not rendered; it does not need to explain its own absence to the reader.

### 7.9 Anchor Text Governance

**Principle:** Anchor text is **descriptive and entity-specific by default**, never generic ("click here," "read more," "learn more") used in isolation — consistent with the Accessibility Rules already frozen in Design System Phase 4 §26 (screen-reader users navigating by link list depend on distinguishable, meaningful link text) and directly serving the same semantic-clarity goal Section 1.2 established for crawlability.

**Structural vs. Contextual Anchor Text:**
- **Structural links** (Card components, Section 7.3–7.4): Anchor text is the entity's own `name`/`title` field (e.g., a Case Study card's link text is the Case Study's `title`, Phase 5B §3.9) — this is not independently authored anchor-text copy; it is the same title already validated and displayed as the card's own heading, ensuring anchor text and destination-page identity are always in perfect correspondence.
- **Contextual links** (Section 7.5, in-prose): Anchor text is a natural-language phrase from the surrounding sentence that accurately describes the destination — never keyword-stuffed exact-match phrasing inserted purely for ranking purposes, which would violate both the "human-first" principle (Section 1.1) and current search-engine guidance treating manipulative anchor-text patterns as a negative signal rather than a positive one.

**"Learn More" Exception:** Where a card or section already carries a strong heading (the entity's `name`/`title`, per the structural-link rule above), a secondary, short "Learn More" or "Read Case Study →" style micro-link is permitted *alongside* — not instead of — the primary title-based link, since the heading has already established context and the secondary link is understood as a continuation of that same link target, not a standalone ambiguous link; this mirrors the Card System's already-approved "entire card clickable, title present" pattern (Design System Phase 4 §13).

### 7.10 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11, 3.13, 4.9, 5.8, and 6.9:

1. **Orphan Page Sweep (direct implementation of IA Phase 2 §13's minimum-two-inbound-links rule):** Build-time validation constructs the full internal-link graph (every rendered link across Sections 7.3–7.8) and confirms every `PUBLISHED`, non-`noIndex` page has at least two inbound internal links — a page falling below this threshold fails the build, operationalizing a rule that was previously a stated principle (IA §13) into an enforced invariant.
2. **Relationship-to-Link Correspondence Check:** For every typed relationship field cataloged in Section 7.4's table, build-time validation confirms a corresponding rendered link actually exists on the expected page — catching a scenario where a `Service.relatedCaseStudyIds` reference is populated in content but the rendering layer (a future Phase 7 concern) fails to surface it, which would create the exact drift between "modeled relationship" and "visible link" that Section 7.1 exists to prevent.
3. **Contextual Link Relationship-Validity Check:** Extending Phase 5B §5's validation-layer pattern, any contextual link embedded within a `RichContentBlock` (Section 7.5) is checked at build time to confirm its target either (a) corresponds to an existing typed relationship field value for that content item, or (b) points to a Level 1 hub page — a contextual link failing both conditions fails the build, enforcing Section 7.5's governance rule mechanically rather than relying on editorial discipline alone.
4. **Anchor Text Non-Genericness Check:** A lightweight build-time lint flags (as a warning, not a build failure, given the inherent fuzziness of natural-language evaluation) any contextual link using a denylisted generic anchor phrase ("click here," "read more" in isolation) — a softer validation tier than the hard-failure checks above, consistent with Section 6.9's precedent of using warnings rather than failures for judgment-calibrated (not purely structural) conditions.
5. **Structured-Data/Internal-Link Parity Check (cross-reference to Section 3.13):** Where Section 3's structured-data mapping tables (§3.5–3.10) and this section's Section 7.4 table both describe the same relationship field, build-time validation confirms both channels render consistently — neither asserting a relationship the other omits, beyond the specific, already-documented scope exceptions (Section 3.6's Service↔CaseStudy note).

### 7.11 Internal Linking Generation Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
structured data, canonical, and robots resolution (Sections
2.12, 3.12, 4.10, 5.9) — memoized, zero additional fetch;
Content Service's relationship resolution (Phase 5B §6.2–6.3)
already produced the resolved related-entity arrays this
section's rendering consumes directly
        │
        ▼
Structural links resolved (Section 7.3–7.4):
  • Hub↔Spoke pairs via route-pattern structure + listPublished()
  • Cross-entity pairs via already-resolved relationship arrays
    (Phase 5B §6.3's resolveMany(), already filtered through
    publishedRelationGuard — no additional filtering needed here)
        │
        ▼
Contextual links resolved (Section 7.5):
  • RichContentBlock scan for authored in-prose links
  • Validated against Section 7.5's relationship-or-hub rule
    at build time (Section 7.10, check 3)
        │
        ▼
Navigation/Footer links resolved (Section 7.6–7.7):
  • Singleton Navigation/Footer entities rendered identically
    on every page — no per-page computation needed
        │
        ▼
Anchor text assigned per Section 7.9's structural-vs-contextual rule
        │
        ▼
Full page assembled with all link categories present
        │
        ▼
Build-time validation suite executed (Section 7.10)
        │
   ┌────┴────┐
  fail       pass
   │           │
   ▼           ▼
BUILD FAILS   Page deployed with complete internal-link graph,
(orphan page,  sharing the identical cache/revalidation lifecycle
missing         already established for content, metadata, structured
relationship    data, canonical, and robots resolution (Sections
link, or        2.12/3.12/4.10/5.9) — no independent linking-layer
invalid         cache or regeneration cycle exists
contextual
link target)
```

**Key Property, Consistent with Sections 2.12/3.12/4.10/5.9/6.10:** Internal linking is not a separate generation pass with its own timing — it is resolved from the exact same memoized Content Service call, using relationship data already fetched and validated for structured-data purposes (Section 3), and rendered within the same build/ISR cycle as every other page element. A page's links, its metadata, its structured data, and its sitemap presence are all facets of one coherent generation event, never independently computed or independently stale relative to one another.

---

**End of Section 7 — Internal Linking Architecture.**

Ready to proceed to the next section (Breadcrumb Implementation Architecture) on your instruction.


Sections 1–7 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 8.

---

# 8. Breadcrumb Architecture

### 8.1 Breadcrumb Philosophy

Breadcrumbs are treated as a **single trail with three simultaneous representations** — visible UI component, JSON-LD structured data, and (indirectly) an internal-linking signal — never as three independently authored artifacts that happen to describe the same thing. This is the direct continuation of the discipline already established in Section 3.8 (which deferred its own detailed specification to this section) and Section 7.1's governing rule that no link may assert a relationship the underlying model doesn't contain: a breadcrumb trail is not new data, and this section introduces no new content field — it is a **derivation** from the Page Hierarchy already frozen in IA Phase 2 §5 and the route-pattern structure already frozen in IA Phase 2 §4.

**Single Computation, Multiple Renderings:** Exactly one function computes a page's breadcrumb trail; that single computed trail feeds the visible Breadcrumb component (Design System Phase 4 §26.10), the `BreadcrumbList` JSON-LD node (Section 3.8), and is available as an input to the Orphan Page Sweep and Relationship-to-Link Correspondence checks already established in Section 7.10. This section specifies that computation, closing the loop Section 3.8 explicitly left open ("full architecture... in Section [8]").

**Inheritance, Not Reinvention:** Every rule in Sections 8.2–8.3 below restates and formalizes decisions already approved in IA Phase 2 §14 and UX Phase 3 §24 — this section does not revisit *whether* breadcrumbs appear on a given page type (already decided), only *how* the trail is computed, validated, and kept in permanent sync with its structured-data twin.

### 8.2 Hierarchy Rules

**Source of Truth:** The breadcrumb trail for any given page is derived from the **Page Hierarchy levels** already defined in IA Phase 2 §5 (Level 0 Homepage → Level 1 Category Hubs → Level 2 Detail Pages → Level 3 Supporting/Utility Pages), combined with the specific route-pattern parent-child relationships already frozen in IA Phase 2 §4.

**Rule 1 — Homepage Is Implied, Never an Explicit Trail Segment:** Consistent with the `BreadcrumbList` schema convention already noted in Section 3.8 and UX Phase 3 §24's decision to omit breadcrumbs from the Homepage entirely, no trail — on any page — includes an explicit "Home" segment as a numbered `ListItem`; the trail begins at the current page's Level 1 ancestor.

**Rule 2 — Trail Depth Equals Page Hierarchy Depth, Never Deeper:** A Level 2 page's trail is exactly two segments (Level 1 hub → current page); a Level 3 page's trail, where breadcrumbs apply at all (Rule 4 below), is exactly three segments. No trail artificially inserts an intermediate segment that doesn't correspond to an actual Page Hierarchy level — e.g., a Blog Post's trail is Blog Index → Post (not Blog Index → Category → Post), since Phase 5B §3.4 models `categoryId` as a many-to-one classification, not a nested routing level (IA Phase 2 §4 confirms `/blog/[slug]` sits directly beneath `/blog`, not beneath `/blog/category/[category]`).

**Rule 3 — Multi-Parent Entities Resolve to Their Single Structural Route Parent, Not Their Richest Relationship:** Some entities carry multiple plausible "parent" relationships (e.g., a Case Study has both a `serviceId` and an `industryId`, Phase 5B §3.9) — the breadcrumb trail always resolves to the entity's **structural route parent** (`/case-studies` per IA Phase 2 §4's fixed route pattern), never to a contextually-selected relationship parent (e.g., never "Home → Healthcare → Case Study," even though `industryId` links to Healthcare). This is a deliberate constraint: breadcrumbs represent *where the page structurally lives* in the approved sitemap (IA §1), while the richer web of relationships (Service, Industry) is already fully expressed through Related Content linking (Section 7.4/7.8) — conflating the two would make the breadcrumb trail ambiguous whenever an entity has more than one relationship, which every Case Study does by design.

**Rule 4 — Exclusion List Restated (from IA §14 / UX §24), Not Modified:** Breadcrumbs are omitted entirely on the Homepage and on all Level 3 conversion-focused pages (`/free-audit`, `/consultation`, `/contact`) — this section performs no new exclusion analysis; it inherits IA Phase 2 §14's list and UX Phase 3 §24's stated rationale (breadcrumbs "add unnecessary exit-path friction at the point of conversion") verbatim.

### 8.3 Route-by-Route Breadcrumb Strategy

Applying Section 8.2's rules against the complete sitemap (IA Phase 2 §1):

| Route | Trail | Segment Count |
|---|---|---|
| `/services/[service]` | Services → {Service Name} | 2 |
| `/industries/[industry]` | Industries → {Industry Name} | 2 |
| `/locations/[city]` | Locations → {City Name} | 2 |
| `/case-studies/[slug]` | Case Studies → {Case Study Title} | 2 |
| `/blog/[slug]` | Blog → {Category Name} → {Post Title} | 3 — the one deliberate exception to Rule 2's "no artificial intermediate segment," justified below |
| `/blog/category/[category]` | Blog → {Category Name} | 2 |
| `/blog/tag/[tag]` | Blog → {Tag Name} | 2 |
| `/about/team`, `/about/methodology` | About → {Sub-page Name} | 2 |
| `/faq` | (no parent hub — top-level utility page) → FAQ | 1, or omitted entirely per the pattern below |
| `/testimonials` | (top-level utility page) → Testimonials | 1, or omitted |
| `/legal/[page]` | Legal → {Page Name} | 2 |
| `/services`, `/industries`, `/locations`, `/blog`, `/case-studies`, `/about` (hub pages themselves) | (no trail — a Level 1 page has no ancestor below Homepage to display) | 0 — breadcrumbs are not rendered on hub pages themselves, only on their Level 2 children, since a hub's own position is already fully conveyed by the primary navigation (Section 7.6) |

**Blog Post's Three-Segment Exception, Explained:** Rule 2 (Section 8.2) generally forbids inserting a non-structural intermediate segment, but Blog Post is deliberately treated differently because — unlike Case Study's dual relationship (Rule 3) — a Blog Post's `categoryId` (Phase 5B §3.4) is a **mandatory, single-valued, taxonomic classification** (not one of several equally-valid relationships), and the Blog Category index (`/blog/category/[category]`) is itself an independently canonical, sitemap-included, structurally real page (Section 4.6, Section 6.4) — meaning "Blog → Category → Post" reflects an actual, approved three-level navigational path through real pages (IA Phase 2 §8.2's taxonomy), not a fabricated hierarchy layer. This is the one case where the richer relationship *is* the structural parent, rather than a competing alternative to it (contrast with Case Study, where neither `serviceId` nor `industryId` is uniquely "the" structural parent — `/case-studies` is).

**Single-Level Utility Pages (`/faq`, `/testimonials`):** These sit directly beneath Homepage in the sitemap (IA Phase 2 §1) with no intervening Level 1 hub of their own. A one-segment trail ("FAQ" alone, with no preceding link) provides no navigational value over the already-omitted Homepage segment (Rule 1) — this architecture therefore **omits breadcrumbs on these two routes**, extending Rule 4's exclusion list by the same underlying logic (a trail that would add nothing beyond what's already conveyed by primary navigation), rather than rendering a degenerate single-segment, non-clickable "breadcrumb" that exists in name only.

### 8.4 Structured Data Alignment

**Restated Constraint (from Section 3.8, now given its full specification):** The `BreadcrumbList` JSON-LD node's `itemListElement` sequence is generated from the **identical trail computation** specified in Sections 8.2–8.3 — there is no separate structured-data-specific breadcrumb logic. The `position` value for each `ListItem` corresponds directly to its index in the trail array (1-indexed, per Schema.org convention), and each `item` URL is the resolved canonical URL (Section 2.6/4.10) of that trail segment's target page — reusing the identical canonical-resolution function already shared across metadata, Open Graph, and sitemap generation (Sections 2.12, 3.12, 4.10, 6.10).

**Enforcement Mechanism for the "Hard Architectural Constraint" (Section 3.8):** Because both the visible Breadcrumb component and the `BreadcrumbList` node consume the same single trail-computation output (Section 8.1's "single computation, multiple renderings" principle), byte-for-byte parity between visible and structured breadcrumbs is not merely validated after the fact (Section 3.13's parity check) — it is **structurally guaranteed by construction**, since there is only one trail array in the system for either representation to draw from. Section 3.13's parity check therefore functions as a regression guard against an implementation bug (e.g., a future Phase 7 component accidentally hardcoding a label rather than consuming the shared trail), not as a check against two independently-computed sources ever legitimately disagreeing.

**Segment Label Source:** Each trail segment's display label (both visible and in JSON-LD's `name` property) is the target entity's own canonical name field — `Service.name`, `Industry.name`, `Location.cityName`, `CaseStudy.title`, `BlogPost.title`, `BlogCategory.name`, `BlogTag.name` (all per Phase 5B §3) — never an independently authored "breadcrumb label" field. This mirrors Section 7.9's Anchor Text Governance rule for structural links exactly: breadcrumb segment text and the entity's own title/name are the same value, guaranteeing perpetual consistency between how an entity is named everywhere else on the site and how it appears in its own breadcrumb trail.

### 8.5 UX Integration

**Restated, Not Re-Decided:** Placement (immediately below header, above hero content), interaction behavior (every segment except the current page is clickable), and mobile truncation behavior (intelligent truncation rather than wrapping or hiding) are already fully specified in UX Phase 3 §24 and given component-level treatment in Design System Phase 4 §26.10 — this section does not restate that specification in full, only confirms that the data this section produces (Sections 8.2–8.4) is exactly and only what those already-approved component behaviors require as input: an ordered array of `{ label, href }` pairs, with the final entry's `href` omitted or treated as non-interactive (representing the current page).

**Accessibility Alignment (cross-reference, not new decision):** The `nav` landmark, `aria-label="breadcrumb"`, and `aria-current="page"` requirements already specified in Design System Phase 4 §26.10 apply directly to the trail structure this section defines — the final trail segment (current page) is the element carrying `aria-current="page"`, which is mechanically determinable from this section's output (it is always the last array element) without requiring any additional data beyond the trail itself.

### 8.6 Dynamic Generation Strategy

**Computation Timing:** Breadcrumb trail computation occurs within the same generation pass already established for every other per-page SEO artifact (Sections 2.12, 3.12, 4.10, 5.9, 6.10, 7.11) — for SSG routes (the overwhelming majority per Phase 5A §3), the trail is computed once at build time from the same memoized Content Service call; for the one `dynamicParams: true` exception (Location pages, Phase 5A §3.2), the trail is computed on-demand identically to every other per-page artifact for that route category, and persists in cache thereafter.

**Resolution Steps (generalized across all route types in Section 8.3):**
1. Determine the current entity's Page Hierarchy level and structural route parent, per the fixed route-pattern-to-parent mapping already frozen in IA Phase 2 §4 (a static lookup table, not a per-request computation — e.g., "`/services/[service]` → parent is `/services`" never varies by which specific Service is being rendered).
2. Where the structural parent itself requires a resolved display label from entity data (e.g., Blog Post's Category segment, per Section 8.3's three-segment exception), resolve that label via the entity's own already-fetched relationship data (`BlogPost.categoryId` → `BlogCategory.name`) — reusing the Content Service's already-resolved relationship output (Phase 5B §6.2–6.3), not a separate fetch.
3. Assemble the ordered trail array, terminating in the current entity's own name/title (Section 8.4) with no outbound `href`.
4. Pass the identical array to both the visible Breadcrumb component (Section 8.5) and the `BreadcrumbList` builder (Section 8.4) — no divergent processing between the two consumers.

**No Independent Caching Layer:** Because breadcrumb computation depends only on already-fetched, already-memoized data (Phase 5B §6.4's `cache()` deduplication) and a static route-to-parent lookup table, it introduces no additional fetch, no additional cache tag, and no additional revalidation trigger beyond what the page's own content generation already requires — it shares the exact cache/revalidation lifecycle already established for every other SEO artifact in this document.

### 8.7 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11, 3.13, 4.9, 5.8, 6.9, and 7.10:

1. **Trail Depth Conformance Check:** Build-time validation confirms every page's computed trail depth matches its expected depth per Section 8.3's route-by-route table (e.g., every `/services/[service]` page produces exactly a 2-segment trail) — catching any implementation drift where a future content-model change (e.g., a new intermediate entity type) silently alters trail depth without a corresponding update to this section's rules.
2. **Structural Parent Resolvability Check:** For every page's trail, build-time validation confirms every non-terminal segment's `href` resolves to an actually-existing, `PUBLISHED` page (the same referential-integrity discipline already applied to content relationships generally, Phase 5B §5.5, and to internal links specifically, Section 7.10) — a breadcrumb pointing to a hub page that doesn't exist or has been unpublished is a build failure, not a silently broken link.
3. **Visible/Structured-Data Parity Check (restated from Section 3.13, now formally owned by this section):** Confirms the `BreadcrumbList` JSON-LD sequence and the visible Breadcrumb component's rendered output are identical, segment-for-segment — as established in Section 8.4, this functions as a regression guard against the single-source-of-truth principle being violated in a future implementation, not a check against legitimate independent variation.
4. **Exclusion List Conformance Check:** Confirms breadcrumbs are absent (not merely empty) on every page in Section 8.2 Rule 4's and Section 8.3's exclusion set (Homepage, conversion pages, `/faq`, `/testimonials`, all Level 1 hub pages) — and, conversely, present on every page not in that set, closing the loop so no page silently falls outside both categories.
5. **Anchor-Text/Entity-Name Parity Check (extends Section 7.9's structural-link rule to breadcrumbs specifically):** Confirms every non-terminal segment label exactly matches its target entity's current `name`/`title` field value at build time — preventing a stale breadcrumb label from surviving an entity rename (Phase 5B §2.3's slug-change governance already requires a redirect entry on rename; this check ensures the *label*, not just the slug/URL, updates in lockstep).

### 8.8 Breadcrumb Generation Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
structured data, canonical, robots, sitemap eligibility, and
internal-link relationship resolution (Sections 2.12, 3.12,
4.10, 5.9, 6.10, 7.11) — memoized, zero additional fetch
        │
        ▼
Page excluded per Section 8.2 Rule 4 / Section 8.3's
single-level-utility-page ruling?
        │ yes ──► no trail computed; Breadcrumb component
        │          and BreadcrumbList node both omitted
        │ no
        ▼
Static route-to-parent lookup (IA Phase 2 §4) determines
structural parent segment(s) — including the Blog Post
Category-resolution step (Section 8.6, Step 2) where applicable
        │
        ▼
Trail array assembled: [ {label, href}, ..., {label: currentEntity.name, href: null} ]
        │
        ▼
Trail passed to BOTH:
  • Breadcrumb component (Design System Phase 4 §26.10) — visible rendering
  • BreadcrumbList JSON-LD builder (Section 3.8/3.12) — structured-data rendering
  (single source, two consumers — no divergent branch)
        │
        ▼
Build-time validation suite executed (Section 8.7)
        │
   ┌────┴────┐
  fail       pass
   │           │
   ▼           ▼
BUILD FAILS   Page deployed with breadcrumb trail present in both
(depth        forms, sharing the identical cache/revalidation
mismatch,     lifecycle already established for content, metadata,
unresolvable  structured data, canonical, robots, sitemap, and
parent, or    internal-link resolution (Sections 2.12/3.12/4.10/
visible/      5.9/6.10/7.11)
schema
mismatch)
```

**Key Property, Consistent with Sections 2.12/3.12/4.10/5.9/6.10/7.11:** Breadcrumb generation is not an eighth, independent SEO subsystem — it is a thin, final derivation layered on top of data already resolved for every prior section's purposes (route-pattern knowledge from Section 4/6, relationship resolution from Section 7, canonical URLs from Section 2/4), producing one trail array consumed identically by the visible UI and the structured-data graph. There is no point in this architecture where a page's breadcrumb could diverge from its own declared hierarchy position, its own canonical identity, or its own structured-data representation, because all four are computed from the same underlying route/entity relationship, within the same generation pass.

---

**End of Section 8 — Breadcrumb Architecture.**

Ready to proceed to the next section (Entity SEO / Semantic Entity Architecture) on your instruction.

Sections 1–8 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 9.

---

# 9. Entity SEO & Semantic Entity Architecture

### 9.1 Entity Philosophy

This section formalizes a distinction that has been implicit since Section 1.2 ("Entity-Based SEO") and operative throughout Sections 3, 7, and 8 without ever being named directly: an **entity**, in this architecture, is not synonymous with a **content record**. Every Phase 5B §3 model (Service, Industry, Location, Blog Post, etc.) is a *content record* — a page-producing, CMS-managed unit. A **semantic entity** is the real-world thing that content record *describes* or *represents* to a search engine or knowledge system — the business itself, a service offering as a concept, a place, a person. Most content records map one-to-one to a semantic entity; some content records (Case Study, FAQ Item) exist primarily to *support* other entities rather than to *be* one.

**Why This Distinction Matters Architecturally:** Search engines and AI retrieval systems increasingly reason in terms of entities and the relationships between them (Section 1.2's original justification), not merely pages and keywords. This section's role is to specify which of this site's content records constitute genuine, independently-identifiable semantic entities worth reinforcing as such, and which are relational/supporting data that strengthens other entities without being independent entities themselves. Getting this distinction wrong in either direction — treating every content record as an equally weighty entity, or failing to reinforce the entities that matter — dilutes the exact machine-legibility this document exists to build.

**No New Data, Only a New Lens:** Consistent with the discipline already established in Sections 3.1, 7.1, and 8.1, this section introduces no new fields on any Phase 5B model. It specifies how already-existing, already-validated fields and relationships (Phase 5B §3, IA Phase 2 §16) are organized and reinforced *as an entity graph*, extending the Entity Relationships already sketched at the IA level into full technical architecture.

### 9.2 Entity Modeling Strategy

**Classification Rule:** A Phase 5B content type is treated as a **Primary Entity** (Section 9.3) if it satisfies all three conditions:
1. It represents a genuinely distinct, nameable real-world thing (an organization, a service offering, a place, a person) — not merely a container for other content.
2. It has its own canonical, independently-routable URL (per IA Phase 2 §4).
3. Other content records reference *it* to establish their own credibility or context (i.e., it is a relationship *target* more often than a relationship *source*).

A content type failing one or more of these conditions is treated as **Supporting/Relational Data** — real, validated, structurally important content, but not itself reinforced as an independent semantic entity in the sense this section addresses.

**Application of the Rule Across Phase 5B §3's Seventeen Models:**

| Content Type | Primary Entity? | Reasoning |
|---|---|---|
| Site Settings (→ Organization) | Yes | The foundational entity every other node ultimately connects to (Section 3.3) |
| Service | Yes | Distinct offering, independently routable, referenced by Industry/Location/Case Study/Blog Post |
| Industry | Partial — see 9.2.1 below | Independently routable, but represents an audience *segment*, not a thing the business *is* or *offers* — Schema.org has no clean "Industry" entity type (Section 3.2 already noted this) |
| Location | Yes | Represents a place the business serves — genuine `LocalBusiness`/place-scoped entity where geo data exists (Section 3.5) |
| Team Member | Yes | A `Person` entity — independently nameable, referenced by Author (Phase 5B §3.7) |
| Author | Yes, where distinct from Team Member | A `Person` entity in its own right (guest contributors) |
| Blog Post | No | A `CreativeWork`, not itself a "thing" other content references for credibility — it is the content, not an entity described by content |
| Case Study | No | A `CreativeWork` referencing other entities (Service, Industry, Testimonial) — exists to reinforce *those* entities' credibility, not to be an entity itself |
| FAQ Item | No | Atomic relational content (Phase 5B §3.8), never independently identity-bearing |
| Testimonial | No | Relational proof content, referenced by/attached to other entities |
| Blog Category, Blog Tag | No | Taxonomic classification, not entities |
| Navigation, Footer, CTA | No | Structural configuration, no entity semantics apply |

**9.2.1 — Industry's Partial Status, Resolved:** Industry is architecturally treated as a **context/audience qualifier attached to Primary Entities**, not a Primary Entity in its own right — consistent with Section 3.2's original ruling that Industry has no direct Schema.org type and is "modeled as the audience/context for its recommended Services." This section confirms and formalizes that treatment: Industry pages exist, are indexable, and are internally linked (Section 7.4), but they do not themselves enter the entity graph as a node other pages reference by `@id` — they influence *how* Service and Case Study entities are framed (per-industry framing), without being framed themselves.

### 9.3 Primary Site Entities

The complete, closed set of Primary Entities this architecture reinforces, per Section 9.2's classification:

1. **The Organization** (`SEO Growth Hub` itself) — sourced from `Site Settings` (Phase 5B §3.15), the root entity every other Primary Entity ultimately connects to as `provider`, `publisher`, `worksFor`, or `parentOrganization` (Section 3.3).
2. **Each Service** — a distinct, nameable offering (Phase 5B §3.1), the entity the business's commercial identity is built from.
3. **Each Location** (where `geoCoordinates` is present, per Section 3.5's governance) — a distinct served place.
4. **Each Team Member** — a distinct, nameable person affiliated with the Organization (Phase 5B §3.11).
5. **Each Author not linked to a Team Member** — a distinct person credited for content, affiliated with the Organization only insofar as `authorId` establishes a publishing relationship (Phase 5B §3.7), not employment.

**Closed-Set Discipline:** This list is deliberately exhaustive and closed at the *type* level (not the *instance* level — there are many Service instances, but exactly five entity *categories*). No future content type is added to this list without a corresponding update to this document — a future content type (e.g., a hypothetical "Partner" or "Certification" entity, should the business introduce one) would require an explicit Section 9.2-style classification exercise before being treated as a Primary Entity, not an automatic inclusion.

### 9.4 Entity Relationships

This subsection is the semantic-entity-scoped counterpart to Section 3.11's "Entity Linking Strategy" — where Section 3.11 specified the *mechanical* `@id`-referencing discipline for JSON-LD nodes generally, this subsection specifies which relationships are considered **entity-defining** (they describe what an entity fundamentally *is* or *is affiliated with*) versus merely **contextual/promotional** (they describe supporting proof or related content, per Section 7.4's internal-linking table).

**Entity-Defining Relationships (closed set):**

| Relationship | Expressed As |
|---|---|
| Organization → offers → Service | `Organization.makesOffer` / `Service.provider` (Section 3.3, 3.6) |
| Organization → operates in → Location | `Organization.areaServed` (aggregate) / `LocalBusiness.parentOrganization` (Section 3.5) |
| Organization → employs → Team Member | `Person.worksFor` (Section 3.10 pattern, restated) |
| Author (Person) → publishes → Blog Post | `CreativeWork.author` (Section 3.7) — the relationship is entity-defining for the *Person* (it establishes their authorship identity) even though Blog Post itself is not a Primary Entity |
| Service → demonstrated by → Case Study | **Not** entity-defining — this is contextual/promotional (Section 7.4), since a Case Study does not alter what a Service fundamentally *is*, only provides evidence for it |

**Governing Distinction:** Entity-defining relationships answer "what is this entity, and to what/whom is it fundamentally connected?" Contextual relationships (the much larger set already fully catalogued in Section 7.4 and Section 3's per-schema field mappings) answer "what supporting content exists about this entity?" This section does not re-litigate Section 7.4's table — it draws a line clarifying that only a small subset of those relationships are load-bearing for entity *identity*, while the rest are load-bearing for entity *promotion and proof*, a distinction that matters for how aggressively each relationship type is reinforced across pages (Section 9.7–9.8).

### 9.5 Entity Identity

**Stable Identity Requirement:** Every Primary Entity (Section 9.3) must resolve to the exact same `@id` (Section 3.11's convention) and the exact same canonical name string (Section 8.4's "segment label source" rule, extended here to entity identity generally) everywhere it is referenced across the entire site — not merely within a single page's graph, but across every page that references that entity.

**Mechanism Guaranteeing This (restated, not re-derived):** Because every reference to a Primary Entity — whether in JSON-LD (Section 3.11), a breadcrumb segment (Section 8.4), an internal link's anchor text (Section 7.9), or a card component's heading — is sourced from that entity's single Phase 5B record (via the entity's own `id`, `slug`, and `name`/`title` field, never a locally re-typed copy), identity consistency is not a separate rule requiring independent enforcement; it is inherited for free from the Single Source of Truth Per Entity principle already established in Phase 5B §1, Principle 3. Section 9.5's contribution is naming this inherited guarantee explicitly as an *entity-identity* property, not merely a data-integrity property.

**Disambiguation for Non-Unique Names:** Where a Primary Entity's name alone is insufficient for disambiguation (Location's `cityName`, per Phase 5B §3.3's own note about same-named cities), the entity's `@id` construction (Section 3.11) incorporates the disambiguating fields already validated at the data layer (`region`, `countryCode`) — meaning entity-identity disambiguation is solved by reusing Phase 5B's existing composite-uniqueness constraint (§3.3: "composite uniqueness on `(cityName, region, countryCode)`"), not by introducing a new disambiguation mechanism at the SEO layer.

**Person Entity Identity — Team Member/Author Linkage:** Where `Author.linkedTeamMemberId` resolves (Phase 5B §3.7), the Author and Team Member records describe the **same real-world Person entity** — this architecture treats them as one semantic entity with two content-record touchpoints, meaning the `Person` node's `@id` (Section 3.11) is anchored to the Team Member's canonical page (the more complete, authoritative representation) regardless of which record (Author or Team Member) triggered the node's construction on a given page. An Author without a linked Team Member (a guest contributor) is its own distinct Person entity, with its own `@id`, anchored instead to wherever that Author's information is most fully presented (their byline context, since no independent Author page exists in the approved IA).

### 9.6 Knowledge Graph Alignment

**Restated and Extended from Section 3.3:** The Organization entity's `sameAs` array (`Site Settings.socialProfileUrls`, Phase 5B §3.15) remains the primary mechanism for connecting this site's Organization entity to an existing or emerging Knowledge Graph entry — Section 9.6 adds no new mechanism here, only confirms Organization's status as the sole entity in this architecture actively pursuing Knowledge Graph alignment at launch.

**Team Member/Person Entities — Deferred, Not Excluded:** Individual Team Member `Person` entities (Section 9.3, item 4) carry their own `sameAs` potential (Phase 5B §3.11's `linkedInUrl` field), which contributes modestly to individual E-E-A-T-adjacent disambiguation (full E-E-A-T treatment deferred to a future section per your instruction) but is not, at this site's scale, expected to independently surface in Google's Knowledge Graph the way the Organization entity might — this is noted as an accurate expectation-setting statement, not a limitation requiring a workaround.

**Service and Location Entities — No Independent Knowledge Graph Target:** Individual Services and Locations are not expected to become independent Knowledge Graph nodes (they are offerings/places *of* the Organization, not standalone public entities with their own graph presence) — their entity reinforcement value (Sections 9.7–9.8) is in strengthening the *Organization's* graph presence and in supporting rich-result eligibility (Section 3's structured data), not in becoming individually graphed entities themselves. This is a deliberate scope clarification preventing over-investment in a Knowledge-Graph outcome this architecture cannot realistically produce for every Service/Location instance.

### 9.7 Content Entity Reinforcement

**Principle:** Every piece of content produced by this site (every Blog Post, Case Study, FAQ answer) should, wherever genuinely relevant, reinforce a Primary Entity's identity and relationships rather than existing in entity-isolation — this is the practical, content-production-facing expression of Section 9.1's "entity-based, not keyword-based" philosophy.

**Mechanisms Already in Place (cross-referenced, not newly introduced):**
- **Blog Post → Service reinforcement:** `BlogPost.relatedServiceId` (Phase 5B §3.4) already ties every topically-relevant post back to the Service entity it reinforces — Section 9.7's contribution is framing this existing field as *entity reinforcement*, not merely internal linking (Section 7.3's Cluster→Pillar pattern) or topical authority (IA §17) — the same field serves all three purposes simultaneously, which is precisely the point of Entity-Based SEO (Section 1.2): one well-modeled relationship, multiple compounding benefits.
- **Case Study → Service/Industry reinforcement:** `CaseStudy.serviceId`/`industryId` (Phase 5B §3.9) reinforce the Service entity's credibility (via the `Review` node pattern, Section 3.10) and provide Industry-context framing (Section 9.2.1) — again, one relationship, already modeled, now understood additionally through an entity-reinforcement lens.
- **FAQ Item → Service/Industry/Location reinforcement:** Scoped FAQ embeds (Phase 5B §3.8's `associatedPage(s)`) reinforce the host entity by pre-emptively answering entity-specific questions in a format (Section 3.9's `FAQPage`) that both search engines and AI answer engines associate directly with that entity's page.

**No New Reinforcement Mechanism Introduced:** This subsection deliberately does not add a new field, a new relationship type, or a new content requirement — its entire contribution is confirming that the relationship architecture already frozen in Phase 5B §3 and operationalized in Sections 3 and 7 *already constitutes* entity reinforcement, and stating that explicitly so future content-strategy decisions (outside this technical document's scope) can be made with this framing in mind.

### 9.8 Cross-Page Entity Consistency

**The Consistency Guarantee, Stated Comprehensively:** Because of Section 9.5's identity mechanism, a Primary Entity's representation is guaranteed consistent across every surface where it appears — its JSON-LD `@id` and name (Section 3.11), its breadcrumb label where applicable (Section 8.4), its internal-link anchor text (Section 7.9), its canonical URL (Section 2.6/4.10), and its appearance in the sitemap (Section 6.4) — all trace to the identical Phase 5B record and the identical shared resolution functions already established across Sections 2–8. Section 9.8 does not introduce a new consistency mechanism; it names this as the culmination of every prior section's single-source-of-truth discipline, viewed specifically through the lens of "does this entity look and identify itself the same way everywhere it appears?"

**The One Deliberate Exception — Contextual Framing Without Identity Drift:** A Service entity is *framed* differently depending on context (its own pillar page presents full deliverables/process, Phase 5B §3.1; an Industry page presents it as one of several `recommendedServiceIds`; a Location page presents it in local context per Section 3.5) — this contextual variation in *presentation* is expected and correct, and does not constitute an identity inconsistency, because the entity's core identifying facts (`name`, `@id`, canonical URL) remain identical across all three contexts. Section 9.8's consistency guarantee applies to entity *identity*, not to content *framing*, which is expected and desirable to vary by context per the UX Blueprint's page-journey specifications (Phase 3 §6, §9).

### 9.9 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11, 3.13, 4.9, 5.8, 6.9, 7.10, and 8.7:

1. **Primary Entity Closed-Set Conformance Check:** Build-time validation confirms that JSON-LD `@id` generation (Section 3.11) is only ever invoked for the five Primary Entity categories enumerated in Section 9.3 — flagging (as a warning, consistent with Section 7.10's precedent for judgment-calibrated conditions) any future code path that constructs a stable `@id` for a non-Primary-Entity content type, since this would indicate either an undocumented entity-classification decision or an implementation drift from Section 9.2's rule.
2. **Cross-Page `@id` Uniqueness-Per-Entity Check:** Extending Section 3.13's cross-reference integrity check, build-time validation confirms that every occurrence of a given Primary Entity's `@id` across the *entire* generated site (not just within one page's graph) resolves to an identical string — catching the specific failure mode Section 9.5 exists to prevent (e.g., a Team Member's `@id` accidentally differing between their own bio context and a Blog Post byline referencing them).
3. **Entity-Defining Relationship Completeness Check:** Confirms every Primary Entity instance has, at minimum, its Section 9.4 entity-defining relationship correctly populated and resolvable (e.g., every Service resolves a valid `provider` reference to the Organization; every Team Member resolves a valid `worksFor` reference) — since these relationships are load-bearing for entity identity itself, their absence is treated as a build failure, not a soft warning, distinguishing this check's severity from the Section 9.7 contextual-reinforcement relationships (which remain optional/best-effort, per Phase 5B's existing "Optional" field markings).
4. **Industry Non-Entity Conformance Check:** Confirms Industry content records never accidentally acquire a stable cross-page `@id` or appear as a `provider`/`worksFor` target in any generated graph — a structural safeguard against Section 9.2.1's classification decision being silently violated by a future implementation.

### 9.10 Entity Resolution Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
structured data, canonical, robots, sitemap, internal links, and
breadcrumbs (Sections 2.12, 3.12, 4.10, 5.9, 6.10, 7.11, 8.8) —
memoized, zero additional fetch
        │
        ▼
Entity classification check (Section 9.2): is the current
page's primary content type one of the five Primary Entity
categories (Section 9.3)?
        │
   ┌────┴────┐
  yes         no (Industry, Blog Post, Case Study, FAQ Item,
   │           Testimonial, taxonomy/config types)
   ▼               │
Resolve stable @id  ▼
(Section 3.11/9.5) Entity is treated as Supporting/Relational —
   │               its structured-data node (Section 3) still
   ▼               emits normally, but with no independent
Resolve             cross-page @id-consistency obligation of
entity-defining      its own (Section 9.9, check 1)
relationships
(Section 9.4) —
already-fetched
relationship data
(Phase 5B §6.2–6.3)
consumed directly
   │
   ▼
Person-entity linkage resolved where applicable
(Author ↔ Team Member, Section 9.5) — anchors
@id to the more authoritative record
   │
   ▼
Entity representation feeds into JSON-LD graph construction
(Section 3.12), already-established internal-link anchor
text (Section 7.9), and breadcrumb label (Section 8.4) —
no separate rendering pass; entity resolution is a
data-preparation step consumed by artifacts already
specified in Sections 2–8
   │
   ▼
Build-time validation suite executed (Section 9.9)
   │
┌──┴──┐
fail   pass
 │       │
 ▼       ▼
BUILD   Page deployed with entity representation consistent
FAILS   across every prior section's output — no independent
        cache or regeneration cycle beyond what Sections
        2–8 already established
```

**Key Property, Consistent with Sections 2.12/3.12/4.10/5.9/6.10/7.11/8.8:** Entity resolution introduces no new fetch, no new cache lifecycle, and no new rendering surface — it is a **classificatory and consistency-enforcing lens** applied to data and artifacts every prior section already produces. Section 9's entire technical contribution is the closed-set Primary Entity list (9.3), the entity-defining-versus-contextual relationship distinction (9.4), and the cross-page identity guarantee this makes explicit and validatable (9.5, 9.8–9.9) — not a new pipeline stage running in parallel to Sections 2–8's already-unified generation flow.

---

**End of Section 9 — Entity SEO & Semantic Entity Architecture.**

Ready to proceed to the next section on your instruction.

Sections 1–9 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 10.

---

# 10. EEAT Architecture

### 10.1 EEAT Philosophy

Experience, Expertise, Authoritativeness, and Trust (E-E-A-T) are treated in this architecture not as a content-writing checklist but as **a set of already-modeled data relationships that this section organizes and reinforces technically** — consistent with the pattern established in Section 9.1, where a search-quality concept was shown to already be substantially satisfied by decisions frozen in Phase 5B, requiring this section to *name and technically operationalize* that existing structure rather than introduce new content requirements. Nearly every field this section discusses already exists: `Author.credentials` and `Author.bio` (Phase 5B §3.7), `TeamMember.credentials` and `.linkedInUrl` (Phase 5B §3.11), `CaseStudy.clientAuthorizationConfirmed` (Phase 5B §3.9), `Testimonial.authorizationConfirmed` (Phase 5B §3.10), and the kernel's own `updatedAt` freshness field (Phase 5B §2.2). Section 10's contribution is specifying how these fields are technically surfaced, cross-referenced, and validated so that E-E-A-T signals are structurally guaranteed present wherever they are claimed to exist, rather than being an editorial aspiration.

**Four Distinct Signals, Not One Undifferentiated "Trust" Score:** Consistent with how Section 9.1 distinguished content records from semantic entities, this section keeps Experience, Expertise, Authoritativeness, and Trust analytically separate (Sections 10.2–10.5), because each maps to a different combination of Phase 5B fields and different validation obligations — collapsing them into one generic "credibility" treatment would obscure which specific data gap undermines which specific signal.

**Governing Constraint (inherited from Section 1.1):** No mechanism in this section may fabricate or inflate a signal beyond what genuinely exists in validated content — a Team Member's `credentials` array being empty is a true state to be rendered honestly (Design System Phase 4 §21's Empty State philosophy, applied here), never a state the architecture works around by inventing placeholder credentials. E-E-A-T signals are strengthened by making genuine expertise/experience *legible*, never by manufacturing the appearance of expertise that isn't present in the underlying data.

### 10.2 Experience Signals

**Definition Within This Architecture:** "Experience" (the newest and most distinct of the four E's, per current search-quality guidance) refers to first-hand, demonstrated involvement — content reflecting that its author or the business has actually *done* the thing being described, not merely researched it. This maps most directly to the **Case Study domain model** (Phase 5B §3.9), which is architecturally the site's primary Experience-signal-bearing content type.

**Structural Reinforcement Already in Place:**
- `CaseStudy.challenge`, `.strategy`, `.results` (Phase 5B §3.9) — a three-part narrative structure that is, by its very shape, a first-hand-experience account (what was faced, what was done, what happened) rather than a generalized claim — this structure was chosen in Phase 5B specifically to encode a first-hand-experience narrative, not an arbitrary content layout.
- `CaseStudy.timeframe` and `.results` (structured `ResultMetric[]` with `beforeValue`/`afterValue`, Phase 5B §3.9) — quantified, dated outcomes are a stronger experience signal than qualitative claims alone, since they are falsifiable and specific.
- `Testimonial` entities linked via `CaseStudy.testimonialId` (Phase 5B §3.9) — third-party corroboration of the first-hand account, technically expressed as a `Review` node (Section 3.10) attached to the Service entity the case study demonstrates.

**Author-Level Experience Signals:** `Author.bio` and `Author.credentials` (Phase 5B §3.7) are the secondary Experience-bearing surface — reinforced at the Blog Post level via the byline component (already specified in UX Phase 3 §26.14 and given `Person` node treatment in Section 3.10) — an author bio that states genuine, specific prior experience (rather than generic marketing language) is an editorial-content concern outside this document's authority, but this architecture guarantees that *whatever* genuine experience content an editor supplies in `bio`/`credentials` is technically surfaced identically everywhere that Author is referenced (Section 9.5's identity-consistency guarantee, applied here to experience-signal content specifically).

**No Independent "Experience" Field Introduced:** Consistent with Section 9.1's "no new data, only a new lens" discipline, this subsection identifies which already-existing fields carry Experience-signal weight; it does not propose a new `experienceDescription` field or similar — the Case Study and Author models already capture this adequately.

### 10.3 Expertise Signals

**Definition Within This Architecture:** "Expertise" refers to demonstrated depth of knowledge in a subject — distinct from Experience (having done something) in that Expertise can be demonstrated through explanatory, methodological, and educational content even absent a specific first-hand narrative.

**Primary Expertise-Bearing Content Types:**
- **Service pages' `processSteps` and `deliverables`** (Phase 5B §3.1) — a page that specifies *how* the work is actually done (methodology) rather than only *what* is delivered demonstrates expertise more strongly than outcome-only marketing copy; this structural requirement was already built into the Service domain model (both fields marked "Required, Min 1 item") specifically to force this level of methodological specificity at the data layer.
- **Blog Post `body`/`directAnswer`** (Phase 5B §3.4) — the entire Editorial bounded context (Phase 5B §2.1) exists substantially as an Expertise-signal-generating mechanism; the `RichContentBlock` structure (Phase 5B §4.5) supporting headings, lists, and structured explanation over undifferentiated prose is itself an expertise-legibility mechanism, not merely an AEO-extraction mechanism (Section 1.3's observation that these mechanisms serve multiple ecosystems simultaneously applies here too — the same structural choice serves AEO extractability and Expertise demonstration at once).
- **`About/methodology` page** (IA Phase 2 §7.4's routing, PRD-level content requirement) — the single page in the sitemap most explicitly dedicated to Expertise signaling at the *Organization* level rather than per-content-item level; this page's role in the E-E-A-T architecture is to provide the durable, stable "how we think about this discipline" statement that individual Service/Blog content can reference rather than restate.

**Distinguishing Expertise From Authoritativeness (Section 10.4 boundary):** Expertise, in this framework, is what content *demonstrates through its own substance* (methodology depth, explanatory rigor); Authoritativeness (next subsection) is what *other signals confer upon* the content or its author (credentials, third-party recognition, citation). A page can demonstrate expertise through excellent methodology content even for a brand-new author with no external authority signals yet — the two are correlated in practice but architecturally distinct, and this document tracks them as such because they have different data sources and different validation obligations (Section 10.9).

### 10.4 Author Authority

**Primary Data Source:** `Author` (Phase 5B §3.7) and, where linked, `TeamMember` (Phase 5B §3.11) — already justified in their original Phase 5B specification explicitly as "E-E-A-T signal" fields; this subsection specifies their technical reinforcement architecture.

**Reinforcement Mechanisms:**
1. **Byline Presence, Universal and Non-Optional:** Every Blog Post has a required (`Required`, Phase 5B §3.4) `authorId` — there is no anonymous or unattributed content type in the Editorial bounded context. This is a structural guarantee, not an editorial best practice: the domain model makes authorless content impossible to publish.
2. **Person Entity Consistency (restated from Section 9.5):** An Author's authority signal — their `credentials`, their `bio`, their `sameAs`-eligible `linkedInUrl` where Team-Member-linked — is guaranteed identical everywhere they are referenced, meaning authority signal *strength* does not vary by which page happens to reference the author; a reader (or crawler) encountering the same author across five Blog Posts sees a consistent, cumulative authority signal rather than five fragmented, potentially-inconsistent partial profiles.
3. **`worksFor` / Organizational Affiliation:** Where `Author.linkedTeamMemberId` resolves, the `Person` node's `worksFor` property (Section 3.10) connects individual author authority to organizational authority (Section 10.6) — an author's authority is not purely personal/freestanding; it is reinforced by, and reinforces, the Organization entity's own standing.
4. **Guest Contributor Handling:** Where `Author.linkedTeamMemberId` is `null` (a non-staff contributor, Phase 5B §3.7), the architecture does not fabricate an organizational affiliation — the `Person` node has no `worksFor` claim in this case, an honest representation consistent with Section 10.1's anti-fabrication governing constraint, even though this means guest-contributed content carries a structurally weaker organizational-authority signal than staff-authored content. This is treated as an accurate, not a deficient, representation.

**Deliberate Non-Mechanism:** This architecture does not implement author-level aggregate metrics (e.g., "posts published," "years active") as a rendered authority signal — no such field exists in Phase 5B §3.7, and introducing one purely for E-E-A-T display purposes would violate the "no new data invented for signaling purposes" discipline (Section 10.1); genuine authority is expressed through the substance of `bio`/`credentials`, not through metadata about content volume.

### 10.5 Trust Architecture

**Definition Within This Architecture:** "Trust" is treated as the umbrella signal that the *other three* (Experience, Expertise, Authoritativeness) are, according to current search-quality frameworks, ultimately in service of — but this architecture identifies a distinct, additional technical component specific to Trust: **verifiability and authorization integrity**, which is where Phase 5B's authorization-gating mechanism becomes directly relevant.

**Primary Mechanism — Authorization Gates as a Trust-Architecture Feature, Not Merely a Legal Safeguard:** `CaseStudy.clientAuthorizationConfirmed` and `Testimonial.authorizationConfirmed` (Phase 5B §3.9, §3.10, enforced at the Validation Layer per Phase 5B §5.3, and audit-logged per Phase 5B §3.18.3) were originally justified in Phase 5B as a legal/compliance safeguard (PRD §10.6). This section reframes — without altering — that same mechanism as a **Trust-signal architecture**: proof content that has passed an enforced, audited authorization gate is content this architecture can *technically guarantee* is genuine and consented-to, which is a stronger, more defensible trust foundation than proof content that merely *claims* to be authentic without a corresponding enforcement mechanism. Section 10.5 introduces no new gate — it identifies the existing gate as doing double duty.

**Secondary Mechanism — Freshness as Trust:** The kernel's `updatedAt` field (Phase 5B §2.2), already reused for ISR revalidation (Phase 5A §7.3), structured-data `dateModified` (Section 3.7), and sitemap `<lastmod>` (Section 6.5), serves a fourth purpose here: content that is demonstrably, verifiably current (not merely claimed to be current in prose, e.g., "updated regularly") is a trust signal in its own right, particularly for the fast-evolving AEO/GEO subject matter this business is built around (Section 1.1's AI-Search-Readiness objective) — stale, unmaintained content on a genuinely fast-moving topic is itself a trust-eroding signal, and this architecture's freshness-tracking discipline directly mitigates that risk.

**Tertiary Mechanism — Legal/Transparency Page Presence:** `/legal/privacy-policy`, `/legal/terms-of-service`, `/legal/cookie-policy` (already fully specified in IA Phase 2 §1, §3, PRD §10.5) function as baseline Trust-signal infrastructure — their mere presence, consistent linking (Section 7.7's Footer treatment), and accurate content are foundational trust hygiene this architecture already guarantees is uniformly accessible sitewide via the Footer's non-negotiable `legalLinks` minimum (Phase 5B §3.13: "Min 3").

### 10.6 Organizational Trust

**Primary Data Source:** `Site Settings` (Phase 5B §3.15) via the `Organization` entity (Section 3.3, Section 9.3 item 1) — the site-wide trust anchor every Primary Entity ultimately connects to.

**Reinforcement Mechanisms:**
1. **Contact Transparency:** `Site Settings.contactEmail`/`.contactPhone` (Phase 5B §3.15), surfaced both in the `Organization` schema's `contactPoint` (Section 3.3) and on the `/contact` page itself — a business that is genuinely, verifiably reachable is a foundational organizational-trust signal, and this architecture guarantees the *same* contact information is used everywhere (schema, footer, contact page) via the singleton-source discipline already established (Phase 5B §3.15, §6.5).
2. **`sameAs` Social Proof:** `Site Settings.socialProfileUrls` (Phase 5B §3.15) connects the Organization entity to its externally-verifiable presence — already specified for Knowledge Graph purposes (Section 9.6), this same mechanism doubles as an organizational-trust signal (an organization with consistent, cross-referenced external presence is more verifiable than one existing only on its own domain).
3. **Team Transparency:** The `/about/team` page (IA Phase 2 §7.4 routing, `TeamMember` domain model Phase 5B §3.11) — a business that names real people behind its work, each with genuine credentials and photo (mandatory `altText`, Phase 5B §3.17), is a stronger organizational-trust signal than an anonymous-feeling agency site; this architecture guarantees every `TeamMember` entity is technically complete (required `photo`, `bio`, `title`, Phase 5B §3.11) before it can be published, meaning a "team" page can never ship with thin, placeholder-quality entries.
4. **Methodology Transparency:** `/about/methodology` (already discussed in Section 10.3 as an Expertise signal) simultaneously functions as an Organizational Trust signal — a business willing to publicly and specifically explain *how* it works is inherently more trust-bearing than one that only describes outcomes, which is precisely the rationale UX Phase 3 §13 ("Trust Building Strategy") already established at the UX-blueprint level ("Transparency as Differentiator").

### 10.7 Evidence & Proof Strategy

**Consolidation Point:** This subsection names the specific set of already-modeled content types functioning as this architecture's Evidence layer — the concrete, falsifiable artifacts that substantiate the Experience/Expertise/Authority/Trust signals discussed in Sections 10.2–10.6, rather than leaving those signals as unsubstantiated claims.

**The Evidence Set (closed, per already-approved Phase 5B models):**

| Evidence Type | Source Model | What It Substantiates |
|---|---|---|
| Case Study | Phase 5B §3.9 | Experience (10.2), Service credibility (via `Review` node, Section 3.10) |
| Testimonial | Phase 5B §3.10 | Trust (10.5, via authorization gate), third-party corroboration |
| Team Member credentials | Phase 5B §3.11 | Expertise (10.3), Author Authority (10.4) |
| Client logos (implicit — Testimonial's `companyName`/`companyLogo`) | Phase 5B §3.10 | Organizational Trust (10.6) — recognizable-brand association |
| Methodology content (`/about/methodology`) | Content page, not a distinct Phase 5B model | Expertise (10.3), Organizational Trust (10.6) |
| FAQ answers | Phase 5B §3.8 | Expertise (10.3, via directness/specificity), and doubly serves AEO (deferred to next section) |

**Governing Rule — Evidence Must Be Load-Bearing, Not Decorative:** Consistent with Section 10.1's anti-fabrication principle and Section 7.1's "no link may assert an unmodeled relationship" discipline, every Evidence-type instance rendered on a page must trace to an actual resolved relationship (Section 7.4's table — `Service.relatedCaseStudyIds`, `CaseStudy.testimonialId`, etc.), never a generically-inserted "trust badge" disconnected from the specific entity it's meant to substantiate. A Service page's evidence must be evidence *for that Service specifically*, not a generic sitewide trust-signal block repeated identically across unrelated pages — this is the E-E-A-T-specific application of Section 9.8's cross-page consistency principle, applied to evidence relevance rather than entity identity.

### 10.8 Cross-Page Trust Consistency

**Direct Extension of Section 9.8:** Just as Section 9.8 guaranteed a Primary Entity's *identity* is consistent everywhere it appears, this subsection guarantees that a Primary Entity's *trust/authority signals* are consistent everywhere it appears — an Author's credentials do not appear complete on one Blog Post's byline and truncated on another; a Team Member's authorization-gated Testimonial does not display on one Case Study but a *non*-authorization-gated version elsewhere (structurally impossible, since Phase 5B §5.3's gate operates on the Testimonial record itself, not per-rendering-context).

**The One Legitimate Variation — Depth, Not Substance:** Consistent with Section 9.8's "contextual framing without identity drift" allowance, trust-signal *depth of presentation* may reasonably vary by context (a Blog Post byline shows a compact author name + date, per UX Phase 3 §26.14's "Compact" variant; the `/about/team` page shows the same Team Member's full bio and credentials, per the "Full" variant) — this is expected, UX-Phase-3-approved variation in presentation depth, not an inconsistency in the underlying trust signal itself, since both variants source from the identical, singular `TeamMember`/`Author` record.

**Validation Boundary:** Where Sections 9.9's cross-page `@id`-consistency check already guards entity identity, this subsection's trust-consistency guarantee is validated by confirming that no rendering context ever displays a *subset* of an authorization-gated entity's data that would misrepresent its authorization status (e.g., a Testimonial fragment shown without any indication it underwent the authorization gate would not be a violation per se, since the gate is a publish-precondition, not a display-requirement — but a Testimonial somehow rendering *before* its `status` reaches `PUBLISHED` would be, and this is already structurally prevented by Phase 5B §2.4's reachability rules, inherited here rather than re-implemented).

### 10.9 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11 through 9.9:

1. **Author Completeness Check:** Build-time validation confirms every `PUBLISHED` Author record has non-empty `bio` and, where feasible, at least one `credentials` entry — while `credentials` remains `Optional` at the Phase 5B §3.7 schema level (a legitimate state for some contributors), this check surfaces a **warning** (consistent with Section 7.10/9.9's precedent for judgment-calibrated, non-structural conditions) when an Author's authority-signal fields are thin, flagging it for editorial attention rather than failing the build.
2. **Authorization Gate Cross-Check (restates and extends Phase 5B §5.3/§9.1):** Confirms every `PUBLISHED` Case Study and Testimonial has both `clientAuthorizationConfirmed`/`authorizationConfirmed: true` *and* a corresponding `AUTHORIZATION_CONFIRMED` `AuditLogEntry` (Phase 5B §3.18.3) — this check already exists at the Phase 5B validation layer; Section 10.9 re-confirms it is within scope of "E-E-A-T architecture validation" specifically because Section 10.5 reframed this mechanism as a Trust-signal feature, not merely a compliance feature, meaning its correct enforcement is now also an E-E-A-T architectural guarantee, not only a legal one.
3. **Evidence Relevance Check (extends Section 7.10's relationship-to-link correspondence check):** Confirms every rendered Evidence-type element (Section 10.7) on a given page traces to an actual resolved relationship for *that specific entity* — a build-time check preventing the "generic trust badge" anti-pattern Section 10.7 explicitly prohibits.
4. **Team Member Field Completeness Check:** Confirms every `PUBLISHED` Team Member has non-empty `photo` (with `altText`, inherited from Phase 5B §3.17's mandatory rule), `bio`, and `title` — these are already `Required` fields at the Phase 5B §3.11 schema level, so this is a restated confirmation (not a new rule) that Organizational Trust (Section 10.6) is structurally incapable of shipping with an incomplete team profile.
5. **Cross-Page Consistency Spot-Check (extends Section 9.9's `@id`-uniqueness check to trust-signal fields specifically):** Confirms that wherever an Author/Team Member's `credentials`/`bio` content appears across multiple rendering contexts (compact byline vs. full profile, Section 10.8), the compact version's content is a genuine subset/truncation of the full version's content, never a divergent or contradictory account.

### 10.10 EEAT Resolution Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
structured data, canonical, robots, sitemap, internal links,
breadcrumbs, and entity resolution (Sections 2.12 through
9.10) — memoized, zero additional fetch
        │
        ▼
Does the current page's entity carry E-E-A-T-relevant fields
(Author/TeamMember credentials, CaseStudy/Testimonial
authorization state, updatedAt freshness)?
        │
   ┌────┴────┐
  yes         no (e.g., a Legal page, a Navigation-only render)
   │           │
   ▼           ▼
Resolve Person-entity authority         E-E-A-T resolution
data (Section 10.4) — reuses            step is a no-op;
already-fetched Author/TeamMember       page proceeds through
relationship data (Phase 5B §6.2–6.3)   Sections 2–9's flow
   │                                     unaffected
   ▼
Resolve authorization-gate status for
any referenced CaseStudy/Testimonial
(Phase 5B §5.3, §3.18.3) — status is
already enforced at publish-time;
this step confirms presence, does not
re-evaluate the gate itself
   │
   ▼
Resolve Evidence-type relationships
(Section 10.7) — reuses Section 7's
already-resolved relationship arrays,
filtered to only those genuinely
relevant to the current entity
   │
   ▼
Freshness signal (updatedAt) already
resolved for structured data (Section
3.7) and sitemap (Section 6.5) — no
independent fetch; referenced here as
a Trust-signal input (Section 10.5)
   │
   ▼
Resolved E-E-A-T data feeds into byline
rendering (compact/full variants, Section
10.8), Person/Review JSON-LD nodes
(Section 3.10), and Evidence-block
rendering (Section 10.7) — no separate
rendering surface introduced
   │
   ▼
Build-time validation suite executed
(Section 10.9)
   │
┌──┴──┐
fail   pass (or warning-only, per
 │      Section 10.9's checks 1 and 5's
 │      severity calibration)
 ▼       │
BUILD    Page deployed with E-E-A-T signals
FAILS    consistent across every prior section's
(missing output — no independent cache or
required  regeneration cycle beyond what Sections
field,    2–9 already established
broken
authorization
gate, or
evidence/
relationship
mismatch)
```

**Key Property, Consistent with Sections 2.12 through 9.10:** E-E-A-T architecture introduces no new fetch, no new cache lifecycle, and no new content fields — its entire technical contribution is (a) classifying which already-existing Phase 5B fields carry which of the four E-E-A-T signal types (10.2–10.6), (b) naming the authorization-gate mechanism's dual role as both compliance safeguard and trust-signal guarantee (10.5), (c) establishing Evidence-relevance and cross-page consistency as validatable, build-time-enforced properties (10.7–10.9) rather than editorial aspirations. Like Section 9, this section is a classificatory and consistency-enforcing lens over data and artifacts already produced by the unified generation flow established in Sections 2 through 9.

---

**End of Section 10 — EEAT Architecture.**

Ready to proceed to the next section (AEO — Answer Engine Optimization Technical Architecture) on your instruction.

Sections 1–10 (Phase 6) and Phases 1–5B remain frozen and unmodified. Continuing with Section 11.

---

# 11. Answer Engine Optimization (AEO) Technical Architecture

### 11.1 AEO Philosophy

Answer Engine Optimization, as established in Section 1.3, is not a separate content track from traditional SEO — it is traditional crawlability and indexability (Section 5) plus a **specific structural discipline** that makes content extractable as a self-contained, correct answer rather than merely findable as a relevant document. This section formalizes that structural discipline, and — consistent with the pattern established across Sections 9 and 10 — it introduces almost no new data: the `directAnswer` field on Blog Post (Phase 5B §3.4) and the concise-answer constraint on FAQ Item (Phase 5B §3.8) were both modeled specifically for this purpose from the outset, and the `FAQPage` schema architecture (Section 3.9) already exists. Section 11's contribution is to specify the **selection, extraction, and consistency rules** that make those already-modeled fields function as a coherent AEO system, rather than isolated, independently-behaving features.

**Answer Engines Are Not a Single Consumer:** Consistent with Section 1.3's table (traditional AI Overviews, Perplexity-class answer engines, voice assistants), this section treats "answer engine" as a category of consumer that extracts a bounded, self-contained passage from a larger page and presents it with attribution — the technical requirements that satisfy one member of this category (a concise, directly-responsive, unambiguous passage near the top of relevant content) satisfy the category as a whole. This architecture does not build separate extraction paths per named answer-engine product.

**Governing Constraint (restated from Section 1.1, applied here specifically):** AEO structural discipline must never distort content in a way that harms the human reader — a `directAnswer` paragraph is not permitted to feel like a jarring, out-of-voice insertion; it must read as a natural, well-written opening to the piece it introduces. Where AEO structural requirements and prose quality could theoretically conflict, prose quality (an editorial concern, not overridden by this document) governs the wording, while this architecture governs the *structural placement and validation* of that wording.

### 11.2 Answer-First Content Architecture

**The "Answer-First" Principle, Defined:** Content that a user or answer engine might query is structured so that the most direct, complete response to the implied question appears **first**, with elaboration, nuance, and supporting detail following — inverting the traditional narrative or scene-setting-first structure common in general web writing. This is already the governing structure UX Phase 3 §3 (Information Consumption Strategy) established at the UX level ("Headline → Summary/Direct Answer → Supporting Detail → Proof → Action") and UX Phase 3 §7 established specifically for Blog content — Section 11.2 confirms this structure as the AEO-technical requirement it always was, not a new rule.

**Structural Application Across Content Types:**

| Content Type | Answer-First Mechanism | Data Source |
|---|---|---|
| Blog Post | `directAnswer` field, rendered as the literal first content block after the title/metadata | Phase 5B §3.4 |
| FAQ Item | `answer` field, inherently answer-first by the type's own design (a question immediately followed by its answer, no preamble) | Phase 5B §3.8 |
| Service page | `outcomeStatement` (Phase 5B §3.1) functions as the answer-first element for the implicit question "what does this service deliver?" — positioned as the hero subheadline (UX Phase 3 §6) | Phase 5B §3.1 |
| Case Study | `headlineMetric` (Phase 5B §3.9) functions as the answer-first element for the implicit question "what result did this achieve?" | Phase 5B §3.9 |

**Why This Table Extends Beyond Blog Post:** Section 1.3 already established that AEO/voice/answer-engine consumption is not limited to Blog content — a query like "what results does an SEO agency get for healthcare clients" could plausibly be answered from a Case Study's `headlineMetric`, and "what does local SEO include" from a Service's `outcomeStatement`/`deliverables`. This architecture therefore treats *every* content type carrying a naturally answer-shaped field as an AEO surface, not only the Blog domain — this is the specific technical elaboration Section 11 adds beyond what Sections 1 and 9–10 already established for these fields under other names.

### 11.3 Direct Answer Modeling

**Primary Mechanism (restated in full from Phase 5B, now given its complete AEO-specific rationale):** `BlogPost.directAnswer` (Phase 5B §3.4) — "40–160 words (enforced)... the first ~100 words be a direct, extractable answer" — is validated as its **own discrete field**, separate from `body`, specifically so this architecture can guarantee its presence, length, and positional placement independent of how an editor structures the rest of the article. This field-level separation (rather than relying on the first paragraph of `body` informally serving this role) is the single most consequential AEO-architecture decision already made in this project, and Section 11.3 exists to confirm why that separation — rather than a convention applied to free-form body text — was the correct choice: a separately validated field can be build-time-enforced (Phase 5B §5.3's `superRefine` word-count check); an informal "first paragraph" convention cannot be mechanically verified at all.

**Rendering Discipline:** `directAnswer` is rendered as a visually and structurally distinct opening element (UX Phase 3 §7's "Direct-answer opening (first ~100 words, extractable for AEO/GEO)") — not merely the first sentence of `body` with no structural distinction. This matters technically because answer engines' extraction heuristics generally weight content that is structurally set apart (a lead paragraph, a summary box) more heavily than content that is merely early in a longer block — the separate field-and-render-treatment satisfies this heuristic by construction rather than by coincidence of writing style.

**Self-Containment Requirement:** A `directAnswer` value must be interpretable **without** requiring the reader to have already read the title or surrounding context — this is a validation-adjacent content-quality principle (not independently machine-checkable, and therefore not a hard build-time gate, consistent with Section 10.9's precedent of using warnings for judgment-calibrated conditions) but is stated here as the design intent the 40–160 word bound and the "direct, extractable answer" language in Phase 5B §3.4 were chosen to encourage: a self-contained answer is what makes a passage safely quotable/citable by an external system without losing meaning when extracted from its surrounding page.

**Non-Application to Other Answer-First Fields (Section 11.2's table):** `outcomeStatement` (Service) and `headlineMetric` (Case Study) are **not** independently word-count-validated for AEO-extraction purposes the way `directAnswer` is — they are already tightly bounded by their own Phase 5B validation rules (`outcomeStatement`: 10–120 chars; `headlineMetric`: a `{value, label}` pair with no elaboration) for reasons unrelated to AEO (concise hero copy, per UX Phase 3 §6/§8), and happen to satisfy the answer-first principle as a byproduct of already being short and direct. This is a deliberate scope distinction: only Blog Post required a purpose-built field because only long-form Editorial content has the length and structural freedom where an unstructured "first paragraph" could otherwise fail to be answer-shaped.

### 11.4 Question & Intent Modeling

**Primary Mechanism:** `FAQItem.question` (Phase 5B §3.8) is the system's explicit question-modeling field — every FAQ Item is, by definition, an author-declared question-intent pairing, requiring no inference or extraction from unstructured content.

**Implicit Question Modeling for Non-FAQ Content:** Blog Post titles (Phase 5B §3.4's `title`, "10–120 chars") are frequently, though not exclusively, phrased as questions or implied-question topics (per the Keyword Cluster Architecture's already-approved long-tail patterns, IA Phase 2 §18 — "what is AEO," "how does SEO work"). This architecture does not introduce a separate, formally-modeled "question" field on Blog Post distinct from `title` — the title itself, combined with the `directAnswer` field (Section 11.3), already constitutes a question-answer pairing in practice, and introducing a redundant, parallel "impliedQuestion" field would duplicate data already expressed by `title` without adding extraction value, violating the "no new data invented for signaling purposes" discipline already established in Section 10.1.

**Intent Categorization:** `FAQItem.category` (Phase 5B §3.8's `FAQCategory` enum: `PRICING | PROCESS | TECHNICAL | RESULTS_TIMELINE | AEO_GEO | GENERAL`) provides the system's only formal intent-classification layer — grouping questions by the underlying user need they address (a pricing objection, a process clarification, a results-timeline expectation) rather than by topic alone. This categorization is already fully specified at the data layer; Section 11.4's contribution is confirming this is the architecture's intent-modeling mechanism and that no parallel or competing intent taxonomy exists elsewhere in the system (avoiding the drift risk of two independently-maintained classification schemes for conceptually the same thing).

**Cross-Reference to the Keyword Cluster Architecture (IA Phase 2 §18):** The Supporting Long-Tail Pattern column of that already-approved table (e.g., "how does SEO work," "what is AEO") is the content-strategy-level source that FAQ Items and Blog Post titles are expected to draw from — this architecture's role is confirming that the *data model* (FAQItem, Blog Post) is structurally capable of representing every pattern that table anticipates, not re-deciding what those patterns should be (an editorial/content-strategy concern already settled in IA Phase 2).

### 11.5 FAQ Architecture

**Restated from Section 3.9, Reframed for AEO Specifically:** Section 3.9 already fully specified the `FAQPage` schema's two emission contexts (standalone hub, scoped embeds) and field mapping. Section 11.5 does not re-derive that architecture — it confirms the FAQ system's role as **the single most AEO-optimized content type in this architecture**, and specifies the one AEO-specific consideration Section 3.9 did not address: **answer-length discipline as an extraction-optimization concern**, distinct from the schema-conformance concern Section 3.9 already covered.

**Answer-Length Discipline (extends Phase 5B §3.8's existing validation):** `FAQItem.answer` is validated at "20–500 chars, plain/lightly-formatted text" (Phase 5B §3.8) — this range was already chosen specifically to match `FAQPage` schema's expectation of a concise, self-contained answer (Phase 5B §3.8's own justification: "deliberately constrained format to keep answers AEO-appropriate"). Section 11.5 adds one refinement: answers toward the **lower** end of this range (roughly 20–150 characters) are the strongest candidates for voice-search and direct-answer-box extraction (Section 1.3's Voice Search row), since these consumption contexts favor maximally concise responses; answers toward the **upper** end (300–500 characters) remain fully schema-valid and useful for on-page human reading and for answer-engine products that synthesize longer responses (Perplexity-class), but are less likely to be verbatim-extracted into a single-sentence voice response. This is stated as a **content-quality guideline informing editorial judgment**, not a narrower hard validation bound — Phase 5B §3.8's existing 20–500 range remains the enforced constraint; this refinement does not alter it.

**Scoped-Embed AEO Value (extends Section 3.9's two-context model):** Scoped FAQ embeds on Service/Industry/Location pages carry distinct AEO value from the standalone `/faq` hub precisely because they answer entity-specific questions in entity-specific context — "how much does local SEO cost" answered on the Local SEO service page is a stronger AEO signal for that specific query than the same question answered generically on the standalone hub, since the scoped page's surrounding entity context (Section 9's entity-reinforcement discipline) disambiguates the answer's applicability. This is the direct AEO-specific rationale for a design decision (the two-context FAQ model) that Section 3.9 already made for schema-architecture reasons — confirming the same structural choice serves both purposes simultaneously, consistent with the compounding-benefit pattern already observed in Section 9.7.

### 11.6 Featured Snippet Readiness

**Definition Within This Architecture:** "Featured snippet readiness" refers to structural formatting — lists, tables, step sequences, definition-style paragraphs — that traditional search engines' snippet-extraction algorithms are known to favor, a distinct (though overlapping) target from the AI-answer-engine extraction discussed in Section 11.7.

**Primary Mechanism:** The `RichContentBlock` discriminated union (Phase 5B §4.5) already provides the exact structural primitives featured-snippet extraction favors: `{ type: 'list'; ordered: boolean; items: string[] }` for both ordered (step-by-step) and unordered (feature/benefit) lists, and `{ type: 'heading'; level: 2 | 3 | 4; text: string }` for the clear, question-phrased subheadings that snippet algorithms use to locate a relevant passage within a longer document. Section 11.6 introduces no new block type — it confirms that the block set already frozen in Phase 5B §4.5 was sufficient for this purpose from the outset (as Phase 5B §4.5's own original justification noted: "content must be parseable at the block level... for both rendering and future structured-data/AI-extraction purposes").

**Structural Guidance, Not a New Validation Rule:** Unlike `directAnswer`'s hard word-count enforcement (Section 11.3), featured-snippet-favorable formatting (using `list` blocks for genuinely list-shaped content, using `heading` blocks at appropriate density) is an editorial-craft concern this architecture enables but does not mechanically enforce — there is no meaningful build-time check for "does this article contain a sufficient proportion of list blocks," since that would be a content-quality judgment, not a structural-integrity one. This is consistent with how Section 11.3 distinguished self-containment (encouraged, not enforced) from word-count (enforced).

**Table Support (restated from Design System, applied here for AEO purposes):** The Table System (Design System Phase 4 §20) — reserved for comparison content — is a further snippet-readiness surface where genuinely tabular content exists (e.g., a future "SEO vs. AEO vs. GEO" comparison); this architecture notes the `RichContentBlock` union (Phase 5B §4.5) does not currently include a `table` block variant, meaning comparison-table content would today be authored as a `list` block or handled as a dedicated component outside `RichContent` — flagged here as a scoped gap consistent with Architecture Philosophy's "extensibility designed for, not built out ahead of need" (Phase 5A §1): the same additive-block-variant pattern already established for future video content (Section 6.8) would apply identically here if/when genuinely tabular long-form content becomes a frequent authoring need.

### 11.7 AI Answer Extraction Strategy

**Consolidation Point:** This subsection names the complete, closed set of mechanisms — all already specified across Sections 3, 9, 10, and 11.2–11.6 — that together constitute this architecture's AI-answer-extraction strategy, confirming no separate, additional mechanism is needed beyond what has already been built for other, related purposes.

**The Extraction-Readiness Stack:**

| Layer | Mechanism | Prior Reference |
|---|---|---|
| Crawl/render access | SSG-served, fully-formed HTML; permissive AI-crawler access posture | Section 5.7 |
| Structural extractability | `RichContentBlock` discriminated union; `directAnswer` field | Section 11.2–11.3, Phase 5B §4.5 |
| Concise, schema-eligible Q&A | `FAQPage` structured data | Section 3.9, 11.5 |
| Attribution/citation-worthiness | `Person`/Author E-E-A-T signals; `dateModified` freshness | Section 10.4, 10.5 |
| Entity disambiguation | Stable `@id`, entity-defining relationships | Section 9.4–9.5 |
| Source authority | `Organization` entity, `sameAs` linkage | Section 3.3, 9.6, 10.6 |

**Governing Observation:** No row in this stack was built specifically and only for AI-answer-extraction purposes — each was justified independently in its own section for its own primary purpose (crawlability, schema conformance, E-E-A-T, entity consistency). Section 11.7's contribution is the explicit observation that these mechanisms, taken together, are *already* a complete AI-extraction-readiness architecture — directly demonstrating Section 1.3's governing claim that "one architecture... serve[s] all six ecosystems simultaneously." This document does not add a seventh mechanism; it certifies the six already documented compose into AEO/AI-answer readiness.

**Attribution Expectation, Stated Honestly:** This architecture cannot guarantee that any specific AI answer-engine product will attribute or link back to the source page when synthesizing an answer from this site's content — attribution behavior is controlled entirely by the consuming platform, not by the source site. This section's mechanisms maximize the *likelihood* and *quality* of extraction and (where the platform chooses to attribute) the *correctness* of that attribution — they cannot compel attribution itself, an important and honest scope boundary consistent with Section 1.1's "human-first, crawler-friendly, not manufactured" governing test.

### 11.8 Cross-Page Answer Consistency

**Direct Extension of Sections 9.8 and 10.8:** Just as those sections guaranteed entity identity and trust-signal consistency respectively, this subsection guarantees that where the **same underlying question** is answered in more than one location (e.g., "how much does local SEO cost" might be addressed in a scoped FAQ on `/services/local-seo` and, differently worded, within that same page's `body` prose, or even echoed in a standalone `/faq` entry), the answers do not **contradict** one another, even though they may legitimately differ in phrasing, depth, or framing per their context (the same "contextual framing without identity drift" allowance established in Section 9.8).

**Mechanism — Why Contradiction Risk Is Already Structurally Low:** Because FAQ content is modeled once per `FAQItem` (Phase 5B §3.8) and reused via reference (`associatedPage(s)`) across its embed contexts rather than being re-authored per page (Section 3.9's two-context model reuses the *same* record, never a duplicated copy), the primary contradiction risk this subsection would otherwise need to guard against — two independently-authored answers to the same question drifting apart over time — is already substantially prevented by the reuse-not-duplication modeling decision made back in Phase 5B §3.8. Section 11.8's contribution is naming this as an **answer-consistency guarantee**, not merely a data-deduplication convenience.

**Residual Risk — Prose vs. FAQ Divergence:** The one place genuine divergence risk remains is between a scoped FAQ's answer and *unstructured* prose elsewhere on the same or a related page addressing the same underlying question in different words (e.g., a Service page's `body` content and its own scoped FAQ both touching on pricing). This is a content-governance concern this architecture flags but cannot mechanically eliminate (prose contradiction detection is not a build-time-checkable structural property) — Section 11.9 specifies this as a documented, warning-tier check rather than a false claim of full automated prevention.

### 11.9 Validation Strategy

Consistent with the validation-checkpoint pattern established across Sections 2.11 through 10.9:

1. **`directAnswer` Presence and Bound Enforcement (restates Phase 5B §5.3, confirmed in scope here):** Every `PUBLISHED` Blog Post has a non-empty `directAnswer` within its validated 40–160 word range — already a hard build-time failure per Phase 5B §5.3; Section 11.9 confirms this check is within AEO-architecture validation scope specifically because Section 11.3 established this field's AEO purpose as primary, not incidental.
2. **FAQ Answer Bound Enforcement (restates Phase 5B §5.1's schema, confirmed in scope here):** Every `PUBLISHED` FAQ Item's `answer` falls within the 20–500 character range — restated confirmation, not a new rule.
3. **Question-Field Non-Emptiness and Question-Shape Lint:** A warning-tier (not build-failing, consistent with Section 11.4's acknowledgment that question-phrasing is partly an editorial judgment) check flags any `FAQItem.question` that does not end in a question mark or begin with a recognizable interrogative word — catching likely data-entry errors (a statement mistakenly entered where a question was intended) without hard-blocking on the inherent fuzziness of natural-language question detection.
4. **Answer-First Structural Position Check:** Build-time validation confirms `BlogPost.directAnswer` is rendered as the literal first content element following title/metadata (Section 11.3's rendering discipline) — an implementation-conformance check, not a content-quality check, verifying the *position* guarantee rather than the *content* quality of the field.
5. **FAQ Reuse Integrity Check (extends Section 11.8's consistency guarantee):** Confirms every scoped FAQ embed genuinely references (via `associatedPage(s)`) an existing `FAQItem` record rather than a page ever rendering independently-authored, unreferenced "FAQ-like" content that would bypass the reuse-not-duplication guarantee — a structural check ensuring Section 11.8's core consistency mechanism cannot be silently circumvented by a future implementation shortcut.

### 11.10 AEO Resolution Flow

```
Route requested (build-time SSG or on-demand ISR, per Phase 5A §3)
        │
        ▼
Same Content Service call already used for page body, metadata,
structured data, canonical, robots, sitemap, internal links,
breadcrumbs, entity resolution, and E-E-A-T resolution
(Sections 2.12 through 10.10) — memoized, zero additional fetch
        │
        ▼
Does the current entity carry an answer-first field
(directAnswer, outcomeStatement, headlineMetric) or
resolve associated FAQ Items?
        │
   ┌────┴────┐
  yes         no
   │           │
   ▼           ▼
Resolve and position the answer-first   AEO resolution step
element as the structurally-first        is a no-op; page
content block (Section 11.2–11.3)        proceeds through
   │                                      Sections 2–10's
   ▼                                      flow unaffected
Resolve associated FAQItems (Section
11.5) — reuses Section 3.9's already-
established two-context resolution;
no separate fetch
   │
   ▼
FAQPage JSON-LD already constructed
per Section 3.9/3.12 — this flow
confirms, not reconstructs, that
emission; AEO adds no parallel
structured-data pass
   │
   ▼
RichContentBlock structure (list/heading
blocks, Section 11.6) rendered per its
already-established rendering path —
no AEO-specific rendering branch
   │
   ▼
Build-time validation suite executed
(Section 11.9)
   │
┌──┴──┐
fail   pass (or warning-only, per
 │      checks 3 and 5's severity
 │      calibration)
 ▼       │
BUILD    Page deployed with AEO-readiness
FAILS    signals consistent with every
(missing prior section's output — no
directAnswer, independent cache or
out-of-bound regeneration cycle beyond
FAQ answer,   what Sections 2–10 already
broken FAQ    established
reuse
reference)
```

**Key Property, Consistent with Sections 2.12 through 10.10:** AEO architecture introduces no new fetch, no new cache lifecycle, and — critically, unlike Sections 9 and 10 which were purely classificatory lenses — introduces exactly **one** genuinely new structural artifact already latent in Phase 5B's design: the mandatory positional and length discipline around `directAnswer`, now given its full rendering and validation specification. Every other mechanism in this section (FAQ, `RichContentBlock`, entity/trust signals) was already fully built for other purposes in Sections 3, 9, and 10; Section 11's role has been to demonstrate, name, and validate their compounding contribution to answer-engine readiness specifically.

---

**End of Section 11 — Answer Engine Optimization (AEO) Technical Architecture.**

Ready to proceed to the next section (GEO — Generative Engine Optimization Technical Architecture) on your instruction.

