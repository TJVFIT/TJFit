import { ChallengeCard, SectionHeading } from "@/components/ui";
import { ProtectedRoute } from "@/components/protected-route";
import { challenges } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function ChallengesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Transformation Challenges"
        title="Platform-wide challenges designed for viral momentum."
        copy="Challenges reward progress, encourage weekly posting, drive community interaction, and turn transformations into shareable platform moments."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.slug} challenge={challenge} />
        ))}
      </div>

      <div className="glass-panel rounded-[32px] p-6">
        <p className="text-lg font-semibold text-white">How rewards work</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Weekly progress posts increase visibility.",
            "Top transformations earn wallet rewards or membership access.",
            "Coach verification strengthens leaderboard ranking."
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
