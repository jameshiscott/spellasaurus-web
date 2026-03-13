-- =============================================================================
-- Multi-class spelling sets + student enrolment improvements
-- =============================================================================

-- Junction table: allow a spelling set to be shared across multiple classes.
-- The original spelling_sets.class_id remains as the "home" class for backwards
-- compatibility. This table adds *additional* class assignments.
CREATE TABLE IF NOT EXISTS class_spelling_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES spelling_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, set_id)
);

ALTER TABLE class_spelling_sets ENABLE ROW LEVEL SECURITY;

-- Teacher who owns the class can manage assignments
CREATE POLICY "class_spelling_sets: teacher can manage"
  ON class_spelling_sets FOR ALL
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

-- Creator of the set can manage assignments
CREATE POLICY "class_spelling_sets: set creator can manage"
  ON class_spelling_sets FOR ALL
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

-- Children can read assignments for classes they're in
CREATE POLICY "class_spelling_sets: child can read"
  ON class_spelling_sets FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT class_id FROM class_students WHERE child_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "class_spelling_sets: service role full access"
  ON class_spelling_sets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Update child spelling set visibility to include sets from class_spelling_sets
-- =============================================================================

-- Drop the old child-read policy and recreate to also check the junction table
DROP POLICY IF EXISTS "spelling_sets: child can read class sets" ON spelling_sets;

CREATE POLICY "spelling_sets: child can read class sets"
  ON spelling_sets FOR SELECT
  TO authenticated
  USING (
    type = 'class'
    AND (
      -- Original: set's home class
      class_id IN (
        SELECT class_id FROM class_students WHERE child_id = auth.uid()
      )
      OR
      -- New: set shared to a class the child is in
      id IN (
        SELECT css.set_id
        FROM class_spelling_sets css
        JOIN class_students cs ON cs.class_id = css.class_id
        WHERE cs.child_id = auth.uid()
      )
    )
  );

-- Also update spelling_words child read to include the junction table
DROP POLICY IF EXISTS "spelling_words: child can read class set words" ON spelling_words;

CREATE POLICY "spelling_words: child can read class set words"
  ON spelling_words FOR SELECT
  TO authenticated
  USING (
    set_id IN (
      SELECT ss.id
      FROM spelling_sets ss
      WHERE ss.type = 'class'
        AND (
          ss.class_id IN (
            SELECT class_id FROM class_students WHERE child_id = auth.uid()
          )
          OR ss.id IN (
            SELECT css.set_id
            FROM class_spelling_sets css
            JOIN class_students cs ON cs.class_id = css.class_id
            WHERE cs.child_id = auth.uid()
          )
        )
    )
  );

-- =============================================================================
-- Allow school admins to manage class_students (enrolment)
-- =============================================================================

CREATE POLICY "class_students: school admin can manage"
  ON class_students FOR ALL
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE auth.uid() = ANY(admin_ids)
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE auth.uid() = ANY(admin_ids)
    )
  );
