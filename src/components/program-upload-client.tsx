"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import type { Locale } from "@/lib/i18n";
import { getProgramManagementCopy } from "@/lib/program-management-copy";

type MyProgram = {
  id: string;
  slug: string;
  title: string;
  kind: "diet" | "program";
  price_try: number;
  created_at: string;
};

export function ProgramUploadClient({ locale }: { locale: Locale }) {
  const { role } = useAuth();
  const copy = getProgramManagementCopy(locale);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"diet" | "program">("program");
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myPrograms, setMyPrograms] = useState<MyProgram[]>([]);

  const canUpload = role === "admin" || role === "coach";
  const maxCoachPrograms = 3;
  const coachRemaining = useMemo(() => maxCoachPrograms - myPrograms.length, [myPrograms.length]);

  const loadMine = useCallback(async () => {
    const res = await fetch(`/api/programs/custom?mine=1&locale=${locale}`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const rows = (data.programs ?? []).map((item: Record<string, unknown>) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      kind: item.kind,
      price_try: item.price_try,
      created_at: item.created_at
    })) as MyProgram[];
    setMyPrograms(rows);
  }, [locale]);

  useEffect(() => {
    if (!canUpload) return;
    loadMine();
  }, [canUpload, loadMine]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!canUpload) {
      setError(copy.onlyAdminsAndCoaches);
      return;
    }
    if (!title.trim() || !file) {
      setError(copy.titleAndPdfRequired);
      return;
    }
    if (role === "coach" && coachRemaining <= 0) {
      setError(copy.coachLimitReached);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("kind", kind);
    formData.append("pdf", file);

    setWorking(true);
    const res = await fetch("/api/programs/custom", {
      method: "POST",
      credentials: "include",
      body: formData
    });
    const data = await res.json();
    setWorking(false);
    if (!res.ok) {
      setError(data.error ?? copy.uploadFailed);
      return;
    }

    setSuccess(copy.uploadSuccess);
    setTitle("");
    setKind("program");
    setFile(null);
    await loadMine();
  };

  const deleteProgram = async (programId: string) => {
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/programs/custom", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? copy.deleteFailed);
      return;
    }
    setSuccess(copy.deleteSuccess);
    await loadMine();
  };

  if (!canUpload) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-sm text-zinc-300">{copy.onlyAdminsAndCoaches}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[32px] p-6">
        <span className="badge">{copy.badge}</span>
        <h1 className="mt-4 text-3xl font-semibold text-white">{copy.title}</h1>
        <p className="mt-3 text-sm text-zinc-400">{copy.subtitle}</p>
        {role === "coach" && (
          <p className="mt-2 text-sm text-zinc-300">
            {copy.coachLimitLabel}: {myPrograms.length}/{maxCoachPrograms} active uploads.
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="glass-panel space-y-4 rounded-[32px] p-6">
        <input className="input" placeholder={copy.titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value as "diet" | "program")}>
          <option value="program">{copy.programOption}</option>
          <option value="diet">{copy.dietOption}</option>
        </select>
        <input
          className="input"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}
        <button type="submit" disabled={working} className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
          {working ? copy.uploading : copy.upload}
        </button>
      </form>

      <div className="glass-panel rounded-[32px] p-6">
        <p className="text-lg font-semibold text-white">{copy.activeUploads}</p>
        <div className="mt-4 space-y-3">
          {myPrograms.length === 0 ? (
            <p className="text-sm text-zinc-500">{copy.noUploads}</p>
          ) : (
            myPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-white">{program.title}</p>
                  <p className="text-xs text-zinc-500">
                    {program.kind === "diet" ? copy.dietLabel : copy.programLabel} - {program.price_try} TRY
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteProgram(program.id)}
                  className="rounded-full border border-red-300/30 px-4 py-2 text-xs text-red-200 hover:bg-red-400/10"
                >
                  {copy.delete}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
