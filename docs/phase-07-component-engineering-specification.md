Phases 1–6, in their entirety, remain frozen and immutable. Phase 7 begins, inheriting all prior decisions without modification.

---

# SEO Growth Hub — Component Engineering Specification (Phase 7)

**Document Owner:** Lead Software Architect / Senior Next.js Architect / Lead TypeScript Engineer / Lead UI Designer
**Status:** Draft v1.0 — Built on Approved PRD, IA, UX Blueprint, Design System, Phase 5A, Phase 5B, Phase 6
**Classification:** Internal — Foundational Blueprint Document

---

# 1. Component Engineering Philosophy

### 1.1 Purpose of Phase 7

Phase 4 established *what* every component looks like and *how* it behaves at the design-token and interaction level — color, spacing, typography, states, accessibility requirements (Phase 4 §11–26). Phase 5A established *where* components execute (Server Component default, client-island exceptions, Phase 5A §3.3, §5.6) and Phase 5B established *what data* flows into them (typed domain models, Phase 5B §3–4). Phase 6 established what every component's rendered output must expose to search engines, AI retrieval systems, and accessibility technologies (structured data, semantic HTML, entity consistency).

None of these four phases specified the **engineering contract** a component actually exposes to the code that consumes it: its props signature, its composition boundaries, its internal state ownership, its data-fetching responsibility (or explicit lack thereof), and the precise rule governing whether it renders on the server or hydrates on the client. This is the gap Phase 7 exists to close. Its purpose is narrow and specific: to translate four already-frozen specifications into a single, unambiguous engineering contract per component — the last specification document standing between architecture and code.

**Phase 7 Produces Contracts, Not Code:** Consistent with the instruction governing this phase, and with the discipline already established since Phase 5B §1 ("this document is the engineering specification... not the code itself"), every section of Phase 7 defines *what* a component's API surface, responsibility boundary, and rendering classification must be — never the literal implementation. A future Phase 8 (or equivalent build-execution phase, per the implementation plan established at Phase 5B's outset) is where these contracts become `.tsx` files.

### 1.2 Scope

Phase 7's scope is the **complete Component Inventory already enumerated in Phase 4 §26** — Header/Navigation, Mega Menu, Hero Section, CTA Band, Card (all variants), Testimonial Card, Stat/Metric Callout, FAQ Accordion, Form (all variants), Breadcrumb, Footer, Client Logo Bar, Search Overlay, Author Byline, Table of Contents — plus the structural systems given full specification in Phase 4 §16–23 (Modal, Drawer, Table, Empty State, Skeleton Loading, Toast Notification) and the page-level composition patterns implied by the UX Journeys of Phase 3 §5–10.

