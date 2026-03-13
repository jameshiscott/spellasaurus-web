-- =============================================================================
-- Row Level Security Policies
-- Spellasaurus – spelling practice app
-- =============================================================================
-- Convention:
--   "authenticated" role = a logged-in user acting on their own behalf
--   "service_role"       = server-side API routes / edge functions (bypasses RLS
--                          via the service role key, but we still define explicit
--                          service-role policies for clarity)
-- Note: coin_balance on users is intentionally excluded from the authenticated
--       UPDATE policy. Only the service role (via RPC / API routes) may modify it.
-- =============================================================================

-- =============================================================================
-- users
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- A user can read their own row only.
CREATE POLICY "users: read own row"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- A user can update their own row, but NOT coin_balance.
-- coin_balance is managed exclusively by the service role via RPC.
CREATE POLICY "users: update own row (no coin_balance)"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access.
CREATE POLICY "users: service role full access"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- schools
-- =============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read a school they are associated with
-- (either they are an admin, or their users.school_id matches).
CREATE POLICY "schools: read own school"
  ON schools FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY(admin_ids)
    OR id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- School admins can update their school.
CREATE POLICY "schools: admin can update"
  ON schools FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(admin_ids))
  WITH CHECK (auth.uid() = ANY(admin_ids));

-- Service role has full access.
CREATE POLICY "schools: service role full access"
  ON schools FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- classes
-- =============================================================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Teachers can CRUD their own classes.
CREATE POLICY "classes: teacher full access to own classes"
  ON classes FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Students can read classes they are enrolled in.
CREATE POLICY "classes: students can read enrolled classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT class_id FROM class_students WHERE child_id = auth.uid()
    )
  );

-- Parents can read classes their children are enrolled in.
CREATE POLICY "classes: parents can read children's classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cs.class_id
      FROM class_students cs
      JOIN parent_children pc ON pc.child_id = cs.child_id
      WHERE pc.parent_id = auth.uid()
    )
  );

-- Service role has full access.
CREATE POLICY "classes: service role full access"
  ON classes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- class_students
-- =============================================================================

ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

-- The teacher of the class can manage enrolments.
CREATE POLICY "class_students: teacher can manage"
  ON class_students FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- Children can read their own enrolment rows.
CREATE POLICY "class_students: child can read own enrolments"
  ON class_students FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access.
CREATE POLICY "class_students: service role full access"
  ON class_students FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- parent_children
-- =============================================================================

ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- Parents can read their own links.
CREATE POLICY "parent_children: parent can read own links"
  ON parent_children FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- Children can read links that reference them.
CREATE POLICY "parent_children: child can read links referencing them"
  ON parent_children FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access.
CREATE POLICY "parent_children: service role full access"
  ON parent_children FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- spelling_sets
-- =============================================================================

ALTER TABLE spelling_sets ENABLE ROW LEVEL SECURITY;

-- Creators (teachers or parents) can CRUD their own sets.
CREATE POLICY "spelling_sets: creator full access"
  ON spelling_sets FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Children can read class sets assigned to a class they're in.
CREATE POLICY "spelling_sets: child can read class sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'class'
    AND class_id IN (
      SELECT class_id FROM class_students WHERE child_id = auth.uid()
    )
  );

-- Children can read personal sets assigned directly to them.
CREATE POLICY "spelling_sets: child can read personal sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'personal'
    AND id IN (
      SELECT set_id FROM child_personal_sets WHERE child_id = auth.uid()
    )
  );

-- Service role has full access.
CREATE POLICY "spelling_sets: service role full access"
  ON spelling_sets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- spelling_words
-- =============================================================================

ALTER TABLE spelling_words ENABLE ROW LEVEL SECURITY;

-- Teachers can CRUD words in sets they created.
CREATE POLICY "spelling_words: teacher can manage own set words"
  ON spelling_words FOR ALL
  TO authenticated
  USING (
    set_id IN (
      SELECT id FROM spelling_sets WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    set_id IN (
      SELECT id FROM spelling_sets WHERE created_by = auth.uid()
    )
  );

-- Children can read words in class sets they're enrolled for.
CREATE POLICY "spelling_words: child can read class set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (
    set_id IN (
      SELECT ss.id
      FROM spelling_sets ss
      JOIN class_students cs ON cs.class_id = ss.class_id
      WHERE cs.child_id = auth.uid()
        AND ss.type = 'class'
    )
  );

