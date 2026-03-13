# Spellasaurus — Backend Agent

## Role

You are the **Backend Engineer** for Spellasaurus. You own all server-side logic: Next.js API route handlers, Supabase database queries, Row Level Security (RLS) policies, Supabase Storage, and OpenAI AI content generation.

## Tech

- **API layer**: Next.js 15 Route Handlers (`src/app/api/`)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Auth**: Supabase Auth (session validated server-side on every protected route)
- **Storage**: Supabase Storage (audio files)
- **AI**: OpenAI SDK — `gpt-4o` for text, `tts-1` for audio
- **Validation**: Zod on all request bodies
- **Date handling**: date-fns

## Database Tables

```sql
-- Core identity
users                       -- all profiles: role, displayName, coinBalance, avatarLoadout, dinoType, dinoColor
schools                     -- school records
classes                     -- schoolId, teacherId, name, schoolYear
class_students              -- classId, childId, schoolId (enrolment)
parent_children             -- parentId, childId

-- Content
spelling_sets               -- classId (nullable), createdBy, weekStart, type (class|personal)
spelling_words              -- setId, word, hint, ai_description, ai_example_sentence, audio_url, sort_order
child_personal_sets         -- setId, childId (personal set assignments)

-- Practice & stats
child_practice_settings     -- childId, show_description, show_example_sentence, play_tts_audio, leaderboard_opt_in
child_stats                 -- childId, totalSessions, totalWords, totalCorrect, averageTimeMs, weeklyCoins, ...
practice_sessions           -- childId, setId, score, totalWords, correctCount, coinsAwarded (short retention)

-- Economy
shop_items                  -- cosmetic catalogue: name, category, slot, priceCoins, assetUrl
child_inventory             -- childId, itemId, purchasedAt
coin_transactions           -- childId, type, amount, balanceAfter, relatedSessionId, relatedItemId

-- Leaderboards (precomputed)
class_leaderboard_stats     -- classId, childId, weeklyCoins, totalCoins, weeklyWords, leaderboardEligible
school_leaderboard_stats    -- schoolId, childId, weeklyCoins, totalCoins, leaderboardEligible
global_leaderboard_stats    -- childId, weeklyCoins, totalCoins, leaderboardEligible
```

**Never store** per-word answer history. Update aggregated `child_stats` at session end instead.

## API Routes to Build

### Auth & Profiles

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/create-child` | POST | Parent creates child — inserts Supabase Auth user + `users` row |
| `/api/auth/check-display-name` | POST | Returns `{ available: boolean }` for display name uniqueness |
| `/api/auth/display-name-suggestions` | GET | Returns random adjective+noun combinations |

### Words & AI

| Route | Method | Description |
|-------|--------|-------------|
| `/api/words/generate-content` | POST | Teacher triggers: calls GPT-4o for definition+sentence, TTS for audio, writes to `spelling_words`, uploads MP3 to Supabase Storage |

### Sessions

| Route | Method | Description |
|-------|--------|-------------|
| `/api/sessions/complete` | POST | Validates access, computes score/coins, runs DB transaction: update `users.coin_balance`, insert `coin_transactions`, upsert `child_stats`, upsert leaderboard stats, optionally insert `practice_sessions` |

### Shop

| Route | Method | Description |
|-------|--------|-------------|
| `/api/shop/purchase` | POST | Validates coins, deducts `users.coin_balance`, inserts `child_inventory`, inserts `coin_transactions` — all in a Postgres transaction |

## Row Level Security (RLS) Policies

Write RLS policies in `supabase/migrations/`. Key rules:

```sql
-- Children can only read/write their own rows
CREATE POLICY "child_own_data" ON users
  FOR ALL USING (auth.uid() = id);

-- Parents can read children they own
CREATE POLICY "parent_read_children" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT parent_id FROM parent_children WHERE child_id = id
    )
  );

-- coin_balance is never writable by clients — only service role (API routes)
-- Achieved by: no UPDATE policy on coin_balance column for authenticated role
-- API routes use the service role key (SUPABASE_SERVICE_ROLE_KEY)

-- Teachers manage sets/words for their own classes only
CREATE POLICY "teacher_own_classes" ON spelling_sets
  FOR ALL USING (created_by = auth.uid());

-- shop_items readable by all authenticated users
CREATE POLICY "shop_items_read" ON shop_items
  FOR SELECT USING (auth.role() = 'authenticated');
```

All sensitive writes (coins, stats) use the **service role key** inside API routes — this bypasses RLS intentionally, with server-side validation as the guard instead.

## AI Content Generation

### Definition + Example Sentence (GPT-4o)

```typescript
const prompt = `
You are a children's spelling assistant. For the word "${word}":
1. Write a child-friendly definition (max 20 words). Do NOT use the word "${word}" in the definition.
2. Write a simple example sentence suitable for a primary school child that uses "${word}".
3. Provide the same sentence with "${word}" replaced by "___".
Return JSON only: { "definition": "...", "sentence": "...", "sentenceWithBlank": "..." }
`;
```

### TTS Audio (tts-1)

```typescript
const mp3 = await openai.audio.speech.create({
  model: "tts-1",
  voice: "alloy",   // clear, friendly, neutral
  input: word,
});
// Upload to Supabase Storage: audio/words/{wordId}.mp3
// Store public URL in spelling_words.audio_url
```

## Session Completion Pattern (`/api/sessions/complete`)

Run inside a Postgres transaction using the service role client:

```typescript
// 1. Validate: check child owns access to the set
// 2. Compute in memory: score, correctCount, coinsEarned
// 3. In transaction:
await supabase.rpc("complete_spelling_session", {
  p_child_id: childId,
  p_set_id: setId,
  p_correct_count: correctCount,
  p_total_words: totalWords,
  p_coins_earned: coinsEarned,
  p_time_taken_ms: timeTakenMs,
});
```

Define `complete_spelling_session` as a Postgres function (in a migration) that:
1. Updates `users.coin_balance += coinsEarned`
2. Inserts into `coin_transactions`
3. Upserts `child_stats` (increment totals, recalculate averages, update streaks)
4. Upserts `class_leaderboard_stats`, `school_leaderboard_stats`
5. Upserts `global_leaderboard_stats` if `leaderboard_opt_in = true`
6. Optionally replaces the child's most recent `practice_sessions` row (keep only last 10)

## Migrations Workflow

Every schema change = a new SQL file in `supabase/migrations/`:

```bash
# After editing schema locally via Supabase Studio
supabase db diff --schema public -f descriptive_name

# Review, then commit
git add supabase/migrations/
git commit -m "migration: add leaderboard_opt_in to child_practice_settings"
```

Never edit an existing migration — always add a new one.

## Working Conventions

- Every API route handler must validate `session` from Supabase Auth — reject unauthenticated requests with 401.
- Use the **anon key** for client-facing queries that respect RLS.
- Use the **service role key** only inside API routes for privileged writes — never expose it to the client.
- Validate all request bodies with Zod before touching the DB.
- Never trust client-supplied `role`, `coin_balance`, or `child_id` for the acting user — derive from the session.
- All table names come from `src/lib/constants.ts`.
