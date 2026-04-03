import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { HoverLift } from "@/components/motion";
import { Challenge, Coach, CommunityPost, Product, Transformation } from "@/lib/content";
import { cn } from "@/lib/utils";

export { ProgramCard } from "@/components/program-card";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  copy: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center")}>
      <span className="lux-badge inline-flex">{eyebrow}</span>
      <h2 className="tj-section-title sm:text-4xl">{title}</h2>
      <p className="section-copy">{copy}</p>
    </div>
  );
}

export function CoachCard({ coach, href }: { coach: Coach; href: string }) {
  return (
    <HoverLift>
      <Link href={href} className="glass-panel block rounded-[28px] p-6 transition">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/80 to-cyan-300/80 text-lg font-semibold text-white">
              {coach.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-white">{coach.name}</p>
              <p className="text-sm text-zinc-400">{coach.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm text-zinc-200">
            <Star className="h-4 w-4 fill-current text-cyan-300" />
            {coach.rating}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {coach.languages.map((language) => (
            <span key={language} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
              {language}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div />
          <span className="inline-flex items-center gap-2 text-sm text-zinc-200">
            View profile <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </HoverLift>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <HoverLift>
      <div className="glass-panel p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
          <div className="aspect-[4/3] rounded-2xl border border-dashed border-white/10 bg-black/30" />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">{product.name}</p>
            <p className="mt-2 text-sm text-zinc-400">{product.description}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
            {product.category}
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div />
          <button className="gradient-button rounded-full px-4 py-2 text-sm font-medium text-white">
            Add to cart
          </button>
        </div>
      </div>
    </HoverLift>
  );
}

export function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{stat.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function TransformationCard({
  transformation,
  href
}: {
  transformation: Transformation;
  href: string;
}) {
  return (
    <HoverLift>
      <Link href={href} className="glass-panel block p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1.3fr_1fr]">
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
            Before
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{transformation.category}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{transformation.userName}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{transformation.story}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {transformation.measurements.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-xs text-zinc-300 shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
            After
          </div>
        </div>
      </Link>
    </HoverLift>
  );
}

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <HoverLift>
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-zinc-400">
            {challenge.category}
          </span>
          <span className="text-sm text-zinc-400">{challenge.duration}</span>
        </div>
        <p className="mt-5 text-2xl font-semibold text-white">{challenge.name}</p>
        <p className="mt-3 text-sm leading-[1.65] text-zinc-400">{challenge.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
          <span className="text-zinc-300">{challenge.participants} participants</span>
          <span className="text-white">{challenge.reward}</span>
        </div>
      </div>
    </HoverLift>
  );
}

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-white">{post.author}</p>
          <p className="text-sm text-zinc-400">{post.role}</p>
        </div>
        <span className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-zinc-400">
          {post.likes} likes
        </span>
      </div>
      <p className="mt-5 text-sm leading-[1.65] text-zinc-200">{post.content}</p>
      {post.coachReply ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          Coach reply: {post.coachReply}
        </div>
      ) : null}
      <div className="mt-5 flex items-center gap-4 text-sm text-zinc-400">
        <span>{post.comments} comments</span>
        <span>Share to Instagram / TikTok / X / WhatsApp</span>
      </div>
    </div>
  );
}
