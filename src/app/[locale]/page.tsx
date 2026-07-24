import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  ShieldCheck
} from "lucide-react";

import { Reveal } from "@/components/motion";
import { GlareCard } from "@/components/ui/glare-card";
import { GlowingInput } from "@/components/ui/glowing-input";
import { LayeredText } from "@/components/ui/layered-text";
import { RobotScene } from "@/components/ui/robot-scene";
import TubesCursor from "@/components/ui/tubes-cursor";
import { programs } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";

const englishCopy = {
  eyebrow: "The intelligent fitness system",
  titleA: "Train the body.",
  titleB: "Teach the system.",
  summary:
    "TJFit turns your goal, schedule and training reality into a clear path—then helps you keep moving when motivation gets noisy.",
  primary: "Build my plan",
  secondary: "Explore programs",
  robotLabel: "TJ / training unit 01",
  robotNote: "Interactive strength model",
  manifestoEyebrow: "A system, not a streak",
  manifestoTitle: "Progress should feel inevitable.",
  manifestoCopy:
    "Good training removes guesswork. TJFit brings programs, nutrition, coaching and intelligent guidance into one calm operating system for your body.",
  programsEyebrow: "Built plans",
  programsTitle: "Choose less. Execute better.",
  programsCopy:
    "Every TJFit program is structured across twelve weeks with clear progression, recovery direction and practical constraints.",
  viewProgram: "Open program",
  aiEyebrow: "TJAI / adaptive guidance",
  aiTitle: "Ask a better question. Get a usable next step.",
  aiCopy:
    "Start with the safety-gated fitness quiz, then let TJAI explain your match in plain language. No black-box health claims.",
  aiCta: "Open TJAI",
  closing: "The next rep is a decision.",
  closingCopy: "Make it with a plan built around your real life.",
  start: "Start with TJFit"
};