**Explicitly Out of Scope:**
- Any new visual, interaction, or accessibility rule (Phase 4's exclusive domain, unmodified).
- Any new rendering-strategy, routing, or caching decision (Phase 5A's exclusive domain, unmodified).
- Any new content model, validation rule, or repository contract (Phase 5B's exclusive domain, unmodified).
- Any new metadata, structured-data, or discoverability mechanism (Phase 6's exclusive domain, unmodified).
- Literal code, whether TypeScript, JSX, or configuration files (deferred to implementation execution).

Phase 7 exists entirely in the space between these already-frozen specifications and the eventual codebase — it is the last purely-specification layer, not an earlier or later one.

### 1.3 Relationship to Phases 1–6

Phase 7 is the direct, load-bearing consumer of all six prior phases simultaneously, in a manner no single earlier phase was:

- **From Phase 3 (UX Blueprint):** Every component's *purpose* and *expected user action* (Phase 3 §5–10's per-page specifications, Phase 3 §26's Component Inventory) is inherited verbatim — Phase 7 does not redefine what a Hero Section or CTA Band is *for*.
- **From Phase 4 (Design System):** Every component's *visual variant set*, *state behavior* (default/hover/focus/active/disabled/loading), and *accessibility requirement* is inherited verbatim — Phase 7 translates these into prop-level contracts (e.g., Phase 4 §11's Button variants become a literal `variant` prop union) without altering their substance.
- **From Phase 5A (Technical Architecture):** The Server-Component-default / client-island-exception boundary (Phase 5A §3.3), the folder structure's `components/` subdivision (Phase 5A §4), and the loading/error-boundary placement rules (Phase 5A §5.5) are the direct governing constraints on Section 7 (this phase's Server vs. Client Component Philosophy) below.
- **From Phase 5B (Data Architecture):** Every component's props are typed **projections** of the domain models already defined (Phase 5B §3, §4.8's `Pick<T, K>` pattern) — a component never invents its own parallel shape for data that already has a canonical type.
- **From Phase 6 (SEO/AEO/GEO):** Every component that renders SEO-relevant output (breadcrumbs, cards carrying entity titles as anchor text, FAQ accordions carrying schema-eligible content) must produce markup consistent with the structured-data and semantic-HTML guarantees already established (Phase 6 §3, §7.9, §8) — Phase 7 does not renegotiate what that markup must contain, only how the component internally achieves it.

**Phase 7 Introduces No New Authority:** Where any apparent conflict arises between what this phase specifies and what an earlier phase already established, the earlier phase governs (per Phase 6 §22.4's inheritance model, restated here as binding for Phase 7 specifically) — this document's role is strictly translational.

### 1.4 Component Engineering Philosophy

**A Component Is a Typed Contract Before It Is a Rendering Surface.** Consistent with the TypeScript Architecture already frozen in Phase 5B §4 (interfaces for domain shapes, branded types, `readonly` enforcement), every component specified in this phase is defined first by its props interface — the data and callbacks it accepts — and only secondarily by its visual output, which Phase 4 has already fully specified. This ordering matters: a component's engineering identity is its contract, not its appearance, since the same visual component (e.g., a Card) may be instantiated against several different domain-model projections (Service, Case Study, Blog Post) without its underlying contract shape changing category.

**Components Consume; They Do Not Fetch, Validate, or Mutate.** This is the direct, unmodified restatement of Phase 5B §1 Principle 4 and §4.7's `readonly`-enforced boundary, now given its full component-engineering consequence: no component specified in this phase issues a Repository call, a Content Service call, or a raw `fetch` for content already available through page-level data resolution (Phase 5B §6.2, Phase 6 §2.12's shared Content Service call). Data arrives as props; components render it.

**One Component, One Responsibility, Composed — Never One Component, Many Concerns.** A component that renders a Card and also fetches its own related-content list and also tracks its own analytics event is three responsibilities wearing one name. Phase 7's contracts are deliberately narrow per component, with composition (Section 1.6 below) as the mechanism for assembling narrow components into page-level experiences — mirroring the Content Service / Repository separation already established in Phase 5B §6.1–6.2 at the data layer, now applied at the presentation layer.

### 1.5 Governing Principles

1. **Inheritance Over Invention.** Every prop, variant, and state a component exposes must trace to an already-frozen decision in Phase 3, 4, 5B, or 6 — a component contract that requires inventing new visual or behavioral rules not already specified elsewhere is out of scope for Phase 7 and must be referred back to the relevant earlier phase.
2. **Determinism.** Given the same props, a component renders the same output — no component holds hidden, non-deterministic internal state that alters its rendering independent of its inputs (consistent with Phase 6 §22.2 Principle 2, Deterministic Rendering, now extended from page-level artifacts to component-level output).
3. **Build-Time Enforceability Wherever Possible.** Prop shapes, required-vs-optional fields, and variant unions are expressed as TypeScript types enforceable by the compiler (Phase 5B §4.1's strict-mode discipline) — runtime prop validation is the exception, reserved only for genuinely runtime-sourced data (e.g., Server Action form state, Phase 5B §7), never the default posture for page-supplied content props.
4. **Technology Independence Within the Chosen Stack.** While the stack itself (Next.js App Router, TypeScript, Tailwind — Phase 5A §2) is fixed and not reopened by this phase, component contracts are specified in a manner that does not presuppose a specific state-management library, animation library, or form-handling library beyond what Phase 5A §2/Design System §29 already named — keeping contracts as implementation-detail-agnostic as the fixed stack permits.
5. **No Duplication Across Component Categories.** Where two components share a structural pattern already established in Phase 4 (e.g., Card's "entire card clickable, title present" pattern, Phase 4 §13, reused across Service/Industry/Case-Study/Blog cards), Phase 7 specifies that shared pattern once, as a base contract, with per-variant extensions — never redefining the same pattern independently per content type.

### 1.6 Component Responsibility Model

Phase 7 classifies every component into exactly one of four responsibility tiers, extending the folder-structure subdivision already frozen in Phase 5A §4 (`ui/`, `layout/`, `forms/`, `content/`, `feedback/`, `sections/`):

| Tier | Responsibility | Phase 5A Folder Mapping | Example |
|---|---|---|---|
| **Primitive** | Smallest reusable unit; no domain-model awareness; pure presentation of Design-System tokens | `components/ui/` | Button, Badge, Tag, Input |
| **Composite** | Combines primitives into a domain-aware but still-reusable unit; accepts a typed content projection as props | `components/content/`, `components/forms/` | Card (Service/Case-Study/Blog variants), Form (Free Audit/Consultation variants) |
| **Structural** | Site-wide, singleton-backed, appears on every or nearly every page | `components/layout/` | Header/Navigation, Footer, Breadcrumb |
| **Compositional (Section)** | Assembles Primitives, Composites, and Structural components into a page-region matching a UX Phase 3 scroll-journey step | `components/sections/` | Hero Section, CTA Band, Trust Bar |

**Why This Tiering, Specifically:** This mirrors the Data Access Layer's own layering (Phase 5B §6.1's Repository → §6.2's Content Service → page-level composition) — Primitives are the presentation-layer equivalent of branded value types (Phase 5B §4.3), Composites are the equivalent of a single Repository's domain-shaped output, and Compositional/Section components are the equivalent of a Content Service's page-ready composite shape (Phase 5B §6.2). No tier fetches on behalf of the tier below or above it; each consumes only what it is explicitly given.

**One-Directional Composition Rule:** A component in a lower tier (Primitive) never imports or depends upon a component in a higher tier (Composite, Structural, Compositional) — dependency flows strictly upward in composition (Sections assemble Composites and Structurals; Composites assemble Primitives), never sideways or downward, preventing the circular-composition risk that would otherwise undermine this tiering's value.

### 1.7 Server vs. Client Component Philosophy

**Restated Governing Rule (Phase 5A §3.3, Given Its Full Per-Component Consequence Here):** Every component specified in this phase defaults to a Server Component unless it appears on the closed, named list of client-island exceptions already established in Phase 5A §3.3 — mega-menu interactivity, mobile drawer navigation, form input/validation state, search overlay, FAQ accordion expand/collapse, testimonial carousel controls, toast notifications. Phase 7 does not expand this list; it assigns every component in the full Phase 4 §26 inventory to one side of this boundary, closing the classification gap Phase 5A left at the architectural-principle level rather than the per-component level.

**Classification of the Complete Component Inventory:**

| Component | Classification | Rationale |
|---|---|---|
| Header shell, Mega Menu content | Server (shell) + Client (interactivity) — a split component | The menu's link structure (Phase 5B §3.12's `Navigation` entity) is server-rendered; only the open/close and hover-expand behavior is a client island, per Phase 5A §3.3's named exception |
| Hero Section, CTA Band, Card (all variants), Stat/Metric Callout, Client Logo Bar, Author Byline, Table of Contents | **Server** | Pure content presentation, no interactivity beyond native `<a>` navigation |
| Testimonial Card | Server (static variant) / Client (carousel variant) | Only the carousel's auto-advance/pause controls require client interactivity (Design System Phase 4 §26.6); a non-carousel testimonial display is fully server-rendered |
| FAQ Accordion | **Client** | Named exception, Phase 5A §3.3 — expand/collapse state |
| Form (all variants) | **Client** | Named exception — input/validation state |
| Search Overlay | **Client** | Named exception |
| Mobile Drawer Navigation | **Client** | Named exception |
| Toast Notification | **Client** | Named exception |
| Breadcrumb, Footer | **Server** | Static, singleton-sourced, no interactivity |
| Modal, Drawer (general system, Design System §17–18) | **Client** | Focus-trap and open/close state inherently require client-side interactivity |
| Skeleton Loading, Empty State | **Server** (rendered as part of a `loading.tsx`/conditional-render path, not independently interactive) | No user interaction; purely conditional presentational states |

**Split-Component Discipline:** Where a single Phase 4 component (Header/Mega-Menu, Testimonial Card) contains both static content and an interactive sliver, this phase's contract specifies that sliver as its own, narrowly-scoped client-island component composed *within* an otherwise-server-rendered parent — never promoting the entire parent to a client component merely because one small part of it needs interactivity. This is the direct, component-level enforcement of Phase 5A §3.3's "genuinely interactive" scoping test and Phase 5A/Phase 6 §13's Performance Architecture's JavaScript-budget discipline (Phase 6 §13.7): every unnecessary client boundary is JavaScript a user's browser must download and execute for no rendering benefit.

### 1.8 Extensibility Principles

**Closed-Set Discipline, Restated From Phase 6 §9.3/§16.7's Precedent:** The component categories enumerated in Section 1.6 (Primitive, Composite, Structural, Compositional) form a closed classification set — a future new component is assigned to one of these four tiers using the same reasoning demonstrated in Section 1.6, never left unclassified or granted an ad hoc fifth category.

**New Content-Type Components Follow the Established Composite Pattern:** Consistent with Phase 6 §21.8 Checklist A's "New Content-Type Introduction" workflow, a future eighteenth content type (per Phase 5B §9.2/§16.7's precedent for future content-type additions generally) requires a new Composite-tier component only insofar as its content shape genuinely differs from every existing Card/Form variant — where an existing Composite's contract (e.g., Card's shared "entire card clickable, title-sourced anchor text" pattern, Phase 6 §7.9) already accommodates the new type via its existing `Pick<T, K>`-style projection (Phase 5B §4.8), no new component is introduced at all; only a new variant of an existing one.

