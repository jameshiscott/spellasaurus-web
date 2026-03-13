-- Add word_results column to practice_sessions for results screen display
ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS word_results JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN practice_sessions.word_results IS
  'Compact array of {wordId, word, wasCorrect, timeTakenMs} — retained for results screen only';
