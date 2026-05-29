import SkillsBrowse from "@/components/SkillsBrowse";

export default function DemoSkillsPage({
  params,
}: {
  params: { token: string };
}) {
  return <SkillsBrowse demoMode demoToken={params.token} />;
}
