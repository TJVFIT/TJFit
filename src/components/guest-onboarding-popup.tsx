"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";
import { getGuestPopupCopy } from "@/lib/launch-copy";

const ENTRY_DONE_KEY = "tjfit_entry_choice_done";

export function GuestOnboardingPopup({ locale }: { locale: Locale }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const copy = getGuestPopupCopy(locale);

  useEffect(() => {
    if (loading) return;
    const isAuthRoute =
      pathname === `/${locale}/login` ||
      pathname === `/${locale}/signup` ||
      pathname === `/${locale}/admin`;

    if (isAuthRoute || user) {
      setVisible(false);
      return;
    }

    const entryDone = localStorage.getItem(ENTRY_DONE_KEY) === "1";
    setVisible(!entryDone);
  }, [user, loading, locale, pathname]);

  const markDone = () => {
    try {
      localStorage.setItem(ENTRY_DONE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  const chooseCreateAccount = () => {
    markDone();
    router.push(`/${locale}/signup?from=welcome`);
  };

  const chooseViewWebsite = () => {
    markDone();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4">
      <div className="glass-panel w-full max-w-lg rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-faint">{copy.welcome}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{copy.entryTitle}</h2>
        <p className="mt-3 text-sm text-muted">{copy.entrySubtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={chooseCreateAccount}
            className="gradient-button rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            {copy.createAccount}
          </button>
          <button
            onClick={chooseViewWebsite}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
          >
            {copy.viewWebsite}
          </button>
        </div>
      </div>
    </div>
  );
}
