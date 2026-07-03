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

