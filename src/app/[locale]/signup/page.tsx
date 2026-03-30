"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isLocale } from "@/lib/i18n";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth not configured.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept Terms, Privacy, and Billing Terms to create an account.");
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
      setError(signUpError.message ?? "Unable to create account.");
      return;
    }

    setSuccess("Account created. Check your email for verification, then sign in.");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">Create account</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Join TJFit.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Sign up to book coaching sessions, buy programs, track progress, and message your coach.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            className="input"
            type="password"
            placeholder="Confirm password"
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
              I agree to the{" "}
              <Link href={`/${params.locale}/terms-and-conditions`} className="text-white underline underline-offset-4 hover:text-zinc-200">
                Terms of Service
              </Link>
              ,{" "}
              <Link href={`/${params.locale}/privacy-policy`} className="text-white underline underline-offset-4 hover:text-zinc-200">
                Privacy Policy
              </Link>
              , and {BILLING_PROVIDER} billing terms.
            </span>
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href={`/${params.locale}/login`} className="text-white underline underline-offset-4 hover:text-zinc-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
