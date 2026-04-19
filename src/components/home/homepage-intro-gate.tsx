"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import IntroAnimation from "@/components/intro-animation";

const INTRO_STORAGE_KEY = "tjfit_intro_seen";

type IntroState = "pending" | "playing" | "done";

export function HomepageIntroGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [introState, setIntroState] = useState<IntroState>("pending");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let seen = false;
    let cookieLoggedIn = false;

    try {
      seen = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    try {
      cookieLoggedIn = document.cookie.includes("supabase-auth");
    } catch {
      cookieLoggedIn = false;
    }

    if (seen || user || cookieLoggedIn) {
      setIntroState("done");
      return;
    }

    if (loading) return;
    setIntroState("playing");
  }, [loading, user]);

  useEffect(() => {
    if (introState !== "playing" || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [introState]);

  const handleIntroComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      /* sessionStorage unavailable; just continue */
    }

    setIntroState("done");
  }, []);

  return (
    <>
      {introState === "playing" ? <IntroAnimation onComplete={handleIntroComplete} /> : null}
      <div
        style={{
          opacity: introState === "done" ? 1 : 0,
          transition: introState === "done" ? "opacity 0.6s ease" : "none"
        }}
      >
        {children}
      </div>
    </>
  );
}
