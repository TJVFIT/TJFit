import Link from "next/link";

import { requireLocaleParam } from "@/lib/require-locale";

const BUNDLES = [
  {
    key: "fat-loss",
    name: "Fat Loss Bundle",
    program: "Gym Fat Loss Protocol",
    diet: "Clean Cutting Diet",
    save: "30%"
  },
  {
    key: "lean-bulk",
    name: "Lean Bulk Bundle",
    program: "Gym Mass Builder",
    diet: "Lean Bulk Diet",
    save: "30%"
  },
  {
    key: "home-starter",
    name: "Home Starter Bundle",
    program: "Home Fat Loss Starter",
    diet: "Clean Cut Starter",
    save: "Free"
  },
  {
    key: "definition",
    name: "Muscle Definition Bundle",
    program: "Hypertrophy System",
    diet: "Hard Cut Athlete Diet",
    save: "30%"
  }
];

export default function BundlesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Program Bundles</h1>
      <p className="mt-2 text-sm text-zinc-400">Pair programs and diets together with better value.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {BUNDLES.map((bundle) => (
          <article key={bundle.key} className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#22D3EE]">Bundle</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{bundle.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {bundle.program} + {bundle.diet}
            </p>
            <p className="mt-2 text-sm text-green-400">Save {bundle.save}</p>
            <Link href={`/${locale}/programs`} className="mt-4 inline-flex rounded-full border border-[#1E2028] px-4 py-2 text-sm text-zinc-200">
              Get Bundle
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
