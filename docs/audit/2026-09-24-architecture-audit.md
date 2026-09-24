# Drug Free Kerala: Architecture, Security & Quality Audit

**Date:** 2026-09-24
**Scope:** This repository at commit `4071de4` (Vite + React 18 SPA) and the µLearn API endpoints it calls.
**Status:** The frontend findings are fixed on branch `upgrade/nextjs` (see the [README](../../README.md) and the [design-system guide](../design-system.md)). The backend findings (B1–B5) are still open with the µLearn backend team.

## How this audit was done

- Every non-generated source file in `src/` was read, along with all configuration files.
- `tsc` was run with both the current settings and `--strict`. `eslint .`, `vite build` and `npm audit` were also run.
- Tailwind usage was counted with a regex scan (reproducible commands are in the appendix).
- Read-only calls were made to the live API: `GET /total/`, `GET /get/?email=<nonexistent>`, and a CORS preflight from a foreign origin. No pledge was created.

## Summary

| Area | Critical | High | Medium | Low |
|---|---|---|---|---|
| Security (this repo) | 1 | 3 | 3 | 2 |
| Security (µLearn backend) | – | 2 | 2 | 1 |
| Architecture | – | 3 | 6 | 2 |
| Styling / design system | – | 2 | 3 | 1 |
| Accessibility | – | 2 | 2 | – |
| Performance / SEO | – | 2 | 2 | – |

**The five issues to fix first:**

1. **A third-party script runs on every page view in production** (`cdn.gpteng.co/gptengineer.js`, left over from Lovable). It can read everything users type, including names and emails. *(S1)*
2. **Anyone can learn the name behind any email address.** The upstream API returns the stored name for any email, and the pledge form shows the original pledger's certificate when a duplicate email is submitted. *(S2, B2)*
3. **There is no server layer.** The browser calls `mulearn.org` directly, so there is no bot protection, rate limiting, input validation or response validation, and the site cannot be rendered on the server. *(A1, A2, S4)*
4. **The design tokens are not used.** App code has 84 arbitrary colour classes, 148 raw palette classes and 2 semantic-token classes. The brand green also fails WCAG AA contrast when used for text or buttons. *(T1, T2)*
5. **Dead and broken code paths:** Next.js-style pages that are never routed, an unreachable certificate lookup that would open `/certificate/undefined`, and 5 type errors. *(A3)*

---

## 1. Security: this repository

### S1 · Critical · Third-party script loaded in production
`index.html:23` loads `<script src="https://cdn.gpteng.co/gptengineer.js" type="module">`, marked "DO NOT REMOVE". It is Lovable's visual-editor hook and serves no purpose in production. It runs with full DOM access on the pledge form, which collects names and emails. If that CDN is compromised, the attacker can take data from every visitor.
**Fix:** delete it now (plan Task 1). The new app's CSP blocks any script that doesn't carry a per-request nonce (plan Task 7).

### S2 · High · Email → name disclosure through the pledge form
`src/components/landing/PledgeForm.tsx:146-158`: when `/create/` answers `is_error: true` (email already used), the response holds the original pledger's `name` and `id`. The form copies them into state, and `ErrorModal` then offers **View Certificate** with that person's name. Anyone can type any email and see who pledged with it.
The underlying cause is on the backend (B2). The API can be called directly, so no frontend-only fix can close this.
**Fix:** a server-side backend-for-frontend (BFF) that only returns a certificate when the submitted name matches the stored name (plan Tasks 4 and 6). The backend should also start requiring a server key (B2).

### S3 · High · No abuse protection on pledge creation
`/create/` is called from the browser with no CAPTCHA and no rate limit. Scripts can inflate the public pledge counter or fill the database with spam.
**Fix (partial):** per-IP rate limiting in the Server Actions. A CAPTCHA (Cloudflare Turnstile) was built, then removed at the owner's request so the site needs no configuration (decision D8).

