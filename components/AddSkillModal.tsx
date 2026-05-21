"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ShieldX,
  Upload,
  Pencil,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapSkill } from "@/lib/supabase/queries";
import type { Skill } from "@/types";

type Step = "input" | "loading" | "error" | "blocked" | "review" | "success";

const SKILL_CATEGORIES = [
  "Administrative & Operations",
  "Data & Intelligence",
  "Communication & Engagement",
  "Case Management & Social Work",
  "Compliance & Governance",
  "Content & Documentation",
  "Citizen-Facing Service",
  "Intelligence & Research",
  "Scheduling & Coordination",
];

const COMPLEXITY_LEVELS = ["Low", "Medium", "High"];

interface ParsedSkill {
  name: string | null;
  category: string | null;
  agency: string | null;
  description: string | null;
  primary_use_case: string | null;
  target_job_roles: string | null;
  complexity_level: string | null;
  dependencies: string | null;
  saas_dependencies: string | null;
  implementability_note: string | null;
  when_to_use: string | null;
  inputs: string[] | null;
  instructions: string[] | null;
  tools_allowed: string | null;
  output_format: string | null;
  constraints_list: string[] | null;
  failure_handling: string | null;
  skill_examples: Array<{ input: string; output: string } | string> | null;
}

interface AddSkillModalProps {
  onClose: () => void;
  onSkillAdded: (skill: Skill) => void;
}

function Val({ v }: { v: string | null | undefined }) {
  if (!v) return <span className="text-gray-400 italic">Not detected</span>;
  return <span>{v}</span>;
}

