"use client";

import { useEffect, useMemo, useState } from "react";
import { Coins, History, ShoppingBag } from "lucide-react";

import { PremiumPageShell } from "@/components/premium";
import { Button } from "@/components/ui/Button";

type WalletResponse = {
  wallet: { balance: number; lifetime_earned: number; lifetime_spent: number };
  offers: Array<{ key: string; title: string; coin_cost: number; discount_percent: number; active: boolean }>;
  ledger: Array<{ id: number; delta: number; reason: string; created_at: string }>;
  codes: Array<{ code: string; offer_key: string; discount_percent: number; status: string; created_at: string }>;
};

export default function CoinsPage() {
  const [data, setData] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "spent">("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coins/wallet", { credentials: "include" });
      if (!res.ok) return;
      const json = (await res.json()) as WalletResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const ledger = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.ledger;
    return data.ledger.filter((item) => (filter === "earned" ? item.delta > 0 : item.delta < 0));
  }, [data, filter]);

  const redeem = async (offerKey: string) => {
    setRedeeming(offerKey);
    try {
      const res = await fetch("/api/coins/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerKey })
      });
      if (!res.ok) return;
      await refresh();
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <PremiumPageShell>
      <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#52525B]">TJCOIN SHOP</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Spend Your TJCOIN</h1>
            <p className="mt-2 text-sm text-[#A1A1AA]">Earn more coins by completing programs, posting blogs, and daily streaks.</p>
          </div>
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-[#A1A1AA]">Current Balance</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-[#22D3EE]">
              <Coins className="h-5 w-5" />
              {data?.wallet.balance ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 animate-pulse rounded-xl border border-[#1E2028] bg-[#111215]" />)
          : (data?.offers ?? []).map((offer) => (
              <article key={offer.key} className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-extrabold text-[#22D3EE]">{offer.discount_percent}% OFF</p>
                    <p className="mt-2 text-sm text-[#A1A1AA]">{offer.title}</p>
                  </div>
                  <p className="text-base font-semibold text-yellow-300">{offer.coin_cost} ⚡</p>
                </div>
                <p className="mt-4 text-xs text-[#52525B]">Code valid for 7 days after redemption.</p>
                <Button
                  className="mt-5 w-full"
                  disabled={(data?.wallet.balance ?? 0) < offer.coin_cost || redeeming === offer.key}
                  onClick={() => redeem(offer.key)}
                >
                  Redeem
                </Button>
              </article>
            ))}
      </section>

      <section className="mt-10 rounded-xl border border-[#1E2028] bg-[#0E0F13] p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <ShoppingBag className="h-4 w-4 text-[#52525B]" /> Coming Soon - TJFit Equipment Store
        </h2>
        <p className="mt-2 text-sm text-[#A1A1AA]">Coins earned now will also work in the equipment store when it launches.</p>
      </section>

      <section className="mt-10 rounded-xl border border-[#1E2028] bg-[#111215] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <History className="h-4 w-4 text-[#A1A1AA]" /> Your Coin History
          </h2>
          <div className="flex gap-2 text-xs">
            {(["all", "earned", "spent"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-3 py-1.5 ${filter === item ? "border-cyan-400/40 text-[#22D3EE]" : "border-[#1E2028] text-[#A1A1AA]"}`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#52525B]">
              <tr>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Reason</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((item) => (
                <tr key={item.id} className="border-t border-[#1E2028]">
                  <td className="py-2 text-[#A1A1AA]">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="py-2 text-white">{item.reason}</td>
                  <td className={`py-2 text-right font-semibold ${item.delta >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {item.delta >= 0 ? "+" : ""}
                    {item.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PremiumPageShell>
  );
}

