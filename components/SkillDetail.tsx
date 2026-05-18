"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, ThumbsUp } from "lucide-react";
import type { Skill } from "@/types";
import { categoryColor } from "@/lib/skills";
import { createClient } from "@/lib/supabase/client";

interface SkillDetailProps {
  skill: Skill;
  initialUpvoteCount: number;
  initialHasUpvoted: boolean;
}

function buildMarkdown(skill: Skill): string {
  const lines: string[] = [
    `---`,
    `name: ${skill.name}`,
    `category: ${skill.category}`,
    `complexity: ${skill.complexityLevel}`,
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

  return lines.join("\n");
}

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderMarkdownLine(line: string, key: number) {
  if (line === "") {
    return <div key={key}>&nbsp;</div>;
  }
  if (line === "---") {
    return (
      <div key={key} className="text-slate-400">
        {line}
      </div>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <div key={key} className="text-purple-700 font-semibold mt-2">
        {line}
      </div>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <div key={key} className="text-blue-700 font-bold">
        {line}
      </div>
    );
  }
  const numbered = line.match(/^(\d+)\.\s(.*)$/);
  if (numbered) {
    return (
      <div key={key} className="text-slate-700">
        <span className="text-emerald-600 font-semibold">{numbered[1]}.</span>{" "}
        {numbered[2]}
      </div>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <div key={key} className="text-slate-700">
        <span className="text-amber-600">-</span> {line.slice(2)}
      </div>
    );
  }
  const frontmatter = line.match(/^([a-z_]+):\s?(.*)$/);
  if (frontmatter) {
    return (
      <div key={key}>
        <span className="text-purple-600">{frontmatter[1]}:</span>{" "}
        <span className="text-slate-700">{frontmatter[2]}</span>
      </div>
    );
  }
  return (
    <div key={key} className="text-slate-700">
      {line}
    </div>
  );
}

function SkillMarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-2">
        <FileText size={14} className="text-slate-400" />
        <p className="text-sm font-mono text-slate-600">skill.md</p>
      </div>
      <div className="px-5 py-4 text-[13px] leading-6 font-mono whitespace-pre-wrap break-words">
        {lines.map((line, i) => renderMarkdownLine(line, i))}
      </div>
    </div>
  );
}

export default function SkillDetail({
  skill,
  initialUpvoteCount,
  initialHasUpvoted,
}: SkillDetailProps) {
  const router = useRouter();
  const markdown = buildMarkdown(skill);
  const tagClass = categoryColor(skill.category);

  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/skills");
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting) return;
    setIsUpvoting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (hasUpvoted) {
      setHasUpvoted(false);
      setUpvoteCount((c) => c - 1);
      await supabase
        .from("upvotes")
        .delete()
        .match({ user_id: user.id, skill_id: skill.id });
    } else {
      setHasUpvoted(true);
      setUpvoteCount((c) => c + 1);
      await supabase
        .from("upvotes")
        .insert({ user_id: user.id, skill_id: skill.id });
    }

    setIsUpvoting(false);
  };

  const download = () => {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugifyFilename(skill.name)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 md:p-8">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={15} /> Back to Library
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {skill.name}
          </h1>
          <button
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition border-2 ${
              hasUpvoted
                ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <ThumbsUp
              size={15}
              className={hasUpvoted ? "fill-blue-600" : ""}
            />
            <span>{upvoteCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${tagClass}`}
          >
            {skill.category}
          </span>
          {skill.submittedBy && (
            <span className="text-xs text-gray-400">
              Submitted by {skill.submittedBy}
            </span>
          )}
        </div>
        <p className="text-gray-700 leading-relaxed mt-4 max-w-3xl">
          {skill.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
        {/* ── Left: Skill preview (60%) ── */}
        <div className="md:col-span-3">
          <SkillMarkdownPreview markdown={markdown} />
        </div>

        {/* ── Right: Metadata panel (40%) ── */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Complexity Level
            </p>
            <p className="text-gray-900 font-semibold">
              {skill.complexityLevel}
            </p>
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
              <Download size={18} /> Download skill.md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
