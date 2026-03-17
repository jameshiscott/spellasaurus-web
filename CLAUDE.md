# Spellasaurus Web — Orchestrator

Gamified spelling-practice web app for primary-school children, managed by teachers, parents, and school admins.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React, TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| State | TanStack Query + React context |
| Backend | Next.js API Route Handlers (`src/app/api/`) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | OpenAI GPT-4o (text) + OpenAI TTS (`gpt-4o-mini-tts`, British English) |
| Hosting | Vercel |
| Animations | Framer Motion |
| Fonts | Google Fonts — Nunito throughout |

## Environments

| Environment | Git branch | Vercel | Supabase project |
|-------------|-----------|--------|-----------------|
| Development | `develop` | Preview URL | `spellasaurus-dev` |
| Production | `main` | Production URL | `spellasaurus-prod` |

## Repo Layout

```
spellasaurus-web/
├── CLAUDE.md                    # this file (orchestrator)
├── spellasaurus_web_spec.md     # full product spec
├── middleware.ts                # Next.js auth session middleware
├── agents/
│   ├── backend/CLAUDE.md        # API routes, DB, RLS, AI
│   ├── frontend/CLAUDE.md       # pages, components, routing, guards
│   ├── designer/CLAUDE.md       # design system, Tailwind, avatar UI
│   ├── integrator/CLAUDE.md     # Vercel + Supabase wiring, CI/CD
│   └── tester/CLAUDE.md         # unit tests, E2E, local Supabase
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # /login, /register
│   │   ├── child/               # child role
│   │   ├── parent/              # parent role
│   │   ├── teacher/             # teacher role
│   │   ├── admin/               # admin role
│   │   └── api/                 # API route handlers
│   ├── components/              # shared React components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # browser client
│   │   │   ├── server.ts        # server-side client
│   │   │   └── middleware.ts    # session refresh helper
│   │   └── constants.ts         # table name constants
│   ├── services/                # typed Supabase query helpers
│   ├── hooks/                   # custom React hooks
│   └── types/
│       └── database.ts          # auto-generated Supabase types
├── supabase/
│   ├── migrations/              # versioned SQL files (committed to git)
│   ├── seed.sql                 # dev seed data
│   └── config.toml
└── .github/
    └── workflows/
        ├── ci.yml               # PR checks: lint, type-check, test, build
        └── deploy.yml           # deploy on push to develop/main
```

## User Roles

| Role | Dashboard route |
|------|----------------|
| Child | `/child` |
| Parent | `/parent` |
| Teacher | `/teacher` |
| School Admin | `/admin` |

## Agents

| Agent | Folder | Responsibilities |
|-------|--------|-----------------|
| Backend | `agents/backend/` | API routes, Supabase queries, RLS policies, AI integration, session logic |
| Frontend | `agents/frontend/` | Next.js pages, components, state, routing, auth guards |
| Designer | `agents/designer/` | Design system, Tailwind tokens, component styles, avatar/dino UI |
| Integrator | `agents/integrator/` | Supabase + Vercel setup, env config, migrations, CI/CD pipeline |
| Tester | `agents/tester/` | Unit tests, E2E tests, local Supabase setup |
| Arcade | `agents/arcade/` | JS game integration, arcade lobby, game unlocks |

## Scripts

| Script | Description |
|--------|-------------|
| `node scripts/give-coins.mjs <user> <amount>` | Give (or remove) coins from a user |
| `node scripts/check.mjs [--out]` | Run type-check + lint + unit tests, output health report |

### Give Coins

```bash
# By child username (appends @spellasaurus.internal automatically)
node scripts/give-coins.mjs CoolDino 500

# By full email
node scripts/give-coins.mjs parent@test.com 500

# Remove coins (negative amount)
node scripts/give-coins.mjs CoolDino -100
```

Connects to local Supabase by default. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars to target dev/prod.

### Health Check

```bash
node scripts/check.mjs          # print to stdout
node scripts/check.mjs --out    # also write test-report.md
```

Runs TypeScript type-check, ESLint, and Vitest unit tests. Categorises failures as Frontend or Backend issues.

## Working Conventions

- TypeScript strict mode everywhere. No `any` types.
- All coin balance and stats writes go through API route handlers — never direct client DB writes.
- All schema changes = new migration file in `supabase/migrations/`. Never edit existing migrations.
- RLS policies enforce data access at the DB layer — API routes add a second layer of validation.
- Child-safe: no open text or messaging between children.
- GDPR-aware: minimal data retention. No permanent per-word answer history.
- Mobile-first for child flows; tablet/desktop-first for adult dashboards.
- All table name strings come from `src/lib/constants.ts` — never inline strings.
