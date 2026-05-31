"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";

const CATEGORIES = [
  { icon: "", title: "Home Gym Equipment", desc: "Dumbbells, barbells, resistance bands, pull-up bars, kettlebells, power racks — everything to train at home." },
  { icon: "", title: "Smart Cooking Gadgets", desc: "Kitchen scales, air fryers, blenders, meal prep containers. Nutrition starts in the kitchen." },
  { icon: "", title: "Outdoor Training Equipment", desc: "Suspension trainers, agility ladders, jump ropes, portable pull-up bars, outdoor yoga mats." },
  { icon: "", title: "Physiotherapy Equipment", desc: "Massage guns, foam rollers, resistance therapy bands, balance boards, TENS devices. Recover like a pro." }
];

export default function EquipmentPage() {
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
    <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs />
      <div className="relative text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-500/10">
          <ShoppingBag className="h-8 w-8 text-accent" />
        </div>
        <span className="inline-flex animate-pulse rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Launching Soon
        </span>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
          <span className="tj-title-shimmer">TJFit Equipment Store</span>
        </h1>
        <p className="mt-3 text-lg text-muted">Everything you need to train smarter — curated by our coaches.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <article key={cat.title} className="group/cat rounded-2xl border border-divider bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 hover:border-cyan-300/35 hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,0.5),0_0_28px_rgba(34,211,238,0.12)] motion-safe:hover:-translate-y-0.5">
            <p className="text-3xl">{cat.icon}</p>
            <h3 className="mt-3 text-lg font-semibold text-white transition-colors duration-200 group-hover/cat:text-cyan-50">{cat.title}</h3>
            <p className="mt-2 text-sm leading-[1.7] text-muted">{cat.desc}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-divider bg-surface p-6">
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
            <button type="submit" disabled={submitting} className="tj-cta-sheen rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] shadow-[0_0_16px_rgba(34,211,238,0.2)] hover:shadow-[0_0_24px_rgba(34,211,238,0.32)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] px-5 py-2.5 text-sm font-bold text-[#09090B] disabled:opacity-50">
              {submitting ? "Adding..." : "Notify Me"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
