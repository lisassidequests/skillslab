import Link from "next/link";
import { Eye } from "lucide-react";
import type { Skill } from "@/types";
import { categoryColor } from "@/lib/skills";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const tagClass = categoryColor(skill.category);
  const shortCategory = skill.category.split(" & ")[0];

  return (
    <Link
      href={`/skills/${skill.id}`}
      className="block bg-white border-2 border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-400 transition group"
    >
      <div
        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2 ${tagClass}`}
      >
        {shortCategory}
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
        {skill.name}
      </h3>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {skill.primaryUseCase}
      </p>
      <span className="text-blue-600 group-hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
        <Eye size={14} /> Details
      </span>
    </Link>
  );
}
