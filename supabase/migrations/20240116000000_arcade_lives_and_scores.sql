-- =============================================================================
-- Arcade game lives & high scores
-- =============================================================================

-- Tracks remaining lives per child per game (persists between sessions)
CREATE TABLE arcade_game_lives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL REFERENCES arcade_games(id) ON DELETE CASCADE,
  lives_remaining INTEGER NOT NULL DEFAULT 3,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, game_id)
);

CREATE INDEX idx_arcade_game_lives_child ON arcade_game_lives(child_id);

-- Stores every completed game session score (for leaderboards)
CREATE TABLE arcade_high_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL REFERENCES arcade_games(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL DEFAULT 0,
  played_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_arcade_high_scores_game ON arcade_high_scores(game_id, score DESC);
CREATE INDEX idx_arcade_high_scores_child ON arcade_high_scores(child_id);

-- RLS for arcade_game_lives
ALTER TABLE arcade_game_lives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arcade_game_lives: read own"
  ON arcade_game_lives FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

CREATE POLICY "arcade_game_lives: service role full access"
  ON arcade_game_lives FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS for arcade_high_scores
ALTER TABLE arcade_high_scores ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read scores (needed for leaderboards)
CREATE POLICY "arcade_high_scores: read for authenticated"
  ON arcade_high_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "arcade_high_scores: service role full access"
  ON arcade_high_scores FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
