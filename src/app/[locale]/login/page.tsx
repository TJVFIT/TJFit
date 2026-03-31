"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale, type Locale } from "@/lib/i18n";
import { getAuthCopy } from "@/lib/launch-copy";

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const router = useRouter();

  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getAuthCopy(locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (adminMode) {
      if (!username.trim()) {
        setError(copy.adminUsernameRequired);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? copy.loginFailed);
        return;
      }
      window.location.href = `/${params.locale}`;
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.authNotConfigured);
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError(copy.emailRequired);
      setLoading(false);
      return;
    }
    if (!password) {
      setError(copy.passwordRequired);
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? copy.loginFailed);
      return;
    }
    router.push(`/${params.locale}`);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">{adminMode ? copy.adminLoginBadge : copy.loginBadge}</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">
          {adminMode ? copy.adminLoginTitle : copy.loginTitle}
        </h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {adminMode
            ? copy.adminLoginSubtitle
            : copy.loginSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
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