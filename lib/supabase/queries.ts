import type { ApiKey, Skill, SkillUsageStats } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type DbSkill = {
  id: string;
  name: string;
  category: string;
  agency: string;
  description: string;
  primary_use_case: string;
  target_job_roles: string;
  complexity_level: string;
  dependencies: string;
  saas_dependencies: string;
  implementability_note: string;
  when_to_use: string | null;
  inputs: string[] | null;
  instructions: string[] | null;
  tools_allowed: string | null;
  output_format: string | null;
  constraints_list: string[] | null;
  failure_handling: string | null;
  skill_examples: string[] | null;
  submitted_by: string | null;
};

export function mapSkill(row: DbSkill): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    agency: row.agency,
    description: row.description,
    primaryUseCase: row.primary_use_case,
    targetJobRoles: row.target_job_roles,
    complexityLevel: row.complexity_level as Skill["complexityLevel"],
    dependencies: row.dependencies,
    saasDependencies: row.saas_dependencies,
    implementabilityNote: row.implementability_note,
    whenToUse: row.when_to_use ?? undefined,
    inputs: row.inputs ?? undefined,
    instructions: row.instructions ?? undefined,
    toolsAllowed: row.tools_allowed ?? undefined,
    outputFormat: row.output_format ?? undefined,
    constraintsList: row.constraints_list ?? undefined,
    failureHandling: row.failure_handling ?? undefined,
    skillExamples: row.skill_examples ?? undefined,
    submittedBy: row.submitted_by ?? undefined,
  };
}

export type DbApiKey = {
  id: string;
  name: string;
  owner_email: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  expiry_warning_sent_at: string | null;
};

export function mapApiKey(row: DbApiKey): ApiKey {
  return {
    id: row.id,
    name: row.name,
    ownerEmail: row.owner_email,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at ?? undefined,
    revokedAt: row.revoked_at ?? undefined,
    expiresAt: row.expires_at,
    expiryWarningSentAt: row.expiry_warning_sent_at ?? undefined,
  };
}

export async function getSkillUsageStats(
  skillId: string
): Promise<SkillUsageStats | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const admin = createAdminClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [pullsRes, runsRes] = await Promise.all([
      admin
        .from("skill_pulls")
        .select("id", { count: "exact", head: true })
        .eq("skill_id", skillId)
        .gte("pulled_at", sevenDaysAgo),
      admin
        .from("skill_runs")
        .select("rating, error_category")
        .eq("skill_id", skillId),
    ]);

    if (pullsRes.error || runsRes.error) return null;

    const runs = runsRes.data ?? [];
    const ratings = runs
      .map((r) => r.rating)
      .filter((n): n is number => typeof n === "number");
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    const errorCounts = new Map<string, number>();
    for (const r of runs) {
      if (r.error_category) {
        errorCounts.set(
          r.error_category,
          (errorCounts.get(r.error_category) ?? 0) + 1
        );
      }
    }
    let topErrorCategory: string | null = null;
    let topCount = 0;
    for (const [cat, count] of errorCounts) {
      if (count > topCount) {
        topErrorCategory = cat;
        topCount = count;
      }
    }

    return {
      pullsLast7d: pullsRes.count ?? 0,
      totalRuns: runs.length,
      avgRating,
      topErrorCategory,
    };
  } catch {
    return null;
  }
}