**No Speculative Component Authoring:** Consistent with Phase 5A §1 Principle 6 ("designed for, not built out, ahead of need") and its repeated application throughout Phase 6 (video sitemap readiness §6.8, authentication readiness §Phase 5A 6.4), Phase 7 does not author contracts for components with no corresponding requirement in Phases 1–6 — every component specified in the sections that follow exists because Phase 3's UX Journeys or Phase 4's Component Inventory already called for it.

### 1.9 Section Resolution Summary

Section 1 has established the following, each carried forward as binding constraint on every subsequent Phase 7 section:

- Phase 7 produces engineering **contracts**, never code (§1.1).
- Its scope is the complete, already-frozen Phase 4 §26 Component Inventory plus Phase 4 §16–23's structural systems — no new components beyond this set (§1.2).
- Every component contract is a translation of, never a modification to, Phases 3–6 (§1.3).
- Components are typed contracts first, consume-only (never fetch/validate/mutate), and single-responsibility (§1.4).
- Five governing principles — inheritance, determinism, build-time enforceability, technology independence within the fixed stack, and no cross-category duplication — govern every subsequent contract (§1.5).
- A four-tier Responsibility Model (Primitive/Composite/Structural/Compositional) classifies every component, with strictly upward composition dependency (§1.6).
- The complete Component Inventory has now been classified against the Server-default/Client-exception boundary already established in Phase 5A §3.3, with a split-component discipline for components straddling both (§1.7).
- Extensibility follows closed-set classification and existing-variant-first discipline, with no speculative component authoring (§1.8).