### S4 · High · 28 known-vulnerable dependencies
`npm audit`: 1 critical, 18 high, 6 moderate, 3 low.
- The critical one is `form-data` (GHSA-fjxv-7rqg-78g4, CRLF injection), pulled in only by **`axios`, which nothing imports**.
- The high ones are mostly build tooling: `rollup` path traversal, `postcss` XSS and file read, `minimatch` and `picomatch` ReDoS, `nanoid`.

**Fix:** remove `axios` and run `npm audit fix` (Task 1). Replace the whole toolchain (Task 2). Enforce `npm audit --omit=dev --audit-level=high` in CI (Task 16).

### S5 · Medium · No security headers
There is no CSP, no HSTS, no `X-Content-Type-Options`, no `Referrer-Policy` and no `frame-ancestors`. The site can be framed, which enables clickjacking of the pledge button.
**Fix:** a nonce-based CSP in `src/proxy.ts` plus static headers in `next.config.ts` (Task 7).

### S6 · Medium · Placeholder package `icons@1.0.0` in dependencies
`npm` reports it as "Package no longer supported". Its repository points at `npm/deprecate-holder`, which means npm reclaimed the name. It is unused. A reclaimed name is a supply-chain risk if it is ever re-published.
**Fix:** remove it (Task 1).

### S7 · Medium · Hero image served from a temporary third-party URL
`src/components/landing/HeroSection.tsx:56` loads `cdn.builder.io/api/v1/image/assets/TEMP/…`. `TEMP` assets are not guaranteed to last, and every page view sends a request to Builder.io. The file is also a **1.96 MB, 2000×1306 PNG**, and it is the page's largest element (the image that decides LCP).
**Fix:** self-host it (Task 1), then serve it through `next/image` as AVIF/WebP (Task 9).

### S8 · Low · YouTube tracking embeds and a runtime script injection
`AboutSection.tsx:17-22` injects `https://www.youtube.com/iframe_api`. `JourneySection.tsx:361` embeds `youtube.com`, which sets tracking cookies before the user plays anything.
**Fix:** click-to-load embeds on `youtube-nocookie.com` (Tasks 10 and 11).

### S9 · Low · Raw API responses logged in production
`HeroSection.tsx:33`: `console.log('Raw API response:', data)`.

## 2. Security: µLearn backend (for the backend team)

These are outside this repository, but they decide whether the frontend fixes actually work.

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| B1 | High | CORS echoes back **any** `Origin` and also sends `Access-Control-Allow-Credentials: true` | Preflight from `Origin: https://evil.example` returned `access-control-allow-origin: https://evil.example` and `access-control-allow-credentials: true` | Allow-list origins. Never combine an echoed origin with credentials. |
| B2 | High | `GET /get/?email=` and the duplicate path of `POST /create/` return the stored **name** for any email | See S2 | Accept these calls only with a server key (`Authorization: Bearer …`) held by the BFF. Longer term, verify email ownership with an OTP before revealing a certificate. |
| B3 | Medium | "Not found" comes back as **HTTP 200** `{"message":"User not found","is_error":true}` | Live probe | Return 404. Clients currently have to parse the body to detect errors. |
| B4 | Medium | No rate limiting visible on public endpoints | No rate-limit headers | Per-IP limits at nginx or in the app. |
| B5 | Low | Server version disclosed: `Server: nginx/1.18.0 (Ubuntu)` | Response header | `server_tokens off;`, and patch the host. |

All API traffic now flows through the site's server (`src/server/mulearn/client.ts`), so when the backend adds a server key for B2, only that one file needs to send it.

## 3. Architecture

### A1 · High · Client-only rendering
The HTML the server sends is `<div id="root"></div>`. Crawlers and link-preview bots (WhatsApp, Facebook, X) see no content and no pledge count. Users see a blank page until 527 kB of JavaScript (168 kB gzipped, one chunk) has downloaded and run.
**Fix:** Next.js 16 App Router. Sections render on the server, and only the interactive parts (the counter, dialogs, gallery, nav) ship JavaScript (Tasks 2 and 8–11).

