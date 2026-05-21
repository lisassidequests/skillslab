-- Run this in Supabase Dashboard → SQL Editor
-- Allows authenticated users to submit new skills.
-- (RLS is enabled on skills but only a SELECT policy existed, so every
--  insert was rejected with "new row violates row-level security policy".)

CREATE POLICY "skills_insert" ON skills
  FOR INSERT TO authenticated WITH CHECK (true);
