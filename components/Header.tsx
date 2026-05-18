"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { key: "browse", label: "Browse Library", href: "/skills" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/skills" className="block">
              <h1 className="text-3xl font-bold text-gray-900">
                Singapore Government Skills Lab
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Discover and download AI skills for your team
              </p>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
