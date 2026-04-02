"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Locale, locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() ?? "";
  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  return (
    <div
      className={cn(
        "flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden rounded-full border border-white/10 bg-white/5 p-1 text-[11px] text-zinc-300 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-x-visible sm:gap-2 sm:text-xs [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {locales.map((code) => (
        <Link
          key={code}
          href={`/${code}${normalizedPath}${search}`}
          className={cn(
            "touch-manipulation shrink-0 rounded-full px-3 py-2.5 leading-none transition sm:px-3 sm:py-1.5",
            code === locale ? "bg-white text-black" : "hover:bg-white/10"
          )}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
