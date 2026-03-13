-- =============================================================================
-- RLS cross-role access fixes
--
-- Several tables were missing policies for roles that need to READ data
-- belonging to other users they are legitimately responsible for:
--   • parent  → their children's user rows, class enrolments, class sets/words
--   • teacher → their students' user rows
--   • school_admin → all users in their school, class enrolments
-- =============================================================================

-- =============================================================================
-- users — additional SELECT policies
-- =============================================================================

-- Parents can read their children's user rows
-- (needed by /parent, /parent/lists, /parent/child/[id])
CREATE POLICY "users: parent can read own children"
  ON users FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- Teachers can read user rows for students enrolled in their classes
-- (needed by /teacher/class/[id] student list)
CREATE POLICY "users: teacher can read own students"
  ON users FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cs.child_id
      FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- School admins can read any user whose school_id matches their school
-- (needed by /admin/classes/[schoolId] teacher name join)
CREATE POLICY "users: school admin can read own school users"
  ON users FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  );

-- =============================================================================
-- class_students — additional SELECT policies
-- =============================================================================

-- Parents can read enrolment rows for their own children
-- (needed by /parent/child/[id] to find which class a child is in)
CREATE POLICY "class_students: parent can read own children enrolments"
  ON class_students FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- School admins can read and manage enrolments for classes in their school
CREATE POLICY "class_students: school admin can read own school enrolments"
  ON class_students FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE school_id IN (
        SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
      )
    )
  );

CREATE POLICY "class_students: school admin can manage own school enrolments"
  ON class_students FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes
      WHERE school_id IN (
        SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
      )
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes
      WHERE school_id IN (
        SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
      )
    )
  );

-- =============================================================================
-- spelling_sets — additional SELECT policy for parents
-- =============================================================================

-- Parents can read class spelling sets assigned to their children's classes
-- (needed by /parent/child/[id] to show recent class sets)
CREATE POLICY "spelling_sets: parent can read children class sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'class'
    AND class_id IN (
      SELECT cs.class_id
      FROM class_students cs
      JOIN parent_children pc ON pc.child_id = cs.child_id
      WHERE pc.parent_id = auth.uid()
    )
  );

-- =============================================================================
-- spelling_words — additional SELECT policy for parents
-- =============================================================================

-- Parents can read words in class sets their children are enrolled for,
-- and in personal sets assigned to their children
-- (needed by /parent/child/[id] word-count queries)
CREATE POLICY "spelling_words: parent can read children set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (
    -- words in a class set their child is enrolled for
    set_id IN (
      SELECT ss.id
      FROM spelling_sets ss
      JOIN class_students cs ON cs.class_id = ss.class_id
      JOIN parent_children pc ON pc.child_id = cs.child_id
      WHERE pc.parent_id = auth.uid()
        AND ss.type = 'class'
    )
    OR
    -- words in a personal set assigned to their child
    set_id IN (
      SELECT cps.set_id
      FROM child_personal_sets cps
      JOIN parent_children pc ON pc.child_id = cps.child_id
      WHERE pc.parent_id = auth.uid()
    )
  );
