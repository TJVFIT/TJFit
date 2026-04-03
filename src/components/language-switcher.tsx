"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Locale, locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  className,
  variant = "default"
}: {
  locale: Locale;
  className?: string;
  /** Full-width trigger + panel for mobile drawer */
  variant?: "default" | "drawer";
}) {
  const pathname = usePathname() ?? "";
  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer = variant === "drawer";

  return (
    <div ref={rootRef} className={cn(drawer ? "relative w-full" : "relative shrink-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex touch-manipulation items-center gap-1 rounded-lg border border-[#1E2028] px-3 py-1.5 text-[13px] text-[#A1A1AA] transition-[border-color,color] duration-150 ease-out",
          "hover:border-[rgba(255,255,255,0.15)] hover:text-white",
          open && "border-[rgba(255,255,255,0.15)] text-white",
          drawer && "w-full justify-between"
        )}
      >
        {locale.toUpperCase()}
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-150", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        role="listbox"
        aria-label="Language"
        className={cn(
          "absolute z-[120] rounded-[10px] border border-[#1E2028] bg-[#111215] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-150 ease-out",
          drawer ? "start-0 end-0 top-[calc(100%+6px)] w-full" : "end-0 top-[calc(100%+6px)] min-w-[120px]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        {locales.map((code) => (
          <Link
            key={code}
            href={`/${code}${normalizedPath}${search}`}
            role="option"
            aria-selected={code === locale}
            onClick={() => setOpen(false)}
            className={cn(
              "block rounded-md px-3 py-2 text-[13px] text-[#A1A1AA] transition-[background-color,color] duration-150",
              "hover:bg-[rgba(255,255,255,0.05)] hover:text-white",
              code === locale && "font-semibold text-white"
            )}
          >
            {code.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
