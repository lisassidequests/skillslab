import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSkill } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await verifyApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      { error: "Invalid or expired API key" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("skills")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skills: (data ?? []).map(mapSkill) });
}
