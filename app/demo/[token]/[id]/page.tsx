import { notFound } from "next/navigation";
import SkillDetail from "@/components/SkillDetail";
import { createClient } from "@/lib/supabase/server";
import { mapSkill } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function DemoSkillPage({
  params,
}: {
  params: { token: string; id: string };
}) {
  const supabase = await createClient();

  const [{ data: raw }, { data: upvotes }] = await Promise.all([
    supabase.from("skills").select("*").eq("id", params.id).single(),
    supabase.from("upvotes").select("user_id").eq("skill_id", params.id),
  ]);

  if (!raw) notFound();

  const skill = mapSkill(raw);
  const upvoteCount = upvotes?.length ?? 0;

  return (
    <SkillDetail
      skill={skill}
      initialUpvoteCount={upvoteCount}
      initialHasUpvoted={false}
      demoMode
      demoToken={params.token}
    />
  );
}
