-- Add word streak tracking to child_stats
-- current_word_streak: consecutive correct words across sessions (resets on wrong answer)
-- best_word_streak: highest word streak ever achieved

ALTER TABLE child_stats
  ADD COLUMN IF NOT EXISTS current_word_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_word_streak INTEGER NOT NULL DEFAULT 0;
