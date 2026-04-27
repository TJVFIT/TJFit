"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "playing" | "error";

const audioCache = new Map<string, string>();

export function SpeakerButton({ text, autoplay = false }: { text: string; autoplay?: boolean }) {
  const [state, setState] = useState<State>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayedRef = useRef(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = async () => {
    if (state === "loading" || state === "playing") {
      audioRef.current?.pause();
      audioRef.current = null;
      setState("idle");
      return;
    }

    setState("loading");
    try {
      let url = audioCache.get(text);
      if (!url) {
        const res = await fetch("/api/tjai/tts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error(`tts ${res.status}`);
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        audioCache.set(text, url);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    if (!autoplay || autoplayedRef.current) return;
    if (!text || text.trim().length < 2) return;
    autoplayedRef.current = true;
    void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, text]);

  return (
    <button
      type="button"
      onClick={play}
      title={state === "playing" ? "Stop" : "Listen"}
      aria-label={state === "playing" ? "Stop audio" : "Play audio"}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-cyan-300/40 hover:text-cyan-300"
    >
      {state === "loading" ? (
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
      ) : state === "playing" ? (
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
          <rect x="2" y="2" width="3" height="8" rx="0.5" />
          <rect x="7" y="2" width="3" height="8" rx="0.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden>
          <path d="M2 4.5v3h2L7 10V2L4 4.5H2Z" />
          <path d="M8.5 4.2c.6.5 1 1.1 1 1.8s-.4 1.3-1 1.8" stroke="currentColor" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
