export type ComplexityLevel = "Low" | "Medium" | "High";

export interface Skill {
  id: string;
  name: string;
  category: string;
  agency: string;
  description: string;
  primaryUseCase: string;
  targetJobRoles: string;
  complexityLevel: ComplexityLevel;
  dependencies: string;
  saasDependencies: string;
  implementabilityNote: string;
  whenToUse?: string;
  inputs?: string[];
  instructions?: string[];
  toolsAllowed?: string;
  outputFormat?: string;
  constraintsList?: string[];
  failureHandling?: string;
  skillExamples?: string[];
  submittedBy?: string;
  reportingPrompt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  ownerEmail: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  expiresAt: string;
  expiryWarningSentAt?: string;
}

export interface SkillPull {
  id: string;
  skillId: string;
  apiKeyId?: string;
  pulledAt: string;
  taskContext?: string;
}

export interface SkillRun {
  id: string;
  skillId: string;
  apiKeyId?: string;
  pullId?: string;
  success: boolean;
  rating?: number;
  errorCategory?: string;
  notes?: string;
  reportedAt: string;
}

export interface SkillUsageStats {
  pullsLast7d: number;
  totalRuns: number;
  avgRating: number | null;
  topErrorCategory: string | null;
}
