"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useSearchParams } from "next/navigation";

import { PremiumPageShell } from "@/components/premium";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n";
import { BLOG_CATEGORIES, BLOG_EDITOR_COPY } from "@/lib/blog-editor-copy";

export default function BlogWritePage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const locale = params.locale as Locale;
  const copy = BLOG_EDITOR_COPY[locale];
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Training");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<{ paidPrograms: number; daysActive: number }>({ paidPrograms: 0, daysActive: 0 });
  const [status, setStatus] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);

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

  useEffect(() => {
    const id = searchParams.get("draft_id");
    if (!id) return;
    setDraftId(id);
    void fetch(`/api/blog/drafts/${encodeURIComponent(id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const d = data?.draft;
        if (!d) return;
        setTitle(String(d.title ?? ""));
        setCategory(String(d.category ?? "Training"));
        setContent(String(d.content ?? ""));
        setTags(Array.isArray(d.tags) ? d.tags.join(", ") : "");
      })
      .catch(() => null);
  }, [searchParams]);

  const seoDescription = useMemo(() => content.slice(0, 160), [content]);

  if (allowed === false) {
    return (
      <PremiumPageShell>
        <section className="rounded-2xl border border-divider bg-surface p-6">
          <h1 className="text-2xl font-bold text-white">{copy.locked}</h1>
          <p className="mt-2 text-sm text-muted">{copy.unlock}</p>
          <p className="mt-3 text-sm text-bright">
            {copy.programCompleted}: {progress.paidPrograms > 0 ? "✓" : "✗"} · {copy.daysActive}: {progress.daysActive}/30
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
    if (draftId) formData.set("draft_id", draftId);
    if (image) formData.set("image", image);
    try {
      const res = await fetch("/api/blog/posts", { method: "POST", body: formData, credentials: "include" });
      setStatus(res.ok ? copy.saved : copy.failed);
    } catch {
      setStatus(copy.failed);
    }
  };

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-divider bg-surface p-6">
        <h1 className="text-3xl font-extrabold text-white">{copy.heading}</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <input aria-label={copy.title} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={copy.title} className="w-full rounded-xl border border-divider bg-background px-3 py-2 text-white" required />
          <select aria-label={copy.category} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-divider bg-background px-3 py-2 text-white">
            {BLOG_CATEGORIES.map((value) => <option key={value} value={value}>{copy.categories[value]}</option>)}
          </select>
          <textarea aria-label={copy.content} value={content} onChange={(e) => setContent(e.target.value)} placeholder={copy.write} className="min-h-[220px] w-full rounded-xl border border-divider bg-background px-3 py-2 text-white" required />
          <input aria-label={copy.tags} value={tags} onChange={(e) => setTags(e.target.value)} placeholder={copy.tags} className="w-full rounded-xl border border-divider bg-background px-3 py-2 text-white" />
          <input aria-label={copy.cover} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full text-sm text-bright" />
          <p className="text-xs text-faint">{copy.preview}: {seoDescription || "-"}</p>
          <Button type="submit">{copy.submit}</Button>
          {status ? <p className="text-sm text-bright">{status}</p> : null}
        </form>
      </section>
    </PremiumPageShell>
  );
}

