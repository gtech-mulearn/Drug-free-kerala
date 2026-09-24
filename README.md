# Drug Free Kerala

The official site of [drugfreekerala.com](https://drugfreekerala.com), the anti-drug pledge campaign by μLearn and GTech. Visitors take the pledge, get a personalised certificate, and can find it again later.

[![Contributors](https://img.shields.io/github/contributors/Janukrishna007/Drug-free-kerala.svg)](https://github.com/Janukrishna007/Drug-free-kerala/graphs/contributors)

## Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript in strict mode. Pages render on the server, and only interactive parts ship JavaScript.
- **Styling:** Tailwind CSS v4 on a token-based design system; see [docs/design-system.md](docs/design-system.md).
- **Backend-for-frontend:** Server Actions and route handlers call the µLearn API. The browser never calls it directly.
- **Security:** CSP with a fresh nonce per request, per-IP rate limits, zod validation on both sides.
- **Configuration:** none. Like the original site, the app only talks to the µLearn API (and YouTube for videos), and no environment variables are needed.
- **Tests:** Vitest and Testing Library for unit and component tests; Playwright for end-to-end tests against a production build.

## Getting started

```bash
nvm use 22            # Node 22+ (Next.js 16 needs 20.9 or later)
npm ci
npm run dev           # http://localhost:3000
```

The dev server calls the real µLearn API, so pledges you submit locally are real. To work against a local fake instead, run `node e2e/mock-upstream.mjs`, then start the app with `MULEARN_API_BASE_URL=http://127.0.0.1:4010/ npm run dev`. That variable exists only for this and for the e2e suite.

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next.js core web vitals and TypeScript rules) |
| `npm run typecheck` | Route type generation, then `tsc` |
| `npm test` | Unit, component and design-system tests |
| `npm run e2e` | Playwright suite (desktop and mobile) against a production build with a mock API |
| `npm run check` | Lint, types and tests |

## Project structure

```
src/
  app/                    Routes: page, API, metadata (OG image, robots, sitemap), error pages, /design-system
  proxy.ts                Per-request CSP nonce (Next 16 "proxy", formerly middleware)
  components/
    ui/                   Design-system primitives (Button, Heading, Section, Card, FormField, Dialog, …)
    layout/               Site header, mobile nav, footer
    media/                Click-to-load YouTube embed
  features/
    landing/              Page sections and their content (content.ts holds all copy)
    pledge/               Pledge and lookup: schema (shared client/server), Server Actions, dialogs
    certificate/          Certificate rendering (canvas), sharing, ID format
  server/                 Server-only: µLearn client, pledge service, rate limiting
  styles/                 tokens.css (colour tokens and themes), theme.css (Tailwind theme)
  config/                 site.ts (nav, contact, social), brand.ts (colour literals for non-CSS contexts)
  test/                   Test setup and design-system guard tests
e2e/                      Playwright specs and the mock µLearn API
docs/                     Audit report, design-system guide
```

## How a pledge works

1. The browser validates the form with the same zod schema the server uses.
2. The Server Action `submitPledge` validates again and checks the per-IP rate limit.
3. `pledge-service` calls `POST create/` on the µLearn API, with a timeout and a check on the response shape.
4. If the email has already pledged, the existing certificate is returned only when the submitted name matches. Otherwise the reply is "email already used", and the other person's name is never revealed.
5. The certificate is drawn on a canvas in the browser and can be downloaded as PNG or shared.

Certificate lookup follows the same path (`GET get/?email=`) and requires both the name and the email.

## Deployment

The app is built for Vercel, and any Node 20.9+ host works too (`npm run build && npm start`). There are no environment variables to set.

Rate limits are counted in each server instance's memory. That's enough to stop a single client hammering the form, but the counts aren't shared between instances.

**When self-hosting:** your reverse proxy must *overwrite* `X-Forwarded-For` (nginx: `proxy_set_header X-Forwarded-For $remote_addr;`). Otherwise clients can spoof their IP and get around the rate limits.

## Security notes

- Response headers: nonce-based CSP (`'strict-dynamic'`, `frame-ancestors 'none'`), HSTS, `nosniff`, `X-Frame-Options: DENY`, a strict referrer policy and a Permissions-Policy.
- Logs never include names or emails.
- There's no CAPTCHA, which keeps the site configuration-free. Automated submissions are limited only by the per-IP rate limit. The µLearn API can also be called directly until the backend fixes the issues below.
- YouTube loads nothing until a visitor presses play, and then uses `youtube-nocookie.com`. Fonts are self-hosted.
- Open backend items (CORS, email-based disclosure, rate limiting) are listed in [the audit](docs/audit/2026-09-24-architecture-audit.md#2-security-µlearn-backend-for-the-backend-team).
