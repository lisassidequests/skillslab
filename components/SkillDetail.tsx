"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import type { Skill } from "@/types";
import { categoryColor } from "@/lib/skills";

interface SkillDetailProps {
  skill: Skill;
}

function buildMarkdown(skill: Skill): string {
  return `---
name: ${skill.name}
category: ${skill.category}
complexity: ${skill.complexityLevel}
efficiency_gain: ${skill.efficiencyGain}
---

# ${skill.name}

## Description
${skill.description}

## Primary Use Case
${skill.primaryUseCase}

## Target Job Roles
${skill.targetJobRoles}

## Dependencies
${skill.dependencies}

## Expected Efficiency Gain
${skill.efficiencyGain}
`;
}

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SkillDetail({ skill }: SkillDetailProps) {
  const download = () => {
    const md = buildMarkdown(skill);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugifyFilename(skill.name)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tagClass = categoryColor(skill.category);

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6 md:p-8">
      <Link
        href="/skills"
        className="text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-3 ${tagClass}`}
          >
            {skill.category}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {skill.name}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Description
              </label>
              <p className="text-gray-700 mt-1">{skill.description}</p>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Primary Use Case
              </label>
              <p className="text-gray-700 mt-1">{skill.primaryUseCase}</p>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Agency
              </label>
              <p className="text-gray-700 mt-1">{skill.agency}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
            <label className="text-sm font-bold text-emerald-800 uppercase tracking-wide block mb-2">
              Expected Efficiency Gain
            </label>
            <p className="text-lg font-bold text-emerald-700">
              {skill.efficiencyGain}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Complexity Level
            </label>
            <p className="text-gray-900 font-semibold mt-1">
              {skill.complexityLevel}
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Target Job Roles
            </label>
            <p className="text-gray-700 text-sm mt-1">{skill.targetJobRoles}</p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Dependencies
            </label>
            <p className="text-gray-700 text-sm mt-1">{skill.dependencies}</p>
          </div>

          {skill.saasDependencies && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Open / SaaS Dependencies
              </label>
              <p className="text-gray-700 text-sm mt-1">
                {skill.saasDependencies}
              </p>
            </div>
          )}

          {skill.implementabilityNote && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Implementability Note
              </label>
              <p className="text-gray-700 text-sm mt-1">
                {skill.implementabilityNote}
              </p>
            </div>
          )}

          <button
            onClick={download}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download Skill
          </button>
        </div>
      </div>
    </div>
  );
}
