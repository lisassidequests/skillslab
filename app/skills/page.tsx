"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import FilterDropdown from "@/components/FilterDropdown";
import SkillGrid from "@/components/SkillGrid";
import AddSkillModal from "@/components/AddSkillModal";
import { filterSkills, getAllCategories } from "@/lib/skills";
import { createClient } from "@/lib/supabase/client";
import { mapSkill } from "@/lib/supabase/queries";
import type { Skill } from "@/types";
import { BookOpen, Bot, ChevronDown, ChevronUp, Download, Plus } from "lucide-react";

function OnboardingBanner() {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-100 transition"
      >
        <span className="text-sm font-semibold text-gray-700">
          How to use this library
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <BookOpen size={15} className="text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">
                  Browse &amp; search
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Use the search bar or category filter to find a skill. Click
                  any card to see the full definition, instructions, and
                  constraints.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download size={15} className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">
                  Use a skill
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Open a skill, read the instructions, then download the{" "}
                  <code className="font-mono bg-gray-100 px-1 rounded">.md</code>{" "}
                  file and attach it to your AI tool — or paste the instructions
                  directly into your agent&apos;s context.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus size={15} className="text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">
                  Add a skill
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Click <strong>Add Skill</strong> (top right) and paste your
                  skill definition. The AI parser extracts the metadata and runs
                  a safety check before publishing it to the library.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Bot size={15} className="text-indigo-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900 mb-0.5">
                For agent developers
              </p>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Want your AI agent to pull skills programmatically? Go to{" "}
                <a
                  href="/settings/api-keys"
                  className="underline font-semibold hover:text-indigo-600"
                >
                  Settings → API Keys
                </a>
                , create a key, and copy the ready-to-paste agent prompt that
                appears — it tells your agent the correct endpoints and how to
                report outcomes back so the library improves over time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillsBrowsePage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [{ data: rawSkills }, { data: { user } }, { data: allUpvotes }] =
        await Promise.all([
          supabase.from("skills").select("*").order("name"),
          supabase.auth.getUser(),
          supabase.from("upvotes").select("skill_id, user_id"),
        ]);

      if (rawSkills) setSkills(rawSkills.map(mapSkill));

      const counts: Record<string, number> = {};
      const myVotes = new Set<string>();
      for (const row of allUpvotes ?? []) {
        counts[row.skill_id] = (counts[row.skill_id] ?? 0) + 1;
        if (user && row.user_id === user.id) myVotes.add(row.skill_id);
      }
      setUpvoteCounts(counts);
      setUserUpvotes(myVotes);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleUpvote = async (skillId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const isUpvoted = userUpvotes.has(skillId);

    setUserUpvotes((prev) => {
      const next = new Set(prev);
      isUpvoted ? next.delete(skillId) : next.add(skillId);
      return next;
    });
    setUpvoteCounts((prev) => ({
      ...prev,
      [skillId]: (prev[skillId] ?? 0) + (isUpvoted ? -1 : 1),
    }));

    if (isUpvoted) {
      await supabase
        .from("upvotes")
        .delete()
        .match({ user_id: user.id, skill_id: skillId });
    } else {
      await supabase
        .from("upvotes")
        .insert({ user_id: user.id, skill_id: skillId });
    }
  };

  const handleSkillAdded = (skill: Skill) => {
    setSkills((prev) => [skill, ...prev]);
    setUpvoteCounts((prev) => ({ ...prev, [skill.id]: 0 }));
  };

  const categories = useMemo(() => getAllCategories(skills), [skills]);
  const filtered = useMemo(
    () => filterSkills(skills, search, selectedCategories),
    [skills, search, selectedCategories]
  );

  return (
    <>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Skills Library</h2>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg transition shadow-sm"
            >
              <Plus size={16} />
              Add Skill
            </button>
          </div>

          <OnboardingBanner />

          <div className="flex gap-3 mb-4">
            <SearchBar value={search} onChange={setSearch} />
            <FilterDropdown
              categories={categories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          {!loading && (
            <div className="text-sm text-gray-600 mb-4">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              of {skills.length} skills
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm py-12 text-center">
            Loading skills...
          </div>
        ) : (
          <SkillGrid
            skills={filtered}
            upvoteCounts={upvoteCounts}
            userUpvotes={userUpvotes}
            onUpvote={handleUpvote}
          />
        )}
      </div>

      {showModal && (
        <AddSkillModal
          onClose={() => setShowModal(false)}
          onSkillAdded={handleSkillAdded}
        />
      )}
    </>
  );
}