Every section that follows in Phase 7 — component-by-component or tier-by-tier prop/API specification, composition-pattern documentation, and accessibility-implementation notes — operates within this frame.

**End of Section 1 — Component Engineering Philosophy.**

Phases 1–6 and Phase 7 Section 1 remain frozen and unmodified. Continuing with Section 2.

---

# 2. Component API & Props Contract Architecture

### 2.1 Purpose and Scope of This Section

Section 1 established that a component's engineering identity is its typed contract (§1.4) and that every prop must trace to an already-frozen decision elsewhere in this project (§1.5, Governing Principle 1). Section 2 specifies the **rules governing how that contract is constructed** — how a component's props are derived from Phase 5B's domain models, how they are named, which are required versus optional, how composition (`children`) is bounded, how event/callback signatures are shaped, and where prop-level validation occurs. This section precedes any per-tier or per-component specification (Sections 3+) because every subsequent section's prop tables depend on the derivation and naming rules established here — without this section, each component's contract would need to re-derive these rules independently, risking exactly the cross-component inconsistency Section 1's Governing Principle 5 already prohibits.

**This Section Governs Form, Not Content:** Section 2 does not specify *which* props any specific component has — that is Sections 3+'s responsibility, component-by-component. It specifies the *rules* every such prop table must obey.

