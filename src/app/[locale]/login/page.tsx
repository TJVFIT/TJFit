"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthPageFrame } from "@/components/auth-page-frame";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function LoginForm({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }

  const locale = params.locale as Locale;
  const copy = getAuthCopy(locale);
  const redirectSafe =
    sanitizeRedirectParam(searchParams.get("redirect"), locale) ??
    sanitizeRedirectParam(searchParams.get("next"), locale);
  const signupHref =
    redirectSafe !== null
      ? `/${locale}/signup?redirect=${encodeURIComponent(redirectSafe)}`
      : `/${locale}/signup`;

  const submitLogin = async () => {
    if (loading) return;
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
      router.push(redirectSafe ?? `/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      console.error("[login] submit failed", err);
      setError(copy.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageFrame>
      <div className="w-full">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${params.locale}`} priority />
        </div>
        <span className="lux-badge inline-flex">{adminMode ? copy.adminLoginBadge : copy.loginBadge}</span>
        <h1 className="mt-6 text-center font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
          {adminMode ? copy.adminLoginTitle : copy.loginTitle}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#A1A1AA]">
          {adminMode ? copy.adminLoginSubtitle : copy.loginSubtitle}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitLogin();
          }}
          className="mt-8 space-y-5"
        >
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
          {error ? <div className="tj-api-error-block">{error}</div> : null}
          <AsyncButton
            type="button"
            fullWidth
            loading={loading}
            loadingText={copy.signingIn}
            className="gradient-button flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105"
            onClick={() => submitLogin()}
          >
            {adminMode ? copy.loginAsAdminButton : copy.loginButton}
          </AsyncButton>
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
            <Link href={signupHref} className="text-white underline underline-offset-4 hover:text-zinc-200">
              {copy.createAccount}
            </Link>
          </p>
        )}
      </div>
    </AuthPageFrame>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="tj-skeleton tj-shimmer h-[420px] w-full rounded-[14px]" />
    </div>
  );
}

export default function LoginPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm params={params} />
    </Suspense>
  );
}
