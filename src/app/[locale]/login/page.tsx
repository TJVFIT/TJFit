"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale, type Locale } from "@/lib/i18n";
import { Logo } from "@/components/ui/Logo";
import { getAuthCopy } from "@/lib/launch-copy";

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const router = useRouter();

  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }

  const locale = params.locale as Locale;
  const copy = getAuthCopy(locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (adminMode) {
        if (!username.trim()) {
          setError(copy.adminUsernameRequired);
          return;
        }
        const res = await fetch("/api/auth/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
          credentials: "include"
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : copy.loginFailed);
          return;
        }
        window.location.href = `/${params.locale}`;
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.authNotConfigured);
        return;
      }
      if (!email.trim()) {
        setError(copy.emailRequired);
        return;
      }
      if (!password) {
        setError(copy.passwordRequired);
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (err) {
        setError(err.message ?? copy.loginFailed);
        return;
      }
      const nextRaw =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      const nextPath =
        nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : `/${params.locale}`;
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      console.error("[login] submit failed", err);
      setError(copy.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="tj-surface-panel w-full p-8 sm:p-9">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${params.locale}`} priority />
        </div>
        <span className="lux-badge inline-flex">{adminMode ? copy.adminLoginBadge : copy.loginBadge}</span>
        <h1 className="tj-page-title mt-6">
          {adminMode ? copy.adminLoginTitle : copy.loginTitle}
        </h1>
        <p className="tj-prose-muted mt-3">
          {adminMode
            ? copy.adminLoginSubtitle
            : copy.loginSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {adminMode ? (
            <input
              className="input"
              type="text"
              placeholder={copy.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          ) : (
            <input
              className="input"
              type="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            className="input"
            type="password"
            placeholder={copy.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <div className="form-error-banner">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button min-h-[52px] w-full touch-manipulation rounded-xl px-5 py-3 text-base font-medium text-[#05080a] transition hover:brightness-105 disabled:opacity-60 sm:min-h-0 sm:text-sm"
          >
            {loading ? copy.signingIn : adminMode ? copy.loginAsAdminButton : copy.loginButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {adminMode ? (
            <button
              type="button"
              onClick={() => {
                setAdminMode(false);
                setError(null);
              }}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              {copy.useEmailLogin}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdminMode(true);
                setError(null);
              }}
              className="text-white underline underline-offset-4 hover:text-zinc-200"
            >
              {copy.switchToAdminLogin}
            </button>
          )}
        </p>
        {!adminMode && (
          <p className="mt-3 text-center text-sm text-zinc-400">
            {copy.newHere}{" "}
            <Link href={`/${params.locale}/signup`} className="text-white underline underline-offset-4 hover:text-zinc-200">
              {copy.createAccount}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}