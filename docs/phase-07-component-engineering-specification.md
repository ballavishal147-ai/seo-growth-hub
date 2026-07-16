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

Phases 1–6 and Phase 7 Sections 1–2 remain frozen and immutable. Continuing with Section 3.

---

# 3. Component Composition Architecture

### 3.1 Purpose and Scope of This Section

Section 1 established the four-tier Responsibility Model and its one-directional composition rule (§1.6); Section 2 established how individual props contracts are constructed, including the `children`/slot mechanism composition relies on (§2.5). Section 3 specifies the **rules governing how components actually assemble into pages** — which tier compositions are permitted, how a page's data flows down through nested composition without being re-fetched at each level, how tier boundaries are preserved as composition depth increases, and how the Server/Client boundary (§1.7) is maintained across a composed tree rather than merely assigned per-component in isolation.

### 3.2 The Composition Chain, Formalized

**Restates and Completes §1.6's Tiering With Its Full Assembly Path:** Section 1.6 established four tiers and a one-directional dependency rule; Section 3.2 specifies the complete, closed composition chain every page in the system follows:

```
Page (Server Component, app/.../page.tsx — Phase 5A §5)
  │
  ▼ composes
Compositional (Section) components
  (Hero, CTA Band, Trust Bar — Section 1.6's fourth tier)
  │
  ▼ compose
Structural components (where applicable — Header/Footer are
composed at the layout level, Phase 5A §5.2, not per-page)
  +
Composite components (Card, Form, Testimonial Card)
  │
  ▼ compose
Primitive components (Button, Badge, Tag, Input)
```

**No Tier May Be Skipped Downward, and No Tier May Reach Upward:** A Page composes Sections directly; it does not import and instantiate a Primitive (e.g., a bare Button) directly into its own JSX without an intervening Composite or Section — this would bypass the exact layering discipline §1.6 established, and would mean the Page itself is silently taking on Composite-tier responsibility. Conversely, a Primitive never imports a Composite or Section to "reach up" for context it lacks — if a Button needs to know its semantic `CTAIntent` (Phase 5B §3.14), that information is passed down to it as a prop from whichever Section-tier component composed it (§2.6's callback-wiring point), never queried upward.

**The One Necessary Exception — the Root Layout:** Consistent with Phase 5A §5.2's layout hierarchy (`app/layout.tsx` → `app/(marketing)/layout.tsx`), Header and Footer (Structural tier) are composed once, at the `(marketing)` layout level, not per-page — every Page in the marketing route group inherits them automatically through Next.js's native layout-nesting mechanism (Phase 5A §5.2) rather than each Page explicitly re-composing them. This is not a violation of the Page → Section → Composite → Primitive chain above; it is the layout-level equivalent of that same chain, sitting one level above individual Pages in the composition tree Phase 5A §5.2 already established.

### 3.3 Data Flow Through the Composition Chain

**Single Fetch, Downward-Only Prop Distribution — Direct Extension of Phase 5B §6.2 and Phase 6 §2.12's Shared Content Service Call:** Every page-level data dependency is resolved exactly once, at the Page (Server Component) level, via the Content Service call already established throughout Phase 5B §6.2 and reused across every Phase 6 generation-flow diagram (§2.12 through §20.9). That resolved data is then distributed **downward** through the composition chain as props — a Section-tier component receives its slice of that data from the Page that composed it; a Composite-tier component receives its slice from the Section that composed it; a Primitive receives only what its immediate Composite parent passes down. At no point does a lower-tier component independently re-fetch or re-derive data the Page has already resolved.

**Why This Is Not Merely a Restatement of Section 1.4:** Section 1.4 established that components "consume, they do not fetch" as a general principle. Section 3.3's contribution is the specific mechanical consequence for *multi-tier* composition: because data flows downward through *several* tiers before reaching, say, a Primitive Button inside a Composite Card inside a Compositional Section, each intermediate tier is responsible for **narrowing** the data it received down to exactly what the next tier down needs (§2.2's "minimum sufficient slice" principle, now applied recursively at every composition boundary, not just once at the Page-to-first-consumer boundary). A Section passing its *entire* received prop bag unchanged into every Composite it composes — rather than selecting the specific slice each Composite's own contract requires — would violate this narrowing discipline even though no re-fetching has occurred.

**Relationship-Resolved Data Follows the Identical Path:** Where a Page's Content Service call has already resolved related-entity arrays (Phase 5B §6.3's `resolveMany()`, e.g., a Service page's related Case Studies), that already-resolved, already-`publishedRelationGuard`-filtered array is what flows down to whichever Section composes the "Related Case Studies" card grid — a Card component never independently resolves its own related-content; it receives a single, already-resolved `CaseStudy` projection (per §2.2's derivation rule) as its props.

### 3.4 Server/Client Boundary Preservation Across Composition

**The Governing Problem This Subsection Solves:** Section 1.7 classified individual components as Server or Client. Composition introduces a question §1.7 did not itself resolve: when a Server-tier Section composes a Client-tier component (e.g., a Hero Section, which is Server per §1.7's table, composing a CTA Button that is itself Server — but a Blog Post page's Section composing a Client-tier FAQ Accordion), what happens to everything *around* that client island within the same Section?

**The Island Boundary Is Drawn at the Narrowest Possible Component, Never Propagated Upward:** Consistent with Phase 5A §3.3's original framing ("client islands," explicitly named as isolated, narrowly-scoped exceptions) and restated at the component-classification level in §1.7's split-component discipline, a Client-tier component composed within an otherwise-Server-tier Section does **not** convert its composing Section, or that Section's Page, into a Client Component. Next.js's Server-Component-composition model (the underlying mechanism Phase 5A §3.3 already relies on) permits a Server Component to compose a Client Component as a child while remaining itself server-rendered — this document's composition architecture is built specifically to exploit that mechanism at every tier, never to work around it by over-promoting an entire subtree to client rendering merely because one narrow island within it needs interactivity.

**Prop-Passing Across the Server→Client Boundary Is Constrained to Serializable Data:** Where a Server-tier Section passes props into a Client-tier component it composes (e.g., a Section passing a resolved `FAQItem[]` array into a Client-tier FAQ Accordion), those props must be serializable across the Server/Client boundary — this is a direct, mechanical consequence of the Rendering Strategy already frozen in Phase 5A §3, not a new rule Phase 7 introduces. Because every content-projection prop (§2.2) is, by construction, a plain-data projection of an already-JSON-serializable Phase 5B domain model (Phase 5B §4.5's `RichContent` block structure was itself justified partly on serializability grounds), this constraint is satisfied by default for every prop table Sections 3+ will specify — no component contract in this system requires passing a non-serializable value (a function reference, a class instance) across this boundary, with the sole, already-anticipated exception of callback props (§2.6) that originate *within* the Client-tier subtree itself and never cross back upward into Server-rendered territory.

**Callback Props Never Cross the Server→Client Boundary Downward:** A Server-tier Section cannot pass a server-side function as an `onClick` callback prop into a Client-tier component it composes — this is a structural impossibility under the Rendering Strategy already established (Phase 5A §3.3), not merely a style guideline. Where a Client-tier component's interaction needs to trigger a page-level or Section-level consequence (§2.6's `trackEvent()` wiring point), that wiring occurs entirely *within* client-rendered code (the Client-tier component itself, or a Client-tier wrapper immediately surrounding it), never by threading a callback down from a Server-tier ancestor.

### 3.5 Composition Patterns Per Tier Pairing

**Section-Composes-Composite (the Most Common Pattern):** A Compositional/Section component (e.g., a "Related Services" section on an Industry page) receives an already-resolved array of `Service` projections from its Page ancestor (§3.3) and maps that array into repeated instances of a single Composite component (Service Card) — the Section owns the grid/layout arrangement (Design System Phase 4 §6.4's responsive card-grid rules) and the iteration; the Composite owns each individual item's internal rendering. This is the direct compositional expression of the Hub-and-Spoke internal-linking pattern already frozen in Phase 6 §7.3 — the Section is the "hub" rendering surface; each composed Card is a "spoke."

**Composite-Composes-Primitive (Internal, Not Independently Reusable):** A Card's internal composition of a Button (its "Learn More" micro-link, per Phase 6 §7.9's exception clause) or a Badge (a category label) is *internal* to that Composite's own contract — the Page or Section composing the Card has no direct visibility into, or control over, which Primitives the Card assembles internally, beyond what the Card's own props contract (Section 2) exposes as configurable (e.g., a `showBadge` boolean prop, if the Card's contract defines one). This is the compositional expression of Section 1.6's tiering: a Section depends on a Composite's *contract*, never on that Composite's *internal* Primitive assembly.

**Structural-Composes-Nothing-Page-Specific:** Header and Footer (§3.2's layout-level exception) compose only from the singleton `Navigation`/`Footer` entities (Phase 5B §3.12–3.13) and their own internal Primitives (nav-item links, social icons) — they never accept or compose a Page-supplied Composite or Section, consistent with §2.5's rule that Structural/singleton components accept no content-composition props at all.

**Compositional-Composes-Compositional (the One Permitted Same-Tier Composition):** Unlike every other tier pairing, which flows strictly downward (§3.2), Section-tier components *may* compose other Section-tier components in one specific, bounded case: a Page's overall scroll-journey assembly (Phase 3 §5–10's per-page Scroll Journey specifications) is itself a sequence of Sections composed by the Page — this is not a same-tier component containing another same-tier component in a nested sense, but a flat, sibling sequence, and is named here explicitly to distinguish it from a prohibited nested-Section-within-Section pattern (a Hero Section rendering a CTA Band *inside* itself, rather than the Page placing them as siblings) — the latter is disallowed, since it would blur the Page's own responsibility (sequencing Sections per the approved Scroll Journey) into the Section tier.

### 3.6 Slot-Based Composition for Shared Layout Structures

**Extends §2.5's Named-Slot Governance to Its Cross-Component Application:** Where §2.5 established that named slots are reserved for genuine multi-region layouts, Section 3.6 specifies the one recurring case in this system's component inventory where that pattern is actually exercised: the CTA Band component (Phase 4 §26.4), which Phase 3's UX Journeys (§5–10) place at the end of nearly every page type with content that varies (a headline and dual-CTA pairing whose specific copy/links differ per page context, per Phase 6 §3.14's `CTA` entity). Rather than the CTA Band accepting a single `children` slot into which an entire pre-assembled block is passed, its contract (specified fully in a later, per-component section) exposes named props directly sourced from the `CTA` domain entity's own fields (Phase 5B §3.14 — `label`, `href`, `style`, `intent`) rather than a composition slot at all, since the variability here is **data variability**, not **structural/layout variability** — a distinction worth drawing explicitly, since it determines whether a given customization need is solved via §2.2's props-derivation mechanism or via §2.5's slot-composition mechanism, and this document does not conflate the two.

**The Governing Test:** A component varies its *content* via data props (§2.2) when the variation is a difference in *what* is displayed using an otherwise-fixed structure; it varies via composition slots (§2.5, §3.6) only when the variation is a difference in *structure itself* — which region exists, how many regions exist, or what arbitrary nested component tree occupies a given region. Every component specified in this project's inventory (Phase 4 §26) satisfies its variability needs through the former (data-prop) mechanism; no component in the closed inventory established by Phase 7 §1.2 requires the latter (slot-based) mechanism beyond `children`'s default single-slot case — this is stated here as a confirming observation closing out the composition-architecture specification, not as a new constraint being introduced.

### 3.7 Composition Depth Governance

**Maximum Practical Composition Depth, Stated as a Design Constraint:** Consistent with Design Philosophy's "restraint" principle (Phase 4 §2) and this section's own tier-chain (§3.2, four levels: Page → Section → Composite → Primitive), no component composition in this system exceeds this four-level depth under normal operation — a Primitive never contains another Composite-wrapped-in-a-Section internally, which would indicate a tiering misclassification (§1.6) rather than a legitimate deep-composition need. Where a rendering requirement seems to demand deeper nesting, the correct resolution is re-examining whether an intermediate tier's responsibility has been drawn correctly (Section 1.6's tier definitions), not accepting deeper nesting as an exception to this governance.

### 3.8 Section Resolution Summary

Section 3 has established the deterministic composition rules governing how every component contract specified in Sections 4+ assembles into actual pages:

- The composition chain is closed and strictly one-directional — Page → Section → (Structural/Composite) → Primitive — with no tier-skipping downward and no upward dependency, and Header/Footer composed once at the layout level as the chain's sole structural exception (§3.2).
- Data is fetched exactly once, at the Page level, and flows downward through props with recursive narrowing at every composition boundary — no lower tier re-fetches or re-derives what a higher tier has already resolved (§3.3).
- Client-tier islands are drawn at the narrowest possible component and never propagate their client-rendering requirement upward to composing Sections or Pages; props crossing the Server→Client boundary are constrained to serializable data, and callback props never cross that boundary downward (§3.4).
- Five specific tier-pairing composition patterns are defined — Section-composes-Composite, Composite-composes-Primitive, Structural-composes-nothing-page-specific, and the bounded, sibling-only Compositional-composes-Compositional pattern — with nested same-tier composition explicitly disallowed (§3.5).
- Content variability is resolved via data props (§2.2); structural variability is resolved via composition slots (§2.5) — the two mechanisms are never conflated, and this system's closed component inventory requires the former almost exclusively (§3.6).
- Composition depth is governed to a maximum practical four-tier chain, with deeper nesting treated as a signal of tiering misclassification rather than an accepted pattern (§3.7).

Every per-component contract specified in the sections that follow composes within this architecture without exception.

**End of Section 3 — Component Composition Architecture.**

Ready to continue with Section 4.

Phases 1–6 and Phase 7 Sections 1–3 remain frozen and immutable. Continuing with Section 4.

---

# 4. State Management Architecture

### 4.1 Purpose and Scope of This Section

