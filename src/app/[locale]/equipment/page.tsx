"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { isLocale } from "@/lib/i18n";

const CATEGORIES = [
  { icon: "🏋️", title: "Home Gym Equipment", desc: "Dumbbells, barbells, resistance bands, pull-up bars, kettlebells, power racks — everything to train at home." },
  { icon: "🍳", title: "Smart Cooking Gadgets", desc: "Kitchen scales, air fryers, blenders, meal prep containers. Nutrition starts in the kitchen." },
  { icon: "🌲", title: "Outdoor Training Equipment", desc: "Suspension trainers, agility ladders, jump ropes, portable pull-up bars, outdoor yoga mats." },
  { icon: "💆", title: "Physiotherapy Equipment", desc: "Massage guns, foam rollers, resistance therapy bands, balance boards, TENS devices. Recover like a pro." }
];

export default function EquipmentPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/store/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-500/10">
          <ShoppingBag className="h-8 w-8 text-[#22D3EE]" />
        </div>
        <span className="inline-flex animate-pulse rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Launching Soon
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">TJFit Equipment Store</h1>
        <p className="mt-3 text-lg text-zinc-400">Everything you need to train smarter — curated by our coaches.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <article key={cat.title} className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
            <p className="text-3xl">{cat.icon}</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{cat.title}</h3>
            <p className="mt-2 text-sm leading-[1.7] text-zinc-400">{cat.desc}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-cyan-400/15 bg-[rgba(34,211,238,0.03)] p-6 text-center">
        <p className="text-sm font-semibold text-[#22D3EE]">⚡ Your TJCOINs will be redeemable in the store.</p>
        {user ? (
          <p className="mt-1 text-xs text-zinc-400">Keep earning coins. They unlock discounts at launch.</p>
        ) : (
          <p className="mt-1 text-xs text-zinc-400"><a href={`/${locale}/signup`} className="text-[#22D3EE] underline">Sign up free</a> to start earning TJCOINs. Redeemable at launch.</p>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h2 className="text-center text-xl font-bold text-white">Be the first to know when we launch.</h2>
        {sent ? (
          <p className="mt-4 text-center text-sm text-emerald-300">You are on the list. We will email you at launch.</p>
        ) : (
          <form onSubmit={joinWaitlist} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="email"
              className="input flex-1"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting} className="rounded-full bg-[#22D3EE] px-5 py-2.5 text-sm font-bold text-[#09090B] disabled:opacity-50">
              {submitting ? "Adding..." : "Notify Me"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
