"use client";

import { useEffect, useMemo, useState } from "react";
import { programs } from "@/lib/content";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, localizeProgram } from "@/lib/program-localization";
import { ProtectedRoute } from "@/components/protected-route";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE, TJFIT_COINS_PER_USD } from "@/lib/tjfit-coin";

type WalletResponse = {
  wallet: { balance: number; lifetime_earned: number; lifetime_spent: number };
  offers: Array<{ key: string; title: string; coin_cost: number; discount_percent: number }>;
  codes: Array<{ code: string; discount_percent: number; offer_key: string }>;
};

type CheckoutProgramOption = {
  slug: string;
  title: string;
  description: string;
  baseTry: number;
};

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? (params.locale as Locale) : ("en" as Locale);
  const [activeSlug, setActiveSlug] = useState(programs[0]?.slug ?? "");
  const [customPrograms, setCustomPrograms] = useState<CheckoutProgramOption[]>([]);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const staticProgramOptions = useMemo<CheckoutProgramOption[]>(
    () =>
      programs.map((program) => {
        const localized = localizeProgram(program, locale);
        return {
          slug: program.slug,
          title: localized.title,
          description: localized.description,
          baseTry: getProgramBasePriceTry(program)
        };
      }),
    [locale]
  );
  const allProgramOptions = useMemo(
    () => [...customPrograms, ...staticProgramOptions],
    [customPrograms, staticProgramOptions]
  );
  const selectedProgram = useMemo(
    () => allProgramOptions.find((p) => p.slug === activeSlug) ?? allProgramOptions[0],
    [allProgramOptions, activeSlug]
  );
  const baseTry = selectedProgram ? selectedProgram.baseTry : 0;
  const basePrice = formatProgramPrice(baseTry, locale);

  const refreshWallet = async () => {
    const res = await fetch("/api/coins/wallet", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as WalletResponse;
    setWalletData(data);
  };

  useEffect(() => {
    const loadCustomPrograms = async () => {
      const res = await fetch(`/api/programs/custom?locale=${locale}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const options = (data.programs ?? []).map((item: any) => ({
        slug: String(item.slug),
        title: String(item.title),
        description: String(item.description ?? ""),
        baseTry: Number(item.price_try ?? 400)
      })) as CheckoutProgramOption[];
      setCustomPrograms(options);
    };
    loadCustomPrograms();
  }, [locale]);

  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search).get("program");
    if (querySlug) {
      setActiveSlug(querySlug);
    }
  }, [customPrograms.length]);

  useEffect(() => {
    refreshWallet();
  }, []);

  if (!isLocale(params.locale)) {
    return null;
  }

  const redeemOffer = async (offerKey: string) => {
    setWorking(true);
    setStatus(null);
    const res = await fetch("/api/coins/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ offerKey })
    });
    const data = await res.json();
    setWorking(false);
    if (!res.ok) {
      setStatus(data.error ?? "Could not redeem offer.");
      return;
    }
    setStatus(`Discount code created: ${data.code}`);
    await refreshWallet();
  };

  const completePurchase = async () => {
    if (!selectedProgram) return;
    setWorking(true);
    setStatus(null);

    const createRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        programSlug: selectedProgram.slug,
        discountCode: selectedCode || undefined
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setWorking(false);
      setStatus(createData.error ?? "Could not create order.");
      return;
    }

    if (createData.provider !== "test") {
      setWorking(false);
      setStatus(
        createData.message ??
          "Payment provider setup is in progress. Real payment handoff must be completed before purchases can go live."
      );
      return;
    }

    const completeRes = await fetch("/api/checkout/complete-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId: createData.order.id })
    });
    const completeData = await completeRes.json();
    setWorking(false);
    if (!completeRes.ok) {
      setStatus(completeData.error ?? "Could not complete purchase.");
      return;
    }

    setStatus(`Purchase completed. +${completeData.coinsEarned ?? TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin added.`);
    setSelectedCode("");
    await refreshWallet();
  };

  return (
    <ProtectedRoute locale={params.locale}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-[32px] p-6">
          <span className="badge">TJFITcoin Checkout</span>
          <h1 className="mt-4 text-3xl font-semibold text-white">Buy Programs + Earn Coins</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Every purchased program gives <span className="text-white">{TJFIT_COINS_PER_PROGRAM_PURCHASE} TJFITcoin</span>.{" "}
            Coin conversion: <span className="text-white">1 USD = {TJFIT_COINS_PER_USD} TJFITcoin</span>.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-sm text-zinc-400">Select Program</p>
            <select
              className="input mt-3"
              value={activeSlug}
              onChange={(e) => setActiveSlug(e.target.value)}
            >
              {allProgramOptions.map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.title}
                </option>
              ))}
            </select>

            {selectedProgram && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-semibold text-white">{selectedProgram.title}</p>
                <p className="mt-2 text-sm text-zinc-400">{selectedProgram.description}</p>
                <p className="mt-3 text-sm text-zinc-300">Price: {basePrice}</p>
                <p className="mt-1 text-sm text-zinc-300">Coins on purchase: {TJFIT_COINS_PER_PROGRAM_PURCHASE}</p>
              </div>
            )}

            <div className="mt-5">
              <p className="text-sm text-zinc-400">Apply Discount Code</p>
              <select
                className="input mt-3"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                <option value="">No discount code</option>
                {(walletData?.codes ?? []).map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} ({code.discount_percent}%)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={completePurchase}
              disabled={working || !selectedProgram}
              className="gradient-button mt-6 w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {working ? "Processing..." : "Complete Program Purchase"}
            </button>
            <p className="mt-3 text-xs text-zinc-500">
              Real payment only becomes available when a provider is configured. Direct completion is restricted to explicit test mode.
            </p>
            {status && <p className="mt-3 text-sm text-emerald-300">{status}</p>}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="text-sm text-zinc-400">TJFITcoin Wallet</p>
              <p className="mt-2 text-3xl font-semibold text-white">{walletData?.wallet.balance ?? 0} coins</p>
              <p className="mt-2 text-sm text-zinc-400">
                Lifetime earned: {walletData?.wallet.lifetime_earned ?? 0} - Lifetime spent: {walletData?.wallet.lifetime_spent ?? 0}
              </p>
            </div>

            <div className="glass-panel rounded-[32px] p-6">
              <p className="text-lg font-semibold text-white">Discount Store (Buy with Coins)</p>
              <div className="mt-4 space-y-3">
                {(walletData?.offers ?? []).map((offer) => (
                  <div key={offer.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <p className="font-medium text-white">{offer.title}</p>
                      <p className="text-sm text-zinc-400">{offer.discount_percent}% off - {offer.coin_cost} coins</p>
                    </div>
                    <button
                      onClick={() => redeemOffer(offer.key)}
                      disabled={working}
                      className="rounded-full border border-white/15 px-4 py-2 text-xs text-white hover:bg-white/5 disabled:opacity-60"
                    >
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
