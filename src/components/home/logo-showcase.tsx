"use client";

import Image from "next/image";
import Link from "next/link";

import { BRAND_LOGO_SRC } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type LogoShowcaseProps = {
  locale: Locale;
  reduce: boolean;
};

/** Dedicated brand moment — not a nav stamp */
export function LogoShowcase({ locale, reduce }: LogoShowcaseProps) {
  return (
    <section className="relative overflow-hidden border-y border-[#1E2028] bg-[#0A0A0B] py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(34,211,238,0.14) 0%, transparent 62%)",
          }}
        />
        {!reduce && <div className="tj-logo-wireframe absolute left-1/2 top-1/2 h-[min(120vw,520px)] w-[min(120vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.07]" />}
      </div>
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#52525B]">Brand</p>
        <div className="relative mt-10">
          {!reduce && <div className="tj-logo-sweep pointer-events-none absolute inset-[-30%] overflow-hidden rounded-2xl" aria-hidden />}
          <Link
            href={`/${locale}`}
            className={cn(
              "relative inline-block transition-opacity duration-300 hover:opacity-90",
              !reduce && "tj-logo-breath"
            )}
            aria-label="TJFit home"
          >
            <Image
              src={BRAND_LOGO_SRC}
              alt="TJFit"
              width={420}
              height={344}
              className="h-auto w-[min(72vw,320px)] object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.18)]"
              sizes="320px"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