### 2.2 Props Derivation Strategy

**The Governing Rule, Restated From §1.4 and Given Its Mechanical Form:** A component's props interface is never independently authored from scratch when a corresponding domain model already exists in Phase 5B §3 — it is a **derived projection**, constructed using the exact `Pick<T, K>` / `Omit<T, K>` utility-type pattern already established in Phase 5B §4.8. This is not a stylistic preference; it is the mechanism that makes Section 1's "no duplication across component categories" principle enforceable by the TypeScript compiler rather than by editorial discipline.

**Three Derivation Sources, Closed Set:**

| Derivation Source | Applies To | Mechanism |
|---|---|---|
| **Phase 5B §3 Content Domain Model** | Composite components rendering a single content entity (Service Card, Case Study Card, Blog Card, Testimonial Card, Author Byline) | `Pick<Service, 'id' \| 'slug' \| 'name' \| 'shortDescription' \| 'icon'>`-style projection, exactly as anticipated in Phase 5B §4.8's own example |
| **Phase 5B §3.16 / Value Objects** | Components rendering cross-cutting value objects (SEO-adjacent display, though most `SEOMetadata` consumption is page-level per Phase 6 §2, not component-level) | Direct reuse of the value-object interface, never a redefined shape |
| **Design System Phase 4 Token Enums** | Primitive components with no content-entity awareness (Button, Badge, Tag) | Props are typed against the Design System's own token unions (Phase 4 §11.1's variant table, §28's token vocabulary) — e.g., a `variant` prop's type is a union literal matching Phase 4 §11.1's named variants exactly, never a freely-typed `string` |

**No Fourth Source:** A component prop that does not trace to one of these three sources is, per Section 1.8's extensibility discipline, evidence that either (a) a new Phase 5B content field is needed (out of Phase 7's authority to introduce — refer back to Phase 5B), or (b) the component is being asked to do something outside its tier's responsibility (Section 1.6) and the contract should be reconsidered rather than patched with an ad hoc prop.

**Projection Narrowness Rule:** A Composite component's derived props include *only* the fields that specific rendering context requires — a Card component displaying a Service in a hub-page grid (Phase 3 §5's homepage journey) is not given the full `Service` interface (including `body`, `processSteps`, `deliverables` — fields belonging to the Service's own pillar page, Phase 5B §3.1) merely because the full type is available. This directly extends Phase 5B §1's "Single Source of Truth Per Entity" principle to the presentation layer: a component's props are the *minimum sufficient slice*, never the maximum available slice, preventing over-fetching-shaped props from encouraging a component to render content outside its intended scope.

### 2.3 Prop Naming Conventions

**Direct Extension of Phase 5B §4.9's Naming Conventions, Applied to the Component/Props Layer:** Phase 5B §4.9 already established naming conventions for domain interfaces, branded types, and DTOs. Section 2.3 extends that identical table with the two categories Phase 5B §4.9 did not need to cover, since components did not yet exist as a concern at that phase:

| Category | Convention | Example |
|---|---|---|
| Component prop interfaces | `PascalCase` + `Props` suffix, matching the component's own name | `ServiceCardProps`, `CTABandProps` |
| Boolean props | `is`/`has`/`should` prefix, never a bare adjective | `isLoading`, `hasIcon`, `shouldTruncate` — never `loading`, `icon` (ambiguous with a content prop), `truncate` |
| Event/callback props | `on` + `PascalCase` event name | `onSubmit`, `onDismiss`, `onPageChange` |
| Render-slot props (Section 2.5) | `children` for the primary slot; named `PascalCase` + `Slot` suffix for secondary slots | `children`, `headerSlot`, `footerSlot` |
| Content-projection props | Match the source domain field's name exactly, never renamed | A `ServiceCardProps.shortDescription` field is named `shortDescription`, identical to `Service.shortDescription` (Phase 5B §3.1) — never abbreviated or relabeled at the component boundary |

**Why Content-Projection Props Are Never Renamed:** This is the single most important rule in this subsection. If a component renamed `Service.shortDescription` to, say, `description` at its own props boundary, every future engineer reading that component's usage site would need to mentally re-map the component's vocabulary back to the domain model's vocabulary — a translation cost this document has consistently eliminated at every other layer (Phase 5B §4.9's naming conventions, Phase 6 §7.9's anchor-text-equals-entity-name rule, Phase 6 §8.4's breadcrumb-label-equals-entity-name rule). Prop naming is the component-layer instance of the identical "no unnecessary translation layer" discipline already applied repeatedly since Phase 5B.

