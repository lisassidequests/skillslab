"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import FilterDropdown from "@/components/FilterDropdown";
import SkillGrid from "@/components/SkillGrid";
import { filterSkills, getAllCategories, getAllSkills } from "@/lib/skills";

export default function SkillsBrowsePage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allSkills = useMemo(() => getAllSkills(), []);
  const categories = useMemo(() => getAllCategories(), []);

  const filtered = useMemo(
    () => filterSkills(search, selectedCategories),
    [search, selectedCategories]
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Skills Library</h2>

        <div className="flex gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterDropdown
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          {allSkills.length} skills
        </div>
      </div>

      <SkillGrid skills={filtered} />
    </div>
  );
}
