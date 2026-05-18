import Header from "@/components/Header";

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
    </>
  );
}
