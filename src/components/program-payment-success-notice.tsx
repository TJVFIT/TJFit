"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  message: string;
  dismissLabel: string;
  programSlug?: string;
  downloadLabel?: string;
};

/**
 * Shows after Paddle redirect `?success=1`, strips the query without full reload, auto-hides.
 */
export function ProgramPaymentSuccessNotice({ message, dismissLabel, programSlug, downloadLabel }: Props) {
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
    if (programSlug) {
      // Auto-trigger the premium PDF download once payment is confirmed.
      const dl = window.setTimeout(() => {
        window.location.href = `/api/programs/download/${programSlug}`;
      }, 600);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(dl);
      };
    }
    return () => cancelAnimationFrame(raf);
  }, [searchParams, router, pathname, programSlug]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
      style={{
        borderColor: "rgba(34,211,238,0.35)",
        background: "rgba(34,211,238,0.08)"
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#22D3EE" }}>
          {message}
        </p>
        {programSlug ? (
          <a
            href={`/api/programs/download/${programSlug}`}
            className="mt-2 inline-flex text-xs font-semibold underline"
            style={{ color: "#F5D4A0" }}
          >
            {downloadLabel ?? "Download your PDF →"}
          </a>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-muted transition-colors hover:text-white"
      >
        {dismissLabel}
      </button>
    </div>
  );
}