### 2.4 Required vs. Optional Prop Governance

**Direct Inheritance From the Domain Model's Own Required/Optional Marking:** A prop derived from a Phase 5B field (§2.2) inherits that field's required/optional status by default — a `Service.name` field marked `Required` in Phase 5B §3.1 produces a required `ServiceCardProps.name`; a `Testimonial.authorTitle` field marked `Optional` (Phase 5B §3.10) produces an optional `TestimonialCardProps.authorTitle`. This is not a new rule Phase 7 invents — it is the mechanical consequence of §2.2's derivation-not-invention principle: a component contract cannot legitimately be stricter or looser about a field's presence than the data source it's projecting actually guarantees.

**Exception — Component-Specific Narrowing, Never Widening:** A component *may* additionally require a field the domain model marks optional, where that component's specific rendering cannot degrade gracefully without it (e.g., a hypothetical Card variant that visually depends on an icon being present might require `icon` even though the underlying `Service.icon` field is itself `Required` at the domain layer already, making this a non-issue in practice — but for a genuinely optional domain field like `Testimonial.authorTitle`, a component is never permitted to *require* it, since doing so would make that component unusable against a fully domain-valid, published `Testimonial` record lacking that field). Narrowing (requiring what the domain marks optional) is permitted only when justified by a genuine rendering necessity and must be documented as a deliberate exception in that component's own contract (Sections 3+); widening (making optional what the domain requires) is never permitted, since it would allow a component to be used in a way the Validation Layer (Phase 5B §5) would never have allowed the underlying content to exist without.

**No Default-Value Substitution for Missing Required Data:** Consistent with Phase 6 §10.1's anti-fabrication principle, a component never supplies a placeholder/fallback value for a required prop that happens to be absent at runtime (e.g., rendering "No description available" if `shortDescription` is somehow missing) — because the field is required at the domain layer and enforced at the Validation Layer (Phase 5B §5.1), this scenario is structurally prevented from occurring with valid, published content; a component contract treating it as a normal, handled case would be defending against a state the architecture already guarantees cannot exist, which is unnecessary defensive code masking what should be a build-time or data-integrity failure instead.

### 2.5 Children & Composition Slots

**Restates Section 1.6's One-Directional Composition Rule, Given Its Prop-Level Mechanism:** Where a Compositional (Section) or Structural component assembles lower-tier components (Section 1.6), it does so via `children` or named slot props — never by importing and hardcoding a specific lower-tier component instance internally when the actual content varies by usage site.

**`children` — the Default, Single Composition Slot:** The majority of composition needs (a CTA Band's inner content, a Card's assembled Primitives) use the single `children` prop — consistent with standard React composition and requiring no special-case naming.

**Named Slots — Reserved for Genuinely Multi-Region Layouts Only:** A component requiring more than one independently-composable region (e.g., a hypothetical layout component with a distinct header region and footer region that are each independently variable) uses named, `Slot`-suffixed props (§2.3) — but this pattern is used sparingly, consistent with Design Philosophy's "restraint" principle (Phase 4 §2): a component reaching for multiple named slots where a single `children` composition would suffice is over-engineered relative to its actual requirement, and Sections 3+ must justify any named-slot prop against a genuine multi-region layout need, not merely convenience.

