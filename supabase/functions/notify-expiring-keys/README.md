# notify-expiring-keys

Daily Edge Function that emails users when their Skills Lab API key is
within 10 days of expiring. Logging in to the Skills Lab extends all of
that user's active keys by another 90 days and clears the warning flag,
so this email only fires for users who have stopped logging in.

## Setup

1. Enable the `pg_cron` and (optionally) `http` / `pg_net` extensions
   from **Database → Extensions** in the Supabase dashboard.
2. Deploy the function:
   ```bash
   supabase functions deploy notify-expiring-keys --no-verify-jwt
   ```
3. Set the secrets the function needs:
   ```bash
   supabase secrets set \
     RESEND_API_KEY=re_xxx \
     RESEND_FROM_ADDRESS="Skills Lab <noreply@yourdomain.gov.sg>" \
     SITE_URL="https://skillslab.your.gov.sg"
   ```
   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)
4. Schedule it daily — see the commented `cron.schedule(...)` block at
   the bottom of `supabase/agent-feedback.sql`. Uncomment, fill in the
   project ref + service role key, and run it once in the SQL Editor.

## Manual test

```bash
# Backdate one key to fire the warning window:
update api_keys
set expires_at = now() + interval '5 days', expiry_warning_sent_at = null
where id = '<test-key-id>';

# Then invoke:
supabase functions invoke notify-expiring-keys
```

Check the Resend dashboard for the email, then re-invoke — the second
run should report `sent: 0` because `expiry_warning_sent_at` is now
populated.
