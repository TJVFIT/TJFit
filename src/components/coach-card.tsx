"use client";

import Link from "next/link";
import Image from "next/image";

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

  return (
    <article className="relative rounded-2xl border border-divider bg-surface p-5">
      <span
        className="absolute right-3 top-3 inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: coach.accepting_clients === false ? "#EF4444" : "#22C55E" }}
        title={coach.accepting_clients === false ? "Not accepting clients" : "Accepting clients"}
      />
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-divider bg-surface-2">
          {coach.avatar_url ? <Image src={coach.avatar_url} alt="" fill sizes="48px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{coach.display_name || coach.username}</h3>
          <p className="text-xs text-faint">@{coach.username}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-200">
            {tag}
          </span>
        ))}
        {extra > 0 ? <span className="rounded-full border border-divider px-2 py-0.5 text-[11px] text-faint">+{extra} more</span> : null}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">{coach.bio || "Coach profile"}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-faint">
        <span>⭐ {coach.stats?.average_rating ?? 0}</span>
        <span>{coach.stats?.students ?? 0} students</span>
        <span>{coach.stats?.programs ?? 0} programs</span>
      </div>

      <Link href={`/${locale}/coaches/${encodeURIComponent(coach.username)}`} className="mt-4 inline-flex rounded-full border border-divider px-3 py-1.5 text-xs text-bright">
        View Profile
      </Link>
    </article>
  );
}
