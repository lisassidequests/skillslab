import Header from "@/components/Header";
import DemoBanner from "@/components/DemoBanner";

export default function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  return (
    <>
      <Header demoMode demoToken={params.token} />
      <DemoBanner />
      <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
    </>
  );
}
