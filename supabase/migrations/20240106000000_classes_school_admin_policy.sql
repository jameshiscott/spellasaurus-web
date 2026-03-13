-- =============================================================================
-- Add RLS policy: school admins can read and manage classes in their schools
-- =============================================================================

-- School admins can SELECT all classes belonging to schools they administer.
CREATE POLICY "classes: school admin can read own school classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  );

-- School admins can INSERT classes into their schools.
CREATE POLICY "classes: school admin can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  );

-- School admins can UPDATE classes in their schools.
CREATE POLICY "classes: school admin can update own school classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  );

-- School admins can DELETE classes in their schools.
CREATE POLICY "classes: school admin can delete own school classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    school_id IN (
      SELECT id FROM schools WHERE admin_ids @> ARRAY[auth.uid()]
    )
  );
