import skillsData from "@/data/skills.json";
import type { Skill } from "@/types";

const skills = skillsData as Skill[];

export function getAllSkills(): Skill[] {
  return skills;
}

export function getSkill(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getAllCategories(): string[] {
  const set = new Set(skills.map((s) => s.category));
  return Array.from(set).sort();
}

export function filterSkills(
  query: string,
  categories: string[]
): Skill[] {
  const q = query.trim().toLowerCase();
  return skills.filter((s) => {
    if (categories.length > 0 && !categories.includes(s.category)) return false;
    if (!q) return true;
    const haystack = [
      s.name,
      s.description,
      s.primaryUseCase,
      s.category,
      s.targetJobRoles,
      s.whenToUse ?? "",
      s.outputFormat ?? "",
      s.failureHandling ?? "",
      ...(s.inputs ?? []),
      ...(s.instructions ?? []),
      ...(s.constraintsList ?? []),
      ...(s.skillExamples ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Software Engineering": "bg-blue-100 text-blue-800",
  "UX & Design": "bg-pink-100 text-pink-800",
  "Product & Programme Management": "bg-violet-100 text-violet-800",
  "Cybersecurity": "bg-red-100 text-red-800",
  "IT Operations": "bg-slate-100 text-slate-800",
  "Policy & Strategy": "bg-purple-100 text-purple-800",
  "Communications": "bg-green-100 text-green-800",
  "Online Safety & Digital Defence": "bg-orange-100 text-orange-800",
  "Intelligence & Research": "bg-indigo-100 text-indigo-800",
  "Scheduling & Coordination": "bg-amber-100 text-amber-800",
  "Communication & Engagement": "bg-emerald-100 text-emerald-800",
  "Content & Documentation": "bg-cyan-100 text-cyan-800",
  "Citizen-Facing Service": "bg-teal-100 text-teal-800",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-800";
}
