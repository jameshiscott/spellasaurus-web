-- =============================================================================
-- Allow newly-registered users to insert their own profile row.
--
-- After auth.signUp() the user is immediately authenticated, so auth.uid()
-- resolves to their new ID.  The WITH CHECK ensures they can only insert a
-- row whose id matches their own auth identity.
-- =============================================================================

CREATE POLICY "users: user can insert own row on signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
