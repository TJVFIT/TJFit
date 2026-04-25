"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { useDynamicIsland } from "@/components/ui/dynamic-island";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { isValidUsername } from "@/lib/username";

type ProfileRow = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  is_private: boolean;
  is_searchable: boolean;
  message_privacy: string;
  created_at?: string | null;
  updated_at?: string | null;
  privacy_settings?: {
    show_streak?: boolean;
    show_coins?: boolean;
    show_programs?: boolean;
    show_posts?: boolean;
  };
  banner_color?: string | null;
  display_badge_key?: string | null;
};

function normalizePrivacy(raw: string | undefined) {
  if (raw === "staff_only") return "coaches_only";
  return raw ?? "everyone";
}

function formatProfileDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = locale === "ar" ? "ar" : locale;
  return d.toLocaleDateString(tag, { year: "numeric", month: "short", day: "numeric" });
}

export function ProfileEditForm({ locale }: { locale: Locale }) {
  const s = getSocialCopy(locale);
  const island = useDynamicIsland();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [meta, setMeta] = useState<{ created_at: string | null; updated_at: string | null }>({
    created_at: null,
    updated_at: null
  });
  const [form, setForm] = useState<ProfileRow>({
    username: "",
    display_name: "",
    avatar_url: null,
    bio: "",
    is_private: false,
    is_searchable: true,
    message_privacy: "everyone",
    privacy_settings: { show_streak: true, show_coins: true, show_programs: true, show_posts: true },
    banner_color: "#111215",
    display_badge_key: null
  });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInitialLoadError(null);
    try {
      const res = await fetch("/api/profiles/me", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : s.profileReloadHint;
        setError(msg);
        setInitialLoadError(msg);
        return;
      }
      const p = data.profile as (ProfileRow & { searchable?: boolean }) | null | undefined;
      if (!p || typeof p !== "object") {
        setError(s.profileReloadHint);
        setInitialLoadError(s.profileReloadHint);
        return;
      }
      setForm({
        username: typeof p.username === "string" ? p.username : "",
        display_name: typeof p.display_name === "string" ? p.display_name : "",
        avatar_url: typeof p.avatar_url === "string" ? p.avatar_url : null,
        bio: typeof p.bio === "string" ? p.bio : "",
        is_private: Boolean(p.is_private),
        is_searchable: typeof p.is_searchable === "boolean" ? p.is_searchable : Boolean(p.searchable),
        message_privacy: normalizePrivacy(p.message_privacy),
        privacy_settings: {
          show_streak: p.privacy_settings?.show_streak !== false,
          show_coins: p.privacy_settings?.show_coins !== false,
          show_programs: p.privacy_settings?.show_programs !== false,
          show_posts: p.privacy_settings?.show_posts !== false
        },
        banner_color: typeof p.banner_color === "string" && p.banner_color ? p.banner_color : "#111215",
        display_badge_key: typeof p.display_badge_key === "string" ? p.display_badge_key : null
      });
      setMeta({
        created_at: p.created_at ?? null,
        updated_at: p.updated_at ?? null
      });
      if (typeof p.username === "string" && p.username) {
        const extra = await fetch(`/api/profile/${encodeURIComponent(p.username)}`, { credentials: "include" });
        const extraData = await extra.json().catch(() => ({}));
        const badgeRows = (extraData?.badges ?? []) as Array<{ badge_key: string }>;
        setEarnedBadges([...new Set(badgeRows.map((b) => b.badge_key).filter(Boolean))]);
      }
    } catch {
      setError(s.profileReloadHint);
      setInitialLoadError(s.profileReloadHint);
    } finally {
      setLoading(false);
    }
  }, [s.profileReloadHint]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const u = form.username.trim();
    if (!isValidUsername(u)) {
      setError(s.usernameInvalidClient);
      setUsernameTouched(true);
      return;
    }
    setSaving(true);
    setError(null);
    setSavedFlash(false);
    try {
      const res = await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username.trim(),
          display_name: form.display_name,
          avatar_url: form.avatar_url ?? "",
          bio: form.bio,
          is_private: form.is_private,
          is_searchable: form.is_searchable,
          message_privacy: form.message_privacy
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : s.errorGeneric);
        return;
      }
      setSavedFlash(true);
      island?.showNotification("achievement", "Profile updated ✓");
      window.setTimeout(() => setSavedFlash(false), 2000);
      if (data.profile) {
        const p = data.profile as ProfileRow;
        setForm((prev) => ({
          ...prev,
          username: p.username ?? prev.username,
          display_name: p.display_name ?? prev.display_name,
          message_privacy: normalizePrivacy(p.message_privacy)
        }));
        setMeta({
          created_at: p.created_at ?? null,
          updated_at: p.updated_at ?? null
        });
      }
    } catch {
      setError(s.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const saveAppearance = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          banner_color: form.banner_color,
          display_badge_key: form.display_badge_key,
          bio: form.bio,
          privacy_settings: form.privacy_settings
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : s.errorGeneric);
        return;
      }
      setSavedFlash(true);
      island?.showNotification("achievement", "Profile updated ✓");
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      setError(s.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-14 sm:px-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-10 w-full rounded-xl bg-white/10" />
          <div className="h-64 w-full rounded-[28px] bg-white/5" />
        </div>
      </div>
    );
  }

  if (initialLoadError) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-14 text-center sm:px-6">
        <p className="text-sm text-red-400">{initialLoadError}</p>
        <button
          type="button"
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-bright hover:border-white/25"
          onClick={() => void load()}
        >
          {s.retryLabel}
        </button>
        <Link href={`/${locale}`} className="block text-xs text-faint hover:text-bright">
          ← {s.threadBack}
        </Link>
      </div>
    );
  }

  const since = formatProfileDate(meta.created_at, locale);
  const updated = formatProfileDate(meta.updated_at, locale);

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-14 sm:px-6">
      <div>
        <Link href={`/${locale}/messages`} className="text-xs text-faint hover:text-bright">
          ← {s.threadBack}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white">{s.profileEditPageTitle}</h1>
        <p className="mt-2 text-sm text-muted">{s.messageSettingsSubtitle}</p>
        {(since || updated) && (
          <p className="mt-2 text-xs text-dim">
            {since ? (
              <>
                {s.memberSinceLabel}: {since}
                {updated ? " · " : ""}
              </>
            ) : null}
            {updated ? (
              <>
                {s.lastUpdatedLabel}: {updated}
              </>
            ) : null}
          </p>
        )}
        {form.username && isValidUsername(form.username.trim()) ? (
          <Link
            href={`/${locale}/profile/${encodeURIComponent(form.username.trim())}`}
            className="mt-3 inline-block text-xs text-cyan-300/85 hover:text-cyan-200 hover:underline"
          >
            {s.viewProfileButton} (@{form.username.trim()})
          </Link>
        ) : (
          <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100/85">
            {s.profileChooseUsernameHint}
          </p>
        )}
      </div>

      <div className="glass-panel space-y-5 rounded-[28px] p-6">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.usernameLabel}</span>
          <input
            className="input mt-1.5 w-full"
            value={form.username}
            onChange={(e) => {
              setUsernameTouched(true);
              setForm((f) => ({ ...f, username: e.target.value }));
            }}
            autoComplete="username"
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-dim">{s.usernameHint}</p>
          {usernameTouched && form.username.trim() && !isValidUsername(form.username.trim()) ? (
            <p className="mt-1 text-xs text-red-400/90">{s.usernameInvalidClient}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.displayNameLabel}</span>
          <input
            className="input mt-1.5 w-full"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder={s.displayNameLabel}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.avatarUrlLabel}</span>
          <input
            className="input mt-1.5 w-full"
            value={form.avatar_url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value || null }))}
            placeholder="https://"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.bioLabel}</span>
          <textarea
            className="input mt-1.5 min-h-[100px] w-full resize-y"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 160) }))}
          />
          <p className="mt-1 text-xs text-faint">{form.bio.length} / 160</p>
        </label>

        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.accountVisibilityLabel}</span>
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-bright">
              <input
                type="radio"
                name="vis"
                checked={!form.is_private}
                onChange={() => setForm((f) => ({ ...f, is_private: false }))}
              />
              {s.visibilityPublic}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-bright">
              <input
                type="radio"
                name="vis"
                checked={form.is_private}
                onChange={() => setForm((f) => ({ ...f, is_private: true }))}
              />
              {s.visibilityPrivate}
            </label>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-bright">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.is_searchable}
            onChange={(e) => setForm((f) => ({ ...f, is_searchable: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-white">{s.searchableLabel}</span>
            <span className="mt-0.5 block text-xs text-faint">{s.searchableHelp}</span>
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">{s.messagePrivacyLabel}</span>
          <select
            className="input mt-1.5 w-full"
            value={form.message_privacy}
            onChange={(e) => setForm((f) => ({ ...f, message_privacy: e.target.value }))}
          >
            <option value="everyone">{s.privacyEveryone}</option>
            <option value="nobody">{s.privacyNobody}</option>
            <option value="coaches_only">{s.privacyStaff}</option>
            <option value="connections_only">{s.privacyConnections}</option>
            <option value="approved_only">{s.privacyApproved}</option>
          </select>
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {savedFlash ? <p className="text-sm text-cyan-300/90">{s.saved}</p> : null}

        <AsyncButton
          type="button"
          variant="primary"
          loading={saving}
          loadingText={s.saving}
          className="gradient-button w-full rounded-full py-2.5 text-sm font-medium text-white sm:w-auto sm:px-10"
          onClick={() => save()}
        >
          {s.saveProfile}
        </AsyncButton>
      </div>

      <div className="glass-panel space-y-5 rounded-[28px] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Profile Appearance</h2>
        <div className="grid grid-cols-4 gap-2">
          {["#111215", "#0F172A", "#1A0B2E", "#0B1A2E", "#0B2E0B", "#2E0B0B", "#1A1A0B", "#1C1412"].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((f) => ({ ...f, banner_color: color }))}
              className={`h-9 rounded-lg border ${form.banner_color === color ? "border-cyan-300" : "border-white/15"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">Featured Badge</span>
          <select
            value={form.display_badge_key ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, display_badge_key: e.target.value || null }))}
            className="input mt-1.5 w-full"
          >
            <option value="">None</option>
            {earnedBadges.map((badge) => (
              <option key={badge} value={badge}>
                {badge}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Privacy Settings</p>
          {[
            ["show_streak", "Show my streak"],
            ["show_coins", "Show my TJCOIN balance"],
            ["show_programs", "Show programs I'm doing"],
            ["show_posts", "Show my community posts"]
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-bright">
              <input
                type="checkbox"
                checked={Boolean(form.privacy_settings?.[key as keyof NonNullable<ProfileRow["privacy_settings"]>])}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    privacy_settings: {
                      ...(f.privacy_settings ?? {}),
                      [key]: e.target.checked
                    }
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>

        <AsyncButton
          type="button"
          variant="primary"
          loading={saving}
          loadingText={s.saving}
          className="gradient-button w-full rounded-full py-2.5 text-sm font-medium text-white sm:w-auto sm:px-10"
          onClick={() => saveAppearance()}
        >
          Save Appearance
        </AsyncButton>
      </div>
    </div>
  );
}
