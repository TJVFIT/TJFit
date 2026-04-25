"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";

import {
  LOCALE_META,
  supportedLocales,
  type Locale,
  type SupportedLocale
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALE_MATCH_RE = /^\/(en|tr|ar|es|fr|de|pt|ru|hi|id)(?=\/|$)/;

export function LanguageSwitcher({
  locale,
  className,
  variant = "default"
}: {
  locale: Locale | SupportedLocale;
  className?: string;
  /** Full-width trigger + panel for mobile drawer */
  variant?: "default" | "drawer";
}) {
  const pathname = usePathname() ?? "";
  const normalizedPath = pathname.replace(LOCALE_MATCH_RE, "") || "";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // Focus filter once panel renders
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const drawer = variant === "drawer";
  const current = LOCALE_META[locale as SupportedLocale] ?? LOCALE_META.en;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return supportedLocales;
    return supportedLocales.filter((code) => {
      const meta = LOCALE_META[code];
      return (
        code.includes(q) ||
        meta.label.toLowerCase().includes(q) ||
        meta.native.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div ref={rootRef} className={cn(drawer ? "relative w-full" : "relative shrink-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex touch-manipulation items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] transition-[border-color,color,background-color] duration-150 ease-out",
          "border-[rgba(34,211,238,0.18)] text-[#A8A294] hover:border-[rgba(34,211,238,0.42)] hover:text-[#F6F3ED]",
          open && "border-[rgba(34,211,238,0.42)] text-[#F6F3ED] bg-[rgba(34,211,238,0.06)]",
          drawer && "w-full justify-between"
        )}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden />
        <span className="font-semibold tracking-[0.08em]">{(locale as string).toUpperCase()}</span>
        <span className="hidden text-[11px] opacity-60 sm:inline">{current.native}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-150", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        role="listbox"
        aria-label="Language"
        className={cn(
          "absolute z-[120] rounded-[12px] border p-2 shadow-[0_24px_64px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-[opacity,transform] duration-150 ease-out",
          "border-[rgba(34,211,238,0.18)] bg-[rgba(12,12,14,0.96)]",
          drawer ? "start-0 end-0 top-[calc(100%+6px)] w-full" : "end-0 top-[calc(100%+8px)] min-w-[260px]",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="mb-1.5 px-2 py-1.5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search language…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-[rgba(34,211,238,0.14)] bg-[rgba(0,0,0,0.4)] px-2.5 py-1.5 text-[12px] text-[#F6F3ED] placeholder:text-[#6a6458] focus:border-[rgba(34,211,238,0.4)] focus:outline-none"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto pr-0.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-[#6a6458]">No match.</p>
          ) : (
            filtered.map((code) => {
              const meta = LOCALE_META[code];
              const active = code === locale;
              return (
                <Link
                  key={code}
                  href={`/${code}${normalizedPath}${search}`}
                  role="option"
                  aria-selected={active}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] transition-[background-color,color] duration-150",
                    "text-[#A8A294] hover:bg-[rgba(34,211,238,0.08)] hover:text-[#F6F3ED]",
                    active && "bg-[rgba(34,211,238,0.1)] text-[#F6F3ED]"
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none" aria-hidden>{meta.flag}</span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-[#F6F3ED]">{meta.native}</span>
                      <span className="truncate text-[11px] opacity-60">{meta.label} · {code.toUpperCase()}</span>
                    </span>
                  </span>
                  {active ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden /> : null}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