### A2 · High · API calls hard-coded in components, with no validation
- The three `fetch` calls sit inside `HeroSection.tsx:21`, `PledgeForm.tsx:126` and `CertificateLookup.tsx:21`, each with the full URL written in.
- There is no timeout, no response-shape validation, and no configuration by environment.
- `PledgeForm.tsx:153-155` runs `data.id.toString()`, which crashes if the response shape ever changes.

**Fix:** `src/server/mulearn/client.ts` with zod-validated responses, timeouts and typed errors, behind `src/server/pledge-service.ts` (Task 4).

### A3 · High · Dead, broken and unreachable code
- `src/app/certificate/[id]/page.tsx` and `src/app/create-certificate/page.tsx` are Next.js pages inside a Vite app. They are never routed, they import `next/navigation`, which isn't installed, and they render **mock data**.
- `CertificateLookup` can never be reached: `HeroSection.tsx:13` declares `showCertificateLookup`, and nothing ever sets it to `true`. If it were reachable, it would open `/certificate/undefined`, because not-found comes back as HTTP 200 (B3), and `/certificate/:id` isn't a route (`App.tsx` only has `/` and `*`).
- `CertificateView.tsx`, `Cert.tsx`, `CertImage.tsx` and `CertificateTemplate.tsx` are unused.
- `tsc` reports **5 errors**. `CertificateView` and both orphan pages pass `downloadable` and `onReady` props that `Certificate` does not accept.

### A4 · Medium · Type safety turned off
`tsconfig.json` sets `strictNullChecks: false` and `noImplicitAny: false`, and `eslint.config.js` turns off `no-unused-vars`. ESLint currently reports 6 errors and 7 warnings.

### A5 · Medium · Repository hygiene
- `dist/` is committed and **stale**: `dist/favicon.ico` and `dist/images/certificate-template.jpg` differ from `public/`.
- There are two lockfiles (`bun.lockb` and `package-lock.json`).
- Lovable scaffolding is still present (`lovable-tagger` and the "DO NOT REMOVE" comment).
- The README is one line.
- `public/` holds 10 unreferenced files, including duplicate `.png` copies of every gallery `.jpg`.

### A6 · Medium · Unused components and dependencies
The repo ships 49 shadcn/ui components, and app code imports 7 of them directly (`alert-dialog`, `button`, `input`, `sonner`, `toast`, `toaster`, `tooltip`). These dependencies are unused or used only by unused UI files: `axios`, `@tanstack/react-query` (the provider is mounted but nothing queries), `recharts`, `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers`, `cmdk`, `vaul`, `input-otp`, `embla-carousel-react`, `react-resizable-panels`, `next-themes`, `react-day-picker` and `icons`.

### A7 · Medium · Scattered modal and state handling
There are five hand-built `fixed inset-0` modals (`Index.tsx:29`, `HeroSection.tsx:109`, `SuccessModal`, `ErrorModal`, `CertificateView`) alongside one Radix `AlertDialog`. The open state for the pledge modal is passed down from `Index.tsx` through three components.
**Fix:** one `PledgeDialogProvider`, with accessible shadcn `Dialog`s (Tasks 8 and 12).

### A8 · Medium · Content hard-coded in components
Copy, navigation, contact details, social links and media lists are written inline in JSX. That blocks a Malayalam translation and means every copy change needs a developer.
**Fix:** typed content modules in `src/config/site.ts` and `src/features/*/content/` (Tasks 8–11).

### A9 · Medium · No tests and no CI
There are no unit, component or end-to-end tests, and no pipeline runs lint, type checks or builds.

### A10 · Low · Counter polling ignores tab visibility
`HeroSection.tsx:48` fetches `/total/` every 15 s from every open tab, including background tabs, straight from the upstream API.
**Fix:** render the count on the server, then poll every 30 s only while the tab is visible, through a cached `/api/pledges/total` (Task 9).

### A11 · Low · Inconsistent file naming
The repo mixes `PascalCase.tsx`, `whoweare.tsx` and `use-toast.ts`, and has two separate toast systems (`toaster` and `sonner`) mounted together.

## 4. Styling and design system

### T1 · High · Semantic tokens are defined but not used
Counts are for app code, excluding `src/components/ui`.

