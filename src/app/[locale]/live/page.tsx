import Link from "next/link";

import { coaches, liveSessions } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function LivePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">Live Training System</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Group live sessions with booking-ready rooms.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Coaches can host live rooms with video, chat, participant lists, and spot limits. This is structured for Daily.co or WebRTC integration.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {liveSessions.map((session) => {
          const coach = coaches.find((entry) => entry.slug === session.coachSlug);

          return (
            <div key={session.id} className="glass-panel rounded-[32px] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{session.title}</p>
                  <p className="mt-2 text-sm text-zinc-400">{coach?.name}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                  {session.type}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Schedule<br />
                  <span className="text-white">{session.schedule}</span>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Capacity<br />
                  <span className="text-white">{session.capacity}</span>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  Spots left<br />
                  <span className="text-white">{session.spotsLeft}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${params.locale}/checkout`}
                  className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
                >
                  Book spot
                </Link>
                <button className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white">
                  Open live room
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
