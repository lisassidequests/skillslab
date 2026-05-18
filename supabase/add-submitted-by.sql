-- Run this in Supabase Dashboard → SQL Editor
-- Adds the submitted_by column to the skills table

ALTER TABLE skills ADD COLUMN IF NOT EXISTS submitted_by TEXT;
