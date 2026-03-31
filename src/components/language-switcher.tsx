"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Locale, locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const normalizedPath = pathname.replace(/^\/(en|tr|ar|es|fr)/, "") || "";
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-zinc-300">
      {locales.map((code) => (
        <Link
          key={code}
          href={`/${code}${normalizedPath}${search}`}
          className={cn(
            "rounded-full px-3 py-1.5 transition",
            code === locale ? "bg-white text-black" : "hover:bg-white/10"
          )}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
