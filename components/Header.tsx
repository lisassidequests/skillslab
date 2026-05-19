import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b-2 border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-start justify-between gap-4">
        <Link href="/skills" className="block">
          <h1 className="text-3xl font-bold text-gray-900">
            Singapore Government Skills Lab
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Discover and download AI skills for your team
          </p>
        </Link>
        <Link
          href="/settings/api-keys"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
        >
          <KeyRound size={15} />
          API keys
        </Link>
      </div>
    </header>
  );
}
