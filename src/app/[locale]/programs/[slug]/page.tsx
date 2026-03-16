import Link from "next/link";
import { notFound } from "next/navigation";

import { ProtectedRoute } from "@/components/protected-route";
import { coaches, products, programs } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function ProgramDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const program = programs.find((item) => item.slug === params.slug);

  if (!program) {
    notFound();
  }

  const coach = coaches.find((entry) => entry.slug === program.coachSlug);
  const recommendedProducts = products.filter((product) =>
    program.requiredEquipment.includes(product.slug)
  );

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[36px] p-8">
          <span className="badge">{program.category}</span>
          <h1 className="mt-6 text-4xl font-semibold text-white">{program.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{program.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {program.previewImages.map((image) => (
              <div
                key={image}
                className="rounded-[24px] border border-dashed border-white/10 bg-black/30 p-10 text-center text-xs uppercase tracking-[0.24em] text-zinc-500"
              >
                {image}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-lg font-semibold text-white">Program builder assets</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {program.assets.map((asset) => (
                <div key={asset.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{asset.type}</p>
                  <p className="mt-3 text-white">{asset.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-sm text-zinc-400">Coach</p>
            <p className="mt-2 text-2xl font-semibold text-white">{coach?.name}</p>
            <p className="mt-2 text-sm text-zinc-400">{coach?.specialty}</p>

            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Difficulty</span>
                <span className="text-white">{program.difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration</span>
                <span className="text-white">{program.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Price</span>
                <span className="text-white">Hidden</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coach commission</span>
                <span className="text-white">{program.coachCommissionRate}%</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${params.locale}/checkout`}
                className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
              >
                Buy program
              </Link>
              <Link
                href={`/${params.locale}/coaches/${coach?.slug ?? ""}`}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white"
              >
                View coach
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Recommended equipment</p>
            <div className="mt-6 space-y-4">
              {recommendedProducts.map((product) => (
                <div key={product.slug} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">Hidden</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Coach earns {product.coachCommissionRate}% commission
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </ProtectedRoute>
  );
}
