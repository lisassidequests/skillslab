-- Run this in Supabase Dashboard → SQL Editor
-- Adds anonymous (anon) SELECT policies so the public /demo/<token> route
-- can read the skills library without an authenticated session.
-- Writes remain blocked because no anon INSERT/DELETE policies are added.

CREATE POLICY "skills_read_anon"  ON skills  FOR SELECT TO anon USING (true);
CREATE POLICY "upvotes_read_anon" ON upvotes FOR SELECT TO anon USING (true);
