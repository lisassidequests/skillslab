-- ============================================================
-- Singapore Government Skills Lab – Agent Access + Feedback
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Requires:
--   - pg_cron extension enabled (Database → Extensions → pg_cron)
--   - http extension enabled if you want pg_cron → Edge Function
--     (Database → Extensions → http)
--   - Resend account (RESEND_API_KEY, RESEND_FROM_ADDRESS set as
--     Supabase Edge Function secrets — NOT Vercel)
-- ============================================================

-- 1. API keys (per-agent, hashed, revocable, auto-expiring)
CREATE TABLE IF NOT EXISTS api_keys (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  owner_email              TEXT NOT NULL,
  key_hash                 TEXT NOT NULL UNIQUE,
  key_prefix               TEXT NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at             TIMESTAMPTZ,
  revoked_at               TIMESTAMPTZ,
  expires_at               TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '90 days',
  expiry_warning_sent_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS api_keys_owner_email_idx
  ON api_keys(owner_email)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx
  ON api_keys(expires_at)
  WHERE revoked_at IS NULL;

-- 2. Skill pulls (telemetry: every detail fetch by an agent)
CREATE TABLE IF NOT EXISTS skill_pulls (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  api_key_id    UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  pulled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task_context  TEXT
);

CREATE INDEX IF NOT EXISTS skill_pulls_skill_idx
  ON skill_pulls(skill_id, pulled_at DESC);

-- 3. Skill runs (outcome reports posted back by agents)
CREATE TABLE IF NOT EXISTS skill_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id        TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  api_key_id      UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  pull_id         UUID REFERENCES skill_pulls(id) ON DELETE SET NULL,
  success         BOOLEAN NOT NULL,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  error_category  TEXT,
  notes           TEXT,
  reported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS skill_runs_skill_idx
  ON skill_runs(skill_id, reported_at DESC);

-- 4. Row Level Security
ALTER TABLE api_keys    ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_pulls ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_runs  ENABLE ROW LEVEL SECURITY;

-- api_keys: no policies → only service_role can touch.
-- Humans read their own keys via /api/keys which uses the admin client
-- and filters by the authenticated user's email.

CREATE POLICY "skill_pulls_read" ON skill_pulls
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "skill_runs_read" ON skill_runs
  FOR SELECT TO authenticated USING (true);

-- 5. Schedule the daily expiry-warning Edge Function via pg_cron.
-- Replace <PROJECT_REF> with your Supabase project ref and
-- <SERVICE_ROLE_KEY> with the service role key (or store it in
-- Supabase Vault and reference it).
--
-- SELECT cron.schedule(
--   'notify-expiring-keys-daily',
--   '0 9 * * *',
--   $$
--     SELECT net.http_post(
--       url := 'https://<PROJECT_REF>.functions.supabase.co/notify-expiring-keys',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--       )
--     );
--   $$
-- );
