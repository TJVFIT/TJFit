"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { AuthPageFrame } from "@/components/auth-page-frame";
import { Logo } from "@/components/ui/Logo";
import { isLocale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const COPY = {
  en: {
    title: "Set a new password",
    sub: "Enter your new password below.",
    placeholderNew: "New password (min 8 characters)",
    placeholderConfirm: "Confirm new password",
    cta: "Update Password",
    submitting: "Updating...",
    success: "Password updated. Redirecting...",
    backToLogin: "← Back to login",
    mismatch: "Passwords don't match.",
    tooShort: "Password must be at least 8 characters.",
    sessionMissing: "Reset link expired or invalid. Request a new one.",
    error: "Could not update password. Please try again."
  },
  tr: {
    title: "Yeni şifre belirleyin",
    sub: "Yeni şifrenizi aşağıya girin.",
    placeholderNew: "Yeni şifre (en az 8 karakter)",
    placeholderConfirm: "Yeni şifreyi onaylayın",
    cta: "Şifreyi Güncelle",
    submitting: "Güncelleniyor...",
    success: "Şifre güncellendi. Yönlendiriliyor...",
    backToLogin: "← Girişe dön",
    mismatch: "Şifreler eşleşmiyor.",
    tooShort: "Şifre en az 8 karakter olmalı.",
    sessionMissing: "Sıfırlama bağlantısının süresi doldu veya geçersiz. Yeni bir tane isteyin.",
    error: "Şifre güncellenemedi. Lütfen tekrar deneyin."
  },
  ar: {
    title: "تعيين كلمة مرور جديدة",
    sub: "أدخل كلمة المرور الجديدة أدناه.",
    placeholderNew: "كلمة المرور الجديدة (8 أحرف على الأقل)",
    placeholderConfirm: "تأكيد كلمة المرور الجديدة",
    cta: "تحديث كلمة المرور",
    submitting: "جارٍ التحديث...",
    success: "تم تحديث كلمة المرور. جارٍ التحويل...",
    backToLogin: "← العودة لتسجيل الدخول",
    mismatch: "كلمات المرور غير متطابقة.",
    tooShort: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
    sessionMissing: "انتهت صلاحية رابط إعادة التعيين أو أنه غير صالح. اطلب رابطاً جديداً.",
    error: "تعذر تحديث كلمة المرور. يرجى المحاولة مرة أخرى."
  },
  es: {
    title: "Establecer nueva contraseña",
    sub: "Ingresa tu nueva contraseña abajo.",
    placeholderNew: "Nueva contraseña (mínimo 8 caracteres)",
    placeholderConfirm: "Confirmar nueva contraseña",
    cta: "Actualizar Contraseña",
    submitting: "Actualizando...",
    success: "Contraseña actualizada. Redirigiendo...",
    backToLogin: "← Volver al inicio de sesión",
    mismatch: "Las contraseñas no coinciden.",
    tooShort: "La contraseña debe tener al menos 8 caracteres.",
    sessionMissing: "El enlace de restablecimiento expiró o no es válido. Solicita uno nuevo.",
    error: "No se pudo actualizar la contraseña. Inténtalo de nuevo."
  },
  fr: {
    title: "Définir un nouveau mot de passe",
    sub: "Entrez votre nouveau mot de passe ci-dessous.",
    placeholderNew: "Nouveau mot de passe (min 8 caractères)",
    placeholderConfirm: "Confirmer le nouveau mot de passe",
    cta: "Mettre à jour le mot de passe",
    submitting: "Mise à jour...",
    success: "Mot de passe mis à jour. Redirection...",
    backToLogin: "← Retour à la connexion",
    mismatch: "Les mots de passe ne correspondent pas.",
    tooShort: "Le mot de passe doit comporter au moins 8 caractères.",
    sessionMissing: "Le lien de réinitialisation est expiré ou invalide. Demandez-en un nouveau.",
    error: "Impossible de mettre à jour le mot de passe. Veuillez réessayer."
  }
} as const;

export default function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const localeParam = use(params).locale;
  const locale = isLocale(localeParam) ? localeParam : "en";
  const copy = COPY[locale] ?? COPY.en;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  // Supabase establishes a recovery session from the URL hash when the user
  // arrives via the password-reset email. If the link is expired/invalid we
  // tell the user to request a fresh one rather than silently 401 on submit.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSessionReady(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSessionReady(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (password.length < 8) {
      setError(copy.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(copy.mismatch);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.error);
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        // Avoid leaking raw Supabase error text (could include rate-limit or
        // auth-state details). Use a single generic message.
        setError(copy.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }, 1200);
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
        <p className="mt-2 text-center text-sm text-muted">{copy.sub}</p>

        {sessionReady === false ? (
          <div className="mt-6 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-center text-sm text-red-300">
            {copy.sessionMissing}
          </div>
        ) : done ? (
          <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
            {copy.success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              className="input"
              placeholder={copy.placeholderNew}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <input
              type="password"
              className="input"
              placeholder={copy.placeholderConfirm}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || sessionReady !== true}
              className="gradient-button w-full rounded-full py-3 text-sm font-semibold text-[#09090B] disabled:opacity-50"
            >
              {loading ? copy.submitting : copy.cta}
            </button>
          </form>
        )}

        <Link href={`/${locale}/login`} className="mt-5 block text-center text-sm text-faint hover:text-bright">
          {copy.backToLogin}
        </Link>
      </div>
    </AuthPageFrame>
  );
}
