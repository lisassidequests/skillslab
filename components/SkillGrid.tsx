import SkillCard from "./SkillCard";
import type { Skill } from "@/types";

interface SkillGridProps {
  skills: Skill[];
  upvoteCounts: Record<string, number>;
  userUpvotes: Set<string>;
  onUpvote: (skillId: string) => void;
  linkPrefix?: string;
}

export default function SkillGrid({
  skills,
  upvoteCounts,
  userUpvotes,
  onUpvote,
  linkPrefix,
}: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-12 text-center">
        No skills match your search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          upvoteCount={upvoteCounts[skill.id] ?? 0}
          hasUpvoted={userUpvotes.has(skill.id)}
          onUpvote={onUpvote}
          linkPrefix={linkPrefix}
        />
      ))}
    </div>
  );
}
