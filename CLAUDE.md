# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Intent Queue + Ledger Hardware Signing. Agents propose transactions, users review them on a web dashboard, and Ledger hardware wallets enforce authorization via cryptographic signing (EIP-712/EIP-3009). Supports x402 pay-per-call API payments.

## Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Run all dev servers (web + backend) via Turbo
pnpm build            # Build all packages via Turbo
pnpm typecheck        # Type-check all packages
pnpm lint             # Lint with Biome
pnpm format           # Format with Biome (auto-fix)
pnpm ci               # Full CI pipeline: build + typecheck + lint

# Tests (Vitest)
pnpm turbo run test                       # Run all tests across workspaces
cd apps/web && pnpm test                  # Run web app tests only
cd apps/backend && pnpm test              # Run backend tests only
npx vitest run path/to/file.test.ts       # Run a single test file (from workspace root)
npx vitest run -t "test name"             # Run tests matching a pattern

# Database migrations (requires POSTGRES_URL_NON_POOLING)
cd apps/web && pnpm db:migrate
```

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo.

### Workspaces

- **`apps/web/`** — Vite + React 19 frontend **and** Vercel serverless API functions
  - `src/` — React app: TanStack Router (file-based routes in `src/routes/`), TanStack Query, Tailwind + Ledger Lumen design system
  - `api/` — Vercel serverless functions (Node.js handlers, one file per endpoint). Shared utilities in `api/_lib/` (db, repos, auth, validation via Zod)
  - `db/migrations/` — PostgreSQL migration scripts (run in order 001-004)
- **`apps/backend/`** — Standalone Express dev server with in-memory stores (mirrors Vercel API endpoints for local development)
- **`packages/shared/`** — Pure TypeScript: types, constants, intent status state machine, chain/token definitions. Zero dependencies.
- **`packages/skill/`** — OpenClaw CLI skill (`ledger-intent` command)

### Key Patterns

- **Intent status lifecycle:** `pending → approved → authorized → executing → confirmed` (with `rejected`, `failed`, `expired` terminal states). State machine defined in `packages/shared/src/index.ts` (`INTENT_TRANSITIONS`).
- **Two auth models:** AgentAuth (secp256k1 signed headers for agents) and SessionCookie (EIP-712 challenge/verify for web users).
- **Database:** Vercel Postgres (Neon). Raw SQL queries, no ORM. Connection pool in `api/_lib/db.ts`.
- **Path aliases:** `@/*` maps to `apps/web/src/*`; `@agent-intents/shared` maps to `packages/shared/src`.

## Coding Conventions

- **TypeScript strict mode** with `noUncheckedIndexedAccess`.
- **Biome** for linting and formatting: tabs (width 2), double quotes, semicolons always, 100 char line width. `noExplicitAny` is an error.
- **ESM everywhere** — all packages use `"type": "module"`.
- **No Next.js patterns** — this is Vite + React. Do not use `next/dynamic`, Server Actions, or RSC patterns.

### Lumen Design System (frontend)

- **No Tailwind typography** (`font-bold`, `text-sm`, etc.) — use Lumen classes: `heading-0-semi-bold`, `body-1`, `body-2-semi-bold`, etc.
- **No Tailwind default colors** (`text-gray-500`, `bg-blue-600`, etc.) — use semantic tokens: `bg-surface`, `text-muted`, `border-base`, `bg-error`, etc.
- **1:1 pixel spacing** — `p-16` = 16px, `gap-24` = 24px.
- **Border radius:** `rounded-xs` (4px) through `rounded-full` (pill).
- **Icons:** `import { Name } from "@ledgerhq/lumen-ui-react/symbols"`.
- **Components:** `import { Button, Banner, Tag } from "@ledgerhq/lumen-ui-react"`.
- Use `cn()` from `@/lib/utils` for conditional classes, CVA for component variants.

### React / Performance

- Use `Promise.all()` for parallel async work; avoid sequential awaits.
- Prefer TanStack Query over ad-hoc `useEffect(fetch...)`.
- Lazy-load heavy components with `React.lazy()` + `Suspense`.
- Keep effect dependencies primitive and stable.
