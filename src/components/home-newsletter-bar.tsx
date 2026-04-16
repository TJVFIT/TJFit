"use client";

import { useState } from "react";
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
    placeholder: "you@example.com",
    cta: "Send Me The Plan",
    success: "Check your inbox — your free plan is on its way.",
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
    <section className="border-y border-[#1E2028] bg-[#111215] px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-4xl border border-[#1E2028] bg-[#0A0A0B] p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#52525B]">Email</p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#A1A1AA]">{copy.sub}</p>
          </div>
          <form onSubmit={onSubmit} className="w-full shrink-0 lg:max-w-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.placeholder}
                className="min-h-[48px] w-full border border-[#2A2D36] bg-[#111215] px-4 text-sm text-white outline-none transition-[border-color,box-shadow] placeholder:text-[#52525B] focus:border-[#22D3EE]/40 focus:ring-1 focus:ring-[#22D3EE]/25"
                disabled={busy || done}
              />
              <button
                type="submit"
                disabled={busy || done}
                className="min-h-[48px] shrink-0 border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-6 text-sm font-semibold text-[#22D3EE] transition-[background-color,border-color] hover:bg-[#22D3EE]/15 disabled:opacity-60 sm:px-8"
              >
                {busy ? "…" : copy.cta}
              </button>
            </div>
            {done ? <p className="mt-3 text-sm text-[#A1A1AA]">{copy.success}</p> : null}
            {error ? <p className="mt-3 text-sm text-rose-400/90">{error}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
