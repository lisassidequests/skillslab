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
}
