# SEO Growth Hub — Enterprise Technical Architecture (Phase 5A, Extended)

*(Sections 1–5 remain unmodified as previously approved. Appending Sections 6–10 below.)*

---

# 6. Middleware Strategy

Next.js `middleware.ts` (already reserved as a placeholder in the Application Folder Structure, Section 4) is scoped narrowly and deliberately — middleware runs on every matched request, so its responsibilities are limited to lightweight, universally-applicable concerns. Heavier logic remains in Server Actions/Route Handlers per Section 5.6.

### 6.1 Security Headers
- Middleware applies a consistent security header set to every response: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `frame-ancestors 'none'` via CSP), `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` restricting unused browser APIs (camera, microphone, geolocation — none of which this site requires).
- **Rationale:** Directly implements PRD Non-Functional Requirement Section 9.2 (Security) at the transport/response layer rather than relying on per-page discipline — a single enforcement point guarantees no route accidentally ships without baseline hardening.
- **CSP Specificity:** Content-Security-Policy is scoped to explicitly allow only required third-party origins (analytics, CMS media domains, form-related endpoints) rather than a permissive wildcard policy — every allowed origin must be traceable to an approved integration from Section 2 (Technology Stack) or Section 9 (Monitoring Strategy) below.

### 6.2 Geo Detection
- Middleware reads geolocation data (available natively via the hosting platform's edge request context, per Section 2's Vercel-compatible hosting assumption) to support **non-blocking, enhancement-only** use cases:
  - Pre-selecting the nearest relevant `/locations/[city]` page for a subtle "Serving [Detected City]?" prompt on the homepage or `/locations` hub (UX enhancement, not a forced redirect — per Design Philosophy Section 2's "restraint" principle, this must never auto-redirect a user away from the page they intentionally navigated to).
  - Future-facing hook for locale detection if/when internationalization is implemented (IA Phase 2 Section 20 future expansion item).
- **Explicit Constraint:** Geo detection never gates content visibility or blocks access — it only informs optional, dismissible UI suggestions. This preserves crawlability (a crawler with no geo signal must see identical core content to any user), directly protecting the SEO constraint in PRD Section 10.4.

### 6.3 Redirect Handling
- Middleware hosts the **centralized redirect map** for:
  - Legacy URL migrations (if the business had a prior website — redirect rules loaded from a maintained config, not hardcoded inline).
  - Trailing-slash normalization and canonical host enforcement (e.g., non-www → www or vice versa, decided once and applied universally) — directly supports canonical URL handling (IA Phase 2 FR-32).
  - Deprecated/renamed content slugs (e.g., a blog post or service slug renamed post-publish) — redirect entries added as part of content-governance workflow, not ad hoc code changes.
- **Rationale:** Centralizing redirects in middleware (rather than scattering them across `next.config.ts` and page-level logic) gives content editors and engineers a single, auditable source of truth — critical for a site whose core value proposition depends on avoiding broken links and lost link equity.

### 6.4 Future Authentication Readiness
- No authentication is implemented at launch (no user accounts exist in the current PRD scope). However, middleware is architected with a **reserved matcher pattern** for a future `(portal)` route group (flagged in Section 5.2 as a future addition) — the middleware file structure anticipates a session-check branch that currently does not execute, rather than requiring a structural rewrite when the client portal (IA Phase 2 Section 20 future item) is eventually built.
- **Rationale:** This is a "readiness," not an implementation — no auth libraries, session cookies, or protected routes exist yet. The only present-day artifact is that middleware's routing/matcher logic is written in a way that adding an authenticated route group later is additive, not disruptive.

### 6.5 Rate Limiting Readiness
- Form submission endpoints (Server Actions per Section 5.6) are the primary abuse surface (spam submissions to `/free-audit`, `/consultation`, `/contact`). Middleware reserves a rate-limiting checkpoint (IP- or session-based request throttling) positioned ahead of these Server Actions.
- **MVP Posture:** Rate limiting logic itself (specific thresholds, storage backend for request counts — e.g., edge KV store) is **not finalized in this phase** — this is intentionally deferred to Phase 9 (DevOps/Infrastructure), since it depends on final hosting platform capabilities. What is architecturally committed now is the **checkpoint's existence and position** in the request lifecycle, consistent with Form UX Strategy's requirement (Phase 3 Section 14) that spam protection remain invisible to legitimate users — rate limiting is a silent, backend safeguard, never a user-facing CAPTCHA by default.

---

# 7. Caching Strategy

### 7.1 Browser Caching
- Static, versioned assets (JS/CSS bundles, fonts, `public/` assets) are served with long-lived, immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`) — safe because Next.js's build-hash-based filenames guarantee any content change produces a new URL, eliminating stale-cache risk.
- HTML documents (page responses) are served with short or no browser cache lifetime, deferring freshness control to CDN/ISR layers (Section 7.2–7.3) rather than the browser — ensures users always receive the current CDN-cached version rather than a stale local copy, while still benefiting from CDN-level speed.

### 7.2 CDN Caching
- Given the Vercel-compatible hosting assumption (Section 2), statically generated pages (Section 3's SSG-designated routes) are served directly from CDN edge cache by default — no origin server round-trip on cache hit.
- CDN cache is invalidated automatically on redeploy for build-time SSG content, and selectively invalidated via on-demand ISR revalidation (Section 7.3) for content updated between deploys — avoiding full-site cache purges for single-content-item edits.
- **Rationale:** This directly operationalizes the Rendering Strategy's SSG-first philosophy (Section 3) — the CDN layer is where that architectural decision actually pays off in real-world load times, satisfying PRD Section 9.1 (Performance) and Section 11.4 (Core Web Vitals as a success KPI).

### 7.3 ISR Cache Behaviour
- Pages using ISR (homepage, blog/case-study/FAQ/testimonial indexes with webhook-triggered revalidation, and location pages with time+on-demand revalidation per Section 3.2) follow a **stale-while-revalidate** pattern: the CDN continues serving the last-known-good cached version while a fresh version is generated in the background, swapping in once ready — users never see a slow, blocking regeneration.
- **On-Demand Revalidation Trigger:** The `app/api/revalidate/` Route Handler (Section 4) is the single entry point CMS webhooks call on content publish/update, invoking Next.js's `revalidatePath`/`revalidateTag` APIs for the specific affected route(s) — avoiding blanket revalidation of unrelated pages.
- **Time-Based Fallback:** Independent of webhook triggers, a conservative time-based revalidation window (Section 3's per-route-category intervals) acts as a safety net in case a webhook fails to fire — ensures content can never drift stale indefinitely even if the CMS integration has a transient issue.

### 7.4 Image Caching
- Images processed via `next/image` (mandatory per Section 2 and Design System Section 10) are cached at the CDN/edge layer per unique transformation (size/format variant), with long cache lifetimes since transformed image URLs are content-hash-derived — a source image change produces new derived URLs rather than invalidating a shared cache key.
- Source images hosted via the CMS media layer (Section 2.1, vendor TBD) are assumed to sit behind their own CDN; Next.js's image optimization layer caches its transformed output independently of that upstream caching, so a slow upstream CMS asset host does not repeatedly degrade end-user load times after first render.

### 7.5 Static Asset Caching
- Fonts, icons (Design System Section 9), and any locally-hosted static brand assets (logo files) are treated identically to the immutable-asset policy in Section 7.1 — fingerprinted filenames, maximum cache lifetime, zero revalidation overhead.
- `sitemap.xml` and `robots.txt` (generated dynamically per Section 4's `app/sitemap.ts`/`app/robots.ts`) are cached with a moderate, time-based revalidation window (not `immutable`, since sitemap content changes as new pages are added) — balances crawler-freshness needs (PRD FR-30/FR-31) against unnecessary regeneration cost.

---

# 8. Logging Strategy

### 8.1 Build Logs
- Standard CI/build-pipeline output (type-checking failures, `generateStaticParams` errors, broken CMS content references caught at build time) is retained per-deploy and surfaced through the hosting platform's native build log interface — no custom build-logging infrastructure required at this stage.
- **Governance Rule:** A build that fails type-checking or encounters a malformed content shape (Section 1, Principle 3 — "type safety as a structural guarantee") must fail the deploy outright rather than warn-and-continue — this is a deliberate architectural stance ensuring content/data integrity issues are caught before reaching production, not discovered by users.

### 8.2 Error Logs
- Runtime errors caught by the root and route-segment `error.tsx` boundaries (Section 5.5) are logged server-side with enough context (route, timestamp, and non-PII request metadata) to diagnose without capturing sensitive user input.
- **MVP Posture:** Structured, queryable error logging (beyond default hosting-platform console/runtime logs) is formally deferred to the **Future Sentry Integration** described in Section 9.4 — this section establishes that error boundaries are the architectural capture point; the aggregation/alerting tooling is addressed under Monitoring Strategy.

### 8.3 Form Submission Logs
- Every Server Action handling a lead-generation form (`/free-audit`, `/consultation`, `/contact`, per Section 5.6) logs a submission event (timestamp, form type, success/failure status) independent of whatever downstream CRM/email routing integration ultimately receives the lead (integration specifics deferred to Phase 8 — Forms, Lead Routing & Integrations).
- **Rationale:** This log exists as a **reconciliation safety net** — if a downstream CRM/email integration silently fails, the submission log provides an audit trail proving the user's data was received by the server even if it didn't reach its final destination, preventing lost leads from going undetected (directly protects the PRD's Lead Generation Goals, Section 3.6).
- **PII Handling:** Submission logs record that a submission occurred and its technical outcome; whether full form contents (name/email/message) are included in this log layer versus only in the downstream lead-routing system is a data-retention policy decision deferred to Phase 8, flagged here so it isn't overlooked.

### 8.4 Search Logs
- Search queries entered via the Search Overlay (UX Phase 3 Section 23, Design System Section 17/19) are logged server-side at the query-execution endpoint (Section 3's server-side search backend) — capturing query text and whether results were returned (zero-result queries specifically flagged).
- **Rationale:** Zero-result search logs are a direct content-gap signal — per UX Phase 3 Section 19 (Empty States), repeated no-result searches for the same term indicate either a missing content opportunity (feeds future blog/service topic decisions) or a UX/synonym-matching gap in the search implementation itself.

---

# 9. Monitoring Strategy

### 9.1 Google Analytics 4
- Implemented as the primary behavioral analytics platform per PRD FR-42, tracking the funnel stages defined in IA Phase 2 Section 12 (Conversion Funnel) and UX Phase 3's scroll-depth instrumentation requirement (Section 4).
- **Event Architecture Principle:** Key conversion events (Free Audit submission, Consultation booking, Contact form submission, Newsletter signup) are tracked as distinct, named events — not inferred solely from pageview/thank-you-page visits — ensuring funnel reporting remains accurate even if URL structures evolve.
- Loaded via a performance-conscious strategy (deferred/async script loading) so analytics instrumentation never competes with Core Web Vitals commitments (PRD Section 9.1) — consistent with Design Philosophy Section 2's performance-aware stance.

### 9.2 Google Search Console
- Integrated per PRD FR-43 — property verification handled via DNS or meta-tag verification method (decided in Phase 9 based on final domain/hosting setup), with `sitemap.xml` (Section 7.5) submitted as the primary crawl-discovery input.
- **Operational Role:** Search Console is the authoritative source for the PRD's Success Criteria Section 11.1/11.4 KPIs (impressions, CTR, indexation rate, structured-data error rate) — the technical architecture ensures nothing (rendering strategy, robots rules, structured data validity) works against clean Search Console reporting.

### 9.3 Microsoft Clarity
- Implemented as a qualitative, session-replay/heatmap layer complementing GA4's quantitative data — used to observe real user interaction with the Conversion Psychology and CTA Placement strategies defined in UX Phase 3 (Sections 11–12), validating whether actual behavior matches the intended scroll-journey and CTA-engagement assumptions documented there.
- Loaded with the same performance-conscious, deferred-script discipline as GA4 (Section 9.1) — no monitoring tool is permitted to degrade the user-facing performance the business is built to sell.
- **Privacy Note:** Session replay tools require clear disclosure in the site's Privacy Policy (`/legal/privacy-policy`, per PRD Section 10.5) — flagged here as a cross-dependency between technical implementation and legal content, not a new legal decision being made in this document.

### 9.4 Future Sentry Integration
- **Not implemented at launch.** Reserved as the designated error-tracking/aggregation tool referenced in Section 8.2, to be activated once the site has production traffic volume justifying dedicated error monitoring beyond hosting-platform default logs.
- **Readiness Posture:** The `error.tsx` boundary structure (Section 5.5) and server-side error-logging discipline (Section 8.2) are already shaped to make Sentry (or an equivalent) a drop-in addition — a client/server error-reporting SDK slotting into existing boundary components — rather than requiring architectural rework at activation time. This mirrors the same "readiness without premature implementation" posture applied to Authentication (Section 6.4).

### 9.5 Monitoring Governance
- All four tools above are treated as **observability inputs to the PRD's Success Criteria (Section 11)**, not standalone tooling decisions — GA4 and Search Console map directly to the Traffic/Conversion/Technical Health KPIs (Sections 11.1–11.4), Clarity supports qualitative UX validation, and Sentry (once active) supports the Reliability non-functional requirement (PRD Section 9.7).

---

# 10. Image Delivery Strategy

### 10.1 Format Strategy — AVIF and WebP
- `next/image` (Section 2, Section 7.4) is configured to serve **AVIF as the first-choice format**, with **WebP as the fallback** for browsers lacking AVIF support, and standard JPEG/PNG as the final fallback — automatic content-negotiation based on requesting browser capability, requiring no manual per-image format decisions from content editors.
- **Rationale:** AVIF/WebP deliver materially smaller file sizes than legacy formats at equivalent visual quality, directly serving the Core Web Vitals/LCP commitment (PRD Section 9.1) given that hero images and card imagery (Design System Section 10) are frequently among the largest contentful elements on a page.

### 10.2 Blur Placeholders
- All images sourced through the CMS media layer generate a low-resolution blur placeholder (`next/image`'s native `placeholder="blur"` pattern), displayed while the full-resolution image loads.
- **Rationale:** This directly implements the Image System's loading-behavior requirement (Design System Section 10 — "Placeholder/Loading Behavior... prevents layout shift") and the Skeleton Loading System's broader principle (Design System Section 22) that loading states must reserve exact final dimensions — blur placeholders are the image-specific expression of that same anti-CLS discipline, with the added benefit of a perceived-performance improvement over a flat skeleton block for photographic content specifically.

### 10.3 Responsive Image Sizes
- Each image usage context defined in Design System Section 10 (aspect-ratio tokens: `ratio-square`, `ratio-video`, `ratio-card`, `ratio-wide`) has a corresponding `sizes` attribute configuration ensuring the browser requests an appropriately scaled image variant per breakpoint (Section 25 of the Design System — Desktop/Tablet/Mobile) rather than always downloading the largest available version.
- **Card Grid Images** (service, industry, case study, blog cards — Design System Section 13): sized relative to the card-grid column count defined per breakpoint (Design System Section 6.4 — 3-column desktop, 2-column tablet, 1-column mobile), so mobile users downloading a single-column layout receive a correspondingly narrower image, not a desktop-sized asset scaled down client-side.
- **Hero Images:** Given their large, above-the-fold, LCP-critical role (UX Phase 3 Sections 5–9), hero images are explicitly prioritized for eager loading (Section 10.5) and are the one image category exempt from lazy-loading deferral.

### 10.4 Client Logo Handling
- Client logos (Trust Bar component, Design System Section 12) are treated as a distinct sub-case within the responsive image strategy: normalized to a fixed display height with `next/image`'s intrinsic sizing, served as static (non-CMS-transformed, or lightly transformed) assets given their small file size and simple graphic nature — full AVIF/WebP negotiation still applies, but blur-placeholder treatment is generally unnecessary given how quickly small logo assets resolve.

### 10.5 Lazy Loading Rules
- **Default Rule:** All images below the first viewport (per page-specific "above the fold" definitions established throughout UX Phase 3, Sections 5–10) are lazy-loaded via `next/image`'s native `loading="lazy"` default behavior — deferring network requests until the image nears the viewport.
- **Explicit Exceptions (Eager Loading):** The single largest above-the-fold image per page (typically the hero image, per Section 10.3) is explicitly marked with `priority` (Next.js's eager-load/preload signal), ensuring it does not compete with lazy-loaded below-fold images for early network priority and directly supports LCP timing.
- **Card Grids:** Only the first row of visible cards (Services/Industries/Blog/Case Study grids, per Design System Section 6.4's responsive column counts) is considered "above the fold" on typical viewport heights and thus eager-load candidates on a case-by-case basis; all subsequent rows follow the default lazy-load rule.
- **Governance Rule:** No page may mark more than one image `priority`-loaded — consistent with Design Philosophy Section 2 and UX Phase 3 Section 2's "single dominant element" discipline applied here to network-loading priority, not just visual weight, preventing prioritization conflicts that would otherwise dilute LCP gains.

---

**End of Phase 5A (Extended) — Sections 1–10 Complete and Frozen.**

Phase 5A, now inclusive of Architecture Philosophy, Technology Stack, Rendering Strategy, Folder Structure, App Router Architecture, Middleware Strategy, Caching Strategy, Logging Strategy, Monitoring Strategy, and Image Delivery Strategy, is ready for final approval. Once approved, per the implementation plan this freezes alongside Phases 1–4, and **Phase 5B (Data Layer & TypeScript Domain Models)** becomes the next dedicated response.
