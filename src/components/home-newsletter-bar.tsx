"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const COPY: Record<
  Locale,
  {
    title: string;
    sub: string;
    placeholder: string;
    cta: string;
    success: string;
    duplicate: string;
    invalid: string;
    generic: string;
  }
> = {
  en: {
    title: "Get a Free 3-Day Workout Plan",
    sub: "Plus weekly fitness tips and nutrition guides. No spam. Unsubscribe anytime.",
    placeholder: "your@email.com",
    cta: "Send Me The Plan",
    success: "Check your inbox! Your free plan is on its way.",
    duplicate: "This email is already subscribed.",
    invalid: "Please enter a valid email address.",
    generic: "Could not subscribe right now. Please try again.",
  },
  tr: {
    title: "Ucretsiz 3 Gunluk Antrenman Plani Al",
    sub: "Haftalik fitness ipuclari ve beslenme rehberleri de gelir. Spam yok.",
    placeholder: "ornek@mail.com",
    cta: "Plani Gonder",
    success: "Gelen kutunu kontrol et — ucretsiz planin yolda.",
    duplicate: "Bu e-posta zaten kayitli.",
    invalid: "Gecerli bir e-posta girin.",
    generic: "Su an kayit olunamadi. Tekrar deneyin.",
  },
  ar: {
    title: "احصل على خطة تمرين مجانية لمدة 3 أيام",
    sub: "مع نصائح أسبوعية للياقة والتغذية. بدون إزعاج.",
    placeholder: "you@example.com",
    cta: "أرسل الخطة",
    success: "تحقق من بريدك — خطتك المجانية في الطريق.",
    duplicate: "هذا البريد مشترك بالفعل.",
    invalid: "يرجى إدخال بريد إلكتروني صحيح.",
    generic: "تعذر الاشتراك الآن. حاول مرة أخرى.",
  },
  es: {
    title: "Consigue un Plan de Entrenamiento Gratis de 3 Dias",
    sub: "Tambien recibes tips semanales de fitness y nutricion. Sin spam.",
    placeholder: "tu@email.com",
    cta: "Enviame el Plan",
    success: "Revisa tu correo — tu plan gratis va en camino.",
    duplicate: "Este correo ya esta suscrito.",
    invalid: "Ingresa un correo valido.",
    generic: "No se pudo suscribir ahora. Intenta de nuevo.",
  },
  fr: {
    title: "Recevez un Plan d'Entrainement Gratuit de 3 Jours",
    sub: "Avec des conseils fitness et nutrition chaque semaine. Sans spam.",
    placeholder: "vous@email.com",
    cta: "Envoyez le Plan",
    success: "Verifiez votre boite mail — votre plan gratuit arrive.",
    duplicate: "Cet e-mail est deja abonne.",
    invalid: "Saisissez un e-mail valide.",
    generic: "Inscription impossible pour le moment. Reessayez.",
  },
};

export function HomeNewsletterBar({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError(copy.invalid);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, locale, source: "homepage-newsletter" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        const msg = String(json?.error ?? "");
        setError(msg === "This email is already subscribed." ? copy.duplicate : copy.generic);
        return;
      }
      setBusy(false);
      setDone(true);
    } catch {
      setBusy(false);
      setError(copy.generic);
    }
  };

  return (
    <section className="reveal-section relative border-y border-[rgba(34,211,238,0.08)] bg-[rgba(34,211,238,0.03)] px-6 py-[clamp(3rem,6vw,4.5rem)] lg:px-12">
      <span className="ghost-text pointer-events-none start-1/2 top-6 -translate-x-1/2 opacity-[0.02]" aria-hidden>
        NEWSLETTER
      </span>
      <div className="relative z-[1] mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="min-w-0 flex-1 text-center lg:text-start">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{copy.title}</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted lg:mx-0">{copy.sub}</p>
        </div>
        <form onSubmit={onSubmit} className="w-full shrink-0 lg:max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.placeholder}
              className="min-h-[48px] w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,18,0.75)] px-4 text-sm text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] outline-none backdrop-blur-md transition-[border-color,box-shadow] placeholder:text-dim focus:border-[rgba(34,211,238,0.35)] focus:ring-1 focus:ring-[rgba(34,211,238,0.2)]"
              disabled={busy || done}
            />
            <button
              type="submit"
              disabled={busy || done}
              className="min-h-[48px] shrink-0 rounded-[10px] bg-accent px-6 text-sm font-extrabold text-[#09090B] shadow-[0_12px_40px_rgba(34,211,238,0.22)] transition-[filter,transform] duration-200 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-60 sm:px-8"
            >
              {busy ? "…" : copy.cta}
            </button>
          </div>
          {done ? (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-accent sm:justify-start">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              {copy.success}
            </p>
          ) : null}
          {error && !done ? <p className="mt-3 text-sm text-rose-400/90">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
