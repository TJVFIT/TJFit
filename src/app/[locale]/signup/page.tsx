"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Upload, Camera, Dumbbell, Flame, Home, Scale, type LucideIcon } from "lucide-react";
import { AuthPageFrame } from "@/components/auth-page-frame";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { ageFromBirthDate } from "@/lib/age-gate";
import { mapSupabaseAuthError } from "@/lib/auth-errors";
import { getSignupGoals, type SignupGoalKey } from "@/lib/auth-signup-content";
import { getAuthCopy } from "@/lib/launch-copy";
import { isLocale, type Locale } from "@/lib/i18n";
import { compressImage } from "@/lib/image-compress";
import { BILLING_PROVIDER, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isValidUsername, normalizeUsername } from "@/lib/username";

const GOAL_ICONS: Record<SignupGoalKey, LucideIcon> = {
  lose_fat: Flame,
  build_muscle: Dumbbell,
  home_training: Home,
  recomposition: Scale
};

// COPPA: TJFit does not knowingly collect data from children under 13.
// A neutral date-of-birth gate on step 1 blocks under-13 accounts.
const MIN_AGE = 13;

const DOB_COPY: Record<Locale, { label: string; under13: string }> = {
  en: { label: "Date of birth", under13: "You must be at least 13 years old to use TJFit." },
  tr: { label: "Doğum tarihi", under13: "TJFit'i kullanmak için en az 13 yaşında olmalısınız." },
  ar: { label: "تاريخ الميلاد", under13: "يجب أن يكون عمرك 13 عامًا على الأقل لاستخدام TJFit." },
  es: { label: "Fecha de nacimiento", under13: "Debes tener al menos 13 años para usar TJFit." },
  fr: { label: "Date de naissance", under13: "Vous devez avoir au moins 13 ans pour utiliser TJFit." }
};

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
  const [goal, setGoal] = useState<SignupGoalKey | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
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

  const goals = useMemo(() => getSignupGoals(locale), [locale]);
  const stepLabel = useMemo(
    () => copy.signupStepProgress.replace("{current}", String(step)).replace("{total}", "4"),
    [copy.signupStepProgress, step]
  );

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passwordValid = password.length >= 8;
  const age = useMemo(() => ageFromBirthDate(birthDate), [birthDate]);
  const ageValid = age !== null && age >= MIN_AGE;
  const step1Valid = emailValid && passwordValid && password === confirmPassword && ageValid;
  const dobMax = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE);
    return d.toISOString().slice(0, 10);
  }, []);
  const dobCopy = DOB_COPY[locale];

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
        if (!emailValid) setError(copy.emailInvalid);
        else if (password !== confirmPassword) setError(copy.passwordsDoNotMatch);
        else if (!passwordValid) setError(copy.passwordTooShort);
        else if (!ageValid) setError(dobCopy.under13);
        else setError(copy.signupErrorStep1);
        return;
      }

      if (usernameStatus !== "ok") {
        setError(copy.signupChooseUsernameError);
        return;
      }

      if (!goal) {
        setError(copy.signupErrorGoal);
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
            birth_date: birthDate,
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
        setError(mapSupabaseAuthError(signUpError.message, copy));
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
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">{copy.signupSubtitle}</p>
        <div className="mt-6">
          <p className="mb-2 text-center text-xs text-faint">{stepLabel}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
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
              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
                  {copy.emailPlaceholder}
                </label>
                <input
                  id="signup-email"
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
                <label htmlFor="signup-password" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
                  {copy.passwordMinPlaceholder}
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    className="input pr-11"
                    type={showPassword ? "text" : "password"}
                    name="new-password"
                    autoComplete="new-password"
                    placeholder={copy.passwordMinPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
                  {copy.confirmPasswordPlaceholder}
                </label>
                <input
                  id="signup-confirm"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  autoComplete="new-password"
                  placeholder={copy.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="signup-dob" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
                  {dobCopy.label}
                </label>
                <input
                  id="signup-dob"
                  className="input"
                  type="date"
                  name="bday"
                  autoComplete="bday"
                  max={dobMax}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
              {!emailValid && email ? <p className="text-xs text-red-400">{copy.emailInvalid}</p> : null}
              {!passwordValid && password ? <p className="text-xs text-red-400">{copy.passwordTooShort}</p> : null}
              {password && confirmPassword && password !== confirmPassword ? (
                <p className="text-xs text-red-400">{copy.passwordsDoNotMatch}</p>
              ) : null}
              {birthDate && !ageValid ? <p className="text-xs text-red-400">{dobCopy.under13}</p> : null}
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
                role="presentation"
                className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-faint">
                    <Camera className="h-6 w-6" />
                    <Upload className="mt-1 h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="signup-avatar" className="sr-only">
                  {copy.avatarFileLabel}
                </label>
                <input
                  id="signup-avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setAvatarFile(f);
                    setAvatarPreview(URL.createObjectURL(f));
                  }}
                  className="block w-full text-sm text-bright file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
                />
              </div>
              <p className="text-center text-xs text-faint">{copy.signupAvatarLater}</p>
              <button type="button" className="mx-auto block text-xs text-faint hover:text-bright" onClick={() => setStep(3)}>
                {copy.skipForNow}
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="signup-username" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
                  {copy.usernamePlaceholder}
                </label>
                <input
                  id="signup-username"
                  className="input"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {usernameStatus === "checking" ? <p className="text-xs text-faint">{copy.signupCheckingUsername}</p> : null}
              {usernameStatus === "ok" ? <p className="text-xs text-emerald-400">{copy.signupUsernameOk}</p> : null}
              {usernameStatus === "taken" ? <p className="text-xs text-red-400">{copy.signupUsernameTaken}</p> : null}
              {usernameStatus === "invalid" ? <p className="text-xs text-red-400">{copy.signupUsernameInvalid}</p> : null}
              <p className="text-xs text-faint">{copy.signupUsernameHint}</p>
              <p className="text-xs text-faint">{copy.signupFindYouHint}</p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((g) => {
                const GoalIcon = GOAL_ICONS[g.key];
                return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGoal(g.key)}
                  className={`rounded-2xl border p-4 text-left transition-[border-color,background-color,color,box-shadow] duration-200 ${
                    goal === g.key
                      ? "border-purple-300/55 bg-purple-300/[0.1] text-purple-50 shadow-[0_0_22px_rgba(168,85,247,0.16)]"
                      : "border-white/10 text-bright hover:border-purple-300/40 hover:bg-purple-300/[0.04] hover:text-purple-100"
                  }`}
                >
                  <GoalIcon className="h-5 w-5 text-purple-300" aria-hidden />
                  <p className="mt-1 font-semibold">{g.title}</p>
                  <p className="mt-1 text-xs text-faint">{g.sub}</p>
                </button>
                );
              })}
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
                className="text-white underline underline-offset-4 hover:text-bright"
              >
                {copy.termsLink}
              </Link>
              ,{" "}
              <Link href={`/${params.locale}/privacy-policy`} className="text-white underline underline-offset-4 hover:text-bright">
                {copy.privacyLink}
              </Link>
              , {BILLING_PROVIDER} {copy.billingSuffix}
            </span>
          </label>
          {error ? (
            <div className="tj-api-error-block" role="alert">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="min-h-[48px] flex-1 rounded-full border border-white/15 px-5 py-3 text-sm text-bright transition-[border-color,color,box-shadow] duration-200 hover:border-purple-300/40 hover:text-purple-100 hover:shadow-[0_0_18px_rgba(168,85,247,0.14)]"
              >
                {copy.signupBack}
              </button>
            ) : null}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !step1Valid) {
                    if (!emailValid) setError(copy.emailInvalid);
                    else if (password !== confirmPassword) setError(copy.passwordsDoNotMatch);
                    else if (!passwordValid) setError(copy.passwordTooShort);
                    else if (!ageValid) setError(dobCopy.under13);
                    else setError(copy.signupErrorStep1);
                    return;
                  }
                  if (step === 3 && usernameStatus !== "ok") {
                    setError(copy.signupErrorUsername);
                    return;
                  }
                  setError(null);
                  setStep((s) => Math.min(4, s + 1));
                }}
                className="tj-cta-sheen gradient-button min-h-[48px] flex-1 rounded-full px-5 py-3 text-base font-semibold text-[#09090B]"
              >
                {copy.signupContinue}
              </button>
            ) : (
              <AsyncButton
                type="button"
                fullWidth
                loading={loading}
                loadingText={copy.creatingAccount}
                className="tj-cta-sheen gradient-button flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105"
                onClick={() => submitSignup()}
              >
                {copy.signupFinish}
              </AsyncButton>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">{copy.signupFreeToJoin}</p>

        <p className="mt-6 text-center text-sm text-dim">
          {copy.alreadyHaveAccount}{" "}
          <Link
            href={loginHref}
            className="text-accent underline-offset-4 transition-opacity duration-150 hover:opacity-80"
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
