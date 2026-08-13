"use client";

import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { EmptyState } from "@/components/ui/empty-state";

type PendingTransformation = {
  id: string;
  before_image_url: string;
  after_image_url: string;
  duration_label: string | null;
  weight_change: string | null;
  story: string | null;
  created_at: string;
};

export function AdminTransformationsPanel() {
  const [pending, setPending] = useState<PendingTransformation[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/community/transformations?status=pending", {
      cache: "no-store",
      credentials: "include"
    });
    const data = await res.json().catch(() => ({}));
    setPending(Array.isArray(data.transformations) ? data.transformations : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const moderate = async (id: string, action: "approve" | "reject") => {
    setActionLoadingId(id);
    try {
      await fetch(`/api/community/transformations/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        credentials: "include"
      });
      await load();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="glass-panel rounded-[32px] p-6">
      <h3 className="text-lg font-semibold text-white">Transformation Wall Moderation</h3>
      <div className="mt-4 space-y-3">
        {pending.length === 0 ? (
          <EmptyState icon={TrendingUp} subtext="No pending transformations." />
        ) : null}
        {pending.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex gap-2">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-black/30">
                <Image src={item.before_image_url} alt="Before" fill sizes="64px" className="object-cover" />
              </div>
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-black/30">
                <Image src={item.after_image_url} alt="After" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {item.duration_label ?? "—"} · {item.weight_change ?? "—"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-faint">{item.story ?? ""}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionLoadingId === item.id}
                onClick={() => void moderate(item.id, "approve")}
                className="rounded-full border border-purple-300/35 px-3 py-1 text-xs text-purple-200 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={actionLoadingId === item.id}
                onClick={() => void moderate(item.id, "reject")}
                className="rounded-full border border-red-300/35 px-3 py-1 text-xs text-red-200 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
