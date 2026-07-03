Phases 1–5A remain frozen and unmodified. Phase 5B builds strictly on top of them.

---

# SEO Growth Hub — Enterprise Data Layer & TypeScript Domain Models (Phase 5B)

**Document Owner:** Principal Software Architect / Senior TypeScript Architect / Senior Backend Architect / Headless CMS Architect
**Status:** Draft v1.0 — Built on Approved PRD, IA, UX Blueprint, Design System, Phase 5A
**Classification:** Internal — Foundational Blueprint Document

---

# 1. Data Architecture Philosophy

1. **Content Is Data, Not Markup** — Every field defined in this document exists because a page-level requirement from UX Phase 3 Section 27 (Content Models) demands it. No field is added speculatively; no required UX/IA field is left undefined here. This document is the authoritative expansion of Phase 3 Section 27 into engineering-grade specification.
2. **CMS-Agnostic by Construction** — Per Phase 5A Section 2.1, the specific CMS vendor is deliberately undecided. This is only safe because every model below is defined as a **pure TypeScript domain shape**, independent of any vendor's native schema format. The Data Access Layer (Section 6) is the sole translation boundary between whatever the CMS returns and what the application consumes.
3. **Single Source of Truth Per Entity** — Every content type has exactly one canonical model definition. Page-level component props (Phase 4/future Phase 7) are always *derived* from these models via explicit mapping — never redefined ad hoc per component.
4. **Fail at the Boundary, Not in the UI** — Malformed or incomplete content must be rejected at the Validation Layer (Section 5), before it ever reaches a Server Component or renders to a user. A missing required field is a build/data error, never a runtime UI bug.
5. **Explicit Relationships Over Implicit Lookups** — Every cross-content relationship identified in IA Phase 2 (Sections 15–16, Content Relationships & Entity Relationships) is modeled as an explicit, typed reference field — never inferred by naming convention or string-matching at render time.
6. **Editorial Workflow Is a First-Class Concern** — Because this is a real, operated business website (not a static one-time build), every content model includes a publishing-state field. Content governance (draft → review → published → archived) is treated as core domain logic, not a CMS afterthought.
7. **Immutable Read Contracts** — Data returned from the Data Access Layer to Server Components is treated as `Readonly` at the type level (Section 4.7) — Server Components consume content, they do not mutate it. Mutation only ever happens through Server Actions (Section 7) against the source system, never against in-memory fetched data.

---

# 2. Domain Driven Design (DDD)

### 2.1 Bounded Contexts

The domain is divided into four bounded contexts, each with clear ownership boundaries. This directly mirrors the Topical Authority Map and Entity Relationships defined in IA Phase 2 (Sections 16–17):

| Bounded Context | Responsibility | Core Entities |
|---|---|---|
| **Marketing Content Context** | Authoritative service/industry/location positioning content | Service, Industry, Location |
| **Editorial Context** | Long-form, author-driven content and proof assets | Blog Post, Blog Category, Blog Tag, Author, Case Study |
| **Trust & Social Proof Context** | Credibility-building supporting content | Testimonial, Team Member, FAQ |
| **Site Structure & Configuration Context** | Cross-cutting, non-page-specific structural data | Navigation, Footer, CTA, Site Settings, SEO Metadata (defaults), Media Assets |

### 2.2 Shared Kernel — Base Content Entity

Every entity in the **Marketing Content**, **Editorial**, and **Trust & Social Proof** contexts shares a common structural base, avoiding duplicated field definitions and guaranteeing consistent editorial/publishing behavior across all content types.

**`BaseContentEntity` (shared kernel — not directly used, always extended):**

| Field | Type | Required | Validation | Why It Exists |
|---|---|---|---|---|
| `id` | `string` (CMS-native identifier) | Required | Non-empty, CMS-source-of-truth ID | Stable internal reference independent of slug (slugs may change; IDs must not) |
| `slug` | `Slug` (branded type, Section 4.3) | Required | Lowercase, hyphen-separated, no leading/trailing hyphens, matches `^[a-z0-9]+(?:-[a-z0-9]+)*$` | Drives URL structure per IA Phase 2 Section 4 |
| `status` | `PublishingStatus` (enum, Section 3.0) | Required | Must be one of enum values | Enables editorial workflow (Section 2.4) |
| `createdAt` | `ISODateString` | Required | Valid ISO 8601 string | Editorial audit trail |
| `updatedAt` | `ISODateString` | Required | Valid ISO 8601 string | Drives ISR revalidation freshness signals (Phase 5A Section 7.3) and blog "Updated Date" UX requirement |
| `publishedAt` | `ISODateString \| null` | Optional (null until published) | Valid ISO 8601 string if present | Distinguishes creation from actual public availability; supports scheduled publishing |
| `seo` | `SEOMetadata` (Section 3.16) | Required | Must pass `SEOMetadata` schema | Every public-facing content type must be independently optimizable per IA Phase 2 FR-28 |

**Unique Constraints (kernel-level, inherited by all extending entities):**
- `id` is globally unique within its content type.
- `slug` is unique **within its content type's route namespace** (e.g., two Blog Posts cannot share a slug, but a Blog Post and a Service may coincidentally share a slug string without conflict, since they resolve under different URL prefixes per IA Phase 2 Section 4).

### 2.3 Slug Rule Governance (Global)

- All slugs are lowercase, ASCII, hyphen-delimited, generated from the entity's primary `title`/`name` field by default but **manually overridable** by editors (required for the Redirect Handling strategy in Phase 5A Section 6.3 to function — a slug rename must be a deliberate, trackable editorial action, not an automatic silent mutation).
- Slug changes on already-published content **must** trigger a corresponding redirect-map entry (Phase 5A Section 6.3) — this is enforced as an editorial process rule documented here, with technical enforcement mechanisms (CMS webhook validation) addressed in Section 8.3.

### 2.4 Publishing Workflow (Global Enum)

```
PublishingStatus:
  DRAFT      → visible only in CMS preview context, never in production data-fetch results
  IN_REVIEW  → editorial-only state, same production visibility as DRAFT
  PUBLISHED  → eligible for production rendering (subject to publishedAt <= now)
  ARCHIVED   → excluded from navigation/listing/sitemap, but URL remains resolvable and redirect-eligible (avoids breaking inbound links/backlinks — protects Authority Goals, PRD Section 3.7)
```

The Data Access Layer (Section 6) filters exclusively for `PUBLISHED` status with `publishedAt <= now` on all public content-fetch functions — `DRAFT`/`IN_REVIEW` content is structurally unreachable from any public rendering path, not just conventionally hidden.

---

# 3. Content Domain Models

*Each model below extends `BaseContentEntity` (Section 2.2) unless otherwise noted. Only fields **additional to** the shared kernel are listed, except where a field overrides/specializes kernel behavior.*

---

## 3.1 Service

**Bounded Context:** Marketing Content
**Purpose:** Canonical representation of a service offering (IA Phase 2 Section 7; UX Phase 3 Section 27.2).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 3–80 chars | — | Primary identifier, H1 source |
| `shortDescription` | `string` | Required | 20–160 chars | — | Card/nav preview text |
| `body` | `RichContent` (Section 4.5) | Required | Non-empty structured content | — | Full pillar page body |
| `outcomeStatement` | `string` | Required | 10–120 chars | — | Hero subheadline, outcome-first framing (UX Phase 3 Section 6) |
| `deliverables` | `Deliverable[]` (`{ id: string; title: string; description: string }[]`) | Required | Min 1 item | — | "What's included" section |
| `processSteps` | `ProcessStep[]` (`{ id: string; order: number; title: string; description: string }[]`) | Required | Min 1 item, unique `order` values | — | Methodology transparency (Trust Strategy, UX Phase 3 Section 13) |
| `relatedCaseStudyIds` | `CaseStudy['id'][]` | Optional | Must reference existing, `PUBLISHED` Case Studies | → Case Study (many-to-many) | Proof injection (IA Section 15) |
| `relatedIndustryIds` | `Industry['id'][]` | Optional | Must reference existing, `PUBLISHED` Industries | → Industry (many-to-many) | Cross-hub linking |
| `faqItems` | `FAQItem['id'][]` | Optional | Must reference existing FAQ items | → FAQ (many-to-many, scoped) | Scoped FAQ + schema requirement |
| `icon` | `MediaAsset['id']` | Required | Must reference a valid `MediaAsset` of type `icon` | → Media Asset | Card/hero visual identity |
| `targetKeywords` | `string[]` | Optional (internal use) | — | — | SEO governance metadata, non-rendered |
| `category` | `ServiceCategory` (enum: `CORE_SEO \| AI_SEARCH \| CONVERSION`) | Required | Enum value | — | Drives Mega Menu grouping (UX Phase 3 Section 15) |
| `displayOrder` | `number` | Required | Integer ≥ 0 | — | Controls hub/nav ordering |

**Unique Constraints:** `slug` unique within Service namespace (`/services/*`).
**Slug Rule:** Derived from `name`, editor-overridable per Section 2.3.

---

## 3.2 Industry

**Bounded Context:** Marketing Content
**Purpose:** Industry-specific positioning page (IA Phase 2 Section 2; UX Phase 3 Section 27.3).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 3–60 chars | — | Identifier, H1 |
| `description` | `string` | Required | 20–500 chars | — | Positioning framing, persona-aligned |
| `commonPainPoints` | `string[]` | Required | Min 3 items, each 10–200 chars | — | Direct reflection of PRD Section 4 persona pain points |
| `recommendedServiceIds` | `Service['id'][]` | Required | Min 1, must reference existing `PUBLISHED` Services | → Service (many-to-many) | Cross-hub linking |
| `relatedCaseStudyIds` | `CaseStudy['id'][]` | Optional | Must reference existing, `PUBLISHED` Case Studies | → Case Study (many-to-many) | Industry-matched proof |
| `faqItems` | `FAQItem['id'][]` | Optional | — | → FAQ | Objection handling |
| `icon` | `MediaAsset['id']` | Required | Valid icon-type asset | → Media Asset | Card/hero visual identity |
| `personaKey` | `PersonaKey` (enum matching PRD Section 4 personas) | Required | Enum value | — | Traceability back to approved PRD persona definitions — ensures content authorship stays anchored to research, not drift |

**Unique Constraints:** `slug` unique within Industry namespace (`/industries/*`).

---

## 3.3 Location (City)

**Bounded Context:** Marketing Content
**Purpose:** Local-intent landing page (IA Phase 2 Section 11; UX Phase 3 Section 27.8).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `cityName` | `string` | Required | 2–60 chars | — | Identifier, H1, local keyword target |
| `region` | `string` | Required | 2–60 chars | — | Disambiguation (e.g., same-named cities across states/countries), required for `LocalBusiness` schema accuracy |
| `countryCode` | `string` (ISO 3166-1 alpha-2) | Required | 2-letter uppercase code | — | Geo/schema precision, future locale-routing readiness (Phase 5A Section 6.2/6.4) |
| `uniqueLocalContent` | `RichContent` | Required | **Minimum 300 words of non-templated content** enforced at validation layer | — | Hard anti-duplicate-content constraint per PRD Section 10.4 — this is the single most legally/SEO-critical validation rule in the entire schema, given IA Phase 2 Section 11.2's explicit warning about thin content at scale |
| `localTestimonialIds` | `Testimonial['id'][]` | Optional | Must reference existing Testimonials | → Testimonial | Local-relevance trust signal |
| `relatedCaseStudyId` | `CaseStudy['id'] \| null` | Optional | Must reference existing, `PUBLISHED` Case Study | → Case Study (one-to-one) | Local proof if available |
| `geoCoordinates` | `{ lat: number; lng: number } \| null` | Optional | Valid lat/lng ranges if present | — | `LocalBusiness` schema `geo` field, only if a physical/serviceable presence exists |
| `neighboringCityIds` | `Location['id'][]` | Optional | Must reference existing Locations, self-reference excluded | → Location (many-to-many, self-referential) | Internal linking (IA Section 11.2 — "neighboring city pages") |

