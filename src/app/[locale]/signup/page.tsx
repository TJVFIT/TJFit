"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Upload, Camera } from "lucide-react";
import { AuthPageFrame } from "@/components/auth-page-frame";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { compressImage } from "@/lib/image-compress";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isValidUsername, normalizeUsername } from "@/lib/username";

type GoalKey = "lose_fat" | "build_muscle" | "home_training" | "recomposition";

const GOALS: Array<{ key: GoalKey; emoji: string; title: string; sub: string }> = [
  { key: "lose_fat", emoji: "🔥", title: "Lose Fat", sub: "Burn calories, build endurance" },
  { key: "build_muscle", emoji: "💪", title: "Build Muscle", sub: "Gain strength and size" },
  { key: "home_training", emoji: "🏠", title: "Train at Home", sub: "No gym, no problem" },
  { key: "recomposition", emoji: "⚖️", title: "Recomposition", sub: "Lose fat, gain muscle simultaneously" }
];

function SignupForm({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [goal, setGoal] = useState<GoalKey | null>(null);
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

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passwordValid = password.length >= 8;
  const step1Valid = emailValid && passwordValid && password === confirmPassword;

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus("idle");
      return;
    }
    if (!isValidUsername(username)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const id = window.setTimeout(() => {
      void fetch(`/api/users/check-username?username=${encodeURIComponent(username.trim())}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) {
            setUsernameStatus("idle");
            return;
          }
          setUsernameStatus(data.available ? "ok" : "taken");
        })
        .catch(() => setUsernameStatus("idle"));
    }, 400);
    return () => window.clearTimeout(id);
  }, [username]);

  const uploadAvatarIfAny = async (supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>, userId: string) => {
    if (!avatarFile) return null;
    const compressed = await compressImage(avatarFile, 500, 500, 0.85);
    const filePath = `${userId}/avatar-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, compressed, {
      contentType: "image/webp",
      upsert: true
    });
    if (uploadError) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl ?? null;
  };

  const buildReferralCode = (u: string) => {
    const head = u.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase().padEnd(4, "A");
    return `TJ-${head}-${rand}`;
  };

  const submitSignup = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.authNotConfigured);
        return;
      }

      if (!step1Valid) {
        setError(copy.passwordTooShort);
        return;
      }

      if (usernameStatus !== "ok") {
        setError("Choose an available username before continuing.");
        return;
      }

      if (!goal) {
        setError("Please select your fitness goal.");
        return;
      }
      if (!acceptedTerms) {
        setError(copy.acceptTermsRequired);
        return;
      }

      const now = new Date().toISOString();
      const cleanUsername = username.trim().replace(/^@/, "");
      const referralCode = buildReferralCode(cleanUsername);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${params.locale}`,
          data: {
            requested_role: "user",
            username: cleanUsername,
            goal,
            referral_code: referralCode,
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

      const userId = data.user?.id;
      if (userId && data.session) {
        const avatarUrl = await uploadAvatarIfAny(supabase, userId);
        await supabase
          .from("profiles")
          .update({
            username: cleanUsername,
            username_normalized: normalizeUsername(cleanUsername),
            display_name: cleanUsername,
            avatar_url: avatarUrl,
            referral_code: referralCode,
            bio: `Goal: ${goal}`
          })
          .eq("id", userId);
      }

      const emailParam = encodeURIComponent(email.trim());
      const verifyRedirect = redirectTarget
        ? `/${locale}/verify-email?redirect=${encodeURIComponent(redirectTarget)}&email=${emailParam}`
        : `/${locale}/verify-email?email=${emailParam}`;

      router.push(data.session ? `/${locale}/dashboard` : verifyRedirect);
      router.refresh();
    } catch (err) {
      console.error("[signup] submit failed", err);
      setError(copy.signupFailed);
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
        <span className="lux-badge inline-flex">{copy.signupBadge}</span>
        <h1 className="mt-6 text-center font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
          {copy.signupTitle}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#A1A1AA]">{copy.signupSubtitle}</p>
        <div className="mt-6">
          <p className="mb-2 text-center text-xs text-zinc-500">Step {step} of 4</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-400 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 4) void submitSignup();
          }}
          className="mt-8 space-y-5"
        >
          {step === 1 ? (
            <>
              <input
                className="input"
                type="email"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPassword ? "text" : "password"}
                  placeholder={copy.passwordMinPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder={copy.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              {!emailValid && email ? <p className="text-xs text-red-400">Please enter a valid email address.</p> : null}
              {!passwordValid && password ? <p className="text-xs text-red-400">Password must be at least 8 characters.</p> : null}
            </>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div
                onDrop={async (e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (!f) return;
                  setAvatarFile(f);
                  setAvatarPreview(URL.createObjectURL(f));
                }}
                onDragOver={(e) => e.preventDefault()}
                className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-500">
                    <Camera className="h-6 w-6" />
                    <Upload className="mt-1 h-4 w-4" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setAvatarFile(f);
                  setAvatarPreview(URL.createObjectURL(f));
                }}
                className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
              />
              <p className="text-center text-xs text-zinc-500">You can always add a photo later in your profile.</p>
              <button type="button" className="mx-auto block text-xs text-zinc-500 hover:text-zinc-300" onClick={() => setStep(3)}>
                Skip for now
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <input className="input" type="text" placeholder="@username" value={username} onChange={(e) => setUsername(e.target.value)} />
              {usernameStatus === "checking" ? <p className="text-xs text-zinc-500">Checking username...</p> : null}
              {usernameStatus === "ok" ? <p className="text-xs text-emerald-400">Available!</p> : null}
              {usernameStatus === "taken" ? <p className="text-xs text-red-400">Username taken. Try another.</p> : null}
              {usernameStatus === "invalid" ? (
                <p className="text-xs text-red-400">3-20 characters. Letters, numbers, underscore only.</p>
              ) : null}
              <p className="text-xs text-zinc-500">3-20 characters. Letters, numbers, underscore only.</p>
              <p className="text-xs text-zinc-500">This is how others find and message you.</p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGoal(g.key)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    goal === g.key ? "border-cyan-400/55 bg-cyan-500/10 text-white" : "border-white/10 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <p className="text-lg">{g.emoji}</p>
                  <p className="mt-1 font-semibold">{g.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{g.sub}</p>
                </button>
              ))}
            </div>
          ) : null}
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
          <div className="flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="min-h-[48px] flex-1 rounded-full border border-white/15 px-5 py-3 text-sm text-zinc-200"
              >
                Back
              </button>
            ) : null}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !step1Valid) {
                    setError("Please complete Step 1 correctly.");
                    return;
                  }
                  if (step === 3 && usernameStatus !== "ok") {
                    setError("Please choose an available username.");
                    return;
                  }
                  setError(null);
                  setStep((s) => Math.min(4, s + 1));
                }}
                className="gradient-button min-h-[48px] flex-1 rounded-full px-5 py-3 text-base font-semibold text-[#09090B]"
              >
                Continue
              </button>
            ) : (
              <AsyncButton
                type="button"
                fullWidth
                loading={loading}
                loadingText={copy.creatingAccount}
                className="gradient-button flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105"
                onClick={() => submitSignup()}
              >
                Finish Setup
              </AsyncButton>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">Free to join. No credit card required.</p>

        <p className="mt-6 text-center text-sm text-[#52525B]">
          {copy.alreadyHaveAccount}{" "}
          <Link
            href={loginHref}
            className="text-[#22D3EE] underline-offset-4 transition-opacity duration-150 hover:opacity-80"
          >
            {copy.logIn}
          </Link>
        </p>
      </div>
    </AuthPageFrame>
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
