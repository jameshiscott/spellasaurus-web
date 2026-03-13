# Spellasaurus — Web Application Spec & Build Guide

> A gamified spelling-practice web app for primary-school children, managed by teachers, parents, and school administrators.

---

## Table of Contents

1. [Recommended Tech Stack](#recommended-tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Platform Strategy](#platform-strategy)
4. [User Roles](#user-roles)
5. [Authentication & Onboarding](#authentication--onboarding)
6. [Child Features](#child-features)
7. [Parent Features](#parent-features)
8. [Teacher Features](#teacher-features)
9. [School Admin Features](#school-admin-features)
10. [AI Content Generation](#ai-content-generation)
11. [Database Schema](#database-schema)
12. [Backend Functions](#backend-functions)
13. [Routing & Navigation](#routing--navigation)
14. [State Management](#state-management)
15. [Theming & Design](#theming--design)
16. [Build & Deployment](#build--deployment)
17. [Project Structure](#project-structure)
18. [Migration Recommendation](#migration-recommendation)

---

## Recommended Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | **Next.js 15** (React + TypeScript) |
| **UI** | Tailwind CSS + shadcn/ui |
| **State management** | TanStack Query + React context for session/UI state |
| **Navigation** | Next.js App Router |
| **Backend** | Next.js API Routes (Route Handlers) — no separate server required |
| **Database** | **Supabase** (PostgreSQL) |
| **Authentication** | **Supabase Auth** |
| **File Storage** | **Supabase Storage** |
| **AI** | OpenAI GPT-4o (definitions & sentences) + OpenAI TTS (`tts-1` or equivalent current TTS model/voice) |
| **Hosting** | **Vercel** (free tier, native Next.js support) |
| **Audio** | Native HTML5 audio |
| **Animations** | Framer Motion |
| **Fonts** | Google Fonts — **Nunito** family throughout |

### Why this is the best fit

- **Browser-first**: no need to maintain mobile app packaging, app-store deployment, or Flutter web quirks.
- **Free to start**: Vercel and Supabase both have generous free tiers — no cost until scale requires it.
- **Single deployment target**: Vercel handles the entire Next.js app (frontend + API routes) in one push.
- **Built-in migrations**: Supabase CLI tracks every schema change as a versioned SQL migration file committed to git.
- **Dev/prod parity**: separate Supabase projects for development and production; environment variables swap automatically per Vercel environment.
- **Fast to build**: React/Next.js has a much larger ecosystem for admin dashboards, forms, auth guards, and web UX.
- **Better maintainability**: easier hiring, easier debugging, easier UI iteration.
- **Great fit for role-based dashboards**: parent/teacher/admin portals are a natural web-app problem.

### Key Dependencies

- `next`
- `react`
- `typescript`
- `tailwindcss`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `@tanstack/react-query`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `framer-motion`
- `date-fns`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `openai`

### Dev Tooling

- `supabase` CLI — local dev, migrations, type generation
- `vercel` CLI — local dev preview, environment management

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel (Hosting)                           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               Next.js 15 Application                      │ │
│  │                                                            │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐ │ │
│  │  │ UI Layer   │──│ Query / Auth │──│ Data Access Layer  │ │ │
│  │  │ (pages)    │  │ State        │  │ (services)         │ │ │
│  │  └────────────┘  └──────────────┘  └────────────────────┘ │ │
│  │                          │                                 │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │            API Routes (/api/*)                      │  │ │
│  │  │   auth · words · sessions · shop · ai · admin       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬───────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               │           Supabase              │
               │  ┌──────────────────────────┐   │
               │  │ Supabase Auth            │   │
               │  ├──────────────────────────┤   │
               │  │ PostgreSQL Database      │   │
               │  ├──────────────────────────┤   │
               │  │ Row Level Security (RLS) │   │
               │  ├──────────────────────────┤   │
               │  │ Supabase Storage         │   │
               │  └──────────────────────────┘   │
               └────────────────┬────────────────┘
                                │
                     ┌──────────┴──────────┐
                     │      OpenAI API     │
                     │ GPT-4o + TTS        │
                     └─────────────────────┘
```

**Data flow**: server-rendered and client-rendered pages fetch role-aware data from Supabase (PostgreSQL). Sensitive writes (coin balance, stats, purchases) are handled through Next.js API route handlers running server-side. Supabase Auth drives route protection and dashboard redirects. Row Level Security (RLS) policies enforce data access at the database layer.

---

## Platform Strategy

Spellasaurus should now be treated as a **responsive web application**, not a Flutter cross-platform app.

### Supported platforms

- Desktop browsers: Chrome, Edge, Safari, Firefox
- Tablet browsers: iPad, Android tablets
- Mobile browsers: iPhone Safari, Chrome on Android

### App model

- Primary experience is the browser.
- Optional: make it a **Progressive Web App (PWA)** later for install-to-home-screen convenience.
- No requirement for native iOS/Android apps in phase 1.

### Responsive priorities

- **Child practice flow** should be mobile-first.
- **Teacher, parent, and admin dashboards** should be tablet/desktop-first.
- Layouts should adapt cleanly across breakpoints.

---

## User Roles

The app supports four roles, each with a distinct dashboard and permissions:

| Role | Created by | Purpose |
|------|-----------|---------|
| **School Admin** | Self-registration | Creates schools, manages classes, assigns teachers |
| **Teacher** | Self-registration or admin invite | Creates weekly spelling sets for classes, adds words (AI-enhanced) |
| **Parent** | Self-registration | Creates child accounts, assigns personal word lists, configures practice settings, resets passwords |
| **Child** | Parent | Practises spelling, earns coins, customises dino avatar |

Roles are stored on the user profile document and enforced by Firebase security rules plus server-side validation inside Cloud Functions.

---

## Authentication & Onboarding

## Login (`/login`)
- Email **or** username input.
- For child logins, if no `@` is present the app appends `@spellasaurus.com` as the internal auth email format.
- Password with visibility toggle.
- Error display on failed attempt.
- Link to registration screen.

## Registration (`/register`)
- Role selector: Parent, Teacher, or School Admin.
- Children are **never** self-registered.
- Fields: full name, email, password (8+ chars).
- On success, create a user profile document and redirect to the role home screen.

## Child Onboarding (`/child/onboarding`)
After a parent creates a child account and the child logs in for the first time, they must complete two steps before reaching the home screen:

1. **Pick a Display Name**
   - Choose from themed categories.
   - Generate random adjective + noun combinations.
   - Check uniqueness against Firestore via a callable function.

2. **Pick a Dinosaur**
   - Select one of **10 dinosaur types**.
   - Select one of **5 colours**.
   - Live preview rendered in React using SVG or layered image assets.

Confirmation saves display name, dinosaur type, dinosaur colour, and sets `onboardingComplete = true`.

---

## Child Features

### Economy, Avatar Customisation, and Leaderboards

Spellasaurus includes a child-friendly reward loop built around **coins**, **avatar customisation**, and **optional competitive leaderboards**.

#### Shop and Avatar Items
- Children can spend earned coins in a **Shop**.
- Shop inventory includes:
  - **Wearables**: hats, shirts, glasses, capes, shoes, backpacks
  - **Handheld / companion props**: footballs, laptops, books, wands, skateboards, trophies
  - **Cosmetic extras**: background themes, badges, frames, emotes, dino accessories
- Items are cosmetic only and do not affect spelling performance.
- Purchased items become part of the child’s inventory and can be equipped on their avatar.
- A child can equip multiple compatible items at once, for example hat + shirt + prop.
- The avatar preview should update immediately when equipment changes.

#### Avatar Wardrobe
- Children have a **Wardrobe** or **Customise Avatar** area.
- They can:
  - preview owned items
  - equip / unequip items
  - see locked items in the shop
  - view coin costs before purchase
- The system should support item slots, for example:
  - `head`
  - `body`
  - `eyes`
  - `feet`
  - `handheld`
  - `background`
  - `accessory`

#### Leaderboards
- The app supports leaderboards at three levels:
  - **Class leaderboard**
  - **School leaderboard**
  - **Global leaderboard**
- Leaderboards should be designed for children and show a safe public identity, using the child’s display name and avatar rather than legal name.
- Ranking can be based on one or more configurable metrics:
  - total coins earned
  - weekly coins earned
  - words practised
  - accuracy streaks
- Recommended default: **weekly coins earned**, as it resets naturally and keeps the competition fresh.

#### Parent Opt-Out
- Parents can opt a child out of all leaderboards.
- If a child is opted out:
  - they do not appear on class, school, or global leaderboards
  - their scores are excluded from leaderboard rankings
- Opt-out should be available in parent settings and default should be decided explicitly as a product/privacy decision.
- Recommended default: **opted in only after explicit parent consent**.

#### Safety and Fairness Notes
- No open text, messaging, or direct child-to-child interaction through leaderboards.
- Display names must be moderated / filtered.
- Global leaderboards should be rate-limited and cached to avoid unnecessary read load.
- Consider age-appropriate language such as “Top Explorers” or “Top Collectors” instead of overly intense competitive phrasing.

---

## Child Features

## Home Screen (`/child`)
- Greeting banner: `Hi [displayName] 👋 — Let's practice spelling!`
- Mascot banner with tappable dino avatar.
- This Week's Sets: assigned class sets and personal sets.
- See All link to `/child/sets`.
- Logout button.

## Set List (`/child/sets`)
- Full list of all spelling sets available to the child.
- Tap a set to navigate to practice.

## Practice (`/child/practice/[setId]`)
Core spelling flow, one word at a time:

1. Progress bar and word counter.
2. Audio play button.
3. Description hint if enabled.
4. Example sentence hint if enabled.
5. Text field for typed spelling.
6. Submit with case-insensitive check.
   - Correct → green tick, positive feedback, advance.
   - Wrong → red cross, show correct answer, advance.
7. Timer records `timeTakenMs`.
8. After final word:
   - save practice session
   - save per-word answers
   - increment coin balance
   - redirect to results screen

## Results (`/child/results/[sessionId]`)
- Celebration message based on score.
- Coin animation into dino avatar.
- Star rating 1–3.
- Word breakdown with correct/incorrect answers.
- Buttons: Back to Home or Try Again.

## Profile (`/child/profile`)
- Full-size dino avatar.
- Display name.
- Coin balance.
- Stats cards:
  - sessions this week / month / year
  - lifetime accuracy
  - average time per word
- Access to **Wardrobe** to equip owned avatar items.
- Quick link to **Shop**.

## Shop (`/child/shop`)
- Browse purchasable cosmetic items.
- Filter by category:
  - hats
  - shirts
  - accessories
  - props
  - backgrounds
- Show item preview, coin price, owned state, equipped state.
- Purchase confirmation before spending coins.
- Insufficient coin state handled clearly.

## Wardrobe (`/child/wardrobe`)
- View all owned items.
- Equip and unequip items per slot.
- Live avatar preview.
- Save loadout automatically or via explicit save action.

## Leaderboards (`/child/leaderboards`)
- Tabs for Class, School, and Global.
- Show ranking, display name, avatar, and score metric.
- Hide boards entirely for children who are opted out if desired by product rules, or show read-only boards without the child appearing.
- Highlight the current child’s rank when participating.

---

## Parent Features

## Dashboard (`/parent`)
- Welcome banner.
- Children list with avatar/name.
- Add Child button opens modal or page.
  - child full name
  - date of birth
  - username
  - password
- Calls a secure backend function to create the child auth user and child profile.

## Child Detail (`/parent/child/[childId]`)
- Child identity summary.
- Quick actions:
  - Practice Settings
  - My Word Lists
  - Reset Password
- Class Sets section.
- Assigned Personal Lists section.

## Practice Settings (`/parent/child/[childId]/settings`)
Three toggles controlling what the child sees during practice:

| Setting | Default | Effect |
|---------|---------|--------|
| Read word aloud | On | Auto-play TTS audio |
| Show description | On | Display AI-generated definition |
| Show example sentence | On | Display AI-generated sentence with blank |
| Allow leaderboard participation | Off until consent | Child may appear in class, school, and global leaderboards |

Saved to a child settings document.

## Personal Word Lists (`/parent/lists`)
- Create list.
- View list tiles with number of children assigned.
- Edit words.
- Assign/unassign to children.

---

## Teacher Features

## Dashboard (`/teacher`)
- Welcome banner.
- Class cards with name + year.

## Class Detail (`/teacher/class/[classId]`)
- Class info.
- Quick actions:
  - Spelling Sets
  - Students

## Spelling Sets (`/teacher/class/[classId]/sets`)
- List all sets for the class.
- Create Set modal: name + week-start date.

## Set Editor (`/teacher/set/[setId]/edit`)
- Word list ordered by `sortOrder`.
- Add Word modal: word + optional hint/clue.
- On save, trigger AI content generation:
  - definition
  - example sentence
  - TTS audio
- Word cards show word, audio, description, sentence.
- Per-word actions: regenerate AI content or delete.

---

## School Admin Features

## Dashboard (`/admin`)
- School cards with Create School modal.

## Class Management (`/admin/classes/[schoolId]`)
- List classes in the school.
- Create Class modal.

## Teacher Management (`/admin/teachers/[schoolId]`)
- List teachers in the school.

## Class Detail (`/admin/class/[classId]`)
- View class info.
- Assign or change teacher.

---

## AI Content Generation

A backend function named `generateWordContent` orchestrates two OpenAI calls per word.

### 1. Definition + Example Sentence
- Uses GPT-4o.
- Prompt tuned for child-friendly explanations.
- Rules:
  - definition must not contain the target word
  - sentence must use the word, then store a blanked version for practice

### 2. Text-to-Speech Audio
- Uses an OpenAI TTS model.
- Input is the word itself.
- Output MP3 is uploaded to Firebase Storage.

Generated metadata is then written back to the word document.

---

## Database Schema

Firestore is document-based, so this section replaces the relational/Postgres design with collections and documents.

## Collections

### `users`
Profile document for every authenticated user.

Suggested fields:
- `uid`
- `role` (`school_admin`, `teacher`, `parent`, `child`)
- `fullName`
- `email`
- `dateOfBirth`
- `coinBalance`
- `displayName`
- `dinoType`
- `dinoColor`
- `onboardingComplete`
- `schoolId` (nullable)
- `avatarLoadout` (object of equipped item ids by slot)
- `leaderboardOptIn` (boolean, child only)
- `createdAt`
- `updatedAt`

### `schools`
- `name`
- `address`
- `adminIds`
- `createdAt`

### `classes`
- `schoolId`
- `teacherId`
- `name`
- `schoolYear`
- `createdAt`

### `spellingSets`
- `name`
- `classId` (nullable)
- `createdBy`
- `weekStart`
- `weekNumber`
- `type` (`class` or `personal`)
- `createdAt`

### `spellingWords`
- `setId`
- `word`
- `hint`
- `aiDescription`
- `aiExampleSentence`
- `audioUrl`
- `aiGeneratedAt`
- `sortOrder`

### `practiceSessions`
This collection should be **minimal and retention-aware**.

Suggested fields:
- `childId`
- `setId`
- `score`
- `totalWords`
- `correctCount`
- `coinsAwarded`
- `completedAt`

**Retention note:**
- Do **not** keep an unlimited history of every spelling run forever.
- Either:
  - keep only a short rolling window of recent sessions for simple review, or
  - remove this collection entirely if recent-session history is not needed in the product.
- The authoritative long-term values should live in aggregated stat documents, not in raw event history.

### `practiceAnswers`
This collection should be **removed** unless there is a very specific product need for per-word historical review.

Recommended approach:
- do **not** store every answer for every session
- instead update summary stats at the end of each session
- optionally store only a lightweight, temporary per-session result payload for the just-finished results screen, with a short retention period

If you still want post-session review, use one of these reduced approaches:
- keep only the latest N sessions
- keep only recent incorrect words
- keep only a compact summary blob on the session record

### `childPracticeSettings`
- `childId`
- `showDescription`
- `showExampleSentence`
- `playTtsAudio`
- `leaderboardOptIn`

### `parentChildren`
- `parentId`
- `childId`
- `createdAt`

### `classStudents`
- `classId`
- `childId`
- `schoolId`
- `createdAt`

### `childPersonalSets`
- `setId`
- `childId`
- `createdAt`

### `shopItems`
Master catalogue of purchasable cosmetic items.

Suggested fields:
- `name`
- `description`
- `category` (`hat`, `shirt`, `accessory`, `prop`, `background`, etc.)
- `slot` (`head`, `body`, `eyes`, `feet`, `handheld`, `background`, `accessory`)
- `priceCoins`
- `rarity`
- `assetUrl` or render metadata
- `isActive`
- `sortOrder`
- `createdAt`

### `childInventory`
Records items owned by a child.

Suggested fields:
- `childId`
- `itemId`
- `purchasedAt`
- `purchasePriceCoins`

### `coinTransactions`
Ledger of coin movements.

Suggested fields:
- `childId`
- `type` (`earn_practice`, `spend_shop`, `admin_grant`, `refund`, etc.)
- `amount`
- `balanceAfter`
- `relatedSessionId` (nullable)
- `relatedItemId` (nullable)
- `createdAt`

**Retention recommendation:**
- keep this compact
- only store the fields needed for audit/debugging
- consider retention or archiving rules if volumes become high
- do not attach large result payloads to coin ledger entries

### `leaderboardSnapshots`
Optional precomputed leaderboard documents for scale and lower read cost.

Suggested fields:
- `scope` (`class`, `school`, `global`)
- `scopeId` (`classId`, `schoolId`, or `global`)
- `metric` (`weeklyCoins`, `totalCoins`, `wordsPractised`, etc.)
- `periodKey` (for example `2026-W11`)
- `entries` (top N safe leaderboard rows)
- `updatedAt`

### `childStats`
Precomputed per-child aggregates updated at the **end of each spelling session**.

Suggested fields:
- `childId`
- `totalSessions`
- `totalWords`
- `totalCorrect`
- `averageTimeMs`
- `weeklyCoins`
- `monthlyCoins`
- `currentStreak`
- `bestStreak`
- `lastPractisedAt`
- `updatedAt`

Optional additional fields:
- `weeklyWords`
- `monthlyWords`
- `weeklyAccuracy`
- `monthlyAccuracy`
- `recentIncorrectWords` (small capped list only)

### `classLeaderboardStats`
Precomputed leaderboard-facing stats per child per class.

Suggested fields:
- `classId`
- `childId`
- `schoolId`
- `displayName`
- `avatarSnapshot`
- `leaderboardEligible`
- `weeklyCoins`
- `totalCoins`
- `weeklyWords`
- `updatedAt`

### `schoolLeaderboardStats`
Precomputed leaderboard-facing stats per child per school.

Suggested fields:
- `schoolId`
- `childId`
- `displayName`
- `avatarSnapshot`
- `leaderboardEligible`
- `weeklyCoins`
- `totalCoins`
- `weeklyWords`
- `updatedAt`

### `globalLeaderboardStats`
Precomputed leaderboard-facing stats per child for global ranking.

Suggested fields:
- `childId`
- `displayName`
- `avatarSnapshot`
- `leaderboardEligible`
- `weeklyCoins`
- `totalCoins`
- `weeklyWords`
- `updatedAt`

## Firestore modelling note

Where many-to-many relationships grow large, use dedicated collections rather than storing large ID arrays in documents.

### Database design recommendation

Given your latest requirement, the database should be made **more summary-based and less event-based**.

### Updated storage strategy

At the end of each spelling session, the backend should:
- calculate the session result in memory
- award coins
- update the child’s aggregate stats
- update leaderboard-facing summary documents
- optionally keep only a very small recent-session record if the UI needs it

It should **not** keep every answer and every detailed historical test forever.

### Recommended long-term approach

#### Keep
- `users`
- `schools`
- `classes`
- `spellingSets`
- `spellingWords`
- `childPracticeSettings`
- `parentChildren`
- `classStudents`
- `childPersonalSets`
- `shopItems`
- `childInventory`
- `coinTransactions` (compact ledger)
- `childStats`
- `classLeaderboardStats`
- `schoolLeaderboardStats`
- `globalLeaderboardStats`

#### Optional / short retention only
- `practiceSessions`

#### Remove
- `practiceAnswers`

### Why this is better

1. **Much smaller database growth**
   - you avoid storing thousands or millions of per-word answer rows

2. **Faster reads**
   - dashboards, profile pages, and leaderboards read from compact summary documents

3. **Lower Firestore cost**
   - fewer documents written and fewer aggregate queries needed later

4. **Cleaner product fit**
   - you said you do not need every single historical test, so the data model should reflect that rather than hoarding spelling attempts like a nervous dragon

### Session completion write pattern

A `completeSpellingSession` backend function should, in one transaction or tightly controlled server-side flow:

1. validate child and set access
2. compute score, correct count, time stats, and coins earned
3. update `users.coinBalance`
4. append a compact `coinTransactions` entry
5. update `childStats`
6. update `classLeaderboardStats`
7. update `schoolLeaderboardStats`
8. update `globalLeaderboardStats` if eligible
9. optionally write or replace a lightweight recent `practiceSessions` record

### Suggested stats philosophy

Treat session-end aggregation as the source of truth.

That means:
- profile stats come from `childStats`
- leaderboard pages come from leaderboard stat collections
- coin display comes from `users.coinBalance`
- purchase history/debugging comes from `coinTransactions`
- recent activity, if needed, comes from a tiny rolling session history only

### Final recommendation

Yes — the database should be changed.

For your goals, the best design is **not** a full historical event store.
It should be a **compact operational database** built around:
- current profile state
- inventory ownership
- coin ledgering
- aggregated child stats
- precomputed leaderboard stats
- optional short-lived recent-session records only

That will keep storage under control and make the app much simpler to run over time.

---

## Build & Deployment

### Environments

Two environments run in parallel:

| Environment | Branch | Vercel target | Supabase project |
|-------------|--------|---------------|-----------------|
| **Development** | `develop` | Vercel Preview | `spellasaurus-dev` |
| **Production** | `main` | Vercel Production | `spellasaurus-prod` |

Environment variables are scoped per Vercel environment. Each set points to the correct Supabase project.

### Database Migrations (Supabase CLI)

All schema changes are tracked as versioned SQL migration files committed to git:

```
supabase/
  migrations/
    20240101000000_initial_schema.sql
    20240102000000_add_shop_items.sql
    ...
  seed.sql      ← dev seed data (shop items, test users)
  config.toml   ← local dev config
```

**Workflow for a schema change:**

```bash
# 1. Edit schema locally via Supabase Studio (localhost:54323)
supabase db diff --schema public -f your_change_name

# 2. Review the generated migration file, commit it
git add supabase/migrations/
git commit -m "migration: add leaderboard_opt_in column"

# 3. On PR merge to develop: CI auto-pushes to dev Supabase
# 4. On PR merge to main: CI auto-pushes to prod Supabase
```

Migrations are applied in order and never modified after merge — always add new migrations, never edit existing ones.

### GitHub Actions CI/CD Pipeline

**On pull request** (any branch → `develop` or `main`):
1. Lint + type-check
2. Unit tests (Vitest) with Supabase local emulator
3. Build

**On push to `develop`**:
1. All PR checks above
2. Deploy to Vercel Preview (auto-URL)
3. Push Supabase migrations to `spellasaurus-dev`

**On push to `main`**:
1. All PR checks above
2. Deploy to Vercel Production
3. Push Supabase migrations to `spellasaurus-prod`

### Required GitHub Secrets

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_DEV_PROJECT_ID
SUPABASE_DEV_DB_PASSWORD
SUPABASE_PROD_PROJECT_ID
SUPABASE_PROD_DB_PASSWORD
```

### Local Development

```bash
# Start local Supabase stack (Postgres + Auth + Storage + Studio)
supabase start

# Start Next.js dev server
npm run dev
```

Local Supabase runs entirely in Docker. No cloud credentials needed for day-to-day development.

---

## Project Structure

```
spellasaurus-web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # /login, /register
│   │   ├── child/               # child role pages
│   │   ├── parent/              # parent role pages
│   │   ├── teacher/             # teacher role pages
│   │   ├── admin/               # admin role pages
│   │   └── api/                 # Next.js API route handlers
│   │       ├── auth/
│   │       ├── sessions/
│   │       ├── shop/
│   │       ├── words/
│   │       └── ai/
│   ├── components/              # shared React components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # browser Supabase client
│   │   │   ├── server.ts        # server-side Supabase client
│   │   │   └── middleware.ts    # auth session refresh middleware
│   │   └── constants.ts         # table name constants
│   ├── services/                # typed Supabase query helpers
│   ├── hooks/                   # custom React hooks
│   └── types/
│       └── database.ts          # auto-generated Supabase types
├── supabase/
│   ├── migrations/              # versioned SQL migration files
│   ├── seed.sql                 # dev seed data
│   └── config.toml
├── .github/
│   └── workflows/
│       ├── ci.yml               # lint + test + build on PR
│       └── deploy.yml           # deploy on push to develop/main
├── .env.local                   # local env vars (gitignored)
├── .env.example                 # env var template (committed)
└── middleware.ts                # Next.js auth middleware
```

