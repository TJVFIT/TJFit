"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";

import { AsyncButton } from "@/components/ui/AsyncButton";
import { Logo } from "@/components/ui/Logo";
import { isLocale, type Locale } from "@/lib/i18n";
import { sanitizeRedirectParam } from "@/lib/safe-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const COPY: Record<Locale, { title: string; sub: string; resend: string; wait: string; login: string }> = {
  en: {
    title: "Check your email - we sent a verification link",
    sub: "Open your inbox and confirm your account to continue.",
    resend: "Resend email",
    wait: "Resend available in",
    login: "Back to login"
  },
  tr: {
    title: "E-postani kontrol et - dogrulama baglantisi gonderdik",
    sub: "Devam etmek icin gelen kutundan hesabini dogrula.",
    resend: "E-postayi yeniden gonder",
    wait: "Tekrar gonderim su kadar sonra",
    login: "Girise don"
  },
  ar: {
    title: "تحقق من بريدك - ارسلنا رابط التحقق",
    sub: "افتح بريدك الالكتروني واكد حسابك للمتابعة.",
    resend: "اعادة ارسال البريد",
    wait: "اعادة الارسال متاحة خلال",
    login: "العودة لتسجيل الدخول"
  },
  es: {
    title: "Revisa tu correo - enviamos un enlace de verificacion",
    sub: "Abre tu bandeja y confirma tu cuenta para continuar.",
    resend: "Reenviar correo",
    wait: "Reenvio disponible en",
    login: "Volver al inicio de sesion"
  },
  fr: {
    title: "Verifiez votre email - nous avons envoye un lien",
    sub: "Ouvrez votre boite de reception et confirmez votre compte.",
    resend: "Renvoyer l'email",
    wait: "Renvoi disponible dans",
    login: "Retour a la connexion"
  }
};

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  if (!isLocale(params?.locale ?? "")) {
    notFound();
  }
  const locale = params.locale as Locale;
  const copy = COPY[locale];

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
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const onResend = async () => {
    if (loading || secondsLeft > 0) return;
    setLoading(true);
    setStatus(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setStatus("Auth is not configured.");
        return;
      }
      if (!email.trim()) {
        setStatus("Please enter your email address first.");
        return;
      }
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}`
        }
      });
      if (error) {
        setStatus(error.message ?? "Could not resend verification email.");
        return;
      }
      if (!data?.user) {
        setStatus("Please sign in again and request verification.");
      } else {
        setStatus("Verification email sent. Please check your inbox and spam folder.");
        setSecondsLeft(COOLDOWN_SECONDS);
      }
    } catch {
      setStatus("Could not resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[100svh] w-full max-w-[560px] flex-col items-center justify-center px-6 py-14 text-center">
      <Logo variant="icon" size="auth" href={`/${locale}`} priority />
      <h1 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 max-w-[42ch] text-sm text-muted sm:text-base">{copy.sub}</p>
      <p className="mt-2 text-xs text-dim">Do not forget to check your spam folder.</p>

      <div className="mt-8 w-full max-w-[360px]">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="input mb-3"
          autoComplete="email"
          required
        />
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

      {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}

      <Link
        href={redirectSafe ? `/${locale}/login?redirect=${encodeURIComponent(redirectSafe)}` : `/${locale}/login`}
        onClick={() => router.prefetch(`/${locale}/login`)}
        className="mt-8 text-sm text-accent hover:text-white"
      >
        {copy.login}
      </Link>
    </section>
  );
}
