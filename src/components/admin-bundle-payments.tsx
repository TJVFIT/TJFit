"use client";

import { useCallback, useEffect, useState } from "react";

type Item = {
  slug: string;
  name: string;
  priceUsd: number;
  linked: boolean;
  shortUrl: string | null;
  productId: string | null;
  published: boolean;
};

type Data = {
  items: Item[];
  hasApiKey: boolean;
  freeBundles: { slug: string; name: string }[];
};

export function AdminBundlePayments() {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/bundles/gumroad", { credentials: "include" });
    if (!res.ok) {
      setStatus("Could not load bundle payment status.");
      return;
    }
    const json = (await res.json()) as Data;
    setData(json);
    setDrafts(Object.fromEntries(json.items.map((i) => [i.slug, i.shortUrl ?? ""])));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createAll = async () => {
    setBusy(true);
    setStatus("Creating Gumroad products…");
    try {
      const res = await fetch("/api/admin/bundles/gumroad", { method: "POST", credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(String(json.error ?? "Create failed."));
      } else {
        const c = (json.created ?? []).length;
        const f = (json.failed ?? []).length;
        setStatus(`Created ${c} product${c === 1 ? "" : "s"}${f ? `, ${f} failed` : ""}.`);
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  const saveManual = async (slug: string) => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/bundles/gumroad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug, shortUrl: drafts[slug] ?? "" })
      });
      const json = await res.json().catch(() => ({}));
      setStatus(res.ok ? `Saved ${slug}.` : String(json.error ?? "Save failed."));
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">Bundle Payments</h2>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </section>
    );
  }

  const allLinked = data.items.every((i) => i.linked);

  return (
    <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Bundle Payments</h2>
          <p className="mt-1 text-sm text-muted">
            Link each paid bundle ($10) to a Gumroad product. Free bundles need nothing.
          </p>
        </div>
        <button
          type="button"
          onClick={createAll}
          disabled={busy || allLinked}
          className="rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-5 py-2.5 text-sm font-bold text-[#09090B] disabled:opacity-50"
        >
          {allLinked ? "All linked ✓" : "Create all Gumroad products"}
        </button>
      </div>

      {!data.hasApiKey ? (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200" role="status">
          GUMROAD_API_KEY is not set, so auto-create is disabled. Add it in Vercel env (and redeploy) for one-click
          creation — or paste each product URL manually below.
        </p>
      ) : null}

      {status ? (
        <p className="mt-3 text-xs text-cyan-200" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {data.items.map((i) => (
          <div key={i.slug} className="rounded-xl border border-divider bg-surface-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">
                  {i.name} <span className="text-faint">· ${i.priceUsd}</span>
                </p>
                <p className="text-xs text-dim">{i.slug}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                  i.linked ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                }`}
              >
                {i.linked ? "Linked" : "Not linked"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="url"
                value={drafts[i.slug] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [i.slug]: e.target.value }))}
                placeholder="https://yourname.gumroad.com/l/…"
                className="input min-w-[240px] flex-1 text-sm"
                aria-label={`Gumroad URL for ${i.name}`}
              />
              <button
                type="button"
                onClick={() => saveManual(i.slug)}
                disabled={busy}
                className="rounded-full border border-cyan-300/35 px-4 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.freeBundles.length ? (
        <p className="mt-4 text-xs text-dim">
          Free bundles (no payment needed): {data.freeBundles.map((b) => b.name).join(", ")}.
        </p>
      ) : null}
    </section>
  );
}
