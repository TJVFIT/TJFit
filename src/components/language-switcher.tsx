"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";

import { locales, type Locale } from "@/lib/i18n";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  tr: "TR",
  ar: "AR",
  es: "ES",
  fr: "FR"
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const changeLocale = (nextLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const query = searchParams.toString();
    router.push(`${segments.join("/")}${query ? `?${query}` : ""}`);
  };

  return (
    <label className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-2.5 py-2 text-xs text-zinc-300">
      <Languages className="h-3.5 w-3.5 text-accent-soft" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="appearance-none bg-transparent pr-3 font-mono text-[10px] font-bold tracking-[0.16em] text-white outline-none"
      >
        {locales.map((item) => (
          <option key={item} value={item} className="bg-[#071126]">
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
