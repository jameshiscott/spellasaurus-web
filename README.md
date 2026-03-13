# Spellasaurus

Gamified spelling-practice web app for primary-school children, managed by teachers, parents, and school admins.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React, TypeScript |
| UI | Tailwind CSS + shadcn/ui, Framer Motion |
| Backend | Next.js API Route Handlers |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | OpenAI GPT-4o (definitions) + TTS (audio) |
| Hosting | Vercel |

---

## Running Locally

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Docker Desktop** — required for local Supabase ([docker.com](https://www.docker.com/products/docker-desktop))
- **Supabase CLI** — `npm install -g supabase`

### 1. Clone and install

```bash
git clone https://github.com/your-org/spellasaurus-web.git
cd spellasaurus-web
npm install
```

### 2. Start the local Supabase stack

```bash
npm run db:start
```

This starts a local Postgres + Auth + Storage stack via Docker. On first run it takes a minute or two. When ready it prints something like:

```
API URL: http://localhost:54321
anon key: eyJh...
service_role key: eyJh...
```

### 3. Set up environment variables

Copy the example file and fill in the values printed by `supabase start`:

```bash
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
OPENAI_API_KEY=<your OpenAI API key>
```

> You can also get these values at any time by running `supabase status`.

### 4. Apply migrations and seed data

The local Supabase stack runs migrations automatically on `db:start`. If you need to reset to a clean state:

```bash
npm run db:reset   # drops all data, re-runs migrations, re-seeds
```

This seeds the shop catalogue with sample items (hats, outfits, accessories, backgrounds).

### 5. Create your first users

There are no pre-seeded user accounts. Register accounts via the app:

1. Start the dev server (step 6 below)
2. Go to `http://localhost:3000/register` and create accounts for each role you need:

| Role | What to do |
|------|-----------|
| **School Admin** | Register, then log in to `/admin` to create a school and add teachers |
| **Teacher** | Register (or be added by admin), then log in to `/teacher` to create classes and spelling sets |
| **Parent** | Register, then log in to `/parent` to add children |
| **Child** | Created by a parent via the parent dashboard — they log in with `{username}@spellasaurus.internal` |

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Useful Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E (requires dev server + local Supabase)

npm run db:start     # Start local Supabase stack
npm run db:stop      # Stop local Supabase stack
npm run db:reset     # Reset DB (drop + migrate + seed)
npm run db:diff      # Generate a new migration from schema changes
npm run db:types     # Regenerate src/types/database.ts from local schema
```

---

## Database Migrations

All schema changes must be in versioned SQL files under `supabase/migrations/`. **Never edit an existing migration file.**

```bash
# After editing schema in Supabase Studio (http://localhost:54323):
npm run db:diff      # Creates a new migration file with the diff

# Or create a migration file manually:
# supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Migrations are applied automatically when deploying (see CI/CD below).

---

## Deploying

The project uses **two environments**:

| Environment | Branch | Supabase project | Vercel |
|-------------|--------|-----------------|--------|
| Development | `develop` | `spellasaurus-dev` | Preview URL |
| Production | `main` | `spellasaurus-prod` | Production URL |

### First-time setup

#### 1. Create Supabase projects

1. Go to [supabase.com](https://supabase.com) and create two projects: `spellasaurus-dev` and `spellasaurus-prod`
2. Note the **Project ID**, **API URL**, **anon key**, and **service_role key** for each
3. Note your **Supabase Access Token** from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
4. Find the **DB password** you set when creating each project

#### 2. Connect Vercel

1. Go to [vercel.com](https://vercel.com), import this repository
2. Set the following environment variables in Vercel for each environment (Preview = dev, Production = prod):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3. Note your **Vercel token** from [vercel.com/account/tokens](https://vercel.com/account/tokens), and your **Org ID** and **Project ID** from the project settings

#### 3. Add GitHub Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase personal access token |
| `SUPABASE_DEV_PROJECT_ID` | Project ID of `spellasaurus-dev` |
| `SUPABASE_DEV_DB_PASSWORD` | DB password for `spellasaurus-dev` |
| `SUPABASE_PROD_PROJECT_ID` | Project ID of `spellasaurus-prod` |
| `SUPABASE_PROD_DB_PASSWORD` | DB password for `spellasaurus-prod` |
| `VERCEL_TOKEN` | Your Vercel API token |
| `VERCEL_ORG_ID` | Your Vercel org/team ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |
| `OPENAI_API_KEY` | Your OpenAI API key |

### Deployment flow

Deployments are fully automated via GitHub Actions:

```
feature branch → PR → CI checks (lint + type-check + tests + build)
                    ↓ merge
              develop branch → DB migrations pushed to spellasaurus-dev
                             → Vercel preview deployment

              main branch    → DB migrations pushed to spellasaurus-prod
                             → Vercel production deployment
```

**To deploy to dev:** merge your branch into `develop`
**To deploy to prod:** merge `develop` into `main`

### Manual DB migration push (if needed)

```bash
# Push to dev
npm run db:push:dev

# Push to prod
npm run db:push:prod
```

> Requires `SUPABASE_DEV_PROJECT_ID` / `SUPABASE_PROD_PROJECT_ID` set in your local environment.

---

## Project Structure

```
spellasaurus-web/
├── src/
│   ├── app/                  # Next.js App Router pages + API routes
│   │   ├── (auth)/           # /login, /register
│   │   ├── child/            # Child role pages
│   │   ├── parent/           # Parent role pages
│   │   ├── teacher/          # Teacher role pages
│   │   ├── admin/            # Admin role pages
│   │   └── api/              # API route handlers
│   ├── components/           # Shared React components
│   ├── lib/                  # Supabase clients, utilities, constants
│   ├── hooks/                # Custom React hooks
│   └── types/
│       └── database.ts       # Auto-generated Supabase types (npm run db:types)
├── supabase/
│   ├── migrations/           # Versioned SQL migration files
│   ├── seed.sql              # Dev seed data (shop items)
│   └── config.toml
├── e2e/                      # Playwright end-to-end tests
├── agents/                   # Agent-specific instructions (BE/FE/Designer/etc.)
└── .github/workflows/        # CI and deploy pipelines
```

## User Roles

| Role | Dashboard |
|------|-----------|
| Child | `/child` |
| Parent | `/parent` |
| Teacher | `/teacher` |
| School Admin | `/admin` |
