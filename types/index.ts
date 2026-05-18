export type ComplexityLevel = "Low" | "Medium" | "High";

export interface Skill {
  id: string;
  name: string;
  category: string;
  agency: string;
  description: string;
  primaryUseCase: string;
  targetJobRoles: string;
  efficiencyGain: string;
  complexityLevel: ComplexityLevel;
  dependencies: string;
  saasDependencies: string;
  implementabilityNote: string;
}
