"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthPageFrame } from "@/components/auth-page-frame";
import { Logo } from "@/components/ui/Logo";
import { isLocale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const COPY = {
  en: {
    title: "Reset your password",
    sub: "Enter your email and we'll send you a reset link.",
    placeholder: "Your email address",
    cta: "Send Reset Link",
    sending: "Sending...",
    success: "Check your inbox! We sent a password reset link.",
    backToLogin: "← Back to login",
    error: "Something went wrong. Please try again."
  },
  tr: {
    title: "Şifrenizi sıfırlayın",
    sub: "E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.",
    placeholder: "E-posta adresiniz",
    cta: "Sıfırlama Bağlantısı Gönder",
    sending: "Gönderiliyor...",
    success: "Gelen kutunuzu kontrol edin! Şifre sıfırlama bağlantısı gönderdik.",
    backToLogin: "← Girişe dön",
    error: "Bir şeyler ters gitti. Lütfen tekrar deneyin."
  },
  ar: {
    title: "إعادة تعيين كلمة المرور",
    sub: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
    placeholder: "بريدك الإلكتروني",
    cta: "إرسال رابط إعادة التعيين",
    sending: "جارٍ الإرسال...",
    success: "تحقق من بريدك الوارد! أرسلنا رابط إعادة تعيين كلمة المرور.",
    backToLogin: "← العودة لتسجيل الدخول",
    error: "حدث خطأ ما. يرجى المحاولة مرة أخرى."
  },
  es: {
    title: "Restablecer contraseña",
    sub: "Ingresa tu email y te enviaremos un enlace de restablecimiento.",
    placeholder: "Tu dirección de email",
    cta: "Enviar enlace",
    sending: "Enviando...",
    success: "¡Revisa tu bandeja de entrada! Enviamos un enlace de restablecimiento.",
    backToLogin: "← Volver al inicio de sesión",
    error: "Algo salió mal. Por favor inténtalo de nuevo."
  },
  fr: {
    title: "Réinitialiser le mot de passe",
    sub: "Entrez votre email et nous vous enverrons un lien de réinitialisation.",
    placeholder: "Votre adresse email",
    cta: "Envoyer le lien",
    sending: "Envoi en cours...",
    success: "Vérifiez votre boîte de réception ! Nous avons envoyé un lien de réinitialisation.",
    backToLogin: "← Retour à la connexion",
    error: "Une erreur s'est produite. Veuillez réessayer."
  }
} as const;

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const copy = COPY[locale] ?? COPY.en;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setError(copy.error); return; }
      const redirectTo = `${window.location.origin}/${locale}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (err) { setError(err.message || copy.error); return; }
      setSent(true);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageFrame>
      <div className="w-full">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">{copy.title}</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">{copy.sub}</p>
        {sent ? (
          <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
            {copy.success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              className="input"
              placeholder={copy.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="gradient-button w-full rounded-full py-3 text-sm font-semibold text-[#09090B] disabled:opacity-50"
            >
              {loading ? copy.sending : copy.cta}
            </button>
          </form>
        )}
        <Link href={`/${locale}/login`} className="mt-5 block text-center text-sm text-zinc-500 hover:text-zinc-300">
          {copy.backToLogin}
        </Link>
      </div>
    </AuthPageFrame>
  );
}
