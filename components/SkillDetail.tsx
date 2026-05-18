"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import type { Skill } from "@/types";
import { categoryColor } from "@/lib/skills";

interface SkillDetailProps {
  skill: Skill;
}

function buildMarkdown(skill: Skill): string {
  const lines: string[] = [
    `---`,
    `name: ${skill.name}`,
    `category: ${skill.category}`,
    `complexity: ${skill.complexityLevel}`,
    `efficiency_gain: ${skill.efficiencyGain}`,
    `---`,
    ``,
    `# ${skill.name}`,
    ``,
    `## Description`,
    skill.description,
    ``,
    `## Primary Use Case`,
    skill.primaryUseCase,
    ``,
  ];

  if (skill.whenToUse) {
    lines.push(`## When to Use`, skill.whenToUse, ``);
  }

  if (skill.inputs?.length) {
    lines.push(`## Inputs`);
    skill.inputs.forEach((i) => lines.push(`- ${i}`));
    lines.push(``);
  }

  if (skill.instructions?.length) {
    lines.push(`## Instructions`);
    skill.instructions.forEach((step, idx) =>
      lines.push(`${idx + 1}. ${step}`)
    );
    lines.push(``);
  }

  if (skill.toolsAllowed) {
    lines.push(`## Tools Allowed`, skill.toolsAllowed, ``);
  }

  if (skill.outputFormat) {
    lines.push(`## Output Format`, skill.outputFormat, ``);
  }

  if (skill.constraintsList?.length) {
    lines.push(`## Constraints`);
    skill.constraintsList.forEach((c) => lines.push(`- ${c}`));
    lines.push(``);
  }

  if (skill.failureHandling) {
    lines.push(`## Failure Handling`, skill.failureHandling, ``);
  }

  if (skill.skillExamples?.length) {
    lines.push(`## Examples`);
    skill.skillExamples.forEach((e) => lines.push(`- ${e}`));
    lines.push(``);
  }

  lines.push(`## Target Job Roles`, skill.targetJobRoles, ``);
  lines.push(`## Dependencies`, skill.dependencies, ``);
  lines.push(`## Expected Efficiency Gain`, skill.efficiencyGain, ``);

  return lines.join("\n");
}

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
      <Link
        href="/skills"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={15} /> Back to Library
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
        {/* ── Left: Skill write-up (60%) ── */}
        <div className="md:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {skill.name}
            </h1>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${tagClass}`}
            >
              {skill.category}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{skill.description}</p>

          {skill.whenToUse && (
            <Section title="When to Use">
              <p className="text-gray-600 text-sm leading-relaxed">
                {skill.whenToUse}
              </p>
            </Section>
          )}

          {skill.inputs && skill.inputs.length > 0 && (
            <Section title="Inputs">
              <ul className="space-y-1">
                {skill.inputs.map((input, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-gray-300 mt-0.5">—</span>
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {skill.instructions && skill.instructions.length > 0 && (
            <Section title="Instructions">
              <ol className="space-y-2">
                {skill.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-blue-400 font-bold shrink-0 w-5 text-right">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {skill.outputFormat && (
            <Section title="Output Format">
              <p className="text-gray-600 text-sm leading-relaxed">
                {skill.outputFormat}
              </p>
            </Section>
          )}

          {skill.constraintsList && skill.constraintsList.length > 0 && (
            <Section title="Constraints">
              <ul className="space-y-1">
                {skill.constraintsList.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {skill.failureHandling && (
            <Section title="Failure Handling">
              <p className="text-gray-600 text-sm leading-relaxed">
                {skill.failureHandling}
              </p>
            </Section>
          )}

          {skill.skillExamples && skill.skillExamples.length > 0 && (
            <Section title="Examples">
              <div className="space-y-3">
                {skill.skillExamples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 leading-relaxed"
                  >
                    {ex}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Right: Metadata panel (40%) ── */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
              Expected Efficiency Gain
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {skill.efficiencyGain}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Complexity Level
            </p>
            <p className="text-gray-900 font-semibold">{skill.complexityLevel}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Target Job Roles
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {skill.targetJobRoles.split(";").join(" · ")}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Dependencies
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {skill.dependencies}
            </p>
          </div>

          {skill.toolsAllowed && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Tools Allowed
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {skill.toolsAllowed}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={download}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