**Unique Constraints:** `slug` unique within Location namespace; **composite uniqueness on `(cityName, region, countryCode)`** to prevent duplicate location entries for the same real-world place.
**Publishing Workflow Note:** Location is the one content type expected to scale into the hundreds (Phase 5A Section 3.2) — `status` transitions here are expected to be higher-volume and potentially batch-driven, but follow the identical `DRAFT → PUBLISHED` rule as every other type; no exception is made to content-quality gating for the sake of scale.

---

## 3.4 Blog Post

**Bounded Context:** Editorial
**Purpose:** Long-form educational content (IA Phase 2 Section 8; UX Phase 3 Section 27.1).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `title` | `string` | Required | 10–120 chars | — | H1, headline |
| `excerpt` | `string` | Required | 50–200 chars | — | Card preview, meta description fallback |
| `directAnswer` | `string` | Required | 40–160 words (enforced) | — | **Explicit AEO/GEO extraction field** — UX Phase 3 Section 7 mandates the first ~100 words be a direct, extractable answer; modeling it as its own field (rather than trusting free-text body openings) makes this an enforceable, validated content rule rather than an editorial guideline that can drift |
| `body` | `RichContent` | Required | Non-empty | — | Full article body |
| `categoryId` | `BlogCategory['id']` | Required | Must reference existing, `PUBLISHED` Category | → Blog Category (many-to-one) | Taxonomy/navigation |
| `tagIds` | `BlogTag['id'][]` | Optional | Must reference existing Tags | → Blog Tag (many-to-many) | Cross-content linking |
| `authorId` | `Author['id']` | Required | Must reference existing, `PUBLISHED` Author | → Author (many-to-one) | E-E-A-T signal |
| `featuredImage` | `MediaAsset['id']` | Required | Must reference valid image-type asset with `altText` populated | → Media Asset | Card display, social share, CLS prevention (Phase 5A Section 10.2) |
| `relatedPostIds` | `BlogPost['id'][]` | Optional | Max 4, must reference existing `PUBLISHED` posts, self-reference excluded | → Blog Post (many-to-many, self-referential) | Internal linking requirement (IA Section 13) |
| `relatedServiceId` | `Service['id'] \| null` | Optional | Must reference existing Service | → Service (many-to-one) | Spoke-to-hub linking |
| `faqItems` | `FAQItem['id'][]` | Optional | — | → FAQ | Per-post `FAQPage` schema eligibility |
| `readTimeMinutes` | `number` (computed, not editor-entered) | Required | Positive integer, derived at build/save time from `body` word count | — | UX scannability aid — computed field, never manually set, to guarantee accuracy |

**Unique Constraints:** `slug` unique within Blog Post namespace.
**Validation Note:** `directAnswer` word-count enforcement and `featuredImage.altText` presence are both **hard build-time validation failures**, not warnings — directly enforcing Phase 5A Section 8.1's governance rule that content-integrity issues fail the build.

---

## 3.5 Blog Category

**Bounded Context:** Editorial
**Purpose:** Top-level taxonomy grouping (IA Phase 2 Section 8.2).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 3–40 chars | — | Display label, matches IA Section 8.2's fixed 8-category taxonomy |
| `description` | `string` | Optional | Max 200 chars | — | Category index page intro copy |

