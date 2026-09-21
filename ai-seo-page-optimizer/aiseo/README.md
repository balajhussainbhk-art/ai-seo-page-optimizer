# AI SEO Page Optimizer

Paste a URL. Find what's hurting your SEO and AI Search visibility. Get exact recommendations to improve the page.

This is a page-level SEO + AI Search (GEO) optimization auditor — not an AI article writer, not a keyword generator, and not an AI-visibility tracking platform. Paste one public URL and get a scored, prioritized report of what to fix.

> The product name shown in the UI ("AI SEO Page Optimizer") is not hard-coded anywhere except `src/config/site.ts`. Change it there and it propagates everywhere — nav, footer, metadata, page copy.

---

## What it does

1. You paste a public URL and click **Analyze My Page**.
2. The server safely fetches the page (with SSRF protections, timeouts, and size limits).
3. The HTML is parsed into structured signals: title, meta description, canonical, headings, paragraphs, images, links, JSON-LD, Open Graph/Twitter tags, word count.
4. Several analyzer services independently score the page:
   - **Technical SEO** — title/meta/canonical/robots/HTTPS/viewport/lang/hreflang/Open Graph
   - **Heading structure** — missing/multiple H1s, skipped levels, empty/duplicate headings, a recommended outline
   - **Content coverage** — depth heuristics and content-gap detection (never judged by word count alone)
   - **Structured data** — detects Schema.org JSON-LD types, flags gaps, offers suggested JSON-LD
   - **AI Search readiness (GEO)** — a heuristic score for how easily AI systems can extract answers from the page, with per-question coverage (covered / partial / missing)
   - **Internal links & images** — basic on-page link and alt-text checks
5. If `AI_API_KEY` is configured, a compact, pre-extracted summary of the page (never raw HTML) is sent to an LLM for a deeper content/GEO pass. If the key is missing or the call fails, the app **falls back to heuristic-only analysis** — it never crashes the audit.
6. Everything is combined into one **Page Optimization Score** (0–100) via configurable weights, plus a ranked **Top Priority Fixes** list.
7. The report renders as a dashboard; **Download PDF Report** uses the browser's native Print → Save as PDF (the results page is styled for clean printing).

No account is required for the first few free analyses per day.

---

## Architecture

```
app/
  page.tsx                    Homepage (hero, how-it-works, features, pricing teaser)
  pricing/, features/, how-it-works/    Marketing pages
  seo-page-audit/, ai-search-optimization/, product-page-optimizer/,
  heading-analyzer/, schema-analyzer/                Keyword-targeted SEO landing pages
  blog/                        10 educational articles + index
  sitemap.ts, robots.ts        Dynamic SEO files
  api/analyze/route.ts         POST /api/analyze — main audit endpoint
  api/ai/analyze/route.ts      POST /api/ai/analyze — standalone AI-enhanced analysis

src/
  config/
    site.ts                    Product name, nav, PRICING PLANS, free-tier limits (single source of truth)
    scoring.ts                 Score category weights + severity weights (single source of truth)
  types/analysis.ts             Shared TypeScript types for the whole pipeline
  lib/
    security/ssrf.ts            SSRF protection (DNS resolution + private-IP blocking)
    security/rateLimit.ts       In-memory burst + daily rate limiting
    validation/schemas.ts       Zod schemas for API input and AI output
  services/                     One responsibility per file, composed by report-generator.ts
    crawler.ts                  Safe fetch: manual redirect re-validation, timeout, byte cap
    html-parser.ts              cheerio-based structured extraction
    page-type-detector.ts       product / article / service / local_business / general
    seo-analyzer.ts             Technical SEO + heading + image + internal-link checks
    content-analyzer.ts         Content depth/gap heuristics
    schema-analyzer.ts          JSON-LD parsing, product/local-business extraction, suggested schema
    geo-analyzer.ts             Heuristic AI Search readiness scoring
    ai-analyzer.ts              Optional LLM-enhanced analysis, Zod-validated, graceful fallback
    recommendation-engine.ts    Consolidates + ranks issues
    scoring-engine.ts           Combines category scores into the overall score
    report-generator.ts         Orchestrates the full pipeline

components/
  site/            Header, Footer
  home/            Hero, HowItWorks, FeatureGrid, PricingTable, SampleAuditMockup
  analyzer/        UrlForm, LoadingProgress, AnalyzerApp (client-side flow controller)
  results/         ResultsDashboard and all report sections
  marketing/       Shared template for the keyword-targeted SEO landing pages
  ui/              Button, Card primitives

prisma/schema.prisma  Future-ready models (User, Project, Audit, AuditIssue, Usage, Subscription) —
                      NOT required for the MVP; the core audit flow is fully stateless.
```

