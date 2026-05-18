import Link from "next/link";
import { ArrowRight, ThumbsUp } from "lucide-react";
import type { Skill } from "@/types";
import { categoryColor } from "@/lib/skills";

interface SkillCardProps {
  skill: Skill;
  upvoteCount: number;
  hasUpvoted: boolean;
  onUpvote: (skillId: string) => void;
}

export default function SkillCard({
  skill,
  upvoteCount,
  hasUpvoted,
  onUpvote,
}: SkillCardProps) {
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

      {skill.submittedBy && (
        <p className="text-[10px] text-gray-400 mb-2 truncate">
          Submitted by {skill.submittedBy}
        </p>
      )}

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

      <div className="mt-auto flex items-center justify-between">
        <span className="text-blue-600 group-hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
          View Details <ArrowRight size={12} />
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpvote(skill.id);
          }}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition ${
            hasUpvoted
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ThumbsUp size={12} className={hasUpvoted ? "fill-blue-600" : ""} />
          {upvoteCount}
        </button>
      </div>
    </Link>
  );
}
