import { redirect } from "next/navigation";

import { TJAIV2Flow } from "@/components/tjai/v2-flow";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TjaiV2Page({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/ai/v2`)}`);

  return (
    <main className="min-h-[100dvh] bg-[#08080A] text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">TJAI v2 · beta</p>
          <h1 className="mt-3 font-display text-[clamp(32px,4.6vw,52px)] font-semibold leading-[1.04] tracking-[-0.02em]">
            Your fitness plan, generated.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-[1.65] text-white/55">
            Three short stages: about you, your area, your health. Then we generate a
            12-week plan with workouts, meals, recipes, a grocery list, and a supplement stack.
          </p>
        </header>
        <TJAIV2Flow locale={locale} />
      </div>
    </main>
  );
}
