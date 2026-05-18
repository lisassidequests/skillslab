import { notFound } from "next/navigation";
import SkillDetail from "@/components/SkillDetail";
import { getAllSkills, getSkill } from "@/lib/skills";

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ id: skill.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const skill = getSkill(params.id);
  if (!skill) return { title: "Skill not found" };
  return { title: `${skill.name} – Skills Lab` };
}

export default function SkillPage({ params }: { params: { id: string } }) {
  const skill = getSkill(params.id);
  if (!skill) notFound();
  return <SkillDetail skill={skill} />;
}
