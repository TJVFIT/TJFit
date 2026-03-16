import Link from "next/link";
import { CalendarDays, MessageSquareText, Mic, Star, Video } from "lucide-react";
import { notFound } from "next/navigation";

import { ProgramCard, SectionHeading } from "@/components/ui";
import { ProtectedRoute } from "@/components/protected-route";
import { coaches, programs } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function CoachProfilePage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const coach = coaches.find((entry) => entry.slug === params.slug);

  if (!coach) {
    notFound();
  }

  const relatedPrograms = programs.filter((program) => coach.programs.includes(program.slug));

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel rounded-[36px] p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-accent/80 to-cyan-300/80 text-3xl font-semibold text-white">
                {coach.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">{coach.name}</p>
                <p className="mt-2 text-lg text-zinc-400">{coach.specialty}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    {coach.rating}
                  </span>
                  <span>{coach.country}</span>
                  <span>{coach.rank} rank</span>
                  <span>{coach.availability}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-right">
              <p className="text-sm text-zinc-400">Pricing hidden for now</p>
              <p className="mt-2 text-sm text-zinc-400">Includes session booking and dashboard access</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="About" title="Coach overview" copy={coach.bio} />
            </div>
            <div className="glass-panel rounded-[28px] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Certifications</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {coach.certifications.map((cert) => (
                  <span key={cert} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200">
                    {cert}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-xs uppercase tracking-[0.24em] text-zinc-500">Languages</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {coach.languages.map((language) => (
                  <span key={language} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {coach.results.map((result) => (
              <div key={result} className="glass-panel rounded-[24px] p-5 text-sm text-zinc-200">
                {result}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <SectionHeading
              eyebrow="Programs"
              title="Programs offered"
              copy="Bundle direct coaching with a paid program library for stronger retention and upsells."
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {relatedPrograms.map((program) => (
                <ProgramCard key={program.slug} program={program} href={`/${params.locale}/programs/${program.slug}`} />
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[36px] p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-accent" />
              <p className="text-lg font-semibold text-white">Session booking calendar</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm text-zinc-300">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href={`/${params.locale}/checkout`}
                className="gradient-button flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
              >
                <Video className="h-4 w-4" />
                Book Video Session
              </Link>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5">
                <Mic className="h-4 w-4" />
                Book Voice Session
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5">
                <MessageSquareText className="h-4 w-4" />
                Chat Coaching
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">Client reviews</p>
            <div className="mt-6">
              <p className="text-sm text-zinc-500">No reviews yet.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </ProtectedRoute>
  );
}
