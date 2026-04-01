"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
    message_privacy: "everyone"
  });

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
        message_privacy: normalizePrivacy(p.message_privacy)
      });
      setMeta({
        created_at: p.created_at ?? null,
        updated_at: p.updated_at ?? null
      });
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
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:border-white/25"
          onClick={() => void load()}
        >
          {s.retryLabel}
        </button>
        <Link href={`/${locale}`} className="block text-xs text-zinc-500 hover:text-zinc-300">
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
        <Link href={`/${locale}/messages`} className="text-xs text-zinc-500 hover:text-zinc-300">
          ← {s.threadBack}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white">{s.profileEditPageTitle}</h1>
        <p className="mt-2 text-sm text-zinc-400">{s.messageSettingsSubtitle}</p>
        {(since || updated) && (
          <p className="mt-2 text-xs text-zinc-600">
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
          <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100/85">
            {s.profileChooseUsernameHint}
          </p>
        )}
      </div>

      <div className="glass-panel space-y-5 rounded-[28px] p-6">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.usernameLabel}</span>
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
          <p className="mt-1 text-xs text-zinc-600">{s.usernameHint}</p>
          {usernameTouched && form.username.trim() && !isValidUsername(form.username.trim()) ? (
            <p className="mt-1 text-xs text-red-400/90">{s.usernameInvalidClient}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.displayNameLabel}</span>
          <input
            className="input mt-1.5 w-full"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder={s.displayNameLabel}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.avatarUrlLabel}</span>
          <input
            className="input mt-1.5 w-full"
            value={form.avatar_url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value || null }))}
            placeholder="https://"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.bioLabel}</span>
          <textarea
            className="input mt-1.5 min-h-[100px] w-full resize-y"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
        </label>

        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.accountVisibilityLabel}</span>
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="vis"
                checked={!form.is_private}
                onChange={() => setForm((f) => ({ ...f, is_private: false }))}
              />
              {s.visibilityPublic}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
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

        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.is_searchable}
            onChange={(e) => setForm((f) => ({ ...f, is_searchable: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-white">{s.searchableLabel}</span>
            <span className="mt-0.5 block text-xs text-zinc-500">{s.searchableHelp}</span>
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{s.messagePrivacyLabel}</span>
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

        <button
          type="button"
          disabled={saving}
          className="gradient-button w-full rounded-full py-2.5 text-sm font-medium text-white disabled:opacity-40 sm:w-auto sm:px-10"
          onClick={() => void save()}
        >
          {saving ? s.saving : s.saveProfile}
        </button>
      </div>
    </div>
  );
}
