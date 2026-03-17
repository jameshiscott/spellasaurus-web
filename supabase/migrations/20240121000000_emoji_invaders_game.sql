-- =============================================================================
-- Add Emoji Invaders game + arcade_upgrades table for persistent upgrades
-- =============================================================================

-- 1. Seed the Emoji Invaders game into arcade_games
INSERT INTO arcade_games (id, slug, name, description, thumbnail_url, price_coins, is_active, sort_order)
VALUES (
  'b1e2f3a4-5678-4abc-9def-000000000002',
  'emoji-invaders',
  'Emoji Invaders',
  'Blast waves of emoji aliens! Earn coins to upgrade your ship, guns, and special weapons.',
  '/arcade/emoji-invaders/thumbnail.svg',
  200,
  TRUE,
  2
);

-- 2. Create arcade_upgrades table for persistent upgrade purchases
CREATE TABLE IF NOT EXISTS arcade_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES arcade_games(id) ON DELETE CASCADE,
  upgrade_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, game_id, upgrade_id)
);

CREATE INDEX IF NOT EXISTS idx_arcade_upgrades_child_game
  ON arcade_upgrades(child_id, game_id);

-- 3. RLS policies for arcade_upgrades
ALTER TABLE arcade_upgrades ENABLE ROW LEVEL SECURITY;

-- Children can read their own upgrades
CREATE POLICY "Children can read own upgrades"
  ON arcade_upgrades FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role handles inserts (via API routes)
CREATE POLICY "Service role manages upgrades"
  ON arcade_upgrades FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
