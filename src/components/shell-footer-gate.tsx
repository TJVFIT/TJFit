"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import type { Locale } from "@/lib/i18n";

/**
 * Hides the global footer on small viewports when a chat thread is open so the
 * messages column can use the full visual viewport without scrolling past the app chrome.
 */
export function ShellFooterGate({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const [hideOnMobileThread, setHideOnMobileThread] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      const thread = /\/messages\/[^/]+\/?$/.test(pathname);
      setHideOnMobileThread(thread && mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pathname]);

  if (hideOnMobileThread) {
    return null;
  }

  return <SiteFooter locale={locale} />;
}
