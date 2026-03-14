-- =============================================================================
-- Add is_active and active_from columns to spelling_sets
-- =============================================================================

ALTER TABLE spelling_sets
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS active_from TIMESTAMPTZ DEFAULT NULL;

-- Index for quick filtering by active status per teacher
CREATE INDEX IF NOT EXISTS idx_spelling_sets_created_by_active
  ON spelling_sets (created_by, is_active);