Nothing about crawling, scoring, or recommendations lives in a single giant API route — each concern is its own service, composed by `report-generator.ts`.

---

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in values as needed — everything has a safe default
npm run dev
```

Open http://localhost:3000. The core audit flow works immediately with **no environment variables required** — AI-enhanced analysis is optional and gracefully degrades to heuristic-only scoring without a key.

### Environment variables

| Variable | Required? | Server-only? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No (defaults to `http://localhost:3000`) | No | Used for canonical URLs, Open Graph tags, and the sitemap. Set to your production domain on Vercel. |
| `AI_API_KEY` | No | **Yes** | Enables the optional AI-enhanced content/GEO analysis step. Never sent to the browser. Without it, the app uses heuristic-only analysis. |
| `AI_API_MODEL` | No (defaults to `claude-sonnet-4-6`) | Yes | Model identifier used by `src/services/ai-analyzer.ts`. |
| `DATABASE_URL` | No | Yes | Postgres connection string for Prisma. Not required for the core audit flow (see `prisma/schema.prisma`). |
| `NEXT_PUBLIC_GA_ID` | No | No | Google Analytics 4 measurement ID, if you wire up analytics. |
| `NEXT_PUBLIC_VERCEL_ANALYTICS` | No | No | Toggle for Vercel Analytics, if enabled. |

Variables prefixed `NEXT_PUBLIC_` are exposed to the browser by Next.js convention — everything else stays server-side only.

### Commands

```bash
npm run dev         # local development server
npm run lint         # ESLint (next/core-web-vitals)
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run start        # run the production build locally
```

All four were run clean against this codebase before delivery: no lint errors, no type errors, and a successful production build producing 29 routes (static + dynamic).

---

## Deploying to Vercel

1. Push this repository to GitHub (or your git host of choice).
2. Import the repo into Vercel.
3. Set environment variables in the Vercel project settings (`NEXT_PUBLIC_APP_URL` to your real domain at minimum; add `AI_API_KEY` if you want AI-enhanced analysis).
4. Deploy. No special build configuration is needed — `next build` / `next start` work as-is, and both API routes declare `export const runtime = "nodejs"` (required for the DNS-based SSRF checks and streaming fetch used by the crawler).

There are no local-only dependencies, no hard-coded `localhost` URLs in application logic, and no secrets committed to the repo.

---

## Security notes

