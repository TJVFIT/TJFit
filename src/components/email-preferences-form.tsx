"use client";

import { useCallback, useEffect, useState } from "react";

import { AsyncButton } from "@/components/ui/AsyncButton";
import { useDynamicIsland } from "@/components/ui/dynamic-island";

type EmailPreferences = {
  weekly_program: boolean;
  achievements: boolean;
  blog_updates: boolean;
  streak_milestones: boolean;
  referrals: boolean;
  platform_news: boolean;
};

const DEFAULT_PREFERENCES: EmailPreferences = {
  weekly_program: true,
  achievements: true,
  blog_updates: true,
  streak_milestones: true,
  referrals: true,
  platform_news: true
};

// Order + copy for every toggle the API supports (src/app/api/email/preferences/route.ts).
// English-hardcoded to match the zero-i18n sibling settings pages (subscription, messaging)
// exactly — the /settings tree has no dictionary section, so this follows the established
// precedent rather than inventing a parallel one for a single page.
const FIELDS: ReadonlyArray<{ key: keyof EmailPreferences; label: string; help: string }> = [
  {
    key: "weekly_program",
    label: "Weekly program updates",
    help: "Your upcoming week's plan and any coach notes."
  },
  {
    key: "achievements",
    label: "Achievement emails",
    help: "Badges, milestones, and personal records you unlock."
  },
  {
    key: "blog_updates",
    label: "Blog updates",
    help: "New articles from coaches and the TJFit team."
  },
  {
    key: "streak_milestones",
    label: "Streak milestones",
    help: "Celebrations when you hit a training streak."
  },
  {
    key: "referrals",
    label: "Referral emails",
    help: "Updates when someone signs up with your referral code."
  },
  {
    key: "platform_news",
    label: "Platform news",
    help: "Product announcements and account-relevant changes."
  }
];

const ERROR_GENERIC = "Something went wrong. Please try again.";

export function EmailPreferencesForm() {
  const island = useDynamicIsland();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<EmailPreferences>(DEFAULT_PREFERENCES);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInitialLoadError(null);
    try {
      const res = await fetch("/api/email/preferences", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERROR_GENERIC);
        setInitialLoadError(ERROR_GENERIC);
        return;
      }
      const p = (data?.preferences ?? {}) as Partial<EmailPreferences>;
      setPrefs({
        weekly_program: typeof p.weekly_program === "boolean" ? p.weekly_program : DEFAULT_PREFERENCES.weekly_program,
        achievements: typeof p.achievements === "boolean" ? p.achievements : DEFAULT_PREFERENCES.achievements,
        blog_updates: typeof p.blog_updates === "boolean" ? p.blog_updates : DEFAULT_PREFERENCES.blog_updates,
        streak_milestones:
          typeof p.streak_milestones === "boolean" ? p.streak_milestones : DEFAULT_PREFERENCES.streak_milestones,
        referrals: typeof p.referrals === "boolean" ? p.referrals : DEFAULT_PREFERENCES.referrals,
        platform_news: typeof p.platform_news === "boolean" ? p.platform_news : DEFAULT_PREFERENCES.platform_news
      });
    } catch {
      setError(ERROR_GENERIC);
      setInitialLoadError(ERROR_GENERIC);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/email/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        setError(ERROR_GENERIC);
        return;
      }
      island?.showNotification("achievement", "Email preferences updated ✓");
    } catch {
      setError(ERROR_GENERIC);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-14 sm:px-6">
        <div className="space-y-3">
          <div className="tj-skeleton h-4 w-24 rounded" />
          <div className="tj-skeleton h-10 w-full rounded-xl" />
          <div className="tj-skeleton h-64 w-full rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (initialLoadError) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-14 text-center sm:px-6">
        <p className="text-sm text-muted">{initialLoadError}</p>
        <button
          type="button"
          className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-bright transition hover:border-purple-400/35"
          onClick={() => void load()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-10 sm:px-6">
      <div className="glass-panel space-y-4 rounded-[28px] p-6">
        <div className="space-y-2">
          {FIELDS.map(({ key, label, help }) => (
            <label key={key} className="flex cursor-pointer items-start gap-3 text-sm text-bright">
              <input
                type="checkbox"
                className="mt-1"
                checked={prefs[key]}
                onChange={(e) => setPrefs((f) => ({ ...f, [key]: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-white">{label}</span>
                <span className="mt-0.5 block text-xs text-faint">{help}</span>
              </span>
            </label>
          ))}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <AsyncButton
          type="button"
          variant="primary"
          loading={saving}
          loadingText="Saving..."
          className="gradient-button w-full rounded-full py-2.5 text-sm font-medium text-white sm:w-auto sm:px-10"
          onClick={() => save()}
        >
          Save preferences
        </AsyncButton>
      </div>
    </div>
  );
}
