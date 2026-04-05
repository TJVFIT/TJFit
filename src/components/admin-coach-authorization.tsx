"use client";

import { useEffect, useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import type { Locale } from "@/lib/i18n";

type Coach = {
  id: string;
  email: string;
  role: string;
};

type Copy = {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  authorizeCta: string;
  authorizing: string;
  authorizedSuccess: string;
  genericError: string;
  listTitle: string;
  empty: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: "Coach authorization",
    subtitle: "Enter email and password to create a coach account. They can log in and access the coach dashboard.",
    emailPlaceholder: "Coach email",
    passwordPlaceholder: "Password (min 6 characters)",
    authorizeCta: "Authorize as coach",
    authorizing: "Authorizing...",
    authorizedSuccess: "Coach authorized. They can now log in with this email and password.",
    genericError: "Something went wrong",
    listTitle: "Authorized coaches",
    empty: "No coaches yet."
  },
  tr: {
    title: "Koc yetkilendirme",
    subtitle: "Koc hesabi olusturmak icin e-posta ve sifre girin. Ardindan koc paneline giris yapabilirler.",
    emailPlaceholder: "Koc e-postasi",
    passwordPlaceholder: "Sifre (en az 6 karakter)",
    authorizeCta: "Koc olarak yetkilendir",
    authorizing: "Yetkilendiriliyor...",
    authorizedSuccess: "Koc yetkilendirildi. Artik bu e-posta ve sifre ile giris yapabilir.",
    genericError: "Bir seyler ters gitti",
    listTitle: "Yetkili koçlar",
    empty: "Henuz koc yok."
  },
  ar: {
    title: "????? ??????",
    subtitle: "???? ?????? ????? ?????? ?????? ???? ????. ????? ????? ?????? ????? ??????.",
    emailPlaceholder: "???? ??????",
    passwordPlaceholder: "???? ?????? (6 ???? ??? ?????)",
    authorizeCta: "????? ?????",
    authorizing: "???? ???????...",
    authorizedSuccess: "?? ????? ??????. ????? ????? ?????? ???? ?????? ????? ??????.",
    genericError: "??? ??? ??",
    listTitle: "???????? ????????",
    empty: "?? ???? ?????? ???."
  },
  es: {
    title: "Autorizacion de coach",
    subtitle: "Introduce correo y contrasena para crear una cuenta de coach. Podra acceder al panel de coach.",
    emailPlaceholder: "Correo del coach",
    passwordPlaceholder: "Contrasena (minimo 6 caracteres)",
    authorizeCta: "Autorizar como coach",
    authorizing: "Autorizando...",
    authorizedSuccess: "Coach autorizado. Ya puede iniciar sesion con este correo y contrasena.",
    genericError: "Algo salio mal",
    listTitle: "Coaches autorizados",
    empty: "Aun no hay coaches."
  },
  fr: {
    title: "Autorisation coach",
    subtitle: "Saisissez email et mot de passe pour creer un compte coach. Il pourra acceder au tableau coach.",
    emailPlaceholder: "Email du coach",
    passwordPlaceholder: "Mot de passe (6 caracteres min)",
    authorizeCta: "Autoriser comme coach",
    authorizing: "Autorisation...",
    authorizedSuccess: "Coach autorise. Il peut maintenant se connecter avec cet email et ce mot de passe.",
    genericError: "Une erreur est survenue",
    listTitle: "Coachs autorises",
    empty: "Aucun coach pour le moment."
  }
};

export function AdminCoachAuthorization({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCoaches = () => {
    fetch("/api/admin/coaches")
      .then((res) => res.json())
      .then((data) => {
        if (data.coaches) setCoaches(data.coaches);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const authorizeCoach = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/authorize-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setSuccess(copy.authorizedSuccess);
      setEmail("");
      setPassword("");
      fetchCoaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-[32px] p-6">
      <p className="text-lg font-semibold text-white">{copy.title}</p>
      <p className="mt-2 text-sm text-zinc-400">{copy.subtitle}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void authorizeCoach();
        }}
        className="mt-6 space-y-4"
      >
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
          placeholder={copy.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <AsyncButton
          type="button"
          variant="primary"
          fullWidth
          loading={loading}
          loadingText={copy.authorizing}
          className="gradient-button rounded-full px-5 py-3 text-sm font-medium text-white"
          onClick={() => authorizeCoach()}
        >
          {copy.authorizeCta}
        </AsyncButton>
      </form>

      <div className="mt-6">
        <p className="text-sm font-medium text-white">
          {copy.listTitle} ({coaches.length})
        </p>
        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {coaches.length === 0 ? (
            <p className="text-sm text-zinc-500">{copy.empty}</p>
          ) : (
            coaches.map((c) => (
              <div
                key={c.id}
                className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
              >
                {c.email}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

