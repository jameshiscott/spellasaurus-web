-- Add show_on_leaderboard column to users table
-- Defaults to false; parent controls this per child
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT FALSE;
