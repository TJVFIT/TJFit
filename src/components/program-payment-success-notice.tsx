"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  message: string;
  dismissLabel: string;
};

/**
 * Shows after Paddle redirect `?success=1`, strips the query without full reload, auto-hides.
 */
export function ProgramPaymentSuccessNotice({ message, dismissLabel }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") !== "1") return;
    setVisible(true);
    const cleanUrl = () => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("success");
      const q = p.toString();
      router.replace(`${pathname}${q ? `?${q}` : ""}`, { scroll: false });
    };
    const raf = requestAnimationFrame(() => cleanUrl());
    const hide = window.setTimeout(() => setVisible(false), 5000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hide);
    };
  }, [searchParams, router, pathname]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)] px-4 py-3 sm:px-5 sm:py-4"
    >
      <p className="text-sm font-medium leading-relaxed text-[#22C55E]">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[#A1A1AA] transition-colors hover:text-white"
      >
        {dismissLabel}
      </button>
    </div>
  );
}
