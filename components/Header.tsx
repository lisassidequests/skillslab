import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b-2 border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/skills" className="block">
          <h1 className="text-3xl font-bold text-gray-900">
            Singapore Government Skills Lab
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Discover and download AI skills for your team
          </p>
        </Link>
      </div>
    </header>
  );
}