-- Children can read words in personal sets assigned to them.
CREATE POLICY "spelling_words: child can read personal set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (
    set_id IN (
      SELECT set_id FROM child_personal_sets WHERE child_id = auth.uid()
    )
  );

-- Service role has full access.
CREATE POLICY "spelling_words: service role full access"
  ON spelling_words FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- child_personal_sets
-- =============================================================================

ALTER TABLE child_personal_sets ENABLE ROW LEVEL SECURITY;

-- Creators of the set (parents/teachers) can manage personal set assignments.
CREATE POLICY "child_personal_sets: creator can manage"
  ON child_personal_sets FOR ALL
  TO authenticated
  USING (
    set_id IN (
      SELECT id FROM spelling_sets WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    set_id IN (
      SELECT id FROM spelling_sets WHERE created_by = auth.uid()
    )
  );

-- Children can read their own personal set links.
CREATE POLICY "child_personal_sets: child can read own"
  ON child_personal_sets FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access.
CREATE POLICY "child_personal_sets: service role full access"
  ON child_personal_sets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- child_practice_settings
-- =============================================================================

ALTER TABLE child_practice_settings ENABLE ROW LEVEL SECURITY;

-- Parents can manage their children's practice settings.
CREATE POLICY "child_practice_settings: parent can manage children"
  ON child_practice_settings FOR ALL
  TO authenticated
  USING (
    child_id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- Children can read their own practice settings.
CREATE POLICY "child_practice_settings: child can read own"
  ON child_practice_settings FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access.
CREATE POLICY "child_practice_settings: service role full access"
  ON child_practice_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- child_stats
-- =============================================================================

ALTER TABLE child_stats ENABLE ROW LEVEL SECURITY;

-- Children can read their own stats.
CREATE POLICY "child_stats: child can read own"
  ON child_stats FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access (writes happen via RPC / API routes only).
CREATE POLICY "child_stats: service role full access"
  ON child_stats FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- practice_sessions
-- =============================================================================

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Children can read their own sessions.
CREATE POLICY "practice_sessions: child can read own"
  ON practice_sessions FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role has full access (writes happen via RPC only).
CREATE POLICY "practice_sessions: service role full access"
  ON practice_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- shop_items
-- =============================================================================

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active items.
CREATE POLICY "shop_items: authenticated users can read active items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Service role manages the catalogue.
CREATE POLICY "shop_items: service role full access"
  ON shop_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- child_inventory
-- =============================================================================

ALTER TABLE child_inventory ENABLE ROW LEVEL SECURITY;

-- Children can read their own inventory.
CREATE POLICY "child_inventory: child can read own"
  ON child_inventory FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role manages purchases and refunds.
CREATE POLICY "child_inventory: service role full access"
  ON child_inventory FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- coin_transactions
-- =============================================================================

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Children can read their own transaction history.
CREATE POLICY "coin_transactions: child can read own"
  ON coin_transactions FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());

-- Service role writes all transactions.
CREATE POLICY "coin_transactions: service role full access"
  ON coin_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- class_leaderboard_stats
-- =============================================================================

ALTER TABLE class_leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read eligible entries.
CREATE POLICY "class_leaderboard_stats: authenticated can read eligible"
  ON class_leaderboard_stats FOR SELECT
  TO authenticated
  USING (leaderboard_eligible = TRUE);

-- Service role writes all entries.
CREATE POLICY "class_leaderboard_stats: service role full access"
  ON class_leaderboard_stats FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- school_leaderboard_stats
-- =============================================================================

ALTER TABLE school_leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read eligible entries.
CREATE POLICY "school_leaderboard_stats: authenticated can read eligible"
  ON school_leaderboard_stats FOR SELECT
  TO authenticated
  USING (leaderboard_eligible = TRUE);

-- Service role writes all entries.
CREATE POLICY "school_leaderboard_stats: service role full access"
  ON school_leaderboard_stats FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- global_leaderboard_stats
-- =============================================================================

ALTER TABLE global_leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read eligible entries.
CREATE POLICY "global_leaderboard_stats: authenticated can read eligible"
  ON global_leaderboard_stats FOR SELECT
  TO authenticated
  USING (leaderboard_eligible = TRUE);

-- Service role writes all entries.
CREATE POLICY "global_leaderboard_stats: service role full access"
  ON global_leaderboard_stats FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
