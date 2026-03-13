-- =============================================================================
-- Fix infinite recursion in RLS policies
--
-- Policies that JOIN across tables (users→class_students→classes→class_students,
-- users→schools→users) create circular evaluation chains that PostgreSQL
-- detects and rejects.
--
-- Solution: SECURITY DEFINER helper functions bypass RLS when called from
-- within a policy, breaking every recursive chain.
-- =============================================================================

-- Drop the problematic policies added in migration 20240107
DROP POLICY IF EXISTS "users: teacher can read own students"             ON users;
DROP POLICY IF EXISTS "users: school admin can read own school users"    ON users;
DROP POLICY IF EXISTS "class_students: school admin can read own school enrolments"   ON class_students;
DROP POLICY IF EXISTS "class_students: school admin can manage own school enrolments" ON class_students;
DROP POLICY IF EXISTS "spelling_sets: parent can read children class sets"   ON spelling_sets;
DROP POLICY IF EXISTS "spelling_words: parent can read children set words"   ON spelling_words;

-- =============================================================================
-- SECURITY DEFINER helper functions
-- Each runs as the DB owner, so no RLS is applied inside — safe to join freely.
-- =============================================================================

-- Returns child_id UUIDs enrolled in classes taught by the calling user
CREATE OR REPLACE FUNCTION rls_teacher_student_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT cs.child_id
  FROM   class_students cs
  JOIN   classes        c  ON c.id = cs.class_id
  WHERE  c.teacher_id = auth.uid();
$$;

-- Returns school UUIDs where the calling user is listed in admin_ids
CREATE OR REPLACE FUNCTION rls_admin_school_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()];
$$;

-- Returns class UUIDs belonging to schools administered by the calling user
CREATE OR REPLACE FUNCTION rls_admin_class_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT c.id
  FROM   classes  c
  JOIN   schools  s ON s.id = c.school_id
  WHERE  s.admin_ids @> ARRAY[auth.uid()];
$$;

-- Returns class UUIDs that contain any child linked to the calling parent
CREATE OR REPLACE FUNCTION rls_parent_child_class_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT cs.class_id
  FROM   class_students  cs
  JOIN   parent_children pc ON pc.child_id = cs.child_id
  WHERE  pc.parent_id = auth.uid();
$$;

-- Returns spelling_set UUIDs readable by the calling parent:
--   • class sets whose class their child is enrolled in
--   • personal sets assigned to their child
CREATE OR REPLACE FUNCTION rls_parent_accessible_set_ids()
  RETURNS SETOF UUID
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public
AS $$
  SELECT ss.id
  FROM   spelling_sets   ss
  JOIN   class_students  cs ON cs.class_id = ss.class_id
  JOIN   parent_children pc ON pc.child_id = cs.child_id
  WHERE  pc.parent_id = auth.uid()
    AND  ss.type = 'class'
  UNION
  SELECT cps.set_id
  FROM   child_personal_sets cps
  JOIN   parent_children     pc  ON pc.child_id = cps.child_id
  WHERE  pc.parent_id = auth.uid();
$$;

-- =============================================================================
-- Re-create safe versions of the policies
-- =============================================================================

-- users: teacher reads students in their classes
CREATE POLICY "users: teacher can read own students"
  ON users FOR SELECT
  TO authenticated
  USING (id IN (SELECT rls_teacher_student_ids()));

-- users: school admin reads all users in their school (teachers + students)
CREATE POLICY "users: school admin can read own school users"
  ON users FOR SELECT
  TO authenticated
  USING (
    school_id IS NOT NULL
    AND school_id IN (SELECT rls_admin_school_ids())
  );

-- class_students: school admin can read enrolments in their school's classes
CREATE POLICY "class_students: school admin can read own school enrolments"
  ON class_students FOR SELECT
  TO authenticated
  USING (class_id IN (SELECT rls_admin_class_ids()));

-- class_students: school admin can add students to their school's classes
CREATE POLICY "class_students: school admin can insert own school enrolments"
  ON class_students FOR INSERT
  TO authenticated
  WITH CHECK (class_id IN (SELECT rls_admin_class_ids()));

-- class_students: school admin can remove students from their school's classes
CREATE POLICY "class_students: school admin can delete own school enrolments"
  ON class_students FOR DELETE
  TO authenticated
  USING (class_id IN (SELECT rls_admin_class_ids()));

-- spelling_sets: parent can read class sets for their children's classes
CREATE POLICY "spelling_sets: parent can read children class sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'class'
    AND class_id IN (SELECT rls_parent_child_class_ids())
  );

-- spelling_words: parent can read words in sets accessible to their children
CREATE POLICY "spelling_words: parent can read children set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (set_id IN (SELECT rls_parent_accessible_set_ids()));
