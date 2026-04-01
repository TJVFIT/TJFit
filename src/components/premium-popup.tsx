"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type PremiumPopupProps = {
  open: boolean;
  onClose: () => void;
  /** For `aria-labelledby` — must match an element id inside children */
  titleId: string;
  closeLabel: string;
  children: React.ReactNode;
  /** z-index; keep below guest onboarding (120) when stacking */
  zIndexClass?: string;
};

/**
 * Centered modal: blurred backdrop, fade-in, full-width panel on small screens.
 */
export function PremiumPopup({
  open,
  onClose,
  titleId,
  closeLabel,
  children,
  zIndexClass = "z-[100]"
}: PremiumPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && visible) {
      closeRef.current?.focus();
    }
  }, [open, visible]);

  if (!mounted || !open) {
    return null;
  }

  const node = (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8`}
      role="presentation"
    >
      <button
        type="button"
        aria-label={closeLabel}
        className={`absolute inset-0 bg-black/55 backdrop-blur-md transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 w-full max-h-[min(88dvh,640px)] max-w-lg translate-y-0 overflow-y-auto overscroll-contain rounded-2xl border border-white/[0.08] bg-[#0f1012]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:p-7 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 sm:translate-y-2"
        } `}
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white sm:end-4 sm:top-4 sm:h-10 sm:w-10"
          aria-label={closeLabel}
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
