import { ChallengeCard, SectionHeading, TransformationCard } from "@/components/ui";
import {
  challenges,
  transformationLeaderboards,
  transformations
} from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function TransformationsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Transformation Engine"
        title="Public transformations that build trust and momentum."
        copy="Each transformation includes before and after proof, a timeline, body metrics, strength stats, and the coach responsible."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {transformations.map((transformation) => (
          <TransformationCard
            key={transformation.slug}
            transformation={transformation}
            href={`/${params.locale}/transformations/${transformation.slug}`}
          />
        ))}
      </div>

      <section>
        <SectionHeading
          eyebrow="Global Transformation Leaderboard"
          title="Ranked by change, community votes, and coach verification."
          copy="Leaderboards create social proof and recurring engagement across fat loss, muscle gain, athletic progress, and recovery."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {transformationLeaderboards.map((entry) => (
            <div key={entry.category} className="glass-panel rounded-[24px] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{entry.category}</p>
              <p className="mt-4 text-xl font-semibold text-white">{entry.leader}</p>
              <p className="mt-2 text-sm text-zinc-400">{entry.score}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Transformation Challenges"
          title="Challenge-driven progress keeps the platform active."
          copy="Challenges connect transformation posting, community engagement, leaderboard movement, and rewards."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}
        </div>
      </section>
    </div>
  );
}
