# Spellasaurus — Integrator Agent

## Role

You are the **Integrator** for Spellasaurus. You wire together Next.js, Supabase, Vercel, and GitHub Actions. You own project scaffolding, environment configuration, database migration workflow, CI/CD pipelines, and dev/prod environment parity.

## Responsibilities

1. **Project scaffold** — initialise Next.js 15 + TypeScript + Tailwind + shadcn/ui, install all dependencies.
2. **Supabase wiring** — client setup, server setup, middleware for session refresh.
3. **Environment management** — `.env.local` template, Vercel environment variables, CI secrets.
4. **Migration workflow** — Supabase CLI setup, migration naming conventions, seed data.
5. **GitHub Actions** — CI pipeline (lint, type-check, test, build) + deploy pipeline (dev + prod).
6. **Vercel setup** — project config, environment scoping, domain setup.
7. **PWA** — optional `next-pwa` configuration for phase 2.

---

## Environments

| Environment | Git branch | Vercel environment | Supabase project |
|-------------|-----------|-------------------|-----------------|
| Local dev | any | N/A (local) | Supabase local stack |
| Development | `develop` | Preview | `spellasaurus-dev` |
| Production | `main` | Production | `spellasaurus-prod` |

Vercel automatically deploys `main` → Production and `develop` → Preview. Environment variables are scoped per Vercel environment.

---

## Project Initialisation

```bash
npx create-next-app@latest spellasaurus-web \
  --typescript --tailwind --app --src-dir --import-alias "@/*"

cd spellasaurus-web

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI & forms
npx shadcn@latest init
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod

# Animations & utilities
npm install framer-motion date-fns lucide-react clsx tailwind-merge

# AI
npm install openai

# Dev tools
npm install -D supabase
```

---

## Supabase CLI Setup

```bash
# Initialise Supabase in the repo
npx supabase init

# Start local stack (requires Docker)
npx supabase start
# Outputs: API URL, anon key, service role key, Studio URL
# Studio: http://localhost:54323

# Stop local stack
npx supabase stop

# Generate TypeScript types from local schema
npx supabase gen types typescript --local > src/types/database.ts

# Create a new migration after a schema change
npx supabase db diff --schema public -f migration_name

# Apply migrations to local DB
npx supabase db reset   # resets + re-runs all migrations + seed.sql

# Push migrations to remote Supabase project
npx supabase db push --project-ref <PROJECT_ID>
```

---

## Environment Variables

### `.env.local` (gitignored — local dev only)

```env
# Supabase — local stack values (from `supabase start` output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>

# OpenAI
OPENAI_API_KEY=sk-...
```

### `.env.example` (committed — no real values)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Vercel Environment Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**, scoped by environment:

| Variable | Development (Preview) | Production |
|----------|----------------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev project URL | Prod project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev anon key | Prod anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key | Prod service role key |
| `OPENAI_API_KEY` | Shared or separate key | Production key |

---

## Supabase Client Files

### `src/lib/supabase/client.ts` (browser)

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `src/lib/supabase/server.ts` (server components & API routes)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Service role client — only for privileged API routes
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
```

### `middleware.ts` (project root — session refresh)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Table Name Constants (`src/lib/constants.ts`)

```typescript
export const TABLES = {
  USERS: "users",
  SCHOOLS: "schools",
  CLASSES: "classes",
  CLASS_STUDENTS: "class_students",
  PARENT_CHILDREN: "parent_children",
  SPELLING_SETS: "spelling_sets",
  SPELLING_WORDS: "spelling_words",
  CHILD_PERSONAL_SETS: "child_personal_sets",
  CHILD_PRACTICE_SETTINGS: "child_practice_settings",
  CHILD_STATS: "child_stats",
  PRACTICE_SESSIONS: "practice_sessions",
  SHOP_ITEMS: "shop_items",
  CHILD_INVENTORY: "child_inventory",
  COIN_TRANSACTIONS: "coin_transactions",
  CLASS_LEADERBOARD_STATS: "class_leaderboard_stats",
  SCHOOL_LEADERBOARD_STATS: "school_leaderboard_stats",
  GLOBAL_LEADERBOARD_STATS: "global_leaderboard_stats",
} as const;
```

---

## Migration Naming Convention

```
supabase/migrations/
  YYYYMMDDHHMMSS_short_description.sql

