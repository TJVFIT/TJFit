"use client";

import { Receipt } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";

type Item = {
  id: string;
  slug: string;
  name: string;
  credits: number;
  priceUsd: number;
  linked: boolean;
  shortUrl: string | null;
  productId: string | null;
};

type Data = {
  items: Item[];
  hasApiKey: boolean;
};

export function AdminCreditPackPayments() {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tjai/credit-packs/gumroad", { credentials: "include" });
    if (!res.ok) {
      setStatus("Could not load credit pack payment status.");
      return;
    }
    const json = (await res.json()) as Data;
    setData(json);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createAll = async () => {
    setBusy(true);
    setStatus("Creating Gumroad products…");
    try {
      const res = await fetch("/api/admin/tjai/credit-packs/gumroad", {
        method: "POST",
        credentials: "include"
      });
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

  if (!data) {
    return (
      <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-xl font-bold text-white">TJAI Credit Pack Payments</h2>
        <p className="mt-2 text-sm text-muted">Loading…</p>
      </section>
    );
  }

  const allLinked = data.items.every((i) => i.linked);

  return (
    <section className="mt-6 rounded-2xl border border-divider bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">TJAI Credit Pack Payments</h2>
          <p className="mt-1 text-sm text-muted">
            Link each credit pack to a Gumroad product. Buyers get credits automatically via the
            sale webhook (matched by Gumroad product id).
          </p>
        </div>
        <button
          type="button"
          onClick={createAll}
          disabled={busy || allLinked}
          className="rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-5 py-2.5 text-sm font-bold text-[#09090B] disabled:opacity-50"
        >
          {allLinked ? "All linked ✓" : "Create all Gumroad products"}
        </button>
      </div>

      {!data.hasApiKey ? (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200" role="status">
          GUMROAD_API_KEY is not set, so auto-create is disabled. Add it in Vercel env (and redeploy).
        </p>
      ) : null}

      {status ? (
        <p className="mt-3 text-xs text-purple-200" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}

      {data.items.length === 0 ? (
        <EmptyState className="mt-5" icon={Receipt} subtext="No credit pack payments recorded yet." />
      ) : null}

      <div className="mt-5 space-y-3">
        {data.items.map((i) => (
          <div key={i.slug} className="rounded-xl border border-divider bg-surface-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">
                  {i.name} <span className="text-faint">· ${i.priceUsd} · {i.credits} credit{i.credits === 1 ? "" : "s"}</span>
                </p>
                <p className="text-xs text-dim">{i.shortUrl ?? i.slug}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                  i.linked ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                }`}
              >
                {i.linked ? "Linked" : "Not linked"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