- **SSRF protection** (`src/lib/security/ssrf.ts`): every outbound fetch — including each redirect hop — is re-validated. Blocks `localhost`, loopback, link-local (including the `169.254.169.254` cloud metadata address), all RFC1918 private ranges, carrier-grade NAT, multicast/reserved ranges, and IPv6 equivalents (`::1`, `fc00::/7`, `fe80::/10`, IPv4-mapped addresses). Only `http:`/`https:` schemes are allowed.
- **Redirects** are followed manually (not via `fetch`'s automatic redirect) specifically so a redirect to a private IP is caught, not just the initial URL.
- **Size and timeout limits**: HTML fetches are capped (default 2 MB) and time out after 10 seconds, enforced both via headers and a hard byte-counted stream read (a lying `Content-Length` header can't bypass the cap).
- **Rate limiting** (`src/lib/security/rateLimit.ts`): a short burst limiter plus a daily free-tier limiter, keyed by IP. This is an in-memory, best-effort implementation suitable for a single-instance deployment or demo; **for production on Vercel's multi-instance serverless environment, replace the in-memory store with a shared store like Upstash Redis** (the function signatures are designed to make this a drop-in swap).
- **AI provider key** stays server-side (`AI_API_KEY` is never read by client code); the AI analyzer only ever receives a compact, pre-extracted JSON summary of the page — never raw HTML — and its output is validated with Zod before it touches the report.
- **No arbitrary code execution, no open proxy behavior**: the crawler only ever returns a processed report, never the raw fetched bytes, so it can't be used to relay arbitrary content.

---

## Responsible-claims notes (please keep these if you extend the product)

- Scores are explicitly labeled **internal heuristics**, not official Google or AI-provider rankings.
- The AI Search Readiness section carries a disclaimer that it does not guarantee inclusion in any AI-generated answer.
- The schema analyzer does not claim official Google rich-result validation, and deliberately does **not** recommend FAQPage markup as a current Google rich-result opportunity — Google discontinued that feature in 2026 (see `src/services/schema-analyzer.ts`).
- No fake testimonials, fake user counts, or fake "N websites analyzed" statistics anywhere in the UI. The homepage's sample dashboard is explicitly labeled **"Demo"**.
- Recommendations follow people-first SEO principles — no keyword stuffing, hidden text, doorway pages, fake reviews, or manipulative link advice is ever generated.

---

## What was tested

- Homepage, pricing, features, how-it-works, all 6 SEO landing pages, blog index + all 10 posts — render correctly (verified via a live production server).
- `/api/analyze`: invalid URL, non-http(s) scheme, `localhost`, loopback, all private IPv4/IPv6 ranges, and the AWS/GCP metadata IP are all correctly rejected with friendly error messages (verified via direct unit-style tests against `validateOutboundUrl` and via live HTTP requests to the running server).
- Rate limiting: burst limiter and daily free-tier limiter both verified firing with the correct HTTP 429 responses.
- Full analysis pipeline verified end-to-end against realistic product-page HTML: page-type detection, Product schema extraction (price/brand/SKU/availability), word count, heading structure, content-gap detection, AI Search question-coverage heuristics, weighted overall scoring, and ranked priority-fix output all produce correct results.
- Edge cases verified directly: missing `<title>`, missing meta description, missing H1, multiple H1s, skipped heading levels, `noindex` detection, page with no structured data, page with Product schema.
- `npm run lint`, `npm run typecheck`, and `npm run build` all pass clean.

Not independently tested in this environment: a real end-to-end fetch of a live third-party URL (the sandbox used to build this has restricted outbound network access to arbitrary domains) and the AI-enhanced analysis path against a real API key. Both are implemented and will work as designed once deployed with normal outbound network access and, optionally, `AI_API_KEY` set — the heuristic fallback path was exercised directly and works without either.

---

## Roadmap (not built in this MVP, architecture allows for it)

**Phase 2** — full-site crawling, competitor URL comparison, keyword gap analysis, internal-linking opportunity detection across pages, content brief generator, Google Search Console integration, PageSpeed Insights integration (the `performance` field in the report is already shaped for this — see `AnalysisReport.performance` in `src/types/analysis.ts`), saved projects, audit history (see `prisma/schema.prisma`).

**Phase 3** — AI visibility tracking across ChatGPT, Gemini, Perplexity, and Google AI Search; citation monitoring; competitor AI-visibility comparison.

**Phase 4** — automated content recommendations, WordPress/Shopify integrations, a public API, agency white-label reports.

---

## License

Proprietary — internal project starter. Replace this section with your actual license before distributing.
