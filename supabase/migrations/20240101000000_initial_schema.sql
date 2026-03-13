-- =============================================================================
-- Initial Schema Migration
-- Spellasaurus – spelling practice app
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- users (profiles for all auth users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('child', 'parent', 'teacher', 'school_admin')),
  full_name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  coin_balance INTEGER NOT NULL DEFAULT 0,
  display_name TEXT UNIQUE,
  dino_type TEXT,
  dino_color TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  school_id UUID,
  avatar_loadout JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  admin_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- class_students (enrolment)
CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, child_id)
);

-- parent_children
CREATE TABLE parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- spelling_sets
CREATE TABLE spelling_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE,
  week_number INTEGER,
  type TEXT NOT NULL CHECK (type IN ('class', 'personal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- spelling_words
CREATE TABLE spelling_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES spelling_sets(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  hint TEXT,
  ai_description TEXT,
  ai_example_sentence TEXT,
  ai_sentence_with_blank TEXT,
  audio_url TEXT,
  ai_generated_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- child_personal_sets
CREATE TABLE child_personal_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES spelling_sets(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(set_id, child_id)
);

-- child_practice_settings
CREATE TABLE child_practice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  show_description BOOLEAN NOT NULL DEFAULT TRUE,
  show_example_sentence BOOLEAN NOT NULL DEFAULT TRUE,
  play_tts_audio BOOLEAN NOT NULL DEFAULT TRUE,
  leaderboard_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- child_stats
CREATE TABLE child_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_words INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  average_time_ms INTEGER NOT NULL DEFAULT 0,
  weekly_coins INTEGER NOT NULL DEFAULT 0,
  monthly_coins INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_practised_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- practice_sessions (short-retention, keep last 10 per child)
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES spelling_sets(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_words INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shop_items
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('head', 'body', 'eyes', 'feet', 'handheld', 'background', 'accessory')),
  price_coins INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  asset_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- child_inventory
CREATE TABLE child_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purchase_price_coins INTEGER NOT NULL,
  UNIQUE(child_id, item_id)
);

-- coin_transactions
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn_practice', 'spend_shop', 'admin_grant', 'refund')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  related_session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  related_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- class_leaderboard_stats
CREATE TABLE class_leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_snapshot JSONB NOT NULL DEFAULT '{}',
  leaderboard_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_coins INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  weekly_words INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, child_id)
);

-- school_leaderboard_stats
CREATE TABLE school_leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_snapshot JSONB NOT NULL DEFAULT '{}',
  leaderboard_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_coins INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  weekly_words INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, child_id)
);

-- global_leaderboard_stats
CREATE TABLE global_leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  avatar_snapshot JSONB NOT NULL DEFAULT '{}',
  leaderboard_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_coins INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  weekly_words INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_display_name ON users(display_name);

CREATE INDEX idx_spelling_words_set_sort ON spelling_words(set_id, sort_order);

CREATE INDEX idx_practice_sessions_child_completed ON practice_sessions(child_id, completed_at DESC);

CREATE INDEX idx_coin_transactions_child_created ON coin_transactions(child_id, created_at DESC);

CREATE INDEX idx_class_leaderboard_class_coins ON class_leaderboard_stats(class_id, weekly_coins DESC);

CREATE INDEX idx_school_leaderboard_school_coins ON school_leaderboard_stats(school_id, weekly_coins DESC);

CREATE INDEX idx_global_leaderboard_coins ON global_leaderboard_stats(weekly_coins DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_child_practice_settings_updated_at
  BEFORE UPDATE ON child_practice_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_child_stats_updated_at
  BEFORE UPDATE ON child_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_class_leaderboard_stats_updated_at
  BEFORE UPDATE ON class_leaderboard_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_school_leaderboard_stats_updated_at
  BEFORE UPDATE ON school_leaderboard_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_global_leaderboard_stats_updated_at
  BEFORE UPDATE ON global_leaderboard_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