const copyByLocale: Record<Locale, typeof englishCopy> = {
  en: englishCopy,
  tr: {
    eyebrow: "Akıllı fitness sistemi",
    titleA: "Vücudu çalıştır.",
    titleB: "Sistemi öğret.",
    summary:
      "TJFit hedefini, programını ve gerçek antrenman koşullarını net bir yola dönüştürür; motivasyon düştüğünde bile ilerlemene yardım eder.",
    primary: "Planımı oluştur",
    secondary: "Programları keşfet",
    robotLabel: "TJ / antrenman ünitesi 01",
    robotNote: "Etkileşimli güç modeli",
    manifestoEyebrow: "Seri değil, sistem",
    manifestoTitle: "İlerleme kaçınılmaz hissettirmeli.",
    manifestoCopy:
      "İyi antrenman tahmini ortadan kaldırır. TJFit programları, beslenmeyi, koçluğu ve akıllı yönlendirmeyi vücudun için sakin bir işletim sisteminde birleştirir.",
    programsEyebrow: "Hazır planlar",
    programsTitle: "Daha az seç. Daha iyi uygula.",
    programsCopy:
      "Her TJFit programı; net ilerleme, toparlanma yönlendirmesi ve gerçek hayat koşullarıyla on iki haftaya yapılandırılır.",
    viewProgram: "Programı aç",
    aiEyebrow: "TJAI / uyarlanabilir rehberlik",
    aiTitle: "Daha iyi sor. Uygulanabilir bir sonraki adımı al.",
    aiCopy:
      "Güvenlik kontrollü fitness testiyle başla; TJAI eşleşmeni açık ve anlaşılır biçimde anlatsın.",
    aiCta: "TJAI’yi aç",
    closing: "Sıradaki tekrar bir karar.",
    closingCopy: "Bu kararı gerçek hayatına göre hazırlanmış bir planla ver.",
    start: "TJFit ile başla"
  },
  ar: englishCopy,
  es: englishCopy,
  fr: englishCopy
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return null;

  const locale = localeParam as Locale;
  const copy = copyByLocale[locale];
  const featuredPrograms = [
    programs.find((program) => program.slug === "home-fat-burn-accelerator-12w") ?? programs[0],
    programs.find((program) => program.slug === "strength-and-size-blueprint-12w") ?? programs[1]
  ];

  return (
    <>
      <section className="relative isolate min-h-[calc(100dvh-4.75rem)] overflow-hidden">
        <div className="hairline-grid absolute inset-0 -z-20" />
        <div className="absolute inset-y-0 right-0 -z-10 w-full opacity-55 lg:w-[62%]">
          <TubesCursor />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050a16_0%,rgba(5,10,22,0.94)_38%,rgba(5,10,22,0.22)_75%,#050a16_100%)]" />

        <div className="page-shell grid min-h-[calc(100dvh-4.75rem)] items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
          <div className="relative z-10 pb-4 pt-8 lg:py-16">
            <Reveal>
              <span className="badge">{copy.eyebrow}</span>
              <h1 className="mt-7 max-w-[11ch] font-display text-[clamp(3.3rem,7vw,7.2rem)] font-semibold leading-[0.83] tracking-[-0.072em] text-white">
                {copy.titleA}
                <span className="mt-2 block text-zinc-500">{copy.titleB}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 max-w-[57ch] text-base leading-8 text-zinc-300 sm:text-lg">
                {copy.summary}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/ai`}
                  className="gradient-button inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold"
                >
                  {copy.primary}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={`/${locale}/programs`}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-medium text-zinc-200 shadow-inset transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  {copy.secondary}
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal className="relative min-h-[33rem] lg:min-h-[42rem]" delay={0.08}>
            <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-[#071126]/42 shadow-inset backdrop-blur-sm">
              <div className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-soft">
                {copy.robotLabel}
              </div>
              <div className="absolute right-5 top-5 z-10 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:flex">
                <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-accent-soft" />
                {copy.robotNote}
              </div>
              <RobotScene className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050a16] to-transparent" />
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
            {[
              ["29", "typed training systems"],
              ["05", "supported languages"],
              ["12W", "structured progressions"],
              ["01", "adaptive plan for you"]
            ].map(([value, label]) => (
              <div key={label} className="bg-[#071126]/95 px-5 py-5">
                <p className="font-mono text-xl font-bold tabular-nums text-white">{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-24 sm:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <span className="badge">{copy.manifestoEyebrow}</span>
            <h2 className="section-title mt-6">{copy.manifestoTitle}</h2>
            <p className="section-copy mt-6">{copy.manifestoCopy}</p>
            <div className="mt-9 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {[
                [Activity, "Train"],
                [ChartNoAxesCombined, "Track"],
                [BrainCircuit, "Adapt"]
              ].map(([Icon, label]) => {
                const Glyph = Icon as typeof Activity;
                return (
                  <div key={label as string} className="flex items-center gap-2 text-xs text-zinc-400">
                    <Glyph className="h-4 w-4 text-accent-soft" aria-hidden />
                    {label as string}
                  </div>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <LayeredText />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#071126]/55 py-24 sm:py-32">
        <div className="page-shell">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <span className="badge">{copy.programsEyebrow}</span>
                <h2 className="section-title mt-6">{copy.programsTitle}</h2>
              </div>
              <p className="section-copy lg:justify-self-end">{copy.programsCopy}</p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            {featuredPrograms.map((program, index) => (
              <Reveal key={program.slug} delay={index * 0.1}>
                <GlareCard className={index === 0 ? "min-h-[29rem]" : "min-h-[25rem] lg:mt-16"}>
                  <Link
                    href={`/${locale}/programs/${program.slug}`}
                    className="relative flex h-full min-h-[inherit] flex-col justify-between p-7 sm:p-9"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
                          {String(index + 1).padStart(2, "0")} / program
                        </span>
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                          {program.category}
                        </span>
                      </div>
                      <h3 className="mt-16 max-w-[13ch] font-display text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl">
                        {program.title}
                      </h3>
                      <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">{program.description}</p>
                    </div>
                    <div className="mt-12 flex items-end justify-between border-t border-white/10 pt-6">
                      <div>
                        <p className="font-mono text-lg font-bold tabular-nums text-white">{program.price} TRY</p>
                        <p className="mt-1 text-xs text-zinc-500">{program.duration}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                        {copy.viewProgram} <ArrowRight className="h-4 w-4 text-accent-soft" />
                      </span>
                    </div>
                  </Link>
                </GlareCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-24 sm:py-32">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.09] bg-[#08142c] p-6 shadow-inset sm:p-10 lg:p-14">
          <div className="hairline-grid absolute inset-0 opacity-50" />
          <div className="relative grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <Reveal>
              <span className="badge">{copy.aiEyebrow}</span>
              <h2 className="section-title mt-6">{copy.aiTitle}</h2>
              <p className="section-copy mt-6">{copy.aiCopy}</p>
              <div className="mt-7 flex items-center gap-3 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-accent-soft" aria-hidden />
                Safety gate before recommendations
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="rounded-[2rem] border border-white/10 bg-[#050a16]/78 p-4 shadow-inset sm:p-6">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">TJAI console</p>
                    <p className="mt-2 text-sm text-zinc-400">Personalized guidance / beta</p>
                  </div>
                  <span className="h-2 w-2 animate-pulseSoft rounded-full bg-accent-soft" />
                </div>
                <GlowingInput />
                <div className="mt-5 flex justify-end">
                  <Link href={`/${locale}/ai`} className="inline-flex items-center gap-2 text-sm text-white">
                    {copy.aiCta} <ArrowRight className="h-4 w-4 text-accent-soft" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-shell pb-10 pt-14 sm:pt-24">
        <Reveal>
          <div className="grid items-end gap-8 border-t border-white/10 pt-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="max-w-[12ch] font-display text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-white sm:text-7xl">
                {copy.closing}
              </p>
              <p className="mt-5 text-base text-zinc-400">{copy.closingCopy}</p>
            </div>
            <Link
              href={`/${locale}/signup`}
              className="gradient-button inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold"
            >
              {copy.start} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
