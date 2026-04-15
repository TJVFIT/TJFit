"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Sparkles, BarChart2, MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", Icon: Home, label: "Home" },
  { key: "programs", href: "/programs", Icon: Dumbbell, label: "Programs" },
  { key: "tjai", href: "/ai", Icon: Sparkles, label: "TJAI" },
  { key: "progress", href: "/progress", Icon: BarChart2, label: "Progress" },
  { key: "messages", href: "/messages", Icon: MessageCircle, label: "Messages" }
] as const;

function isActive(pathname: string, locale: string, href: string) {
  const full = `/${locale}${href}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function MobileBottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  const activeIdx = NAV_ITEMS.findIndex((item) => isActive(pathname, locale, item.href));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block border-t border-[#1E2028] lg:hidden"
      style={{
        background: "rgba(9,9,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))"
      }}
      aria-label="Mobile navigation"
    >
      <div className="relative flex items-center justify-around px-1 py-2">
        {/* Sliding active pill */}
        {activeIdx >= 0 && (
          <div
            className="pointer-events-none absolute top-1.5 h-[calc(100%-12px)] rounded-xl bg-[rgba(34,211,238,0.08)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              width: `${100 / NAV_ITEMS.length}%`,
              left: `${(activeIdx / NAV_ITEMS.length) * 100}%`
            }}
            aria-hidden
          />
        )}

        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, locale, item.href);
          const Icon = item.Icon;
          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5 transition-colors duration-150"
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  active ? "text-[#22D3EE]" : "text-[#52525B]"
                )}
                strokeWidth={active ? 2.2 : 1.75}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  active ? "text-[#22D3EE]" : "text-[#52525B]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
