"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BRAND_LOGO_SRC } from "@/lib/brand-assets";
import { locales, type Locale } from "@/lib/i18n";

type Phase =
  | "hidden"
  | "t"
  | "tj"
  | "fit"
  | "man"
  | "hold"
  | "languages"
  | "exit";

const LANG_LABELS: Record<Locale, { name: string; native: string }> = {
  en: { name: "English", native: "English" },
  tr: { name: "Turkish", native: "Türkçe" },
  ar: { name: "Arabic", native: "العربية" },
  es: { name: "Spanish", native: "Español" },
  fr: { name: "French", native: "Français" }
};

const PICKER_TITLE: Record<Locale, string> = {
  en: "Choose your language",
  tr: "Dilinizi seçin",
  ar: "اختر لغتك",
  es: "Elige tu idioma",
  fr: "Choisissez votre langue"
};

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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => {
        setDone(true);
        onComplete();
      }, 200);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("t"), 80));
    timers.push(window.setTimeout(() => setPhase("tj"), 620));
    timers.push(window.setTimeout(() => setPhase("fit"), 1180));
    timers.push(window.setTimeout(() => setPhase("man"), 1680));
    timers.push(window.setTimeout(() => setPhase("hold"), 2380));
    timers.push(window.setTimeout(() => setPhase("languages"), 3000));
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
      onComplete();
    }, 520);
  };

  const handleLanguagePick = (picked: Locale) => {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0A0A0B]"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? "opacity 520ms cubic-bezier(0.4,0,1,1)" : "none"
      }}
      aria-hidden={done}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          opacity: showT && !showLangs ? 0.8 : 0,
          transition: "opacity 500ms ease"
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: showT
            ? "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.03) 50%, transparent 70%)"
            : "transparent",
          transition: "background 600ms ease"
        }}
      />

      {!showLangs ? (
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-end justify-center" style={{ minHeight: "clamp(120px, 22vw, 220px)" }}>
            <span
              className="font-display font-black leading-none tracking-tight text-accent"
              style={{
                fontSize: "clamp(120px, 22vw, 220px)",
                opacity: showT ? 1 : 0,
                transform: showT ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 480ms cubic-bezier(0.16,1,0.3,1), transform 480ms cubic-bezier(0.16,1,0.3,1)",
                textShadow: "0 0 24px rgba(34,211,238,0.6), 0 0 72px rgba(34,211,238,0.25)"
              }}
            >
              T
            </span>
            <span
              className="font-display font-black leading-none tracking-tight text-accent"
              style={{
                fontSize: "clamp(120px, 22vw, 220px)",
                opacity: showJ ? 1 : 0,
                transform: showJ ? "translateY(0)" : "translateY(64px)",
                transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 560ms cubic-bezier(0.22,1,0.36,1)",
                textShadow: "0 0 24px rgba(34,211,238,0.6), 0 0 72px rgba(34,211,238,0.25)",
                marginInlineStart: "-0.04em"
              }}
            >
              J
            </span>
          </div>

          <div className="relative mt-2 flex items-center justify-center">
            <span
              className="font-display font-semibold uppercase tracking-[0.22em] text-accent"
              style={{
                fontSize: "clamp(28px, 4.4vw, 44px)",
                opacity: showFit && !showImage ? 1 : 0,
                transform: showFit ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 420ms cubic-bezier(0.16,1,0.3,1), transform 420ms cubic-bezier(0.16,1,0.3,1)",
                textShadow: "0 0 18px rgba(34,211,238,0.4)"
              }}
            >
              FIT
            </span>
          </div>

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              opacity: showImage ? 1 : 0,
              transform: showImage ? "scale(1)" : "scale(0.92)",
              transition: "opacity 620ms cubic-bezier(0.16,1,0.3,1), transform 620ms cubic-bezier(0.16,1,0.3,1)"
            }}
            aria-hidden
          >
            <Image
              src={BRAND_LOGO_SRC}
              alt=""
              width={1024}
              height={836}
              priority
              style={{
                height: "clamp(180px, 30vw, 320px)",
                width: "auto",
                filter: [
                  "drop-shadow(0 0 8px rgba(34,211,238,1))",
                  "drop-shadow(0 0 25px rgba(34,211,238,0.8))",
                  "drop-shadow(0 0 60px rgba(34,211,238,0.45))"
                ].join(" ")
              }}
            />
          </div>
        </div>
      ) : null}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{
          opacity: showLangs ? 1 : 0,
          pointerEvents: showLangs ? "auto" : "none",
          transition: "opacity 420ms cubic-bezier(0.16,1,0.3,1)"
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          TJFit
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {PICKER_TITLE[locale]}
        </h1>
        <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
          {locales.map((code) => {
            const info = LANG_LABELS[code];
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguagePick(code)}
                className={`group flex min-h-[64px] flex-col items-start justify-center rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-200 hover:scale-[1.02] ${
                  active
                    ? "border-accent/40 bg-accent/10 text-white"
                    : "border-[var(--color-border)] bg-[rgba(17,18,21,0.6)] text-[var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.18)] hover:text-white"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  {info.name}
                </span>
                <span className="mt-1 text-lg font-semibold">{info.native}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-8 max-w-sm text-center text-xs text-[var(--color-text-muted)]">
          You can change your language later in Profile → Settings → Region.
        </p>
      </div>
    </div>
  );
}
