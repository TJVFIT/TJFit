"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type PendingPost = {
  id: string;
  title: string;
  author_name: string;
  category: string | null;
  created_at: string;
};

export function AdminBlogPanel() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [pending, setPending] = useState<PendingPost[]>([]);
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [generated, setGenerated] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/blog/posts?status=pending", { cache: "no-store", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    const posts = (data.posts ?? []) as Array<Record<string, unknown>>;
    setPending(
      posts.map((p) => ({
          id: String(p.id),
          title: String(p.title ?? ""),
          author_name: String(p.author_name ?? ""),
          category: p.category ? String(p.category) : null,
          created_at: String(p.created_at ?? "")
        }))
    );
  };

  useEffect(() => {
    void load();
  }, []);

  const moderate = async (id: string, action: "approve" | "reject" | "feature") => {
    const reason = action === "reject" ? window.prompt("Reason for rejection?") ?? "Please revise and resubmit." : undefined;
    await fetch(`/api/blog/posts/${id}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
      credentials: "include"
    });
    await load();
  };

  const generate = async () => {
    const res = await fetch("/api/tjai/blog-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ topic, keyword })
    });
    const data = await res.json().catch(() => ({}));
    setGenerated(String(data.content ?? ""));
    setDraftId(typeof data?.draft?.id === "string" ? data.draft.id : null);
  };

  return (
    <section className="glass-panel rounded-[32px] p-6">
      <h3 className="text-lg font-semibold text-white">Blog Management</h3>
      <div className="mt-4 space-y-3">
        {pending.length === 0 ? <p className="text-sm text-muted">No pending posts.</p> : null}
        {pending.map((post) => (
          <div key={post.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-medium text-white">{post.title}</p>
            <p className="mt-1 text-xs text-faint">
              {post.author_name} · {post.category ?? "General"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void moderate(post.id, "approve")} className="rounded-full border border-cyan-300/35 px-3 py-1 text-xs text-cyan-200">
                Approve
              </button>
              <button type="button" onClick={() => void moderate(post.id, "reject")} className="rounded-full border border-red-300/35 px-3 py-1 text-xs text-red-200">
                Reject
              </button>
              <button type="button" onClick={() => void moderate(post.id, "feature")} className="rounded-full border border-violet-300/35 px-3 py-1 text-xs text-violet-200">
                Feature
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">Generate with TJAI</p>
        <input className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <input className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button type="button" onClick={() => void generate()} className="btn-primary-shimmer mt-3 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-4 py-2 text-xs font-semibold text-[#09090B]">
          Generate Draft
        </button>
        {generated ? <textarea readOnly className="mt-3 min-h-[180px] w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-bright" value={generated} /> : null}
        {draftId ? (
          <Link
            href={`/${locale}/blog/write?draft_id=${encodeURIComponent(draftId)}`}
            className="mt-3 inline-flex rounded-full border border-cyan-300/35 px-4 py-2 text-xs text-cyan-200"
          >
            Open in Editor
          </Link>
        ) : null}
      </div>
    </section>
  );
}

