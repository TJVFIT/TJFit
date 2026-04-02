"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale, type Locale } from "@/lib/i18n";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { Logo } from "@/components/ui/Logo";
import { getAuthCopy } from "@/lib/launch-copy";

export default function SignupPage({ params }: { params: { locale: string } }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error: signUpError } = await supabase.auth.signUp({
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
        <p className="tj-prose-muted mt-3">
          {copy.signupSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          <label className="flex items-start gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 text-sm leading-relaxed text-zinc-300 transition-colors hover:border-white/[0.14]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
              required
            />
            <span>
              {copy.agreePrefix}{" "}
              <Link href={`/${params.locale}/terms-and-conditions`} className="text-white underline underline-offset-4 hover:text-zinc-200">
                {copy.termsLink}
              </Link>
              ,{" "}
              <Link href={`/${params.locale}/privacy-policy`} className="text-white underline underline-offset-4 hover:text-zinc-200">
                {copy.privacyLink}
              </Link>
              , {BILLING_PROVIDER} {copy.billingSuffix}
            </span>
          </label>
          {error ? <div className="form-error-banner">{error}</div> : null}
          {success ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-200/95">
              {success}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button min-h-[52px] w-full touch-manipulation rounded-xl px-5 py-3 text-base font-medium text-[#05080a] transition hover:brightness-105 disabled:opacity-60 sm:min-h-0 sm:text-sm"
          >
            {loading ? copy.creatingAccount : copy.createAccountButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {copy.alreadyHaveAccount}{" "}
          <Link href={`/${params.locale}/login`} className="text-white underline underline-offset-4 hover:text-zinc-200">
            {copy.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
