"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthPageFrame } from "@/components/auth-page-frame";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { mapSupabaseAuthError } from "@/lib/auth-errors";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function LoginForm({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        setError(mapSupabaseAuthError(err.message, copy));
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
        <span className="lux-badge inline-flex">{copy.loginBadge}</span>
        <h1 className="mt-6 text-center font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
          {copy.loginTitle}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">{copy.loginSubtitle}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitLogin();
          }}
          className="mt-8 space-y-5"
        >
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.emailPlaceholder}
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.passwordPlaceholder}
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder={copy.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Link href={`/${locale}/forgot-password`} className="text-xs text-faint transition-colors hover:text-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              {copy.forgotPasswordLink}
            </Link>
          </div>
          {error ? (
            <div className="tj-api-error-block" role="alert">
              {error}
            </div>
          ) : null}
          <AsyncButton
            type="submit"
            fullWidth
            loading={loading}
            loadingText={copy.signingIn}
            className="gradient-button flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105"
            onClick={async () => {}}
          >
            {copy.loginButton}
          </AsyncButton>
        </form>
        <p className="mt-3 text-center text-sm text-muted">
          {copy.newHere}{" "}
          <Link href={signupHref} className="text-white underline underline-offset-4 hover:text-bright">
            {copy.createAccount}
          </Link>
        </p>
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