function ListVal({ items }: { items: string[] | null | undefined }) {
  if (!items?.length)
    return <span className="text-gray-400 italic">Not detected</span>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-800 flex gap-2">
          <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition";

function TextInput({
  value,
  onChange,
  textarea,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  if (textarea) {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`${inputClass} resize-y`}
      />
    );
  }
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string | null | undefined;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      <option value="">Not detected</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ListInput({
  items,
  onChange,
}: {
  items: string[] | null | undefined;
  onChange: (v: string[]) => void;
}) {
  return (
    <textarea
      value={items?.join("\n") ?? ""}
      onChange={(e) =>
        onChange(
          e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      }
      rows={Math.max(3, (items?.length ?? 0) + 1)}
      placeholder="One item per line"
      className={`${inputClass} resize-y`}
    />
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-0.5 leading-relaxed">
        {label}
      </span>
      <div className="text-sm text-gray-800 leading-relaxed">{children}</div>
    </div>
  );
}

export default function AddSkillModal({
  onClose,
  onSkillAdded,
}: AddSkillModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [parsed, setParsed] = useState<ParsedSkill | null>(null);
  const [riskLevel, setRiskLevel] = useState<"safe" | "warning" | "blocked">(
    "safe"
  );
  const [riskReason, setRiskReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");

  const updateField = <K extends keyof ParsedSkill>(
    k: K,
    v: ParsedSkill[K]
  ) => setParsed((p) => (p ? { ...p, [k]: v } : p));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const canDismiss = step !== "loading" && !uploading;

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStep("loading");

    try {
      const res = await fetch("/api/parse-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error ?? "API request failed");
      }
      const data = await res.json();
      setParsed(data.parsed);
      setRiskLevel(data.riskLevel);
      setRiskReason(data.riskReason ?? "");
      setStep(data.riskLevel === "blocked" ? "blocked" : "review");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setUploading(true);

    try {
      const supabase = createClient();
      const skillId = `USR-${Date.now().toString(36).toUpperCase()}`;

      const examples =
        parsed.skill_examples?.map((e) =>
          typeof e === "string" ? e : `Input: ${e.input} Output: ${e.output}`
        ) ?? null;

      const dbRow = {
        id: skillId,
        name: parsed.name ?? "Untitled Skill",
        category: parsed.category ?? "Content & Documentation",
        agency: parsed.agency ?? "",
        description: parsed.description ?? "",
        primary_use_case: parsed.primary_use_case ?? "",
        target_job_roles: parsed.target_job_roles ?? "",
        complexity_level: parsed.complexity_level ?? "Medium",
        dependencies: parsed.dependencies ?? "",
        saas_dependencies: parsed.saas_dependencies ?? "",
        implementability_note: parsed.implementability_note ?? "",
        when_to_use: parsed.when_to_use,
        inputs: parsed.inputs,
        instructions: parsed.instructions,
        tools_allowed: parsed.tools_allowed,
        output_format: parsed.output_format,
        constraints_list: parsed.constraints_list,
        failure_handling: parsed.failure_handling,
        skill_examples: examples,
        submitted_by: email,
      };

      const { data, error } = await supabase
        .from("skills")
        .insert(dbRow)
        .select()
        .single();

      if (error) throw new Error(error.message);

      const skill = mapSkill(data);
      setNewSkillName(skill.name);
      onSkillAdded(skill);
      setStep("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to upload skill"
      );
      setStep("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && canDismiss) onClose();
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Add a Skill</h2>
          {canDismiss && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* ── Step 1: Input ── */}
          {step === "input" && (
            <form onSubmit={handleAnalyse} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Paste your skill
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Plain text or markdown (.md / .txt) format accepted
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  required
                  placeholder="Paste your skill definition here..."
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
                Will be submitted as{" "}
                <span className="font-semibold text-gray-800">
                  {email || "loading..."}
                </span>
                {" — "}shown on the skill card.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!text.trim() || !email}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold rounded-lg transition"
                >
                  Analyse skill →
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Loading ── */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-16 gap-4">
              <Loader2 size={36} className="text-teal-500 animate-spin" />
              <p className="text-gray-600 font-medium">
                Analysing your skill with AI...
              </p>
              <p className="text-xs text-gray-400">
                Checking for safety and extracting metadata
              </p>
            </div>
          )}

          {/* ── Error state ── */}
          {step === "error" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Something went wrong
                </p>
                <p className="text-sm text-gray-500">{errorMsg}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setStep("input");
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3a: Blocked ── */}
          {step === "blocked" && (
            <div className="py-8 space-y-5">
              <div className="flex items-start gap-4 bg-red-50 border-2 border-red-200 rounded-xl p-5">
                <ShieldX
                  size={24}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-bold text-red-800 mb-1">
                    Skill blocked — cannot be uploaded
                  </p>
                  <p className="text-sm text-red-700">{riskReason}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This skill was flagged as potentially unsafe or
                policy-violating. If you believe this is an error, please
                review your submission and contact the platform administrator.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3b: Review ── */}
          {step === "review" && parsed && (
            <div className="space-y-5">
              {riskLevel === "warning" && (
                <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <AlertTriangle
                    size={18}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm mb-0.5">
                      Please review flagged content before confirming
                    </p>
                    <p className="text-xs text-amber-700">{riskReason}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Parsed skill details
                  </p>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => setEditing((v) => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {editing ? (
                        <>
                          <Check size={14} /> Done editing
                        </>
                      ) : (
                        <>
                          <Pencil size={14} /> Edit fields
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-1 max-h-[50vh] overflow-y-auto">
                  <Row label="Name">
                    {editing ? (
                      <TextInput
                        value={parsed.name}
                        onChange={(v) => updateField("name", v)}
                      />
                    ) : (
                      <Val v={parsed.name} />
                    )}
                  </Row>
                  <Row label="Category">
                    {editing ? (
                      <SelectInput
                        value={parsed.category}
                        options={SKILL_CATEGORIES}
                        onChange={(v) => updateField("category", v)}
                      />
                    ) : (
                      <Val v={parsed.category} />
                    )}
                  </Row>
                  <Row label="Agency">
                    {editing ? (
                      <TextInput
                        value={parsed.agency}
                        onChange={(v) => updateField("agency", v)}
                      />
                    ) : (
                      <Val v={parsed.agency} />
                    )}
                  </Row>
                  <Row label="Complexity">
                    {editing ? (
                      <SelectInput
                        value={parsed.complexity_level}
                        options={COMPLEXITY_LEVELS}
                        onChange={(v) => updateField("complexity_level", v)}
                      />
                    ) : (
                      <Val v={parsed.complexity_level} />
                    )}
                  </Row>
                  <Row label="Description">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.description}
                        onChange={(v) => updateField("description", v)}
                      />
                    ) : (
                      <Val v={parsed.description} />
                    )}
                  </Row>
                  <Row label="Primary Use Case">
                    {editing ? (
                      <TextInput
                        value={parsed.primary_use_case}
                        onChange={(v) => updateField("primary_use_case", v)}
                      />
                    ) : (
                      <Val v={parsed.primary_use_case} />
                    )}
                  </Row>
                  <Row label="Target Roles">
                    {editing ? (
                      <TextInput
                        value={parsed.target_job_roles}
                        onChange={(v) => updateField("target_job_roles", v)}
                      />
                    ) : (
                      <Val v={parsed.target_job_roles} />
                    )}
                  </Row>
                  <Row label="When to Use">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.when_to_use}
                        onChange={(v) => updateField("when_to_use", v)}
                      />
                    ) : (
                      <Val v={parsed.when_to_use} />
                    )}
                  </Row>
                  <Row label="Inputs">
                    {editing ? (
                      <ListInput
                        items={parsed.inputs}
                        onChange={(v) => updateField("inputs", v)}
                      />
                    ) : (
                      <ListVal items={parsed.inputs} />
                    )}
                  </Row>
                  <Row label="Instructions">
                    {editing ? (
                      <ListInput
                        items={parsed.instructions}
                        onChange={(v) => updateField("instructions", v)}
                      />
                    ) : (
                      <ListVal items={parsed.instructions} />
                    )}
                  </Row>
                  <Row label="Tools Allowed">
                    {editing ? (
                      <TextInput
                        value={parsed.tools_allowed}
                        onChange={(v) => updateField("tools_allowed", v)}
                      />
                    ) : (
                      <Val v={parsed.tools_allowed} />
                    )}
                  </Row>
                  <Row label="Output Format">
                    {editing ? (
                      <TextInput
                        value={parsed.output_format}
                        onChange={(v) => updateField("output_format", v)}
                      />
                    ) : (
                      <Val v={parsed.output_format} />
                    )}
                  </Row>
                  <Row label="Constraints">
                    {editing ? (
                      <ListInput
                        items={parsed.constraints_list}
                        onChange={(v) => updateField("constraints_list", v)}
                      />
                    ) : (
                      <ListVal items={parsed.constraints_list} />
                    )}
                  </Row>
                  <Row label="Failure Handling">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.failure_handling}
                        onChange={(v) => updateField("failure_handling", v)}
                      />
                    ) : (
                      <Val v={parsed.failure_handling} />
                    )}
                  </Row>
                  <Row label="Dependencies">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.dependencies}
                        onChange={(v) => updateField("dependencies", v)}
                      />
                    ) : (
                      <Val v={parsed.dependencies} />
                    )}
                  </Row>
                  <Row label="SaaS Dependencies">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.saas_dependencies}
                        onChange={(v) => updateField("saas_dependencies", v)}
                      />
                    ) : (
                      <Val v={parsed.saas_dependencies} />
                    )}
                  </Row>
                  <Row label="Implementability">
                    {editing ? (
                      <TextInput
                        textarea
                        value={parsed.implementability_note}
                        onChange={(v) =>
                          updateField("implementability_note", v)
                        }
                      />
                    ) : (
                      <Val v={parsed.implementability_note} />
                    )}
                  </Row>
                  <Row label="Submitted by">
                    <span className="text-gray-700">{email}</span>
                  </Row>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={uploading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  Confirm & Upload
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <CheckCircle size={48} className="text-teal-500" />
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  Skill uploaded successfully!
                </p>
                <p className="text-sm text-gray-600">{newSkillName}</p>
              </div>
              <p className="text-xs text-gray-400">
                Your skill is now live in the library
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
