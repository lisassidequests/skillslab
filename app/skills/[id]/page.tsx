import { notFound } from "next/navigation";
import SkillDetail from "@/components/SkillDetail";
import { createClient } from "@/lib/supabase/server";
import { getSkillUsageStats, mapSkill } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("name")
    .eq("id", params.id)
    .single();
  if (!data) return { title: "Skill not found" };
  return { title: `${data.name} – Skills Lab` };
}

export default async function SkillPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const [{ data: raw }, { data: { user } }, { data: upvotes }, usageStats] =
    await Promise.all([
      supabase.from("skills").select("*").eq("id", params.id).single(),
      supabase.auth.getUser(),
      supabase
        .from("upvotes")
        .select("user_id")
        .eq("skill_id", params.id),
      getSkillUsageStats(params.id),
    ]);

  if (!raw) notFound();

  const skill = mapSkill(raw);
  const upvoteCount = upvotes?.length ?? 0;
  const hasUpvoted =
    user != null && (upvotes?.some((u) => u.user_id === user.id) ?? false);

  return (
    <SkillDetail
      skill={skill}
      initialUpvoteCount={upvoteCount}
      initialHasUpvoted={hasUpvoted}
      usageStats={usageStats}
    />
  );
}
