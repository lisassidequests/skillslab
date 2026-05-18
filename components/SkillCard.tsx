import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      className="flex flex-col bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-400 transition group min-h-[200px]"
    >
      <div
        className={`inline-block self-start px-2 py-0.5 rounded text-xs font-semibold mb-3 ${tagClass}`}
      >
        {shortCategory}
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
        {skill.name}
      </h3>

      <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed flex-1">
        {skill.description}
      </p>

      {skill.primaryUseCase && (
        <p className="text-xs text-gray-400 italic mb-3 line-clamp-2">
          {skill.primaryUseCase}
        </p>
      )}

      <span className="mt-auto text-blue-600 group-hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
        View Details <ArrowRight size={12} />
      </span>
    </Link>
  );
}
