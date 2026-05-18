"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

interface FilterDropdownProps {
  categories: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterDropdown({
  categories,
  selected,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggle = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-4 py-3 rounded-lg font-semibold transition whitespace-nowrap border-2 flex items-center gap-2 ${
          open
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
        }`}
      >
        <Filter size={18} />
        Filter
        {selected.length > 0 && (
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md z-30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filter by Category</h3>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(category)}
                  onChange={() => toggle(category)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
