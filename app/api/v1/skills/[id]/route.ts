import { NextRequest, NextResponse } from "next/server";
import { buildReportingPrompt, verifyApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSkill } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await verifyApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      { error: "Invalid or expired API key" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("skills")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const taskContext = req.nextUrl.searchParams.get("task") ?? null;

  const { data: pull, error: pullError } = await admin
    .from("skill_pulls")
    .insert({
      skill_id: row.id,
      api_key_id: ctx.id,
      task_context: taskContext,
    })
    .select("id")
    .single();

  if (pullError || !pull) {
    return NextResponse.json(
      { error: pullError?.message ?? "Failed to record pull" },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  const skill = mapSkill(row);
  const reportingPrompt = buildReportingPrompt(pull.id, row.id, baseUrl);

  return NextResponse.json({
    skill: { ...skill, reportingPrompt },
    pull_id: pull.id,
    reporting_prompt: reportingPrompt,
  });
}
