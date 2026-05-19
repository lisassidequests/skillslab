"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  Loader2,
} from "lucide-react";
import type { ApiKey } from "@/types";

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLastUsed(iso: string | undefined): string {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed to load keys");
      const data = await res.json();
      setKeys(data.keys);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPlaintext(data.plaintext);
      setNewName("");
      setKeys((prev) => [data.key, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!plaintext) return;
    await navigator.clipboard.writeText(plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? Agents using it will stop working immediately.")) return;
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <KeyRound size={24} className="text-teal-600" />
        <h2 className="text-3xl font-bold text-gray-900">API Keys</h2>
      </div>
      <p className="text-gray-600 mb-8">
        Issue keys so external agents can pull skills and report run outcomes.
        Keys renew automatically each time you log in.
      </p>

      {plaintext && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                Copy this key now — you won&apos;t see it again
              </p>
              <p className="text-sm text-amber-800 mt-1">
                This is the only time the full key is shown. Store it somewhere safe.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-lg px-3 py-2">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">
              {plaintext}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded transition"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setPlaintext(null)}
            className="mt-3 text-sm text-amber-700 hover:text-amber-900 font-medium"
          >
            I&apos;ve saved it — dismiss
          </button>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 flex items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Key name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. code-review-bot"
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || creating}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create key
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm py-12 text-center">
          Loading keys...
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No keys yet. Create one above to let an agent talk to the skills library.
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                  Prefix
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                  Last used
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                  Expires
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const days = daysUntil(k.expiresAt);
                const expiringSoon = days <= 10;
                return (
                  <tr key={k.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {k.keyPrefix}…
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatLastUsed(k.lastUsedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          expiringSoon
                            ? "text-amber-700 font-semibold"
                            : "text-gray-600"
                        }
                      >
                        {formatDate(k.expiresAt)}
                      </span>
                      <span
                        className={`block text-xs ${
                          expiringSoon ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        in {days} day{days === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Revoke"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
