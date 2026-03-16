import Link from "next/link";
import { Activity, BadgeCheck, Dumbbell, Globe2, ShieldCheck, Sparkles } from "lucide-react";

import { LiveProof } from "@/components/live-proof";
import { FadeIn, HoverLift } from "@/components/motion";
import {
  ChallengeCard,
  CoachCard,
  CommunityPostCard,
  ProductCard,
  ProgramCard,
  SectionHeading,
  TransformationCard
} from "@/components/ui";
import {
  challenges,
  coachCategories,
  coaches,
  communityPosts,
  liveActivity,
  liveProofNotifications,
  products,
  programs,
  testimonials,
  transformations
} from "@/lib/content";
import { Locale, getDictionary, isLocale } from "@/lib/i18n";

const icons = [Dumbbell, Activity, Sparkles];

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="mesh-grid">
      <section className="relative overflow-hidden">
        <div className="hero-orb left-0 top-20 h-72 w-72 bg-blue-500/30" />
        <div className="hero-orb bottom-10 right-10 h-80 w-80 bg-cyan-400/20" />

        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <FadeIn className="space-y-8">
            <span className="badge">{dict.hero.badge}</span>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {dict.hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">{dict.hero.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/coaches`}
                className="gradient-button rounded-full px-6 py-3 text-sm font-medium text-white"
              >
                {dict.hero.primaryCta}
              </Link>
              <Link
                href={`/${locale}/become-a-coach`}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
              >
                {dict.hero.secondaryCta}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Certified coaches", value: "150+" },
                { label: "Languages", value: "5" },
                { label: "Countries reached", value: "12+" }
              ].map((item) => (
                <div key={item.label} className="glass-panel rounded-[24px] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <LiveProof notifications={liveProofNotifications} />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="glass-panel relative overflow-hidden rounded-[36px] p-6">
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Live athlete session", meta: "Daily.co ready" },
                    { title: "Global bookings", meta: "PayTR checkout" },
                    { title: "Coach leaderboard", meta: "Bronze to Elite" },
                    { title: "Referral loop", meta: "Invite and earn credit" }
                  ].map((card, index) => {
                    const Icon = icons[index % icons.length];
                    return (
                      <HoverLift key={card.title}>
                        <div className="rounded-[24px] border border-white/10 bg-black/30 p-5">
                          <Icon className="h-9 w-9 text-accent" />
                          <p className="mt-6 text-lg font-semibold text-white">{card.title}</p>
                          <p className="mt-2 text-sm text-zinc-400">{card.meta}</p>
                        </div>
                      </HoverLift>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{dict.common.socialProof}</p>
                      <p className="mt-2 text-xl font-semibold text-white">High-conversion social proof layer</p>
                    </div>
                    <Globe2 className="h-8 w-8 text-cyan-300" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {liveActivity.map((activity) => (
                      <div key={activity} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A simple user flow designed to convert."
          copy="The experience is intentionally clean: discovery, booking, coaching, and progress tracking without unnecessary steps."
          align="center"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {dict.steps.map((step, index) => {
            const Icon = [BadgeCheck, ShieldCheck, Sparkles][index];
            return (
              <FadeIn key={step} delay={index * 0.1}>
                <div className="glass-panel rounded-[28px] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-8 text-xl font-semibold text-white">{step}</p>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Premium discovery and onboarding designed for speed, trust, and a polished first impression.
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categories"
          title="Coaching across every high-value vertical."
          copy="From fat loss to rehabilitation, TJFit is designed to scale into a trusted global marketplace."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {coachCategories.map((category, index) => (
            <FadeIn key={category} delay={index * 0.05}>
              <div className="glass-panel rounded-[24px] p-5 transition hover:border-accent/40">
                <p className="text-lg font-medium text-white">{category}</p>
                <p className="mt-3 text-sm text-zinc-400">
                  Premium discovery, trust-building profiles, and high-intent booking flow.
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={dict.common.featuredCoaches}
          title="Top coaches with premium profile experiences."
          copy="Cards are designed for quick trust: ratings, specialties, languages, and clear pricing."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {coaches.map((coach) => (
            <CoachCard key={coach.slug} coach={coach} href={`/${locale}/coaches/${coach.slug}`} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={dict.common.marketplace}
              title="Sell coaching programs with clean storefront UX."
              copy="Program pages are structured for conversion with duration, difficulty, previews, and direct checkout."
            />
            <div className="mt-10 grid gap-5">
              {programs.slice(0, 2).map((program) => (
                <ProgramCard key={program.slug} program={program} href={`/${locale}/programs/${program.slug}`} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow={dict.common.equipment}
              title="Add a lightweight commerce layer."
              copy="The store is built to support recovery and training equipment without slowing the main coaching flow."
            />
            <div className="mt-10 grid gap-5">
              {products.slice(0, 2).map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Transformation Engine"
          title="Public proof that powers trust and virality."
          copy="Transformation pages, community voting, coach verification, and share flows turn client wins into platform growth."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {transformations.slice(0, 2).map((transformation) => (
            <TransformationCard
              key={transformation.slug}
              transformation={transformation}
              href={`/${locale}/transformations/${transformation.slug}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={dict.common.testimonials}
          title="Trust signals everywhere."
          copy="Testimonials, live activity, and coach quality cues create the startup-level confidence needed to convert new visitors."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={testimonial.name} delay={index * 0.08}>
              <div className="glass-panel rounded-[28px] p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">{testimonial.name}</p>
                <p className="mt-6 text-lg leading-8 text-zinc-200">&quot;{testimonial.quote}&quot;</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Challenges"
              title="Transformation challenges drive recurring engagement."
              copy="Users stay active through weekly progress posts, challenge rewards, and leaderboard movement."
            />
            <div className="mt-10 space-y-5">
              {challenges.slice(0, 2).map((challenge) => (
                <ChallengeCard key={challenge.slug} challenge={challenge} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Community"
              title="A fitness social network inside the platform."
              copy="Workouts, questions, progress posts, coach replies, and share-ready moments increase retention and referrals."
            />
            <div className="mt-10 space-y-5">
              {communityPosts.slice(0, 2).map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-[36px] px-6 py-12 text-center sm:px-10">
          <SectionHeading
            eyebrow="CTA"
            title={dict.cta.title}
            copy={dict.cta.subtitle}
            align="center"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/checkout`} className="gradient-button rounded-full px-6 py-3 text-sm font-medium text-white">
              {dict.cta.button}
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
