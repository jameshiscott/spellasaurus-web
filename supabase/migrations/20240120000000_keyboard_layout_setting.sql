-- Add keyboard_layout column to child_practice_settings
-- Values: 'qwerty' (default) or 'abc'
ALTER TABLE child_practice_settings
  ADD COLUMN IF NOT EXISTS keyboard_layout TEXT NOT NULL DEFAULT 'qwerty'
  CHECK (keyboard_layout IN ('qwerty', 'abc'));
