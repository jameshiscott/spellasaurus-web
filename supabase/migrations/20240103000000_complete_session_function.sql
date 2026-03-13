-- =============================================================================
-- complete_spelling_session RPC Function
-- Spellasaurus – spelling practice app
--
-- Called via supabase.rpc('complete_spelling_session', { ... })
-- Runs as SECURITY DEFINER so it executes as the DB owner and bypasses RLS,
-- allowing it to write to tables that the authenticated role cannot write to
-- directly (coin_balance, child_stats, practice_sessions, coin_transactions,
-- leaderboard stats).
-- =============================================================================

CREATE OR REPLACE FUNCTION complete_spelling_session(
  p_child_id UUID,
  p_set_id UUID,
  p_correct_count INTEGER,
  p_total_words INTEGER,
  p_coins_earned INTEGER,
  p_time_taken_ms INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as DB owner, bypasses RLS
AS $$
DECLARE
  v_session_id UUID;
  v_new_balance INTEGER;
  v_new_total_sessions INTEGER;
  v_class_id UUID;
  v_school_id UUID;
  v_display_name TEXT;
  v_avatar_snapshot JSONB;
  v_leaderboard_eligible BOOLEAN;
BEGIN
  -- 1. Update coin balance
  UPDATE users
  SET coin_balance = coin_balance + p_coins_earned,
      updated_at = NOW()
  WHERE id = p_child_id
  RETURNING coin_balance INTO v_new_balance;

  -- 2. Insert coin transaction
  INSERT INTO coin_transactions (child_id, type, amount, balance_after)
  VALUES (p_child_id, 'earn_practice', p_coins_earned, v_new_balance);

  -- 3. Insert practice session (keep only last 10)
  INSERT INTO practice_sessions (child_id, set_id, score, total_words, correct_count, coins_awarded)
  VALUES (p_child_id, p_set_id, p_correct_count, p_total_words, p_correct_count, p_coins_earned)
  RETURNING id INTO v_session_id;

  -- Trim to last 10 sessions
  DELETE FROM practice_sessions
  WHERE child_id = p_child_id
    AND id NOT IN (
      SELECT id FROM practice_sessions
      WHERE child_id = p_child_id
      ORDER BY completed_at DESC
      LIMIT 10
    );

  -- 4. Upsert child_stats
  INSERT INTO child_stats (
    child_id, total_sessions, total_words, total_correct,
    average_time_ms, weekly_coins, monthly_coins,
    current_streak, best_streak, last_practised_at, updated_at
  )
  VALUES (
    p_child_id, 1, p_total_words, p_correct_count,
    p_time_taken_ms, p_coins_earned, p_coins_earned,
    1, 1, NOW(), NOW()
  )
  ON CONFLICT (child_id) DO UPDATE SET
    total_sessions = child_stats.total_sessions + 1,
    total_words = child_stats.total_words + p_total_words,
    total_correct = child_stats.total_correct + p_correct_count,
    average_time_ms = (child_stats.average_time_ms * child_stats.total_sessions + p_time_taken_ms)
                      / (child_stats.total_sessions + 1),
    weekly_coins = child_stats.weekly_coins + p_coins_earned,
    monthly_coins = child_stats.monthly_coins + p_coins_earned,
    current_streak = CASE
      WHEN child_stats.last_practised_at::DATE >= (NOW() - INTERVAL '1 day')::DATE
        THEN child_stats.current_streak + 1
      ELSE 1
    END,
    best_streak = GREATEST(child_stats.best_streak,
      CASE
        WHEN child_stats.last_practised_at::DATE >= (NOW() - INTERVAL '1 day')::DATE
          THEN child_stats.current_streak + 1
        ELSE 1
      END),
    last_practised_at = NOW(),
    updated_at = NOW()
  RETURNING total_sessions INTO v_new_total_sessions;

  -- 5. Get child info for leaderboard updates
  SELECT display_name,
    jsonb_build_object('dinoType', dino_type, 'dinoColor', dino_color, 'loadout', avatar_loadout)
  INTO v_display_name, v_avatar_snapshot
  FROM users WHERE id = p_child_id;

  SELECT leaderboard_opt_in INTO v_leaderboard_eligible
  FROM child_practice_settings WHERE child_id = p_child_id;

  v_leaderboard_eligible := COALESCE(v_leaderboard_eligible, FALSE);

  -- 6. Upsert class leaderboard stats (find the child's current class)
  SELECT cs.class_id, c.school_id INTO v_class_id, v_school_id
  FROM class_students cs
  JOIN classes c ON c.id = cs.class_id
  WHERE cs.child_id = p_child_id
  ORDER BY cs.created_at DESC
  LIMIT 1;

  IF v_class_id IS NOT NULL THEN
    INSERT INTO class_leaderboard_stats (
      class_id, child_id, school_id, display_name, avatar_snapshot,
      leaderboard_eligible, weekly_coins, total_coins, weekly_words, updated_at
    )
    VALUES (
      v_class_id, p_child_id, v_school_id, v_display_name, v_avatar_snapshot,
      v_leaderboard_eligible, p_coins_earned, p_coins_earned, p_total_words, NOW()
    )
    ON CONFLICT (class_id, child_id) DO UPDATE SET
      weekly_coins = class_leaderboard_stats.weekly_coins + p_coins_earned,
      total_coins = class_leaderboard_stats.total_coins + p_coins_earned,
      weekly_words = class_leaderboard_stats.weekly_words + p_total_words,
      display_name = v_display_name,
      avatar_snapshot = v_avatar_snapshot,
      leaderboard_eligible = v_leaderboard_eligible,
      updated_at = NOW();

    -- 7. Upsert school leaderboard stats
    INSERT INTO school_leaderboard_stats (
      school_id, child_id, display_name, avatar_snapshot,
      leaderboard_eligible, weekly_coins, total_coins, weekly_words, updated_at
    )
    VALUES (
      v_school_id, p_child_id, v_display_name, v_avatar_snapshot,
      v_leaderboard_eligible, p_coins_earned, p_coins_earned, p_total_words, NOW()
    )
    ON CONFLICT (school_id, child_id) DO UPDATE SET
      weekly_coins = school_leaderboard_stats.weekly_coins + p_coins_earned,
      total_coins = school_leaderboard_stats.total_coins + p_coins_earned,
      weekly_words = school_leaderboard_stats.weekly_words + p_total_words,
      display_name = v_display_name,
      avatar_snapshot = v_avatar_snapshot,
      leaderboard_eligible = v_leaderboard_eligible,
      updated_at = NOW();
  END IF;

  -- 8. Upsert global leaderboard stats (only if eligible)
  IF v_leaderboard_eligible THEN
    INSERT INTO global_leaderboard_stats (
      child_id, display_name, avatar_snapshot,
      leaderboard_eligible, weekly_coins, total_coins, weekly_words, updated_at
    )
    VALUES (
      p_child_id, v_display_name, v_avatar_snapshot,
      TRUE, p_coins_earned, p_coins_earned, p_total_words, NOW()
    )
    ON CONFLICT (child_id) DO UPDATE SET
      weekly_coins = global_leaderboard_stats.weekly_coins + p_coins_earned,
      total_coins = global_leaderboard_stats.total_coins + p_coins_earned,
      weekly_words = global_leaderboard_stats.weekly_words + p_total_words,
      display_name = v_display_name,
      avatar_snapshot = v_avatar_snapshot,
      updated_at = NOW();
  END IF;

  RETURN jsonb_build_object(
    'sessionId', v_session_id,
    'coinsEarned', p_coins_earned,
    'newBalance', v_new_balance
  );
END;
$$;