| Pattern | Count |
|---|---|
| Arbitrary colour classes (`bg-[rgba(…)]`, `text-[#…]`) | **84** |
| Distinct raw colour values | **15**. Brand green `rgba(92,183,105,1)` alone appears **32×**, with 2 different hover shades |
| Raw palette classes (`bg-gray-100`, `text-zinc-800`, `bg-black`, `text-white`, …) | **148** |
| Semantic token classes (`bg-primary`, `text-muted-foreground`, …) | **2** |

The tokens that do exist in `src/index.css` are shadcn's **slate defaults**. `--primary` is near-black and unrelated to the brand, so even shadcn's own `Button` renders off-brand unless it is overridden with arbitrary classes, which is what happens across the codebase.
**Fix:** Tailwind v4 tokens defined in CSS, mapped from the colours actually in use (Task 3). A test fails the build on any arbitrary or palette colour class (`src/test/design-tokens.guard.test.ts`).

### T2 · High · The brand green fails WCAG AA contrast
| Foreground on background | Ratio | AA (4.5:1) |
|---|---|---|
| White on `#5CB769` (every primary button) | 2.5:1 | ✗ |
| `#5CB769` text on white (certificate ID, links) | 2.5:1 | ✗ |
| `#5CB769` text on black (footer hover, hero on dark photo) | 8.4:1 | ✓ |

**Fix:** keep `#5CB769` as `--brand`, for decoration and for text on dark surfaces. Buttons, links and green text on light surfaces use `--primary: #2B7036` (6.0:1 on white). A test checks every token pair (Task 3). **This is a visible design change, and the design owner should sign off on it.**

### T3 · Medium · Poppins is used but never loaded
`PledgeForm.tsx:64` and `utils/canvas.ts:37` ask for `"Poppins"`, but nothing loads it: there is no `<link>` and no `@font-face`. Certificates are drawn in whatever fallback font the device has, so they look different on different phones.
**Fix:** load it with `next/font` (self-hosted, no request to Google), and wait for `document.fonts.load` before drawing the canvas (Tasks 3 and 13).

### T4 · Medium · Invalid markup and classes that don't exist
- `<h2>` nested inside `<motion.h2>`: `InitiativesSection.tsx:164-173`.
- `<a>` nested inside `<button>` for all five social links: `Footer.tsx:32-56`.
- Duplicated nested `space-y-6 max-w-4xl` wrappers: `PillarsSection.tsx:~120`.
- `bg-grey-100` (typo; generates nothing) and `text-small` (not a Tailwind class): `whoweare.tsx:6,13`.
- `animate-fadeIn` and `delay-100` animations are never defined: `JourneySection.tsx:213,216`.

### T5 · Medium · Layout calculated from `window` during render
`JourneySection.tsx:233-250` reads `window.innerWidth` inside JSX to set heights and order. That cannot render on the server (hydration mismatch) and does not update on resize. Fixed sizes like `w-[570px]` and `h-[180px]` (`whoweare.tsx:12`) overflow narrow phones.

### T6 · Low · Heavy animation with no reduced-motion support
- Infinite `boxShadow` keyframes on the pillar icons.
- One animated `<span>` per word in the initiative descriptions.
- `framer-motion` is used for effects CSS can do, and nothing honours `prefers-reduced-motion`.

## 5. Accessibility

| ID | Severity | Finding | Where |
|---|---|---|---|
| X1 | High | Custom modals have no `role="dialog"`, focus trap, Esc handling or scroll lock | `Index.tsx:29`, `HeroSection.tsx:109`, `SuccessModal.tsx`, `ErrorModal.tsx` |
| X2 | High | Icon-only controls have no accessible names: the hamburger (no `aria-label` or `aria-expanded`), the menu close button, and all five social links | `Header.tsx:65`, `HamburgerMenu.tsx:126`, `Footer.tsx:32-56` |
| X3 | Medium | A global `keydown` handler takes over ArrowLeft and ArrowRight for the whole page | `JourneySection.tsx:131-154` |
| X4 | Medium | Gallery tiles are clickable `<div>`s that keyboard users can't reach. Initiative descriptions only appear on hover. | `JourneySection.tsx:226`, `InitiativesSection.tsx:24-35` |

