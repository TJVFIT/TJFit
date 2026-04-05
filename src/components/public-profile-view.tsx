"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { DirectMessageLaunchButton } from "@/components/direct-message-launch-button";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { isSafeRedirect } from "@/lib/safe-redirect";
import { isValidUsername } from "@/lib/username";

type ProfileCard = {
  self?: boolean;
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio?: string;
  is_private?: boolean;
  account_visibility?: string;
  searchable?: boolean;
  message_privacy?: string;
  limited?: boolean;
  can_message?: boolean;
  role?: string;
};

function ProfileSelfActivity({ locale }: { locale: Locale }) {
  const s = getSocialCopy(locale);
  const [loading, setLoading] = useState(true);
  const [hasJourney, setHasJourney] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/dashboard-summary", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        const entries = Number(data.progressEntryCount ?? 0);
        const milestones = Number(data.milestoneCount ?? 0);
        const paid = Number(data.paidOrderCount ?? 0);
        setHasJourney(entries > 0 || milestones > 0 || paid > 0);
      } catch {
        if (!cancelled) setHasJourney(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 space-y-4" aria-busy="true">
        <div className="tj-skeleton tj-shimmer h-4 w-28 rounded-md" />
        <div className="tj-skeleton tj-shimmer h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (hasJourney) return null;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">{s.profileActivityTitle}</h2>
      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-surface/20 px-6 py-10 text-center">
      <Play className="mx-auto h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{s.profileActivityEmptyHeading}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">{s.profileActivityEmptySub}</p>
      <Link
        href={`/${locale}/programs`}
        className="mt-5 inline-block text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
      >
        {s.profileActivityBrowse}
      </Link>
      </div>
    </section>
  );
}

export function PublicProfileView({ locale, username }: { locale: Locale; username: string }) {
  const s = getSocialCopy(locale);
  const pathname = usePathname() ?? "";
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dmError, setDmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const u = decodeURIComponent(username).trim();
    if (!u || !isValidUsername(u)) {
      setProfile(null);
      setError(s.profileNotFound);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/by-username/${encodeURIComponent(u)}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfile(null);
        setError(typeof data.error === "string" ? data.error : s.profileNotFound);
        return;
      }
      const raw = data.profile as ProfileCard | null | undefined;
      if (!raw || typeof raw.id !== "string") {
        setProfile(null);
        setError(s.profileNotFound);
        return;
      }
      setProfile({
        ...raw,
        username: String(raw.username ?? u),
        display_name: String(raw.display_name ?? raw.username ?? u),
        avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null
      });
    } catch {
      setProfile(null);
      setError(s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [username, s.profileNotFound, s.errorGeneric]);

  useEffect(() => {
    void load();
  }, [load]);

  const roleLabel = (r?: string) => {
    if (r === "coach") return s.roleCoach;
    if (r === "admin") return s.roleAdmin;
    return s.roleUser;
  };

  if (error && !profile && !loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:border-white/25"
            onClick={() => void load()}
          >
            {s.retryLabel}
          </button>
          <Link href={`/${locale}/profile/search`} className="text-sm text-cyan-300/90 hover:underline">
            {s.backToSearch}
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="tj-skeleton tj-shimmer mx-auto h-20 w-20 rounded-full" />
          <div className="tj-skeleton tj-shimmer mx-auto h-5 w-[160px] rounded-md" />
          <div className="tj-skeleton tj-shimmer mx-auto h-3.5 w-[240px] rounded-md" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tj-skeleton tj-shimmer mx-auto h-10 w-[60px] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showMessage = Boolean(user) && !profile.self && profile.can_message === true;
  const showBlocked = Boolean(user) && !profile.self && profile.can_message === false;
  const showGuestMessageCta = !authLoading && !user && !profile.self;
  const loginHref =
    pathname && isSafeRedirect(pathname, locale)
      ? `/${locale}/login?redirect=${encodeURIComponent(pathname)}`
      : `/${locale}/login`;
  const isPrivateProfile = Boolean(profile.is_private ?? profile.account_visibility === "private");
  const bioTrim = (profile.bio ?? "").trim();
  const showGuestNothingPublic =
    !profile.self && !profile.limited && !isPrivateProfile && !bioTrim && !authLoading;

  return (
    <>
      <AmbientBackground variant="violet" intensity="low" />
      <div className="relative z-[1] mx-auto max-w-lg px-4 py-14 sm:px-6">
      <Link
        href={`/${locale}/profile/search`}
        className="text-xs text-[#52525B] transition-colors duration-150 hover:text-white"
      >
        ← {s.backToSearch}
      </Link>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#1E2028] bg-[#111215] p-8 text-center sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(167,139,250,0.14),transparent_58%)] opacity-90"
          aria-hidden
        />
        <div className="relative">
        <div className="relative mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border-2 border-[#1E2028] bg-[#18191E] transition-[border-color] duration-200 [@media(hover:hover)]:hover:border-[#22D3EE] sm:h-[80px] sm:w-[80px]">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#22D3EE]">
              {(profile.display_name || profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="font-display text-[32px] font-bold tracking-[-0.015em] text-white">
          {profile.display_name || profile.username || "—"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">@{profile.username || "—"}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-cyan-400/80">{roleLabel(profile.role)}</p>

        {profile.limited || isPrivateProfile ? (
          <span className="mt-4 inline-block rounded border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200/90">
            {s.privateProfile}
          </span>
        ) : null}

        {bioTrim ? (
          <p className="mt-6 text-left text-base leading-[1.7] text-[#A1A1AA]">{profile.bio}</p>
        ) : profile.limited ? null : (
          <p className="mt-6 text-sm text-[#52525B]">—</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {profile.self ? (
            <Link
              href={`/${locale}/profile/edit`}
              className="gradient-button rounded-full px-8 py-2.5 text-sm font-medium text-white"
            >
              {s.messageSettingsTitle}
            </Link>
          ) : null}
          {showGuestMessageCta ? (
            <Link
              href={loginHref}
              className="gradient-button rounded-full px-8 py-2.5 text-center text-sm font-medium text-white"
            >
              {s.signInToMessage}
            </Link>
          ) : null}
          {showMessage ? (
            <DirectMessageLaunchButton
              locale={locale}
              peerId={profile.id}
              variant="gradient"
              className="px-8 py-2.5 text-sm font-medium"
              onError={(m) => setDmError(m)}
            />
          ) : null}
          {showBlocked ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              {s.messagingBlocked}
            </p>
          ) : null}
        </div>

        {dmError ? <p className="mt-4 text-sm text-red-400">{dmError}</p> : null}
        </div>
      </div>

      {showGuestNothingPublic ? (
        <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">{s.profileGuestNothingPublic}</p>
      ) : null}

      {profile.self ? <ProfileSelfActivity locale={locale} /> : null}
      </div>
    </>
  );
}
