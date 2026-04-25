"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isLocale, type Locale } from "@/lib/i18n";
import { getUrlNoticeMessage } from "@/lib/url-notice";
import { cn } from "@/lib/utils";

/**
 * Shows a dismissible banner when `?notice=` is present (role redirects), then strips the param.
 */
export function UrlNoticeToaster({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const loc = isLocale(locale) ? locale : "en";
  const notice = searchParams.get("notice");
  const [bannerText, setBannerText] = useState<string | null>(null);
  const stripDone = useRef(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const msg = notice ? getUrlNoticeMessage(loc, notice) : null;
    if (msg) {
      setBannerText(msg);
      setVisible(true);
    }
  }, [notice, loc]);

  useEffect(() => {
    if (!notice) {
      stripDone.current = false;
      return;
    }
    if (stripDone.current) return;
    stripDone.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("notice");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [notice, pathname, router, searchParams]);

  useEffect(() => {
    if (!bannerText) return;
    const t = window.setTimeout(() => setVisible(false), 8500);
    return () => window.clearTimeout(t);
  }, [bannerText]);

  if (!bannerText) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[300] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
      role="status"
    >
      <div className="pointer-events-auto max-w-lg rounded-2xl border border-cyan-400/25 bg-surface/95 px-4 py-3 text-center text-sm text-bright shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md">
        <p>{bannerText}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-2 text-xs font-medium text-cyan-300/90 hover:text-cyan-200"
        >
          {loc === "tr" ? "Kapat" : loc === "ar" ? "إغلاق" : loc === "es" ? "Cerrar" : loc === "fr" ? "Fermer" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}