**Structural/Singleton Components Do Not Accept Content-Composition Props at All:** Header/Navigation and Footer (Section 1.6's Structural tier) render exclusively from the singleton `Navigation`/`Footer` entities (Phase 5B §3.12–3.13) already established — they accept no `children` or content-slot props whatsoever, since their entire content surface is data-driven, not composition-driven; a `children` prop on these components would create exactly the ambiguity (is this component's content sourced from data, or from what's composed into it?) this section's derivation discipline exists to prevent.

### 2.6 Event & Callback Contract Strategy

**Governing Rule:** Every interactive component (per Section 1.7's Client-tier classification) exposes its user-initiated actions as **callback props**, never as internally-managed side effects a parent component has no visibility into or control over. A FAQ Accordion's expand/collapse *may* manage its own open/closed visual state internally (Section 2.7 addresses this), but where that state change has a consequence a parent needs to know about (analytics tracking, per Phase 5B §8.5's `trackEvent()` contract), the component exposes an `onToggle` or equivalent callback — it never calls `trackEvent()` internally itself.

**Why Components Never Call `trackEvent()` Internally:** This directly extends Section 1.4's "components consume; they do not fetch, validate, or mutate" principle to analytics specifically: `trackEvent()` (Phase 5B §8.5) is a boundary-module call (Phase 5B §8.1's single-call-site discipline), and a Primitive or Composite component invoking it directly would violate that same single-call-site principle by creating a second call pattern parallel to the page/Server-Action-level invocation already established. Instead, a component's `onClick`/`onSubmit`-style callback prop is wired to `trackEvent()` at the **page or Section-tier composition point**, where the semantic `CTAIntent` (Phase 5B §3.14) context needed for a meaningful analytics event is actually known — a bare Button component, in isolation, does not know whether it represents a `FREE_AUDIT` or `CONSULTATION` intent; only its composing context does.

**Callback Signature Convention:** Every callback prop's signature passes the minimum data the receiving context needs — never the full originating DOM event where a narrower, semantically-named payload suffices (e.g., `onPageChange: (pageNumber: number) => void`, not `onPageChange: (event: MouseEvent) => void`, forcing the consuming code to extract the page number itself) — consistent with §2.2's "minimum sufficient slice" projection-narrowness rule, now applied to callback payloads rather than data props.

### 2.7 Default Props Philosophy

**Internally-Managed State Is Permitted Only for Purely Presentational, Non-Business-Meaningful State:** A component may manage its own internal state (React's `useState`, per the Client-tier components enumerated in Section 1.7) *only* where that state has no meaning outside the component's own rendering — an Accordion's open/closed visual state, a Modal's mount/unmount animation phase, a form field's raw (unvalidated) input value before submission. The moment internal state becomes something a parent, a Server Action, or an analytics event needs to observe, it must be lifted to a controlled prop + callback pair (§2.6), never left as opaque internal state a consuming context has no access to.

**No Component Ships With Implicit, Undocumented Default Behavior:** Every prop with a default value (e.g., a Card's `variant` defaulting to a "standard" visual treatment when unspecified) has that default explicitly documented in the component's own contract (Sections 3+) as part of its prop table — never left as an undocumented implementation detail a consumer must read source code to discover, consistent with this entire project's practice of exhaustive, explicit specification over implicit convention (a discipline maintained since Phase 1's PRD through Phase 6 §21's governance layer).

### 2.8 Ref Forwarding & DOM Access

**Ref Forwarding Is Permitted Only at the Primitive Tier, and Only Where a Genuine DOM-Access Need Exists:** Consistent with Section 1.6's tiering, only Primitive-tier components (Button, Input, and similar base elements) forward refs to their underlying DOM node — and only where a real consuming need exists (e.g., a Form component needing to programmatically focus the first invalid field on validation failure, directly serving the Form UX Strategy's inline-validation requirement already frozen in Phase 3 §14). Composite, Structural, and Compositional-tier components do not forward refs, since exposing raw DOM access at these higher tiers would leak an implementation detail (which underlying DOM node a Card or Hero Section happens to render as) that this document's tiering discipline (§1.6) is specifically designed to abstract away from higher-tier consumers.

### 2.9 Prop Validation Boundary

**Restates and Narrows Phase 5B §5's Four-Boundary Validation Layer to This Layer's Specific, Minimal Scope:** Phase 5B §5.2 already established four validation boundaries (CMS Response, Server Action Input, Build-Time, Webhook/Revalidation) — component props are deliberately **not** a fifth boundary requiring its own runtime (e.g., Zod) validation. Because every content-projection prop (§2.2) is sourced from data that has *already* passed Phase 5B §5.5's build-time validation sweep before ever reaching a component as a prop, re-validating that same data at the component boundary would be redundant runtime work against already-guaranteed-valid data — directly consistent with Phase 5B §5.6's own reasoning ("runtime validation on the standard SSG page-render path is effectively a no-op in production... a defense-in-depth safety net, not the primary gate").

**The One Genuine Exception — Server Action-Sourced Props:** Where a Client-tier component (a Form, per Section 1.7) receives props reflecting the *result* of a Server Action call (e.g., an `ActionResult`'s `VALIDATION_ERROR` field-error map, Phase 5B §7.5), that data has already been validated at the Server Action's own input boundary (Phase 5B §5.2's second boundary) before the component ever receives it as props — meaning even this case does not require a *new*, component-level validation step; it requires the component's prop *type* to correctly model the already-validated `ActionResult` union (Phase 5B §7.5) so the compiler enforces exhaustive handling of its branches (Phase 5B §9.1's discriminated-union pattern, restated here at the component-props layer).

**TypeScript's Compiler Is the Validation Mechanism, Not a Runtime Library:** Consistent with Section 1.5's Governing Principle 3 (Build-Time Enforceability Wherever Possible), a component's props are validated entirely by TypeScript's strict-mode compiler (Phase 5B §4.1) at build time — a missing required prop, an incorrectly-typed callback signature, or an out-of-union variant value is a compilation failure, never a runtime `PropTypes`-style warning or a Zod parse call executed on every render.

### 2.10 Cross-Component Prop Consistency Rules

**Shared Prop Names Must Mean the Same Thing Everywhere They Appear:** Where multiple components accept a prop of the same name (e.g., `variant` appearing on Button, Badge, and Card), that name's *type* may differ per component (each has its own valid variant set, per Phase 4's per-component specification), but its *semantic role* — "which visual treatment from this component's own Design-System-defined set should render" — must be identical across every component using that name. A `variant` prop that meant "visual treatment" on one component and "content category" on another would violate this rule and must be renamed on whichever component is the outlier.

**Shared Content-Projection Fields Must Use Identical Prop Names Across Every Component Consuming Them:** Where both a Card and a Breadcrumb segment (Phase 6 §8.4) display the same entity's `name` field, both components' props use the literal name `name` — never `title` on one and `label` on the other — directly extending §2.3's "never renamed" rule from the single-component case to the cross-component consistency case, and directly serving Phase 6 §9.5's Entity Identity guarantee (identical name/label everywhere an entity appears) at the component-props layer specifically.

### 2.11 Section Resolution Summary

Section 2 has established the deterministic rules governing every prop table that Sections 3+ will specify:

- Props are **derived projections** from Phase 5B domain models (via `Pick`/`Omit`) or Design System token unions — never independently invented (§2.2).
- Naming conventions extend Phase 5B §4.9 to the component layer, with content-projection props **never renamed** from their domain-field source (§2.3).
- Required/optional status is **inherited** from the domain model by default; narrowing is permitted with justification, widening is never permitted, and no default-value fabrication occurs for missing required data (§2.4).
- Composition uses `children` by default, with named slots reserved for genuine multi-region layouts only; Structural/singleton components accept no content-composition props at all (§2.5).
- User-initiated actions are exposed as callback props with minimal, semantically-named payloads; components never call `trackEvent()` or other boundary-module functions internally (§2.6).
- Internal state is permitted only for purely presentational concerns; anything business-meaningful is lifted to controlled props (§2.7).
- Ref forwarding is restricted to the Primitive tier, where a genuine DOM-access need exists (§2.8).
- Component props are **not** a fifth validation boundary — validation occurs entirely via the TypeScript compiler against already-Phase-5B-validated data, with Server Action-sourced props as the one already-validated-upstream exception (§2.9).
- Shared prop names carry identical semantic meaning, and shared content fields use identical prop names, across every component in the system (§2.10).

Every per-component and per-tier contract specified in the sections that follow is constructed in strict conformance with these rules.

**End of Section 2 — Component API & Props Contract Architecture.**

Ready to continue with Section 3.

