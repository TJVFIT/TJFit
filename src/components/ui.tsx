import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { BRAND } from "@/lib/brand-assets";
import { HoverLift } from "@/components/motion";
import { Challenge, Coach, CommunityPost, Product, Program, Transformation } from "@/lib/content";
import { cn } from "@/lib/utils";

function getProgramVisual(program: Program) {
  const category = program.category.toLowerCase();
  if (category.includes("nutrition")) {
    return {
      gradient: "from-emerald-400/25 via-teal-400/15 to-cyan-400/25",
      ring: "border-emerald-300/20",
      tag: "NUTRITION"
    };
  }
  if (category.includes("fat")) {
    return {
      gradient: "from-orange-400/25 via-rose-400/15 to-red-400/25",
      ring: "border-orange-300/20",
      tag: "FAT LOSS"
    };
  }
  if (category.includes("muscle") || category.includes("mass")) {
    return {
      gradient: "from-violet-400/25 via-fuchsia-400/15 to-indigo-400/25",
      ring: "border-violet-300/20",
      tag: "MUSCLE"
    };
  }
  return {
    gradient: "from-cyan-400/25 via-blue-400/15 to-indigo-400/25",
    ring: "border-cyan-300/20",
    tag: "PERFORMANCE"
  };
}

function getProgramTier(program: Program) {
  const slug = program.slug.toLowerCase();
  if (slug.includes("advanced") || slug.includes("hardcore")) return "Elite";
  if (slug.includes("pro") || slug.includes("shred")) return "Popular";
  if (slug.includes("starter") || slug.includes("beginner")) return "New";
  return "Signature";
}

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
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
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
            <Star className="h-4 w-4 fill-current text-yellow-400" />
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

export function ProgramCard({
  program,
  href,
  viewLabel = "View Program",
  priceLabel,
  tierLabel
}: {
  program: Program;
  href?: string;
  viewLabel?: string;
  priceLabel?: string;
  tierLabel?: string;
}) {
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  return (
    <HoverLift>
      <div
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-6 shadow-[0_24px_56px_-32px_rgba(0,0,0,0.7)]",
          visual.ring
        )}
      >
        <div className={cn("rounded-xl border border-white/[0.08] bg-gradient-to-br p-5", visual.gradient)}>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-zinc-200/90">
            <span>{visual.tag}</span>
            <span className="rounded-full border border-white/20 px-2.5 py-1 font-semibold text-white">{tier}</span>
          </div>
          <p className="mt-8 text-2xl font-semibold text-white">{program.title}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-200/80">{program.duration}</p>
          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-200/90">
            <span className="inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND.logoMark} alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain" />
              TJFit Program
            </span>
            <span>{priceLabel ?? program.price}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
            {program.category}
          </span>
          <span className="text-sm text-zinc-400">{program.duration}</span>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">{program.title}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{program.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{program.difficulty}</p>
            <p className="mt-1 text-sm text-zinc-300">{priceLabel ?? program.price}</p>
          </div>
          {href ? (
            <Link
              href={href}
              className="lux-btn-secondary rounded-full px-4 py-2 text-sm font-medium text-zinc-100"
            >
              {viewLabel}
            </Link>
          ) : (
            <button
              type="button"
              className="lux-btn-secondary rounded-full px-4 py-2 text-sm font-medium text-zinc-100"
            >
              {viewLabel}
            </button>
          )}
        </div>
      </div>
    </HoverLift>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <HoverLift>
      <div className="glass-panel rounded-[28px] p-6">
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
          <div className="aspect-[4/3] rounded-[20px] border border-dashed border-white/10 bg-black/30" />
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
        <div key={stat.label} className="glass-panel rounded-[24px] p-5">
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
      <Link href={href} className="glass-panel block rounded-[28px] p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1.3fr_1fr]">
          <div className="rounded-[24px] border border-dashed border-white/10 bg-black/30 p-6 text-center text-xs uppercase tracking-[0.24em] text-zinc-500">
            Before
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{transformation.category}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{transformation.userName}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{transformation.story}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {transformation.measurements.map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-dashed border-white/10 bg-black/30 p-6 text-center text-xs uppercase tracking-[0.24em] text-zinc-500">
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
      <div className="glass-panel rounded-[28px] p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
            {challenge.category}
          </span>
          <span className="text-sm text-zinc-400">{challenge.duration}</span>
        </div>
        <p className="mt-5 text-2xl font-semibold text-white">{challenge.name}</p>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{challenge.description}</p>
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
    <div className="glass-panel rounded-[28px] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-white">{post.author}</p>
          <p className="text-sm text-zinc-400">{post.role}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
          {post.likes} likes
        </span>
      </div>
      <p className="mt-5 text-sm leading-7 text-zinc-200">{post.content}</p>
      {post.coachReply ? (
        <div className="mt-5 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
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
