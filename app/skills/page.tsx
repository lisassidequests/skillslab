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
import { Plus } from "lucide-react";

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
