import { rankingTiers } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { CoachApplicationSlideshow } from "@/components/coach-application-slideshow";
import { HoverLift } from "@/components/motion";
import { ProtectedRoute } from "@/components/protected-route";

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  const dict = getDictionary(params.locale);

  const bc = dict.becomeCoach;

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="glass-panel rounded-[36px] p-8">
          <span className="badge">{bc.badge}</span>
          <h1 className="mt-6 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
            {bc.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            {bc.subtitle}
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[bc.feature1, bc.feature2, bc.feature3, bc.feature4].map((point) => (
              <HoverLift key={point}>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-zinc-200">
                  {point}
                </div>
              </HoverLift>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">{bc.magnetTitle}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {bc.magnetSubtitle}
            </p>
            <div className="mt-6 space-y-3">
              {rankingTiers.map((tier) => (
                <HoverLift key={tier.name}>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">{tier.name}</p>
                    <p className="mt-2 text-sm text-zinc-400">{tier.detail}</p>
                  </div>
                </HoverLift>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">{bc.applicationTitle}</p>
            <div className="mt-5">
              <CoachApplicationSlideshow dict={dict.becomeCoach} locale={params.locale as Locale} />
            </div>
          </div>
        </aside>
      </div>
    </div>
    </ProtectedRoute>
  );
}