## 6. Performance and SEO

| ID | Severity | Finding |
|---|---|---|
| P1 | High | One 527 kB JS chunk (Vite warns about it); `framer-motion` is loaded for the whole page |
| P2 | High | The hero is a 1.96 MB PNG, and the initiative images are 150–215 kB PNGs, all without `srcset` or lazy loading |
| P3 | Medium | The certificate template image is downloaded twice (`Certificate.tsx:59-71`) |
| P4 | Medium | `index.html` meta tags are placeholders: description "Drug Free Kerala", and empty `og:image` and `twitter:site`. There is no canonical URL and no sitemap. |

---

## Target architecture

```
Browser
  ├─ HTML rendered on the server (React Server Components): all sections, the real pledge count, metadata
  └─ Client islands: counter polling · pledge/lookup dialogs · certificate canvas · gallery · mobile nav
        │  Server Actions (POST, same-origin, CSRF-checked)      │  GET /api/pledges/total (CDN cache 15 s)
        ▼                                                        ▼
Next.js server (BFF: backend-for-frontend)
  src/server/  zod validation → per-IP rate limit (in memory) → pledge-service → mulearn client (timeout, zod)
        ▼
µLearn API  https://mulearn.org/api/v1/drugfreekerala/{total,create,get}/
```

### Decisions made during the upgrade

| # | Decision | Why | What changes visibly |
|---|---|---|---|
| D1 | **Next.js 16 App Router** on React 19 | Renders on the server with client islands; Server Actions give us a BFF without a separate service; the repo already had Next-style pages, so someone had already intended this move | None |
| D2 | **The browser never calls mulearn.org** | Allows server-side validation and rate limits, and lets the backend lock its endpoints to the site's server later | None |
| D3 | **Tailwind v4 semantic tokens**; `--primary` darkened to `#2B7036` | WCAG AA (T2) | Buttons and green text get darker; `#5CB769` stays for accents |
| D4 | **Certificate lookup needs name and email** | Closes the email → name oracle (S2) at the UI level | Users type the name they pledged with; matching ignores case and extra whitespace |
| D5 | **Nonce-based CSP**, so every page renders per request | Strong XSS protection | None. Upstream data is still cached for 30 s. |
| D6 | **Vercel** is the default host; any Node 20.9+ host works | Zero-config Next.js, CDN and preview deploys | None |
| D7 | **Removed:** `framer-motion`, `react-countup`, gallery pagination (9 items), custom YouTube play/pause button, `/certificate/[id]` URLs | Bundle size and SSR correctness. Public certificate URLs would allow listing every pledger by sequential ID. | The counter shows the real number immediately with no count-up; entrance animations use CSS scroll-driven animations |
| D8 | **No environment variables and no new third-party services** (no CAPTCHA, no Redis) | The owner chose to keep deploys as simple as the original site's | None. Bot protection is limited to per-IP rate limits (see S3). |

## Appendix: reproducible commands

```bash
npx tsc -p tsconfig.app.json --noEmit                         # 5 errors
npx eslint .                                                  # 6 errors, 7 warnings
npx vite build                                                # 526.55 kB JS (167.85 kB gz), 75.39 kB CSS
npm audit --package-lock-only                                 # 28 vulns (1 critical, 18 high)
S=$(git ls-files 'src/*.tsx' 'src/*.ts' | grep -v components/ui)
grep -oE "(bg|text|border|ring|from|to|via|stroke|fill)-\[(#|rgba?)[^]]*\]" $S | wc -l          # 84
grep -oE "\b(bg|text|border)-(gray|zinc|green|red|neutral|emerald|slate)-[0-9]+|\b(bg|text)-(black|white)\b" $S | wc -l  # 148
curl -s -X OPTIONS -D - -o /dev/null -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: POST" https://mulearn.org/api/v1/drugfreekerala/create/   # B1
```
