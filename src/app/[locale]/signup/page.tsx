"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale, type Locale } from "@/lib/i18n";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { getAuthCopy } from "@/lib/launch-copy";

export default function SignupPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getAuthCopy(locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.authNotConfigured);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(copy.passwordTooShort);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.passwordsDoNotMatch);
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError(copy.acceptTermsRequired);
      setLoading(false);
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

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? copy.signupFailed);
      return;
    }

    setSuccess(copy.signupSuccess);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">{copy.signupBadge}</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">{copy.signupTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {copy.signupSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
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
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
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
