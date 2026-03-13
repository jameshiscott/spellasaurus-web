-- =============================================================================
-- Fix infinite recursion in original RLS policies (migration 20240102)
--
-- Two cycles exist in the original policies:
--
--   Cycle A (classes ↔ class_students):
--     classes "students can read"  → reads class_students
--     class_students "teacher can manage"  → reads classes   ← LOOP
--
--   Cycle B (spelling_sets ↔ child_personal_sets):
--     spelling_sets "child can read personal sets" → reads child_personal_sets
--     child_personal_sets "creator can manage"     → reads spelling_sets   ← LOOP
--
-- Both cycles affect ALL authenticated users because PostgreSQL OR-combines
-- every policy on a table, so all are evaluated even when the caller's own
-- policy would already return TRUE.
--
-- Fix: Replace every cross-table lookup that forms a cycle with a call to a
-- SECURITY DEFINER function.  SECURITY DEFINER runs as the DB owner and does
-- not trigger RLS on the tables it reads, breaking every chain.
-- =============================================================================

-- =============================================================================
-- Drop original problematic policies
-- =============================================================================

DROP POLICY IF EXISTS "classes: students can read enrolled classes"       ON classes;
DROP POLICY IF EXISTS "classes: parents can read children's classes"      ON classes;

DROP POLICY IF EXISTS "class_students: teacher can manage"                ON class_students;

DROP POLICY IF EXISTS "spelling_sets: child can read class sets"          ON spelling_sets;
DROP POLICY IF EXISTS "spelling_sets: child can read personal sets"       ON spelling_sets;

DROP POLICY IF EXISTS "child_personal_sets: creator can manage"           ON child_personal_sets;

DROP POLICY IF EXISTS "spelling_words: teacher can manage own set words"  ON spelling_words;
DROP POLICY IF EXISTS "spelling_words: child can read class set words"    ON spelling_words;
DROP POLICY IF EXISTS "spelling_words: child can read personal set words" ON spelling_words;

-- =============================================================================
-- SECURITY DEFINER helper functions
-- Bypass RLS so no recursive policy evaluation occurs.
-- =============================================================================

-- Class IDs that the calling child is enrolled in
CREATE OR REPLACE FUNCTION rls_child_enrolled_class_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT class_id FROM class_students WHERE child_id = auth.uid();
$$;

-- Class IDs that the calling teacher teaches
CREATE OR REPLACE FUNCTION rls_teacher_class_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT id FROM classes WHERE teacher_id = auth.uid();
$$;

-- Spelling-set IDs in the calling child's personal assignment list
CREATE OR REPLACE FUNCTION rls_child_personal_set_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT set_id FROM child_personal_sets WHERE child_id = auth.uid();
$$;

-- Spelling-set IDs created by the calling user
CREATE OR REPLACE FUNCTION rls_creator_set_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT id FROM spelling_sets WHERE created_by = auth.uid();
$$;

-- All spelling-set IDs readable by the calling child (class + personal)
CREATE OR REPLACE FUNCTION rls_child_accessible_set_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  -- class sets for every class the child is enrolled in
  SELECT ss.id
  FROM   spelling_sets  ss
  WHERE  ss.type = 'class'
    AND  ss.class_id IN (SELECT class_id FROM class_students WHERE child_id = auth.uid())
  UNION
  -- personal sets assigned directly to this child
  SELECT set_id FROM child_personal_sets WHERE child_id = auth.uid();
$$;

-- =============================================================================
-- classes — re-create safe policies
-- =============================================================================

-- Children can read classes they are enrolled in
CREATE POLICY "classes: students can read enrolled classes"
  ON classes FOR SELECT
  TO authenticated
  USING (id IN (SELECT rls_child_enrolled_class_ids()));

-- Parents can read classes any of their children are enrolled in
CREATE POLICY "classes: parents can read children's classes"
  ON classes FOR SELECT
  TO authenticated
  USING (id IN (SELECT rls_parent_child_class_ids()));

-- =============================================================================
-- class_students — re-create safe teacher policy
-- =============================================================================

CREATE POLICY "class_students: teacher can manage"
  ON class_students FOR ALL
  TO authenticated
  USING (class_id IN (SELECT rls_teacher_class_ids()))
  WITH CHECK (class_id IN (SELECT rls_teacher_class_ids()));

-- =============================================================================
-- spelling_sets — re-create safe child policies
-- =============================================================================

-- Children can read class spelling sets for classes they are enrolled in
CREATE POLICY "spelling_sets: child can read class sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'class'
    AND class_id IN (SELECT rls_child_enrolled_class_ids())
  );

-- Children can read personal spelling sets assigned to them
CREATE POLICY "spelling_sets: child can read personal sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'personal'
    AND id IN (SELECT rls_child_personal_set_ids())
  );

-- =============================================================================
-- child_personal_sets — re-create safe creator policy
-- =============================================================================

-- The creator of a spelling set can manage its personal assignments
CREATE POLICY "child_personal_sets: creator can manage"
  ON child_personal_sets FOR ALL
  TO authenticated
  USING (set_id IN (SELECT rls_creator_set_ids()))
  WITH CHECK (set_id IN (SELECT rls_creator_set_ids()));

-- =============================================================================
-- spelling_words — re-create safe policies
-- =============================================================================

-- Creators (teachers / parents) can manage words in their own sets
CREATE POLICY "spelling_words: creator can manage own set words"
  ON spelling_words FOR ALL
  TO authenticated
  USING (set_id IN (SELECT rls_creator_set_ids()))
  WITH CHECK (set_id IN (SELECT rls_creator_set_ids()));

-- Children can read words in all sets accessible to them (class + personal)
CREATE POLICY "spelling_words: child can read accessible set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (set_id IN (SELECT rls_child_accessible_set_ids()));