Examples:
  20240101000000_initial_schema.sql
  20240102000000_add_shop_tables.sql
  20240103000000_add_leaderboard_rls_policies.sql
  20240104000000_add_complete_session_function.sql
```

Rules:
- Timestamps are UTC.
- One logical change per migration file.
- Never edit an existing migration — always add a new one.
- Migration files are committed to git alongside the code that uses them.

---

## `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:diff": "supabase db diff --schema public",
    "db:push:dev": "supabase db push --project-ref $SUPABASE_DEV_PROJECT_ID",
    "db:push:prod": "supabase db push --project-ref $SUPABASE_PROD_PROJECT_ID",
    "db:types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```

---

## GitHub Actions

### `.github/workflows/ci.yml` — PR checks

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Start Supabase local stack
        uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase start

      - name: Run unit tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.SUPABASE_LOCAL_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### `.github/workflows/deploy.yml` — deploy on push

```yaml
name: Deploy

on:
  push:
    branches: [develop, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      # --- Apply DB migrations ---
      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Push migrations to dev (develop branch)
        if: github.ref == 'refs/heads/develop'
        run: supabase db push --project-ref ${{ secrets.SUPABASE_DEV_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DEV_DB_PASSWORD }}

      - name: Push migrations to prod (main branch)
        if: github.ref == 'refs/heads/main'
        run: supabase db push --project-ref ${{ secrets.SUPABASE_PROD_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_PROD_DB_PASSWORD }}

      # --- Deploy to Vercel ---
      - name: Deploy to Vercel (develop → preview)
        if: github.ref == 'refs/heads/develop'
        run: npx vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy to Vercel (main → production)
        if: github.ref == 'refs/heads/main'
        run: npx vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Required GitHub Secrets

Set these under **GitHub repo → Settings → Secrets and variables → Actions**:

```
VERCEL_TOKEN              # Vercel personal access token
VERCEL_ORG_ID             # from `vercel link`
VERCEL_PROJECT_ID         # from `vercel link`
SUPABASE_ACCESS_TOKEN     # from Supabase dashboard → Account → Access Tokens
SUPABASE_DEV_PROJECT_ID   # spellasaurus-dev project ref
SUPABASE_DEV_DB_PASSWORD  # dev DB password
SUPABASE_PROD_PROJECT_ID  # spellasaurus-prod project ref
SUPABASE_PROD_DB_PASSWORD # prod DB password
OPENAI_API_KEY            # OpenAI API key
```

---

## Vercel Project Setup

```bash
npm install -g vercel
vercel login
vercel link          # links repo to Vercel project, writes .vercel/ (gitignore this)
```

In Vercel dashboard:
- **Production branch**: `main`
- **Preview branches**: all other branches (including `develop`)
- Set all environment variables scoped per environment (see above)

---

## Day-to-Day Developer Workflow

```bash
# Start local development
npm run db:start     # starts local Supabase (Docker)
npm run dev          # starts Next.js dev server

# Make a schema change
# 1. Edit in Supabase Studio (http://localhost:54323)
npm run db:diff -- -f add_my_column   # generates migration file
# 2. Review supabase/migrations/<timestamp>_add_my_column.sql
# 3. Commit it with your code changes

# Regenerate TypeScript types after schema change
npm run db:types

# Reset local DB (re-runs all migrations + seed.sql)
npm run db:reset
```

---

## Working Conventions

- Never commit `.env.local`.
- Always commit `.env.example` with updated keys when new env vars are added.
- Migration files are immutable after merge — never edit, always add.
- `develop` is the integration branch — all feature branches merge here first.
- Only `develop` → `main` merges go to production.
- The CI pipeline must be green before any merge to `main`.
