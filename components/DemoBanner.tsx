import Link from "next/link";
import { Sparkles, LogIn } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border-b-2 border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              You&apos;re in demo mode
            </p>
            <p className="text-xs text-amber-800">
              Browse the library and try the AI parser. Sign in to save your
              own skills, upvote, and access the API.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition"
        >
          <LogIn size={15} />
          Sign in
        </Link>
      </div>
    </div>
  );
}
