import type { Skill } from "@/types";

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
