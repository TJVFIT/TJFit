"use client";

import { useEffect, useMemo, useState } from "react";

import { PremiumPageShell } from "@/components/premium";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n";

export default function BlogWritePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Training");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<{ paidPrograms: number; daysActive: number }>({ paidPrograms: 0, daysActive: 0 });
  const [status, setStatus] = useState("");

  useEffect(() => {
    void fetch("/api/blog/eligibility", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setAllowed(false);
          return;
        }
        setAllowed(Boolean(data.eligible));
        setProgress({ paidPrograms: Number(data?.paidPrograms ?? 0), daysActive: Number(data?.daysActive ?? 0) });
      })
      .catch(() => setAllowed(false));
  }, []);

  const seoDescription = useMemo(() => content.slice(0, 160), [content]);

  if (allowed === false) {
    return (
      <PremiumPageShell>
        <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
          <h1 className="text-2xl font-bold text-white">Blog posting locked</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Complete a 12-week program and be active for 30+ days to unlock.</p>
          <p className="mt-3 text-sm text-zinc-300">
            Program completed: {progress.paidPrograms > 0 ? "✓" : "✗"} · Days active: {progress.daysActive}/30
          </p>
        </section>
      </PremiumPageShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("title", title);
    formData.set("category", category);
    formData.set("content", content);
    formData.set("tags", tags);
    if (image) formData.set("image", image);
    const res = await fetch("/api/blog/posts", { method: "POST", body: formData, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? "Submitted for review." : String(data.error ?? "Failed to submit."));
  };

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h1 className="text-3xl font-extrabold text-white">Write a Blog Post</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white" required />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white">
            <option>Training</option>
            <option>Nutrition</option>
            <option>Mindset</option>
            <option>Recovery</option>
            <option>Lifestyle</option>
          </select>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your article..." className="min-h-[220px] w-full rounded-xl border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white" required />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full rounded-xl border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white" />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full text-sm text-zinc-300" />
          <p className="text-xs text-zinc-500">SEO description preview: {seoDescription || "-"}</p>
          <Button type="submit">Submit for Review</Button>
          {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
        </form>
      </section>
    </PremiumPageShell>
  );
}

