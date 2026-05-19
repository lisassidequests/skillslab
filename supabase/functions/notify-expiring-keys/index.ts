// Supabase Edge Function: notify-expiring-keys
//
// Runs daily (scheduled via pg_cron — see supabase/agent-feedback.sql).
// Sends a one-time email warning when an API key is within 10 days of
// expiry. Logging in to the Skills Lab automatically extends keys by
// 90 days and clears the warning flag, so a user who logs in regularly
// will never receive this email.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_FROM_ADDRESS")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://skillslab";

interface ExpiringKey {
  id: string;
  name: string;
  owner_email: string;
  key_prefix: string;
  expires_at: string;
}

async function sendEmail(key: ExpiringKey): Promise<boolean> {
  const expiryDate = new Date(key.expires_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: key.owner_email,
      subject: `Your Skills Lab API key "${key.name}" expires on ${expiryDate}`,
      text: [
        `Hi,`,
        ``,
        `Your Skills Lab API key "${key.name}" (${key.key_prefix}…) will expire on ${expiryDate}.`,
        ``,
        `To renew it, just log in at ${SITE_URL}/login — the key will be extended automatically by another 90 days.`,
        ``,
        `If you no longer need this key, you can revoke it at ${SITE_URL}/settings/api-keys.`,
        ``,
        `— Skills Lab`,
      ].join("\n"),
    }),
  });
  return res.ok;
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const cutoff = new Date(
    Date.now() + 10 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, owner_email, key_prefix, expires_at")
    .is("revoked_at", null)
    .is("expiry_warning_sent_at", null)
    .lte("expires_at", cutoff)
    .gt("expires_at", new Date().toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const keys = (data ?? []) as ExpiringKey[];
  let sent = 0;
  for (const key of keys) {
    const ok = await sendEmail(key);
    if (!ok) continue;
    await supabase
      .from("api_keys")
      .update({ expiry_warning_sent_at: new Date().toISOString() })
      .eq("id", key.id);
    sent += 1;
  }

  return new Response(
    JSON.stringify({ candidates: keys.length, sent }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
