"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthPageFrame } from "@/components/auth-page-frame";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const COPY: Record<
  Locale,
  {
    title: string;
    sub: string;
    resend: string;
    wait: string;
    login: string;
    spamHint: string;
    emailLabel: string;
    authNotConfigured: string;
    enterEmail: string;
    resendSent: string;
    resendFailed: string;
    resendSignIn: string;
  }
> = {
  en: {
    title: "Check your email — we sent a verification link",
    sub: "Open your inbox and confirm your account to continue.",
    resend: "Resend email",
    wait: "Resend available in",
    login: "Back to sign in",
    spamHint: "Check your spam or promotions folder too.",
    emailLabel: "Email address",
    authNotConfigured: "Sign-in isn’t set up on this environment.",
    enterEmail: "Enter the email you used to register.",
    resendSent: "Verification email sent. Check your inbox and spam folder.",
    resendFailed: "Could not resend. Try again in a moment.",
    resendSignIn: "Sign in, then use “Resend” from your account if needed."
  },
  tr: {
    title: "E-postanı kontrol et — doğrulama bağlantısı gönderdik",
    sub: "Devam etmek için gelen kutundan hesabını doğrula.",
    resend: "E-postayı yeniden gönder",
    wait: "Yeniden gönderim için bekle",
    login: "Girişe dön",
    spamHint: "Spam veya tanıtımlar klasörüne de bak.",
    emailLabel: "E-posta adresi",
    authNotConfigured: "Bu ortamda giriş ayarlı değil.",
    enterEmail: "Kayıtta kullandığın e-postayı yaz.",
    resendSent: "Doğrulama e-postası gönderildi. Gelen kutusu ve spam’i kontrol et.",
    resendFailed: "Yeniden gönderilemedi. Biraz sonra tekrar dene.",
    resendSignIn: "Önce giriş yap, gerekirse hesabından “Yeniden gönder” kullan."
  },
  ar: {
    title: "تحقق من بريدك — أرسلنا رابط التحقق",
    sub: "افتح بريدك وأكد حسابك للمتابعة.",
    resend: "إعادة إرسال البريد",
    wait: "إعادة الإرسال بعد",
    login: "العودة لتسجيل الدخول",
    spamHint: "جرّب مجلد الرسائل غير المرغوب فيها أيضاً.",
    emailLabel: "البريد الإلكتروني",
    authNotConfigured: "تسجيل الدخول غير مهيأ هنا.",
    enterEmail: "أدخل البريد الذي استخدمته عند التسجيل.",
    resendSent: "أُرسل بريد التحقق. راجع الوارد والبريد المزعج.",
    resendFailed: "تعذّر إعادة الإرسال. حاول لاحقاً.",
    resendSignIn: "سجّل الدخول أولاً، ثم أعد الطلب من حسابك إن لزم."
  },
  es: {
    title: "Revisa tu correo — enviamos un enlace de verificación",
    sub: "Abre tu bandeja y confirma tu cuenta para continuar.",
    resend: "Reenviar correo",
    wait: "Reenvío disponible en",
    login: "Volver al inicio de sesión",
    spamHint: "Revisa también spam o promociones.",
    emailLabel: "Correo electrónico",
    authNotConfigured: "El acceso no está configurado aquí.",
    enterEmail: "Introduce el correo con el que te registraste.",
    resendSent: "Correo de verificación enviado. Revisa bandeja y spam.",
    resendFailed: "No se pudo reenviar. Inténtalo de nuevo.",
    resendSignIn: "Inicia sesión y, si hace falta, reenvía desde tu cuenta."
  },
  fr: {
    title: "Vérifiez votre e-mail — nous avons envoyé un lien",
    sub: "Ouvrez votre boîte et confirmez votre compte pour continuer.",
    resend: "Renvoyer l’e-mail",
    wait: "Renvoi possible dans",
    login: "Retour à la connexion",
    spamHint: "Vérifiez aussi les courriers indésirables.",
    emailLabel: "Adresse e-mail",
    authNotConfigured: "La connexion n’est pas configurée ici.",
    enterEmail: "Saisissez l’e-mail utilisé à l’inscription.",
    resendSent: "E-mail de vérification envoyé. Vérifiez boîte et spam.",
    resendFailed: "Impossible de renvoyer. Réessayez bientôt.",
    resendSignIn: "Connectez-vous d’abord, puis renvoyez depuis le compte si besoin."
  }
};

function VerifyEmailInner({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const locale = params.locale as Locale;
  const copy = COPY[locale] ?? COPY.en;

  const redirectSafe = useMemo(
    () =>
      sanitizeRedirectParam(searchParams.get("redirect"), locale) ??
      sanitizeRedirectParam(searchParams.get("next"), locale),
    [locale, searchParams]
  );

  useEffect(() => {
    const initialEmail = searchParams.get("email");
    if (initialEmail) setEmail(initialEmail);
  }, [searchParams]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onResend = async () => {
    if (loading || secondsLeft > 0) return;
    setLoading(true);
    setStatus(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setStatus(copy.authNotConfigured);
        return;
      }
      if (!email.trim()) {
        setStatus(copy.enterEmail);
        return;
      }
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}`
        }
      });
      if (error) {
        setStatus(error.message ?? copy.resendFailed);
        return;
      }
      setStatus(copy.resendSent);
      setSecondsLeft(60);
    } catch {
      setStatus(copy.resendFailed);
    } finally {
      setLoading(false);
    }
  };

  const loginHref = redirectSafe ? `/${locale}/login?redirect=${encodeURIComponent(redirectSafe)}` : `/${locale}/login`;

  return (
    <AuthPageFrame>
      <div className="w-full text-center">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} priority />
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 max-w-[42ch] text-sm text-muted sm:text-base">{copy.sub}</p>
        <p className="mt-2 text-xs text-dim">{copy.spamHint}</p>

        <div className="mt-8 w-full text-start">
          <label htmlFor="verify-email-input" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            {copy.emailLabel}
          </label>
          <input
            id="verify-email-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="input"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="mt-4">
          <AsyncButton
            type="button"
            fullWidth
            loading={loading}
            loadingText={copy.resend}
            onClick={onResend}
            disabled={secondsLeft > 0}
            className="gradient-button min-h-[48px] rounded-full text-[#09090B]"
          >
            {secondsLeft > 0 ? `${copy.wait} ${secondsLeft}s` : copy.resend}
          </AsyncButton>
        </div>

        {status ? (
          <p className="mt-4 text-start text-sm text-muted" role="status">
            {status}
          </p>
        ) : null}

        <Link
          href={loginHref}
          onClick={() => router.prefetch(`/${locale}/login`)}
          className="mt-8 inline-block text-sm text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copy.login}
        </Link>
      </div>
    </AuthPageFrame>
  );
}

export function VerifyEmailClient({ params }: { params: { locale: string } }) {
  return (
    <Suspense
      fallback={
        <AuthPageFrame>
          <div className="mx-auto w-full max-w-md py-8 text-center text-sm text-muted">…</div>
        </AuthPageFrame>
      }
    >
      <VerifyEmailInner params={params} />
    </Suspense>
  );
}
