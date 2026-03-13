-- =============================================================================
-- Arcade Tables
-- Game catalogue and per-child unlock tracking
-- =============================================================================

-- Game catalogue
CREATE TABLE arcade_games (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price_coins INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-child unlock tracking
CREATE TABLE arcade_unlocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL REFERENCES arcade_games(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, game_id)
);

-- Indexes
CREATE INDEX idx_arcade_unlocks_child ON arcade_unlocks(child_id);
CREATE INDEX idx_arcade_games_active  ON arcade_games(is_active) WHERE is_active;

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE arcade_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_unlocks ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read the game catalogue
CREATE POLICY "arcade_games: read for authenticated"
  ON arcade_games FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Service role full access
CREATE POLICY "arcade_games: service role full access"
  ON arcade_games FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Children can read their own unlocks
CREATE POLICY "arcade_unlocks: read own"
  ON arcade_unlocks FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Only service role can insert unlocks (via API route)
CREATE POLICY "arcade_unlocks: service role full access"
  ON arcade_unlocks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Seed: The Way of the Dodo
-- =============================================================================

INSERT INTO arcade_games (id, slug, name, description, thumbnail_url, price_coins, is_active, sort_order)
VALUES (
  'a1b2c3d4-a000-0000-0000-000000000001',
  'the-way-of-the-dodo',
  'The Way of the Dodo',
  'A one-button platformer! Help the dodo flap through 13 chambers filled with enemies and coins. Can you survive?',
  '/arcade/the-way-of-the-dodo/thumbnail.png',
  200,
  TRUE,
  10
);
