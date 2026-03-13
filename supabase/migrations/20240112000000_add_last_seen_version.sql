-- Add last_seen_version column to track which app version a user has seen the welcome screen for.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_version text DEFAULT NULL;
