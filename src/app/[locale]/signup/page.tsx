"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function SignupForm({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }

  const locale = params.locale as Locale;
  const copy = getAuthCopy(locale);
  const redirectTarget =
    sanitizeRedirectParam(searchParams.get("redirect"), locale) ??
    sanitizeRedirectParam(searchParams.get("next"), locale);
  const loginHref =
    redirectTarget !== null
      ? `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`
      : `/${locale}/login`;

  const submitSignup = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.authNotConfigured);
        return;
      }

      if (password.length < 8) {
        setError(copy.passwordTooShort);
        return;
      }

      if (password !== confirmPassword) {
        setError(copy.passwordsDoNotMatch);
        return;
      }

      if (!acceptedTerms) {
        setError(copy.acceptTermsRequired);
        return;
      }

      const now = new Date().toISOString();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${params.locale}`,
          data: {
            requested_role: "user",
            terms_accepted: true,
            terms_version: TERMS_VERSION,
            terms_accepted_at: now,
            privacy_accepted: true,
            privacy_version: PRIVACY_VERSION,
            privacy_accepted_at: now,
            billing_terms_accepted: true,
            billing_provider: BILLING_PROVIDER,
            billing_terms_version: TERMS_VERSION,
            billing_terms_accepted_at: now
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message ?? copy.signupFailed);
        return;
      }

      if (data.session && redirectTarget) {
        router.push(redirectTarget);
        router.refresh();
        return;
      }

      setSuccess(copy.signupSuccess);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptedTerms(false);
    } catch (err) {
      console.error("[signup] submit failed", err);
      setError(copy.signupFailed);
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
        <span className="lux-badge inline-flex">{copy.signupBadge}</span>
        <h1 className="tj-page-title mt-6">{copy.signupTitle}</h1>
        <p className="tj-prose-muted mt-3">{copy.signupSubtitle}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitSignup();
          }}
          className="mt-8 space-y-5"
        >
          <input
            className="input"
            type="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder={copy.passwordMinPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            className="input"
            type="password"
            placeholder={copy.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <label className="flex items-start gap-3 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)] transition-colors hover:border-[rgba(255,255,255,0.12)]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
              required
            />
            <span>
              {copy.agreePrefix}{" "}
              <Link
                href={`/${params.locale}/terms-and-conditions`}
                className="text-white underline underline-offset-4 hover:text-zinc-200"
              >
                {copy.termsLink}
              </Link>
              ,{" "}
              <Link href={`/${params.locale}/privacy-policy`} className="text-white underline underline-offset-4 hover:text-zinc-200">
                {copy.privacyLink}
              </Link>
              , {BILLING_PROVIDER} {copy.billingSuffix}
            </span>
          </label>
          {error ? <div className="tj-api-error-block">{error}</div> : null}
          {success ? (
            <div className="rounded-[10px] border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-200/95">
              {success}
              {redirectTarget ? (
                <p className="mt-3 text-xs text-emerald-200/80">
                  <Link href={redirectTarget} className="underline underline-offset-4">
                    Continue to your program →
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}
          <AsyncButton
            type="button"
            fullWidth
            loading={loading}
            loadingText={copy.creatingAccount}
            className="gradient-button flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105"
            onClick={() => submitSignup()}
          >
            {copy.createAccountButton}
          </AsyncButton>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">Free to join. No credit card required.</p>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          {copy.alreadyHaveAccount}{" "}
          <Link href={loginHref} className="text-white underline underline-offset-4 transition-colors duration-150 hover:text-white">
            {copy.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="tj-skeleton tj-shimmer h-[480px] w-full rounded-[14px]" />
    </div>
  );
}

export default function SignupPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm params={params} />
    </Suspense>
  );
}
