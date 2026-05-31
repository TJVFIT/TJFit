"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthPageFrame } from "@/components/auth-page-frame";
import { Logo } from "@/components/ui/Logo";
import { mapSupabaseAuthError } from "@/lib/auth-errors";
import { getAuthCopy } from "@/lib/launch-copy";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const COPY: Record<
  Locale,
  {
    verifying: string;
    title: string;
    sub: string;
    newPassword: string;
    confirmPassword: string;
    update: string;
    updating: string;
    success: string;
    invalid: string;
    backToLogin: string;
    mismatch: string;
  }
> = {
  en: {
    verifying: "Verifying your reset link…",
    title: "Set a new password",
    sub: "Choose a strong password you haven’t used before on this site.",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    update: "Update password",
    updating: "Updating…",
    success: "Password updated. You can sign in with your new password.",
    invalid: "This reset link is invalid or has expired. Request a new link from the forgot password page.",
    backToLogin: "Back to sign in",
    mismatch: "Passwords don’t match."
  },
  tr: {
    verifying: "Sıfırlama bağlantısı doğrulanıyor…",
    title: "Yeni şifre belirle",
    sub: "Bu sitede daha önce kullanmadığın güçlü bir şifre seç.",
    newPassword: "Yeni şifre",
    confirmPassword: "Yeni şifreyi tekrarla",
    update: "Şifreyi güncelle",
    updating: "Güncelleniyor…",
    success: "Şifre güncellendi. Yeni şifrenle giriş yapabilirsin.",
    invalid: "Bu sıfırlama bağlantısı geçersiz veya süresi dolmuş. Şifremi unuttum sayfasından yeniden iste.",
    backToLogin: "Girişe dön",
    mismatch: "Şifreler uyuşmuyor."
  },
  ar: {
    verifying: "جارٍ التحقق من الرابط…",
    title: "تعيين كلمة مرور جديدة",
    sub: "اختر كلمة مرور قوية لم تستخدمها من قبل على هذا الموقع.",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    update: "تحديث كلمة المرور",
    updating: "جارٍ التحديث…",
    success: "تم التحديث. يمكنك تسجيل الدخول بكلمة المرور الجديدة.",
    invalid: "رابط إعادة التعيين غير صالح أو منتهٍ. اطلب رابطاً جديداً من صفحة نسيت كلمة المرور.",
    backToLogin: "العودة لتسجيل الدخول",
    mismatch: "كلمتا المرور غير متطابقتين."
  },
  es: {
    verifying: "Verificando el enlace…",
    title: "Establece una nueva contraseña",
    sub: "Elige una contraseña fuerte que no hayas usado antes en este sitio.",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    update: "Actualizar contraseña",
    updating: "Actualizando…",
    success: "Contraseña actualizada. Ya puedes entrar con la nueva.",
    invalid: "El enlace no es válido o ha caducado. Solicita uno nuevo en “Olvidé mi contraseña”.",
    backToLogin: "Volver al inicio de sesión",
    mismatch: "Las contraseñas no coinciden."
  },
  fr: {
    verifying: "Vérification du lien…",
    title: "Définir un nouveau mot de passe",
    sub: "Choisissez un mot de passe fort que vous n’avez pas déjà utilisé ici.",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    update: "Mettre à jour",
    updating: "Mise à jour…",
    success: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    invalid: "Ce lien est invalide ou expiré. Demandez un nouveau lien via “Mot de passe oublié”.",
    backToLogin: "Retour à la connexion",
    mismatch: "Les mots de passe ne correspondent pas."
  }
};

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const copy = getAuthCopy(locale);
  const ui = COPY[locale] ?? COPY.en;
  const router = useRouter();

  const [phase, setPhase] = useState<"loading" | "ready" | "invalid">("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sessionFoundRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPhase("invalid");
      return;
    }
    let cancelled = false;
    const markReady = (session: { access_token: string } | null) => {
      if (cancelled || !session) return;
      sessionFoundRef.current = true;
      setPhase("ready");
      setError(null);
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        markReady(session);
      }
      if (event === "SIGNED_IN" && session) {
        markReady(session);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      markReady(session);
    });

    const t = window.setTimeout(() => {
      if (cancelled || sessionFoundRef.current) return;
      setPhase("invalid");
    }, 2800);

    return () => {
      cancelled = true;
      clearTimeout(t);
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError(copy.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(ui.mismatch);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.authNotConfigured);
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(mapSupabaseAuthError(err.message, copy));
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
      window.setTimeout(() => {
        router.replace(`/${locale}/login`);
        router.refresh();
      }, 1200);
    } catch {
      setError(copy.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  if (phase === "loading") {
    return (
      <AuthPageFrame>
        <div className="w-full text-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
          <p className="mt-8 text-sm text-muted">{ui.verifying}</p>
        </div>
      </AuthPageFrame>
    );
  }

  if (phase === "invalid") {
    return (
      <AuthPageFrame>
        <div className="w-full text-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
          <p className="mt-6 text-sm text-red-300">{ui.invalid}</p>
          <Link
            href={`/${locale}/forgot-password`}
            className="mt-6 inline-block text-sm text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {copy.forgotPasswordLink}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="mt-4 block text-sm text-faint transition-colors hover:text-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {ui.backToLogin}
          </Link>
        </div>
      </AuthPageFrame>
    );
  }

  if (done) {
    return (
      <AuthPageFrame>
        <div className="w-full text-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
          <p className="mt-6 text-sm text-emerald-300">{ui.success}</p>
          <Link
            href={`/${locale}/login`}
            className="mt-6 inline-block text-sm text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {ui.backToLogin}
          </Link>
        </div>
      </AuthPageFrame>
    );
  }

  return (
    <AuthPageFrame>
      <div className="w-full">
        <div className="mb-6 flex justify-center">
          <Logo variant="icon" size="auth" href={`/${locale}`} />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-white">{ui.title}</h1>
        <p className="mt-2 text-center text-sm text-muted">{ui.sub}</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <label htmlFor="reset-password-new" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
              {ui.newPassword}
            </label>
            <input
              id="reset-password-new"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="reset-password-confirm" className="mb-1.5 block text-start text-xs font-medium text-[var(--color-text-secondary)]">
              {ui.confirmPassword}
            </label>
            <input
              id="reset-password-confirm"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error ? (
            <div className="tj-api-error-block" role="alert">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button min-h-[48px] w-full touch-manipulation rounded-full px-5 py-3 text-base font-semibold text-[#09090B] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? ui.updating : ui.update}
          </button>
        </form>
        <Link
          href={`/${locale}/login`}
          className="mt-5 block text-center text-sm text-faint transition-colors hover:text-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {ui.backToLogin}
        </Link>
      </div>
    </AuthPageFrame>
  );
}
