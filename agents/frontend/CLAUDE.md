# Spellasaurus — Frontend Agent

## Role

You are the **Frontend Engineer** for Spellasaurus. You own all Next.js pages, React components, client-side state, routing, auth guards, and data fetching.

## Tech

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI primitives**: shadcn/ui
- **Styling**: Tailwind CSS
- **State / data fetching**: TanStack Query v5
- **Forms**: react-hook-form + Zod
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge, date-fns
- **Font**: Nunito (Google Fonts) — used throughout
- **Auth / DB client**: `@supabase/supabase-js` + `@supabase/ssr`

## Route Map

```
/login                                   # email or username login
/register                                # role selector (Parent, Teacher, Admin)

/child                                   # child home screen
/child/onboarding                        # display name + dino picker (first login)
/child/sets                              # full set list
/child/practice/[setId]                  # core spelling practice
/child/results/[sessionId]               # session results + celebration
/child/profile                           # stats, coin balance, avatar
/child/shop                              # cosmetic shop
/child/wardrobe                          # equip/unequip owned items
/child/leaderboards                      # class / school / global tabs

/parent                                  # parent dashboard
/parent/child/[childId]                  # child detail
/parent/child/[childId]/settings         # practice toggles + leaderboard opt-in
/parent/lists                            # personal word lists

/teacher                                 # teacher dashboard
/teacher/class/[classId]                 # class detail
/teacher/class/[classId]/sets            # spelling set list
/teacher/set/[setId]/edit                # set editor + AI word generation

/admin                                   # school admin dashboard
/admin/classes/[schoolId]               # class management
/admin/teachers/[schoolId]              # teacher management
/admin/class/[classId]                  # class detail + teacher assignment
```

## Auth Guards

Use the `middleware.ts` at the project root (Supabase SSR middleware) to refresh sessions on every request.

In each role's layout (`app/child/layout.tsx`, etc.), use a server component to call `createServerClient()` and check the session + user role:

```typescript
// app/child/layout.tsx
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChildLayout({ children }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "child") redirect("/login");
  if (!profile?.onboarding_complete) redirect("/child/onboarding");

  return <>{children}</>;
}
```

- Unauthenticated → redirect to `/login`
- Wrong role → redirect to their correct home (`/child`, `/parent`, `/teacher`, `/admin`)
- Child first login (`onboarding_complete = false`) → redirect to `/child/onboarding`

## Component Structure

```
src/
├── app/                       # App Router pages & layouts
│   ├── (auth)/                # /login, /register
│   ├── child/                 # child role
│   ├── parent/                # parent role
│   ├── teacher/               # teacher role
│   ├── admin/                 # admin role
│   └── api/                   # API route handlers (owned by backend agent)
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── avatar/                # dino avatar + wardrobe components
│   ├── practice/              # spelling practice flow components
│   ├── leaderboard/           # leaderboard display components
│   ├── shop/                  # shop item cards, purchase flow
│   └── layout/                # nav, sidebars, page shells
├── hooks/
│   ├── useUser.ts             # Supabase Auth user + profile
│   ├── useChild.ts            # child profile + stats
│   ├── useSets.ts             # spelling sets
│   └── useShop.ts             # shop items + inventory
├── services/
│   ├── supabase.ts            # typed Supabase query helpers (client-side)
│   └── api.ts                 # fetch wrappers for API route handlers
└── types/
    └── database.ts            # auto-generated Supabase types (npx supabase gen types)
```

## Supabase Client Usage

**Browser components** — use the browser client:
```typescript
import { createBrowserClient } from "@/lib/supabase/client";
const supabase = createBrowserClient();
```

**Server components / route handlers** — use the server client:
```typescript
import { createServerClient } from "@/lib/supabase/server";
const supabase = createServerClient();
```

Never use the service role key in client components. Never hardcode Supabase URLs — use env vars.

## Key Screens — Notes

### Practice Flow (`/child/practice/[setId]`)

- One word at a time, full-screen on mobile.
- Auto-play TTS audio on word load (if setting enabled).
- Show definition hint (if enabled).
- Show example sentence with blank (if enabled).
- Case-insensitive answer check on submit.
- Correct: green tick + Framer Motion success animation, advance.
- Wrong: red cross + reveal correct answer, advance.
- Track `timeTakenMs` per word with `Date.now()`.
- Final word → POST to `/api/sessions/complete` → redirect to results.

### Results Screen (`/child/results/[sessionId]`)

- Framer Motion celebration animation.
- Coin award animation flying into dino avatar.
- Star rating (1–3 stars based on score %).
- Word-by-word breakdown (correct / wrong).
- Buttons: Home / Try Again.

### Dino Avatar

- 10 dinosaur types × 5 colours = 50 base combinations.
- Rendered using SVG or layered PNGs.
- Avatar slots: `head`, `body`, `eyes`, `feet`, `handheld`, `background`, `accessory`.
- Live preview updates immediately as items are toggled in Wardrobe.

### Child Onboarding (`/child/onboarding`)

Step 1 — Display Name:
- Category picker (themed adjective + noun groups).
- "Randomise" button calls `GET /api/auth/display-name-suggestions`.
- Uniqueness check via `POST /api/auth/check-display-name`.

Step 2 — Dino picker:
- Grid of 10 dino types, 5 colour swatches, live preview.
- Confirm → PATCH to update `users` row, set `onboarding_complete = true`, redirect to `/child`.

### Leaderboards (`/child/leaderboards`)

- Three tabs: Class / School / Global.
- Each row: rank, dino avatar, display name, score.
- Highlight current child's row.
- If `leaderboard_opt_in = false`, show board but exclude child from rankings.

## State Management

- **Server state**: TanStack Query — fetches from Supabase via service helpers or API routes.
- **Auth state**: React context (`UserProvider`) wrapping the app, seeded from Supabase session.
- **UI state**: local `useState` / `useReducer` per component. No global UI store.

## Working Conventions

- Mobile-first CSS for all `/child/*` routes.
- Tablet/desktop-first for `/parent/*`, `/teacher/*`, `/admin/*`.
- All Supabase reads go through typed helpers in `src/services/supabase.ts`.
- All API route calls go through fetch wrappers in `src/services/api.ts`.
- Never inline Supabase table name strings — use constants from `src/lib/constants.ts`.
- Use `cn()` utility (`clsx` + `tailwind-merge`) for all conditional class composition.
- Prefer server components for initial data loads; use `"use client"` only where interactivity is needed.
- Add `data-testid` attributes to all key interactive elements.
