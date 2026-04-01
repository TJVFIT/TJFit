"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { DirectMessageLaunchButton } from "@/components/direct-message-launch-button";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
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

export function PublicProfileView({ locale, username }: { locale: Locale; username: string }) {
  const s = getSocialCopy(locale);
  const pathname = usePathname();
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
        <div className="mx-auto max-w-sm animate-pulse space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-white/10" />
          <div className="mx-auto h-4 w-40 rounded bg-white/10" />
          <div className="mx-auto h-3 w-24 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  const showMessage = Boolean(user) && !profile.self && profile.can_message === true;
  const showBlocked = Boolean(user) && !profile.self && profile.can_message === false;
  const showGuestMessageCta = !authLoading && !user && !profile.self;
  const loginNext = pathname ? encodeURIComponent(pathname) : "";
  const loginHref = loginNext ? `/${locale}/login?next=${loginNext}` : `/${locale}/login`;
  const isPrivateProfile = Boolean(profile.is_private ?? profile.account_visibility === "private");

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
        <Link href={`/${locale}/profile/search`} className="text-xs text-zinc-500 hover:text-zinc-300">
          ← {s.backToSearch}
        </Link>

      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-surface/30 p-8 text-center sm:p-9">
        <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full border border-white/[0.1] bg-surface-elevated">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-500">
              {(profile.display_name || profile.username || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="font-display text-xl font-semibold text-white sm:text-2xl">{profile.display_name || profile.username || "—"}</h1>
        <p className="mt-1 text-sm text-zinc-500">@{profile.username || "—"}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-cyan-400/80">{roleLabel(profile.role)}</p>

        {profile.limited || isPrivateProfile ? (
          <span className="mt-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200/90">
            {s.privateProfile}
          </span>
        ) : null}

        {profile.bio ? (
          <p className="mt-6 text-left text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
        ) : (
          <p className="mt-6 text-sm text-zinc-600">{profile.limited ? "" : "—"}</p>
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
  );
}
