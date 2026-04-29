import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Coming Soon | TJFit",
  description:
    "TJFit launches soon — premium AI-powered fitness coaching, transformations, and a global community.",
  robots: { index: false, follow: false }
};

export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center text-white">
      <div
        className="pointer-events-none fixed -left-[80px] -top-[120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_70%)] blur-[40px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-[80px] -right-[80px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_70%)] blur-[40px]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        <Logo variant="icon" size="auth" priority />

        <span className="lux-badge mt-10 inline-flex">TJFit</span>

        <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
          Coming soon
        </h1>

        <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted sm:text-lg">
          Premium AI-powered fitness coaching, transformations, and a global community — almost ready.
        </p>

        <div className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-faint">Team & admin access</p>
        <Link
          href="/en/login"
          className="mt-3 text-sm font-medium text-cyan-300 underline-offset-4 transition hover:text-cyan-200 hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </main>
  );
}
