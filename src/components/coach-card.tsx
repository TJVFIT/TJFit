"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Dumbbell } from "lucide-react";

type Coach = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialty_tags?: string[] | null;
  accepting_clients?: boolean | null;
  stats?: {
    students: number;
    programs: number;
    average_rating: number;
    blog_posts: number;
  };
};

export function CoachCard({ locale, coach }: { locale: string; coach: Coach }) {
  const tags = (coach.specialty_tags ?? []).slice(0, 3);
  const extra = Math.max(0, (coach.specialty_tags ?? []).length - tags.length);
  const accepting = coach.accepting_clients !== false;
  const rating = coach.stats?.average_rating ?? 0;

  return (
    <Link
      href={`/${locale}/coaches/${encodeURIComponent(coach.username)}`}
      className="group tj-card-lift tj-card-shine relative block overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.07)] bg-gradient-to-b from-[rgba(17,18,21,0.85)] to-[rgba(13,14,17,0.92)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgba(34,211,238,0.28)] hover:shadow-[0_24px_64px_-24px_rgba(0,0,0,0.6),0_0_32px_-6px_rgba(34,211,238,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
    >
      {/* accent glow blob on hover */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,transparent_70%)] opacity-0 transition-opacity duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
        aria-hidden
      />

      {/* availability dot */}
      <span
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md"
        title={accepting ? "Accepting clients" : "Not accepting clients"}
      >
        <span
          className="relative inline-flex h-2 w-2"
          aria-hidden
        >
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${accepting ? "animate-ping bg-[#22C55E]" : "bg-[#EF4444]"} opacity-60 motion-reduce:hidden`}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: accepting ? "#22C55E" : "#EF4444" }}
          />
        </span>
        {accepting ? "Open" : "Full"}
      </span>

      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#0E0F12] ring-1 ring-[rgba(34,211,238,0.0)] transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:ring-[rgba(34,211,238,0.4)] group-hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.5)]">
          {coach.avatar_url ? (
            <Image
              src={coach.avatar_url}
              alt=""
              fill
              sizes="56px"
              className="object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-500">
              {(coach.display_name || coach.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-white transition-colors duration-200 group-hover:text-[#E6FBFF]">
            {coach.display_name || coach.username}
          </h3>
          <p className="truncate text-xs text-zinc-500">@{coach.username}</p>
          {rating > 0 ? (
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300/90">
              <Star className="h-3 w-3 fill-amber-300/90 text-amber-300/90" aria-hidden />
              <span className="tabular-nums font-semibold">{rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-200 transition-[background-color,border-color] duration-200 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15"
            >
              {tag}
            </span>
          ))}
          {extra > 0 ? (
            <span className="rounded-full border border-[#1E2028] px-2 py-0.5 text-[11px] text-zinc-500">+{extra}</span>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">{coach.bio || "Coach profile"}</p>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
          <span className="tabular-nums">{coach.stats?.students ?? 0}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
          <span className="tabular-nums">{coach.stats?.programs ?? 0}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#22D3EE] transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
          View
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