**Unique Constraints:** `name` and `slug` both globally unique (flat, non-nested taxonomy — no sub-categories, per IA Phase 2's defined structure).
**Note:** Does not include `seo` override beyond the kernel default in practice, but retains it per shared kernel for category-index-page metadata.

---

## 3.6 Blog Tag

**Bounded Context:** Editorial
**Purpose:** Cross-cutting, many-to-many content labeling (IA Phase 2 Section 8; Design System Section 15).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 2–30 chars | — | Display label |

**Unique Constraints:** `name` and `slug` globally unique.
**Note:** Deliberately minimal — Tags are lightweight by design (Design System Section 15 distinguishes Tags from Badges specifically by their simple, filterable nature); no `seo` metadata override is exposed at the editorial level beyond the kernel default, since tag pages are lower-priority indexation targets than Category pages.

---

## 3.7 Author

**Bounded Context:** Editorial
**Purpose:** E-E-A-T byline entity, distinct from Team Member (an Author may be a guest contributor, not necessarily staff).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 2–80 chars | — | Byline identifier |
| `bio` | `string` | Required | 20–400 chars | — | E-E-A-T credibility signal |
| `photo` | `MediaAsset['id']` | Required | Valid image asset, `altText` required | → Media Asset | Byline component (UX Phase 3 Section 26.14) |
| `linkedTeamMemberId` | `TeamMember['id'] \| null` | Optional | Must reference existing Team Member | → Team Member (one-to-one) | Links staff authors to their full team profile; `null` for guest/external contributors |
| `credentials` | `string[]` | Optional | — | — | Additional E-E-A-T reinforcement |

**Unique Constraints:** `slug` unique within Author namespace (used for future `/about/team/[author]`-style deep links if adopted).

---

## 3.8 FAQ Item

**Bounded Context:** Trust & Social Proof
**Purpose:** Atomic Q&A unit, reused across standalone `/faq` and scoped embeds (IA Phase 2 Section 10).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `question` | `string` | Required | 10–150 chars | — | `FAQPage` schema requirement, AEO extraction target |
| `answer` | `string` | Required | 20–500 chars, plain/lightly-formatted text (not full `RichContent` — schema requires concise answers) | — | Schema requirement; deliberately constrained format to keep answers AEO-appropriate (per UX Phase 3 Section 7's "direct, concise" AEO format rule) |
| `category` | `FAQCategory` (enum: `PRICING \| PROCESS \| TECHNICAL \| RESULTS_TIMELINE \| AEO_GEO \| GENERAL`) | Required | Enum value | — | Organization within `/faq` hub (IA Section 10) |
| `displayOrder` | `number` | Required | Integer ≥ 0 | — | Content governance ordering control |

**Note:** FAQ Item does **not** extend the full `BaseContentEntity` — it has no independent `seo` field (it is never an independently routable page) but does retain `id`, `slug` (for anchor-linking), `status`, and timestamps via a reduced `EmbeddableContentEntity` base (Section 4.6 defines this distinction).
**Unique Constraints:** `slug` unique within FAQ namespace (used for deep-linking to a specific FAQ anchor).

---

## 3.9 Case Study

**Bounded Context:** Editorial
**Purpose:** Detailed proof narrative (IA Phase 2 Section 9; UX Phase 3 Section 27.4).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `title` | `string` | Required | 10–120 chars | — | Headline |
| `clientDisplayName` | `string` | Required | 2–80 chars, may be anonymized value (e.g., "A Regional Dental Practice") | — | Credibility, respects authorization constraint below |
| `industryId` | `Industry['id']` | Required | Must reference existing `PUBLISHED` Industry | → Industry (many-to-one) | Cross-hub linking, relevance filtering |
| `serviceId` | `Service['id']` | Required | Must reference existing `PUBLISHED` Service | → Service (many-to-one) | Cross-hub linking, relevance filtering |
| `headlineMetric` | `{ value: string; label: string }` (e.g., `{ value: "+300%", label: "Organic Traffic" }`) | Required | `value` and `label` both non-empty | — | Hero-level proof element |
| `challenge` | `RichContent` | Required | Non-empty | — | Narrative structure |
| `strategy` | `RichContent` | Required | Non-empty | — | Demonstrates methodology in action |
| `results` | `ResultMetric[]` (`{ id: string; label: string; beforeValue: string; afterValue: string }[]`) | Required | Min 1 item | — | Structured, data-visualization-ready proof |
| `testimonialId` | `Testimonial['id'] \| null` | Optional | Must reference existing Testimonial | → Testimonial (one-to-one) | Emotional/social proof layer |
| `timeframe` | `string` (e.g., "6 months") | Required | Non-empty | — | Realistic expectation-setting (addresses PRD Section 4 persona objection re: timelines) |
| `featuredImage` | `MediaAsset['id']` | Required | Valid image asset, `altText` required | → Media Asset | Card/hero visual |
| `clientAuthorizationConfirmed` | `boolean` | Required | Must be `true` before `status` can transition to `PUBLISHED` (enforced at validation layer, Section 5.6) | — | **Legal/compliance safeguard directly implementing PRD Section 10.6** — this is a hard publish-blocking gate, not a soft flag |

**Unique Constraints:** `slug` unique within Case Study namespace.
**Publishing Workflow Note:** This is the **only content model with a conditional publishing gate** beyond the standard workflow — `clientAuthorizationConfirmed === true` is a required precondition for `PUBLISHED` status, enforced in the Validation Layer (Section 5), not left to editorial discipline alone.

---

## 3.10 Testimonial

**Bounded Context:** Trust & Social Proof
**Purpose:** Reusable social-proof quote (IA Phase 2 Section 3; UX Phase 3 Section 27.6).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `quote` | `string` | Required | 20–400 chars | — | Core trust content |
| `authorName` | `string` | Required | 2–80 chars | — | Credibility |
| `authorTitle` | `string` | Optional | Max 80 chars | — | Context/credibility |
| `companyName` | `string` | Optional | Max 80 chars | — | Brand-recognition trust signal |
| `companyLogo` | `MediaAsset['id'] \| null` | Optional | Valid image asset if present | → Media Asset | Visual trust reinforcement |
| `authorPhoto` | `MediaAsset['id'] \| null` | Optional | Valid image asset, `altText` required if present | → Media Asset | Humanizes proof |
| `relatedServiceId` | `Service['id'] \| null` | Optional | Must reference existing Service | → Service (many-to-one) | Scoped display on service pages |
| `relatedIndustryId` | `Industry['id'] \| null` | Optional | Must reference existing Industry | → Industry (many-to-one) | Scoped display on industry pages |
| `rating` | `number \| null` | Optional | Integer 1–5 if present | — | Supports `Review`/`AggregateRating` schema |
| `authorizationConfirmed` | `boolean` | Required | Must be `true` before `PUBLISHED` (same gating pattern as Case Study 3.9) | — | Legal/compliance safeguard, PRD Section 10.6 |

**Unique Constraints:** `slug` unique within Testimonial namespace (primarily for internal reference; testimonials are rarely independently routed pages but retain kernel consistency).

---

## 3.11 Team Member

**Bounded Context:** Trust & Social Proof
**Purpose:** Staff credibility profile (IA Phase 2 Section 3; UX Phase 3 Section 27.7).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `name` | `string` | Required | 2–80 chars | — | Identifier |
| `title` | `string` | Required | 2–80 chars | — | Credibility context |
| `bio` | `RichContent` | Required | Non-empty | — | E-E-A-T signal |
| `photo` | `MediaAsset['id']` | Required | Valid image asset, `altText` required | → Media Asset | Humanizes brand |
| `credentials` | `string[]` | Optional | — | — | Reinforces expertise for high-consideration personas (healthcare, enterprise) |
| `linkedInUrl` | `string \| null` | Optional | Valid URL matching LinkedIn domain pattern if present | — | Verifiability, E-E-A-T |
| `displayOrder` | `number` | Required | Integer ≥ 0 | — | Content governance ordering |

**Unique Constraints:** `slug` unique within Team Member namespace.

---

## 3.12 Navigation

**Bounded Context:** Site Structure & Configuration
**Purpose:** Structured representation of Header primary nav and mega-menu (IA Phase 2 Section 2; UX Phase 3 Section 26.1–26.2). **Singleton entity** (not a collection) — one record governs the entire site's primary navigation.

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `primaryItems` | `NavItem[]` | Required | Min 1 item | — | Top-level nav entries |
| `NavItem` shape | `{ id: string; label: string; href: string \| null; children: NavItem[] \| null; type: 'LINK' \| 'MEGA_MENU' \| 'DROPDOWN' }` | — | `label` 1–30 chars; if `type !== 'LINK'`, `children` required, min 1 | Self-referential (nested) | Directly encodes the mega-menu (Services) vs. standard dropdown (Industries) distinction defined in UX Phase 3 Section 15 as structured data, not hardcoded per-component logic |
| `primaryCTA` | `CTA['id']` | Required | Must reference existing CTA | → CTA (one-to-one) | Persistent header CTA (UX Phase 3 Section 12) |

**Uniqueness:** Singleton — enforced at the Data Access Layer (only one Navigation record is ever fetched/expected; validation rejects a multi-record ambiguity as a data-integrity error, not a UI edge case).
**No `seo` field:** Navigation does not extend `BaseContentEntity` (it is not an independently routable page) — uses a minimal `ConfigurationEntity` base (Section 4.6).

---

## 3.13 Footer

**Bounded Context:** Site Structure & Configuration
**Purpose:** Structured Footer content (IA Phase 2 Section 3). **Singleton entity.**

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `columns` | `FooterColumn[]` (`{ id: string; heading: string; links: { label: string; href: string }[] }[]`) | Required | Exactly matches IA Phase 2 Section 3's 4-column structure (Company/Services/Industries/Resources) — min 4 columns | — | Mirrors approved IA; structural, not free-form |
| `legalLinks` | `{ label: string; href: string }[]` | Required | Min 3 (Privacy, Terms, Cookie Policy) | → Legal pages | Compliance requirement (PRD Section 10.5) |
| `socialLinks` | `{ platform: SocialPlatform; url: string }[]` | Optional | Valid URL per entry | — | Bottom bar social icons |
| `copyrightText` | `string` | Required | Non-empty | — | Legal footer text |

**Uniqueness:** Singleton, same pattern as Navigation.

---

## 3.14 CTA (Call-to-Action)

**Bounded Context:** Site Structure & Configuration
**Purpose:** Reusable, centrally-managed CTA definition — powers Header CTA, CTA Bands, and contextual in-content CTAs (Design System Sections 11, 26.4) without hardcoding label/link/style combinations per usage site.

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `label` | `string` | Required | 2–40 chars | — | Button text |
| `href` | `string` | Required | Valid internal path or external URL | — | Destination |
| `style` | `CTAStyle` (enum: `PRIMARY \| SECONDARY \| GHOST \| OUTLINE \| LINK` — directly mirrors Design System Section 11.1 variants) | Required | Enum value | — | Guarantees every CTA instance maps to an approved Button System variant, no ad hoc styling |
| `intent` | `CTAIntent` (enum: `FREE_AUDIT \| CONSULTATION \| CONTACT \| NEWSLETTER \| GENERIC_LINK`) | Required | Enum value | — | Enables analytics event tagging (Phase 5A Section 9.1) tied to semantic intent rather than raw label text, so relabeling a CTA never breaks conversion tracking |

**Unique Constraints:** No `slug` (CTA is not routable) — uses `ConfigurationEntity` base like Navigation/Footer, keyed by `id` only.

---

## 3.15 Site Settings

**Bounded Context:** Site Structure & Configuration
**Purpose:** Global, singleton configuration values referenced across the entire site (organization identity, default SEO fallbacks, contact info).

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `organizationName` | `string` | Required | Non-empty | — | `Organization` schema, footer, metadata fallback |
| `organizationLogo` | `MediaAsset['id']` | Required | Valid image asset | → Media Asset | Schema, header/footer branding |
| `defaultSEO` | `SEOMetadata` | Required | Valid `SEOMetadata` shape | — | Fallback for any page lacking page-specific overrides — guarantees no page ever ships with empty metadata (hard safety net for FR-28) |
| `contactEmail` | `string` | Required | Valid email format | — | Contact page, footer, schema `contactPoint` |
| `contactPhone` | `string \| null` | Optional | Valid phone format if present | — | Schema `contactPoint`, Contact page |
| `socialProfileUrls` | `string[]` | Optional | Valid URLs | — | `Organization` schema `sameAs` field |
| `analyticsIds` | `{ ga4Id: string \| null; clarityId: string \| null }` | Optional | — | — | Centralizes Monitoring Strategy (Phase 5A Section 9) IDs as configurable data rather than hardcoded environment-only values, allowing non-engineering staff visibility (read-only) into what's active |

**Uniqueness:** Singleton.

---

## 3.16 SEO Metadata

**Bounded Context:** Cross-cutting (embedded value object, not a standalone routable entity)
**Purpose:** The `seo` field type used throughout `BaseContentEntity` (Section 2.2) and `Site Settings` (3.15) default fallback.

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `metaTitle` | `string` | Required | 10–60 chars (SEO-safe length) | — | FR-28 |
| `metaDescription` | `string` | Required | 50–160 chars | — | FR-28 |
| `canonicalUrl` | `string \| null` | Optional | Valid URL if present | — | FR-32, overrides auto-derived canonical when needed (e.g., syndicated content) |
| `ogImage` | `MediaAsset['id'] \| null` | Optional | Valid image asset if present, falls back to `Site Settings.organizationLogo` if null | → Media Asset | FR-33, Open Graph |
| `noIndex` | `boolean` | Required, defaults `false` | — | — | Explicit, deliberate exclusion control (e.g., a legal page variant, or a thin/duplicate page pending removal) — must be an intentional `true`, never an accidental default |
| `structuredDataOverride` | `Record<string, unknown> \| null` | Optional | Must be valid JSON-LD shape if present | — | Escape hatch for content-type-specific schema needs beyond the standard per-type schema builder (Phase 6 will define standard builders; this field allows exceptions without schema-breaking workarounds) |

**Note:** This is a **value object**, not an entity — it has no independent `id`/`slug`/`status`, it is always embedded within a parent entity.

---

## 3.17 Media Asset

**Bounded Context:** Cross-cutting (referenced by nearly every other model)
**Purpose:** Canonical image/icon/file reference, decoupled from any specific CMS media-library implementation.

| Field | Type | Required | Validation | Relationship | Why |
|---|---|---|---|---|---|
| `id` | `string` | Required | Non-empty | — | Stable reference |
| `url` | `string` | Required | Valid URL | — | Source path, consumed by `next/image` (Phase 5A Section 10) |
| `altText` | `string` | **Required** (no exceptions, enforced at validation layer) | 3–150 chars | — | Hard accessibility + `next/image` requirement (Design System Section 10, Phase 5A Section 10.2) — this is the single most consistently-enforced required field across the entire schema given how many entities reference it |
| `width` | `number` | Required | Positive integer | — | `next/image` intrinsic sizing, CLS prevention |
| `height` | `number` | Required | Positive integer | — | Same as above |
| `type` | `MediaAssetType` (enum: `PHOTO \| ICON \| LOGO \| ILLUSTRATION`) | Required | Enum value | — | Drives aspect-ratio/treatment rules (Design System Section 10) |
| `focalPoint` | `{ x: number; y: number } \| null` | Optional | 0–1 range each if present | — | Supports responsive cropping consistency across aspect-ratio variants (Section 10.3) |

**Uniqueness:** `url` unique (no duplicate asset registration for the same source file).
**Note:** Does not extend `BaseContentEntity` — Media Asset has no `slug`, `status`, or `seo` of its own; it uses a minimal `ReferenceEntity` base (`id` + `createdAt` only, per Section 4.6).

---

**End of Section 3 — Complete Content Domain Models (17 of 17).**


This is a natural stopping point given the density of full field-level specification across all 17 models. Sections 4–11 (TypeScript Architecture, Validation Layer, Data Access Layer, Server Actions Architecture, API Boundary Design, Error Handling Strategy, Data Flow Diagram, Architecture Validation) remain and will require substantial additional space to maintain this same rigor.

**Send "Continue" to proceed with Section 4 — TypeScript Architecture.**

## 4. TypeScript Architecture

### 4.1 Strict Mode Configuration

`tsconfig.json` enforces the full strict family, not just `strict: true` as a lone flag:

| Compiler Option | Setting | Why |
| --- | --- | --- |
| `strict` | `true` | Umbrella flag — enables all sub-flags below |
| `strictNullChecks` | `true` | Every `| null` / `| undefined` relationship must be explicitly narrowed before use. |
| `strictFunctionTypes` | `true` | Server Action signatures and Repository methods are contravariantly checked. |
| `strictPropertyInitialization` | `true` | Enforced for any class-based Repository implementation. |
| `noImplicitAny` | `true` | CMS response shapes must never become implicit `any`. |
| `noUncheckedIndexedAccess` | `true` | Array and record lookups always require explicit handling. |
| `exactOptionalPropertyTypes` | `true` | Distinguishes omitted fields from explicitly undefined fields. |
| `noUnusedLocals` / `noUnusedParameters` | `true` | Enforces maintainability discipline. |

**Governance Rule**

- No `@ts-ignore`
- No `@ts-expect-error` without documented justification
- No `as any`
- Explicit casting is allowed only at the CMS Repository boundary.

---

### 4.2 Interfaces vs Types

**Use `interface` for:**

- Domain entities
- Object contracts

**Use `type` for:**

- Unions
- Intersections
- Function signatures
- Utility compositions
- Derived types

Rule:

> Domain Entity → `interface`
>
> Derived / Computed Type → `type`

---

### 4.3 Branded Types

```ts
type Brand<T, B extends string> = T & {
  readonly __brand: B;
};

type Slug = Brand<string, "Slug">;

type ISODateString = Brand<string, "ISODateString">;

type ServiceId = Brand<string, "ServiceId">;

type IndustryId = Brand<string, "IndustryId">;
```

Purpose:

- Prevent accidental ID mixing
- Compile-time safety
- Strongly typed relationships
- Validation layer constructs branded values

---

### 4.4 Enums vs Union Types

Use string literal unions backed by `const` objects.

```ts
const PublishingStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

type PublishingStatus =
  (typeof PublishingStatus)[keyof typeof PublishingStatus];
```

Reasons:

- Zero runtime overhead
- Better tree shaking
- JSON friendly
- Better Zod integration

---

### 4.5 RichContent

```ts
type RichContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string; attribution: string | null }
  | { type: "image"; assetId: MediaAssetId; caption: string | null }
  | { type: "codeBlock"; language: string | null; code: string };

type RichContent = ReadonlyArray<RichContentBlock>;
```

Benefits:

- Structured content
- AI-ready
- SEO-friendly
- Safe rendering
- CMS agnostic

---

### 4.6 Base Type Hierarchy

```ts
interface ReferenceEntity {
  readonly id: string;
  readonly createdAt: ISODateString;
}

interface ConfigurationEntity extends ReferenceEntity {
  readonly version: number;
  readonly deletedAt: ISODateString | null;
  readonly deletedBy: string | null;
}

interface EmbeddableContentEntity extends ReferenceEntity {
  readonly slug: Slug;
  readonly status: PublishingStatus;
  readonly updatedAt: ISODateString;
  readonly version: number;
  readonly deletedAt: ISODateString | null;
  readonly deletedBy: string | null;
}

interface BaseContentEntity extends EmbeddableContentEntity {
  readonly publishedAt: ISODateString | null;
  readonly seo: SEOMetadata;
}
```

---

### 4.7 Readonly Strategy

Global Rules:

- Every field is `readonly`
- Arrays use `ReadonlyArray<T>`
- Server Components never mutate data
- Mutations occur only inside Server Actions

---

### 4.8 Utility Types & Generics

Common utilities:

- `Pick`
- `Omit`
- `Partial`
- `Required`
- `Record`

Repository Result:

```ts
type ContentResult<T> =
  | {
      readonly ok: true;
      readonly data: T;
    }
  | {
      readonly ok: false;
      readonly error: ContentError;
    };
```

DTO Pattern:

```ts
type CreateInput<T extends BaseContentEntity> =
  Omit<T, keyof BaseContentEntity | "id"> & {
    readonly seo: Partial<SEOMetadata>;
  };

type UpdateInput<T extends BaseContentEntity> =
  Partial<CreateInput<T>>;
```

---

### 4.9 Naming Conventions

| Category | Convention | Example |
| --- | --- | --- |
| Domain Interfaces | PascalCase | `Service` |
| Branded IDs | PascalCase + Id | `ServiceId` |
| Union Types | PascalCase | `PublishingStatus` |
| Value Objects | PascalCase | `SEOMetadata` |
| DTOs | PascalCase + Input | `CreateServiceInput` |
| Repositories | PascalCase + Repository | `ServiceRepository` |
| Methods | camelCase | `getBySlug()` |
| Zod Schemas | camelCase + Schema | `serviceSchema` |
| Type Guards | `is` prefix | `isPublished()` |
| Const Objects | PascalCase | `PublishingStatus` |

---

**Section 4 — TypeScript Architecture Complete**

Sections 1–4 remain frozen and unmodified. Continuing with Section 5.

---

# 5. Validation Layer

### 5.1 Zod Architecture — Layering Strategy

Validation is structured as **layered, composable schemas** that mirror the TypeScript base-type hierarchy established in Section 4.6 — not one monolithic schema per entity, but small, reusable schema fragments composed upward, so a change to a shared concern (e.g., the `Slug` rule) updates every entity schema that depends on it automatically.

```
// Tier 0 — primitive/branded value schemas
const slugSchema = z.string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .brand<'Slug'>();

const isoDateStringSchema = z.string().datetime().brand<'ISODateString'>();

// Tier 1 — value object schemas
const seoMetadataSchema = z.object({
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(50).max(160),
  canonicalUrl: z.string().url().nullable(),
  ogImage: mediaAssetIdSchema.nullable(),
  noIndex: z.boolean().default(false),
  structuredDataOverride: z.record(z.unknown()).nullable(),
});

// Tier 2 — base entity schemas (mirrors Section 4.6 hierarchy)
const referenceEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: isoDateStringSchema,
});

const configurationEntitySchema = referenceEntitySchema.extend({
  version: z.number().int().positive(),
  deletedAt: isoDateStringSchema.nullable(),
  deletedBy: z.string().nullable(),
});

const embeddableContentEntitySchema = referenceEntitySchema.extend({
  slug: slugSchema,
  status: publishingStatusSchema,
  updatedAt: isoDateStringSchema,
  version: z.number().int().positive(),
  deletedAt: isoDateStringSchema.nullable(),
  deletedBy: z.string().nullable(),
});

const baseContentEntitySchema = embeddableContentEntitySchema.extend({
  publishedAt: isoDateStringSchema.nullable(),
  seo: seoMetadataSchema,
});

// Tier 3 — concrete entity schemas extend Tier 2
const serviceSchema = baseContentEntitySchema.extend({
  name: z.string().min(3).max(80),
  shortDescription: z.string().min(20).max(160),
  body: richContentSchema,
  outcomeStatement: z.string().min(10).max(120),
  deliverables: z.array(deliverableSchema).min(1),
  processSteps: z.array(processStepSchema).min(1)
    .refine(hasUniqueOrderValues, 'processSteps.order must be unique'),
  // ...remaining fields per Section 3.1
});
```

**Rationale:** This tiered composition is the Zod-level expression of the same principle that produced the interface hierarchy in Section 4.6 — a governance field (e.g., adding a new required kernel field) is changed once, at the appropriate tier, and every dependent entity schema inherits it without hand-editing 17 separate schemas.

### 5.2 Validation Boundaries — Where Validation Occurs

Validation is not a single checkpoint; it occurs at four distinct boundaries, each with a different purpose and a different failure consequence:

| Boundary | What Is Validated | Failure Consequence |
|---|---|---|
| **CMS Response Boundary** (Repository layer, Section 6.1) | Raw CMS output, before it becomes a typed domain object | Throws a typed `ContentValidationError` (Section 9), caught by the Repository and surfaced as a `ContentResult` failure — never propagates as an unhandled exception into a Server Component |
| **Server Action Input Boundary** (Section 7) | User-submitted form data (Free Audit, Consultation, Contact, Newsletter) | Returns a structured field-level error response consumed by the form (per UX Phase 3 Section 14's inline validation requirement) — never throws |
| **Build-Time Boundary** (`generateStaticParams`/build pipeline, Phase 5A Section 3) | Every piece of content destined for static generation | **Fails the build outright** (Phase 5A Section 8.1 governance rule) — this is the strictest boundary in the system |
| **Webhook/On-Demand Revalidation Boundary** (Phase 5A Section 7.3, Section 8.3 below) | Content pushed via CMS webhook trigger before triggering `revalidatePath` | Rejects the revalidation trigger and logs the failure (Section 8) rather than revalidating a route with invalid underlying content |

**Governing Principle:** The same base Zod schemas (Section 5.1) are reused across all four boundaries — there is exactly one definition of "what a valid `Service` looks like," and every boundary parses against it. Boundaries differ only in *what happens on failure*, never in *what counts as valid*.

### 5.3 Input Validation (Editor-Authored Content)

Content entering the system from the CMS is validated against the **full entity schema** (Section 5.1, Tier 3) at the Repository boundary, with one deliberate refinement layered on top: **conditional publish-gate validation**, directly implementing the authorization gates formalized in Sections 3.9, 3.10, and 3.18.3.

```
const caseStudySchema = baseContentEntitySchema.extend({
  // ...fields per Section 3.9
  clientAuthorizationConfirmed: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.status === PublishingStatus.PUBLISHED && !data.clientAuthorizationConfirmed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['clientAuthorizationConfirmed'],
      message: 'Case studies cannot be published without confirmed client authorization.',
    });
  }
});
```

This is the concrete mechanism referenced as "enforced at the validation layer" throughout Section 3 — the schema itself, not application logic scattered elsewhere, is where this business rule lives. The same `superRefine` pattern enforces:
- The **minimum-word-count rule** on `Location.uniqueLocalContent` (Section 3.3).
- The **`directAnswer` word-count bounds** on `BlogPost` (Section 3.4).
- The **`featuredImage.altText` presence** requirement, resolved via a cross-reference check against the referenced `MediaAsset` (Section 3.17).
- The **audit-entry correlation check** described in Section 3.18.3 — a status transition touching an authorization field must have a matching same-transaction `AuditLogEntry`; this specific check runs one level above the pure Zod schema, in the Repository write path (Section 6), since it requires querying the audit log rather than validating shape alone — flagged here as the one validation rule that spans the Validation Layer and Data Access Layer boundary.

### 5.4 Output Validation

Distinct from input validation, **output validation** governs data on its way *out* of the Data Access Layer toward a Server Component — a narrower, cheaper check confirming that a projected/`Pick`-shaped slice (Section 4.8) still satisfies its own contract after field selection, and that all resolved relationship references (Section 2's relationship fields) point to entities that are actually `PUBLISHED` and not soft-deleted.

```
const publishedRelationGuard = <T extends { status: PublishingStatus; deletedAt: string | null }>(
  entity: T
): entity is T & { status: 'PUBLISHED'; deletedAt: null } =>
  entity.status === PublishingStatus.PUBLISHED && entity.deletedAt === null;
```

**Why This Exists Separately from Input Validation:** An entity can be perfectly valid in isolation (passes Section 5.3) while referencing another entity that has since been archived or soft-deleted (Section 3.18.2) — e.g., a `Service.relatedCaseStudyIds` entry pointing to a Case Study that was later unpublished. Output validation is what prevents a stale reference from ever reaching rendering; the Repository's relationship-resolution methods (Section 6.3) apply `publishedRelationGuard` to every resolved reference and silently drop (not error on) references that no longer resolve to public content — a broken internal reference degrades gracefully into "fewer related items shown," never a rendering crash.

### 5.5 Build-Time Validation

At build time (Phase 5A Section 3's SSG-first strategy), **every** content item destined for static generation is parsed through its full Tier 3 schema (Section 5.1) as part of `generateStaticParams`/page data-fetching — not sampled, not skipped for performance. Given the Rendering Strategy's SSG-first posture, this is the primary and most consequential validation checkpoint in the entire system: a piece of content that fails validation here **never reaches production** at all, per Phase 5A Section 8.1's build-failure governance rule.

**Specific build-time-only checks, layered on top of the standard schema:**
- **Cross-entity referential integrity sweep** — every `[X]Id`/`[X]Ids` field across all 17 models (Section 3) is checked at build time to confirm the referenced entity exists, is `PUBLISHED`, and is not soft-deleted. This is more exhaustive than the lazy, per-request output validation (Section 5.4) — it runs once, globally, across the entire content graph, catching orphaned references before any single page even attempts to render.
- **Slug collision sweep** — confirms the uniqueness constraints defined per-model in Section 3 (e.g., `Location`'s composite `(cityName, region, countryCode)` uniqueness) hold across the full dataset, not just pairwise at write time.
- **Singleton integrity check** — confirms exactly one `PUBLISHED` record exists for each singleton type (`Navigation`, `Footer`, `Site Settings` — Sections 3.12, 3.13, 3.15), failing the build if zero or multiple are found.

### 5.6 Runtime Validation

Runtime validation covers the two paths that cannot be fully resolved at build time:

1. **ISR On-Demand Paths** (Phase 5A Section 3.2 — Location pages with `dynamicParams: true`): A newly requested, not-yet-statically-generated city page runs the full Section 5.5-equivalent validation at request time, on the server, before the page is generated and cached. A validation failure here returns a 404 (Section 9.3) rather than caching an invalid or partial page.
2. **Server Action Submissions** (Section 7): User-submitted form data is parsed at runtime against dedicated **input DTO schemas** (Section 4.8's `CreateInput`/`UpdateInput` pattern applied to form-specific shapes, e.g., a `freeAuditFormSchema` distinct from any content entity schema) — this is the one validation path operating on non-CMS-sourced data, and it is detailed fully in Section 7.

**Runtime Validation Performance Note:** Because build-time validation (Section 5.5) already exhaustively checks all statically-generated content, runtime validation on the standard SSG page-render path is effectively a no-op in production (the data was already proven valid at build time) — runtime Zod parsing on those paths exists as a defense-in-depth safety net, not the primary gate, keeping per-request overhead minimal and consistent with the Performance non-functional requirement (PRD Section 9.1).

---

**Section 5 — Validation Layer complete.**

Ready to proceed to **Section 6 — Data Access Layer** on your next message.

Sections 1–5 remain frozen and unmodified. Continuing with Section 6.

---

# 6. Data Access Layer

### 6.1 Repository Pattern

Every content type from Section 3 is accessed exclusively through a typed **Repository interface** — no Server Component, Server Action, or utility function ever queries a CMS SDK, REST endpoint, or GraphQL client directly. This is the concrete implementation of Architecture Philosophy Principle 2 and Data Architecture Philosophy Principle 2 (CMS-agnosticism) established in Sections 1 and 5A-1.

```
interface ServiceRepository {
  getBySlug(slug: Slug): Promise<ContentResult<Service>>;
  listPublished(): Promise<ContentResult<readonly Service[]>>;
  listByCategory(category: ServiceCategory): Promise<ContentResult<readonly Service[]>>;
  getManyByIds(ids: readonly ServiceId[]): Promise<ContentResult<readonly Service[]>>;
}
```

**One repository interface per entity type** defined in Section 3 (`ServiceRepository`, `IndustryRepository`, `LocationRepository`, `BlogPostRepository`, `BlogCategoryRepository`, `BlogTagRepository`, `AuthorRepository`, `FAQItemRepository`, `CaseStudyRepository`, `TestimonialRepository`, `TeamMemberRepository`, `NavigationRepository`, `FooterRepository`, `CTARepository`, `SiteSettingsRepository`, `MediaAssetRepository`) — seventeen repositories, each scoped narrowly to its own entity, never a generic "content repository" god-object. This mirrors the Bounded Context separation established in Section 2.1: repositories within the same bounded context may share internal helper logic, but no repository interface spans multiple entity types.

**Concrete Implementation Boundary:** Each interface has exactly one concrete implementation class (e.g., `CmsServiceRepository`) that performs the actual CMS SDK/API call, immediately parses the raw response through the corresponding Tier 3 Zod schema (Section 5.1), and returns a branded, validated domain object wrapped in `ContentResult<T>` (Section 4.8). **This implementation class is the only place in the entire codebase permitted to import or reference the CMS vendor's SDK** — the single narrow seam where the vendor decision (deferred per Phase 5A Section 2.1) actually lives. Swapping CMS vendors means rewriting seventeen implementation classes against unchanged interfaces; nothing above the Repository layer is aware a change occurred.

**Why Interfaces, Not Concrete Classes, Are Consumed Upstream:** Content Services (Section 6.2) and Server Components depend on the `ServiceRepository` interface type, never `CmsServiceRepository` directly — dependency inversion is enforced at the type level, not just as a convention, making the CMS-agnosticism claim in Section 1 mechanically true rather than aspirational.

### 6.2 Content Services — Orchestration Layer

Repositories return single-entity or flat-list data. **Content Services** sit one layer above repositories and handle **cross-repository orchestration** — the relationship-resolution work implied throughout Section 3's `[X]Ids` reference fields.

```
interface ServicePageDataService {
  getServicePageData(slug: Slug): Promise<ContentResult<ServicePageData>>;
}

interface ServicePageData {
  readonly service: Service;
  readonly relatedCaseStudies: readonly CaseStudy[];
  readonly relatedIndustries: readonly Industry[];
  readonly faqItems: readonly FAQItem[];
}
```

A Content Service's job is to: (1) call its primary repository, (2) call the related repositories needed to resolve reference fields, (3) apply the `publishedRelationGuard` output-validation check (Section 5.4) to every resolved reference, silently dropping unresolvable ones, and (4) return a single, page-ready composite shape.

**Why This Layer Exists Separately from Repositories:** Without it, either (a) Server Components would need to orchestrate multiple repository calls themselves — violating the "components consume content, they don't fetch it" boundary implied by Architecture Philosophy Principle 4 — or (b) individual repositories would need to know about each other, violating the Bounded Context isolation from Section 2.1. Content Services are the designated place where cross-context composition happens, keeping both Repositories and Server Components single-purpose.

**One Content Service per page-template**, not per entity — e.g., `ServicePageDataService`, `IndustryPageDataService`, `LocationPageDataService`, `BlogPostPageDataService`, `CaseStudyPageDataService`, `HomepageDataService`, plus narrower ones for index/hub pages (`ServicesHubDataService`, `BlogIndexDataService`, etc.). This naming/scoping choice deliberately mirrors the IA Phase 2 sitemap (Section 1) and the Rendering Strategy's per-route mapping (Phase 5A Section 3) — each Server Component's data need corresponds to exactly one Content Service call.

### 6.3 Relationship Resolution Strategy

Given the density of cross-references cataloged in Section 3 (e.g., `Service.relatedCaseStudyIds`, `Industry.recommendedServiceIds`, `CaseStudy.testimonialId`), Content Services resolve these using a consistent, shared internal utility rather than ad hoc `Promise.all` calls duplicated per service:

```
async function resolveMany<T extends BaseContentEntity>(
  ids: readonly string[],
  getManyByIds: (ids: readonly string[]) => Promise<ContentResult<readonly T[]>>
): Promise<readonly T[]> {
  if (ids.length === 0) return [];
  const result = await getManyByIds(ids);
  return result.ok ? result.data.filter(publishedRelationGuard) : [];
}
```

**Batched, Not N+1:** Every repository interface exposes a `getManyByIds` batch method (Section 6.1) specifically so relationship resolution never degenerates into one network/CMS call per referenced ID — a Service page with five related Case Studies issues one batched `CaseStudyRepository.getManyByIds()` call, not five sequential lookups. This is a direct performance requirement flowing from PRD Section 9.1 and Phase 5A's Core Web Vitals commitments — relationship-heavy pages (Service, Industry pages carry the most references per Section 3) must not pay a linear network-call penalty per reference.

**Self-Referential Relationships:** `BlogPost.relatedPostIds` and `Location.neighboringCityIds` (Section 3.4, 3.3) are resolved through the same `resolveMany` utility, with the self-reference exclusion rule (already specified in Section 3) enforced at the Repository's `getManyByIds` level — the entity's own ID is filtered out of the query, not just filtered from editorial input.

### 6.4 Fetch Strategy

Fetch behavior is dictated by the Rendering Strategy already frozen in Phase 5A Section 3 — the Data Access Layer does not make independent caching/freshness decisions; it implements what Phase 5A already specified, using Next.js's native `fetch` extensions and React's `cache()` function as the mechanism:

| Content Category (per Phase 5A Section 3) | Fetch Mechanism | Data Access Layer Behavior |
|---|---|---|
| SSG, webhook-revalidated (Service, Industry, Case Study, Blog Post, FAQ, Testimonials, About, Legal) | `fetch` with `next: { tags: [entityTypeTag, entityIdTag] }` | Repository methods tag every fetch with both a type-level tag (e.g., `'service'`) and an entity-level tag (e.g., `'service:local-seo'`), enabling the webhook handler (Phase 5A Section 7.3) to call `revalidateTag` with surgical precision rather than revalidating an entire content type for a single-item edit |
| SSG + ISR, time-based (Homepage, Blog index, Category/Tag indexes) | `fetch` with `next: { revalidate: <seconds> }` matching the interval specified per-route in Phase 5A Section 3 | Interval value is a named constant per route category (Section 6.6), not a magic number repeated across call sites |
| SSG + ISR, `dynamicParams: true` (Location pages) | `fetch` with both `tags` and a conservative `revalidate` fallback, per Phase 5A Section 3.2's dual on-demand-plus-time-based safety net | Repository method identical in shape to the standard SSG case; the dual-trigger behavior is entirely a Next.js-layer configuration difference, not a different code path in the Repository |
| Server Action reads preceding a mutation (e.g., checking current `status` before a publish-gate validation, Section 5.3) | `fetch` with `cache: 'no-store'` | Server Actions must never act on a potentially-stale cached read when making a write decision |

**Deduplication:** Every repository method is wrapped in React's `cache()` function, so multiple Content Services or components requesting the same entity within a single render pass (e.g., both `ServicePageDataService` and a shared `Header` component needing `Site Settings`) collapse into a single underlying fetch — request-level memoization, not a custom caching layer reinvented on top of what the framework already provides.

### 6.5 Caching Strategy — Data Layer Responsibilities

Phase 5A Section 7 already defines the CDN/ISR/browser caching architecture; the Data Access Layer's caching responsibility is narrower and sits **above** that: ensuring the `fetch` calls issued by Repositories carry the correct tags/revalidation configuration so the Phase 5A caching machinery has accurate inputs to work with. Three data-layer-specific caching concerns not already covered by Phase 5A:

1. **Tag Taxonomy Governance:** Tags follow a strict `'{entityType}'` and `'{entityType}:{id}'` naming convention (Section 6.4) applied uniformly across all seventeen repositories — this taxonomy is defined once, here, and imported as shared constants rather than hand-typed per repository, preventing a typo'd tag from silently breaking targeted revalidation.
2. **Singleton Caching:** `Navigation`, `Footer`, and `Site Settings` (Sections 3.12, 3.13, 3.15) are fetched far more frequently than any other content type (every page render touches all three). Their repositories apply the longest safe revalidation window among all content types plus `tags: ['navigation']`/`['footer']`/['site-settings']`, since these singletons change rarely but must still be instantly revalidatable on the rare occasion an editor does update them.
3. **Relationship Resolution Caching:** Because `resolveMany` (Section 6.3) calls into `getManyByIds`, and that method is itself `cache()`-wrapped and tag-annotated per Section 6.4, a Case Study referenced by three different Service pages during the same build is fetched once and reused — the caching benefit compounds naturally from the layering already described, requiring no additional bespoke caching logic at the Content Service level.

### 6.6 Abstraction Layer — Configuration Constants

To prevent the "magic number" and "hardcoded string" drift explicitly warned against in Section 5A and Section 5.1's tiered-schema rationale, all fetch-tuning values are centralized:

```
const REVALIDATE_INTERVALS = {
  homepage: 3600,        // 1 hour, per Phase 5A Section 3
  blogIndex: 14400,      // 4 hours
  locationFallback: 86400, // 24 hours, safety-net tier per Phase 5A 3.2
} as const;

const CONTENT_TAGS = {
  service: 'service',
  industry: 'industry',
  location: 'location',
  blogPost: 'blog-post',
  // ...one entry per Section 3 entity type
  entityTag: (type: keyof typeof CONTENT_TAGS, id: string) => `${CONTENT_TAGS[type]}:${id}`,
} as const;
```

This module is imported by every Repository implementation and by the revalidation webhook handler (Phase 5A Section 7.3/4) — guaranteeing the tag a Repository writes and the tag the webhook invalidates are always drawn from the same source, never independently retyped and at risk of diverging.

### 6.7 Error Handling (Data Access Layer Scope)

*(Full typed-error taxonomy is formalized in Section 9; this subsection covers only the Data Access Layer's specific responsibilities within that broader strategy.)*

Every Repository method's failure path — CMS unreachable, malformed response failing Section 5.1 schema parsing, requested entity not found, referenced entity in a relationship no longer resolvable — is caught **inside** the Repository implementation and converted into the `ContentResult<T>` failure branch (Section 4.8). **No Repository method ever throws.** This is a deliberate, absolute rule: a Server Component calling into a Content Service can always destructure `{ ok, data, error }` without a `try/catch`, because the failure mode is a typed value, not a control-flow exception.

**Distinguishing Failure Categories at the Data Access Layer:**
- **Not Found** (valid request, no matching `PUBLISHED` entity) — mapped to a `NotFoundError` subtype, which page-level code translates into Next.js's `notFound()` (feeding the 404 Strategy, Section 9.3).
- **Validation Failure** (CMS returned data that fails Section 5.1 parsing) — mapped to a `ContentValidationError`, which at build time propagates to a build failure (Section 5.5) and at runtime (ISR on-demand path) propagates to a 404 rather than serving malformed content (Section 5.6).
- **Upstream/Network Failure** (CMS unreachable, timeout) — mapped to an `UpstreamServiceError`, which triggers the Fallback Data strategy (Section 9.5) rather than a hard failure where one is available (e.g., serving last-known-good cached content per Section 7.3's stale-while-revalidate posture already covers this at the CDN layer; the Data Access Layer's role is simply to not compound a transient upstream issue into an unnecessary page-level crash).

Full type definitions for `NotFoundError`, `ContentValidationError`, and `UpstreamServiceError`, along with the complete Error Handling Strategy including 404 behavior, fallback data, and logging integration, are formalized in Section 9.

---

**Section 6 — Data Access Layer complete.**

Ready to proceed to **Section 7 — Server Actions Architecture** on your next message.

Sections 1–6 remain frozen and unmodified. Continuing with Section 7.

---

# 7. Server Actions Architecture

### 7.1 Architectural Position

Server Actions are the **exclusive write path** for all user-initiated mutations in the system — form submissions from `/free-audit`, `/consultation`, `/contact`, and newsletter signup (footer, per IA Phase 2 Section 25). This was already established at the routing level in Phase 5A Section 5.6 ("Server Actions for user-initiated mutations, Route Handlers only for machine-to-machine/webhook entry points"); Section 7 defines the internal architecture of those actions.

**Non-Negotiable Boundary:** Server Actions never read or write content-domain entities (Section 3's seventeen models) — those remain exclusively CMS-managed and Repository-mediated (Section 6). Server Actions operate on a structurally separate domain: **Lead submissions**. This separation is deliberate — form data is transactional/operational data with its own lifecycle (submitted → routed → followed-up), not editorial content subject to the Publishing Workflow (Section 2.4) or Revision History (Section 3.18.1).

### 7.2 Lead Submission Domain Model

A shared base shape underlies all four form types, mirroring the same "shared kernel" discipline applied to content entities in Section 2.2:

```
interface BaseLeadSubmission {
  readonly id: string;
  readonly submittedAt: ISODateString;
  readonly sourcePageUrl: string;
  readonly formType: LeadFormType; // enum: FREE_AUDIT | CONSULTATION | CONTACT | NEWSLETTER
  readonly status: LeadSubmissionStatus; // enum: RECEIVED | ROUTED | ROUTING_FAILED
}
```

**Per-Form Extensions:**

| Form | Additional Fields | Validation | Why |
|---|---|---|---|
| **Free Audit** | `name: string`, `email: string`, `websiteUrl: string` | Name 2–80 chars; email valid format; URL valid, normalized (protocol-prefixed) | Matches UX Phase 3 Section 14's minimal-field mandate (3–4 fields, low-friction) |
| **Consultation** | `name`, `email`, `websiteUrl`, `industry: PersonaKey \| null`, `budgetRange: BudgetRange \| null` (enum), `preferredTimeframe: string \| null` | Same base fields as Free Audit; `industry` if present must match the `PersonaKey` enum already defined in Section 3.2 (reuses the same enum — no parallel taxonomy) | Higher-commitment path (IA Phase 2 Section 12) — qualification fields, capped at 5–6 total per UX Phase 3 Section 14 |
| **Contact** | `name`, `email`, `message: string` | Message 10–1000 chars | Catch-all, open-ended per UX Phase 3 Section 10 |
| **Newsletter** | `email: string` | Email valid format only | Single-field, per UX Phase 3 Section 14's "proportionally frictionless" requirement |
| **Future Lead Forms** | Extends `BaseLeadSubmission` | — | See Section 7.6 |

**Reuse of `PersonaKey`:** The Consultation form's `industry` field deliberately reuses the exact `PersonaKey` enum already established for `Industry.personaKey` (Section 3.2) rather than defining a second, parallel industry taxonomy — guarantees a lead's stated industry can be cross-referenced against the content domain's Industry entities without a mapping/translation layer.

### 7.3 Execution Flow

Every Server Action follows an identical five-stage pipeline, implemented once as a shared higher-order wrapper (`withLeadSubmissionPipeline`) rather than duplicated per form:

```
1. Parse & Validate  → Zod schema parse against raw FormData (Section 7.4)
2. Rate-Limit Check   → consult Phase 5A Section 6.5's rate-limiting checkpoint
3. Persist            → write BaseLeadSubmission record, status: RECEIVED
4. Route              → attempt downstream delivery (Section 8.3's CRM/email integration point)
5. Respond            → return typed ActionResult to the client (Section 7.5)
```

**Stage 3 Always Precedes Stage 4:** This ordering is the direct implementation of the "reconciliation safety net" principle established in Phase 5A Section 8.3 — the submission is durably logged *before* any attempt is made to route it downstream, so a downstream CRM/email failure (Stage 4) never results in a lost submission. If Stage 4 fails, the record's `status` is updated to `ROUTING_FAILED` (not deleted, not retried silently within the same request) and the failure is logged (Section 9.6) for operational follow-up — but Stage 5 still returns a **success** response to the user, since from the user's perspective their submission was received. This is a deliberate UX/reliability decision: the user should never see an error for a problem that is entirely on the business's operational side and fully recoverable from the persisted record.

**Idempotency Consideration:** Each Server Action generates a client-supplied idempotency token (embedded as a hidden form field, generated on page render) to prevent duplicate submissions from double-clicks or network retries — Stage 3's persistence step checks this token against recent submissions before writing, consistent with the Loading States requirement (UX Phase 3 Section 22) that submit buttons disable during submission, providing defense-in-depth beyond the client-side disable alone.

### 7.4 Validation Flow

Server Actions receive raw `FormData`, not pre-typed objects — validation is therefore the **first and most consequential** stage, directly parallel to the Section 5.6 "Runtime Validation" category already flagged as Server Actions' domain.

```
const freeAuditFormSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  websiteUrl: z.string().url().or(
    z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i).transform(v => `https://${v}`)
  ),
  sourcePageUrl: z.string().url(),
  idempotencyToken: z.string().uuid(),
});
```

**Distinct from Content Schemas (Section 5.1):** Lead-submission schemas are **not** tiered against `BaseContentEntity` — they extend a separate, much smaller `BaseLeadSubmission` validation base, since lead data has no publishing workflow, no SEO metadata, no revision history. Reusing the content-entity tiering here would be a structural mismatch; this is a deliberate divergence, not an oversight.

**Failure Response Shape:** On validation failure, the Server Action returns field-level errors keyed identically to the form's field names, directly consumable by the Form UX Strategy's inline-validation requirement (UX Phase 3 Section 14):

```
type ValidationFailure = {
  readonly ok: false;
  readonly kind: 'VALIDATION_ERROR';
  readonly fieldErrors: Partial<Record<string, string>>;
};
```

**Honeypot/Bot-Protection Integration:** Per Phase 5A Section 6.5's mandate that spam protection remain invisible to legitimate users, every form schema includes a hidden honeypot field (e.g., a field named to look plausible to bots, styled off-screen for humans) validated to be **empty** — a populated honeypot field short-circuits the pipeline at Stage 1, returning a generic success response (never revealing to the bot that it was detected) without proceeding to Stage 3.

### 7.5 Response Strategy

All Server Actions return a single, shared discriminated union type — reusing the `ContentResult<T>` pattern's structural philosophy (Section 4.8) but with a distinct type tailored to the mutation context:

```
type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly kind: 'VALIDATION_ERROR'; readonly fieldErrors: Partial<Record<string, string>> }
  | { readonly ok: false; readonly kind: 'RATE_LIMITED'; readonly retryAfterSeconds: number }
  | { readonly ok: false; readonly kind: 'UNKNOWN_ERROR' };
```

**Success Payload:** `T` for a successful submission is a minimal confirmation shape (`{ submissionId: string; formType: LeadFormType }`) — never the full `BaseLeadSubmission` record, since the client has no need for (and should not receive) the internal `status`/routing-state fields.

**No Silent Failures:** Every branch of `ActionResult` maps to an explicit UX state already defined in prior phases — `VALIDATION_ERROR` → inline field errors (UX Phase 3 Section 14), `RATE_LIMITED` → a user-facing "please try again shortly" message (a new but minor UX state, consistent with the Error States philosophy in UX Phase 3 Section 20's "always a fallback contact method visible" principle), `UNKNOWN_ERROR` → the generic server-failure messaging already specified in UX Phase 3 Section 20. The Success States behavior (UX Phase 3 Section 21 — confirmation messaging, expectation-setting per form type) is driven entirely by the `ok: true` branch's `formType` field, so one client-side handler can route to the correct confirmation copy without duplicating submission logic per form.

### 7.6 Future Lead Forms — Extensibility Pattern

New lead-capture forms (e.g., a future gated-resource download form under `/resources`, per IA Phase 2 Section 20) are added by: (1) defining a new `LeadFormType` enum member, (2) extending `BaseLeadSubmission` with form-specific fields following the Section 7.2 pattern, (3) authoring a Zod schema following Section 7.4's pattern, (4) reusing the existing `withLeadSubmissionPipeline` wrapper unchanged. No new architectural pattern is introduced for future forms — this is a direct application of Architecture Philosophy Principle 6 (Section 1) — "extensibility is designed for, not built out, ahead of need."

---

**Section 7 — Server Actions Architecture complete.**

Ready to proceed to **Section 8 — API Boundary Design** on your next message.

## 8. API Boundary Design

### 8.1 Boundary Classification Principle

Every point where this system exchanges data with something outside its own Next.js process is classified as either **Internal** (application-to-application, within the trust boundary of this codebase) or **External** (crossing into a third-party system).

This classification determines:

- Authentication posture
- Validation rigor
- Ownership layer
- Security responsibility

This is the API-level continuation of the Repository abstraction established in **Section 6**.

Every third-party integration is isolated behind a single boundary module.

Server Components and Content Services never communicate directly with third-party vendors.

---

### 8.2 Internal Boundaries

| Boundary | Direction | Mechanism | Owning Layer |
| --- | --- | --- | --- |
| Server Component → Content Service | Internal | Direct Function Call | Section 6.2 |
| Content Service → Repository | Internal | Direct Function Call | Section 6.1 |
| Client Component → Server Action | Internal | Framework-mediated | Section 7 |
| `app/api/revalidate/route.ts` → `revalidateTag()` | Internal | Direct Next.js API | Section 8.4 |

### Governance Rule

Internal boundaries:

- Never duplicate validation
- Never duplicate authentication
- Never require API Keys
- Never perform network hops

They operate entirely inside the trusted application boundary.

---

### 8.3 External Boundaries

| Integration | Direction | Boundary Module | Authentication |
| --- | --- | --- | --- |
| Headless CMS | Read | Repository Layer | Server-side API Token |
| CMS Webhook | Inbound | `/api/revalidate` | Shared Secret (HMAC) |
| Google Analytics 4 | Outbound | `lib/monitoring/ga4.ts` | Measurement ID |
| Microsoft Clarity | Outbound | `lib/monitoring/clarity.ts` | Project ID |
| Google Search Console | Passive | Verification Only | DNS / Meta Tag |
| Future CRM | Outbound | `lib/integrations/crm.ts` | Server-side API Key |
| Future Sentry | Outbound | `lib/monitoring/sentry.ts` | DSN |

### Rule

Every integration:

- Owns one boundary module
- Owns one integration layer
- Exposes one typed contract

Vendor SDKs never appear across multiple files.

---

### 8.4 CMS Webhook Architecture

CMS Webhook is responsible for triggering ISR cache revalidation.

### Request Flow

```text
CMS Publish

↓

POST /api/revalidate

↓

HMAC Signature Verification

↓

Zod Validation

↓

Resolve CONTENT_TAGS

↓

revalidateTag()

↓

Structured Logging

↓

HTTP Response
```

### Payload Schema

```ts
const webhookPayloadSchema = z.object({
  entityType: z.enum([...contentEntityTypeValues]),
  entityId: z.string().min(1),
  eventType: z.enum([
    "PUBLISH",
    "UPDATE",
    "UNPUBLISH",
    "ARCHIVE",
  ]),
  timestamp: isoDateStringSchema,
});
```

### Why HMAC Instead of IP Allowlisting

- CMS Vendor Agnostic
- More Secure
- Works across infrastructure providers
- Future-proof against vendor migration

### Failure Isolation

Invalid webhook requests:

- Never touch Repository Layer
- Never trigger cache invalidation
- Never modify application state
- Are rejected immediately

---

### 8.5 Analytics Integration

Analytics integrations are:

- Fire-and-forget
- Client-side
- Non-blocking

Analytics failures must never:

- Break rendering
- Break forms
- Block navigation

### Analytics Event Contract

```ts
type AnalyticsEvent =
  | {
      name: "free_audit_submitted";
      formType: "FREE_AUDIT";
    }
  | {
      name: "consultation_booked";
      formType: "CONSULTATION";
    }
  | {
      name: "contact_submitted";
      formType: "CONTACT";
    }
  | {
      name: "newsletter_subscribed";
    }
  | {
      name: "cta_clicked";
      ctaIntent: CTAIntent;
    };

function trackEvent(event: AnalyticsEvent): void;
```

### Rule

Components never call:

- `gtag()`
- Clarity SDK
- Vendor APIs

They call only:

```ts
trackEvent(...)
```

The analytics layer fans out internally to GA4, Clarity, and future analytics providers.

---

### 8.6 Future CRM Integration

CRM integration is intentionally deferred.

Server Actions already expose the routing point.

Future implementation only replaces the adapter.

### Contract

```ts
interface CRMRoutingResult {
  readonly ok: boolean;
  readonly externalLeadId: string | null;
}

function routeLeadToCRM(
  submission: BaseLeadSubmission
): Promise<CRMRoutingResult>;
```

Routing failures:

- Never affect the user
- Never lose submissions
- Are logged
- Can be retried later

---

### 8.7 Boundary Isolation Summary

Every external integration follows three architectural rules.

### 1. Single Call Site

Each integration has exactly one boundary module.

### 2. Typed Contracts

Application code never consumes vendor SDK types directly.

Boundary modules expose typed interfaces only.

### 3. Non-Blocking Failures

External integrations fail gracefully.

Only CMS Repository failures may propagate to the application because content retrieval is essential.

Analytics, CRM, and Monitoring failures never interrupt user workflows.

---

**Section 8 — API Boundary Design Complete**

Sections 1–8 remain frozen and unmodified. Continuing with Section 9.

---

# 9. Error Handling Strategy

### 9.1 Typed Error Taxonomy

Every error that can occur anywhere in the data layer is a **named, typed value** — never a bare `Error` thrown and caught by shape-sniffing. This is the direct enforcement mechanism behind the "Repository methods never throw" rule established in Section 6.7 and the "Server Actions never throw, always return `ActionResult`" rule from Section 7.5.

```
type ContentError =
  | NotFoundError
  | ContentValidationError
  | UpstreamServiceError
  | ReferentialIntegrityError
  | UnauthorizedPublishError;

interface NotFoundError {
  readonly kind: 'NOT_FOUND';
  readonly entityType: ContentEntityType;
  readonly identifier: string; // slug or id, whichever was queried
}

interface ContentValidationError {
  readonly kind: 'VALIDATION_ERROR';
  readonly entityType: ContentEntityType;
  readonly identifier: string;
  readonly issues: readonly { path: string; message: string }[]; // derived from ZodError.issues
}

interface UpstreamServiceError {
  readonly kind: 'UPSTREAM_ERROR';
  readonly source: 'CMS' | 'CRM' | 'ANALYTICS';
  readonly cause: string; // sanitized message, never a raw stack trace exposed beyond logging
}

interface ReferentialIntegrityError {
  readonly kind: 'REFERENTIAL_INTEGRITY_ERROR';
  readonly entityType: ContentEntityType;
  readonly entityId: string;
  readonly blockedBy: readonly { entityType: ContentEntityType; entityId: string }[];
} // Direct implementation of Section 3.18.2's soft-delete referential-integrity rule

interface UnauthorizedPublishError {
  readonly kind: 'UNAUTHORIZED_PUBLISH_ERROR';
  readonly entityType: 'CaseStudy' | 'Testimonial';
  readonly entityId: string;
} // Direct implementation of Section 5.3's authorization-gate validation
```

**Why a Closed Union, Not a Generic `Error` Subclass Hierarchy:** A discriminated union (rather than `class NotFoundError extends Error`) lets every consumer — Server Components, Content Services, the build pipeline — exhaustively `switch` on `error.kind` with compile-time guarantees (TypeScript's exhaustiveness checking, enabled implicitly by `strict` mode per Section 4.1) that every error case has been handled. A class hierarchy caught via `instanceof` chains offers no such compiler guarantee and was rejected specifically for that reason.

### 9.2 Validation Errors — Propagation Path

`ContentValidationError` (content domain) and the Server Action `VALIDATION_ERROR` branch (Section 7.5, lead-submission domain) are deliberately **separate types**, not a shared error shape, because their consumers and recovery paths are entirely different:

- `ContentValidationError` is consumed by **build tooling and the Repository layer** (Section 6.7) — its resolution is an editorial/content fix in the CMS, and at build time it is fatal (Section 5.5).
- Server Action `VALIDATION_ERROR` is consumed by **the form UI** — its resolution is the end user correcting their input, and it is never fatal, always recoverable within the same request/response cycle (Section 7.4).

This mirrors the same deliberate divergence already established in Section 7.4 between content schemas and lead-submission schemas — the error taxonomy follows the same domain boundary, not an artificial unification.

### 9.3 404 Strategy

A `NotFoundError` returned from any page-level Content Service call (Section 6.2) is translated, at the `page.tsx` boundary, into Next.js's native `notFound()` call — rendering the `app/not-found.tsx` route (Phase 5A Section 4) rather than a generic 500 or an empty page shell.

**Distinguishing "Legitimately Not Found" from "Should Never Happen":**

| Scenario | Handling |
|---|---|
| User navigates to a slug that never existed (typo, stale external link) | Standard `notFound()` → 404 page, per UX Phase 3 Section 20 (search bar, links to primary hubs) |
| Content was `ARCHIVED` (Section 2.4) | **Not** a `NotFoundError` — the Repository still resolves archived content for direct URL access (protects inbound links, per Section 2.4's rationale) but excludes it from listing/navigation queries; only a soft-deleted (Section 3.18.2) or truly nonexistent slug produces `NotFoundError` |
| Location page requested for a city with no content yet, `dynamicParams: true` (Phase 5A §3.2) | Not immediately a 404 — first attempts on-demand generation (Section 5.6); only resolves to `NotFoundError`/404 if the city genuinely doesn't exist in the CMS at all |
| A resolved relationship reference no longer points to published content (e.g., a Case Study's linked Testimonial was archived) | **Never** a 404 — handled by the `publishedRelationGuard` output-validation pattern (Section 5.4), which silently omits the reference rather than failing the entire parent page |

**Governance Rule:** `notFound()` is only ever invoked for the *primary* entity a route is dedicated to (a Service page's own Service, a Blog Post's own post) — never for a missing *related* item, which is always handled via graceful degradation per Section 5.4/6.3. This distinction prevents a single stale cross-reference from taking down an otherwise-healthy page.

### 9.4 Fallback Data Strategy

Reserved specifically for `UpstreamServiceError` (CMS unreachable/timeout) on **already-statically-generated pages** — per Phase 5A Section 7.3's stale-while-revalidate CDN behavior, the primary fallback mechanism is architectural (the CDN continues serving last-known-good cached HTML while a background regeneration attempt fails silently and retries later), not application-level fallback data. The Data Access Layer's fallback responsibility is narrower and applies to two specific cases:

1. **Singleton Content** (`Navigation`, `Footer`, `Site Settings` — Sections 3.12/3.13/3.15): Because these render on every page, an `UpstreamServiceError` fetching them cannot simply propagate to `notFound()` (there is no meaningful "404" for a missing navigation bar). These three repositories are the only ones with a **defined, hardcoded minimal fallback value** (e.g., a bare-minimum Footer with just legal links, an empty-but-structurally-valid Navigation) — logged as a critical error (Section 9.6) when triggered, but never crashing page render entirely.
2. **Relationship Resolution** (Section 6.3): An `UpstreamServiceError` during `resolveMany` (e.g., fetching related Case Studies fails mid-request) degrades to an empty array — identical graceful-degradation behavior to a resolved-but-unpublished reference (Section 5.4) — rather than failing the entire parent page for a non-critical, supplementary content section.

**Explicit Non-Fallback Case:** A `NotFoundError` or `UpstreamServiceError` on a page's **primary entity** (the Service itself, the Blog Post itself) has no fallback — this correctly surfaces as a 404 (Section 9.3) or, for a genuine upstream outage during build, a failed build (Section 5.5), never a fabricated placeholder page. Fallback data exists only for structural/supplementary content, never as a substitute for real primary content.

### 9.5 Logging Integration

*(Implements the logging categories already named at the architectural level in Phase 5A Section 8; this section defines what specifically feeds each log category from the data layer.)*

| Phase 5A Log Category | Data-Layer Source |
|---|---|
| **Error Logs** (§8.2) | Every `ContentError` variant (Section 9.1), every `ActionResult` `UNKNOWN_ERROR`/`RATE_LIMITED` branch (Section 7.5), every webhook signature/payload failure (Section 8.4) |
| **Form Submission Logs** (§8.3) | Every Server Action pipeline execution (Section 7.3, Stage 3 persistence + Stage 4 routing outcome), including `ROUTING_FAILED` status transitions |
| **Build Logs** (§8.1) | Every build-time validation failure (Section 5.5) — entity type, identifier, and full Zod issue list attached |
| **Search Logs** (§8.4) | Not part of the content/error taxonomy directly — logged at the search endpoint (Phase 5A §8.4) independent of `ContentError`, since a zero-result search is not an error condition |

**Structured Logging Contract:** Every logged error includes, at minimum, `kind` (the discriminant from Section 9.1), a correlation identifier (request ID or webhook payload ID), and a timestamp — no logged error is ever a bare string message, ensuring the eventual Sentry integration (Phase 5A §9.4, Section 8.3 above) can be adopted as a structured-ingestion target without a logging-format migration.

### 9.6 Recovery Strategy

Recovery posture differs by error type and boundary, summarized against the taxonomy in Section 9.1:

| Error Kind | Recovery Posture |
|---|---|
| `NOT_FOUND` | No recovery attempted — correct, terminal outcome (Section 9.3) |
| `VALIDATION_ERROR` (content) | Build-time: no recovery, build fails (Section 5.5). Runtime (ISR on-demand): no recovery, 404 (Section 5.6) |
| `VALIDATION_ERROR` (lead submission) | User-recoverable within the same request — form re-displays with field errors (Section 7.4), no server-side retry needed |
| `UPSTREAM_ERROR` (CMS, page render) | CDN-layer recovery via stale-while-revalidate (Phase 5A §7.3); singleton/relationship fallback (Section 9.4) at the data layer; no user-facing error surfaced unless the fallback itself is unavailable (a scenario treated as a critical, urgently-logged failure, not a normal-operation path) |
| `UPSTREAM_ERROR` (CRM routing, Server Action Stage 4) | Logged, `status: ROUTING_FAILED` persisted (Section 7.3) — recovery is an **operational/manual process** (business follows up on failed-routing records), not an automated retry within the request lifecycle, since retrying synchronously would delay the user's success response |
| `REFERENTIAL_INTEGRITY_ERROR` | No recovery attempted by the system — this is a deliberate hard-stop presented to the **editor** (rejecting a delete attempt, Section 3.18.2), not an end-user-facing error at all |
| `UNAUTHORIZED_PUBLISH_ERROR` | No recovery attempted by the system — presented to the **editor** as a publish-blocking validation message (Section 5.3), resolved only by completing the authorization step, never bypassed programmatically |

**Cross-Cutting Recovery Principle:** No error type in this system is ever silently swallowed with no trace — every row above results in either a graceful degradation *with logging* (Section 9.5) or an explicit, typed terminal state (`notFound()`, build failure, editor-facing block). This closes the loop back to Architecture Philosophy Principle 4 (Section 1): errors, like content, flow through explicit, typed boundaries rather than ad hoc handling scattered per call site.

---

**Section 9 — Error Handling Strategy complete.**

Ready to proceed to **Section 10 — Data Flow Diagram** and **Section 11 — Architecture Validation** on your next message.

Sections 1–9 remain frozen and unmodified. Continuing with Sections 10–11.

---

# 10. Data Flow Diagram

### 10.1 Primary Read Path — Content Rendering

```
┌─────────────┐
│  Headless   │  (vendor TBD — Phase 5A §2.1)
│    CMS      │
└──────┬──────┘
       │ raw JSON (vendor-native shape)
       ▼
┌─────────────────────────────────────────────┐
│  REPOSITORY IMPLEMENTATION (Section 6.1)     │
│  • sole location of CMS SDK import           │
│  • parses raw response → Tier 3 Zod schema   │
│    (Section 5.1)                             │
│  • on failure: ContentValidationError or     │
│    UpstreamServiceError (Section 9.1),       │
│    wrapped in ContentResult<T> — never throws│
└──────┬────────────────────────────────────────┘
       │ ContentResult<T>  (branded, readonly domain object)
       ▼
┌─────────────────────────────────────────────┐
│  CONTENT SERVICE (Section 6.2)               │
│  • orchestrates multiple Repositories        │
│  • resolveMany() for relationship fields      │
│    (Section 6.3) — batched getManyByIds       │
│  • applies publishedRelationGuard             │
│    (Section 5.4) — drops stale references     │
│  • composes page-ready shape (e.g.            │
│    ServicePageData)                           │
└──────┬────────────────────────────────────────┘
       │ ContentResult<PageData>
       ▼
┌─────────────────────────────────────────────┐
│  SERVER COMPONENT (page.tsx, Phase 5A §4/5)  │
│  • one Content Service call per page          │
│  • { ok: false } → notFound() (Section 9.3)   │
│    or fallback data (Section 9.4)             │
│  • { ok: true }  → passes readonly domain     │
│    data down as component props               │
│  • generateMetadata() reads .seo field         │
│    (Section 3.16) → lib/seo/ (Phase 5A §4)    │
└──────┬────────────────────────────────────────┘
       │ typed, readonly props
       ▼
┌─────────────────────────────────────────────┐
│  UI (Design System components, Phase 4;      │
│  Component Engineering Spec, future Phase 7) │
│  • pure presentation — never fetches,         │
│    never mutates                              │
└───────────────────────────────────────────────┘
```

**Caching Overlay (Section 6.4–6.5, Phase 5A §7):** The Repository's `fetch` call at the top of this diagram carries `tags`/`revalidate` config per content category — meaning, in practice, most requests never reach the live CMS at all; they are served from CDN edge cache (Phase 5A §7.2) with the diagram above representing the **cache-miss / regeneration** path, not the steady-state hot path.

### 10.2 Write Path — CMS Content Update → Live Site

```
Editor publishes/updates content in CMS
        │
        ▼
CMS fires webhook → POST /api/revalidate (Section 8.4)
        │
        ▼
Signature verification (HMAC) ──fail──► 401, logged, no cache effect
        │ pass
        ▼
Payload validated (webhookPayloadSchema) ──fail──► 400, logged, no cache effect
        │ pass
        ▼
entityType + entityId → CONTENT_TAGS.entityTag() (Section 6.6)
        │
        ▼
revalidateTag(tag) — surgical, single-entity invalidation
        │
        ▼
Next request for that route ──► regenerates via Section 10.1's
                                  read path, re-validates (Section
                                  5.5-equivalent runtime check),
                                  re-caches at CDN (Phase 5A §7.3)
```

### 10.3 Write Path — User Lead Submission

```
User submits form (Free Audit / Consultation / Contact / Newsletter)
        │
        ▼
Server Action invoked (Section 7.1)
        │
        ▼
withLeadSubmissionPipeline (Section 7.3):
  1. Parse & Validate (Section 7.4) ──fail──► ActionResult VALIDATION_ERROR
  2. Rate-Limit Check (Phase 5A §6.5) ──fail──► ActionResult RATE_LIMITED
  3. Persist BaseLeadSubmission, status: RECEIVED ─────► Form Submission Log (Section 9.5)
  4. Route to CRM (Section 8.6) ──fail──► status: ROUTING_FAILED, logged,
                                            but pipeline continues
        │ (Stage 4 outcome does not block Stage 5)
        ▼
  5. Respond ActionResult { ok: true, data: { submissionId, formType } }
        │
        ▼
Client: trackEvent() fired (Section 8.5) → GA4 + Clarity
        │
        ▼
Success State rendered (UX Phase 3 §21) — confirmation copy keyed by formType
```

**Key Property Illustrated:** This path never touches the Content Domain (Section 10.1's diagram) at all — the two write paths (10.2 content, 10.3 leads) are fully independent, confirming the domain separation established in Section 7.1.

### 10.4 Build-Time Path (SSG Generation)

```
Build triggered (deploy or scheduled)
        │
        ▼
generateStaticParams() per dynamic route (Phase 5A §5.3)
        │
        ▼
For every param: full Section 10.1 read path executed
        │
        ▼
Build-time validation sweep (Section 5.5):
  • per-entity Tier 3 schema parse
  • cross-entity referential integrity sweep
  • slug collision sweep
  • singleton integrity check
        │
   ┌────┴────┐
  fail       pass
   │           │
   ▼           ▼
BUILD FAILS   Static HTML + JSON payload generated,
(Phase 5A     tagged per Section 6.4, deployed to CDN
 §8.1)         (Phase 5A §7.2)
```

---

# 11. Architecture Validation

### 11.1 ✓ Scalable

- **Content volume:** Location pages (Section 3.3) are the explicit stress case — `dynamicParams: true` with on-demand ISR (Phase 5A §3.2) means scaling from a handful to hundreds of cities requires zero architectural change, only content addition.
- **New content types:** Adding a future entity follows an identical, repeatable five-layer pattern established across Sections 3–7: extend the appropriate base type (Section 4.6) → define a Tier 3 Zod schema (Section 5.1) → add one Repository interface + implementation (Section 6.1) → add/extend a Content Service (Section 6.2) → wire into `generateStaticParams`. No layer requires bespoke, one-off logic per new type.
- **New lead forms:** Section 7.6 confirms this is additive-only against the existing `withLeadSubmissionPipeline`.
- **Relationship-heavy pages:** Batched `getManyByIds` (Section 6.3) prevents N+1 growth as content volume increases.

### 11.2 ✓ Type Safe

- Strict-mode compiler configuration (Section 4.1) with zero sanctioned `any`/`@ts-ignore` outside one narrow, documented Repository seam.
- Branded types (Section 4.3) prevent cross-entity ID confusion at compile time — a structural guarantee, not a naming convention.
- `readonly` enforced at every level of the domain model (Section 4.7), making the "components consume, never mutate" principle compiler-checked.
- Discriminated-union error taxonomy (Section 9.1) enables exhaustive `switch` handling, verified by the compiler, not just convention.
- Zod schemas and TypeScript interfaces are structurally mirrored tier-for-tier (Section 5.1 ↔ Section 4.6), so runtime validation and compile-time types can never silently drift apart.

### 11.3 ✓ CMS Agnostic

- Exactly one class per entity (the Repository implementation, Section 6.1) is permitted to import a CMS vendor SDK — verified as a hard governance rule, not a soft guideline.
- `RichContent` (Section 4.5) is a normalized, vendor-independent block structure — any CMS's native rich-text format is transformed into this shape at the Repository boundary, never passed through raw.
- The CMS vendor decision (Phase 5A §2.1) remains fully open at the close of this document — every section from 3 through 10 was written, and validated, without requiring that decision to be made.
- Webhook authentication (Section 8.4) uses vendor-agnostic HMAC signing rather than a vendor-specific mechanism.

### 11.4 ✓ Enterprise Ready

- Full editorial governance: Publishing Workflow (Section 2.4), Revision History, Soft Delete, and immutable Audit Trail (Section 3.18) apply uniformly across the domain, with authorization-gated publish rules (Sections 3.9/3.10/5.3) enforced at the validation layer, not by editorial discipline alone.
- Structured, correlated logging (Section 9.5) across build, error, form-submission, and search categories — feeding directly into the Monitoring Strategy already frozen in Phase 5A §9.
- Referential integrity is protected against accidental data loss (Section 3.18.2 / `ReferentialIntegrityError`, Section 9.1), a common gap in less rigorously modeled content systems.
- Every external integration (Section 8.3–8.6) is isolated to a single, typed boundary module with a defined failure posture — no scattered, ungoverned third-party calls.

### 11.5 ✓ Future Proof

- Authentication readiness (Phase 5A §6.4) and the reserved `(portal)` route group (Phase 5A §5.2) require no changes to any model in Section 3 to eventually support a client portal.
- Future CRM integration (Section 8.6) is a stub-to-real swap with zero change to the Server Action pipeline that calls it.
- Future Sentry integration (Section 9.5/Phase 5A §9.4) is a drop-in against already-structured error objects.
- The generic `CreateInput<T>`/`UpdateInput<T>` DTO derivation (Section 4.8) means new content types never require hand-written DTO boilerplate that could drift from their source model.
- Internationalization/locale routing (Phase 5A §6.2/§6.4, IA Phase 2 §20) was explicitly accounted for as a non-blocking future addition at both the middleware and Location-model level (Section 3.3's `countryCode` field).

---

# Architecture Completion Summary

**Phase 5B — Enterprise Data Layer & TypeScript Domain Models is complete.**

All eleven sections specified in the original scope have been delivered: Data Architecture Philosophy, Domain-Driven Design (four bounded contexts), complete field-level Content Domain Models for all seventeen content types plus the Revision History/Soft Delete/Audit Trail extension, TypeScript Architecture (strict mode, branded types, base-type hierarchy, utility types, naming conventions), the layered Zod Validation strategy across four distinct boundaries, the Repository/Content Service Data Access Layer, Server Actions Architecture for all lead-capture forms, API Boundary Design covering internal and external integrations, a typed Error Handling taxonomy with defined recovery postures, and Data Flow Diagrams for read, write, and build-time paths.

Every decision in this document traces back to and is consistent with the frozen foundations of Phases 1 through 5A — no prior-phase decision was modified, contradicted, or redesigned. The one deliberately deferred decision (CMS vendor selection, flagged since Phase 5A §2.1) remains open by design and does not block freezing this document, since the architecture was validated in Section 11.3 to function correctly regardless of which vendor is ultimately chosen.

**Recommendation: Phase 5B is ready to be reviewed and frozen alongside Phases 1–5A.**

Per the original implementation plan, the next phase is **Phase 6 — SEO, AEO & GEO Technical Implementation Spec**, which will build directly on the `SEOMetadata` value object (Section 3.16), the `lib/seo/` module (Phase 5A §4), and the `generateMetadata` pattern (Phase 5A §5.4) already established here.
