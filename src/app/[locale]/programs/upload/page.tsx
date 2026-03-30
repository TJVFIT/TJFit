"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { isLocale, type Locale } from "@/lib/i18n";

type MyProgram = {
  id: string;
  slug: string;
  title: string;
  kind: "diet" | "program";
  price_try: number;
  created_at: string;
};

export default function ProgramUploadPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  const locale = params.locale as Locale;
  return (
    <ProtectedRoute locale={locale}>
      <ProgramUploadClient locale={locale} />
    </ProtectedRoute>
  );
}

function ProgramUploadClient({ locale }: { locale: Locale }) {
  const { role } = useAuth();
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
    const rows = (data.programs ?? []).map((item: any) => ({
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
      setError("Only admin and coach accounts can upload programs.");
      return;
    }
    if (!title.trim() || !file) {
      setError("Title and PDF are required.");
      return;
    }
    if (role === "coach" && coachRemaining <= 0) {
      setError("Coach upload limit reached (max 3 active programs). Delete one first.");
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
      setError(data.error ?? "Upload failed.");
      return;
    }

    setSuccess("Program uploaded, translated, and published.");
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
      setError(data.error ?? "Unable to delete program.");
      return;
    }
    setSuccess("Program deleted.");
    await loadMine();
  };

  if (!canUpload) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-sm text-zinc-300">Only admin and coach accounts can upload custom programs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[32px] p-6">
        <span className="badge">Program Upload</span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Upload PDF Program</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Price is set automatically: Diet = 350 TRY, Program = 400 TRY. Upload triggers translation into EN/TR/AR/ES/FR.
        </p>
        {role === "coach" && (
          <p className="mt-2 text-sm text-zinc-300">
            Coach limit: {myPrograms.length}/{maxCoachPrograms} active uploads.
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="glass-panel rounded-[32px] p-6 space-y-4">
        <input className="input" placeholder="Program title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value as "diet" | "program")}>
          <option value="program">Program (400 TRY)</option>
          <option value="diet">Diet (350 TRY)</option>
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
          {working ? "Uploading and translating..." : "Upload program"}
        </button>
      </form>

      <div className="glass-panel rounded-[32px] p-6">
        <p className="text-lg font-semibold text-white">Your active uploads</p>
        <div className="mt-4 space-y-3">
          {myPrograms.length === 0 ? (
            <p className="text-sm text-zinc-500">No uploaded programs yet.</p>
          ) : (
            myPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-white">{program.title}</p>
                  <p className="text-xs text-zinc-500">
                    {program.kind === "diet" ? "Diet" : "Program"} - {program.price_try} TRY
                  </p>
                </div>
                <button
                  onClick={() => deleteProgram(program.id)}
                  className="rounded-full border border-red-300/30 px-4 py-2 text-xs text-red-200 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
