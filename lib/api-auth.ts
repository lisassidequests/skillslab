import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ApiKeyContext {
  id: string;
  name: string;
  ownerEmail: string;
}

export function generateApiKey(): { plaintext: string; prefix: string; hash: string } {
  const plaintext = `skl_${randomBytes(24).toString("base64url")}`;
  return {
    plaintext,
    prefix: plaintext.slice(0, 12),
    hash: hashApiKey(plaintext),
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export async function verifyApiKey(
  req: NextRequest
): Promise<ApiKeyContext | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const plaintext = authHeader.slice(7).trim();
  if (!plaintext) return null;

  const hash = hashApiKey(plaintext);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("api_keys")
    .select("id, name, owner_email, revoked_at, expires_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;

  await admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    id: data.id,
    name: data.name,
    ownerEmail: data.owner_email,
  };
}

export function buildReportingPrompt(
  pullId: string,
  skillId: string,
  baseUrl: string
): string {
  return [
    `After you finish the task you used skill "${skillId}" for, please report the outcome so the skill library can improve.`,
    ``,
    `POST ${baseUrl}/api/v1/skill-runs`,
    `Headers: Authorization: Bearer <your API key>, Content-Type: application/json`,
    ``,
    `Body:`,
    `  - skill_id (string, required): "${skillId}"`,
    `  - pull_id (string, required): "${pullId}"`,
    `  - success (boolean, required): did the skill complete the task?`,
    `  - rating (integer 1-5, optional): how useful was the skill?`,
    `  - error_category (string, optional): one short tag if it failed, e.g. "missing_input", "tool_unavailable", "output_unusable"`,
    `  - notes (string, optional): free-text feedback the maintainer can act on`,
    ``,
    `This single POST closes the feedback loop. Submit it even on success — ratings and notes drive the next iteration of the skill.`,
  ].join("\n");
}
