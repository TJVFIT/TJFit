import { notFound } from "next/navigation";

import { ProtectedRoute } from "@/components/protected-route";
import { transformations, coaches } from "@/lib/content";
import { requireLocaleParam } from "@/lib/require-locale";

export default function TransformationDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const slug = params.slug ?? "";

  const transformation = transformations.find((item) => item.slug === slug);

  if (!transformation) {
    notFound();
  }

  const coach = coaches.find((entry) => entry.slug === transformation.coachSlug);

  return (
    <ProtectedRoute locale={locale} requireAdmin>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[36px] p-8">
        <span className="badge">Transformation Story</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">
          {transformation.userName} • {transformation.category}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{transformation.story}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-dashed border-white/10 bg-black/30 p-8 text-center text-xs uppercase tracking-[0.24em] text-zinc-500">
            Before photo
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-400">Starting weight</p>
            <p className="mt-2 text-3xl font-semibold text-white">{transformation.startingWeight} kg</p>
            <p className="mt-4 text-sm text-zinc-400">Current weight</p>
            <p className="mt-2 text-3xl font-semibold text-white">{transformation.currentWeight} kg</p>
            <p className="mt-4 text-sm text-zinc-400">Strength stat</p>
            <p className="mt-2 text-xl text-white">{transformation.strengthStat}</p>
          </div>
          <div className="rounded-[28px] border border-dashed border-white/10 bg-black/30 p-8 text-center text-xs uppercase tracking-[0.24em] text-zinc-500">
            After photo
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Progress timeline</p>
          <div className="mt-6 space-y-4">
            {transformation.timeline.map((item) => (
              <div key={item.week} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">{item.week}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-200">{item.update}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Measurements</p>
            <div className="mt-6 space-y-3">
              {transformation.measurements.map((measurement) => (
                <div key={measurement} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  {measurement}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Coach responsible</p>
            <p className="mt-4 text-xl font-semibold text-white">{coach?.name ?? "Coach"}</p>
            <p className="mt-2 text-sm text-zinc-400">{coach?.specialty}</p>
            <p className="mt-4 text-sm text-zinc-300">
              Community votes: {transformation.votes} • Verification: {transformation.verified ? "Coach verified" : "Pending"}
            </p>
          </div>
        </aside>
      </div>
    </div>
    </ProtectedRoute>
  );
}
