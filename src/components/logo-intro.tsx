"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/ui/Logo";
import { LOCALE_META, supportedLocales, type Locale, type SupportedLocale } from "@/lib/i18n";

const SESSION_SKIP_KEY = "tj-fit-logo-intro-skip-session";
const PHASE_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

type Phase =
  | "hidden"
  | "t"
  | "tj"
  | "fit"
  | "man"
  | "hold"
  | "languages"
  | "exit";

const PICKER_TITLE: Record<Locale, string> = {
  en: "Choose your language",
  tr: "Dilinizi seçin",
  ar: "اختر لغتك",
  es: "Elige tu idioma",
  fr: "Choisissez votre langue"
};

/** ~1100ms automated brand runway before language picker (premium ease, no abrupt snap). */
const TIMINGS_MS = {
  t: 50,
  tj: 180,
  fit: 320,
  man: 420,
  hold: 560,
  languages: 740
} as const;

export function LogoIntro({
  locale,
  onComplete
}: {
  locale: Locale;
  onComplete: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${locale}`;
  const [phase, setPhase] = useState<Phase>("hidden");
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_SKIP_KEY) === "1") {
        queueMicrotask(() => {
          setDone(true);
          onComplete();
        });
        return;
      }
    } catch {}

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => {
        setDone(true);
        try {
          sessionStorage.setItem(SESSION_SKIP_KEY, "1");
        } catch {}
        onComplete();
      }, 160);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("t"), TIMINGS_MS.t));
    timers.push(window.setTimeout(() => setPhase("tj"), TIMINGS_MS.tj));
    timers.push(window.setTimeout(() => setPhase("fit"), TIMINGS_MS.fit));
    timers.push(window.setTimeout(() => setPhase("man"), TIMINGS_MS.man));
    timers.push(window.setTimeout(() => setPhase("hold"), TIMINGS_MS.hold));
    timers.push(window.setTimeout(() => setPhase("languages"), TIMINGS_MS.languages));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "hidden" || phase === "exit" || phase === "languages") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const nodeCount = W < 768 ? 14 : 24;
    type Node = { x: number; y: number; vx: number; vy: number; alpha: number };
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: W * 0.2 + Math.random() * W * 0.6,
      y: H * 0.15 + Math.random() * H * 0.7,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: 0.08 + Math.random() * 0.32
    }));

    const maxDist = 190;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${(1 - dist / maxDist) * 0.28})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + n.x);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${n.alpha * pulse})`;
        ctx.fill();
      }
      frame++;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  const finish = () => {
    setPhase("exit");
    window.setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem(SESSION_SKIP_KEY, "1");
      } catch {}
      onComplete();
    }, 320);
  };

  const handleLanguagePick = (picked: SupportedLocale) => {
    if (picked === locale) {
      finish();
      return;
    }
    try {
      document.cookie = `NEXT_LOCALE=${picked}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
    const rest = pathname.startsWith(`/${locale}`) ? pathname.slice(`/${locale}`.length) : "";
    finish();
    router.replace(`/${picked}${rest || ""}`);
  };

  if (done) return null;

  const showT = phase !== "hidden" && phase !== "exit" && phase !== "languages";
  const showJ = ["tj", "fit", "man", "hold"].includes(phase);
  const showFit = ["fit", "man", "hold"].includes(phase);
  const showImage = phase === "man" || phase === "hold";
  const showLangs = phase === "languages";
  const isExiting = phase === "exit";

  return (
    <div
      className="tj-intro-root fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? `opacity 340ms ${PHASE_EASE}` : "none"
      }}
      aria-hidden={done}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          opacity: showT && !showLangs ? 0.8 : 0,
          transition: `opacity ${showLangs ? 280 : 360}ms ${PHASE_EASE}`
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: showT
            ? "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.03) 50%, transparent 70%)"
            : "transparent",
          transition: `background ${showLangs ? 240 : 360}ms ${PHASE_EASE}`
        }}
      />
      <div className="tj-intro-scan pointer-events-none absolute inset-0" aria-hidden />
      <div className="tj-intro-vignette pointer-events-none absolute inset-0" aria-hidden />

      {!showLangs ? (
        <div className="relative flex w-full max-w-3xl flex-col items-center px-6">
          <div className="tj-intro-orbit absolute left-1/2 top-1/2 h-[min(58vw,520px)] w-[min(58vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden />
          <div className="tj-intro-orbit tj-intro-orbit--inner absolute left-1/2 top-1/2 h-[min(42vw,380px)] w-[min(42vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden />

          <div className="relative flex items-center justify-center" style={{ minHeight: "clamp(190px, 32vw, 340px)" }}>
            <div
              className="tj-intro-logo-shell absolute flex items-center justify-center rounded-[2rem] border border-white/[0.08] bg-white/[0.025] backdrop-blur-md"
              style={{
                opacity: showImage ? 1 : 0,
                transform: showImage ? "scale(1) translateY(0)" : "scale(0.92) translateY(14px)",
                transition: `opacity 460ms ${PHASE_EASE}, transform 500ms ${PHASE_EASE}`
              }}
              aria-hidden
            >
              <Logo variant="full" size="hero" linked={false} glow animated className="scale-[1.42] sm:scale-[1.74]" />
            </div>
            <span
              className="font-display font-black leading-none tracking-tight text-accent"
              style={{
                fontSize: "clamp(90px, 15vw, 160px)",
                opacity: showImage ? 0 : showT ? 1 : 0,
                transform: showT ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
                transition: `opacity 360ms ${PHASE_EASE}, transform 380ms ${PHASE_EASE}`,
                textShadow: "0 0 24px rgba(34,211,238,0.6), 0 0 72px rgba(34,211,238,0.25)"
              }}
            >
              T
            </span>
            <span
              className="font-display font-black leading-none tracking-tight text-accent"
              style={{
                fontSize: "clamp(90px, 15vw, 160px)",
                opacity: showImage ? 0 : showJ ? 1 : 0,
                transform: showJ ? "translateY(0) scale(1)" : "translateY(36px) scale(0.95)",
                transition: `opacity 400ms ${PHASE_EASE}, transform 440ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
                textShadow: "0 0 24px rgba(34,211,238,0.6), 0 0 72px rgba(34,211,238,0.25)",
                marginInlineStart: "-0.04em"
              }}
            >
              J
            </span>
          </div>

          <div className="relative -mt-6 flex items-center justify-center">
            <span
              className="font-display font-semibold uppercase tracking-[0.28em] text-accent"
              style={{
                fontSize: "clamp(18px, 2.6vw, 28px)",
                opacity: showFit && !showImage ? 1 : 0,
                transform: showFit ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 320ms ${PHASE_EASE}, transform 320ms ${PHASE_EASE}`,
                textShadow: "0 0 18px rgba(34,211,238,0.4)"
              }}
            >
              FIT
            </span>
          </div>

          <div className="mt-10 grid w-full max-w-xl gap-2 text-left sm:grid-cols-3">
            {["loading brand system", "syncing locale", "opening platform"].map((line, index) => (
              <div
                key={line}
                className="tj-intro-status rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                style={{
                  opacity: showT ? 1 : 0,
                  transform: showT ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 320ms ${PHASE_EASE} ${index * 60}ms, transform 320ms ${PHASE_EASE} ${index * 60}ms`
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{
          opacity: showLangs ? 1 : 0,
          pointerEvents: showLangs ? "auto" : "none",
          transform: showLangs ? "translateY(0) scale(1)" : "translateY(12px)",
          transition: `opacity 320ms ${PHASE_EASE}, transform 340ms ${PHASE_EASE}`
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          TJFit
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {PICKER_TITLE[locale]}
        </h1>
        <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {supportedLocales.map((code) => {
            const info = LOCALE_META[code];
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguagePick(code)}
                className={`group flex min-h-[74px] flex-col items-start justify-center rounded-[18px] border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-200 hover:scale-[1.02] motion-reduce:transform-none ${
                  active
                    ? "border-accent/40 bg-accent/10 text-white"
                    : "border-[var(--color-border)] bg-[rgba(17,18,21,0.6)] text-[var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.18)] hover:text-white"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  {info.label}
                </span>
                <span className="mt-1 text-lg font-semibold">{info.native}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-8 max-w-sm text-center text-xs text-[var(--color-text-muted)]">
          You can change your language later in Profile &gt; Settings &gt; Region.
        </p>
      </div>
    </div>
  );
}