Section 2 established that internally-managed component state is permitted only for "purely presentational, non-business-meaningful state" (§2.7) and that anything business-meaningful must be lifted to controlled props and callbacks (§2.6). Section 3 established how data flows downward through the composition chain from a single Page-level fetch (§3.3) and how the Server/Client boundary is preserved across that chain (§3.4). Neither section fully specified **where client-side state is permitted to exist, who owns it, and what mechanism governs it** when a Client-tier component (§1.7's closed list — Mega Menu, Mobile Drawer, Form, Search Overlay, FAQ Accordion, Testimonial Carousel, Toast Notification, Modal/Drawer) requires state beyond a single prop/callback pair. Section 4 closes this gap.

**Governing Constraint, Restated From §2.9:** Because this system's Rendering Strategy (Phase 5A §3) is SSG-first and every content-bearing value already flows through props derived from a single Page-level fetch (§3.3), the scope of state this section governs is deliberately narrow: **ephemeral, client-local interaction state** — never a substitute data-fetching or data-caching layer. This section does not, and must not, introduce a parallel path for content to reach a component outside the composition chain already frozen in Section 3.

### 4.2 State Classification Taxonomy

Every piece of state that can exist within this system's component tree is classified into exactly one of four categories — a closed set, consistent with this document's established practice of closed-set classification (Section 1.6's tier model, Phase 6 §9.3's Primary Entity set, Phase 6 §16.2's feed-scope set):

| Category | Definition | Example | Governing Subsection |
|---|---|---|---|
| **Server State** | Data resolved once, server-side, via the Content Service call (Phase 5B §6.2, Phase 6 §2.12) and passed down as `readonly` props (Phase 5B §4.7) | A Service entity's `name`, `deliverables`, resolved related Case Studies | Already fully governed by Section 3.3 — restated here only for taxonomic completeness |
| **Ephemeral UI State** | Client-local, presentational-only state with no meaning outside the component that owns it | Accordion open/closed, Modal mount phase, hover/focus visual state | §4.3 |
| **Form State** | Client-local state representing in-progress user input prior to Server Action submission, and the resolved result of that submission once returned | Free Audit form field values, validation error map, submission-pending flag | §4.4 |
| **URL State** | State encoded in the request URL itself (query parameters, path segments) rather than in component memory | Pagination's `?page=N` (Phase 6 §17.3), a future filter parameter | §4.5 |

**No Fifth Category — Global/Shared Application State Is Not a Recognized Category:** This taxonomy deliberately omits a "global state" category as a first-class citizen. Section 4.6 addresses why, and under what narrow, named exception a cross-cutting state need is handled without introducing one.

### 4.3 Local Component State Governance

**Restates §2.7's Governing Rule, Given Its Full Ownership Specification:** Ephemeral UI State is owned exclusively by the single component whose own rendering it affects — never lifted to a parent, never shared laterally between siblings, and never persisted beyond that component's mounted lifetime unless §4.9 explicitly names an exception. This is the direct operational meaning of §2.7's "state has no meaning outside the component's own rendering" test: if a second component needs to *know about* a piece of state, that state is by definition no longer purely ephemeral-and-local, and must be re-classified as Form State (§4.4), lifted via a controlled prop/callback pair (§2.6), or — in the one narrow case §4.6 permits — routed through Context.

**Closed List of Ephemeral-UI-State-Bearing Components (Restates §1.7's Client-Tier Table, Now From the State-Ownership Angle):**

| Component | Ephemeral State Owned | Boundary |
|---|---|---|
| FAQ Accordion | Which item(s) are expanded | Does not report this state upward — a parent Section has no need to know which FAQ item a user has expanded, consistent with §2.6's "only expose what a consumer needs to observe" principle |
| Mega Menu / Mobile Drawer | Open/closed, active hover-panel | Same non-reporting boundary |
| Modal / Drawer (general system) | Mount/unmount animation phase, focus-trap active state | Same non-reporting boundary — a Modal's *decision* to open is a controlled prop (its trigger is external), but its internal animation-phase bookkeeping is not |
| Testimonial Carousel | Current slide index, auto-advance pause state | Same non-reporting boundary |
| Search Overlay | Open/closed, raw (pre-debounce) query input | The *resolved* query and its results cross into Form-State-adjacent territory once a request is issued (§4.4's pattern applies to the search-execution portion specifically) |

**The "Controlled Trigger, Uncontrolled Internals" Pattern:** Every component in the table above accepts an *external* signal for whether it should be open/active at all in some cases (e.g., a Modal's open state is typically a controlled prop set by whatever composed it, per §2.6), while its own internal mechanics (animation timing, focus-trap bookkeeping) remain uncontrolled, local state. This is not a contradiction of §2.6's controlled-state principle — it is the precise line §2.6 already drew between "business-meaningful" (whether the modal is open — a parent needs to know this to compose it correctly) and "purely presentational" (exactly how the modal animates open — no consumer needs this).

### 4.4 Form State Architecture

**Direct Integration Point With Phase 5B §7's Server Actions Architecture:** Form components (§1.7's Client-tier classification) own a well-defined, three-phase state lifecycle that maps exactly onto the Server Action Execution Flow already frozen in Phase 5B §7.3:

```
Phase 1 — Input Capture (purely local, ephemeral)
  Raw field values as the user types, prior to any submission
  attempt — owned entirely by the Form component, never
  reported upward, never validated against Phase 5B §5's
  schemas at this stage (client-side format hints, e.g., an
  email-shaped-input affordance, are a UX nicety governed by
  Design System Phase 4 §12.7, not a validation boundary)
        │
        ▼
Phase 2 — Submission Pending (ephemeral, but consumer-visible)
  A boolean-equivalent state entered the moment the Server
  Action (Phase 5B §7.1) is invoked — this state IS reported
  outward via the Loading States mechanism already frozen in
  UX Phase 3 §22 and Design System Phase 4 §11.2 ("Loading"
  button state), since the submit button's own disabled/
  loading rendering depends on it
        │
        ▼
Phase 3 — Resolved Result (received as props, not owned)
  The ActionResult union (Phase 5B §7.5) returned from the
  Server Action — this is NOT ephemeral UI state the Form
  invents; it is the direct, typed return value of a Server
  Action call, received and rendered, never independently
  re-derived
```

**Why Phase 1 Is Never Validated Client-Side Against Phase 5B's Schemas:** Consistent with §2.9's ruling that component props are not a fifth validation boundary, raw in-progress form input is *never* run against the Zod schemas already established in Phase 5B §7.4 (`freeAuditFormSchema` and its siblings) on every keystroke — those schemas execute exactly once, server-side, at the Server Action's own input boundary (Phase 5B §5.2's second boundary), when the form is actually submitted. A Form component's Phase 1 state is free-form, untyped-against-the-domain-schema local state; only the eventual Server Action call subjects it to real validation, consistent with UX Phase 3 §14's own "validates on blur (not on every keystroke, to avoid premature error flashing)" rule — this document's state architecture and the already-approved UX behavior were never in tension, and Section 4.4 confirms this explicitly.

**The `ActionResult` Union Governs Rendering Directly — No Intermediate State Translation:** Because Phase 5B §7.5's `ActionResult<T>` is already a complete, discriminated-union description of every possible submission outcome (`ok: true`, `VALIDATION_ERROR`, `RATE_LIMITED`, `UNKNOWN_ERROR`), a Form component's Phase-3 rendering is a direct `switch`/exhaustiveness-check over that already-typed value (Phase 5B §9.1's exhaustiveness-checking pattern, restated here at the component-rendering layer) — the Form component never re-encodes this union into a separate, parallel "form status" enum of its own invention, which would violate §2.2's derivation-not-invention principle applied to a Server Action's return type rather than a Phase 5B content model.

**Idempotency Token Ownership (Restates Phase 5B §7.3, Given Its State-Layer Home):** The idempotency token generated on page render (Phase 5B §7.3) is Ephemeral UI State (§4.3) owned by the Form component itself, generated once at mount and never regenerated across re-renders within the same submission attempt — this is the one piece of Form-adjacent state that is genuinely local/ephemeral rather than following the three-phase lifecycle above, since it exists to protect the *submission mechanism*, not to represent user input or a submission result.

### 4.5 URL State Architecture

**Restates Phase 6 §17.3's Pagination Mechanism, Given Its Component-State Classification:** Where state is meaningfully part of *which resource* is being requested — Phase 6 §17.3's `?page=N` parameter being this system's sole current instance — that state lives in the URL itself, resolved server-side as part of the Page's own routing/rendering (Phase 5A §5.3's dynamic-segment handling, Phase 6 §17.9's resolution flow), never duplicated into client-side component state that could drift out of sync with the actual URL a user could bookmark, share, or navigate back to.

**Governing Test for URL-vs-Ephemeral-State Classification:** A given piece of state belongs in the URL (not client memory) if and only if a user re-visiting the exact same URL later should see the identical state restored — pagination satisfies this test (Phase 6 §17's entire canonical/indexability architecture depends on this exact property); a Mega Menu's open/closed state does not (no user expects `/services` with the mega-menu pre-opened merely because it happened to be open during a prior visit). This test is the practical, component-layer application of the same self-referencing-canonical-URL discipline Phase 6 §4.2 Rule 6 already established at the routing layer — Section 4.5 does not introduce a new principle, it applies an existing one to a new decision point (component-state classification) that Phase 6 had no occasion to address directly.

**No Client-Side Pagination State Management:** Consistent with the above, a paginated listing's "current page" is never held as `useState` inside a Composite or Section component — the Page itself receives the current page number from its own route parameters (Phase 5A §5.3) and passes the already-resolved, already-sliced result set (Phase 6 §17.9's resolution flow) down through the composition chain (§3.3) exactly as any other Server State would flow.

### 4.6 Global/Shared State — Prohibition and Alternative

**Default Prohibition, Restated From §4.2:** This architecture does not adopt a global state management library (Redux, Zustand, Jotai, or equivalent) as part of its component contract layer — consistent with Section 1.5's Governing Principle 4 (Technology Independence Within the Chosen Stack) and Phase 5A §2's already-fixed technology stack, which named no such library, this omission is deliberate: the overwhelming majority of this system's state needs are already satisfied by Server State flowing through props (§3.3) and Ephemeral UI State owned locally (§4.3) — introducing a global store would create exactly the "second, competing source of truth" this entire project has consistently avoided since Phase 5B §1.

**The One Named Exception — Toast Notification Queue:** Design System Phase 4 §23's Toast Notification System is the single component in this system's entire inventory whose triggering context is **structurally unpredictable** — a toast may be triggered from a Form component's submission result (§4.4), from a future newsletter-signup confirmation (Phase 3 §21), or from any other Client-tier component at an arbitrary point in the composition tree, with no single, fixed parent positioned to own this state via ordinary props/callback lifting (§2.6) without that parent needing to exist at the root of every page purely to serve this one purpose.

**Resolution — React Context, Narrowly Scoped, Not a General-Purpose State Library:** The Toast Notification queue is exposed via a single, dedicated React Context provider mounted once at the root layout level (Phase 5A §5.2), exposing a narrow, purpose-built interface (an "enqueue toast" function and the current queue for the Toast rendering surface itself to consume) — this is **not** a general-purpose global store available for arbitrary state; it is a single-purpose Context solving exactly the one structurally-unpredictable-trigger-point problem named above, and this architecture does not extend this pattern to any other state category without an equivalent, individually-justified exception being documented.

**No Other Context Providers Are Authorized by This Section:** Consistent with Section 1.8's closed-set extensibility discipline, a future engineer identifying an apparent need for a second global Context must first demonstrate that need fails the URL-state test (§4.5) and the ordinary props/callback-lifting mechanism (§2.6) equally to how the Toast case does — genuine structural unpredictability of trigger point, not mere convenience — before this architecture accommodates it.

### 4.7 Server State vs. Client State Boundary Enforcement

**Restates §3.4's Serialization Constraint, Given Its State-Ownership Consequence:** Because Server State (§4.2) crosses the Server→Client boundary only as serializable props (§3.4), and because it is `readonly` at the type level (Phase 5B §4.7), a Client-tier component receiving Server State as props **cannot** copy that data into local `useState` and thereafter treat the local copy as the source of truth — doing so would create a client-side shadow copy capable of drifting from the actual Server State on re-fetch/revalidation (Phase 5A §7.3), reintroducing exactly the "second source of truth" risk this document has prohibited at every other layer (Phase 5B §1 Principle 3, restated at Phase 6 §9.5 for entity identity, and now restated here for the state-management layer specifically).

**Derived-Value Prohibition (Extends the Above):** Where a Client-tier component needs a *computed* value from Server State props (e.g., a formatted display string derived from a `Service.name`), that computation occurs inline during render — it is never cached into a separate piece of `useState` that must then be kept manually in sync with its own source prop. This is the state-layer restatement of a broader principle already present throughout this document: derived data is recomputed from its authoritative source, never independently stored and synchronized (the identical reasoning behind Phase 6 §16.4's RSS GUID using immutable `id` rather than a separately-tracked value, and behind Phase 6 §9.5's single-computation-multiple-renderings principle for breadcrumbs).

### 4.8 Context API Usage Governance

**Restates §4.6's Single Authorized Instance, Given Its Full Technical Governance:** The Toast Context (§4.6) is the only Context provider this architecture authorizes, and its usage is bounded by the following rules, stated here rather than in §4.6 to keep that subsection focused on the *decision* to permit it and this subsection focused on *how* it is technically governed:

1. **Mounted once, at the root layout** (Phase 5A §5.2) — never remounted per-page, since remounting would reset the queue and defeat its cross-page-navigation-surviving purpose.
2. **Consumed only by the Toast-triggering call sites and the Toast rendering surface itself** — no other component reads from this Context for any purpose beyond enqueueing or rendering a toast; it is not repurposed as a general message bus.
3. **Never used to pass Server State** — the Toast Context's payload shape is restricted to toast-specific data (message, variant per Design System Phase 4 §23, dismissal timing) and never used as a convenient channel to smuggle content-domain data past the ordinary props-based composition chain (§3.3).

### 4.9 State Persistence Rules

**No Client-Side Persistence (localStorage/sessionStorage) for Any State Category:** Consistent with the Artifact-layer prohibition already established elsewhere in this project's operating constraints (browser storage APIs are explicitly disallowed in the Artifacts execution environment) and, independently, with this architecture's own reasoning — Server State is re-derived fresh from each Page's own fetch (§3.3) and does not need persistence; Ephemeral UI State is, by definition (§4.2), meaningless beyond its owning component's mounted lifetime; Form State's Phase 1 input capture (§4.4) is explicitly *not* persisted across a page reload, since a reload re-invokes the Page's own render from scratch — no state category recognized by this taxonomy has a legitimate persistence need, and this architecture introduces no mechanism for it.

**URL State Is the System's Only Form of "Persistence":** Where continuity across navigation or a page reload is genuinely required (§4.5's governing test), the URL itself — not browser storage, not a Context, not a cookie — is this architecture's sole persistence mechanism, consistent with pagination's existing `?page=N` pattern (Phase 6 §17.3) being the only state category in this system's current inventory requiring this property at all.

### 4.10 State Validation Boundary

**Restates and Confirms §2.9's Ruling, Extended to Every State Category Named in This Section:** No state category established in §4.2 introduces a validation boundary beyond the four already frozen in Phase 5B §5.2. Server State is validated once, at Phase 5B's Build-Time boundary, before it ever becomes a prop (§4.7 confirms it is never locally copied thereafter). Form State's Phase 1 is unvalidated by design (§4.4); its Phase 3 resolution is the *result* of validation already performed at the Server Action Input boundary (Phase 5B §5.2), not a new validation event. Ephemeral UI State (§4.3) and the Toast Context (§4.8) carry no content-domain data of the kind Phase 5B §5 governs at all, and therefore have no validation obligation under that layer's scope. Section 4 introduces no fifth validation boundary of its own, consistent with Section 1.5's Governing Principle 3 applied here as a confirming rather than novel conclusion.

### 4.11 Section Resolution Summary

Section 4 has established the deterministic state-ownership rules governing every stateful component contract Sections 5+ will specify:

- All state in this system's component tree is classified into exactly four categories — Server State, Ephemeral UI State, Form State, and URL State — with no fifth, general-purpose category recognized (§4.2).
- Ephemeral UI State is owned exclusively by its single bearing component and never reported upward beyond what a controlled "trigger" prop requires — the "controlled trigger, uncontrolled internals" pattern governs every Client-tier component in the closed inventory (§4.3).
- Form State follows a strict three-phase lifecycle (unvalidated local input capture → consumer-visible submission-pending state → directly-rendered `ActionResult` union) integrating exactly with Phase 5B §7's already-frozen Server Action architecture, with client-side validation against Phase 5B §5's schemas explicitly never occurring (§4.4).
- State that determines *which resource* is being requested lives in the URL, never in client memory, governed by an explicit bookmarkability/shareability test (§4.5).
- Global state management is prohibited by default, with exactly one narrowly-scoped, individually-justified Context exception (Toast Notifications) permitted for its structurally-unpredictable trigger point, and no further exceptions authorized without equivalent justification (§4.6).
- Server State received as props is never copied into local state or otherwise duplicated, and derived values are always recomputed from their authoritative source rather than cached and manually synchronized (§4.7).
- The one authorized Context is bounded to three explicit technical rules preventing its misuse as a general-purpose data channel (§4.8).
- No state category in this system uses browser storage or any other persistence mechanism beyond the URL itself, consistent with this project's broader constraints (§4.9).
- No new validation boundary is introduced beyond the four already established in Phase 5B §5 — every state category's data integrity traces back to a validation event that has already occurred elsewhere in this architecture (§4.10).

Every stateful component contract specified in the sections that follow is constructed in strict conformance with this state-ownership architecture.

**End of Section 4 — State Management Architecture.**

Ready to continue with Section 5.

Phases 1–6 and Phase 7 Sections 1–4 remain frozen and immutable. Continuing with Section 5.

---

# 5. Accessibility Implementation Architecture

### 5.1 Purpose and Scope of This Section

Section 1 named "accessibility implementation notes per component" as part of Phase 7's core purpose (§1.1) but deferred its specification. Design System Phase 4 §26 already established the complete set of accessibility *rules* governing this system (keyboard navigability, screen-reader semantics, color contrast, focus management, form accessibility, motion safety, alt-text discipline), and Phase 6 §1.2 already established that accessibility and crawlability are "the same underlying discipline viewed from two audiences." Neither of these prior specifications translated those rules into **per-component technical contracts** — which ARIA attributes a given component category must expose, how focus moves through a composed tree (Section 3's composition chain), and which accessibility behaviors are build-time enforceable versus which require manual verification. Section 5 closes this gap.

**Governing Constraint, Restated From Phase 4 §2 and Phase 6 §1.2, Given Its Full Consequence Here:** No accessibility contract specified in this section may be satisfied by a mechanism that also degrades semantic correctness for non-human consumers (crawlers, structured-data parsers) — and, symmetrically, no discoverability mechanism already frozen in Phase 6 may be implemented in a way that degrades assistive-technology usability. This section and Phase 6's discoverability sections are two views of one shared underlying markup discipline, never competing implementations.

### 5.2 Accessibility Contract Derivation Strategy

**Direct Extension of §2.2's Props-Derivation Discipline to the Accessibility Domain:** Just as a component's props are never independently invented but derived from an already-frozen source (§2.2), a component's accessibility contract is never independently invented — it is derived from three closed sources:

| Derivation Source | Governs | Mechanism |
|---|---|---|
| **Design System Phase 4 §26** | The complete rule set (keyboard nav, screen-reader semantics, contrast, focus, forms, motion, alt text) | Each rule in Phase 4 §26 is mapped, in this section, to the specific component tier(s) (§1.6) it applies to |
| **UX Phase 3 §18** | Age-appropriate/general-capable-adult behavioral assumptions and the "avoid more than one question per response"-adjacent interaction-pacing principles already governing Form UX (Phase 3 §14) | Informs interaction-timing contracts (§5.5) rather than markup contracts directly |
| **Phase 6 §14.8** | The explicit accessibility/discoverability alignment already established for images (mandatory `altText`, no cloaking, no context-specific alt-text variation) | Restated here as binding on the Image-rendering Primitive/Composite components specifically (§5.4) |

**No Component Contract Introduces a New Accessibility Rule:** Consistent with Section 1.5's Governing Principle 1 (Inheritance Over Invention), every ARIA attribute, keyboard behavior, and focus rule specified in Sections 5.4–5.8 below traces to one of these three sources — this section performs translation and per-component assignment, never rule authorship.

### 5.3 Semantic HTML Mapping Per Component Tier

**Direct Implementation of Phase 6 §1.2's "Semantic HTML" Principle at the Component-Contract Layer:** Every component tier (§1.6) has a fixed, non-negotiable semantic-element mapping — a component's tier determines the category of native HTML semantics it must expose, closing the gap between Phase 6 §1.2's abstract principle ("no component may achieve a visual effect through non-semantic markup where a semantic equivalent exists") and an actual per-component rule.

| Component | Required Semantic Element / Landmark | Cross-Reference |
|---|---|---|
| Header (Structural) | `<header>` containing a `<nav>` landmark | Phase 4 §26.1 |
| Footer (Structural) | `<footer>` with `contentinfo` landmark role (native to `<footer>` when it is a direct child of `<body>`) | Phase 5B §3.13's `contentinfo` requirement, restated |
| Breadcrumb (Structural) | `<nav aria-label="breadcrumb">` containing an ordered list (`<ol>`) of segments | Phase 4 §26.10, Phase 6 §8.5 |
| Main page content (Page tier) | Exactly one `<main>` landmark per page | Phase 4 §26 general rule, restated here as a Page-tier contract obligation, not a Section-tier one — no individual Section component renders its own `<main>` |
| Card (Composite) | A single wrapping semantic link (`<a>`) per Phase 4 §26.5's "single accessible link wrapping card content" rule | Phase 4 §26.5 |
| Table of Contents (Composite) | `<nav>` landmark with its own distinguishing `aria-label` | Phase 4 §26.15 |
| Form (Client) | Native `<form>`-equivalent semantics — noting the explicit prohibition on literal `<form>` tags in any React-Artifact-adjacent execution context does not apply to this project's actual Next.js codebase, where native form semantics are fully available and required | Phase 5B §7's Server Action model composes with native form submission semantics |
| Modal / Drawer (Client) | `role="dialog"` (Modal) or an equivalent landmark-appropriate role for edge-anchored panels (Drawer) | Phase 4 §17–18 |
| Search Overlay (Client) | `role="dialog"` per Phase 4 §26.13 | Phase 4 §26.13 |
| FAQ Accordion (Client) | Each item's trigger is a native `<button>`, never a styled `<div>` with a click handler | Phase 4 §26.8 |

**Single-`<main>`-Per-Page Enforcement Is a Page-Tier, Not Section-Tier, Obligation:** Because Sections compose sibling-fashion within a single Page (§3.5's "Compositional-composes-Compositional" sibling pattern), the `<main>` wrapper is rendered exactly once, by the Page itself, around the full sequence of composed Sections — no individual Section component renders its own `<main>` tag, which would violate this rule the moment two or more Sections were composed on the same page (the normal case, per every Scroll Journey in Phase 3 §5–10).

### 5.4 ARIA Attribute Contracts

**Restates Phase 4 §26's Component-Specific ARIA Rules, Consolidated Into a Single Cross-Component Reference:** Phase 4 §26 already specified individual ARIA requirements scattered across each component's own subsection (§26.1's `aria-expanded`, §26.8's `aria-expanded`/`aria-controls`, §26.10's `aria-current="page"`, §26.13's `dialog` role). Section 5.4 does not restate their substance — it confirms the **derivation discipline** (§5.2) applies uniformly and closes the one gap Phase 4 §26 left open: attributes for components introduced or refined after Phase 4 §26 was frozen (Phase 6 §8's full breadcrumb specification, Phase 6 §15's dynamic OG imagery, Phase 5B §7's Form/`ActionResult` architecture).

| Component | Required ARIA Attribute(s) | Source |
|---|---|---|
| Mega Menu / Mobile Drawer trigger | `aria-expanded` (reflecting §4.3's Ephemeral UI State), `aria-controls` referencing the panel's `id` | Phase 4 §26.1 |
| FAQ Accordion trigger | `aria-expanded`, `aria-controls`, focus retained on toggle | Phase 4 §26.8 |
| Breadcrumb current segment | `aria-current="page"` on the final, non-interactive trail segment | Phase 6 §8.5, restated |
| Icon-only Button (Primitive) | Mandatory `aria-label` — never label-less, per Phase 4 §11.1's "icon-only buttons are never label-less" rule, restated here as an ARIA-contract requirement rather than a general button-system rule | Phase 4 §11.1 |
| Modal / Drawer / Search Overlay | `aria-modal="true"` alongside `role="dialog"`, plus a labeled title via `aria-labelledby` | Phase 4 §17, §18, §26.13 |
| Toast Notification | `aria-live="polite"` for Success/Info variants, `aria-live="assertive"` reserved only for critical Error variants — restating Phase 4 §23's exact rule | Phase 4 §23 |
| Form field with an inline error (§4.4's Form State Phase 3) | `aria-invalid="true"` and `aria-describedby` referencing the associated error message's `id` | Phase 4 §12.7, Phase 3 §14 |
| Client Logo Bar images | No component-level ARIA beyond the mandatory `alt` text already enforced at the domain layer (Phase 5B §3.17, restated Phase 6 §14.3) — logos require no additional ARIA role beyond native `<img>` semantics | Phase 4 §26.12 |

**Attribute Values Are Always Derived From Existing Props, Never Independently Computed:** Consistent with §2.2's derivation discipline, an `aria-expanded` value is always a direct reflection of the Ephemeral UI State already governed in §4.3 (never a second, separately-tracked boolean); an `aria-current="page"` value is always derived from the same breadcrumb-trail array Phase 6 §8.6 already resolves (never independently determined by the Breadcrumb component itself); an `aria-invalid` value is always a direct reflection of the `ActionResult`'s `fieldErrors` map already established in Phase 5B §7.5 and consumed per §4.4's Phase 3.

### 5.5 Keyboard Interaction Contracts

**Restates Phase 4 §26's General Keyboard-Navigability Rule, Given Its Per-Component-Category Specification:** Phase 4 §26 established "full site navigable via keyboard alone" as a general requirement; Section 5.5 specifies the exact key-to-action mapping per interactive component category, closing the gap between that general requirement and an implementable contract.

| Component Category | Key | Action |
|---|---|---|
| Mega Menu, Mobile Drawer, Modal, Drawer, Search Overlay | `Escape` | Closes the component, restoring focus per §5.6 |
| Mega Menu, Mobile Drawer | `Tab` / `Shift+Tab` | Moves focus through the panel's interactive children in document order; focus is trapped within an open Mobile Drawer/Modal per §5.6, but *not* within an open Mega Menu (a hover/click-expand panel, not a modal-equivalent focus trap, consistent with Phase 4 §26.2's distinct governance from §17's Modal System) |
| FAQ Accordion trigger | `Enter` / `Space` | Toggles the associated panel's expanded state (native `<button>` behavior, §5.3, requiring no custom key-handling code beyond what semantic `<button>` elements provide by default) |
| Search Overlay results list | `ArrowDown` / `ArrowUp` | Moves selection through type-ahead results; `Enter` activates the currently-selected result | Phase 4 §26.13
| Table of Contents jump links | `Enter` | Native anchor-link activation (Phase 4 §26.15) — no custom key handling required, since jump links are genuine `<a href="#...">` elements |
| Card (Composite) | `Enter` (when focused) | Native anchor-link activation, since the entire card is a single wrapping `<a>` per §5.3 — no custom key handling required |
| Testimonial Carousel controls | `ArrowLeft` / `ArrowRight` (where the carousel variant is used at all, per §1.7's Server/Client split classification) | Moves to the previous/next slide; carousel auto-advance pauses on any keyboard interaction, consistent with Design System Phase 4 §26.6's pause-control mandate |

**No Component Introduces a Custom Key Binding Outside This Table:** Consistent with §5.2's derivation discipline, a component contract specified in Sections 6+ may not introduce a keyboard interaction not already named here — where a genuinely new interaction pattern seems necessary, it is evidence the component's classification (§1.6) or its inclusion in Phase 4's closed inventory (§1.2) needs re-examination, not that this section's keyboard-contract table should be silently extended in a later section without being reconciled here first.

### 5.6 Focus Management Architecture

**Direct Extension of §4.3's "Focus-Trap Active State" Ephemeral UI State Category, Given Its Full Behavioral Contract:** Section 4.3 named focus-trap active state as an example of Ephemeral UI State owned internally by Modal/Drawer/Search-Overlay components without elaborating the trap's actual behavior — Section 5.6 specifies that behavior completely, extending Phase 5B §8.4's own restated rule ("focus trapped within an open modal while open... focus restored to trigger on close") from its original webhook-adjacent context into its full, general component contract.

**The Three-Phase Focus Lifecycle, Closed and Uniform Across Every Focus-Trapping Component:**

```
Phase 1 — Trap Entry
  On open (Modal, Drawer, Search Overlay — the three components
  in this system's inventory whose Design System specification,
  Phase 4 §17–18/§26.13, mandates a focus trap), focus moves
  immediately to the first focusable element within the opened
  panel, or to the panel's own labeled container if no
  interactive child exists yet (e.g., a Search Overlay's input
  field is typically this first-focus target)
        │
        ▼
Phase 2 — Trap Containment
  Tab/Shift+Tab cycles exclusively among the panel's own
  focusable children — focus can never move to any element
  outside the panel (including the page content beneath it)
  while the panel remains open, satisfying Phase 4 §17's
  "focus trapped within modal while open" requirement uniformly
  across all three components
        │
        ▼
Phase 3 — Trap Exit and Focus Restoration
  On close (via Escape, per §5.5; via an explicit close
  control; or via successful completion of the panel's
  purpose, e.g., a search result selection), focus returns
  to the exact DOM element that triggered the panel's opening
  — never to a fixed fallback location (e.g., the page's
  `<main>` landmark), and never left unset (which would cause
  focus to silently reset to the document `<body>`, a known
  screen-reader-disorienting failure mode this contract
  explicitly prevents)
```

**Mega Menu Is Explicitly Excluded From This Focus-Trap Lifecycle:** Consistent with §5.5's distinction, the Mega Menu's hover/click-expand panel does not trap focus — a user tabbing past the mega-menu's own items continues naturally into the rest of the header/page rather than being contained, since Phase 4 §26.2 governs it as a navigational disclosure pattern, not a modal-equivalent interruption of the user's task.

**Focus Restoration Ownership:** Consistent with §4.3's ownership rule (state is owned by the single component whose rendering it affects), the *triggering* element's identity is captured by the focus-trapping component itself at the moment of Phase 1 (trap entry) — it is never passed in as an external prop from whatever composed the Modal/Drawer/Search-Overlay, since the trapping component is the only one positioned to reliably know which element held focus immediately prior to its own opening.

### 5.7 Screen Reader Announcement Strategy

**Direct Extension of §4.6's Toast Context Governance, Given Its Announcement-Specific Contract:** The Toast Notification Context (§4.6, §4.8) already governs *how* toast state is shared across the component tree; Section 5.7 specifies the accessibility contract governing *how* a toast's appearance is announced to assistive technology, restating Phase 4 §23's `aria-live` rule (§5.4 above) and adding the one behavioral detail Phase 4 §23 flagged but did not fully specify: "auto-dismisses after a reasonable duration (must be long enough for screen-reader announcement to complete — accessibility-aware timing, not arbitrarily short)."

**Minimum Announcement Window, Stated as a Contract Obligation:** A Toast's auto-dismiss timer does not begin until its content has been fully rendered into the live region — and its minimum duration is calculated relative to the announced message's length (a longer message requires a longer minimum window before auto-dismiss is permitted to fire), rather than a single fixed duration applied uniformly regardless of content length. This directly operationalizes Phase 4 §23's own flagged requirement into an enforceable per-instance rule rather than a single global constant that would under-serve longer messages or over-delay shorter ones.

**Form Validation Error Announcement (Extends §4.4/§5.4's `aria-invalid`/`aria-describedby` Pairing):** Where a Server Action returns a `VALIDATION_ERROR` result (Phase 5B §7.5, §4.4's Form State Phase 3), the associated field-level error message is rendered into the DOM in a manner that is announced to a screen-reader user *without* requiring that user's focus to already be on the affected field — satisfied by the `aria-describedby` association already specified in §5.4, which causes assistive technology to announce the referenced error text at the moment focus lands on (or remains on) the invalid field, consistent with UX Phase 3 §14's "errors announced to assistive technology" requirement.

**No Live-Region Usage Outside These Two Named Cases:** Consistent with §5.2's derivation discipline, `aria-live` regions in this system's component inventory are restricted to the Toast Notification System and Form validation-error announcement — no other component introduces a live region, since an unnecessary live region is a known source of assistive-technology announcement noise (the same "avoid... noise" concern already named in Design System Phase 4 §18 regarding decorative-image marking, restated here for its live-region equivalent).

### 5.8 Reduced Motion Contract

**Direct Extension of Phase 6 §13.6's Font-Swap Motion Discipline and Design System Phase 4 §24's Animation Principles, Given Its Per-Component Contract:** Phase 4 §24 already established that "every animated/motion component respects `prefers-reduced-motion` with a defined static fallback" as a general rule; Section 5.8 specifies which components carry this obligation and what their static fallback consists of.

| Component | Motion Under Normal Conditions | `prefers-reduced-motion` Fallback |
|---|---|---|
| Modal / Drawer | Enter/exit slide or fade transition (Phase 4 §17–18) | Instant show/hide, no transition |
| Toast Notification | Enter/exit transition (Phase 4 §23) | Instant show/hide |
| Skeleton Loading | Shimmer/pulse animation (Phase 4 §22) | Static neutral block, per Phase 4 §22's own explicit fallback rule |
| Testimonial Carousel | Slide transition between items | Instant swap, no transition — auto-advance itself is also disabled under reduced motion, not merely visually simplified, consistent with Phase 4 §26.6's pause-control mandate extended to this preference |
| Stat/Metric Callout count-up | Optional count-up animation on scroll-into-view (Phase 4 §26.7) | Instant display of the final numeric value — restating Phase 4 §26.7's own explicit fallback rule |
| Mega Menu / Mobile Drawer | Expand/collapse transition | Instant expand/collapse |

**This Table Is Exhaustive Against the Closed Component Inventory:** Every component in this system's inventory (§1.2) carrying any motion at all is enumerated above — a component not appearing in this table has no motion requiring a reduced-motion fallback in the first place (e.g., a static Card's hover-elevation shadow transition, per Design System Phase 4 §13, is sufficiently minor that it is not classified as motion requiring a fallback under Phase 4 §24's own scoping, consistent with that section's original "meaningful micro-interactions... never decorative" framing).

### 5.9 Non-Color-Dependent State Communication

**Restates Phase 4 §26's "No Information Conveyed by Color Alone" Rule, Given Its Component-Contract Enforcement Point:** Every component whose rendering communicates a semantic state (success, warning, error, required-field, active-selection) pairs that color-coded state with a non-color signal — an icon (Phase 4 §9's Icon System, already established to inherit `currentColor` and pair with semantic tokens per Phase 4 §3.2) and/or text — never color alone. This restates a rule already fully specified in Phase 4 §3.2 and §26; Section 5.9's contribution is confirming this rule is a **component-contract obligation**, meaning every Composite or Client-tier component rendering Alert, Toast, form-validation, or Badge/Tag semantic-state content (Phase 4 §14–16, §23) must expose whatever prop is necessary (§2.2's derivation discipline) to render the paired icon/text, never a component contract that renders color-only state with no such prop available at all.

### 5.10 Accessibility Validation Boundary

**Restates §2.9's and §4.10's Validation-Boundary Discipline, Applied Here to Accessibility Specifically:** Consistent with this document's consistent practice of distinguishing build-time-enforceable checks from checks requiring manual or judgment-based review (a pattern established since Phase 5B §5.5 and repeated at every subsequent section's own validation subsection through Phase 6 §21), accessibility contracts split into two enforcement categories:

**Build-Time/Automatable (consistent with Section 1.5's Governing Principle 3):**
- Mandatory `alt` text presence on every image-rendering component (already enforced at the domain layer per Phase 5B §3.17/Phase 6 §14.9; restated here as a compile-time-checkable prop-required-ness obligation per §2.4's inheritance rule)
- `aria-label` presence on every icon-only Button instantiation (§5.4)
- Single-`<main>`-per-page structural lint (§5.3)
- Heading-level-skip detection within a composed page (extends Phase 6 §12.9's `RichContentBlock` heading-sequence check, Phase 6 §12.9, from content-body scope to full-page-composition scope)

**Manual/Judgment-Based (warning-tier or process-level, consistent with Phase 6 §21.7's severity-routing precedent):**
- Actual color-contrast ratio verification against the Design System's finalized token values (Phase 4 §3.2) — a check requiring the tokens' concrete color values, which Phase 4 deliberately left as structural definitions rather than locked hex values (Phase 4's own closing note)
- Genuine screen-reader walkthrough testing of focus-trap and announcement behavior (§5.6–5.7) — automatable to a degree via tooling, but ultimately requiring human verification of the *experience*, not merely the markup's presence
- Reduced-motion fallback *quality* review (§5.8) — confirming the static fallback is genuinely non-disorienting, not merely present

**No New Validation Mechanism Introduced:** Consistent with §4.10's confirming (not novel) conclusion, Section 5 introduces no fifth validation boundary beyond what Phase 5B §5.2 and Phase 6 §21's build-time/deployment-time/runtime/operational taxonomy already established — accessibility checks are distributed across that existing taxonomy's categories (build-time for the automatable items above, operational/manual per Phase 6 §21.8's checklist pattern for the judgment-based items) rather than requiring a separate accessibility-specific validation system.

### 5.11 Section Resolution Summary

Section 5 has established the deterministic accessibility contracts governing every component specified in Sections 6+:

- Accessibility contracts are derived, never invented, from three closed sources — Design System Phase 4 §26, UX Phase 3 §18, and Phase 6 §14.8 — with translation and per-component assignment as this section's sole original contribution (§5.2).
- Every component tier maps to a fixed, non-negotiable semantic HTML element or landmark, with exactly one `<main>` landmark owned at the Page tier, never the Section tier (§5.3).
- A consolidated, closed table of required ARIA attributes per component category has been established, with every attribute's value always derived from an already-existing prop or state source, never independently computed (§5.4).
- A closed table of keyboard-to-action mappings governs every interactive component, with no component contract permitted to introduce a key binding outside this table without reconciling it here first (§5.5).
- Focus management follows a uniform three-phase lifecycle (trap entry, trap containment, trap exit with restoration) across all three focus-trapping components, with the Mega Menu explicitly excluded from trapping behavior (§5.6).
- Screen-reader announcement is restricted to exactly two named live-region use cases — Toast Notifications (with content-length-aware minimum duration) and Form validation errors (via `aria-describedby`) — with no other component introducing a live region (§5.7).
- A closed table of every motion-bearing component in the system's inventory and its required static fallback under `prefers-reduced-motion` has been established (§5.8).
- Every component communicating semantic state pairs color with an icon and/or text, never color alone, enforced as a component-contract prop-availability obligation (§5.9).
- Accessibility validation splits into build-time/automatable checks and manual/judgment-based checks, distributed across the existing Phase 5B/Phase 6 validation taxonomy rather than introducing a new boundary (§5.10).

Every per-component contract specified in the sections that follow satisfies these accessibility obligations as a non-optional part of its complete engineering specification.

**End of Section 5 — Accessibility Implementation Architecture.**

Ready to continue with Section 6.

Phases 1–6 and Phase 7 Sections 1–5 remain frozen and immutable. Continuing with Section 6.

---

# 6. Error Boundary & Loading State Component Architecture

### 6.1 Purpose and Scope of This Section

Phase 5A §5.5 established that route segments carry colocated `loading.tsx` and `error.tsx` files implementing the Skeleton Loading System (Design System Phase 4 §22) and the Error State patterns (UX Phase 3 §20), with "specific implementation detail deferred to Phase 7." Phase 5B §9 established the typed `ContentError` taxonomy and its recovery postures; Phase 6 §19 established the 404-specific case in full. What none of these prior specifications addressed is the **component-level engineering contract** governing how a Skeleton renders relative to the real component it stands in for, how an error boundary's fallback UI is scoped and composed, and how these two component categories interact with the Composition Architecture (Section 3) and State Management Architecture (Section 4) already frozen. Section 6 closes this gap.

**Governing Constraint, Restated From Phase 5A §5.5 and Given Its Component-Contract Consequence:** Loading and error states are never ad hoc, per-page-invented markup — they are themselves components, subject to every rule already established in Sections 1–5 (tier classification, props derivation, composition boundaries, accessibility contracts) exactly as any other component in this system's inventory.

### 6.2 Skeleton Component Architecture

**Tier Classification (Direct Application of Section 1.6):** Skeleton components are classified as **Composite**, not Primitive — a Skeleton is never a bare, content-agnostic rectangle; it is a domain-shape-aware stand-in for a *specific* Composite component it mirrors (Phase 4 §22's own rule: "skeleton blocks matching the exact dimensions and radius token of the final content they represent"). A Skeleton's props contract is therefore derived (§2.2) not from a Phase 5B content model directly, but from the **rendered-dimension contract** of the Composite component it mirrors — e.g., `ServiceCardSkeleton` derives its layout from `ServiceCardProps`' own visual footprint (Design System Phase 4 §13's Card System radius/padding tokens), never from `Service` domain fields themselves, since a Skeleton by definition renders before any domain data has arrived.

**One Skeleton Per Mirrored Composite, Named Consistently:** Consistent with Phase 4 §27's Component Naming Convention (`[Category]/[ComponentName]/[Variant]`) and Section 2.3's naming rules, every Composite component that can appear in a loading state has a corresponding Skeleton counterpart named `[ComponentName]Skeleton` (e.g., `ServiceCardSkeleton`, `CaseStudyCardSkeleton`, `TestimonialCardSkeleton`) — there is no generic, undifferentiated "Skeleton" component applied uniformly across content types, since Phase 4 §22 already requires dimension-and-radius fidelity to the *specific* content type being loaded, which a generic skeleton cannot provide.

**Skeleton Props Are Minimal — Count, Not Content:** A Skeleton component's props are restricted to layout-repetition parameters (e.g., `count: number`, governing how many card-shaped placeholders render in a grid) and never accept content-projection props of any kind — consistent with §2.4's required/optional inheritance rule applied to its logical conclusion: a Skeleton has no domain data to project, so no domain-derived prop can exist on its contract at all, distinguishing it structurally from every other Composite in this system's inventory.

**Skeleton Rendering Boundary (Restates Section 1.7's Table, Given Its Placement Rule):** Skeletons are **Server**-tier components, consistent with Phase 5A §5.5's placement of `loading.tsx` as a Server Component boundary within the App Router's native Suspense-based streaming mechanism (Phase 5A §3.3's streaming discussion) — a Skeleton never requires client-side JavaScript to render its static placeholder shape, and introducing client-tier status for a Skeleton would contradict Phase 6 §13.7's JavaScript-budget discipline for no rendering benefit.

**Motion Contract (Cross-Reference, Not Restatement):** A Skeleton's shimmer/pulse animation and its `prefers-reduced-motion` fallback are already fully specified in Section 5.8's table — Section 6.2 introduces no new motion rule, only confirms the Skeleton component category is the bearer of that already-established contract.

### 6.3 Loading State Composition Rules

**`loading.tsx` Placement Follows the Route-Segment Boundary Already Frozen in Phase 5A §4–5.5, Not an Independent Per-Component Decision:** A given route segment's `loading.tsx` is composed of the Skeleton counterparts (§6.2) matching that segment's expected Composite components in their expected composition arrangement (§3.5's Section-composes-Composite pattern) — e.g., a Blog index route's `loading.tsx` renders a grid of `BlogCardSkeleton` instances matching the same grid arrangement (Design System Phase 4 §6.4) the real, resolved `BlogCard` grid will occupy once data arrives, ensuring no layout shift occurs at the moment real content replaces the skeleton (directly serving the CLS discipline already frozen in Phase 6 §13.2/§13.5, now extended from image-loading to full-component-loading).

**Loading State Never Composes a Structural-Tier Component:** Header, Footer, and Breadcrumb (§1.6's Structural tier) are never wrapped in their own loading state or Skeleton counterpart, because their data source is the singleton `Navigation`/`Footer` entities (Phase 5B §3.12–3.13) resolved once at the layout level (§3.2's layout-level composition exception) — by the time any route-level `loading.tsx` could render, these Structural components are, per Phase 5A §5.2's layout-nesting mechanism, already resolved and rendered as part of the parent layout, not part of the loading route segment itself.

**Loading State Composition Depth Mirrors Section 3.7's Governance:** A `loading.tsx` file's own internal composition never exceeds the same four-tier depth ceiling already established for ordinary pages (§3.7) — a Skeleton-bearing loading state is itself only ever composed as Page-tier-assembles-Skeleton-Composites, with no deeper nesting, consistent with loading states being, by nature, simpler placeholder renderings than the full content they stand in for.

### 6.4 Error Boundary Component Architecture

**Tier Classification:** Error boundary fallback UI is classified as **Compositional (Section)**, not Composite — an `error.tsx` fallback is a full page-region assembly (headline, explanatory text, recovery action, per UX Phase 3 §20's already-frozen content requirements), not a single reusable content-display unit, placing it in the same tier as a Hero Section or CTA Band per Section 1.6's tier definitions.

**Props Contract, Derived From the Next.js Native Error Boundary Signature, Not From Phase 5B Content Models:** Consistent with §2.2's closed set of three derivation sources, an Error Boundary component's props are the one case in this system's entire inventory sourced from neither a Phase 5B domain model nor a Design System token union, but from the **framework's own native error-boundary contract** (the `error` object and `reset` function Next.js's `error.tsx` convention supplies, per Phase 5A §5.5) — this is not a fourth derivation source contradicting §2.2's closed-set rule, but the component-layer expression of the same principle §2.2 already applies to Design System tokens: where an authoritative external contract already exists (the framework's own error-boundary signature, exactly as Design System Phase 4's token unions are an authoritative existing contract), the component's props derive from it rather than inventing a parallel shape.

**The `reset` Function Is a Callback Prop, Governed by §2.6:** Consistent with Section 2.6's Event & Callback Contract Strategy, the framework-supplied `reset` function is treated identically to any other callback prop — wired to a "Try Again"-equivalent recovery action's `onClick` (Section 5.5's keyboard-activation table applies identically), never invoked automatically or silently by the Error Boundary component itself without explicit user action, consistent with UX Phase 3 §20's "never a dead end" framing requiring the user to retain agency over recovery.

**Error Classification Awareness — Restates Phase 6 §19.3, Given Its Component-Boundary Consequence:** Because Phase 6 §19.3 already established that `NotFoundError` routes to `notFound()` (and thus `app/not-found.tsx`, Phase 6 §19.4 — a *distinct* component from the general Error Boundary) while every other unhandled runtime failure routes to `error.tsx`, this system's Error Boundary component contract is scoped **exclusively** to the non-404 failure case — it never receives or renders a `NotFoundError`-classified state, since that state is structurally intercepted by Next.js's `notFound()` mechanism before ever reaching the general error boundary. This is a restatement of an already-frozen routing distinction, given its explicit consequence for this section's component-contract scope: the Error Boundary component and the 404 component (Phase 6 §19.4) are two separate, non-overlapping Compositional-tier components, never a single unified "something went wrong" component (a unification Phase 6 §19.4 already explicitly prohibited at the routing layer, restated here as binding at the component layer).

**No Content-Domain Data in Error Boundary Props:** Consistent with the derivation-source reasoning above, an Error Boundary's props never include a Phase 5B content projection — the fallback UI it renders is generic, framework-error-driven content (a message, a retry action, links to primary hubs reused from the singleton Navigation entity per the same pattern Phase 6 §19.4 already established for the 404 page) rather than anything specific to whatever content the failed route was attempting to render, since the very nature of an unhandled error means that content's shape cannot be reliably assumed present or valid.

### 6.5 Error Boundary Composition Rules

**Error Boundary Placement Follows the Identical Route-Segment Boundary Governing Loading States (§6.3), With One Additional Nesting Rule:** Consistent with Phase 5A §5.5's colocation of `error.tsx` alongside `loading.tsx` per route segment, an Error Boundary composed at a nested route segment intercepts failures occurring *within* that segment's own subtree without propagating the fallback UI upward to replace an ancestor segment's already-successfully-rendered content (e.g., a failure within a single "Related Case Studies" data-dependent Section, were such a Section ever to carry its own nested error boundary, does not take down the entire Service page's Hero and other already-rendered Sections) — this nesting behavior is native to the framework's error-boundary mechanism (Phase 5A §5.5) and this section's contribution is confirming the Compositional-tier Error Boundary component contract (§6.4) is reusable at any such nesting depth without its own props contract needing to vary by nesting level.

**Error Boundary Never Composes a Skeleton:** Because an Error Boundary renders only after a failure has already occurred — meaning any loading phase has already concluded, successfully or not — a `error.tsx` fallback never composes a Skeleton component (§6.2), which would incorrectly imply content is still pending rather than having definitively failed; this is a structural, not merely stylistic, distinction between the two component categories this section governs.

**Error Boundary Composes Reused Structural/Navigational Elements, Never Reinvents Them:** Consistent with Phase 6 §19.4's already-established rule for the 404 page ("no separate, independently-maintained... configuration exists"), an Error Boundary's recovery-navigation content (links to primary hubs) is composed from the identical singleton `Navigation` entity (Phase 5B §3.12) every other Structural-tier component already consumes — never a locally hardcoded, parallel link list.

### 6.6 State Interaction Between Loading, Error, and Success States

**Restates Section 4.4's Three-Phase Form State Lifecycle, Given Its Generalization to Every Data-Dependent Component in This System:** Just as Form components follow a defined Input Capture → Submission Pending → Resolved Result lifecycle (§4.4), every Page-level data dependency in this system follows an analogous, framework-native three-phase lifecycle this section now names explicitly for the first time: **Pending** (the `loading.tsx` Skeleton composition, §6.3, rendered via React's Suspense mechanism during SSG/ISR generation or streaming, Phase 5A §3.3) → **Rejected** (the `error.tsx` Compositional fallback, §6.4–6.5, rendered on an unhandled `ContentError`, per Phase 5B §9.1, that was not itself classified as `NotFoundError`) → **Resolved** (the ordinary, already-fully-specified Page/Section/Composite/Primitive composition chain, §3.2, rendered once the Content Service call succeeds).

**This Lifecycle Is Distinct From, and Does Not Duplicate, Phase 5B §9.1's Error Taxonomy:** Section 6.6 does not introduce a new error classification — it names the **rendering-layer consequence** of the taxonomy already frozen in Phase 5B §9, exactly as Phase 6 §19.3 already did for the 404-specific case. The Pending/Rejected/Resolved framing exists solely to give this section's Skeleton and Error Boundary components an explicit place in the overall request lifecycle already diagrammed throughout Phase 6 (§2.12 and every subsequent generation-flow diagram) and Phase 6 §21.6/§21.10's consolidated validation-and-operational flow.

**No Component in This System Independently Tracks Which of These Three Phases Is Active:** Consistent with §4.2's State Classification Taxonomy, "which phase is currently rendering" is not a piece of Ephemeral UI State any component owns or queries — it is an emergent property of *which component the framework's own Suspense/error-boundary mechanism has currently selected for rendering* (Phase 5A §3's native rendering behavior), meaning no Skeleton, Error Boundary, or ordinary content component contains conditional logic branching on a "loading/error/success" prop of its own invention; each component simply *is* the correct rendering for its phase, selected externally by the framework, consistent with §4.7's prohibition on components inventing derived/shadow state that duplicates what the rendering system itself already determines.

### 6.7 Section Resolution Summary

Section 6 has established the deterministic engineering contracts governing every loading-state and error-boundary component this system's route structure requires:

- Skeleton components are classified as Composite tier, one per mirrored Composite component, with props restricted to layout-repetition parameters only — never domain-content props — and rendered as Server-tier components reusing the motion contract already established in §5.8 (§6.2).
- `loading.tsx` composition follows the same route-segment boundary and composition-depth governance already established in Phase 5A §5.5 and Section 3.7, never composing Structural-tier components, which are already resolved at the layout level before any loading state could render (§6.3).
- Error Boundary fallback UI is classified as Compositional tier, with props derived from the framework's native error-boundary signature — the one derivation source in this system sourced from neither Phase 5B models nor Design System tokens but from an equally authoritative external contract — and is scoped exclusively to non-404 failures, remaining structurally distinct from the 404 component already fully specified in Phase 6 §19.4 (§6.4).
- Error Boundaries follow the framework's native per-segment nesting behavior without their own props contract varying by nesting depth, never compose a Skeleton, and reuse the identical singleton Navigation entity every other Structural-tier component already consumes for recovery-navigation content (§6.5).
- Every data-dependent component in this system follows a Pending → Rejected → Resolved rendering lifecycle that is an emergent, externally-selected property of the framework's own Suspense/error-boundary mechanism — never a piece of state any individual component tracks or branches on internally (§6.6).

Every route segment's loading and error handling in this system is now fully specified as a component-engineering contract, closing the deferral Phase 5A §5.5 originally left open for this phase.

**End of Section 6 — Error Boundary & Loading State Component Architecture.**

Ready to continue with Section 7.

Phases 1–6 and Phase 7 Sections 1–6 remain frozen and immutable. Continuing with Section 7.

---

# 7. Component Testing & Contract Verification Architecture

### 7.1 Purpose and Scope of This Section

Sections 1–6 have specified a complete, deterministic engineering contract for every component category in this system: props derivation (§2), composition boundaries (§3), state ownership (§4), accessibility obligations (§5), and loading/error rendering lifecycle (§6). None of these prior sections specified **how conformance to these contracts is verified** — which properties are checkable by the TypeScript compiler alone, which require an executable test, and which require the manual/operational review discipline already established in Phase 6 §21. Section 7 closes this gap, consistent with this document's consistent practice of distinguishing build-time, runtime, and operational verification categories (Phase 5B §5.2, Phase 6 §21.2–21.3).

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 3 (Build-Time Enforceability Wherever Possible) and Section 1.1's framing of Phase 7 as producing contracts rather than code, this section specifies **what must be verified and at which boundary**, never a specific testing library's API or literal test code — consistent with Section 1.5's Governing Principle 4 (Technology Independence Within the Chosen Stack).

### 7.2 Contract Verification Taxonomy

Every verifiable property established in Sections 2–6 is classified into exactly one of three verification categories, extending the build-time/runtime/operational taxonomy already frozen in Phase 6 §21.2–21.3 and §21.8 from the content-and-artifact domain into the component domain specifically:

| Category | Verifies | Mechanism |
|---|---|---|
| **Type-Level Verification** | Props shape, required/optional correctness, discriminated-union exhaustiveness, derivation-source conformance (§2.2, §2.4, §2.9) | TypeScript strict-mode compilation (Phase 5B §4.1) — no executable test required |
| **Behavioral Verification** | Composition boundaries (§3), state transitions (§4), accessibility interaction contracts (§5.4–5.7), loading/error lifecycle selection (§6.6) | Executable component tests, run at CI time (extending Phase 6 §21.4's Gate sequence) |
| **Operational Verification** | Accessibility quality judgments (§5.10's manual category), motion-fallback experiential review (§5.8), cross-browser/assistive-technology walkthroughs | Manual, checklist-driven review (extending Phase 6 §21.8's checklist pattern) |

**No Fourth Category:** Consistent with this document's closed-set discipline (Section 1.6, 1.8, 4.2), a verification concern not fitting one of these three categories indicates either a contract gap in Sections 2–6 requiring resolution there first, or a misclassification of an existing concern — Section 7 does not introduce a parallel verification mechanism outside this taxonomy.

### 7.3 Type-Level Verification Contracts

**Restates and Extends §2.9's Ruling — the Compiler Is the Primary Verification Mechanism for Every Props Contract:** Because every component's props are derived projections (§2.2) rather than independently authored shapes, type-level verification requires no test authorship at all for the overwhelming majority of contract properties Sections 2–6 establish — a component whose props interface incorrectly omits a `Required` domain field (§2.4), or whose `variant` prop accepts a value outside its Design-System-token union (§2.2), fails compilation before any test would even run.

**Exhaustiveness Checking as a Named, Enforced Property:** Consistent with §4.4's restatement of Phase 5B §9.1's discriminated-union exhaustiveness pattern, every component rendering a branch over `ActionResult` (§4.4), `ContentError` (§6.6), or any other closed union established elsewhere in this project must exhibit compiler-verified exhaustiveness — a missing branch (e.g., a Form component's `ActionResult` switch omitting the `RATE_LIMITED` case) is a type error, never a silently-incomplete runtime behavior discovered only through manual testing.

**Ref-Forwarding and Tier-Boundary Conformance (Extends §2.8, §1.6):** Type-level verification additionally confirms the tier-boundary rules already established — a Composite or Structural-tier component's props interface exposing a forwarded ref (prohibited per §2.8) or a `children`/slot prop where §2.5 prohibits one (Structural-tier singleton components) is a contract violation checkable by inspecting the component's own exported type signature, without requiring runtime execution.

### 7.4 Behavioral Verification Contracts

**Composition-Boundary Behavioral Tests (Extends Section 3):** Behavioral verification confirms the composition rules of Section 3 hold at runtime, not merely at the type level — specifically: that a Server-tier Section composing a Client-tier island (§3.4) does not itself require client-side JavaScript to render its static content; that data narrowing at each composition boundary (§3.3) produces the correct minimum-sufficient-slice props at each tier, not merely a type-compatible superset; and that composition depth (§3.7) does not exceed the four-tier ceiling in practice, not merely in intent.

**State-Transition Behavioral Tests (Extends Section 4):** Behavioral verification confirms each of the four State Classification categories (§4.2) behaves per its governing subsection — that Ephemeral UI State (§4.3) does not leak upward to a parent component's own rendering; that Form State's three-phase lifecycle (§4.4) correctly transitions from Input Capture through Submission Pending to Resolved Result without an intermediate, uncovered state; that URL State (§4.5) is never shadowed by client-side component state; and that the single authorized Toast Context (§4.6, §4.8) is never misused as a general-purpose data channel beyond its three named governance rules.

**Accessibility Interaction Behavioral Tests (Extends Section 5):** Behavioral verification confirms the keyboard-interaction table (§5.5) and focus-management lifecycle (§5.6) hold under simulated interaction — that `Escape` closes every applicable component and restores focus to the correct triggering element (§5.6's Phase 3), that Tab/Shift+Tab containment holds within an open Modal/Drawer/Search-Overlay without escaping the trap (§5.6's Phase 2), and that the Mega Menu's explicit non-trapping behavior (§5.6) is correctly distinguished from the three trapping components' behavior.

**Loading/Error Lifecycle Behavioral Tests (Extends Section 6):** Behavioral verification confirms a route segment's Skeleton composition (§6.2–6.3) renders with dimensional fidelity to its corresponding resolved-content composition (preventing the CLS regression §6.3 exists to guard against), and that an Error Boundary (§6.4–6.5) correctly intercepts only non-`NotFoundError` failures without ever rendering in response to a classification that should have routed to the 404 component instead (Phase 6 §19.3's restated boundary).

### 7.5 Operational Verification Contracts

**Restates and Extends Phase 6 §21.8's Checklist Pattern, Given Its Component-Layer Instance:** Consistent with §5.10's manual/judgment-based accessibility category, operational verification is organized as a component-scoped checklist executed at defined trigger points, mirroring the structure already established in Phase 6 §21.8's three content-and-artifact checklists — Section 7.5 establishes the fourth, component-scoped checklist this project's operational governance model requires.

**Checklist D — New or Modified Component Contract Review (triggered by: introducing a new component or materially altering an existing one's contract):**
- [ ] Confirm props derivation traces to one of the closed sources named in §2.2 (or, for Error Boundaries specifically, §6.4's framework-native exception) — no invented prop shape
- [ ] Confirm tier classification (§1.6) and its corresponding Server/Client boundary assignment (§1.7) are correctly applied, with any client-island scoped to the narrowest possible sub-component (§1.7's split-component discipline)
- [ ] Confirm accessibility contract completeness against §5.3–5.9's closed tables — semantic element, required ARIA attributes, keyboard bindings, focus behavior (if applicable), motion fallback (if applicable), non-color-dependent state signaling (if applicable)
- [ ] Confirm color-contrast values against the Design System's finalized token values (§5.10's manual category, restated)
- [ ] Confirm actual screen-reader walkthrough for any component introducing new focus-trap or live-region behavior (§5.10's manual category, restated)

**Checklist Ownership, Restating Phase 6 §21.9's Shared-Obligation Model:** Consistent with the documentation-governance principle already established (Phase 6 §21.9), Checklist D's completion is a shared engineering-and-accessibility-review obligation, not a single role's unilateral sign-off — mirroring how no earlier phase's governance has ever assigned exclusive ownership of a cross-cutting concern to one role in isolation.

### 7.6 Contract Regression Prevention

**Direct Extension of Phase 6 §21.6's SEO Regression Prevention, Applied to Component Contracts:** Just as Phase 6 §21.6 established that the build-time gate sequence functions as a standing, continuously-enforced regression suite for discoverability guarantees, Section 7.3's Type-Level Verification and Section 7.4's Behavioral Verification together function as the identical standing regression suite for every component contract established in Sections 2 through 6 — run on every build and every code change, not merely at initial component authorship, consistent with Phase 6 §21.6's core insight that a regression suite's value comes from its continuous, not one-time, execution.

**Cross-Section Parity as the Component Layer's Most Sensitive Regression Tripwire (Restates Phase 6 §21.6's Precedent):** Consistent with Phase 6 §21.6's identification of parity checks as the most sensitive regression indicators at the content-and-artifact layer, the equivalent at the component layer is the correspondence between a Composite component's rendered anchor text and its source entity's `name`/`title` field (§2.10's cross-component consistency rule, itself derived from Phase 6 §7.9/§9.5) — a future change to a single Card variant's internal rendering that silently diverges from this already-established parity is exactly the failure mode Type-Level Verification (§7.3) and Behavioral Verification (§7.4) exist jointly to catch, since §2.10's naming-consistency rule is checkable at both the type level (prop name identity) and the behavioral level (rendered output identity).

### 7.7 Section Resolution Summary

Section 7 has established the deterministic verification architecture confirming every component contract specified in Sections 2 through 6 is actually upheld:

- Every verifiable component property is classified into exactly three categories — Type-Level, Behavioral, and Operational — extending the build-time/runtime/operational taxonomy already frozen in Phase 6 §21 into the component domain (§7.2).
- Type-Level Verification relies primarily on TypeScript strict-mode compilation, requiring no executable test authorship for the majority of Sections 2–6's contract properties, with discriminated-union exhaustiveness and tier-boundary conformance as named, enforced properties (§7.3).
- Behavioral Verification confirms composition boundaries, state transitions, accessibility interactions, and loading/error lifecycle selection at runtime, extending Sections 3 through 6 respectively (§7.4).
- Operational Verification is organized as a fourth, component-scoped checklist (Checklist D) extending Phase 6 §21.8's pattern, covering derivation-source conformance, tier/boundary correctness, accessibility-table completeness, and the two manual-review items already flagged in §5.10 (§7.5).
- Sections 7.3–7.4 together function as a continuously-enforced regression suite for every component contract, with cross-component naming/anchor-text parity (§2.10) named as this layer's most sensitive regression tripwire (§7.6).

Every component contract specified in the sections that follow is subject to this verification architecture as a non-optional part of its complete engineering specification.

**End of Section 7 — Component Testing & Contract Verification Architecture.**

Ready to continue with Section 8.

Phases 1–6 and Phase 7 Sections 1–7 remain frozen and immutable. Continuing with Section 8.

---

# 8. Design Token & Theming Consumption Architecture

### 8.1 Purpose and Scope of This Section

Design System Phase 4 §28 established the complete design token vocabulary; Phase 4 §29 mapped every token category to its Tailwind configuration strategy; Phase 4 §30 established this system's readiness for dark mode, alternate theming, and multi-brand token substitution — all without specifying how an individual *component's* engineering contract consumes these tokens, or what obligation a component carries to remain theme-agnostic rather than hardcoding a specific token's resolved value. Section 8 closes this gap, translating Phase 4's token architecture into a binding component-contract rule, consistent with Section 1.3's framing of Phase 7 as Design System Phase 4's direct engineering consumer.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1 (Inheritance Over Invention), this section introduces no new token, no new color value, and no new theming mechanism — it specifies the **discipline a component's implementation must follow** so that Phase 4 §30's already-established readiness properties (dark mode, theme, multi-brand) remain true in practice, not merely in the abstract token architecture.

### 8.2 Token Consumption Strategy

**Primary Mechanism — Tailwind Utility Classes, Restated From Phase 4 §29 as a Binding Component Obligation:** Every component's visual styling is expressed exclusively through the Tailwind utility classes already mapped in Phase 4 §29's Token Mapping table — never through inline style attributes, never through a component-local CSS file defining bespoke class names, and never through a hardcoded hex/pixel/rem value appearing anywhere in a component's implementation. This directly operationalizes Phase 4 §29's closing governance rule ("no component implementation may use Tailwind's raw default scale where it diverges from this system's defined tokens... the design system is the source of truth") as a per-component contract obligation rather than a general admonition.

**Underlying Mechanism — CSS Custom Properties as the Token/Utility Bridge:** Consistent with Phase 4 §30.1's dark-mode-readiness rationale ("every color token is defined as a semantic reference... rather than a hardcoded value used directly in components"), the Tailwind utility classes a component consumes resolve, at the build layer, to CSS custom properties (design tokens expressed as CSS variables) rather than to fixed values baked into the compiled stylesheet — this is not a new architectural decision Section 8 introduces; it is the existing mechanism (implicit in Phase 4 §30.1's semantic-indirection principle) now stated explicitly as the reason component-level token consumption discipline (§8.3) is what makes that principle actually load-bearing.

**No Component-Level Style Override Escape Hatch:** Consistent with Section 1.5's Governing Principle 5 (No Duplication Across Component Categories), a component contract never exposes a `className` or `style` override prop permitting a consuming Page or Section to inject arbitrary, non-token-derived styling — where a genuine visual variation is required, it is expressed as a named `variant` prop (§2.2's Design-System-token-union derivation source) that maps to an already-approved Phase 4 treatment, never as an open escape hatch that would allow token-system bypass at any composition point in the tree.

### 8.3 Component-Level Token Binding Rules

**Every Visual Property Traces to a Named Token, With No Exception:** Extending §8.2's utility-class rule to its full consequence, every color, spacing value, border-radius, shadow, font-size, font-weight, line-height, and transition-duration appearing in any component's contract or implementation corresponds to a specific, named token from Phase 4 §28's consolidated token reference — a component specification in a future implementation phase that requires a value not present in that reference is evidence of a genuine Design System gap requiring resolution in Phase 4 (out of Phase 7's authority to introduce unilaterally), never a value a component author supplies ad hoc.

**Variant Props Are the Sole Mechanism for Token-Set Selection:** Consistent with §2.2's rule that Primitive-tier props are typed against Design System token unions, a component's `variant`, `size`, or equivalent styling-selection prop is always a closed union of named options already established in Phase 4 (Button's Primary/Secondary/Ghost/Outline/Link/Icon variants per Phase 4 §11.1; Card's radius/shadow/padding tokens per Phase 4 §13) — never an open `string` type that would allow an arbitrary, unvalidated token name to be supplied at a call site, which would defeat the compiler-level enforceability §7.3 already established for props generally.

**Semantic Color Tokens Are Never Substituted for Decorative Use, Restated as a Component-Contract Obligation:** Consistent with Phase 4 §3.2's rule that Success/Warning/Error tokens are "reserved strictly for state communication," a component's props contract never accepts a semantic-color-token value as a generic decorative `variant` option — a component requiring purely decorative color variation (rare, given Design Philosophy's restraint principle, Phase 4 §2) draws only from the Primary/Secondary/Accent/Neutral token families, never from the Success/Warning/Error family, enforced at the type-union level (§7.3) by simply never including those tokens in a decorative-purpose prop's union type.

### 8.4 Dark Mode Consumption Readiness

**Restates Phase 4 §30.1's Readiness Posture, Given Its Component-Contract Consequence:** Because every component's styling is expressed exclusively through token-bound Tailwind utilities (§8.2–8.3), no component in this system's inventory requires any modification to become dark-mode-compatible once dark-mode token values are activated (Phase 4 §30.1) — a component's contract is, by construction, already dark-mode-ready the moment it conforms to §8.2–8.3's discipline, since the token *values* (light-mode vs. dark-mode) are resolved entirely outside the component's own implementation, at the CSS-custom-property layer Phase 4 §30.1 already established.

**No Component Introduces Its Own Light/Dark Conditional Logic:** Consistent with §4.7's prohibition on components inventing derived/shadow state, a component never contains internal conditional logic branching on "is dark mode active" — this would be exactly the kind of component-local state duplicating a fact the token/CSS-custom-property system already resolves externally (Phase 4 §30.1's semantic-indirection mechanism), reintroducing a second source of truth for a property this architecture has deliberately kept singular.

**Shadow-and-Elevation Component Contracts Anticipate Dark-Mode's Distinct Elevation Mechanism:** Restating Phase 4 §8's rule that "shadows always paired with the Surface color token" and Phase 4 §30.1's note that "elevation may need to rely more heavily on surface lightness steps than shadow opacity" in dark mode, any component whose contract includes an elevation-bearing variant (Card's hover-elevation, Modal's `shadow-xl`, per Phase 4 §7–8) sources that elevation through the paired shadow-token-plus-surface-token mechanism already established, never through a shadow value hardcoded independent of the surface token it must remain visually coupled to across both light and dark contexts.

### 8.5 Theme and Multi-Brand Consumption Readiness

**Restates Phase 4 §30.2–30.3's Readiness Posture, Given Its Component-Contract Consequence:** Phase 4 §30.2 established that semantic token naming (`color-primary` rather than `color-blue`) enables full-palette theme substitution without component-code changes; Phase 4 §30.3 established that the separation between tokens and components enables multi-brand component-library reuse. Section 8.5 confirms this readiness holds at the component-contract layer precisely because §8.2–8.3 already prohibit any component from referencing a token by its literal resolved value rather than its semantic name — a component contract satisfying §8.3's "every visual property traces to a named token" rule is, by definition, already theme-portable and multi-brand-portable, with no additional component-layer work required to realize either readiness posture when and if either is activated.

**Component Contracts Never Encode Brand-Specific Assumptions Beyond the Token Layer:** Consistent with Phase 4 §30.3's framing, no component's props contract or internal composition logic (§3) makes an assumption specific to this brand's particular token *values* — a component's contract may reference `color-primary` (the semantic name) but never assumes that name resolves to any particular hue, consistent with the same semantic-indirection discipline already governing §8.4's dark-mode case.

### 8.6 Responsive Breakpoint Consumption

**Restates Design System Phase 4 §25's Responsive Design Rules, Given Their Component-Contract Consequence:** Phase 4 §25 already established desktop/tablet/mobile behavior rules (multi-column grids, hamburger navigation, reduced spacing tokens) at the page-and-section level; Section 8.6 specifies that every component whose rendering varies by viewport consumes the identical breakpoint tokens already frozen in Phase 4 §6.2 (`sm`/`md`/`lg`/`xl`/`2xl`) via Tailwind's native responsive-prefix utility mechanism — never a component-local, independently-defined breakpoint value, and never a JavaScript-based viewport-detection mechanism that would introduce client-side computation (and thus a client-tier requirement, per §1.7) for a concern Tailwind's CSS-native responsive utilities already resolve without any JavaScript at all.

**Responsive Variation Is Expressed Through the Same Token-Bound Utility Discipline as §8.2, Not Through Component-Level Conditional Rendering:** A Card grid's column-count change from 3-column (desktop) to 1-column (mobile), per Phase 4 §6.4's already-established card-grid defaults, is expressed as responsive Tailwind utility classes on the composing Section's own layout (§3.5's Section-composes-Composite pattern) — never as a `useState`/`useEffect`-driven viewport check inside the Card component itself branching its own rendering, which would violate both this subsection's CSS-native-mechanism rule and §4.3's Ephemeral-UI-State-must-be-genuinely-meaningful-to-that-component's-own-rendering test (a Card does not need to *know* it is in a 1-column versus 3-column grid; it renders identically regardless, with the grid arrangement being its parent Section's responsibility, not its own).

### 8.7 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms every `variant`/`size`-equivalent prop is typed against a closed union matching Phase 4 §28's token vocabulary exactly, with no `string`-typed styling-selection prop reaching compilation.

**Behavioral Verification (§7.4):** Confirms no component's compiled output contains a hardcoded color, spacing, or dimension value outside the Tailwind-utility/CSS-custom-property mechanism — an automated lint or build-time scan (extending Phase 6 §21.2's build-time-gate precedent into the component-styling domain) flags any inline `style` attribute or non-token class name as a contract violation.

**Operational Verification (§7.5):** Extends Checklist D (§7.5) with one additional item specific to this section:
- [ ] Confirm every visual property in the new/modified component's implementation traces to a named Phase 4 §28 token, with no literal value present anywhere in the component's styling

### 8.8 Section Resolution Summary

Section 8 has established the deterministic token-consumption discipline governing every component's visual implementation:

- Every component consumes design tokens exclusively through Phase 4 §29's Tailwind utility-class mapping, resolving to CSS custom properties, with no inline styles, component-local CSS, or style-override escape-hatch props permitted (§8.2).
- Every visual property traces to a named Phase 4 §28 token; variant-selection props are always closed unions of pre-approved options, never open strings; and semantic state-color tokens are never repurposed for decorative use (§8.3).
- Dark-mode readiness is achieved automatically by conformance to §8.2–8.3's discipline, with no component permitted to introduce its own light/dark conditional logic or to decouple shadow tokens from their paired surface tokens (§8.4).
- Theme and multi-brand readiness are likewise achieved automatically through semantic (never literal-value) token referencing, with no component encoding brand-specific value assumptions (§8.5).
- Responsive variation is expressed exclusively through Tailwind's CSS-native responsive-prefix mechanism against the already-frozen breakpoint tokens, never through client-side viewport-detection logic or component-internal responsive state (§8.6).
- Verification extends the three-category taxonomy from Section 7, with a dedicated build-time scan for hardcoded, non-token values and an added Checklist D item confirming full token traceability (§8.7).

Every component contract specified in prior and subsequent sections is now bound by this token-consumption discipline as a non-optional part of its complete engineering specification.

**End of Section 8 — Design Token & Theming Consumption Architecture.**

Ready to continue with Section 9.

Phases 1–6 and Phase 7 Sections 1–9 remain frozen and immutable. Continuing with Section 10.

---

# 10. Content-to-Component Mapping Registry

### 10.1 Purpose and Scope of This Section

Sections 2 through 9 have each specified a *rule system* governing how any component's contract is constructed, composed, verified, themed, and instrumented — but no section has yet produced a single, consolidated inventory confirming that every one of Phase 5B §3's seventeen content entities actually has a complete, gap-free set of rendering components satisfying those rules. Section 10 closes this gap: it is the registry against which the abstract rule systems of Sections 2–9 are checked for **completeness of coverage**, not merely correctness of individual contracts.

**Governing Constraint:** Consistent with Section 1.2's scope boundary (the complete Phase 4 §26 Component Inventory, no more, no less) and Section 1.8's closed-set extensibility discipline, this registry introduces no new component and no new content entity — it is a cross-reference table, not a specification of new behavior, closing the traceability loop between Phase 5B's domain layer and Phase 7's component layer exactly as Phase 6 §9.4's Entity Relationships table closed the analogous loop between domain data and structured-data output.

### 10.2 Registry Construction Methodology

**Two-Axis Registry, Consistent With This Document's Established Table Conventions:** The registry is built as two complementary tables rather than one, mirroring the distinction Section 1.6 already drew between component *tier* and page-level *composition*:

1. **Entity → Component Registry (§10.3):** For each of Phase 5B §3's seventeen content entities, which Composite-tier component(s) render a projection of it, and at which tier that rendering occurs.
2. **Page Template → Section Registry (§10.4):** For each page template already established in UX Phase 3 §5–10's Scroll Journey specifications, which Compositional/Section-tier components are composed, in sequence, per Section 3.5's Section-composes-Composite pattern.

**Derivation Discipline Applied to the Registry Itself:** Consistent with §2.2's derivation-not-invention principle, every row in both tables traces to an already-frozen source — Phase 5B §3's entity list, Phase 4 §26's Component Inventory, or UX Phase 3 §5–10's Scroll Journey step sequences — never a new component or page region invented for the registry's own convenience.

### 10.3 Entity → Component Registry

| Phase 5B §3 Entity | Primary Rendering Component | Tier (§1.6) | Card/List Variant Component | Reference |
|---|---|---|---|---|
| Service (§3.1) | Service pillar page composition (Section-tier assembly, §3.5) | Compositional | `ServiceCard` | §2.2, §9.3 (`CTA` sourcing) |
| Industry (§3.2) | Industry page composition | Compositional | `IndustryCard` | §2.2 |
| Location (§3.3) | Location page composition | Compositional | Not independently carded — Locations are navigated via the `/locations` hub's own list rendering, not a reusable Card variant, consistent with the hub-not-paginated ruling already established (Phase 6 §17.2) | §2.2, §4.5 (URL State for hub filtering) |
| Blog Post (§3.4) | Blog post page composition | Compositional | `BlogCard` | §2.2, §6.2 (`BlogCardSkeleton`) |
| Blog Category (§3.5) | Category index page composition | Compositional | Rendered as a Badge/Tag (§8.3), not a Card — a taxonomy label, not an independently-carded entity | §8.3 |
| Blog Tag (§3.6) | Tag index page composition | Compositional | Rendered as a Tag (§8.3, Design System §15) | §8.3 |
| Author (§3.7) | Not independently page-routed (no standalone Author page, per IA Phase 2) | — | `AuthorByline` (Compact/Full variants, §5.10 restating Design System §26.14) | §2.2, §9.4 (no Wrapper — non-interactive) |
| FAQ Item (§3.8) | Not independently page-routed | — | `FAQAccordion` item (Client-tier, §1.7) | §4.3, §5.4, §5.5 |
| Case Study (§3.9) | Case Study page composition | Compositional | `CaseStudyCard` | §2.2, §9.5 (Testimonial `Review` composition) |
| Testimonial (§3.10) | Not independently page-routed | — | `TestimonialCard` (Server static / Client carousel split, §1.7) | §1.7, §5.8 (motion fallback) |
| Team Member (§3.11) | `/about/team` page composition | Compositional | `TeamMemberCard` | §2.2 |
| Navigation (§3.12) | Header composition (layout-level, §3.2) | Structural | — (singleton, no list variant) | §2.5, §3.2 |
| Footer (§3.13) | Footer composition (layout-level, §3.2) | Structural | — (singleton) | §2.5, §3.2 |
| CTA (§3.14) | `CTABand`, Hero's action props | Compositional (Band) / props-only (Hero) | — (not independently carded; consumed as props, §9.3) | §9.2, §9.3 |
| Site Settings (§3.15) | Consumed as props across Header, Footer, `Organization` schema (Phase 6 §3.3) — never independently rendered as a "page" | — | — | §2.2's Site Settings sourcing |
| SEO Metadata (§3.16) | Not component-rendered at all — resolved entirely at the Page-level `generateMetadata` boundary (Phase 6 §2.3), outside this system's component tree | N/A | N/A | Phase 6 §2.3 — explicit non-component boundary |
| Media Asset (§3.17) | Consumed as props by every image-bearing component (Card variants, Hero, Author Byline, Client Logo Bar) — never independently page-routed | — | Rendered via the shared Image primitive (§8.6's responsive-token consumption) | Phase 6 §14.2, §5.4 |

**Two Deliberate Non-Component Rows, Named Explicitly:** `SEO Metadata` and, to a lesser extent, `Site Settings` are the two entities in Phase 5B §3 with no dedicated rendering component at all — this is not a registry gap but a confirmed, correct absence: `SEOMetadata` is resolved exclusively at the `generateMetadata` boundary (Phase 6 §2.3), a Page-level, non-component mechanism entirely outside the composition chain (§3.2) this registry otherwise governs, and `Site Settings` is consumed exclusively as a props source feeding other components (Header, Footer, structured data) rather than ever being "rendered" as a standalone unit itself. Both are recorded here precisely so a future engineer does not mistake their absence from the component tree for an oversight.

### 10.4 Page Template → Section Registry

| Page Template (UX Phase 3 Reference) | Composed Sections, in Scroll Order | Governing Subsection |
|---|---|---|
| Homepage (Phase 3 §5) | Hero → Trust Bar (Client Logo Bar) → Services Overview (Card grid) → AEO/GEO Differentiation → Featured Case Study → Industry Relevance (Card grid) → Testimonials → Process Snapshot → Final CTA Band → (Footer, layout-level) | §3.5, §9.5 (two Wrapper instances for the Final CTA Band's dual actions) |
| Service Page (Phase 3 §6) | Hero → Problem Framing → Deliverables/Process → Proof (Case Study Card grid) → FAQ Accordion → Related Services (Card grid) → Final CTA Band | §3.5, §5.4 (FAQ Accordion's `aria-expanded` contract) |
| Blog Post (Phase 3 §7) | Title/Metadata (Author Byline) → Direct-Answer Block (Phase 6 §11.3) → Table of Contents (desktop) → Body (`RichContentBlock` rendering, Phase 5B §4.5) → Mid-Content CTA → Conclusion → End CTA Band → Related Posts (Card grid) | §6.2 (`BlogCardSkeleton` for the Related Posts grid's loading state) |
| Case Study (Phase 3 §8) | Hero (headline metric) → Challenge → Strategy → Results → Testimonial (Review composition) → Related Case Studies (Card grid) → Final CTA Band | §9.5 (Card-tier Wrapper instances distinct from Section-tier ones) |
| About Page (Phase 3 §9) | Hero (mission statement) → Story → Methodology Snapshot → Team Preview (Card grid) → Values/AEO-GEO Leadership → Trust Bar → Final CTA Band | §3.5 |
| Contact Page (Phase 3 §10) | Hero → Form (Client-tier) → Alternate Path Cards → Trust Reinforcement | §4.4 (Form State lifecycle), §1.7 |

**No Page Template Composes a Section Not Already Named in This Table:** Consistent with §1.8's closed-set extensibility discipline, a future page template requiring a Section arrangement not represented above must first be validated against Phase 3's own UX Journey specifications (the authoritative source for scroll order) before this registry is extended — this table is a *record* of what Phase 3 already established, never an independent source of new page-structure decisions.

### 10.5 Orphan/Gap Detection Rule

**The Registry's Primary Operational Value — a Two-Directional Completeness Check:** Consistent with Phase 6 §7.10's Orphan Page Sweep (checking every content page has sufficient inbound links) and Phase 6 §21.6's regression-prevention framing, this registry supports an equivalent two-directional check at the component layer:

1. **Entity-to-Component Completeness:** Every `PUBLISHED`-eligible entity type in Phase 5B §3 must resolve to at least one row in §10.3 — an entity type with no corresponding rendering component (excluding the two deliberate exceptions named in §10.3) indicates either a missing component contract (a gap in Sections 1–9's coverage) or a genuinely unused domain model (a Phase 5B question, out of this document's authority to resolve).
2. **Component-to-Entity Traceability:** Every Composite-tier component named across §10.3–10.4 must trace back to exactly one entity-derivation source (§2.2) — a Composite component appearing in this registry with no corresponding Phase 5B entity row is evidence of exactly the "invented prop shape" violation §2.2 and §7.5's Checklist D already exist to catch, now checkable via registry cross-reference rather than per-component inspection alone.

**This Rule Extends, Rather Than Duplicates, Section 7's Verification Taxonomy:** The completeness check above is classified as **Type-Level-adjacent** (§7.2) where it can be mechanically derived from the closed entity list and component inventory (both already enumerable sets), and **Operational** (§7.5) where it requires human confirmation that a given registry row's rendering component genuinely satisfies every rule established in Sections 2–9 — Section 10 does not introduce a fourth verification category beyond the three already closed in §7.2.

### 10.6 Registry Maintenance Governance

**Direct Extension of Phase 6 §21.9's Documentation Governance to This Registry Specifically:** Consistent with Phase 6 §21.9's "traceability table currency" obligation (already applied to Phase 6 §20.3/§20.5's report-mapping tables and Phase 6 §9.3's Primary Entity closed set), this registry is a living documentation artifact requiring active maintenance whenever Phase 5B's entity list, Phase 4's Component Inventory, or Phase 3's page-template set changes under a formally approved amendment (Phase 6 §21.9's amendment process) — it is not a one-time snapshot frozen independent of the systems it cross-references.

**Trigger Points for Registry Update, Extending Phase 6 §21.8's Checklist Pattern:** Consistent with Checklist A's "New Content-Type Introduction" trigger (Phase 6 §21.8) and Checklist D's "New or Modified Component Contract" trigger (§7.5), any event satisfying either of those two existing checklists **also** triggers a corresponding registry-row addition or amendment here — this is not a fifth checklist, but a shared consequence of the two already-established triggers, named explicitly so registry currency is not accidentally treated as a separate, unprompted obligation disconnected from the governance events that actually necessitate it.

### 10.7 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2, applied to the registry's own two completeness directions (§10.5):

**Type-Level Verification (§7.3):** Where entity and component lists are both enumerable, closed sets (Phase 5B §3's seventeen entities, Phase 4 §26's component inventory), a build-time script confirms every entity type appears in §10.3 and every Composite-tier component named in §10.3–10.4 resolves to a known entity source — a mechanical set-difference check, not requiring semantic judgment.

**Behavioral Verification (§7.4):** Confirms that a given registry row's stated component actually renders the projection §2.2 would predict for that entity — e.g., confirming `ServiceCard` genuinely receives a `Pick<Service, ...>`-shaped prop set rather than merely being labeled correctly in the registry without matching implementation.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new or modified entity/component pairing is reflected in §10.3 or §10.4 as applicable, per §10.6's trigger-point rule

### 10.8 Section Resolution Summary

Section 10 has established the consolidated registry closing the traceability loop between Phase 5B's domain layer and this document's component-contract rule systems:

- Two complementary registry tables — Entity-to-Component (§10.3) and Page-Template-to-Section (§10.4) — cross-reference every Phase 5B §3 entity and every UX Phase 3 page template against their governing components, with two entities (`SEOMetadata`, `Site Settings`) explicitly and correctly recorded as non-component-rendered.
- A two-directional Orphan/Gap Detection Rule confirms every entity has rendering coverage and every registered component has a valid entity-derivation source, extending rather than duplicating Section 7's verification taxonomy (§10.5).
- Registry currency is governed as a shared consequence of the two content-type and component-contract change triggers already established in Phase 6 §21.8 and Section 7.5, not an independent maintenance obligation (§10.6).
- Validation extends the three-category taxonomy from Section 7, applied specifically to the registry's completeness claims (§10.7).

This registry is now the authoritative cross-reference confirming Sections 1 through 9's rule systems achieve full, gap-free coverage across every content entity and page template this project has approved since Phase 1.

**End of Section 10 — Content-to-Component Mapping Registry.**

Ready to continue with Section 11.

Phases 1–6 and Phase 7 Sections 1–10 remain frozen and immutable. Continuing with Section 11.

---

# 11. SEO & Structured Data Component Integration Architecture

### 11.1 Purpose and Scope of This Section

Section 10.3's registry recorded `SEO Metadata` as explicitly non-component-rendered, resolved entirely at the Page-level `generateMetadata` boundary (Phase 6 §2.3). This leaves one distinct, unresolved question Section 10 deliberately did not answer: **structured data (JSON-LD, Phase 6 §3) is not a `SEOMetadata` field** — it is a graph constructed from resolved entity relationships (Phase 6 §3.1, §3.11) — so does it follow the same non-component, Page-level-only path, or does some part of its construction properly belong to the component tree Sections 1–10 have specified? Section 11 answers this precisely, and additionally specifies the component-layer contracts for the three other SEO-adjacent rendering concerns Phase 6 assigned to markup but Sections 1–10 have not yet fully closed: breadcrumb data-sourcing, image alt-text/dimension propagation, and anchor-text fidelity.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new structured-data schema, no new metadata field, and no new SEO rule — every contract specified here traces to an already-frozen Phase 6 mechanism. Section 11's sole contribution is assigning **component-layer ownership and props-flow** to mechanisms Phase 6 specified at the artifact level without addressing how a componentized rendering tree produces them.

### 11.2 JSON-LD Emission Ownership

**Resolution — Page-Level Emission, Identical in Principle to `SEOMetadata`'s Boundary, But Not Identical in Mechanism:** Consistent with Phase 6 §3.12's Rendering Flow diagram ("Nodes assembled into a single `@graph` array... Serialized into a single `<script type="application/ld+json">` block, injected into the page's `<head>`"), JSON-LD construction and emission occurs entirely within the Page's own `generateMetadata`-adjacent resolution step (Phase 6 §2.3's `lib/seo/` module), **not** within the Server Component tree Sections 1–10 govern. This is the same non-component boundary already established for `SEOMetadata` in §10.3, restated here as applying identically to structured data — a component in this system's inventory never renders its own `<script type="application/ld+json">` tag, regardless of tier.

**Why This Differs From, and Is Stricter Than, the Ordinary Server-Component Rendering Path:** Unlike `SEOMetadata`, which resolves from a single entity's own `seo` field (Phase 5B §3.16) with no cross-component assembly required, a JSON-LD graph (Phase 6 §3.1) assembles nodes from **multiple, already-resolved relationship arrays** — the same `resolveMany()`-produced Case Study, Testimonial, and FAQ Item arrays that also flow into the ordinary component tree as props (§3.3). Section 11.2's rule is that this **shared upstream data** feeds two genuinely separate downstream consumers — the `lib/seo/` structured-data builder (Phase 6 §3.12, non-component) and the ordinary composition chain (§3.2, component-based) — from the identical Content Service call (§3.3's single-fetch principle), never requiring the component tree to somehow supply data *to* the JSON-LD builder or vice versa. The two consumers are siblings drawing from one source, not a pipeline where one depends on the other's output.

**No Component Queries or Reads the Constructed JSON-LD Graph:** Consistent with §2.9's ruling that component props are not a validation boundary, no component in this inventory accepts the assembled `@graph` object as a prop for any purpose (e.g., a hypothetical "debug view" rendering the graph's contents) — the graph's only consumer is the `<head>` injection point itself, and Section 11.2 closes off any future temptation to thread it through the component tree for convenience, which would violate the single-consumer-per-artifact discipline this document has maintained since Phase 6 §3.1.

### 11.3 Breadcrumb Component Data-Sourcing Contract

**Restates Phase 6 §8.6's Resolution Steps, Given Their Component-Props Consequence:** Phase 6 §8.6 already established that breadcrumb trail computation happens once, upstream of both the visible component and the `BreadcrumbList` JSON-LD builder ("single computation, multiple renderings," Phase 6 §8.1), passing the identical trail array to both consumers. Section 11.3 confirms the **Breadcrumb component's own props contract** (§1.6's Structural tier) is exactly that already-computed `{ label, href }[]` array (Phase 6 §8.5's stated input shape) — the Breadcrumb component never receives raw entity data and computes its own trail internally, which would violate §2.2's derivation discipline by having the component perform routing/hierarchy logic that Section 8's Phase-6-level resolution already owns.

**The Breadcrumb Component Is the Second of Two Siblings Consuming the Same Trail, Mirroring §11.2's JSON-LD Pattern:** Exactly as §11.2 established that the JSON-LD builder and the component tree are sibling consumers of shared upstream data, the visible Breadcrumb component (rendering the trail as navigable UI, per §5.3's `<nav aria-label="breadcrumb">` semantic mapping) and the `BreadcrumbList` node (rendered via §11.2's Page-level, non-component path) are sibling consumers of the identical trail array — the Breadcrumb component does not construct, alter, or feed data into the JSON-LD node in any direction; both simply receive the same already-resolved array from the Page's own resolution step (Phase 6 §8.6).

**`aria-current="page"` Derivation Confirmed as a Props-Level, Not Component-Internal, Computation:** Restating §5.4's rule that "an `aria-current='page'` value is always derived from the same breadcrumb-trail array... never independently determined by the Breadcrumb component itself," Section 11.3 confirms the mechanism: the trail array's final element (per Phase 6 §8.4, the current page, carrying no `href`) is what the Breadcrumb component's own rendering logic uses to apply `aria-current="page"` — a simple "is this the last array item" check against already-received props, never a separate URL-comparison or routing-context lookup performed by the component itself.

### 11.4 Image Component Alt-Text and Dimension Propagation Contract

**Restates Phase 6 §14.2–14.3's `MediaAsset` Field Mandates, Given Their Shared-Image-Primitive Consequence:** Section 10.3's registry already noted that every image-bearing component (Card variants, Hero, Author Byline, Client Logo Bar) consumes images "via the shared Image primitive." Section 11.4 specifies that primitive's complete props contract: a single, Primitive-tier `Image` component (§1.6) whose props are the exact `MediaAsset` fields already mandated at the domain layer — `url`, `altText` (required, no exception, per Phase 5B §3.17 and restated Phase 6 §14.3), `width`, `height` (both required for CLS prevention, Phase 6 §13.5) — derived via §2.2's projection mechanism with **zero narrowing permitted on `altText`, `width`, or `height`** specifically, since Section 2.4's narrowing-permitted-but-widening-never rule means a component may make an already-optional field required but can never relax a field the domain layer has already made unconditionally required.

**One Image Primitive, Consumed by Every Higher-Tier Component — No Component Re-Implements Image Rendering:** Consistent with Section 1.5's Governing Principle 5 (No Duplication Across Component Categories), every Composite or Compositional component displaying an image (`ServiceCard`'s icon, `CaseStudyCard`'s `featuredImage`, `TeamMemberCard`'s `photo`) composes the single shared `Image` primitive internally (§3.5's Composite-composes-Primitive pattern) rather than each independently implementing `next/image`-consuming logic — this is the component-layer enforcement mechanism ensuring Phase 6 §13.5's format-negotiation, blur-placeholder, and `priority`-governance rules apply uniformly, since they are implemented exactly once, in this one Primitive, never redundantly per Composite.

**The `priority` Prop Is Page-Assigned, Never Component-Default:** Restating Phase 6 §13.5's "no page may mark more than one image `priority`-loaded" rule and Phase 6 §13.10's build-time enforcement of it, the `Image` primitive's `priority` prop defaults to `false` and is never set internally by any Composite component — it is explicitly threaded down from the Page level (§3.3's data-flow discipline) to the single instance genuinely representing that page's largest above-the-fold element (typically a Hero's image), meaning a `ServiceCard`'s internal `Image` usage, for example, never independently decides to mark itself `priority` regardless of its own visual size within its grid, since only the Page has the cross-Section visibility needed to know which single image genuinely qualifies.

**`focalPoint` Propagation, Extending Phase 6 §14.5:** Where a `MediaAsset.focalPoint` value is present (Phase 5B §3.17, Phase 6 §14.5), it flows into the `Image` primitive's props identically to every other `MediaAsset` field — the primitive applies it to whichever aspect-ratio-cropping behavior the Design System's `ratio-square`/`ratio-card`/`ratio-wide` tokens (Phase 4 §10, §8.6 of this document) dictate for its current composing context, with no Composite-tier component needing its own cropping logic, consistent with the single-implementation-point discipline stated above.

### 11.5 Anchor Text Fidelity Contract

**Restates §2.10's Cross-Component Consistency Rule, Given Its Full Structural-Link Mechanism:** Section 2.10 already established that "shared content-projection fields must use identical prop names across every component consuming them," directly citing Phase 6 §7.9's anchor-text-equals-entity-name rule as its motivating example. Section 11.5 completes this by specifying the actual rendering mechanism: every Composite-tier component whose root element is a wrapping `<a>` (§5.3's Card semantic mapping) renders that link's accessible text — whether via visible text content or an `aria-label` where the visible content is otherwise non-textual — using the **identical `name`/`title` prop value** already flowing into that same component for its own heading/label display (§2.3's "never renamed" rule), with no separate "anchor text" prop ever introduced on any Card-tier component's contract.

**This Is a Structural Guarantee, Not a Convention Requiring Separate Verification Discipline:** Because a Card component's contract (per §2.2's derivation and §2.3's naming rules) has exactly one `name`/`title`-equivalent prop, and that same prop is what both the visible heading and the wrapping anchor's accessible name are sourced from, there is no code path by which a Card's displayed title and its anchor text could diverge — this mirrors exactly the reasoning Phase 6 §8.4 already established for breadcrumb-label/entity-name parity ("structurally guaranteed by construction... functions as a regression guard against an implementation bug... not as a check against two independently-computed sources ever legitimately disagreeing"), now confirmed as holding identically for Card-tier anchor text.

**Contextual (In-Prose) Link Text Remains Outside Component-Contract Scope:** Consistent with Phase 6 §7.5's distinction between structural and contextual links, in-prose anchor text embedded within a `RichContentBlock`'s `paragraph` type (Phase 5B §4.5) is authored content flowing through the ordinary body-rendering path, not a Card-tier component's own contract — Section 11.5's guarantee applies specifically and only to the structural, entity-title-sourced anchor text governed by §5.3's Card semantic mapping, not to editorially-authored contextual links, which remain governed entirely by Phase 6 §7.5/§7.10's already-established build-time validation.

### 11.6 FAQ Accordion / FAQPage Schema Alignment Contract

**Restates Phase 6 §3.9's Two-Context `FAQPage` Emission, Given Its Component-Rendering Consequence:** The `FAQAccordion` component (§1.7's Client-tier classification, §5.4–5.5's ARIA/keyboard contracts) renders the identical `FAQItem[]` array (Phase 5B §3.8) that separately feeds the `FAQPage` JSON-LD node construction (Phase 6 §3.9, resolved per §11.2's non-component path) — exactly the same sibling-consumer pattern already established in §11.2 and §11.3, now confirmed as the general pattern governing every case where a visible component and a structured-data node draw from the same relationship array.

**The Accordion's `answer` Rendering Must Not Diverge From the Schema's `acceptedAnswer.text`:** Because Phase 5B §3.8's `answer` field is already validated as "concise, plain/lightly-formatted text" specifically to match `FAQPage` schema expectations (Phase 6 §3.9, §11.5 of that phase), the `FAQAccordion` component renders that field's value directly and unmodified — no client-side truncation, no "read more" partial-reveal pattern applied to the answer text itself (distinct from the accordion's own expand/collapse of the entire question-answer pair, §4.3's Ephemeral UI State) — ensuring the visible answer a user reads upon expanding an item is byte-for-byte the same text a search engine's `FAQPage` rich-result would display, consistent with Phase 6 §1.1's "human-first, crawler-friendly" governing test applied here at the component-rendering level.

### 11.7 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms the `Image` primitive's props type never permits `altText`, `width`, or `height` as optional (§11.4's no-narrowing-permitted rule); confirms the Breadcrumb component's props type matches Phase 6 §8.5's `{ label, href }[]` shape exactly, accepting no raw entity data.

**Behavioral Verification (§7.4):** Confirms no component in the inventory renders a `<script type="application/ld+json">` tag (§11.2's exclusive Page-level ownership); confirms a Card component's rendered anchor accessible-name matches its rendered heading text at runtime (§11.5); confirms the `FAQAccordion`'s rendered answer text matches the source `FAQItem.answer` field verbatim (§11.6).

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new image-bearing or entity-title-bearing component composes the shared `Image` primitive (§11.4) and sources its anchor text from the identical prop used for its own visible heading (§11.5), rather than introducing parallel implementations of either concern

### 11.8 Section Resolution Summary

Section 11 has established the component-layer contracts closing the remaining gap between Phase 6's artifact-level SEO architecture and this document's component tree:

- JSON-LD construction and emission occurs exclusively at the Page level, outside the component tree entirely, drawing from the same upstream relationship data the component tree also consumes as a sibling, never a dependent, consumer (§11.2).
- The Breadcrumb component's props are the already-computed trail array from Phase 6 §8.6, with `aria-current` derived as a simple props-level check, never independently computed routing logic (§11.3).
- Every image-bearing component composes a single, shared `Image` primitive whose props admit no narrowing on `altText`/`width`/`height`, with `priority` assigned exclusively at the Page level (§11.4).
- Structural anchor text is structurally guaranteed identical to a Card's own displayed title by virtue of both sourcing from the same single prop — never a separately-verified convention (§11.5).
- The `FAQAccordion` and the `FAQPage` JSON-LD node are confirmed as sibling consumers of the identical `FAQItem` data, with the Accordion rendering the `answer` field unmodified and unTruncated (§11.6).

Every component contract specified across Sections 1 through 10 is now confirmed compatible with, and non-duplicative of, the complete SEO/AEO/GEO architecture frozen in Phase 6.

**End of Section 11 — SEO & Structured Data Component Integration Architecture.**

Ready to continue with Section 12.

Phases 1–6 and Phase 7 Sections 1–11 remain frozen and immutable. Continuing with Section 12.

---

# 12. Form Field Primitive Component Architecture

### 12.1 Purpose and Scope of This Section

Section 4.4 specified the Form component's complete three-phase state lifecycle (Input Capture → Submission Pending → Resolved Result) and its integration with Phase 5B §7's Server Actions Architecture, but deliberately treated "Form" as a single, undifferentiated Client-tier component. Design System Phase 4 §12 separately specified the visual and interaction rules for six distinct field primitives — Input, Select, Textarea, Checkbox, Radio, Switch — but did so at the design-token and interaction-state level, without a props contract, validation-integration point, or accessibility-derivation rule of the kind Sections 2 and 5 established for every other Primitive in this system's inventory. Section 12 closes this specific gap: it is where Phase 4 §12's six field primitives receive the same engineering-contract treatment already given to every other component category.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new field type, no new validation rule, and no new visual state beyond what Design System Phase 4 §12 and Phase 5B §5/§7 have already established. Section 12's sole contribution is the props-contract and composition specification connecting those two already-frozen sources at the individual-field level.

### 12.2 Field Primitive Tier Classification and Closed Inventory

**Restates Section 1.6's Primitive-Tier Definition, Applied to the Six-Member Closed Set:** Every field primitive named in Design System Phase 4 §12 — Input, Select, Textarea, Checkbox, Radio, Switch — is classified as **Primitive** tier (§1.6): each is a self-contained, content-domain-agnostic unit whose props derive exclusively from Design System token unions and generic field-state concerns (§2.2's second and third derivation sources), never from a Phase 5B content entity, since form fields represent *user-supplied* data, not resolved domain content.

**Closed-Set Discipline, Restated From §1.8:** This is the complete, closed inventory — no seventh field primitive exists in this system's approved scope. A future form requiring a field type not among these six (e.g., a date picker, a file upload) is out of Phase 7's current authority to introduce and would require a Phase 4 amendment (Phase 6 §21.9's governance process) before a corresponding Section 12-style contract could be specified for it.

**Server/Client Classification, Restated From §1.7:** All six field primitives are **Client**-tier, inheriting this classification directly from the Form component's own already-established Client-tier status (§1.7's table) — a field primitive never renders independent of the Form that composes it, and therefore never has its own separate Server/Client boundary decision to make; it is always a child within an already-Client-rendered subtree.

### 12.3 Field Primitive Props Contract

**Shared Base Contract, Consistent With §2.2's Derivation Discipline:** Every field primitive's props contract derives from a common base shape — restating §2.3's naming convention (`name`, `value`, `onChange`, `label`, `helperText`, `errorText`, `isRequired`, `isDisabled`) — rather than each of the six primitives independently inventing its own naming for structurally identical concerns. This directly extends §2.10's cross-component prop-consistency rule ("shared prop names must carry identical semantic meaning everywhere they appear") to this closed six-member set specifically.

| Prop | Type | Required | Derivation Source (§2.2) | Cross-Reference |
|---|---|---|---|---|
| `name` | `string` | Required | Generic field-state concern (not a Phase 5B entity field) | Matches the eventual `FormData` field name consumed by the Server Action's Zod schema (Phase 5B §7.4) |
| `value` | `string` (Input, Select, Textarea) / `boolean` (Checkbox, Switch) / `string` (Radio, representing the selected option) | Required | Generic field-state concern | Owned as Ephemeral-adjacent Form State, §4.4's Phase 1 |
| `onChange` | `(value: [matching value type]) => void` | Required | Callback contract, §2.6 | Minimal, semantically-typed payload per §2.6's signature convention — never a raw DOM event |
| `label` | `string` | Required | Generic field-state concern | Never optional — restates Design System Phase 4 §12.1's "label always visible above field... never placeholder-only" rule as a compile-time-enforced required prop |
| `helperText` | `string \| null` | Optional | Generic field-state concern | Design System Phase 4 §12.1 |
| `errorText` | `string \| null` | Optional | Sourced from `ActionResult`'s `fieldErrors` map, §4.4's Phase 3 | Never independently authored by the field primitive itself |
| `isRequired` | `boolean` | Optional, defaults `false` | Generic field-state concern | Drives the visual required-indicator already governed by §5.9's non-color-dependent state communication |
| `isDisabled` | `boolean` | Optional, defaults `false` | Generic field-state concern | Maps to Design System Phase 4 §11.2's disabled-state token treatment (Button System's disabled pattern, extended here to fields) |

**Per-Primitive Extensions to the Base Contract:** Beyond the shared base above, each of the six primitives extends this contract with exactly the fields its own Design System §12 specification requires and no more — `Select` adds an `options: { label: string; value: string }[]` prop (matching Phase 4 §12.2's native-`<select>`-semantics rule); `Textarea` adds an optional `rows` prop bounded to a sensible default per Phase 4 §12.3; `Checkbox`/`Switch` share their `boolean` `value` type but remain visually and semantically distinct components (never collapsed into one component with a `variant` prop, since Phase 4 §12.4 and §12.6 assign them genuinely different interaction semantics — discrete on/off toggle for `Switch`, form-selection for `Checkbox`).

### 12.4 Validation State Integration Contract

**Direct Extension of Section 4.4's Three-Phase Form State Lifecycle to the Individual-Field Level:** Section 4.4 established that Form State's Phase 1 (Input Capture) is never validated against Phase 5B §5's schemas client-side, and that Phase 3 (Resolved Result) is a direct rendering of the already-validated `ActionResult` union. Section 12.4 specifies exactly how this two-phase reality reaches an individual field primitive's `errorText` prop: **a field primitive has no validation logic of its own** — its `errorText` prop is populated exclusively by the parent Form component extracting the relevant entry from `ActionResult`'s `fieldErrors` map (Phase 5B §7.5) by matching the field's own `name` prop as the lookup key, and passing that string down, or `null` where no error exists for that field.

**No Field Primitive Performs Format-Level Client-Side Validation Beyond Native HTML Semantics:** Consistent with §4.4's explicit ruling that "client-side format hints... are a UX nicety governed by Design System Phase 4 §12.7, not a validation boundary," a field primitive's `type` attribute (e.g., an `Input` rendering with `type="email"`) may invoke the browser's own native format affordance, but this is never treated as this system's validation mechanism — a field showing no native browser complaint is not thereby "valid" in this architecture's terms; only a returned `ActionResult` with no corresponding `fieldErrors` entry constitutes validation success, consistent with §2.9's ruling that component props (including native HTML attributes) are not a validation boundary.

**Visual Error State Is Driven Entirely by `errorText`'s Presence, Never by a Separate `hasError` Boolean:** Consistent with §4.7's derived-value prohibition ("derived data is recomputed from its authoritative source, never independently stored and synchronized"), a field primitive does not accept both an `errorText: string | null` prop and a redundant `hasError: boolean` prop — whether the field renders its error-state styling (Design System Phase 4 §12.7's border-color/icon treatment) is derived inline from `errorText !== null` at render time, never from a second, separately-passed boolean that could theoretically disagree with the text prop's own presence.

### 12.5 Accessibility Contract Per Field Primitive

**Direct Extension of Section 5.4's ARIA Table and Section 5.7's Announcement Strategy to the Field-Primitive Level:** Every field primitive implements the `aria-invalid`/`aria-describedby` pairing already specified in §5.4's table and §5.7's Form-validation-announcement paragraph, with the mechanism now made fully explicit at the individual-component level: `aria-invalid` is set to `"true"` whenever `errorText !== null` (the identical derivation rule from §12.4, applied here to an accessibility attribute rather than visual styling — one source, two consumers, consistent with the sibling-consumer pattern already established in §11.2–11.3 and §11.6), and `aria-describedby` references the `id` of the rendered `errorText` element, generated deterministically from the field's own `name` prop (e.g., `{name}-error`) rather than a randomly-generated or externally-supplied `id`.

**Label Association Is Structural, Not a Configurable Prop:** Consistent with Design System Phase 4 §12.1's "all form fields have associated labels (not placeholder-only labeling)" rule and Phase 4 §26's general accessibility mandate, every field primitive's `label` prop (§12.3) is rendered as a semantically-associated `<label>` element (via a matching `for`/`id` pairing, generated identically to the error-`id` pattern above) as a non-optional, structural part of the primitive's own implementation — there is no prop permitting a field to render without this association, consistent with §2.4's rule that a component may narrow (here, by making label-association unconditional rather than a toggleable option) but never widen past what accessibility governance already requires.

**Checkbox/Radio Touch-Target Sizing, Restating Design System Phase 4 §12.4/§12.5:** Consistent with Phase 4 §12.4–12.5's "20px visual, 44px effective tap target via padding" rule and Section 5's general 44×44px minimum (Phase 4 §16, restated Phase 4 §26), the `Checkbox` and `Radio` primitives' clickable region extends to their paired `<label>` text (Phase 4 §12.4's "label click toggles checkbox — larger effective hit area"), meaning the label-association rule above is not merely an accessibility-tree convenience but a required expansion of the interactive hit area itself.

**`Switch` Primitive's Distinct Semantic Role, Restated:** Consistent with Phase 4 §12.6 classifying `Switch` as governing "binary preference settings" rather than form-selection semantics, the `Switch` primitive's accessible role is a toggle switch (not a checkbox), meaning its ARIA contract (extending §5.4's table with this section's own addition) uses `role="switch"` with `aria-checked` rather than a native checkbox's implicit semantics — the two components share a `boolean` value type (§12.3) but are never accessibility-equivalent, consistent with §12.3's ruling that they remain distinct components precisely because Phase 4 already assigns them distinct semantics.

### 12.6 Field Primitive Composition Into the Form Component

**Restates Section 3.5's Composite-Composes-Primitive Pattern, Applied to Form Specifically:** The Form component (Client-tier, §1.7) composes field primitives following the identical pattern already governing every other Composite-tier component's internal Primitive assembly (§3.5) — the Form owns the overall field arrangement (single-column layout, per Design System Phase 4 §12's "all forms use single-column field layout" rule) and the aggregation of individual field values into the eventual `FormData` payload (Phase 5B §7.4); each field primitive owns only its own rendering and its own `onChange`-reported value.

**The Form Component, Not Individual Field Primitives, Owns the Idempotency Token:** Restating §4.4's ownership rule ("the idempotency token... is Ephemeral UI State owned by the Form component itself"), no field primitive is aware of or renders the idempotency token — it is a Form-level concern entirely, confirming that field primitives' scope is genuinely restricted to their own single field's value and validation state, never any cross-field or submission-mechanism concern.

**Honeypot Field Composition, Restating Phase 5B §7.4:** Where a Form's schema includes a honeypot field (Phase 5B §7.4's bot-protection mechanism, "a hidden field named to look plausible to bots, styled off-screen for humans"), that field is composed using the ordinary `Input` primitive (§12.3) with its visual presentation (off-screen positioning) achieved entirely through the token-bound styling discipline already established in Section 8 — never a separate, bespoke "HoneypotField" primitive, since introducing a seventh field-primitive type solely for this purpose would violate §12.2's closed-set discipline for no genuine interaction-semantics difference from an ordinary `Input`.

### 12.7 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms every field primitive's props type includes the complete shared base contract (§12.3) with correct required/optional marking, and that no field primitive's props include a redundant `hasError`-style boolean alongside `errorText` (§12.4's single-source-of-derivation rule).

**Behavioral Verification (§7.4):** Confirms `aria-invalid` and `aria-describedby` correctly reflect `errorText`'s presence at runtime (§12.5); confirms label-association (`for`/`id` pairing) is present on every rendered field instance without exception; confirms Checkbox/Radio's expanded click target genuinely includes the label region, not merely the visual control itself.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new form composition uses only the six closed-set field primitives (§12.2), with no bespoke field-rendering logic introduced outside this registry, and confirms `errorText` values are sourced exclusively from the Form's own `ActionResult.fieldErrors` map (§12.4) rather than independently computed

### 12.8 Section Resolution Summary

Section 12 has established the deterministic engineering contracts governing the six field primitives Design System Phase 4 §12 specified visually but this document had not yet given props-level treatment:

- Input, Select, Textarea, Checkbox, Radio, and Switch form a closed, six-member Primitive-tier, Client-tier inventory with no seventh member authorized without a Phase 4 amendment (§12.2).
- A shared base props contract — `name`, `value`, `onChange`, `label`, `helperText`, `errorText`, `isRequired`, `isDisabled` — governs all six, with per-primitive extensions limited to what each one's own Design System specification requires (§12.3).
- No field primitive performs its own validation; `errorText` is populated exclusively from the parent Form's `ActionResult.fieldErrors` map, and visual/ARIA error-state is derived from that single field, never a redundant parallel boolean (§12.4).
- Every field primitive implements a structurally non-optional label association and the `aria-invalid`/`aria-describedby` pairing, with Checkbox/Radio's expanded hit target and Switch's distinct `role="switch"` semantics restated as binding component-contract obligations (§12.5).
- Field primitives compose into the Form component following the same Composite-composes-Primitive pattern already governing every other component category, with the Form retaining exclusive ownership of idempotency-token and honeypot-field composition (§12.6).

Every Form-rendering component specified across Sections 1 through 11 is now fully specified down to its individual field-level implementation.

**End of Section 12 — Form Field Primitive Component Architecture.**

Ready to continue with Section 13.

Phases 1–6 and Phase 7 Sections 1–12 remain frozen and immutable. Continuing with Section 13.

---

# 13. Feedback & Overlay Component Architecture

### 13.1 Purpose and Scope of This Section

Section 1.6's Responsibility Model classified Alert, Modal, Drawer, and Toast Notification within the `components/feedback/` folder subdivision (Phase 5A §4) without giving any of the four a full props contract. Section 1.7 classified Modal, Drawer, and Toast as Client-tier and Section 5.6/5.8 specified their shared focus-trap and reduced-motion obligations, but — consistent with the treatment Form field primitives received only in Section 12, after Section 4's general Form State architecture — none of the four Feedback-tier components has yet received the individual props-contract, composition, and validation specification every other named component category in this system has now been given. Section 13 closes this gap, extending Section 12's precedent (a dedicated, closed-inventory deep-dive following general architecture already established) from Form fields to the Feedback/Overlay category.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new visual variant, no new interaction pattern, and no new accessibility rule beyond what Design System Phase 4 §16 (Alert), §17 (Modal), §18 (Drawer), and §23 (Toast) already established, and what Section 5 already specified for their shared focus/motion/live-region obligations. Section 13's sole contribution is the props-contract and composition specification connecting those already-frozen sources.

### 13.2 Tier Classification and Closed Inventory

**Closed, Four-Member Set:** Alert, Modal, Drawer, and Toast Notification form this system's complete Feedback-tier component inventory — no fifth member exists in the approved scope (Phase 4 §26's Component Inventory). Consistent with §1.8's extensibility discipline, a future feedback pattern not among these four requires a Phase 4 amendment before a corresponding contract could be added here.

| Component | Tier (§1.6) | Server/Client (§1.7) | Governing Design System Section |
|---|---|---|---|
| Alert | Composite | **Server** — static, inline, non-dismissible-by-default rendering requires no client interactivity unless a dismiss control is present (§13.3) | Phase 4 §16 |
| Modal | Compositional | **Client** — focus trap, per §5.6 | Phase 4 §17 |
| Drawer | Compositional | **Client** — focus trap, per §5.6 | Phase 4 §18 |
| Toast Notification | Composite | **Client** — Context-driven, per §4.6/§4.8 | Phase 4 §23 |

**Alert's Distinct Tier and Rendering Classification, Explained:** Unlike the other three, Alert is classified **Composite**, not Compositional — restating Phase 4 §16's own framing ("page-level or section-level messaging... not tied to a single form field") against Section 1.6's tier definitions, Alert is a reusable, domain-content-adjacent display unit (its message content is typically a short, page-context-specific string, not a full page-region assembly), placing it alongside Card and Testimonial Card rather than alongside Hero Section or CTA Band. Alert additionally defaults to **Server**-tier — a departure from the other three Feedback components — because Phase 4 §16 describes Alert as "contextual and inline within page flow," meaning most Alert instances (e.g., a static disclosure banner on a Case Study page) carry no interactivity at all; only where an Alert exposes a dismiss action does that specific instance require a narrowly-scoped Client-tier wrapper, following the identical split-component discipline already established in §1.7 for Header/Mega-Menu and Testimonial Card.

### 13.3 Alert Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | Required | Design System token union, Phase 4 §16 — reuses the identical semantic-color-family union already governing Toast (§13.6), never independently defined per component |
| `message` | `string` | Required | Generic field-state concern (page-authored content, not a Phase 5B entity projection) |
| `linkText` / `linkHref` | `string \| null` (paired) | Optional | Generic field-state concern — restates Phase 4 §16's "optional inline link action" |
| `isDismissible` | `boolean` | Optional, defaults `false` | Generic field-state concern — governs whether the Client-tier dismiss wrapper (§13.2) is composed at all |
| `onDismiss` | `() => void` | Required if `isDismissible` is `true`; absent otherwise | Callback contract, §2.6 — a conditionally-required prop, the one instance in this registry where required-ness depends on a sibling prop's value rather than being fixed, consistent with §2.4's narrowing-permitted-with-justification allowance |

**Icon Pairing Is Structural, Not Configurable:** Restating §5.9's non-color-dependent state-communication rule, Alert's `variant` prop deterministically selects its paired icon (Phase 4 §9's Icon System, inheriting `currentColor` per that system's established rule) — there is no independent `icon` override prop, since Design System Phase 4 §16 already fixes this pairing per variant, and exposing it as configurable would permit exactly the color-alone state communication §5.9 prohibits.

### 13.4 Modal Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `isOpen` | `boolean` | Required | Controlled-trigger state, §4.3's "controlled trigger, uncontrolled internals" pattern — sourced from whatever composed the Modal, never owned internally |
| `onClose` | `() => void` | Required | Callback contract, §2.6 — wired to the `Escape`/backdrop-click/close-control interactions already specified in §5.5–5.6 |
| `titleId` / `title` | `string` (paired) | Required | Generic field-state concern — feeds the `aria-labelledby` obligation already established in §5.4's table |
| `children` | `ReactNode` | Required | Composition slot, §2.5 — Modal's body content is supplied entirely via `children`, never a set of named content props, consistent with §2.5's "children is the default, single composition slot" rule, since Modal's content varies by consuming context far more than it varies by a fixed, enumerable set of regions |
| `size` | `'sm' \| 'md' \| 'lg'` | Optional, defaults per Design System Phase 4 §17's responsive sizing rule | Design System token union |

**Focus-Trap and Restoration Behavior Requires No Props — It Is Internally Owned Per §5.6:** Consistent with §5.6's explicit ownership rule ("the triggering element's identity is captured by the focus-trapping component itself... never passed in as an external prop"), Modal's props contract contains no field representing the pre-open focus target — this is deliberately absent, not an oversight, since §5.6 already assigned this responsibility internally.

**Modal Never Accepts a `zIndex`-Style Layering Prop:** Consistent with §8.3's token-binding discipline ("every visual property traces to a named token"), Modal's stacking/elevation behavior is governed entirely by the `shadow-xl` and scrim treatment already fixed in Design System Phase 4 §17, with no component-level override permitted — a consuming context cannot request a Modal render above or below its Design-System-defined layer, since doing so would reintroduce exactly the style-override escape hatch §8.2 already prohibits.

### 13.5 Drawer Component Props Contract

**Shares Modal's Base Contract Shape, With One Structural Addition:** Consistent with §12.3's precedent (a shared base contract across a closed-set family, with per-member extensions), Drawer's props contract is identical to Modal's (§13.4) — `isOpen`, `onClose`, `titleId`/`title`, `children` — with one addition reflecting Phase 4 §18's distinguishing property:

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `edge` | `'left' \| 'right'` | Required | Design System token union, Phase 4 §18 — governs the slide-in direction; Drawer has no `size` prop equivalent to Modal's, since Phase 4 §18 fixes width per breakpoint tier (360–400px tablet+, full-width mobile) rather than exposing a configurable size scale |

**Modal and Drawer Remain Two Distinct Components, Never Unified Behind a Single `variant` Prop:** Restating Phase 4 §18's own governing distinction ("Drawer is edge-anchored and directional... Modal is centered and self-contained... this distinction must be preserved — they are not interchangeable patterns"), Section 13.5 confirms this at the props-contract level: despite their near-identical base shape, collapsing them into one component with a `variant: 'modal' | 'drawer'` prop would violate §12.3's precedent that visually-and-semantically-distinct patterns (there, Checkbox vs. Switch) remain separate components even when their underlying value types coincide.

### 13.6 Toast Notification Component Props Contract

**Direct Integration Point With the Context Established in §4.6 and §4.8:** Unlike Alert, Modal, and Drawer — each instantiated directly by whatever component composes them (§3.5's ordinary composition pattern) — Toast is never directly instantiated with props by a consuming component at all. Consistent with §4.6's ruling that the Toast queue is exposed via "a narrow, purpose-built interface (an 'enqueue toast' function and the current queue)," the props contract governing an individual rendered Toast instance is **internal** to the Toast rendering surface itself (the single component subscribed to the Context's queue, per §4.8 Rule 2), never exposed to arbitrary call sites:

| Field (Enqueue-Function Parameter, Not a Component Prop) | Type | Required |
|---|---|---|
| `variant` | `'success' \| 'error' \| 'info'` | Required — reuses the identical semantic-color-family union governing Alert (§13.3), restricted to three (not four) members per Phase 4 §23's own narrower variant set, omitting `warning` |
| `message` | `string` | Required |
| `durationMs` | `number` | Optional — where supplied, must satisfy §5.7's content-length-aware minimum-duration floor; where omitted, the rendering surface computes it from `message` length per that same rule |

**The Enqueue Function, Not a Props Interface, Is What Sections 9's Instrumented Action Wrapper or a Form Component's Success Branch Actually Calls:** Consistent with §9.4's distinction between Form-originating events (already Client-tier, calling `trackEvent()` directly) and CTA-originating events (requiring the Wrapper bridge), a Form component's `ActionResult`-driven success state (§4.4's Phase 3, e.g., Newsletter signup confirmation per UX Phase 3 §21) calls the Context's enqueue function directly — since Form is already Client-tier, no additional bridging component is required here, distinguishing this call pattern from the Server-tier CTA case §9.2 specifically exists to resolve.

### 13.7 Shared Overlay Behavior Contract

**Consolidating What Modal, Drawer, and Toast Share, Given Their Individually-Specified Contracts Above:** Rather than restating identical rules across §13.4–13.6, this subsection names the properties common to all three Client-tier Feedback components, extending §5.6's already-established focus-trap lifecycle and §5.8's motion-fallback table with their shared props-level consequence:

1. **Scrim/Backdrop Ownership (Modal and Drawer Only, Not Toast):** Consistent with Phase 4 §17–18's scrim specification, the semi-transparent backdrop is rendered internally by Modal and Drawer themselves whenever `isOpen` is `true` — it is never a separately composed sibling component a consuming context must remember to include, preventing the "forgot to render the scrim" class of implementation error.
2. **Portal Rendering, Assumed but Not a Prop:** Consistent with standard focus-trap and z-index-layering requirements already implied by §13.4's "no `zIndex` override" rule, Modal, Drawer, and Toast are each assumed to render via a DOM-portal mechanism placing their output outside the ordinary composition-chain DOM nesting (§3.2) — this is an implementation detail of *how* the Client-tier component achieves its fixed positioning, not a props-contract concern, and is noted here only to confirm it does not contradict §3.2's composition-chain rules, since portal rendering is an escape from DOM *nesting*, not from the *props-flow* discipline §3.3 governs, which remains fully intact regardless of where in the DOM tree the portaled output physically resides.
3. **Single Active Instance Per Category, Enforced by the Composing Context, Not the Component:** Consistent with §9.5's "no double-counting" precedent, this system does not architecturally prevent two Modals from being simultaneously open (a scenario Design System Phase 4 does not explicitly forbid), but the Toast queue (§4.6) is explicitly a *queue* — multiple Toasts may stack, per Design System Phase 4 §23's "stacks vertically if multiple toasts occur" rule — while Modal/Drawer's `isOpen` boolean props (§13.4–13.5) mean any given consuming Page/Section is responsible for not simultaneously setting two such props to `true`, a discipline enforced at the Behavioral Verification tier (§7.4) rather than the type level, since TypeScript cannot itself prevent two independent `isOpen` state values from coinciding.

### 13.8 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms Alert's `onDismiss` conditional-requirement (§13.3) is correctly modeled as a discriminated union rather than two independently-optional props that could be inconsistently supplied; confirms Modal and Drawer's shared base contract (§13.5) is genuinely identical in type shape, with only the named per-member extension differing.

**Behavioral Verification (§7.4):** Confirms the focus-trap lifecycle (§5.6) executes identically across Modal, Drawer, and the Search Overlay (already governed in §5.6, restated here as within this section's cross-check scope); confirms Toast's enqueue-to-render path correctly applies §5.7's content-length-aware minimum duration; confirms Alert's icon-to-variant pairing (§13.3) permits no divergent combination.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new Feedback-tier usage composes one of the four closed-inventory components (§13.2) rather than introducing bespoke inline messaging/overlay markup, and confirms Toast instances are triggered exclusively through the enqueue function (§13.6) rather than a locally-instantiated Toast component

### 13.9 Section Resolution Summary

Section 13 has established the deterministic engineering contracts governing the four Feedback-tier components Design System Phase 4 §16–18 and §23 specified visually but this document had not yet given props-level treatment:

- Alert, Modal, Drawer, and Toast form a closed, four-member Feedback inventory, with Alert uniquely classified Composite/Server-default (interactivity isolated to an optional dismiss wrapper) while Modal, Drawer, and Toast remain Compositional/Composite and Client-tier respectively (§13.2).
- Alert's props contract centers on a semantic `variant` union with structurally-fixed icon pairing and a conditionally-required `onDismiss` (§13.3).
- Modal's props contract follows the controlled-trigger pattern already established in §4.3, explicitly omitting any focus-restoration prop (owned internally per §5.6) and any layering override (owned by Design System tokens per §8.3) (§13.4).
- Drawer shares Modal's base contract with one addition (`edge`), remaining a structurally distinct component per Phase 4 §18's non-interchangeability rule despite the shape overlap (§13.5).
- Toast is never directly instantiated with props by a consuming component; its rendering surface subscribes to the single Context established in §4.6/§4.8, with Form-originating and CTA-originating triggers following the distinct call patterns already established in §9.4 (§13.6).
- Scrim ownership, portal-rendering assumptions, and single-active-instance discipline are consolidated as shared obligations across the three Client-tier members (§13.7).

Every Feedback-and-Overlay-rendering component specified across Sections 1 through 12 is now fully specified down to its individual props-contract level.

**End of Section 13 — Feedback & Overlay Component Architecture.**

Ready to continue with Section 14.

Phases 1–6 and Phase 7 Sections 1–13 remain frozen and immutable. Continuing with Section 14.

---

# 14. Navigation & Wayfinding Component Architecture

### 14.1 Purpose and Scope of This Section

Section 1.7's classification table assigned Server/Client status to Header, Mega Menu, Mobile Drawer, Footer, Breadcrumb, Search Overlay, and Table of Contents; Section 3.2 established Header and Footer's layout-level composition exception; Section 5.3–5.6 specified their shared semantic-element and focus-management obligations; Section 11.3 specified Breadcrumb's data-sourcing contract in full. What remains unspecified — consistent with the pattern Sections 12 and 13 established for Form field primitives and Feedback/Overlay components respectively — is a complete, closed-inventory props-and-composition contract for this system's Navigation & Wayfinding category as a whole. Section 14 provides that treatment, completing the third of this document's per-category deep-dive sections.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new navigational pattern, no new interaction behavior, and no new accessibility rule beyond what Design System Phase 4 §19, §26.1–26.3, §26.10, §26.13, and §26.15 already established, and what Sections 3, 5, and 11 have already specified for this category's shared and individual obligations. Section 14's sole contribution is the consolidated props-contract and composition specification connecting those already-frozen sources.

### 14.2 Tier Classification and Closed Inventory

**Closed, Seven-Member Set:** Header, Mega Menu, Mobile Drawer Navigation, Footer, Breadcrumb, Search Overlay, and Table of Contents form this system's complete Navigation & Wayfinding inventory — no eighth member exists in the approved scope (Phase 4 §26's Component Inventory, Phase 4 §19's Navigation System). Consistent with §1.8's extensibility discipline, a future navigational pattern not among these seven requires a Phase 4 amendment before a corresponding contract could be added here.

| Component | Tier (§1.6) | Server/Client (§1.7) | Composition Scope (§3.2) |
|---|---|---|---|
| Header (shell) | Structural | **Server** | Layout-level, once per marketing route group |
| Mega Menu | Structural (embedded within Header) | **Client** (interactivity only; link content is Server-sourced, per §1.7's split-component rule) | Composed exclusively within Header, never independently |
| Mobile Drawer Navigation | Structural (embedded within Header) | **Client** | Composed exclusively within Header, never independently |
| Footer | Structural | **Server** | Layout-level, once per marketing route group |
| Breadcrumb | Structural | **Server** | Per-page, Level 2+ pages only (Phase 6 §8.3) |
| Search Overlay | Composite | **Client** | Composed once within Header, globally accessible |
| Table of Contents | Composite | **Server** — jump-link navigation requires no client interactivity beyond native anchor behavior; only the desktop active-section-highlighting behavior (Phase 4 §26.15) requires a narrowly-scoped client island, following §1.7's split-component discipline | Composed within Blog Post / Service pillar page Sections (Phase 4 §26.15) |

**Table of Contents' Server-Default Classification, Explained:** Unlike Search Overlay (fully Client, since type-ahead interaction is its entire purpose), Table of Contents renders a static, jump-link list from already-resolved heading data (§14.7) with only its *active-section-highlighting* behavior requiring client-side scroll observation — this is the identical split-component pattern already applied to Header/Mega-Menu (§1.7) and Testimonial Card (§13's precedent), named here explicitly as its third recurring instance in this document.

### 14.3 Header Component Props Contract

**Restates §2.5's Structural/Singleton Composition Rule, Given Its Full Props Consequence:** Consistent with §2.5's ruling that "Structural/singleton components do not accept content-composition props at all," Header's entire content surface derives from the singleton `Navigation` entity (Phase 5B §3.12) and the singleton `CTA` entity referenced by `Navigation.primaryCTA` — its props contract is therefore minimal, since almost nothing about Header varies by consuming context:

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `navigation` | `Navigation` (Phase 5B §3.12) | Required | Content Domain Model — the singleton entity itself, not a projection, since Header is the sole consumer of this entity's complete shape |
| `isSticky` | `boolean` | Optional, defaults `true` | Generic field-state concern, restating Phase 4 §26.1's "sticky on scroll" default behavior as an overridable-in-principle, always-true-in-practice prop, since no page in the approved sitemap (IA Phase 2 §1) currently requires non-sticky Header behavior |
| `activeRoute` | `string` | Required | System-derived from the current request's own resolved pathname (Phase 5A §5.3), never editor-authored — used exclusively to drive the active-state indication already required by Section 5.9's non-color-dependent state communication rule (an active nav item is marked via `aria-current="page"` in addition to any color treatment, restating §5.4's pattern) |

**Mega Menu and Mobile Drawer Receive `navigation.primaryItems`, Never the Full `Navigation` Entity:** Consistent with §3.3's recursive-narrowing rule ("each intermediate tier is responsible for narrowing the data it received down to exactly what the next tier down needs"), Header passes only the relevant `NavItem[]` slice (Phase 5B §3.12's nested shape) into its composed Mega Menu and Mobile Drawer children — neither child component receives `navigation.primaryCTA` or any other Header-level field it does not itself render.

### 14.4 Mega Menu and Mobile Drawer Props Contract

**Shared Base Contract, Consistent With §12.3/§13.5's Precedent for Closely-Related Closed-Set Members:** Both components accept an identical base shape — `items: NavItem[]`, `isOpen: boolean`, `onOpenChange: (isOpen: boolean) => void` — following the controlled-trigger pattern already established in §4.3 and restated in §13.4 for Modal. The `isOpen` prop's *ownership*, however, differs meaningfully between the two, and this is where their contracts diverge:

| Component | `isOpen` Ownership Pattern | Focus-Trap Behavior (§5.6) |
|---|---|---|
| Mega Menu | Internally owned, hover/click-triggered Ephemeral UI State (§4.3) — Header composes the Mega Menu without itself tracking open state, since no other component needs visibility into which specific mega-menu panel is currently expanded | **Explicitly excluded**, restating §5.6's own named exception |
| Mobile Drawer | Controlled by Header (or a dedicated hamburger-trigger Primitive Button composed within Header), since the Drawer's open state must be coordinated with the trigger button's own `aria-expanded` value (§5.4's table) | **Included**, following the full three-phase lifecycle (§5.6) |

**Why This Divergence Is Consistent With, Not a Violation of, §4.3's "Controlled Trigger, Uncontrolled Internals" Pattern:** Mega Menu's hover-driven interaction model (Phase 4 §26.2) makes its open/close state genuinely ephemeral and internally sufficient — no external trigger button's `aria-expanded` needs to stay synchronized with it in the way Mobile Drawer's hamburger-icon trigger does — meaning Mega Menu correctly falls on the "uncontrolled internals" side of §4.3's distinction while Mobile Drawer, whose trigger is a separate, visually-distinct Primitive component, falls on the "controlled trigger" side, exactly as §4.3's original guidance anticipated without needing to enumerate this specific case explicitly at the time.

### 14.5 Footer Component Props Contract

**Restates §14.3's Minimal-Props Reasoning, Applied to the `Footer` Entity:**

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `footer` | `Footer` (Phase 5B §3.13) | Required | Content Domain Model — the singleton entity's complete shape, identical reasoning to Header's `navigation` prop (§14.3) |

**No Other Props Exist:** Consistent with §2.5's Structural/singleton rule, Footer accepts no `isSticky`, no `activeRoute`, and no content-composition slot of any kind — its rendering is entirely deterministic given the singleton `Footer` entity, with no per-page variation of any kind, restating IA Phase 2 §3's original design intent ("footer is a stable, predictable utility zone") as a props-contract-level guarantee rather than merely a content-governance one.

### 14.6 Breadcrumb Component Props Contract

**Restates and Completes §11.3's Data-Sourcing Contract With Its Full Props Table:** Section 11.3 already established that Breadcrumb's props are "exactly that already-computed `{ label, href }[]` array" — Section 14.6 states this as a complete, formal contract:

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `trail` | `{ label: string; href: string \| null }[]` | Required | System-derived, Phase 6 §8.6's resolution steps — never raw entity data, per §11.3's already-established rule |

**This Is the Simplest Props Contract in the Entire Navigation & Wayfinding Inventory:** A single, required prop with no optional fields, no variant union, and no callback — consistent with Breadcrumb's purely-presentational, purely-derived nature already established across Phase 6 §8 and §11.3, restated here only to confirm its contract requires no further elaboration beyond what those two prior specifications already provide.

### 14.7 Table of Contents Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `headings` | `{ id: string; level: 2 \| 3; text: string }[]` | Required | System-derived from the current page's own `RichContentBlock` array (Phase 5B §4.5) — auto-generated by extracting `heading` block entries, restating Design System Phase 4 §26.15's "auto-generated from page H2/H3 structure" rule as a props-contract-level derivation source, distinct from every other Composite in this system whose props derive directly from a stored Phase 5B field rather than a computed extraction over one |
| `activeHeadingId` | `string \| null` | Optional, Client-tier-only (§14.2's split-component note) | Ephemeral UI State (§4.3), owned by the narrowly-scoped client island governing scroll-position observation, never by the Server-rendered jump-link list itself |

**The `headings` Extraction Is Performed Once, Upstream, Not by the Component:** Consistent with §3.3's single-fetch principle and §11.2–11.3's sibling-consumer pattern, the extraction of `heading`-type blocks from a Blog Post or Service page's `body` (Phase 5B §4.5) occurs as part of that page's own Content Service resolution (Phase 5B §6.2) — the Table of Contents component itself never receives the full `RichContent` array and performs its own filtering; it receives the already-extracted, already-shaped `headings` array directly, consistent with §2.2's "minimum sufficient slice" derivation-narrowness rule.

**Level-3-Only Nesting, Restating Phase 6 §12.9's Heading-Sequence Discipline:** Because Phase 6 §12.9 already enforces that no `RichContentBlock` sequence contains a heading-level skip (no `h2` immediately followed by `h4`), the Table of Contents' `level: 2 | 3` type union is guaranteed complete against any valid page body — a `level: 4` heading, where it legitimately exists deeper within a page's content, is intentionally excluded from Table of Contents representation, consistent with Design System Phase 4 §26.15 scoping this component to top-level article structure (H2/H3) rather than every heading depth a page might contain.

### 14.8 Search Overlay Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `isOpen` | `boolean` | Required | Controlled-trigger state, §4.3 — identical pattern to Modal/Drawer (§13.4–13.5), since Search Overlay shares their `role="dialog"` classification (§5.3) |
| `onClose` | `() => void` | Required | Callback contract, §2.6 |
| `onSearch` | `(query: string) => Promise<SearchResult[]>` | Required | Callback contract wired to the server-side search endpoint (Phase 5B §8.4's Route Handler, Phase 6 §5.4's `robots.txt` disallow-exemption for this endpoint) — the Search Overlay component itself never issues the search request directly; it invokes this callback, consistent with §1.4's "components consume; they do not fetch" principle applied here to a search-execution boundary rather than an ordinary content fetch |
| `recentSearches` | `string[]` | Optional | Not persisted per §4.9's no-browser-storage rule — where present at all, sourced from within-session Ephemeral UI State only, never `localStorage`, meaning this prop's value resets on every full page load rather than surviving across visits |

**`onSearch`'s Return-Type Contract Confirms This Is the One Component Whose Data Arrives Genuinely at Interaction-Time, Not Page-Render-Time:** Distinct from every other component in this document's inventory, whose content-projection props are always already-resolved at the moment they receive them (§3.3's single-Page-level-fetch principle), Search Overlay's `onSearch` callback is the sole contract in this system permitting a **new** data fetch to originate from *within* the composition tree after initial render — this is not a violation of §1.4's fetch-prohibition, since the component still does not perform the fetch itself (it delegates via the callback prop to a boundary already established in Phase 5B §8.4), but it is named here explicitly as the one deliberate, structural exception to the "all data arrives via props from a single prior fetch" pattern governing every other component this document specifies.

**Zero-Result Handling, Restating Phase 6 §5's Empty-State Precedent:** Where `onSearch`'s resolved promise yields an empty array, Search Overlay renders the Empty State pattern already governed by Design System Phase 4 §21 and UX Phase 3 §19's "no results" scenario — Search Overlay does not define its own bespoke empty-state markup, consistent with §1.5's Governing Principle 5 (No Duplication Across Component Categories).

### 14.9 Composition Ownership Summary

**Consolidating This Section's Composition Relationships Against Section 3.2's Chain:** Header is the sole composing parent for Mega Menu, Mobile Drawer, and Search Overlay's trigger — all three are never independently composed by any Page or Section-tier component, since their existence is entirely a function of Header's own singleton, layout-level presence (§3.2). Footer and Breadcrumb, while both Structural, follow different composition patterns from each other: Footer is layout-level (composed once, identically to Header), while Breadcrumb is Page-level (composed per-page, conditionally, per Phase 6 §8.3's route-by-route inclusion table) — this distinction was already established in Sections 3.2 and 8, and Section 14.9 confirms no contract specified in this section alters it. Table of Contents is Section-tier-composed, appearing only within the specific Blog Post/Service-pillar Sections whose content genuinely warrants it (Design System Phase 4 §26.15), never layout-level.

### 14.10 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms Header and Footer's props types admit no content-composition slot of any kind (§14.3, §14.5); confirms Mega Menu and Mobile Drawer's `isOpen` ownership pattern (§14.4) is correctly reflected in their respective type signatures (internally-typed for Mega Menu, externally-controlled for Mobile Drawer); confirms Table of Contents' `level` union excludes any value beyond `2 | 3` (§14.7).

**Behavioral Verification (§7.4):** Confirms Mega Menu's non-trapping and Mobile Drawer's trapping focus behaviors (§14.4, restating §5.6) execute correctly and distinctly at runtime; confirms Search Overlay's zero-result state correctly renders the shared Empty State pattern rather than a bespoke fallback (§14.8); confirms Table of Contents' active-heading-highlighting client island correctly updates `activeHeadingId` on scroll without affecting the Server-rendered jump-link list's own markup.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new navigational element is composed exclusively within Header (for Mega Menu/Mobile Drawer/Search-Overlay-trigger-adjacent patterns) or at the appropriate Page/Section level (for Breadcrumb/Table-of-Contents-adjacent patterns), per §14.9's composition-ownership summary, rather than introducing a parallel, independently-composed navigational surface

### 14.11 Section Resolution Summary

Section 14 has established the deterministic engineering contracts governing the seven-member Navigation & Wayfinding inventory, completing this document's third closed-category deep-dive following Sections 12 (Form fields) and 13 (Feedback/Overlay):

- Header, Mega Menu, Mobile Drawer, Footer, Breadcrumb, Search Overlay, and Table of Contents form a closed, seven-member inventory with Table of Contents newly identified as this document's third instance of the split-component Server/Client pattern (§14.2).
- Header and Footer's props contracts are minimal by design, each accepting only their singleton domain entity and, for Header, a system-derived `activeRoute` — never content-composition slots (§14.3, §14.5).
- Mega Menu and Mobile Drawer share a base contract but diverge in `isOpen` ownership, correctly reflecting §4.3's controlled-trigger-versus-uncontrolled-internals distinction rather than contradicting it (§14.4).
- Breadcrumb's contract is confirmed as the simplest in this inventory, fully completing §11.3's earlier data-sourcing treatment (§14.6).
- Table of Contents' `headings` prop is derived via upstream extraction from `RichContentBlock` data rather than direct field projection — a distinct derivation pattern named explicitly as such — with its active-highlighting behavior isolated to a narrow client island (§14.7).
- Search Overlay's `onSearch` callback is identified as this system's one structural exception to the single-prior-fetch data pattern, delegating a genuinely interaction-time fetch through an already-established boundary rather than violating §1.4's fetch-prohibition (§14.8).
- Composition ownership across all seven components is consolidated and confirmed consistent with Section 3.2's existing composition-chain rules, introducing no new composition pattern (§14.9).

Every navigational and wayfinding component specified across Sections 1 through 13 is now fully specified down to its individual props-contract level.

**End of Section 14 — Navigation & Wayfinding Component Architecture.**

Ready to continue with Section 15.

Phases 1–6 and Phase 7 Sections 1–14 remain frozen and immutable. Continuing with Section 15.

---

# 15. Content Display Component Architecture

### 15.1 Purpose and Scope of This Section

Section 10.3's registry named `ServiceCard`, `IndustryCard`, `CaseStudyCard`, `BlogCard`, `TestimonialCard`, `TeamMemberCard`, `AuthorByline`, and the Client Logo Bar as the rendering components for the majority of Phase 5B §3's content entities, and Section 11.4–11.5 specified their shared Image-primitive and anchor-text-fidelity obligations — but, consistent with the gap Sections 12 through 14 closed for Form fields, Feedback/Overlay components, and Navigation/Wayfinding respectively, none of these Content Display components has yet received an individual props contract. Section 15 provides that treatment, completing the fourth of this document's per-category deep-dive sections, alongside the two remaining Composite-tier display units named in Design System Phase 4 §26 but not yet addressed anywhere in this document: Badge/Tag and Stat/Metric Callout.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new visual variant, card layout, or content field beyond what Design System Phase 4 §13–15 and §26.5–26.7/26.12/26.14 already established, and what Phase 5B §3's domain models already define. Section 15's sole contribution is the props-contract and composition specification connecting those already-frozen sources.

### 15.2 Tier Classification and Closed Inventory

**Closed, Eight-Member Set:** Card (in its five domain-specific variants: Service, Industry, Case Study, Blog, Testimonial), Badge, Tag, Stat/Metric Callout, Client Logo Bar, and Author Byline form this system's complete Content Display inventory — no ninth member exists in the approved scope. Consistent with §1.8's extensibility discipline, a future display pattern not among these requires a Phase 4 amendment before a corresponding contract could be added here.

| Component | Tier (§1.6) | Server/Client (§1.7) | Governing Design System Section |
|---|---|---|---|
| Card (base contract, §15.3) | Composite | **Server** | Phase 4 §13 |
| ServiceCard, IndustryCard, CaseStudyCard, BlogCard (Card variants) | Composite | **Server** | Phase 4 §13, §26.5 |
| TestimonialCard | Composite | **Server** (static) / split with a **Client** carousel-control island where the carousel variant is composed (§1.7, restated) | Phase 4 §26.6 |
| TeamMemberCard | Composite | **Server** | Phase 4 §26.5 (extended, per §10.3's registry) |
| Badge | Primitive | **Server** | Phase 4 §14 |
| Tag | Primitive | **Server** (static display) / **Client** where composed as an interactive filter control (§15.6) | Phase 4 §15 |
| Stat/Metric Callout | Composite | **Server** (static) / narrowly-scoped **Client** island where the optional count-up animation is used (§5.8's table, restated) | Phase 4 §26.7 |
| Client Logo Bar | Composite | **Server** | Phase 4 §26.12 |
| Author Byline | Composite | **Server** | Phase 4 §26.14 |

**Card's Base-Contract-Plus-Variants Structure Mirrors §12.3's and §13.5's Precedent:** Consistent with the shared-base-contract pattern already established for the six Form field primitives (§12.3) and for Modal/Drawer (§13.5), Card is specified here as one shared base contract (§15.3) extended by five named, domain-specific variants (§15.4) — never five independently-authored components duplicating the same underlying structural pattern (Phase 4 §13's "entire card clickable, title present" rule, already restated at §5.3, §7.9, and §11.5).

### 15.3 Card Base Contract

**The Shared Shape Every Card Variant Extends:**

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `href` | `string` | Required | System-derived canonical URL (Phase 6 §2.6/§4.10) — never independently constructed by the Card itself; passed down already-resolved from the composing Section (§3.3) |
| `title` | `string` | Required | Content Domain Model — matches the source entity's own `name`/`title` field verbatim, per §2.3's never-renamed rule and §11.5's anchor-text-fidelity guarantee |
| `image` | `MediaAsset` projection (Phase 5B §3.17) | Required | Content Domain Model, consumed via the shared `Image` primitive (§11.4) — every Card variant renders its image through that single primitive, never independently |
| `excerpt` | `string` | Optional | Content Domain Model — the per-variant source field differs (§15.4), but the base contract's field name is uniform across all five variants, consistent with §2.10's cross-component naming-consistency rule |
| `badge` | `{ label: string; tone: BadgeTone } \| null` | Optional | Content Domain Model, consumed via the shared `Badge` primitive (§15.5) |

**Why `href` Is a Required Base-Contract Field Rather Than Internally Constructed:** Consistent with §11.5's ruling that anchor text sources from the same prop as the visible heading, and with §2.6's minimal-payload callback convention extended here to a data prop rather than a callback, `href` is threaded down from the Page's own canonical-URL resolution (Phase 6 §4.10) rather than being computed by the Card from a bare `slug` — this guarantees the Card's wrapping `<a>` (§5.3) always points to the identical canonical URL every other artifact (sitemap, structured data, breadcrumb) already asserts for that same entity, closing the loop on Phase 6 §9.5's cross-page identity guarantee at the component-props layer specifically.

**No Card Variant Accepts a `variant`-Style Visual-Treatment Prop Beyond What §15.4 Names:** Consistent with §8.3's rule that styling-selection props are always closed unions of pre-approved options, the Card base contract itself carries no generic visual `variant` prop — visual differentiation between, say, a `ServiceCard` and a `BlogCard` is achieved by using five separately-named components (§15.2), each internally fixed to its own Design-System-approved layout, rather than by parameterizing one generic `Card` component with a content-type-selecting prop, consistent with Phase 4 §13's own enumeration of named variants rather than a single configurable card.

### 15.4 Card Variant-Specific Extensions

**Consolidating the Per-Entity Derivation Source for Each Variant's `excerpt` Field and Any Additional Fields, Restating §10.3's Registry:**

| Variant | Source Entity (Phase 5B §3) | `excerpt` Source Field | Additional Props |
|---|---|---|---|
| `ServiceCard` | Service (§3.1) | `shortDescription` | None beyond base contract |
| `IndustryCard` | Industry (§3.2) | `description` (truncated per Phase 6 §2.5's Tier 2 truncation rule) | None |
| `CaseStudyCard` | Case Study (§3.9) | Not a bare `excerpt` — replaced by `headlineMetric: { value: string; label: string }`, rendered via the Stat/Metric Callout component (§15.7) composed internally within the Card | `industryTag`, `serviceTag` (both optional `string`, rendered via the shared `Tag` primitive, §15.6) |
| `BlogCard` | Blog Post (§3.4) | `excerpt` (direct field match — the one variant where the base contract's field name and the source entity's field name are already identical) | `readTime: string` (computed field, Phase 5B §3.4), `category: string` (via `categoryId` resolution, rendered as a `Badge`) |
| `TestimonialCard` | Testimonial (§3.10) | Not an `excerpt` — replaced by `quote: string`, `authorName: string`, `authorTitle: string \| null`, `companyName: string \| null` (Phase 5B §3.10's fields, direct projection) | `rating: number \| null` (rendered via a non-Card-specific Stat display, or omitted where `null`, per §2.4's optional-field-inheritance rule) |

**`CaseStudyCard`'s `headlineMetric` Composition Is the One Instance of a Card Composing Another Composite Internally:** This is a deliberate, named exception to §3.5's "Composite-composes-Primitive" pattern — restating that section's own scope, §3.5 governs the *typical* case; `CaseStudyCard` composing a Stat/Metric Callout (§15.7, itself Composite-tier) is structurally permitted because both remain within the same tier (§1.6), and §3.2's one-directional composition rule ("a component in a lower tier never imports... a component in a higher tier") is not violated by same-tier composition, exactly as §3.5 already permitted for the Compositional-tier Section-composes-Section sibling case — this is that identical allowance, now confirmed as also applying within the Composite tier for this one named case.

**`TestimonialCard`'s Divergence From the Base Contract's `excerpt`/`href` Fields:** Because a Testimonial is not independently page-routed (§10.3's registry), `TestimonialCard` is the one variant whose `href` is **optional**, not required (§2.4's narrowing/widening rule permits this specific field to diverge from the base contract's required status here, since the base contract itself is a shared *template*, not an immutable law applied without exception — restating §12.3's precedent that "per-primitive extensions" may adjust the shared base where the underlying entity genuinely differs) — where `href` is supplied, it points to the Testimonial's associated Case Study (Phase 5B §3.10's `relatedCaseStudyId`) rather than to the Testimonial itself, which has no independent canonical page.

### 15.5 Badge Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `label` | `string` | Required | Content Domain Model (e.g., `BlogCategory.name`, Phase 5B §3.5) |
| `tone` | `'neutral' \| 'featured'` | Optional, defaults `'neutral'` | Design System token union, Phase 4 §14 — restricted to exactly the two tones Phase 4 §14 authorizes ("Neutral background by default; may use Accent color for 'Featured'/'New' emphasis badges specifically") |

**Badge Is Never Interactive, Confirmed as a Props-Contract Constraint:** Consistent with Phase 4 §14's "non-interactive... informational only" rule, Badge accepts no `onClick` or equivalent callback prop — this is a deliberate absence, not an oversight, distinguishing it structurally from Tag (§15.6), whose entire distinguishing purpose per Phase 4 §15 is potential interactivity.

### 15.6 Tag Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `label` | `string` | Required | Content Domain Model (e.g., `BlogTag.name`, Phase 5B §3.6) |
| `isActive` | `boolean` | Optional, defaults `false` | Ephemeral UI State (§4.3) where Tag is composed as an interactive filter control; absent/ignored where Tag is composed as static display (e.g., within `CaseStudyCard`'s `industryTag`, §15.4) |
| `onToggle` | `(() => void) \| null` | Optional | Callback contract, §2.6 — presence of this callback is what determines whether the Tag instance renders as a Client-tier interactive button (`aria-pressed`, per §5.4's table extended here) or a Server-tier static span; its absence produces the Server-tier rendering path named in §15.2's table |

**Tag's Dual Rendering Mode Is Determined by Prop Presence, Not a Separate `variant` Prop — Confirmed as Consistent With §2.4's Conditional-Requirement Precedent:** Restating the pattern already established for Alert's `onDismiss` (§13.3), Tag's interactive-versus-static rendering mode is derived from whether `onToggle` is supplied, rather than from an independent `isInteractive: boolean` prop that could disagree with `onToggle`'s own presence — the identical single-source-of-derivation discipline already applied to Alert's dismissibility and to `errorText`-driven form-field error states (§12.4).

### 15.7 Stat/Metric Callout Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `value` | `string` | Required | Content Domain Model (e.g., `CaseStudy.headlineMetric.value`, or `ResultMetric.afterValue`, Phase 5B §3.9) |
| `label` | `string` | Required | Content Domain Model (paired field) |
| `context` | `string \| null` | Optional | Content Domain Model, restating Phase 4 §26.7's optional `context` field |
| `enableCountUp` | `boolean` | Optional, defaults `false` | Generic field-state concern — governs whether the narrowly-scoped Client-tier count-up island (§15.2's table, §5.8's motion-fallback entry) is composed at all |

**`enableCountUp`'s Reduced-Motion Interaction Is Owned Entirely by §5.8, Not Re-Specified Here:** Consistent with §5.8's already-complete table entry for this exact component ("Instant display of the final numeric value — restating Phase 4 §26.7's own explicit fallback rule"), Section 15.7 introduces no new motion-fallback logic — the `enableCountUp` prop's animated-vs-instant rendering choice is a purely presentational concern already fully governed by the accessibility contract established in Section 5, confirmed here only as the props-level trigger for that already-specified behavior.

**Numeric Value Is Never Independently Parsed or Reformatted by the Component:** Consistent with §4.7's derived-value prohibition, `value` is rendered exactly as supplied (a pre-formatted string, e.g., `"+300%"`, already shaped correctly at its Phase 5B source per that field's own validation rules) — the Stat/Metric Callout component never applies its own number-formatting, locale-formatting, or unit-suffix logic, since doing so would constitute exactly the kind of component-invented derived state §4.7 already prohibits.

### 15.8 Client Logo Bar Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `logos` | `MediaAsset[]` projection (Phase 5B §3.17) | Required | Content Domain Model — sourced from `Testimonial.companyLogo` values across a resolved Testimonial array, or a dedicated logo collection where one exists; each entry consumed via the shared `Image` primitive (§11.4) |
| `isAnimated` | `boolean` | Optional, defaults `false` | Design System token union, Phase 4 §12.12's static-grid-vs-marquee choice — where `true`, composes the narrowly-scoped Client-tier marquee island; where `false` (the default, and the accessibility-preferred choice per Phase 4 §12.12's own stated preference for "static grid... for accessibility simplicity"), remains fully Server-tier |

**Every `MediaAsset` Entry's `altText` Requirement Is Inherited, Not Restated as a New Rule:** Consistent with §11.4's "zero narrowing permitted on `altText`" rule, each logo in the `logos` array carries its own mandatory `altText` (company name, per Phase 6 §14.3's `type`-sensitivity guidance) — Client Logo Bar introduces no exception to this already-universal `Image`-primitive obligation.

### 15.9 Author Byline Component Props Contract

**Restates §10.3's Registry Entry and §9.4's Non-Interactive Classification, Given Its Full Contract:**

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `authorName` | `string` | Required | Content Domain Model, `Author.name` (Phase 5B §3.7) |
| `authorPhoto` | `MediaAsset` projection | Optional (`Compact` variant) / Required (`Full` variant) | Content Domain Model, `Author.photo` — the one field in this section whose required-ness is variant-dependent rather than uniformly fixed, restating §12.3's per-member-extension precedent |
| `publishDate` / `updatedDate` | `ISODateString` (paired, Phase 5B §2.2) | Required / Optional | Content Domain Model, inherited kernel fields |
| `variant` | `'compact' \| 'full'` | Required | Design System token union, Phase 4 §26.14's named variant pair |
| `authorBioHref` | `string \| null` | Optional | System-derived — resolves only where `Author.linkedTeamMemberId` (Phase 5B §3.7) is present, per Phase 6 §9.5's Person-entity-linkage rule; `null` for guest contributors, consistent with that same section's honest non-fabrication treatment of unlinked authors |

**Date Formatting Is Locale-Independent Within This Contract, Consistent With §2.10's Naming-Fidelity Discipline:** `publishDate`/`updatedDate` are passed as raw `ISODateString` values (§2.2's branded-type derivation source, Phase 5B §4.3), with any human-readable formatting applied at render time by the component itself as a pure, stateless transformation of that single source value — never cached into a separately-formatted string prop, consistent with §4.7's "derived values are always recomputed from their authoritative source" rule.

### 15.10 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms all five Card variants extend the shared base contract (§15.3) without introducing a duplicate, independently-typed `href`/`title`/`image` shape; confirms `TestimonialCard`'s `href` is correctly typed as optional against the base contract's otherwise-required field, per §15.4's documented exception; confirms Badge's `tone` union admits no third value beyond `neutral`/`featured`.

**Behavioral Verification (§7.4):** Confirms every Card variant's rendered anchor text matches its `title` prop exactly, per §11.5's fidelity guarantee, now checked across all five named variants specifically rather than the Card system in the abstract; confirms Tag's rendering mode (interactive vs. static) correctly follows `onToggle`'s presence/absence with no divergent `aria-pressed` state; confirms Stat/Metric Callout's count-up island correctly falls back to instant-display under `prefers-reduced-motion` per §5.8's already-established table.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new Content Display usage selects the correct closed-inventory member (§15.2) rather than introducing a bespoke card/badge/tag rendering, and confirms `CaseStudyCard`'s internal Stat/Metric Callout composition (§15.4) is the only sanctioned same-tier Composite-composes-Composite instance in the new usage, per §3.5's exception scope

### 15.11 Section Resolution Summary

Section 15 has established the deterministic engineering contracts governing the eight-member Content Display inventory, completing this document's fourth closed-category deep-dive following Sections 12 (Form fields), 13 (Feedback/Overlay), and 14 (Navigation/Wayfinding):

- Card, Badge, Tag, Stat/Metric Callout, Client Logo Bar, and Author Byline form a closed inventory, with Card specified as one shared base contract extended by five named domain-specific variants rather than independently duplicated components (§15.2–15.3).
- Each Card variant's `excerpt`-equivalent field and any additional props are mapped to their exact Phase 5B source entity and field, with `CaseStudyCard`'s internal Stat/Metric Callout composition identified as a deliberate, narrowly-scoped exception to the ordinary Composite-composes-Primitive pattern, and `TestimonialCard`'s optional `href` identified as a deliberate exception to the base contract's otherwise-required field (§15.4).
- Badge is confirmed permanently non-interactive by contract; Tag's interactive-versus-static rendering is derived exclusively from `onToggle`'s presence, following the identical single-source-of-derivation discipline already established for Alert and form-field error states (§15.5–15.6).
- Stat/Metric Callout's numeric `value` is rendered verbatim with no component-level reformatting, and its count-up behavior defers entirely to the motion-fallback contract already established in Section 5.8 (§15.7).
- Client Logo Bar and Author Byline complete this inventory, with Author Byline's `authorPhoto` requirement and `authorBioHref` resolution both correctly varying by variant and by the already-established Author/Team-Member linkage rule from Phase 6 §9.5 (§15.8–15.9).

Every content-display component specified across Sections 1 through 14 is now fully specified down to its individual props-contract level.

**End of Section 15 — Content Display Component Architecture.**

Ready to continue with Section 16.

Phases 1–6 and Phase 7 Sections 1–15 remain frozen and immutable. Continuing with Section 16.

---

# 16. Layout Pattern Component Architecture

### 16.1 Purpose and Scope of This Section

Design System Phase 4 §6 established container widths, breakpoints, grid columns, and gutter tokens; Phase 4 §5 established the 8px spacing system; UX Phase 3 §4 established the Scroll Behaviour Strategy's "Section Rhythm" (Value → Proof → CTA, repeating at predictable intervals); Phase 5A §5.2 established the layout-nesting hierarchy (`app/layout.tsx` → `app/(marketing)/layout.tsx`). None of these prior specifications translated into a **props contract for the reusable structural components** that actually arrange page content into these already-approved widths, columns, and rhythms. Section 16 provides that treatment, completing the fifth of this document's per-category deep-dives, addressing the one category of component this system relies upon most heavily yet has, until now, only referenced implicitly (§3.5's "the Section owns the grid/layout arrangement," §8.6's "a Card grid's column-count change... is expressed as responsive Tailwind utility classes on the composing Section's own layout").

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new container width, breakpoint, spacing token, or grid-column count beyond what Design System Phase 4 §5–6 already established. Section 16's sole contribution is naming the **components** that apply those already-frozen tokens structurally, and specifying their props contracts, composition boundaries, and tier classifications exactly as every preceding per-category section has done for its own domain.

### 16.2 Tier Classification and Closed Inventory

**Closed, Five-Member Set:** Page Shell, Container, Grid Layout, Split Layout, and Sidebar/Content Layout form this system's complete Layout Pattern inventory. Unlike every prior per-category section (Sections 12–15), these five components have no direct, individually-named counterpart in Design System Phase 4's Component Inventory (Phase 4 §26) — they are instead the **structural application layer** of Phase 4 §6's Layout System tokens, occupying a position analogous to how the `Image` primitive (§11.4) was identified as the single shared implementation point for a rule (Phase 6 §13.5's image-delivery discipline) that Design System Phase 4 stated as a system-wide requirement rather than as one named component. Consistent with §1.8's extensibility discipline, a future layout pattern not among these five requires a Design System Phase 4 amendment to §6 before a corresponding contract could be added here.

| Component | Tier (§1.6) | Server/Client (§1.7) | Governing Design System Source |
|---|---|---|---|
| Page Shell | Structural | **Server** | Phase 4 §6.1–6.2, Phase 5A §5.2 |
| Container | Primitive | **Server** | Phase 4 §6.1 |
| Grid Layout | Primitive | **Server** | Phase 4 §6.3–6.4 |
| Split Layout | Primitive | **Server** | Phase 4 §6.3, inferred pairing pattern (Hero's text/image split, per UX Phase 3 §5) |
| Sidebar/Content Layout | Primitive | **Server** — the sidebar's *content* (e.g., a Table of Contents' active-highlight island, §14.7) may itself be Client-tier, but the Sidebar/Content Layout wrapper that positions it is not | Phase 4 §17 (of the Design System Component Inventory numbering — "sticky sidebar on desktop only")

**Why All Five Are Primitive or Structural, Never Composite or Compositional:** Consistent with §1.6's tier definitions ("Primitive: no domain-model awareness; pure presentation of Design-System tokens"), every component in this inventory is domain-content-agnostic by nature — a Grid Layout has no awareness of whether it is arranging `ServiceCard` or `BlogCard` instances (§15's Content Display inventory), consistent with §1.6's One-Directional Composition Rule ("a component in a lower tier never imports or depends upon a component in a higher tier"): Layout Pattern components sit *beneath* Composite-tier content components in the dependency direction, composing whatever `children` (§2.5) a higher tier supplies, never the reverse. Page Shell alone is classified Structural rather than Primitive, since — like Header and Footer (§14.3, §14.5) — it is composed exactly once, at the layout level (§3.2's exception), rather than repeatedly per-Section.

### 16.3 Page Shell Component Props Contract

**Restates and Completes Phase 5A §5.2's Layout Hierarchy, Given Its Full Props Consequence:** Page Shell is the component-layer realization of `app/(marketing)/layout.tsx` (Phase 5A §5.2) — the single wrapper composing Header and Footer (§14.3, §14.5) around whatever Page-level content is nested within it.

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `children` | `ReactNode` | Required | Composition slot, §2.5 — the entire Page-level content tree (§3.2's Page → Section chain) |
| `navigation` | `Navigation` (Phase 5B §3.12) | Required | Content Domain Model — resolved once at this layout level and passed directly into the composed Header (§14.3), never re-fetched per-Page |
| `footer` | `Footer` (Phase 5B §3.13) | Required | Content Domain Model — identical single-resolution pattern, passed into the composed Footer (§14.5) |

**Page Shell Accepts No Visual-Variant Prop:** Consistent with §2.5's Structural/singleton composition rule and §16.2's classification of Page Shell alongside Header/Footer, Page Shell renders identically across every marketing page — it has no `variant` prop, no background-treatment override, and no per-page customization surface of any kind, since Phase 5A §5.2 already established the `(marketing)` layout as a single, uniform shell specifically so a future `(portal)` route group (Phase 5A §5.2's forward-looking note) can be added later "with its own layout/auth boundary — without restructuring existing routes" — a Page-Shell-level variant prop would undermine that already-stated forward-compatibility rationale by conflating what should remain two entirely separate layout components.

**Single-`<main>`-Ownership, Restating §5.3:** Consistent with §5.3's rule that "the `<main>` wrapper is rendered exactly once, by the Page itself," Page Shell is the component that structurally provides the boundary *around which* that single `<main>` landmark is placed — Page Shell itself renders the `<header>`/`<footer>` landmarks (via its composed Header/Footer children, §5.3's table) and leaves the `<main>` landmark's own opening/closing to whatever Page-tier component supplies as `children`, meaning Page Shell's `children` prop is understood, by convention rather than by a separate enforced rule, to already contain that `<main>`-wrapped content — Section 16.3 does not introduce a competing ownership claim over the `<main>` landmark itself.

### 16.4 Container Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | Optional, defaults `'xl'` | Design System token union, Phase 4 §6.1's five named container-width tokens (`container-sm` through `container-2xl`) |
| `children` | `ReactNode` | Required | Composition slot, §2.5 |

**Container Is the Sole Mechanism Enforcing Phase 4 §6.4's Max-Width/Reading-Measure Rule:** Restating Phase 4 §6.4's "Content Max-Width Enforcement: No text block exceeds `container-md` width regardless of parent section width," any component rendering long-form prose (Blog Post body, per §14.7's Table-of-Contents-adjacent context) is composed **within** a Container instance set to `size="md"`, never left to inherit an ambient full-bleed width from its parent Section — this is the component-level enforcement point for a rule Phase 4 §6.4 stated as a general constraint without naming which component was responsible for applying it; Section 16.4 now names Container as that component.

**Container Never Accepts a Custom Pixel-Width Override:** Consistent with §8.2's prohibition on style-override escape hatches, Container's `size` prop is a closed union against Phase 4 §6.1's five named tokens — there is no `customMaxWidth` or `style` prop permitting an arbitrary width value, ensuring every page in this system draws from the identical, finite set of approved reading/content widths.

### 16.5 Grid Layout Component Props Contract

**Restates §8.6's Already-Established Responsive Discipline, Given Its Full Component Ownership:** Section 8.6 stated that "a Card grid's column-count change... is expressed as responsive Tailwind utility classes on the composing Section's own layout" — Section 16.5 now names Grid Layout as the specific component embodying that responsibility, correcting no prior claim but completing it with an actual props contract.

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `columns` | `{ base: 1; md?: 2; xl?: 3 }`-shaped responsive token object, or a fixed simpler union `1 \| 2 \| 3` for non-responsive cases | Optional, defaults to Phase 4 §6.4's "3-column at `xl`+, 2-column at `md`–`lg`, 1-column below `md`" card-grid default | Design System token union, Phase 4 §6.3–6.4 |
| `gap` | `'sm' \| 'md'` | Optional, defaults to Phase 4 §6.3's gutter-width default (`space-6` mobile / `space-8` tablet-desktop) | Design System token union, Phase 4 §5/§6.3 |
| `children` | `ReactNode` | Required | Composition slot, §2.5 — typically a mapped array of Card instances (§15.4), per §3.5's Section-composes-Composite pattern |

**Grid Layout Is Content-Count-Agnostic — It Never Receives or Reasons About How Many Children It Has:** Consistent with §16.2's domain-content-agnostic classification, Grid Layout's `children` prop is an ordinary composition slot, not a `items: T[]` array the component itself iterates — the mapping from a resolved entity array (e.g., a Service page's related Case Studies, §3.3) to individual Card instances occurs at the composing Section level (§3.5), with Grid Layout receiving only the already-mapped result as `children`; this keeps Grid Layout genuinely reusable across any content type without requiring it to know anything about Phase 5B's domain models, consistent with its Primitive-tier classification (§16.2).

**Grid Layout Never Duplicates Container's Max-Width Responsibility:** Consistent with §1.5's Governing Principle 5 (No Duplication Across Component Categories), Grid Layout governs only column arrangement and inter-item gutter spacing (Phase 4 §6.3) — it does not itself constrain overall width, since that remains Container's exclusive responsibility (§16.4); a composing Section nests a Grid Layout *within* a Container where outer-width constraint is needed, rather than either component absorbing the other's concern.

### 16.6 Split Layout Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `primary` | `ReactNode` | Required | Named composition slot, §2.5 — the "primary" region (e.g., a Hero's headline/CTA text block) |
| `secondary` | `ReactNode` | Required | Named composition slot, §2.5 — the "secondary" region (e.g., a Hero's accompanying image) |
| `ratio` | `'50-50' \| '60-40' \| '40-60'` | Optional, defaults `'50-50'` | Design System token union, derived from Phase 4 §6's grid-column arithmetic rather than a freestanding new token — a `60-40` split is expressed internally as a 12-column-grid allocation (7/5 columns), never as an independently-defined percentage value outside the token system |
| `reverseOnMobile` | `boolean` | Optional, defaults `false` | Design System responsive-behavior concern, Phase 4 §25's mobile single-column-stacking rule extended here to govern *which* of the two regions stacks first |

**Split Layout Is This System's One Named-Slot Component Beyond Modal/Drawer's `children`-Only Pattern, and Its Justification Is Restated From §3.6's Governing Test:** Consistent with §3.6's explicit test ("varies via composition slots only when the variation is a difference in structure itself... which region exists"), Split Layout genuinely has two independently-composable, structurally-distinct regions (unlike Modal, whose single `children` slot was sufficient per §13.4) — this is the one Layout Pattern component satisfying §3.6's named-slot threshold, and Section 16.6 confirms this is not a violation of that section's "restraint" principle but the specific, anticipated case that principle's own test was designed to correctly admit.

**Split Layout Never Assumes Content Type for Either Slot:** Consistent with §16.2's domain-agnostic classification, `primary` and `secondary` accept any composed content — Split Layout does not, for example, require `secondary` to contain an `Image` primitive specifically, even though that is its most common use (a Hero's image pairing); a future Split Layout instance pairing two text blocks, or a text block and a Stat/Metric Callout (§15.7), is equally valid under this same contract.

### 16.7 Sidebar/Content Layout Component Props Contract

**Restates Design System's "Sidebar Utilization" Rule and Section 14.7's Table-of-Contents Placement, Given Its Own Dedicated Wrapper Contract:**

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `sidebar` | `ReactNode` | Required | Named composition slot, §2.5 |
| `content` | `ReactNode` | Required | Named composition slot, §2.5 |
| `sidebarPosition` | `'left' \| 'right'` | Optional, defaults `'right'` | Design System token union |
| `isSidebarSticky` | `boolean` | Optional, defaults `true` on desktop-and-above viewports only, per the responsive-token-bound behavior already governing §14.7's Table of Contents | Design System responsive-behavior concern |

**Mobile Collapse Behavior Is Not a Configurable Prop — It Is a Fixed, Token-Bound Rule:** Restating Design System's existing "Multi-Column Grids... reflow to single-column on mobile without information loss" principle (already applied generally in Phase 4's Responsive Design Rules) as it specifically applies here, Sidebar/Content Layout's two-region arrangement collapses to a single-column stack on mobile viewports (sidebar content moving beneath the main content, per the same "Collapsible inline (mobile)" pattern already named for Table of Contents in Phase 4 §26.15) unconditionally — there is no prop permitting a consuming context to preserve a side-by-side arrangement on mobile, consistent with §8.6's rule that responsive variation is expressed through the token-bound utility mechanism, never a component-level override.

**Sidebar/Content Layout Is the Component-Layer Home for Every Instance of Phase 4's "Sticky Sidebar" Pattern, Not Solely Table of Contents:** Although §14.7's Table of Contents is this system's most prominent current consumer, Sidebar/Content Layout is named and specified independently of that specific component precisely so it remains reusable for any future sidebar-content pairing (e.g., a hypothetical future filter panel alongside a Location hub listing) without requiring a new, separately-specified layout wrapper — consistent with §1.8's "existing-variant-first" extensibility discipline.

### 16.8 Composition Rules Specific to Layout Pattern Components

**Layout Pattern Components Are Composed by Section-Tier Components, Never Directly by Composite-Tier Components:** Extending §3.5's tier-pairing table with the specific pattern this section's inventory participates in, a Grid Layout or Split Layout is always composed by a Compositional/Section-tier component (e.g., a "Related Services" Section composing a Grid Layout around its mapped `ServiceCard` array) — a Composite-tier component (e.g., `ServiceCard` itself) never internally composes a Grid Layout or Container, since doing so would mean a single Card attempting to arrange *other* Cards, a responsibility §1.4's single-responsibility principle assigns exclusively to the Section tier.

**Container May Be Composed at Either the Section or Page Tier, the One Deliberate Flexibility in This Inventory:** Unlike Grid Layout and Split Layout (Section-composed only), Container's width-constraining purpose is occasionally needed at the whole-Page level (e.g., constraining an entire simple utility page like a Legal page, per IA Phase 2 §1, which may not decompose into multiple distinct Sections at all) — Section 16.8 confirms this as the one named exception to the otherwise-uniform "Layout Patterns are Section-composed" rule, consistent with §3.2's own acknowledgment that the Page tier retains ultimate sequencing authority over its composed Sections and may, in the simplest page templates, compose a Layout Pattern component more directly.

**No Layout Pattern Component Ever Composes a Structural-Tier Component:** Consistent with §14.9's composition-ownership summary, Grid Layout, Split Layout, Container, and Sidebar/Content Layout never compose Header, Footer, or Breadcrumb internally — those remain exclusively Page-Shell-level (Header/Footer, §16.3) or Page-level (Breadcrumb, §14.9) responsibilities, never nested inside a generic layout wrapper, which would blur the Structural tier's own already-established composition boundaries (§3.2).

### 16.9 Accessibility Implications

**Landmark Neutrality — Layout Pattern Components Introduce No Semantic Landmark of Their Own:** Consistent with §5.3's tier-to-semantic-element mapping (which names no Layout Pattern component, since none was yet specified), Container, Grid Layout, and Split Layout render as plain, non-landmark structural wrappers (`<div>`-equivalent) — they do not introduce a `<section>`, `<nav>`, or other landmark role, since doing so would risk landmark proliferation inconsistent with §5.3's deliberately sparse, meaningful-landmarks-only discipline; any genuine landmark semantics belong to the Compositional/Section-tier component composing these wrappers, not to the wrappers themselves.

**Sidebar/Content Layout's Reading-Order Obligation:** Consistent with Design System's already-established accessibility discipline (Phase 4 §26, restated Section 5) that visual positioning must never diverge from logical/DOM reading order for non-visual consumption, Sidebar/Content Layout's `sidebarPosition` prop (§16.7) governs *visual* placement only (via responsive utility classes, §8.6) — the underlying DOM order of `sidebar` versus `content` remains fixed and consistent regardless of `sidebarPosition`'s value, ensuring a screen-reader user's traversal order never silently reverses based on a purely visual-layout prop, directly extending Section 12.6's already-established "context preservation... no reliance on visual/layout context" principle (originally stated for GEO/retrieval purposes) to this component's accessibility contract specifically.

**Grid Layout's Reading Order Under Responsive Reflow:** Restating the identical principle for Grid Layout's column-count changes (§16.5) — a 3-column-to-1-column responsive reflow (Phase 4 §6.4) never reorders the underlying `children` sequence; CSS Grid/Flexbox's visual reflow is achieved without altering DOM order, consistent with the same reading-order-neutrality obligation just established for Sidebar/Content Layout.

### 16.10 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms Container's `size` prop admits only the five closed Phase 4 §6.1 tokens; confirms Grid Layout's `columns` prop cannot express a value outside Phase 4 §6.4's already-approved column-count set; confirms Split Layout's `ratio` prop resolves to a valid 12-column-grid allocation with no fractional or arbitrary value permitted.

**Behavioral Verification (§7.4):** Confirms no long-form-prose-rendering component (Blog Post body, per §16.4) ever renders outside a `size="md"` Container instance; confirms Sidebar/Content Layout's mobile collapse correctly reflows to single-column without altering DOM order (§16.9); confirms Grid Layout's responsive column-count change produces no visible layout shift inconsistent with Phase 6 §13.2's CLS target.

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new page template composes its structural arrangement exclusively from this section's five-member Layout Pattern inventory (§16.2) — Page Shell, Container, Grid Layout, Split Layout, Sidebar/Content Layout — rather than introducing bespoke, one-off structural markup at the Section-composition level

### 16.11 Section Resolution Summary

Section 16 has established the deterministic engineering contracts governing the five-member Layout Pattern inventory, completing this document's fifth closed-category deep-dive following Sections 12 (Form fields), 13 (Feedback/Overlay), 14 (Navigation/Wayfinding), and 15 (Content Display):

- Page Shell, Container, Grid Layout, Split Layout, and Sidebar/Content Layout form a closed inventory serving as the structural application layer of Design System Phase 4 §5–6's already-frozen tokens, with no direct individual Phase 4 §26 counterpart, distinguishing this section's derivation pattern from every prior per-category section (§16.2).
- Page Shell's props are restricted to `children`, `navigation`, and `footer`, with no visual-variant surface, preserving the forward-compatibility rationale already stated in Phase 5A §5.2 for a future `(portal)` route group (§16.3).
- Container is named as the sole enforcement point for Phase 4 §6.4's max-width/reading-measure rule, admitting no custom-width override (§16.4).
- Grid Layout is confirmed as the specific component realizing §8.6's already-stated responsive card-grid discipline, remaining content-count-agnostic and never duplicating Container's width responsibility (§16.5).
- Split Layout is identified as this system's one Layout Pattern component satisfying §3.6's named-slot threshold, with its `ratio` prop expressed through Phase 4's existing grid-column arithmetic rather than a freestanding new token (§16.6).
- Sidebar/Content Layout generalizes the sticky-sidebar pattern already named for Table of Contents (§14.7) into its own reusable, independently-specified wrapper, with mobile-collapse behavior fixed and non-configurable (§16.7).
- Composition is Section-tier-owned for Grid/Split Layout and Sidebar/Content Layout, with Container alone permitted flexibility to compose at either the Section or Page tier; no Layout Pattern component ever composes a Structural-tier component (§16.8).
- Every Layout Pattern component is landmark-neutral, and both Grid Layout and Sidebar/Content Layout carry an explicit reading-order-neutrality obligation ensuring visual reflow never diverges from DOM/logical order (§16.9).

Every reusable structural arrangement pattern referenced implicitly across Sections 1 through 15 is now fully specified down to its individual props-contract level.

**End of Section 16 — Layout Pattern Component Architecture.**

Ready to continue with Section 17.

Phases 1–6 and Phase 7 Sections 1–16 remain frozen and immutable. Continuing with Section 17.

---

# 17. Animation & Motion Component Architecture

### 17.1 Purpose and Scope of This Section

Design System Phase 4 §24 established the Animation Principles governing this entire system ("every animation must communicate state, feedback, or spatial relationship... zero purely decorative motion"), the closed list of sanctioned micro-interactions, the explicit prohibition list, and the timing/easing standards. Phase 6 §13.2/§13.6 extended these into Core Web Vitals-conscious constraints (font-swap CLS mitigation, `prefers-reduced-motion` as a first-class delivery concern). Section 5.8 of this document translated that principle into a per-component motion/fallback table for the six components already identified as motion-bearing (Modal, Toast, Skeleton, Testimonial Carousel, Stat/Metric Callout, Mega Menu/Mobile Drawer). None of these prior specifications, however, named the **reusable wrapper components** through which motion is actually applied, nor specified their props contracts, tier classification, or composition boundaries — motion has so far been treated as an *attribute* of other components (§5.8's table) rather than as its own component category. Section 17 provides that treatment, completing the sixth of this document's per-category deep-dives.

**Governing Constraint, Restated From Phase 4 §24 and Given Its Strictest Possible Reading Here:** This section introduces no new animation style, no new easing curve, no new timing value, and no new motion behavior of any kind — every prop, variant, and fallback rule specified below is a direct, mechanical translation of Design System Phase 4 §24's already-closed sanctioned-use list and Section 5.8's already-complete per-component table into a reusable component contract. Where this section's own governing test (§17.2) would require a motion behavior not already named in one of those two sources, that behavior is out of scope for Phase 7 and must be referred back to Phase 4 for amendment — consistent with every other per-category section's treatment of its own domain boundary (§12.1, §13.1, §14.1, §15.1, §16.1).

### 17.2 The Governing Test — Motion Components Wrap Existing Behavior, They Do Not Invent It

**Restating Phase 4 §24's Sanctioned-Use List as This Section's Closed Input Set:** Phase 4 §24 named exactly seven sanctioned micro-interaction categories — button hover/active feedback, card elevation on hover, accordion expand/collapse, form-field focus transitions, toast enter/exit, modal/drawer enter/exit, skeleton shimmer, and the count-up-on-scroll-into-view exception — plus an explicit, closed prohibition list (auto-playing carousels, parallax, decorative background animation, bouncing/attention-seeking CTA animation, animated page transitions delaying content). Section 17.2 states the governing test every component specified in this section must satisfy: **a Motion component wraps an already-sanctioned behavior already assigned to an already-named component elsewhere in this document; it never introduces a motion behavior an earlier phase has not already approved.**

**Why This Section Exists Despite That Constraint — Naming the Shared Implementation Point, Not a New Capability:** Consistent with the reasoning already established for the `Image` primitive (§11.4 — "One Image Primitive, Consumed by Every Higher-Tier Component — No Component Re-Implements Image Rendering") and for the Layout Pattern inventory (§16.1 — components realizing tokens Phase 4 stated as system-wide requirements without naming which component applies them), Section 17 names the **reusable wrapper components** that apply Phase 4 §24's and Section 5.8's already-approved motion rules, so that no two components in this system's inventory independently reimplement the identical enter/exit transition, the identical shimmer animation, or the identical reduced-motion fallback logic with potentially inconsistent timing values.

### 17.3 Tier Classification and Closed Inventory

**Closed, Four-Member Set:** Reveal Wrapper, Stagger Container, Transition Wrapper, and Count-Up Wrapper form this system's complete Animation & Motion component inventory. Consistent with §17.2's governing test, none of these four is an independently-motioned component in its own right — each is a thin, narrowly-scoped wrapper applying an already-sanctioned motion behavior to whatever content it composes.

| Component | Tier (§1.6) | Server/Client (§1.7) | Sanctioned Behavior Applied (Phase 4 §24) |
|---|---|---|---|
| Reveal Wrapper | Primitive | **Client** — scroll-into-view detection requires client-side observation | Stat/Metric Callout's "count-up on scroll-into-view" trigger condition, generalized as a reusable scroll-visibility detector (§17.4) |
| Stagger Container | Primitive | **Server** shell / **Client** timing coordination — restating the split-component pattern already established at §1.7, §14.2, §15.2 | No independent sanctioned category of its own; strictly a sequencing wrapper around already-sanctioned per-child transitions (§17.5) |
| Transition Wrapper | Primitive | **Client** | Toast enter/exit, Modal/Drawer enter/exit, Accordion expand/collapse — the three enter/exit-shaped sanctioned categories, unified behind one shared timing/easing implementation (§17.6) |
| Count-Up Wrapper | Primitive | **Client** | The count-up-on-scroll-into-view exception, Phase 4 §24, already named at the props level in §15.7's `enableCountUp` field | §17.7 |

**All Four Are Primitive Tier, Never Composite or Higher:** Consistent with §16.2's reasoning for the Layout Pattern inventory, every component in this section's inventory is domain-content-agnostic — a Reveal Wrapper has no awareness of whether the content it reveals is a `Service` or a `TestimonialCard`, consistent with §1.6's One-Directional Composition Rule placing these wrappers structurally beneath the Composite-tier content components they may surround.

### 17.4 Reveal Wrapper Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `children` | `ReactNode` | Required | Composition slot, §2.5 |
| `trigger` | `'visible' \| 'always'` | Optional, defaults `'visible'` | Design System token union, restating Phase 4 §24's "on scroll-into-view" trigger condition as the default, with `'always'` reserved for the rare case a component needs Reveal Wrapper's fallback-value machinery (§17.4's next rule) without the scroll-observation behavior itself |
| `fallback` | `ReactNode \| null` | Optional | Composition slot, §2.5 — the content rendered immediately, with no animation, under `prefers-reduced-motion` (§5.8) |

**Reveal Wrapper Is the Generalized Implementation Point for Section 5.8's Already-Established Count-Up Fallback Rule:** Section 5.8's table already specified, for Stat/Metric Callout specifically, that reduced motion produces "Instant display of the final numeric value." Section 17.4 confirms this is achieved by composing the Count-Up Wrapper (§17.7) *inside* a Reveal Wrapper, with the Reveal Wrapper's own `fallback` prop supplying the already-final, non-animated value — Reveal Wrapper itself introduces no numeric-formatting logic (that remains exclusively Count-Up Wrapper's concern, §17.7), only the scroll-visibility detection and reduced-motion branching common to any content that might need a "reveal on scroll" treatment.

**No Content-Type Assumption, Restating §16.2's Domain-Agnostic Principle:** Reveal Wrapper's `children`/`fallback` pair accepts any composed content — its only behavior is *when* and *whether* to apply a scroll-triggered reveal versus an immediate, static render; it carries no opinion about what that content represents, consistent with every Primitive-tier component in this document's inventory.

### 17.5 Stagger Container Component Props Contract

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `children` | `ReactNode` | Required | Composition slot, §2.5 — typically a mapped array of Card instances (§15.4), composed identically to Grid Layout's `children` pattern (§16.5) |
| `staggerDelayMs` | `number` | Optional, defaults to Phase 4 §24's fixed "150–250ms" micro-interaction timing standard | Design System timing token, Phase 4 §24 — never a freely-supplied arbitrary value; bounded to that same closed timing range |

**Stagger Container Exists Solely to Coordinate Timing Across Multiple Already-Sanctioned Child Transitions — It Is Not Itself a New Sanctioned Category:** Restating §17.2's governing test explicitly against this specific component: a Stagger Container never animates *itself*; it delays the *start time* of each composed child's own already-sanctioned enter transition (e.g., a Grid Layout of Cards each individually using Card's own hover-elevation-adjacent entrance treatment, where one exists) by an incrementing multiple of `staggerDelayMs`. Where no child composed within a Stagger Container carries any sanctioned motion of its own, the Stagger Container has no visible effect at all — it coordinates timing, it does not originate motion.

**Stagger Container's Reduced-Motion Behavior Is Inherited, Never Independently Specified:** Consistent with §5.8's per-component fallback table already governing each individual child's own motion, Stagger Container introduces no separate `prefers-reduced-motion` branch of its own — because it only ever delays already-fallback-aware children (§5.8's existing table entries), disabling the stagger simply means every child's already-established instant-render fallback fires simultaneously rather than sequentially, requiring no additional logic in this component itself.

**Composition Restriction — Stagger Container Composes Only Within a Grid Layout or Split Layout, Never Independently at the Section Level:** Extending §16.8's composition-ownership rules for Layout Pattern components, Stagger Container is always nested *within* a Grid Layout (§16.5) or, less commonly, a Split Layout's slot (§16.6) — it is never composed directly by a Section as a Grid Layout's structural sibling or replacement, since its responsibility (timing coordination of already-arranged children) presupposes an arrangement (column count, gutter spacing) that only Grid Layout or Split Layout already provides.

### 17.6 Transition Wrapper Component Props Contract

**The Shared Implementation Point Unifying Three of Phase 4 §24's Sanctioned Categories:** Toast enter/exit, Modal/Drawer enter/exit, and Accordion expand/collapse (Phase 4 §24's three named enter/exit-shaped micro-interactions) are, per this section's governing test, structurally identical at the animation-mechanics level — a height/opacity/transform transition between a hidden and visible state — differing only in *which* CSS properties transition and *which* component's own Ephemeral UI State (§4.3) drives the `isOpen`/`isExpanded` boolean triggering it.

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `isVisible` | `boolean` | Required | Controlled by the composing component's own Ephemeral UI State (§4.3) — e.g., Modal's `isOpen` (§13.4), FAQ Accordion's per-item expanded state (§4.3's table) |
| `children` | `ReactNode` | Required | Composition slot, §2.5 |
| `mode` | `'fade' \| 'slide' \| 'height'` | Required | Design System token union, restating Phase 4 §17–18's Modal-fade/Drawer-slide distinction and Phase 4 §26.8's Accordion height-transition behavior as three closed, named modes — never a freely-composed CSS-transition string |
| `durationMs` | `number` | Optional, defaults to Phase 4 §24's fixed timing standard | Design System timing token |

**Transition Wrapper Is Composed Internally by Modal, Drawer, Toast, and FAQ Accordion — Never Independently by a Consuming Page or Section:** Consistent with §13.4–13.6's already-established props contracts for Modal, Drawer, and Toast (none of which exposed any motion-related prop of their own), those three components' own implementations compose a Transition Wrapper internally, with their already-specified `isOpen` (§13.4–13.5) or Context-driven visibility state (§13.6) flowing straight through as Transition Wrapper's `isVisible` prop — this is the identical Composite/Compositional-composes-Primitive pattern already governing every other Primitive in this document's inventory (§3.5), now confirmed as applying to motion specifically. A consuming Page or Section never directly instantiates a Transition Wrapper around arbitrary content; doing so would risk exactly the "decorative animation" and "animated page transitions that delay content access" prohibitions Phase 4 §24 already names.

**`mode: 'height'` Is Reserved Exclusively for FAQ Accordion's Documented Behavior:** Restating Phase 4 §26.8's rule that Accordion's expand/collapse uses a "height transition [that] communicates open/closed state" (explicitly, per Phase 4 §24, a sanctioned category *because* it communicates state rather than decorating), `mode: 'height'` is the one Transition Wrapper mode this document confirms has exactly one authorized consumer (§5.4's FAQ Accordion table entry) — a future component composing this mode for unrelated purposes would require the same governance scrutiny §17.2 already establishes for any motion behavior not already named in Phase 4 §24's closed list.

### 17.7 Count-Up Wrapper Component Props Contract

**Direct Completion of §15.7's `enableCountUp` Prop, Given Its Own Dedicated Contract:** Section 15.7 named `enableCountUp: boolean` as Stat/Metric Callout's trigger for "the narrowly-scoped Client-tier count-up island" without specifying that island's own contract — Section 17.7 provides it.

| Prop | Type | Required | Derivation Source (§2.2) |
|---|---|---|---|
| `finalValue` | `string` | Required | Content Domain Model, passed straight through from Stat/Metric Callout's own `value` prop (§15.7) — Count-Up Wrapper does not independently parse or reformat this value, restating §15.7's own "never independently parsed or reformatted" rule at this wrapper's level too |
| `durationMs` | `number` | Optional, defaults to Phase 4 §24's fixed timing standard | Design System timing token |

**Count-Up Wrapper Is Always Composed Within a Reveal Wrapper, Never Independently — the One Fixed Composition Rule in This Section's Inventory:** Because the count-up animation's entire sanctioned justification (Phase 4 §24) is contingent on the "on scroll-into-view" trigger condition, Count-Up Wrapper never appears in this system's component tree except as a child of a Reveal Wrapper (§17.4) — Stat/Metric Callout's own internal composition (§15.7) is therefore Reveal Wrapper composing Count-Up Wrapper composing the final numeric display, with the Reveal Wrapper's `fallback` prop (§17.4) supplying the identical `finalValue` string, unanimated, under `prefers-reduced-motion` — this is the concrete, complete mechanism §5.8's table entry for Stat/Metric Callout ("Instant display of the final numeric value") and §15.7's own reduced-motion cross-reference were both already describing, now fully specified end-to-end.

**Numeric Parsing for the Animation's Own Interpolation Is an Internal Implementation Detail, Never a Props-Level Concern:** Consistent with §4.7's derived-value prohibition and §15.7's identical rule, whatever internal logic Count-Up Wrapper uses to interpolate from zero to `finalValue` (e.g., stripping a `%` suffix for numeric tweening, then reapplying it) is entirely internal to the component's own implementation — it is never exposed as a separate `numericValue`/`suffix`-split props pair, since doing so would push a parsing responsibility onto every consumer that this Primitive's own narrow scope is specifically designed to absorb once, centrally.

### 17.8 Motion Orchestration and Composition Boundaries

**No Motion Component in This Inventory Ever Composes Another Motion Component From This Same Inventory, With One Named Exception:** Consistent with §1.6's One-Directional Composition Rule applied within this section's own closed set, Transition Wrapper never composes a Reveal Wrapper or Count-Up Wrapper, and Reveal Wrapper never composes a Transition Wrapper — each of the four members governs a structurally distinct motion category (enter/exit vs. scroll-reveal vs. sequencing vs. numeric interpolation) and composing across these categories would blur the single-responsibility boundary §1.4 already establishes for every component in this system. **The one named exception, already specified in §17.7, is Count-Up Wrapper's mandatory nesting within Reveal Wrapper** — this is not a violation of the no-cross-composition rule just stated, since Count-Up Wrapper and Reveal Wrapper are not peers governing overlapping concerns; Count-Up Wrapper depends on Reveal Wrapper's visibility-detection mechanism precisely because it has none of its own, making this composition additive rather than duplicative.

**Motion Components Never Appear in the JSON-LD/Structured-Data Path, Restating §11.2's Boundary:** Consistent with §11.2's confirmation that no component in this system's inventory participates in structured-data construction, none of this section's four Motion components carry any props or behavior relevant to Phase 6's discoverability architecture — they are purely presentational-layer concerns, fully orthogonal to the Page-level `generateMetadata`/JSON-LD resolution path already established as entirely separate from the component tree.

**Server-Rendered Content Beneath a Client-Tier Motion Wrapper Remains Fully Present in Initial HTML, Restating §3.4's Serialization Discipline:** Consistent with §3.4's rule that a Client-tier component composing Server-rendered content does not itself force that content to become client-rendered, a Reveal Wrapper or Transition Wrapper's `children` — even though the wrapper itself is Client-tier — retains its own already-established Server/Client classification independent of the wrapper (e.g., a `ServiceCard`, itself Server-tier per §15.2, composed inside a Reveal Wrapper for a scroll-reveal treatment, remains fully present in the page's initial server-rendered HTML; only the *reveal animation itself* is client-executed, never the underlying content's own renderability) — this is the motion-specific restatement of the identical principle already governing every other split-component pattern named across Sections 1.7, 14.2, and 15.2, now confirmed as holding for this section's inventory too.

### 17.9 Accessibility Implications

**Full Inheritance From Section 5.8's Table, No New Fallback Rule Introduced:** Every reduced-motion fallback this section's four components produce is a direct, mechanical implementation of a rule already stated in §5.8's table (Modal/Drawer's instant show/hide, Toast's instant show/hide, Skeleton's static block, Stat/Metric Callout's instant final-value display, Mega Menu/Mobile Drawer's instant expand/collapse) — Section 17 introduces no new component whose reduced-motion behavior is not already named there; it only names the shared implementation mechanism (Reveal Wrapper's `fallback` prop, Transition Wrapper's mode-agnostic instant-toggle behavior under the media query) producing that already-approved output.

**Reveal Wrapper's Scroll-Trigger Never Delays Content From Being Present in the Accessibility Tree:** Consistent with §5.10's Type-Level/Behavioral verification split and §17.8's serialization discipline, content composed within a Reveal Wrapper is present in the DOM and accessibility tree from initial render regardless of its visual reveal-animation state — a screen reader or keyboard-only user encountering a not-yet-visually-revealed element does not experience it as absent or inaccessible; only its *visual* opacity/transform state is scroll-gated, never its presence to assistive technology, directly extending §12.6's "no reliance on visual/layout context" principle (already applied to Sidebar/Content Layout's reading order in §16.9) to this section's scroll-triggered reveal behavior specifically.

**Transition Wrapper's `mode: 'height'` Accordion Usage Inherits FAQ Accordion's Already-Established Focus Retention Rule:** Restating §5.4's "focus retained on toggle" requirement for FAQ Accordion, Transition Wrapper's height-transition mode never moves focus away from the triggering `<button>` element during its animation — this is not a new rule Section 17 introduces, but confirmation that the shared Transition Wrapper implementation does not interfere with an accessibility obligation already assigned to its sole `mode: 'height'` consumer.

### 17.10 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2:

**Type-Level Verification (§7.3):** Confirms Transition Wrapper's `mode` prop admits only the three closed values named in §17.6; confirms Stagger Container's `staggerDelayMs` and Transition Wrapper/Count-Up Wrapper's `durationMs` props, where overridden, remain within Phase 4 §24's bounded timing range rather than accepting an arbitrary numeric value.

**Behavioral Verification (§7.4):** Confirms Count-Up Wrapper never renders independent of a parent Reveal Wrapper (§17.7's fixed composition rule); confirms every one of this section's four components correctly disables its animated behavior and renders the already-established static fallback under `prefers-reduced-motion`, cross-checked against §5.8's table for exact fallback-output parity; confirms Reveal Wrapper's composed content is present in server-rendered HTML output regardless of scroll-visibility state (§17.9).

**Operational Verification (§7.5):** Extends Checklist D with one additional item specific to this section:
- [ ] Confirm any new component requiring motion composes one of this section's four closed-inventory wrappers (§17.3) around an already-sanctioned Phase 4 §24 behavior, rather than introducing independent animation logic — and confirm the specific motion behavior being wrapped already appears in Phase 4 §24's sanctioned list or Section 5.8's per-component table before authoring the composition

### 17.11 Section Resolution Summary

Section 17 has established the deterministic engineering contracts governing the four-member Animation & Motion inventory, completing this document's sixth closed-category deep-dive following Sections 12 through 16, and confirming this section introduces zero new motion behavior beyond what Phase 4 §24, Phase 6 §13.6, and Section 5.8 already froze:

- Reveal Wrapper, Stagger Container, Transition Wrapper, and Count-Up Wrapper form a closed inventory whose sole purpose is applying already-sanctioned motion behaviors as reusable, thin wrappers — never originating new motion of their own, per the governing test stated at §17.2 (§17.3).
- Reveal Wrapper generalizes the scroll-into-view trigger condition and reduced-motion fallback branching underlying Stat/Metric Callout's existing behavior, remaining fully content-agnostic (§17.4).
- Stagger Container coordinates timing across already-motioned children composed within a Grid Layout or Split Layout, introducing no independent motion or reduced-motion logic of its own (§17.5).
- Transition Wrapper unifies Toast, Modal/Drawer, and Accordion's three enter/exit-shaped sanctioned categories behind one shared, mode-selecting implementation, composed internally by those three components rather than instantiated independently by any consuming Page or Section (§17.6).
- Count-Up Wrapper completes §15.7's `enableCountUp` contract, mandatorily nested within Reveal Wrapper as the one named cross-composition exception in this section's otherwise strictly-separated inventory (§17.7).
- Motion components never compose across their own category boundaries beyond that one exception, never participate in the structured-data path, and never alter their composed children's own independently-established Server/Client rendering classification (§17.8).
- Every reduced-motion fallback this section's components produce is confirmed as a direct implementation of Section 5.8's already-complete table, with scroll-triggered reveal explicitly confirmed never to gate content's presence in the DOM or accessibility tree (§17.9).

Every reusable motion pattern implied but not yet componentized across Sections 1 through 16 is now fully specified down to its individual props-contract level, with zero new animation behavior introduced beyond what Phases 4 and 6 already approved.

**End of Section 17 — Animation & Motion Component Architecture.**

Ready to continue with Section 18.

Phases 1–6 and Phase 7 Sections 1–17 remain frozen and immutable. Continuing with Section 18.

---

# 18. Component Documentation & Storybook Architecture

### 18.1 Purpose and Scope of This Section

Sections 12 through 17 have collectively specified a complete, closed inventory of component contracts across six categories — Form Fields, Feedback/Overlay, Navigation/Wayfinding, Content Display, Layout Pattern, and Animation/Motion — plus the foundational cross-cutting architecture governing every one of them (Sections 1–11). None of these prior sections specified **how this contract knowledge is made discoverable, verifiable, and durable** for engineers implementing against it. Section 18 closes this final gap: it is the documentation-and-verification layer sitting atop every component contract already frozen, ensuring the specifications in Sections 1–17 remain a living, checkable reference rather than a one-time document engineers must manually re-derive from at implementation time.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1, this section introduces no new component, no new prop, no new variant, no new token, no new accessibility rule, and no new animation behavior. Every documentation requirement specified below is a **restatement obligation** — a rule requiring that an already-frozen fact from Sections 1–17 (or from Phases 4–6 directly) be surfaced in a specific, discoverable location, never a rule inventing a new fact to surface.

### 18.2 Documentation as a Verification Category — Positioning Within Section 7's Taxonomy

**Restates Section 7.2's Three-Category Verification Taxonomy, Given Documentation's Precise Placement Within It:** Documentation completeness is not a fourth verification category alongside Type-Level, Behavioral, and Operational (§7.2) — it is a **cross-cutting requirement checked within the Operational tier**, consistent with Checklist D's (§7.5) existing pattern of manual, judgment-adjacent review. A component's documentation is "correct" precisely to the extent it accurately restates what Sections 1–17 already established; verifying that restatement's accuracy is therefore an Operational Verification concern (§7.2's third category) applied to a new artifact type (documentation) rather than a new verification mechanism in its own right.

**Why Documentation Nonetheless Warrants Its Own Section Rather Than a Single Checklist Item:** Every prior per-category section (12–17) closed with a single, narrow Checklist D addition (§12.7, §13.8, §14.10, §15.10, §16.10, §17.10) — each confirming conformance to that section's own specific rules. Documentation differs in that its obligation spans **every** component in every category simultaneously, and its own internal structure (what a documentation entry must contain, how it is organized, what tooling renders it) is itself substantial enough to require the full per-category treatment this document has given every other cross-cutting concern (Sections 2 through 11), rather than being adequately captured as one more line in an existing checklist.

### 18.3 Documentation Entry Contract — Required Content Per Component

**Every Component in Every Closed Inventory (§1.2, §12.2, §13.2, §14.2, §15.2, §16.2, §17.3) Carries Exactly One Documentation Entry, Structured Identically:** Consistent with §2.3's naming-convention discipline and §10.6's registry-maintenance governance, a documentation entry is keyed to the component's own name (matching Phase 4 §27's Component Naming Convention exactly) and contains the following closed set of sections — no entry may omit a required section, and no entry may introduce a section beyond this closed set without a formal amendment to this specification:

| Documentation Section | Required Content | Source of Truth |
|---|---|---|
| **Purpose** | One-paragraph restatement of the component's single responsibility (§1.4) | The component's own governing subsection in Sections 12–17 |
| **Tier & Rendering Classification** | Restates the component's tier (§1.6) and Server/Client assignment (§1.7), including split-component notes where applicable | §1.6, §1.7, and the component's own per-category table entry |
| **Props Table** | Full restatement of every prop's name, type, required/optional status, default value, and derivation source (§2.2) | The component's own props-contract subsection |
| **Variants** | Every closed-union variant value, restated from its governing Design System token table (§8.3) | Phase 4's per-component variant specification, cross-referenced via §8.3 |
| **States** | Every interaction state (default/hover/focus/active/disabled/loading, per Phase 4 §11.2's precedent) applicable to this component | Phase 4's per-component state specification |
| **Accessibility Notes** | Restates the component's semantic element (§5.3), required ARIA attributes (§5.4), keyboard bindings (§5.5), and focus behavior (§5.6) where applicable | Section 5's closed tables, filtered to this component's own rows |
| **Responsive Behavior** | Restates any breakpoint-dependent rendering change (§8.6), including reduced-motion fallback (§5.8) where applicable | §8.6, §5.8 |
| **Composition Examples** | Restates the component's permitted composition relationships (§3.5, and the component's own per-category composition subsection) | Section 3, and the relevant §12.6/§13.7/§14.9/§15's variant table/§16.8/§17.8 |
| **Do/Don't Guidance** | Restates the component's own explicitly-named prohibitions (e.g., §13.4's "no `zIndex` override," §16.4's "no custom pixel-width," §17.6's "never independently instantiated by a consuming Page") | The component's own governing subsection's explicit prohibition language |
| **Token References** | Enumerates every Phase 4 §28 token this component consumes, per §8.3's "every visual property traces to a named token" rule | §8.3, cross-referenced against the component's own implementation |

**No Documentation Entry May State a Fact Not Already Present in Sections 1–17 or Phases 4–6:** This is the section's single most important governance rule, restating §1.5's Governing Principle 1 at the documentation layer specifically — a documentation entry is a **derived artifact**, exactly as a component's props are a derived projection (§2.2) rather than an independently authored shape. Where a documentation entry appears to require a fact not yet established anywhere in this project, that is evidence of a genuine specification gap requiring resolution in the appropriate earlier phase or section, never a gap a documentation author is authorized to fill in unilaterally.

### 18.4 Storybook Organization Structure

**Folder Structure Mirrors the Six Closed Component-Category Sections, Extending Phase 5A §4's Folder-Structure Convention:** Consistent with Phase 5A §4's `components/` subdivision (`ui/`, `layout/`, `forms/`, `content/`, `feedback/`, `sections/`) and this document's own tier-and-category taxonomy (§1.6, Sections 12–17), the Storybook file hierarchy mirrors that identical structure rather than introducing an independent organizational scheme:

```
Storybook Root
├── Primitives (Section 1.6's Primitive tier)
│   ├── Form Fields (Section 12's six-member inventory)
│   ├── Layout Patterns (Section 16's five-member inventory)
│   └── Animation & Motion (Section 17's four-member inventory)
├── Composites (Section 1.6's Composite tier)
│   ├── Content Display (Section 15's eight-member inventory)
│   └── Feedback (Alert, Toast — Section 13's Composite-tier members)
├── Structural (Section 1.6's Structural tier)
│   └── Navigation & Wayfinding (Section 14's seven-member inventory,
│       excluding Search Overlay, which is Composite-tier per §14.2)
└── Compositional (Section 1.6's Compositional tier)
    ├── Overlay Systems (Modal, Drawer — Section 13's Compositional-tier
    │   members)
    └── Page Sections (Hero, CTA Band — named in Phase 4 §26 and
        Section 10.4's Page Template registry, not independently
        given their own Section 12–17 deep-dive since their
        composition is fully governed by Section 3.5 and Section 10.4)
```

**This Structure Introduces No New Categorization — It Is a Direct Restatement of §1.6's Tier Model, Cross-Referenced Against Sections 12–17's Category Boundaries:** Where a component's tier (§1.6) and its per-category section (12–17) do not align to a single, obvious folder (e.g., Search Overlay is Composite-tier per §14.2 but belongs conceptually to the Navigation & Wayfinding category), the folder placement follows **tier first, category as a sub-grouping label** — consistent with §1.6 being the more fundamental, earlier-established classification this document has consistently treated as authoritative over any single per-category section's own internal grouping.

**Every Storybook Story Corresponds to Exactly One Component From the Closed Inventories Already Established — No Orphan Stories:** Consistent with §10.5's Orphan/Gap Detection Rule (already established for the Entity-to-Component Registry), Storybook stories are subject to the identical two-directional completeness check: every component named across Sections 12–17's tables must have a corresponding story, and every story present in Storybook must trace to a component named in one of those tables — a story for a component not appearing in any closed inventory is itself a governance violation, not merely a documentation oversight, since it would imply an undocumented eighth-or-later member has been introduced into a category this document has repeatedly declared closed (§12.2, §13.2, §14.2, §15.2, §16.2, §17.3).

### 18.5 Story Requirements Per Component

**Every Component's Story File Contains, at Minimum, the Following Closed Set of Story Variants — No Fewer, No Additional Categories Beyond What This List Permits Extending Via §18.5's Own Final Rule:**

1. **Default Story** — the component rendered with only its required props supplied, all optional props at their documented default (§2.7's "no component ships with implicit, undocumented default behavior" rule made concrete: the Default story is the executable proof that every default is exactly what §18.3's Props Table claims it to be).
2. **Variant Matrix Story** — every closed-union variant value (§18.3's Variants section) rendered simultaneously, side-by-side, for direct visual comparison — restating Phase 4 §11's Button-variant-table precedent as a general story-authoring rule applied to every variant-bearing component in this system.
3. **State Story** — every applicable interaction state (§18.3's States section) rendered as a distinct, individually-labeled instance — never relying on a Storybook add-on's simulated-interaction feature alone to demonstrate a state that has its own, independently meaningful visual treatment (e.g., a Button's `disabled` state is its own story entry, not merely a control toggle applied to the Default story, since a reviewer scanning the story list should see every state without needing to manipulate controls first).
4. **Composition Example Story** — for every Composite/Compositional/Structural-tier component whose §18.3 Composition Examples section names a specific parent-child relationship (e.g., `ServiceCard` composed within a Grid Layout, per §16.5; a Transition Wrapper composed within Modal, per §17.6), a dedicated story demonstrating that exact composition, not merely the component in isolation.
5. **Accessibility Story (Where Applicable)** — for every component carrying a focus-trap obligation (§5.6), a live-region obligation (§5.7), or a keyboard-interaction table entry (§5.5), a dedicated story configured for direct accessibility-tooling inspection (e.g., a Modal story that opens on mount specifically so focus-trap behavior is immediately testable without requiring a manual trigger-click first).

**No Story Introduces a Prop Value Outside the Component's Own Already-Frozen Type Contract:** Consistent with §7.3's Type-Level Verification and §18.3's "no documentation entry may state a fact not already present" rule, Storybook's own Controls addon (§18.6) is configured to only ever offer prop values already present in that component's own closed-union type — a story author cannot demonstrate a hypothetical seventh Card variant or an out-of-range `staggerDelayMs` value (§17.5), since doing so would document a state the system itself cannot produce.

### 18.6 Controls Configuration Contract

**Storybook Controls Are Auto-Derived From Each Component's TypeScript Props Interface, Never Independently Configured:** Consistent with §7.3's ruling that "TypeScript's compiler is the validation mechanism, not a runtime library," Storybook's Controls panel for every component in this inventory is generated directly from that component's own props type (via the identical type-introspection mechanism already implicit in §7.3's compiler-driven verification philosophy) rather than hand-authored per story — this ensures a Controls panel can never drift from a component's actual type contract, since it is mechanically derived from that contract rather than manually kept in sync with it.

**Controls for Content-Projection Props (§2.2) Are Disabled by Default, Not Left Freely Editable:** Consistent with §2.4's rule that "no component supplies a default-value substitution for missing required data" and the broader anti-fabrication principle restated throughout this document (§10.1, §11.3, §15.7), a Composite-tier component's content-projection props (e.g., `ServiceCard`'s `title`, sourced from `Service.name` per §15.3) are populated in every story with **realistic, representative fixture data** matching that field's own Phase 5B validation bounds (e.g., a `title` fixture respecting Phase 5B §3.1's `3–80 char` bound) — but the Controls panel does not invite free-text editing of these fields in a way that could produce a fixture violating those bounds, since doing so would let a story demonstrate a state the Validation Layer (Phase 5B §5) would never actually permit into production.

**Design-Token-Bound Props (§8.3) Expose Controls Restricted to Their Exact Closed Union:** A `variant` or `size` prop's Storybook control renders as a select/radio control listing only the exact token-union members already established in Phase 4 and restated in this document's own per-component tables — never a free-text input, consistent with §8.3's "never an open `string` type" rule applied here to the documentation-tooling layer specifically.

### 18.7 MDX Documentation Structure

**Every Component's MDX Documentation File Follows the Identical Section Order Established in §18.3's Documentation Entry Contract, With No Reordering Permitted:** Consistent with this document's own internal consistency discipline (every per-category section in this document follows an identical structural pattern — Tier Classification, Props Contract, Composition, Accessibility, Validation, Resolution Summary), every component's MDX file presents its ten required sections (§18.3's table) in the identical fixed order across every component in the system, so that an engineer familiar with any one component's documentation page can navigate any other component's page without needing to relearn its structure.

**MDX Files Embed Live Stories, Never Static Screenshots, for Every Visual Claim:** Consistent with §7.4's Behavioral Verification category ("confirms... at runtime, not merely at the type level"), an MDX documentation page's Variant, State, and Composition sections embed the actual, live-rendered Storybook stories (§18.5) inline rather than a static image — ensuring the documentation cannot silently drift from the component's actual current rendering the way a screenshot could, restating this section's own §18.3 "derived artifact, never independently authored" principle at the media-format level specifically.

**Cross-Reference Footer, Restating Phase 6 §21.9's Documentation-Currency Obligation:** Every MDX file's closing section is a fixed-format cross-reference footer listing the exact Phase 7 subsection(s) that component's contract derives from (e.g., `ServiceCard` → §15.3, §15.4, §11.4, §11.5) — directly extending Phase 6 §21.9's "traceability table currency" obligation (already applied to Phase 6's own report-mapping tables and Phase 6 §9.3's Primary Entity closed set, and restated for Section 10's registry in §10.6) to this section's MDX artifacts specifically, ensuring a future amendment to any cross-referenced subsection has an immediately-discoverable list of every documentation file requiring corresponding review.

### 18.8 Testing Hook Integration

**Storybook Stories Serve as the Canonical Fixture Source for Section 7's Behavioral Verification Tier, Never a Duplicate, Independently-Maintained Test-Fixture Set:** Consistent with §7.4's Behavioral Verification category and this section's own governing principle that documentation is a derived, never independently-authored, artifact, the executable component tests referenced in §7.4 are authored **against the same story definitions** established in §18.5 — a Behavioral Verification test confirming, say, Modal's focus-trap lifecycle (§7.4's own named example) renders the component using its already-defined Accessibility Story (§18.5, item 5) as its test fixture, rather than a separately hand-authored test-only render configuration that could drift from what Storybook itself demonstrates.

**Visual Regression Testing, Where Employed, Snapshots Exclusively Against Story Output — Never Against Ad Hoc, Non-Documented Renders:** Extending §7.6's "cross-section parity as the component layer's most sensitive regression tripwire" reasoning to the documentation-and-testing boundary specifically, any visual-regression-testing mechanism this project's implementation phase eventually adopts is scoped to snapshot exactly the story set already required by §18.5 — since every visually-significant state (Default, Variant Matrix, State, Composition) is already guaranteed present as a story, no additional, undocumented render configuration is needed or permitted purely for visual-regression purposes, consistent with §1.5's Governing Principle 5 (No Duplication Across Component Categories) applied here to test-fixture authorship.

**Accessibility Automated-Scan Integration Targets the Accessibility Story Specifically, Restating §5.10's Build-Time/Manual Split:** Where an automated accessibility-scanning tool (addressing §5.10's "Build-Time/Automatable" category — alt-text presence, `aria-label` presence, heading-sequence conformance) is integrated into the Storybook tooling pipeline, it runs against every story by default but is specifically **required**, not merely permitted, to run against each component's dedicated Accessibility Story (§18.5, item 5), since that story is deliberately configured to expose the exact interaction states (an open Modal, an expanded Accordion) where automated scanning has the greatest diagnostic value.

### 18.9 Governance Rules for Documentation Maintenance

**Documentation Updates Are a Mandatory, Non-Optional Consequence of Any Component Contract Change — Restating and Extending Checklist D's Existing Trigger:** Consistent with §7.5's Checklist D ("New or Modified Component Contract Review") and its identical restatement across every per-category section's own closing checklist item (§12.7, §13.8, §14.10, §15.10, §16.10, §17.10), any event triggering Checklist D **also** triggers a corresponding documentation-entry update (§18.3) and, where the change affects visual rendering, a corresponding story update (§18.5) — this is not a ninth, independently-triggered checklist item but the direct documentation-layer consequence of a trigger this document has already established six times over; Section 18 introduces no new trigger condition, only confirms documentation's place among that trigger's required outputs.

**No Component May Ship (Per §7.6's Continuous Regression-Suite Framing) Without a Complete Documentation Entry — This Is an Operational Verification Gate, Not Merely a Best Practice:** Consistent with §7.2's classification of documentation completeness within the Operational Verification tier, a missing or incomplete documentation entry (any of §18.3's ten required sections absent) is treated with the identical severity Phase 6 §21.7's alert-routing table already assigns to Operational-tier findings — routed to editorial/engineering review, not silently deferred, consistent with this project's consistent refusal (since Phase 5B §5.5) to treat any layer of its own governance as optional.

**Documentation Entries for Deprecated or Superseded Components Are Never Deleted, Only Marked, Restating Phase 5B §3.18.2's Soft-Delete Philosophy:** Consistent with Phase 5B §3.18.2's content-domain soft-delete discipline ("nothing in this system is ever silently overwritten or silently gone") extended here to the documentation layer, a component contract superseded by a future Phase 4/Phase 7 amendment retains its documentation entry, marked as deprecated with a forward-reference to its replacement — never removed outright, preserving the same historical-traceability guarantee Phase 5B §3.18.1's Revision History already establishes for content entities, now applied to component-contract history specifically.

### 18.10 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2, and this section's own placement of documentation within the Operational tier (§18.2):

**Type-Level Verification (§7.3):** Confirms every Storybook Controls configuration (§18.6) is mechanically derived from its component's actual TypeScript props type, with no manually-diverging control definition; confirms no control permits a value outside its governing closed union.

**Behavioral Verification (§7.4):** Confirms every required story category (§18.5's five-item list) is present for every component in every closed inventory (§10.5-style two-directional completeness check, restated here for Storybook specifically); confirms MDX-embedded stories render live and match their component's current implementation rather than a stale, cached snapshot.

**Operational Verification (§7.5):** Extends Checklist D with the documentation-and-story-currency obligation named in §18.9, and adds one further item specific to this section:
- [ ] Confirm every one of the ten required documentation sections (§18.3) is present and each restates only facts already established elsewhere in Sections 1–17 or Phases 4–6, with no independently-authored claim appearing in any documentation entry

### 18.11 Section Resolution Summary

Section 18 has established the deterministic documentation-and-verification architecture ensuring every component contract specified across Sections 1 through 17 remains discoverable, checkable, and durable as this project moves toward implementation:

- Documentation completeness is positioned as an Operational Verification concern within Section 7's existing three-category taxonomy, not a fourth, independent verification mechanism (§18.2).
- Every component carries exactly one documentation entry containing ten required, fixed-order sections, each a restatement of an already-frozen fact from Sections 1–17 or Phases 4–6, never an independently-authored claim (§18.3).
- Storybook's folder organization mirrors this document's own tier-and-category taxonomy exactly, with a two-directional orphan/gap check extending Section 10.5's existing completeness discipline to the story layer (§18.4).
- Five required story categories — Default, Variant Matrix, State, Composition Example, and (where applicable) Accessibility — govern every component, with no story permitted to demonstrate a prop value outside the component's own closed type contract (§18.5).
- Storybook Controls are mechanically derived from each component's TypeScript props interface, with content-projection props populated by bounds-respecting fixture data rather than freely-editable fields (§18.6).
- MDX documentation follows a fixed section order across every component, embeds live stories rather than static screenshots, and closes with a cross-reference footer extending Phase 6 §21.9's documentation-currency obligation (§18.7).
- Behavioral Verification tests and any future visual-regression or accessibility-scanning tooling are authored exclusively against the story fixtures already required by §18.5, never a separately-maintained, independently-drifting test-fixture set (§18.8).
- Documentation updates are a mandatory, non-optional consequence of any Checklist-D-triggering event, missing documentation is an Operational Verification gate rather than an optional best practice, and deprecated component documentation is marked, never deleted, restating Phase 5B §3.18.2's soft-delete philosophy at the documentation layer (§18.9).

Every component contract established across Sections 1 through 17 of Phase 7 is now bound by a complete, closed documentation-and-verification architecture, introducing no new component, prop, variant, token, or behavior of any kind — only the discoverability layer ensuring everything already frozen remains correctly and durably known.

**End of Section 18 — Component Documentation & Storybook Architecture.**

Ready to continue with Section 19.

Phases 1–6 and Phase 7 Sections 1–18 remain frozen and immutable. Continuing with Section 19.

---

# 19. Component Testing Architecture

### 19.1 Purpose and Scope of This Section

Section 7 established a three-category verification taxonomy (Type-Level, Behavioral, Operational) and assigned "executable component tests, run at CI time" as Behavioral Verification's governing mechanism (§7.2), without specifying that mechanism's internal structure. Section 18 further established that these executable tests are authored against Storybook's story definitions rather than a separately-maintained fixture set (§18.8) and positioned documentation completeness within the Operational tier (§18.2). Neither section specified **how Behavioral Verification itself is organized into distinct testing layers**, what each layer's boundary of responsibility is relative to the others, how test fixtures and mocks are sourced without duplicating data already governed elsewhere in this project, or what coverage completeness means against this system's closed component inventories. Section 19 closes this final gap in Phase 7's verification architecture.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1 and the identical constraint restated at the opening of every per-category and cross-cutting section since Section 12, this section introduces no new component, prop, variant, token, state, accessibility behavior, rendering strategy, or business rule. Every testing layer, fixture rule, and governance mechanism specified below exists solely to **verify** that a component's actual runtime behavior matches a contract already frozen in Sections 1–18 — never to define new behavior a test might then be written to enforce.

### 19.2 Testing Layers Within Behavioral Verification

**Restates §7.2's Behavioral Verification Category, Given Its Internal Subdivision:** Section 7.2 defined Behavioral Verification as confirming "composition boundaries (§3), state transitions (§4), accessibility interaction contracts (§5.4–5.7), loading/error lifecycle selection (§6.6)" via "executable component tests." Section 19.2 does not introduce a fourth top-level verification category alongside Type-Level, Behavioral, and Operational (§7.2's closed set remains exactly three) — it subdivides Behavioral Verification into four **testing layers**, each targeting a distinct scope of the composition chain already established in Section 3, consistent with this document's repeated practice of subdividing an already-closed category rather than expanding the category itself (exactly as §12.2 subdivided the Primitive tier into six named field members without adding a seventh tier).

| Testing Layer | Scope | Governing Prior Section |
|---|---|---|
| **Unit** | A single component in isolation, verified against its own props contract | §2 (Props), §12.2's field-primitive precedent |
| **Integration** | A composed subtree spanning two or more tiers, verified against Section 3's composition rules | §3 (Composition Architecture) |
| **Interaction** | A component's response to simulated user input, verified against Section 4's state machine and Section 5's keyboard/focus contracts | §4 (State Management), §5.5–5.6 (Keyboard/Focus) |
| **Accessibility** | A component's conformance to Section 5's derived accessibility contracts, verified via automated scanning and manual review | §5 (Accessibility Implementation Architecture), §18.8 |

**No Testing Layer Exists Independent of the Story Fixtures Already Required by Section 18.5:** Consistent with §18.8's "canonical fixture source" rule, every test authored within any of these four layers renders its subject component using the identical story definitions Section 18.5 already mandates (Default, Variant Matrix, State, Composition Example, Accessibility) — a testing layer's distinguishing property is *what it asserts* about a given story's rendered output, never *what it renders*, since the rendering input is already fixed and singular per §18.8's governing rule.

### 19.3 Unit Testing Boundary

**Restates §7.3's Type-Level Verification, Given Its Explicit Non-Overlap With Unit Testing's Scope:** Section 7.3 already established that "type-level verification requires no test authorship at all for the overwhelming majority of contract properties" — props shape, required/optional correctness, and discriminated-union exhaustiveness are compiler-verified, never unit-tested. Section 19.3 confirms the corollary: **unit tests never re-verify what the compiler already guarantees.** A unit test asserting that a `ServiceCard` "accepts a `title` prop of type `string`" is redundant with, and therefore prohibited alongside, §7.3's compiler-level check — unit testing exists exclusively for behavior the type system cannot express.

**Unit Test Scope, Precisely Bounded:** A unit test for a given component verifies exactly three categories of runtime behavior, each corresponding to a rule already established elsewhere that the type system alone cannot enforce:

1. **Derived-value correctness** (§4.7, §12.4, §15.7) — e.g., that a field primitive's `aria-invalid` attribute is `"true"` if and only if its `errorText` prop is non-`null` (§12.5), a runtime conditional the compiler cannot verify since both are independently-typed props that happen to be governed by a derivation rule stated in prose, not in the type system itself.
2. **Default-value application** (§2.7) — e.g., that `Container` renders at `size="xl"`'s token width when no `size` prop is supplied (§16.4), verifying the documented default (§18.3's Props Table obligation) is genuinely what the implementation applies, not merely what the documentation claims.
3. **Conditional rendering branches** (§13.3's `onDismiss`-conditional-on-`isDismissible`, §15.6's `onToggle`-presence-determines-interactivity) — confirming a component's single-source-of-derivation rules (§12.4's precedent, restated across §13.3 and §15.6) hold at runtime, not merely at the type-union level already covered by §7.3.

**Unit Tests Never Span a Composition Boundary:** Consistent with §3.2's tier definitions, a unit test renders its subject component with directly-supplied props (matching exactly what §18.6's Controls configuration already fixtures) — it never composes that component within a parent Section or Page to observe cross-tier behavior, since that scope belongs exclusively to Integration testing (§19.4). A `ServiceCard` unit test confirms the card's own rendering given a `Service` projection; it does not render a Grid Layout containing multiple `ServiceCard` instances to confirm grid arrangement, which is Grid Layout's own concern (§16.5) tested at its own unit-testing scope, or an Integration-layer concern where the two are tested together (§19.4).

### 19.4 Integration Testing Boundary

**Restates §7.4's Composition-Boundary Behavioral Tests, Given Their Full Layer Specification:** Section 7.4 named three composition-boundary properties requiring behavioral confirmation: that a Server-tier Section composing a Client-tier island does not itself require client-side JavaScript (§3.4); that data narrowing at each composition boundary produces correct minimum-sufficient-slice props (§3.3); and that composition depth does not exceed the four-tier ceiling in practice (§3.7). Section 19.4 assigns these three properties to the Integration testing layer specifically, and adds the two composition-specific verification obligations named across the per-category sections but not yet assigned a testing-layer home:

1. **Sibling-Consumer Data Parity** (§11.2–11.3, §11.6) — confirming that where a component and the Page-level JSON-LD/breadcrumb resolution path are established as "sibling consumers of shared upstream data" (§11.2's pattern), the component's rendered output and the separately-resolved structured-data artifact agree on every shared fact (e.g., a `BreadcrumbList` node and the visible `Breadcrumb` component render the identical trail, restating §11.3's "single computation, multiple renderings" guarantee as an Integration-layer assertion rather than a purely structural one).
2. **Cross-Tier Prop-Narrowing Fidelity** (§3.3's recursive narrowing rule) — confirming that a Section passing data into a composed Composite genuinely supplies only the minimum-sufficient-slice §2.2 requires, never an unnarrowed superset, verified by asserting the composed child receives no prop the Section's own contract did not explicitly narrow toward.

**Integration Tests Are Scoped to Exactly One Composition Boundary at a Time, Never the Full Page Tree:** Consistent with §3.7's composition-depth governance ("no component composition in this system exceeds this four-level depth under normal operation"), an Integration test verifies one Section-composes-Composite, or one Composite-composes-Primitive, relationship at a time (e.g., the specific "CTA Band composing two Instrumented Action Wrapper instances" pattern named in §9.5) — never the entire Page → Section → Composite → Primitive chain in a single test, which would conflate this layer's scope with what §19.11 assigns to CI-gate-level, whole-build verification instead.

**Server/Client Boundary Verification Is an Integration-Layer, Not Unit-Layer, Concern:** Restating §7.4's own example ("that a Server-tier Section composing a Client-tier island... does not itself require client-side JavaScript to render its static content"), confirming this property requires rendering the composed pair together — a unit test of the Section alone or the island alone cannot observe the boundary itself, which is precisely why this verification belongs at the Integration layer.

### 19.5 Interaction Testing Boundary

**Restates §7.4's State-Transition and Accessibility-Interaction Behavioral Tests, Given Their Full Layer Specification:** Section 7.4 named the Form State three-phase lifecycle (§4.4), the Ephemeral-UI-State non-leakage rule (§4.3), the keyboard-interaction table (§5.5), and the focus-management lifecycle (§5.6) as requiring runtime confirmation "under simulated interaction." Section 19.5 assigns these to the Interaction testing layer, distinguished from Integration testing (§19.4) by its focus on **temporal sequences of simulated user input** rather than static composition-tree structure.

**Interaction Test Scope, Enumerated Against Already-Closed Tables:**

1. **Form State Lifecycle Transitions** (§4.4) — simulating field input, submission, and each `ActionResult` branch (`ok: true`, `VALIDATION_ERROR`, `RATE_LIMITED`, `UNKNOWN_ERROR`, Phase 5B §7.5) in sequence, confirming the Form component's rendering correctly reflects each phase without an intermediate, uncovered state (§6.6's Pending/Rejected/Resolved framing, restated at the Form-specific granularity §4.4 already established).
2. **Keyboard-to-Action Mapping** (§5.5's closed table) — simulating each named key (`Escape`, `Tab`/`Shift+Tab`, `Enter`/`Space`, `ArrowDown`/`ArrowUp`, `ArrowLeft`/`ArrowRight`) against its specific governing component and confirming the exact action §5.5's table specifies, with **no key binding outside that table ever asserted**, restating §5.5's own closing rule ("no component introduces a custom key binding outside this table") as a testing-layer prohibition against writing a test for a keyboard behavior the contract does not authorize.
3. **Focus-Trap Three-Phase Lifecycle** (§5.6) — simulating trap entry, Tab-cycling containment, and trap exit with restoration, for exactly the three components §5.6 names (Modal, Drawer, Search Overlay), and separately confirming Mega Menu's explicit non-trapping behavior as a **negative** assertion (§5.6's stated exclusion, verified by confirming focus is *not* contained, exactly as important a test as confirming containment where it is required).
4. **Ephemeral UI State Non-Leakage** (§4.3) — confirming that interacting with a component's internal state (e.g., expanding one FAQ Accordion item) produces no observable change in any sibling or parent component's own rendering, verifying §4.3's "never reported upward" rule as a negative assertion.

**Interaction Tests Never Assert Against `trackEvent()`'s Actual Network/Analytics-Vendor Behavior:** Consistent with §19.9's mock-strategy rule (below) and Phase 5B §8.5's "fire-and-forget" characterization, an Interaction test confirming the Instrumented Action Wrapper (§9.2) fires correctly asserts that `trackEvent()` **was called** with the correct `AnalyticsEvent` payload shape (§9.4) — it never asserts that GA4 or Clarity actually received or processed that call, since that would cross into third-party-boundary territory Phase 5B §8.7 already establishes as a separately-governed, non-blocking concern outside this component-testing architecture's authority.

### 19.6 Accessibility Testing Strategy

**Restates §5.10's Build-Time/Manual Split and §18.8's Automated-Scan Integration, Given Their Full Testing-Layer Specification:** Section 5.10 already divided accessibility verification into "Build-Time/Automatable" (alt-text presence, `aria-label` presence, heading-sequence conformance, single-`<main>` structural lint) and "Manual/Judgment-Based" (color-contrast against finalized tokens, genuine screen-reader walkthroughs, reduced-motion fallback quality) categories. Section 19.6 confirms the Accessibility testing layer (§19.2's table) is exclusively the **automated** half of that split — the manual half remains, unmodified, within Operational Verification's checklist-driven review (§7.5, §18.9), never absorbed into this section's executable-test scope.

**Automated Accessibility Testing Runs Against Every Story, With the Dedicated Accessibility Story as Its Required Minimum:** Restating §18.8's rule verbatim in its testing-architecture consequence, automated accessibility scanning executes against the full story set §18.5 requires (Default, Variant Matrix, State, Composition Example) for defense-in-depth, but is **specifically required**, not merely permitted, to run against each component's dedicated Accessibility Story — since that story is deliberately configured (§18.5, item 5) to expose interaction states (an open Modal, an expanded Accordion) where a static, unexpanded Default story would miss a live-region or focus-trap defect entirely.

**Accessibility Testing Never Substitutes for the Manual Verification Category — This Boundary Is a Governance Rule, Not a Technical Limitation Alone:** Consistent with §5.10's own honest framing ("ultimately requiring human verification of the experience, not merely the markup's presence"), a passing automated-accessibility-test suite is never treated, anywhere in this project's governance, as sufficient sign-off for Checklist D's manual-review items (§7.5) — this restates, rather than weakens, the severity distinction already established in Phase 6 §21.7's alert-routing table between automatable and judgment-based findings.

### 19.7 Visual Regression Testing Strategy

**Restates §18.8's Visual-Regression Scoping Rule, Given Its Full Testing-Architecture Placement:** Section 18.8 already established that "any visual-regression-testing mechanism this project's implementation phase eventually adopts is scoped to snapshot exactly the story set already required by §18.5" — Section 19.7 confirms visual regression testing sits **outside** the four-layer taxonomy of §19.2 (Unit/Integration/Interaction/Accessibility), since it verifies a categorically different property: not *whether* a component's behavior matches its contract, but *whether* its rendered pixel output has changed at all since a prior, approved baseline — a concern orthogonal to contract conformance and therefore not itself one of Behavioral Verification's four sub-layers, but a separate, parallel check operating on the identical story fixtures.

**Visual Regression Baselines Are Approved Exclusively Through the Same Operational Verification Process Governing Checklist D:** Consistent with §7.5's shared-ownership model ("not a single role's unilateral sign-off") and Phase 6 §21.9's documentation-governance precedent, a visual-regression baseline update (confirming an intentional rendering change rather than flagging a regression) is itself subject to the identical Checklist D review already required for any component-contract modification (§7.5) — a baseline is never silently re-approved by the same automated pipeline that flagged the difference, preserving the human-judgment checkpoint this entire verification architecture has consistently required at every layer touching genuine visual or experiential change.

**Visual Regression Testing Is Bounded to Components, Never Whole-Page Composition:** Consistent with §19.4's Integration-layer scoping rule ("never the full page tree"), visual regression snapshots are captured per-story (i.e., per-component, per-variant), never as full-page screenshots spanning the entire Page → Section → Composite → Primitive chain — full-page visual verification, where genuinely needed, is a Phase 9/DevOps-adjacent deployment-verification concern (extending the precedent already set by Phase 6 §19.7's "Gate 8" deployment-time checks), outside this section's component-scoped authority.

### 19.8 Fixture Management

**Restates §18.6's Content-Projection-Prop Fixture Rule, Given Its Full Test-Data Governance:** Section 18.6 already established that Storybook fixtures for content-projection props are "realistic, representative fixture data matching that field's own Phase 5B validation bounds" — Section 19.8 confirms this is the **sole** source of fixture data for every testing layer in §19.2; no testing layer maintains its own, independently-authored fixture set.

**Fixture Data Is Versioned Alongside the Component Contract It Serves, Never Alongside the Test File in Isolation:** Consistent with §10.6's registry-maintenance governance (fixture/contract pairing updates triggered by the same event) and §18.9's mandatory documentation-update trigger, a fixture's validity is a direct function of the Phase 5B validation bounds it must respect — where those bounds change (a Phase 5B amendment, per Phase 6 §21.9's governance process), every fixture respecting the old bounds is treated as immediately stale across every testing layer simultaneously, never patched independently per test file.

**Fixtures Never Encode a State the Validation Layer Would Reject:** Restating §18.6's anti-fabrication-adjacent rule ("could produce a fixture violating those bounds") as a testing-specific prohibition, no unit, integration, or interaction test is ever authored against a fixture representing an impossible domain state (e.g., a `Service` fixture with a `name` field violating Phase 5B §3.1's `3–80 char` bound, or a `CaseStudy` fixture with `clientAuthorizationConfirmed: false` paired with `status: PUBLISHED`, a combination Phase 5B §5.3's validation gate already structurally prevents from existing) — testing an impossible state provides no genuine verification value and risks masking a real contract gap behind a fixture that could never occur in production.

### 19.9 Mock Strategy

**Boundary-Module Mocking, Direct Extension of Phase 5B §8.1's Single-Call-Site Discipline:** Consistent with Phase 5B §8.1's rule that every external integration is confined to exactly one boundary module, and §9.4's confirmation that components never call `trackEvent()` except through the single Instrumented Action Wrapper pattern, every testing layer in this section mocks **at the boundary-module level, never at the individual-component level** — a test verifying the Instrumented Action Wrapper's behavior (§19.5) mocks the single `trackEvent()` boundary-module function itself (Phase 5B §8.5), never a component-internal implementation detail, ensuring the mock's surface area matches exactly the single, already-governed integration seam this document has consistently identified.

**Server Action Mocking Restates §4.4's `ActionResult` Union as the Mock's Return-Type Contract:** Consistent with §4.4's rule that a Form component's Phase 3 rendering is "a direct rendering of the already-validated `ActionResult` union," any test simulating a Server Action's response (§19.5's Form State Lifecycle testing) mocks the Server Action's return value as one of the four already-closed `ActionResult` branches (Phase 5B §7.5) — never a fifth, test-only response shape invented for convenience, restating §7.3's exhaustiveness-checking discipline as a mock-construction constraint specifically.

**The Toast Context Is Mocked as a Whole, Never Partially Stubbed:** Consistent with §4.8's three governance rules bounding the single authorized Context's usage, a test requiring Toast-triggering behavior (e.g., confirming a Newsletter-signup Form's success branch enqueues a toast, §13.6) mocks the entire Context provider's enqueue function as one unit — never mocking only a portion of the Context's exposed interface, since §4.8 Rule 2 already restricts that interface to exactly "an 'enqueue toast' function and the current queue," leaving no partial-mocking surface to begin with.

**CMS/Repository-Layer Data Is Never Mocked at the Component-Testing Layer — It Is Already Resolved Fixture Data:** Restating §3.3's single-fetch principle and §19.8's fixture-sourcing rule, no component test in this architecture mocks a Repository (Phase 5B §6.1) or Content Service (Phase 5B §6.2) call, because — consistent with §1.4's "components consume; they do not fetch" principle — no component under test ever performs such a call in the first place; the already-resolved fixture data (§19.8) stands in directly for what a real Content Service call would have already produced by the time any component receives its props, making Repository-layer mocking a Phase 5B-scoped concern entirely outside this component-testing architecture's boundary.

### 19.10 Coverage Philosophy

**Coverage Is Measured Against the Closed Inventories Established in Sections 12–17, Never Against an Abstract Line/Branch Percentage Target:** Consistent with this document's repeated closed-set discipline (§1.6, §1.8, §12.2, §13.2, §14.2, §15.2, §16.2, §17.3) and §18.4's two-directional orphan/gap check, testing completeness is defined as: **every component named in every closed inventory has at minimum one test at each applicable testing layer (§19.2), and no test exists for a component, prop value, or interaction pattern not already named in Sections 1–18.** This is a deliberately different completeness metric from a generic statement-coverage percentage, which this architecture does not adopt as its primary target, consistent with Phase 6 §21.1's own precedent of preferring deterministic, enumerable completeness checks over statistical or threshold-based ones wherever an enumerable alternative exists.

**"Applicable" Testing Layers Vary by Component, Restating the Split-Component Precedent:** Not every component requires all four testing layers (§19.2) — a Server-tier, non-interactive component (e.g., Breadcrumb, §14.6) has no Interaction-layer obligation, since it accepts no user input and triggers no state transition; its coverage obligation is fully satisfied by Unit and Integration layers alone. This mirrors the same split-component reasoning already applied throughout this document (§1.7, §14.2, §15.2, §17.3) — a component's testing-layer obligations are exactly as broad as its own actual behavioral surface, never padded with layers that would test nothing genuine.

**Coverage Gaps Are Flagged Through the Identical Orphan/Gap Mechanism Already Established for Entities (§10.5) and Stories (§18.4):** A component present in a closed inventory (Sections 12–17) but absent from the corresponding test suite is a governance violation of the same class and severity as an entity with no rendering component (§10.5) or a component with no Storybook story (§18.4) — Section 19.10 introduces no new detection mechanism, only extends the existing two-directional completeness check to this third artifact type (tests), consistent with this document's practice of applying one proven governance pattern repeatedly rather than inventing a parallel one per artifact category.

### 19.11 Testing Governance

**Test Execution Is Positioned Within Phase 6 §21.4's Existing CI/CD Gate Sequence, Not a New, Independent Pipeline:** Consistent with §7.6's framing of Sections 7.3–7.4 as "a continuously-enforced regression suite... run on every build and every code change," and Phase 6 §21.4's already-established eight-gate CI/CD sequence, the four testing layers specified in this section (§19.2) execute within **Gate 4 (Entity & Trust Consistency)**'s adjacent scope or, more precisely, as a parallel, component-layer analog to Phase 6 §21.2's Layer 3 — Section 19 does not insert a new numbered Gate into Phase 6 §21.4's sequence (that sequence remains frozen, per this project's governance model), but confirms this section's tests execute at the identical build-time checkpoint already established for every other Type-Level and Behavioral check this document has specified since Section 7.

**Test Failures Follow Phase 6 §21.7's Existing Alert-Routing Table Without Modification:** A failing Unit, Integration, or Interaction test is routed identically to any other Gate 1–4 build-time failure (Phase 6 §21.7's table — "Build-pipeline failure notification to engineering... Blocking — deploy cannot proceed"); a failing Accessibility-layer automated scan is routed identically to Phase 6 §21.7's warning-tier build checks where the finding is genuinely judgment-adjacent, or as a blocking failure where it corresponds to one of §5.10's named Build-Time/Automatable checks — Section 19.11 introduces no new alert category, only confirms this section's four testing layers map onto categories that routing table already fully covers.

**No Test May Be Skipped, Disabled, or Marked "Known-Failing" Without a Corresponding, Documented Amendment — Restating Phase 6 §21.9's Amendment Discipline:** Consistent with the "frozen section" governance model this entire project has operated under since Phase 1, and Phase 6 §21.9's rule that any system change invalidating a documented claim requires "a documented amendment... not merely a code change with no corresponding update," a test suppressed or disabled without such an amendment is treated as a silent regression of exactly the kind Phase 6 §21.6 and §7.6 both name as this architecture's central risk — test suppression is never a routine engineering decision within this governance model; it is itself a governance event requiring the same review discipline as any other contract change.

### 19.12 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2, applied here reflexively — to the testing architecture's own conformance, not merely to the components it tests:

**Type-Level Verification (§7.3):** Confirms every mock (§19.9) is typed against the exact already-frozen interface it stands in for (`ActionResult`, `AnalyticsEvent`, the Toast Context's enqueue-function signature) — a mock whose shape diverges from its real counterpart's type is a compilation failure, never a runtime-discovered drift.

**Behavioral Verification (§7.4):** Confirms every closed-inventory component (Sections 12–17) has at least one test at each of its applicable testing layers (§19.10's coverage philosophy); confirms Interaction-layer tests never assert a keyboard binding outside §5.5's table; confirms visual regression baselines are never silently re-approved without the Operational review §19.7 requires.

**Operational Verification (§7.5):** Extends Checklist D with one final item specific to this section:
- [ ] Confirm any new or modified component's test suite is authored exclusively against its Storybook story fixtures (§18.8, §19.2), sources all content-projection fixture data from Phase-5B-bounds-respecting values (§19.8), mocks only at the already-established boundary-module seams (§19.9), and introduces no test for a state, prop value, or interaction pattern absent from Sections 1–18

### 19.13 Section Resolution Summary

Section 19 has established the deterministic testing architecture completing Section 7's three-category verification taxonomy and Section 18's documentation architecture, closing the final gap in Phase 7's specification:

- Behavioral Verification is subdivided into four testing layers — Unit, Integration, Interaction, and Accessibility — each targeting a distinct scope of the composition chain already established in Section 3, without expanding Section 7.2's closed three-category taxonomy (§19.2).
- Unit tests verify only what the compiler cannot express — derived-value correctness, default-value application, and single-source-of-derivation conditional rendering — never duplicating Type-Level Verification's already-complete coverage, and never spanning a composition boundary (§19.3).
- Integration tests verify composition-boundary properties (Server/Client rendering independence, prop-narrowing fidelity, sibling-consumer data parity) at exactly one boundary per test, never the full Page-to-Primitive chain (§19.4).
- Interaction tests verify Form State's three-phase lifecycle, the closed keyboard-to-action table, the three-phase focus-trap lifecycle (including Mega Menu's negative exclusion), and Ephemeral UI State's non-leakage rule, while never asserting against third-party analytics-vendor behavior beyond confirming the boundary-module call itself (§19.5).
- Accessibility testing is confirmed as the automated half of §5.10's existing split, required at minimum against each component's dedicated Accessibility Story, and never substituting for the manual-review category it does not replace (§19.6).
- Visual regression testing sits outside the four-layer taxonomy as a parallel, pixel-level check, scoped per-component rather than per-page, with baseline approval always routed through Operational Verification's human-review checkpoint (§19.7).
- Fixture data is sourced exclusively from Phase-5B-bounds-respecting values already required for Storybook (§18.6), versioned alongside the contracts they serve, and never encodes a domain state the Validation Layer would reject (§19.8).
- Mocking occurs exclusively at already-established boundary-module seams (`trackEvent()`, the `ActionResult` union, the Toast Context), with Repository/Content-Service data never mocked at this layer since components never fetch it directly (§19.9).
- Coverage completeness is defined against the closed component inventories via the same two-directional orphan/gap mechanism already governing entities (§10.5) and stories (§18.4), with testing-layer applicability varying honestly by each component's actual behavioral surface (§19.10).
- Test execution occurs within Phase 6 §21.4's existing CI/CD gate sequence and Phase 6 §21.7's existing alert-routing table without modification, and test suppression is governed with the same amendment discipline required for any other frozen-section change (§19.11).

Every component contract established across Sections 1 through 18 of Phase 7 is now bound by a complete, closed testing architecture, introducing no new component, prop, variant, token, state, accessibility behavior, rendering strategy, or business rule — only the verification layer confirming everything already frozen behaves exactly as specified.

**End of Section 19 — Component Testing Architecture.**

Ready to continue with Section 20.

Phases 1–6 and Phase 7 Sections 1–19 remain frozen and immutable. Continuing with Section 20.

---

# 20. Component Governance & Evolution Architecture

### 20.1 Purpose and Scope of This Section

Sections 1 through 19 have collectively established a complete, closed component-engineering specification: a Responsibility Model and composition chain (§1, §3), a props-and-derivation discipline (§2), a state-management taxonomy (§4), an accessibility contract (§5), a loading/error architecture (§6), a verification taxonomy (§7), a token-consumption discipline (§8), an instrumentation architecture (§9), a content-to-component registry (§10), an SEO-integration contract (§11), and five closed-category deep-dives (§12–17) plus documentation (§18) and testing (§19) architectures. What none of these nineteen sections has specified is **how this entire specification itself evolves over time** — who is authorized to change it, what triggers a change, how a change's impact is assessed before it is approved, how a component is retired without breaking what already depends on it, and how the many registries and cross-reference tables this document has accumulated (§10.3–10.4, §18.4's story inventory, §19.10's coverage inventory) are kept synchronized as that evolution occurs. Section 20 is the final section of Phase 7, closing this last gap and serving as this phase's direct structural counterpart to Phase 6 §21's Validation & Operational Governance Architecture.

**Governing Constraint:** Consistent with Section 1.5's Governing Principle 1 and every prior section's identical opening constraint, this section introduces no new component, prop, variant, token, accessibility behavior, rendering strategy, or business rule. Every governance mechanism specified below is a **consolidation and extension** of governance patterns already established piecemeal across Phase 6 §21 and Phase 7's own accumulated per-section rules (§7.5's Checklist D, §10.5's orphan/gap detection, §18.9's documentation-maintenance obligations, §19.11's testing governance) — Section 20's contribution is organizing these into one authoritative, cross-referenced governance model for the component layer specifically, exactly as Phase 6 §21 did for the discoverability layer.

### 20.2 Relationship to Phase 6 §21's Governance Model

**Phase 7's Governance Is a Peer Extension of Phase 6 §21, Not a Parallel or Competing System:** Phase 6 §21.1 already established a governing philosophy — validation is layered, occurs at a specific named boundary, and fails loudly rather than degrading silently — and Phase 6 §22.4 already established the binding inheritance model governing every phase from Phase 7 onward ("Phase 7 and all subsequent implementation phases inherit this architecture as normative guidance"). Section 20 does not restate Phase 6 §21's build-time/deployment-time/runtime/operational taxonomy independently; it **applies that identical taxonomy to the component layer**, exactly as Section 7.2 already did when it "extended the build-time/runtime/operational taxonomy already frozen in Phase 6 §21.2–21.3... into the component domain specifically."

**The Component Layer's Governance Sits Within, Not Beside, Phase 6 §21.4's CI/CD Gate Sequence:** Restating §19.11's already-established placement ("Section 19 does not insert a new numbered Gate into Phase 6 §21.4's sequence... but confirms this section's tests execute at the identical build-time checkpoint"), every governance mechanism specified in this section — approval workflow, registry synchronization, deprecation validation — likewise executes within that same, unmodified eight-gate sequence. Section 20 introduces no ninth gate and no parallel pipeline; it specifies the **decision-making process** surrounding what enters and exits that pipeline, a concern Phase 6 §21 addressed for content governance (§21.5's "Content Governance Workflow") but never extended to the component layer, since Phase 6 predates Phase 7's own existence.

### 20.3 Component Ownership Model

**Restates and Extends Phase 6 §21.9's Shared-Ownership Principle to the Component Layer:** Phase 6 §21.9 established that "this document's currency is a shared obligation across engineering... and content/SEO strategy... no single role owns this document's accuracy unilaterally." Section 20.3 confirms this identical shared-ownership model governs component contracts, restating and consolidating the role-based obligations already distributed across Sections 5, 7, and 18: engineering owns Type-Level and Behavioral Verification conformance (§7.3–7.4, §19.2–19.5); accessibility review owns the Operational, manual-judgment accessibility items (§5.10, §19.6); design/Design-System stewardship owns token-binding conformance (§8.3, §8.7); and no single one of these three constituencies may unilaterally approve a component-contract change without the other two's participation in the review workflow this section specifies (§20.5).

**No Component Has a Single, Individually-Accountable "Owner" — Ownership Is Categorical, Not Personal:** Consistent with this project's consistent avoidance of single-point-of-failure governance (restated at every "shared obligation" moment since Phase 6 §21.9), a component's ownership is scoped to its **tier and category** (§1.6, and its assigned home among Sections 12–17), not to an individual engineer or reviewer — a `ServiceCard` change is subject to Content Display governance (§15) and its cross-cutting obligations (§2, §5, §8, §11), never to the personal sign-off authority of whichever engineer most recently touched that specific file.

### 20.4 Component Lifecycle States

**A Closed, Four-State Lifecycle, Restating Phase 5B §2.4's Publishing Workflow Pattern at the Component-Contract Layer:** Consistent with this document's repeated practice of reapplying an already-proven governance pattern to a new artifact type (§18.9 already did this for documentation entries, restating Phase 5B §3.18.2's soft-delete philosophy verbatim), component contracts follow a four-state lifecycle directly analogous to Phase 5B §2.4's `PublishingStatus` enum:

```
PROPOSED   → a contract change or new-component addition
             (per §20.5's workflow) has been submitted but
             not yet approved — no implementation may
             reference it
        │
        ▼
ACTIVE     → the contract is approved, frozen (per this
             project's "frozen section" governance model),
             and is the authoritative reference every
             implementation must conform to
        │
        ▼
DEPRECATED → a superseding contract has been approved
             (§20.7), but existing implementations
             referencing the deprecated contract remain
             valid for a defined transition window
        │
        ▼
RETIRED    → no implementation may reference this contract;
             its documentation entry is marked, never
             deleted, per §18.9's restated soft-delete rule
```

**This Lifecycle Applies Uniformly to Every Closed Inventory Established in Sections 12–17, With No Exception:** A component's tier classification (§1.6) or category (Form Field, Feedback/Overlay, Navigation, Content Display, Layout Pattern, Animation/Motion) does not exempt it from this four-state model — every one of the roughly forty individually-named components across this document's six closed inventories is, at any given moment, in exactly one of these four states, consistent with the deterministic, exhaustively-classified approach this entire project has applied since Phase 5B §2.4.

### 20.5 Component Change Approval Workflow

**Restates and Consolidates Checklist D Into a Formal, Staged Approval Process:** Section 7.5 established Checklist D as the operational-verification mechanism for "New or Modified Component Contract Review," and every subsequent per-category section (§12.7 through §19.12) added its own targeted extension to that same checklist. Section 20.5 does not introduce a tenth checklist — it specifies the **staged workflow** within which Checklist D (in its now-fully-accumulated form across §7.5, §12.7, §13.8, §14.10, §15.10, §16.10, §17.10, §18.10, §19.12) is actually executed, closing the gap between "here is a checklist" and "here is the process by which that checklist is applied before a change reaches `ACTIVE` status."

```
Stage 1 — Proposal
  A change is proposed against an existing component's
  contract, or a new component is proposed for addition to
  one of Sections 12–17's closed inventories. State: PROPOSED.
        │
        ▼
Stage 2 — Derivation-Source Verification (§2.2, §5.2, §8.2)
  Confirms every new or modified prop, accessibility
  attribute, and token reference traces to an already-frozen
  source in Phases 1–6 or an already-approved prior Phase 7
  section — never an invented shape. A failure here means
  the proposal is redirected to the appropriate earlier
  phase/section for amendment (§20.8), not approved here.
        │
        ▼
Stage 3 — Change Impact Analysis (§20.6)
  The proposal's consequences across the Registry (§10),
  Storybook inventory (§18.4), and Testing coverage (§19.10)
  are assessed before approval, per §20.6's specific
  methodology.
        │
        ▼
Stage 4 — Tiered Sign-Off, Restating §20.3's Shared-Ownership Model
  Engineering confirms Type-Level/Behavioral conformance
  (§7.3–7.4); Accessibility review confirms Operational-tier
  items (§5.10, §19.6); Design-System stewardship confirms
  token-binding conformance (§8.3, §8.7) — all three sign-offs
  required, none individually sufficient.
        │
        ▼
Stage 5 — Freeze
  The contract transitions to ACTIVE and becomes a frozen
  section under this project's established governance model
  — subject thereafter only to the amendment process (§20.8),
  never informal in-place editing.
```

**No Stage May Be Skipped, Restating Phase 6 §21.6's Regression-Prevention Framing:** Consistent with Phase 6 §21.6's insight that a regression suite's value depends on continuous, not selective, execution, this five-stage workflow applies identically regardless of a proposal's apparent size — a one-field addition to an existing props table undergoes the identical five stages as a wholly new component's introduction, since Phase 6 §21.6 already established that the most sensitive regressions in this architecture are precisely the small, easily-overlooked cross-reference drifts (parity checks, naming consistency) that a size-based exemption would be most likely to let through unreviewed.

### 20.6 Change Impact Analysis Methodology

**Restates and Consolidates the Two-Directional Orphan/Gap Detection Pattern Already Established Three Times (§10.5, §18.4, §19.10) Into a Single, Unified Impact-Analysis Procedure:** Rather than three independently-triggered completeness checks, Section 20.6 specifies that any proposed component change is assessed against all three registries **simultaneously, as one Stage-3 procedure**:

1. **Entity-to-Component Impact** (extends §10.5): Does this change alter which Phase 5B §3 entity a component derives from, or the shape of that derivation? If so, every other component consuming the same entity (traceable via §10.3's registry) must be re-verified for continued consistency, per §2.10's cross-component naming-consistency rule.
2. **Story/Documentation Impact** (extends §18.4, §18.9): Does this change require new or updated stories (§18.5), and does it correctly trigger the mandatory documentation update already established in §18.9 as "a direct documentation-layer consequence" of any Checklist-D-triggering event?
3. **Test-Coverage Impact** (extends §19.10): Does this change require new tests at any of the four testing layers (§19.2), and does the change risk invalidating an existing fixture (§19.8) whose validity depended on the pre-change contract shape?

**Impact Analysis Additionally Assesses Cross-Component Ripple Effects Via the Composition Chain (§3):** Consistent with §3.2's strictly one-directional composition rule, a change to a lower-tier component (a Primitive, per §1.6) is assessed for its effect on every higher-tier component composing it (§3.5's tier-pairing patterns) — e.g., a proposed change to the shared `Image` primitive (§11.4) triggers impact analysis against every Composite that composes it (`ServiceCard`, `CaseStudyCard`, `TeamMemberCard`, Client Logo Bar, Author Byline, per §11.4's own "consumed by every higher-tier component" statement), since §3.2's one-directional dependency rule means a Primitive-tier change can only ripple upward, never downward, making the upward-dependency set fully enumerable from the Registry (§10.3) before any change is approved.

**No Change Is Approved Without This Analysis Being Documented as Part of the Proposal Itself:** Consistent with Phase 6 §21.9's documentation-governance principle applied here, the impact analysis's findings (which components, stories, and tests are affected) become part of the permanent record of the change, cross-referenced in the same manner §18.7's MDX cross-reference footer already requires — an approved change with no recorded impact analysis is treated as a governance-process violation, not merely an oversight.

### 20.7 Backward Compatibility and Versioning Discipline

**Additive Changes Are Preferred by Default, Restating Section 1.8's Extensibility Principles at the Contract-Modification Layer:** Consistent with §1.8's "Progressive Extensibility" discipline (already restated at Phase 6 §22.2 Principle 6 and inherited by this entire phase per Phase 6 §22.4), a proposed component-contract change is evaluated first against whether it can be satisfied **additively** — a new optional prop, a new closed-union variant member, a new Storybook story — before any change requiring modification of an existing, already-`ACTIVE` required prop's type or an existing variant's removal is considered. This directly mirrors §12.3's and §13.5's own precedent of extending a shared base contract with named additions rather than modifying the base itself.

**Breaking Changes Require the Full Deprecation Workflow (§20.8), Never a Direct In-Place Modification:** Consistent with this project's "frozen section" governance model applied at its strictest, an `ACTIVE` component contract's required prop, closed-union member, or accessibility obligation is never directly altered — any such change is, by definition, a breaking change requiring the deprecation-and-supersession process specified next, ensuring no implementation already built against an `ACTIVE` contract is silently invalidated by an in-place edit.

**Versioning Is Tracked at the Contract Level, Not the Component-Instance Level — Restating Phase 5B §3.18.1's Revision History Pattern:** Consistent with Phase 5B §3.18.1's already-established pattern (every content-entity save producing a `ContentRevision` snapshot), every `ACTIVE`-to-`DEPRECATED` transition (§20.4) produces an equivalent, permanent record of the contract's prior shape — this is not a new mechanism Section 20 invents, but the direct, analogous application of Phase 5B §3.18.1's proven pattern to component contracts, consistent with §18.9's already-stated intention to "preserve the same historical-traceability guarantee Phase 5B §3.18.1 already establishes for content entities, now applied to component-contract history specifically."

### 20.8 Deprecation and Retirement Workflow

**A Four-Stage Process Mirroring Phase 5B §3.18.2's Soft-Delete Referential-Integrity Rule:** Consistent with Phase 5B §3.18.2's rule that "before any entity can be soft-deleted, the Data Access Layer must verify it is not the target of a required relationship on another `PUBLISHED` entity," a component contract cannot transition from `ACTIVE` to `DEPRECATED` until an equivalent referential-integrity check — traceable via §10.3's registry and §20.6's impact analysis — confirms every consuming component (upward in the composition chain, per §3.2) has either already migrated to the superseding contract or has an approved, time-bound migration plan.

```
Stage 1 — Supersession Proposal
  A replacement contract is proposed and passes the full
  five-stage approval workflow (§20.5) independently,
  reaching its own ACTIVE state alongside the still-active
  original.
        │
        ▼
Stage 2 — Deprecation Declaration
  The original contract transitions ACTIVE → DEPRECATED
  (§20.4), with its documentation entry marked per §18.9's
  restated rule ("marked as deprecated with a forward-
  reference to its replacement — never removed outright").
        │
        ▼
Stage 3 — Transition Window
  Existing implementations referencing the DEPRECATED
  contract remain valid and continue passing every testing
  layer (§19.2) unmodified during this window — the
  deprecation itself introduces no test failure, consistent
  with §19.11's rule against silent regression.
        │
        ▼
Stage 4 — Retirement
  Once the referential-integrity check (restating Phase 5B
  §3.18.2) confirms zero remaining consumers of the
  DEPRECATED contract, it transitions to RETIRED. No new
  implementation may reference it; its documentation and
  test-fixture history remain permanently preserved
  (§18.9, §20.7).
```

**Retirement Never Occurs on a Fixed Calendar Schedule Alone — It Is Consumer-Count-Gated:** Consistent with Phase 5B §3.18.2's rejection of unconditional deletion ("Deletion attempts against a referenced entity are rejected... never allowed to silently orphan a reference"), a `DEPRECATED` component contract's transition to `RETIRED` is gated on the referential-integrity check passing, not merely on elapsed time — a contract with even one remaining consumer, however old the deprecation, does not retire, mirroring exactly the same discipline already governing content-entity soft-deletion in Phase 5B.

### 20.9 Registry Synchronization

**Consolidates and Formalizes the Three Independently-Stated Registry-Maintenance Obligations (§10.6, §18.9, §19.10) Into One Synchronized Update Rule:** Rather than three separate maintenance processes each triggered independently, Section 20.9 confirms that any event completing Stage 5 of §20.5's approval workflow (a contract reaching `ACTIVE`) or Stage 4 of §20.8's deprecation workflow (a contract reaching `RETIRED`) triggers **simultaneous** updates to:

1. The Entity-to-Component and Page-Template-to-Section registries (§10.3–10.4), per §10.6's already-established trigger rule.
2. The Storybook story inventory (§18.4), per §18.9's already-established trigger rule.
3. The test-coverage inventory implied by §19.10's coverage philosophy.

**This Simultaneity Is the Section's Core Governance Contribution — Not a New Registry, but a Single Synchronization Event Replacing Three Independently-Timed Ones:** Consistent with §1.5's Governing Principle 5 (No Duplication Across Component Categories) applied here to governance processes themselves, treating these three updates as one atomic consequence of a single lifecycle-state transition (§20.4) — rather than three separately-scheduled maintenance tasks that could drift out of sync with one another — is what prevents the exact "orphan" and "gap" failure modes §10.5, §18.4, and §19.10 each independently guard against from recurring at the meta-level, between the registries themselves.

### 20.10 Architectural Change Control

**Distinguishes Component-Contract Changes (§20.5–20.8) From Cross-Cutting Architectural Changes, Which Require a Higher-Order Amendment:** Consistent with Phase 6 §21.9's amendment process ("any future change to the live system that invalidates a specific claim in Sections 1–21 requires a documented amendment... not merely a code change with no corresponding update"), a change to any of Sections 1 through 11's cross-cutting architecture (the Responsibility Model, props-derivation rules, state taxonomy, accessibility-derivation sources, verification taxonomy, token-consumption discipline, instrumentation architecture, or the Registry's own structure) is **not** a component-level change subject to §20.5's workflow — it is a foundational-architecture amendment requiring the same formal, documented process Phase 6 §21.9 already established for that phase's own equivalent foundational sections, since altering any of Sections 1–11 would ripple across every one of the roughly forty components governed by Sections 12–17 simultaneously, a consequence far exceeding any single component's own change-impact scope (§20.6).

**Cross-Phase Amendments Follow Phase 6 §22.4's Inheritance Model Without Exception:** Where a proposed component-layer change would require altering a decision frozen in Phase 4, Phase 5A, Phase 5B, or Phase 6 (e.g., a genuinely new design token, per §8.3's "evidence of a genuine Design System gap requiring resolution in Phase 4"), Section 20.10 confirms — restating Phase 6 §22.4's binding rule verbatim — that "no implementation artifact may redefine responsibilities already assigned by these architectural phases," meaning such a proposal is redirected upstream to the owning phase's own governance process, never resolved unilaterally within Phase 7's own component-governance workflow.

### 20.11 Validation Strategy

Consistent with the three-category verification taxonomy established in Section 7.2, applied reflexively to this section's own governance mechanisms, exactly as Section 19.12 applied it reflexively to the testing architecture:

**Type-Level Verification (§7.3):** Confirms every component's lifecycle-state field (§20.4), where represented in tooling, is typed against the closed four-member union with no fifth state expressible.

**Behavioral Verification (§7.4):** Confirms the five-stage approval workflow (§20.5) executes in strict sequence with no stage bypassed; confirms a proposed breaking change is correctly routed to the deprecation workflow (§20.8) rather than an in-place modification; confirms registry synchronization (§20.9) occurs as a single atomic event rather than three independently-timed updates.

**Operational Verification (§7.5):** Extends Checklist D with the final, capstone item consolidating this section's own governance obligation:
- [ ] Confirm any component-contract change has completed all five approval-workflow stages (§20.5), has a documented change-impact analysis spanning all three registries (§20.6), respects the additive-first backward-compatibility discipline (§20.7), and — where breaking — has an approved deprecation plan (§20.8) with simultaneous registry synchronization (§20.9) already scheduled

### 20.12 Section Resolution Summary

Section 20 has established the deterministic governance-and-evolution architecture completing Phase 7 in its entirety, serving as this phase's direct structural counterpart to Phase 6 §21:

- Component governance is confirmed as a peer extension of, never a parallel system to, Phase 6 §21's already-frozen taxonomy and CI/CD gate sequence, with no new gate introduced (§20.2).
- Ownership is categorical and shared across engineering, accessibility review, and Design-System stewardship — never individually held — restating Phase 6 §21.9's shared-obligation model at the component layer (§20.3).
- Every component in every closed inventory occupies exactly one of four lifecycle states (`PROPOSED`/`ACTIVE`/`DEPRECATED`/`RETIRED`), directly mirroring Phase 5B §2.4's Publishing Workflow pattern (§20.4).
- A five-stage approval workflow — Proposal, Derivation-Source Verification, Change Impact Analysis, Tiered Sign-Off, Freeze — formalizes the previously-scattered Checklist D obligations into one staged process applied uniformly regardless of change size (§20.5).
- Change impact analysis is consolidated into one simultaneous procedure spanning the Entity-to-Component registry, story/documentation inventory, and test-coverage inventory, plus composition-chain ripple-effect assessment (§20.6).
- Additive changes are preferred by default; breaking changes are never applied in-place and always require the full deprecation workflow; versioning restates Phase 5B §3.18.1's Revision History pattern at the contract level (§20.7).
- Deprecation and retirement follow a four-stage process directly mirroring Phase 5B §3.18.2's soft-delete referential-integrity rule, with retirement gated on zero remaining consumers rather than elapsed time alone (§20.8).
- The three previously-independent registry-maintenance obligations (§10.6, §18.9, §19.10) are consolidated into one synchronized update triggered atomically by any lifecycle-state transition (§20.9).
- Component-level changes are explicitly distinguished from cross-cutting architectural changes (Sections 1–11) and cross-phase amendments, both of which are redirected to their appropriately higher-order governance process rather than resolved within this section's own component-level workflow (§20.10).

With Section 20's completion, Phase 7 — Component Engineering Specification is now complete in its entirety across all twenty sections, having translated the Design System (Phase 4), Frontend Technical Architecture (Phase 5A), Data Architecture (Phase 5B), and SEO/AEO/GEO Technical Specification (Phase 6) into a fully closed, deterministic, and self-governing set of engineering contracts for every reusable component in the system.

**End of Section 20 — Component Governance & Evolution Architecture.**

Ready to continue with Section 21.

Phases 1–6 and Phase 7 Sections 1–20 remain frozen and immutable. Completing Phase 7 with Section 21.

---

# 21. Phase 7 Completion Summary

### 21.1 Phase 7 Completion Summary

Phase 7 represents the completion of this architecture's **component engineering layer**, translating the Design System (Phase 4), Frontend Technical Architecture (Phase 5A), Data Architecture (Phase 5B), and SEO/AEO/GEO Technical Specification (Phase 6) into implementation-ready engineering contracts for every reusable component in the system. Its purpose has been to define, without exception, what each component's props are, how components compose, where the Server/Client rendering boundary falls, how state is owned and classified, how accessibility obligations are derived and enforced, how loading and error states render, how components integrate with discoverability and analytics concerns, and how the resulting inventory is documented, tested, and governed across its operating lifetime.

Consistent with the discipline stated at the outset of this phase (§1.1), Phase 7 has produced **contracts, never code** — at no point across twenty sections has this phase introduced a literal implementation, a coding tutorial, or a UI design decision independent of what Phases 1 through 6 already froze. Across Sections 1 through 20, the following architectural domains have been fully specified:

| Section | Architectural Domain |
|---|---|
| 1 | Component Engineering Philosophy |
| 2 | Component API & Props Contract Architecture |
| 3 | Component Composition Architecture |
| 4 | State Management Architecture |
| 5 | Accessibility Implementation Architecture |
| 6 | Error Boundary & Loading State Component Architecture |
| 7 | Component Testing & Contract Verification Architecture |
| 8 | Design Token & Theming Consumption Architecture |
| 9 | Analytics & Event Instrumentation Architecture |
| 10 | Content-to-Component Mapping Registry |
| 11 | SEO & Structured Data Component Integration Architecture |
| 12 | Form Field Primitive Component Architecture |
| 13 | Feedback & Overlay Component Architecture |
| 14 | Navigation & Wayfinding Component Architecture |
| 15 | Content Display Component Architecture |
| 16 | Layout Pattern Component Architecture |
| 17 | Animation & Motion Component Architecture |
| 18 | Component Documentation & Storybook Architecture |
| 19 | Component Testing Architecture |
| 20 | Component Governance & Evolution Architecture |

Taken together, these twenty sections establish a **single, internally consistent component architecture** in which every reusable UI element — its props, its tier classification, its Server/Client boundary, its state ownership, its accessibility contract, its token consumption, its instrumentation, its documentation, its tests, and its governance lifecycle — is derived from the same validated domain model established in Phase 5B and rendered through the same deterministic pipeline established in Phase 5A, never from an independently-invented shape.

A defining characteristic of Phase 7, restating the identical structural principle Phase 6 §22.1 established for the discoverability layer, is that **no independent component data model exists**. Every prop, every variant, every accessibility attribute, and every token reference derives from an already-frozen source in Phases 1 through 6. This preserves the architectural principles carried forward across every phase of this project:

- One authoritative content source.
- One rendering pipeline.
- One cache lifecycle.
- One validation system.
- One governance model.

Consequently, component visual design, accessibility, performance, discoverability, analytics, and long-term maintainability are not treated as separate implementation layers competing for ownership of the same component. Instead, they function as coordinated facets of a single engineering contract per component, ensuring that a change made for one concern (a token update, an accessibility fix, a new analytics event) reinforces rather than contradicts every other concern already governing that same component.

### 21.2 Engineering Principles Recap

Phase 7 does not establish a new engineering philosophy independent of the previous phases. Every mechanism specified throughout Sections 1–20 is governed by the same foundational principles introduced progressively across Phases 1–6 and restated at Phase 7's own outset (§1.5). This subsection consolidates those principles into a single reference point, confirming that every component contract, composition rule, state pattern, and governance mechanism established under Phase 7 remains subordinate to these constraints.

**Principle 1 — Inheritance Over Invention.** Every prop, variant, and behavioral rule specified across Sections 2 through 20 traces to an already-frozen decision in Phase 3, 4, 5A, 5B, or 6 — restated at §1.5 as this phase's first Governing Principle and never once departed from across the nineteen sections that followed it.

**Principle 2 — Determinism.** Given identical props, a component renders identical output; given an identical composed tree, the framework's own Suspense/error-boundary mechanism selects an identical rendering phase (§6.6) — component-level determinism directly extending Phase 6 §22.2's Principle 2 into the presentation layer.

**Principle 3 — Build-Time Enforceability Wherever Possible.** Props shapes, discriminated-union exhaustiveness, and token-union membership are TypeScript-compiler-verified wherever the compiler can express the constraint (§7.3), with executable tests and manual review reserved only for what the type system genuinely cannot capture (§19.3's explicit non-duplication rule).

**Principle 4 — Single Source of Truth Per Concern.** Content-projection props derive once from Phase 5B (§2.2); structured data and visible rendering are sibling consumers of identical upstream data, never a dependency chain between them (§11.2–11.3); documentation and tests derive from the identical Storybook fixtures (§18.8, §19.2) — no artifact in this phase maintains an independently-authored copy of a fact established elsewhere.

**Principle 5 — Server-Default, Client-by-Exception.** Every component defaults to Server-tier rendering; Client-tier status is reserved for the closed, named exceptions requiring genuine interactivity, with split-component treatment isolating the client-tier island to its narrowest possible scope wherever a component would otherwise be needlessly promoted in its entirety (§1.7, restated at every subsequent per-category section).

**Principle 6 — No Duplication Across Component Categories.** A shared structural or behavioral pattern is specified once, as a base contract, with per-variant or per-member extensions — never independently re-derived per component, restated across Form Fields (§12.3), Feedback/Overlay (§13.5), and Content Display (§15.3–15.4)'s shared-base-contract precedent.

**Principle 7 — Accessibility and Discoverability as One Discipline, Not Two.** Restating Phase 6 §1.2's foundational position at the component-contract layer (§5.1), no mechanism serving search/AI-retrieval visibility may degrade assistive-technology usability, and no accessibility mechanism may be satisfied in a manner that obscures semantic meaning from non-human consumers.

**Principle 8 — Governance Over Convention.** Consistent with Phase 6 §22.2's Principle 8, component-contract correctness is enforced through the five-stage approval workflow, registry synchronization, and lifecycle-state discipline established in Section 20, never left to developer discretion alone.

### 21.3 Cross-Phase Integration

Phase 7 does not operate as an isolated engineering layer. Every mechanism specified throughout Sections 1–20 depends directly upon foundations established in earlier phases, and — mirroring Phase 6 §22.3's own cross-phase integration map — those earlier phases achieve their full operational value only when translated through Phase 7's component contracts.

**Phase 3 (UX Blueprint) → Phase 7:** Every component's stated purpose and expected user action (§1.3) is inherited verbatim from Phase 3's per-page Scroll Journey specifications and Component Inventory — Phase 7 never redefines what a Hero Section, CTA Band, or Form is *for*.

**Phase 4 (Design System) → Phase 7:** Every visual variant, interaction state, and accessibility requirement is translated into a props-level contract (§2.2's Design-System-token-union derivation source, §8.2–8.3's token-consumption discipline) without altering its substance — Phase 4 remains the authoritative source Section 8 exists solely to consume correctly.

**Phase 5A (Technical Architecture) → Phase 7:** The Server-Component-default/client-island-exception boundary (§1.7), the folder structure's tier-mirroring subdivision (§1.6), and the loading/error-boundary placement rules (§5.5, given full component treatment in §6) are direct, unmodified governing constraints Phase 7 implements rather than reinterprets.

**Phase 5B (Data Architecture) → Phase 7:** Every component's props are typed projections of already-established domain models (§2.2's `Pick`/`Omit` derivation), every relationship a component displays traces to an already-validated typed reference field (§3.3, §10), and every state category a component may hold maps onto Phase 5B's own Server-State/Server-Action distinction (§4.2, §4.4) — Phase 7 introduces no parallel data model of its own.

**Phase 6 (SEO/AEO/GEO) → Phase 7:** Structured data, breadcrumb trails, image alt-text/dimension propagation, and anchor-text fidelity are confirmed as sibling-consumer relationships between Phase 6's Page-level artifact-resolution path and Phase 7's component tree (§11), with Phase 7's own governance architecture (§20) explicitly positioned as a peer extension of, not a departure from, Phase 6 §21's validation taxonomy and CI/CD gate sequence (§20.2).

**Phase 7 as the Engineering-Contract Layer:** Consistent with the dependency stack Phase 6 §22.3 already diagrammed (Phase 1 through Phase 6, strictly one-directional), Phase 7 extends that identical stack by exactly one additional, terminal layer:

```text
Phase 1 — Product Strategy
        │
        ▼
Phase 2 — Information Architecture
        │
        ▼
Phase 3 — User Experience
        │
        ▼
Phase 4 — Design System
        │
        ▼
Phase 5A — Technical Architecture
        │
        ▼
Phase 5B — Domain & Data Architecture
        │
        ▼
Phase 6 — SEO • AEO • GEO
        Search Discoverability Architecture
        │
        ▼
Phase 7 — Component Engineering Specification
        Engineering Contracts for Every Reusable Component
```

This ordering remains strictly one-directional, exactly as Phase 6 §22.3 established for the six phases preceding it. Phase 7 consumes the combined output of Phases 1 through 6 and exposes it as implementation-ready engineering contracts; it does not modify any of those six phases, and — per §20.10's explicit ruling — any apparent need to do so is redirected to the owning phase's own governance process rather than resolved unilaterally within Phase 7.

### 21.4 Readiness for Phase 8

With the completion of Sections 21.1–21.3, Phase 7 has established that every component-engineering concern defined throughout this project is fully specified in contractual terms. No unresolved dependency remains between the component layer and any earlier phase.

Accordingly, the project is now positioned to transition from engineering **specification** to engineering **implementation**. This transition reflects the project's layered methodology in its complete form:

- Phases 1–6 answer what the system is, why it exists, and how it behaves architecturally.
- Phase 7 answers what every component's engineering contract is — its props, its composition, its state, its accessibility, its tokens, its instrumentation, its documentation, its tests, and its governance.
- Phase 8 and subsequent implementation phases answer how these already-frozen contracts are realized as actual, running code within the production codebase.

No implementation phase is permitted to reinterpret architectural or engineering intent independently. Implementation inherits the contracts already established throughout this project in their entirety.

**Architectural and Engineering Inheritance:** Every implementation decision beginning with Phase 8 shall be governed by the specifications established in Phases 1–7. Specifically:

- Phase 4 remains the authoritative source for visual language, interaction design, spacing, typography, motion, accessibility, and component behavior.
- Phase 5A remains the authoritative source for rendering boundaries, routing, caching, deployment architecture, folder structure, runtime behavior, and infrastructure.
- Phase 5B remains the authoritative source for entities, repositories, validation, domain modeling, service contracts, and data ownership.
- Phase 6 remains the authoritative source for discoverability, metadata, structured data, crawlability, canonicalization, search optimization, AI retrieval optimization, and operational governance.
- **Phase 7 remains the authoritative source for every component's props contract, composition boundary, Server/Client classification, state ownership, accessibility implementation, token consumption, instrumentation wiring, documentation structure, testing architecture, and governance lifecycle.**

No implementation artifact may redefine responsibilities already assigned by these seven phases.

**Implementation Responsibility:** Beginning with Phase 8, engineering work shifts from defining component contracts to implementing them faithfully. Literal component code, build configuration, and runtime wiring are expected to consume — never modify — the engineering decisions already frozen throughout Phases 1 through 7. Whenever implementation requires clarification, the appropriate response is to reference the governing phase or section rather than introducing conflicting behavior, consistent with §20.10's explicit redirection rule for any change touching Phase 7's own cross-cutting architecture.

**Normative Guidance:** Phase 8 and all subsequent implementation phases inherit this architecture as normative guidance and must conform to the validation, governance, and architectural constraints established throughout Phases 1–7 unless a formally approved amendment is made under Phase 6 §21.9's documentation-governance process, restated and extended for the component layer specifically by Phase 7 §20.5–20.10's approval and change-control workflow. This inheritance model preserves architectural and engineering consistency across the entire project lifecycle and ensures that implementation remains a realization of the approved architecture and its engineering contracts, never an alternative interpretation of either.

**Formal Declaration:** **Phases 1 through 7, in their entirety, are hereby frozen and immutable.** No further sections remain open in Phase 7. Any future change to any decision established across these seven phases requires a formally approved amendment under the governance processes those phases themselves establish — never an informal, undocumented modification.

**End of Section 21 — Phase 7 Completion Summary.**

Ready to begin Phase 8.
