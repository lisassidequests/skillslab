import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ctx = await verifyApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      { error: "Invalid or expired API key" },
      { status: 401 }
    );
  }

  let body: {
    skill_id?: unknown;
    success?: unknown;
    rating?: unknown;
    error_category?: unknown;
    notes?: unknown;
    pull_id?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const skillId = typeof body.skill_id === "string" ? body.skill_id : null;
  if (!skillId) {
    return NextResponse.json(
      { error: "skill_id (string) is required" },
      { status: 400 }
    );
  }
  if (typeof body.success !== "boolean") {
    return NextResponse.json(
      { error: "success (boolean) is required" },
      { status: 400 }
    );
  }

  let rating: number | null = null;
  if (body.rating !== undefined && body.rating !== null) {
    if (
      typeof body.rating !== "number" ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return NextResponse.json(
        { error: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }
    rating = body.rating;
  }

  const errorCategory =
    typeof body.error_category === "string" ? body.error_category : null;
  const notes = typeof body.notes === "string" ? body.notes : null;
  const pullId = typeof body.pull_id === "string" ? body.pull_id : null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("skill_runs")
    .insert({
      skill_id: skillId,
      api_key_id: ctx.id,
      pull_id: pullId,
      success: body.success,
      rating,
      error_category: errorCategory,
      notes,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
