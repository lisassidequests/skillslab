import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/api-auth";
import { mapApiKey } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .select(
      "id, name, owner_email, key_prefix, created_at, last_used_at, revoked_at, expires_at, expiry_warning_sent_at"
    )
    .eq("owner_email", user.email)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ keys: (data ?? []).map(mapApiKey) });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { plaintext, prefix, hash } = generateApiKey();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .insert({
      name,
      owner_email: user.email,
      key_hash: hash,
      key_prefix: prefix,
    })
    .select(
      "id, name, owner_email, key_prefix, created_at, last_used_at, revoked_at, expires_at, expiry_warning_sent_at"
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create key" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { key: mapApiKey(data), plaintext },
    { status: 201 }
  );
}
