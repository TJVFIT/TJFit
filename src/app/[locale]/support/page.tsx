"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { isLocale, type Locale } from "@/lib/i18n";

type SupportCopy = {
  badge: string;
  title: string;
  sub: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  cta: string;
  sending: string;
  success: (email: string) => string;
  error: string;
  faqLink: string;
  subjects: readonly { value: string; label: string }[];
};

const COPY: Record<Locale, SupportCopy> = {
  en: {
    badge: "Support",
    title: "Support Center",
    sub: "We're here to help. Usually respond within 24 hours.",
    name: "Your name",
    email: "Your email",
    subject: "Subject",
    message: "Describe your issue (min 20 characters)...",
    cta: "Send Message",
    sending: "Sending...",
    success: (email: string) => `✓ Message sent! We'll reply to ${email} within 24 hours.`,
    error: "Something went wrong. You can also email us directly at tjfit.org@gmail.com",
    faqLink: "Browse FAQ →",
    subjects: [
      { value: "Technical Issue", label: "Technical issue" },
      { value: "Billing Question", label: "Billing question" },
      { value: "Program Help", label: "Program help" },
      { value: "Account Problem", label: "Account problem" },
      { value: "Coach Inquiry", label: "Coach inquiry" },
      { value: "Other", label: "Other" }
    ] as const
  },
  tr: {
    badge: "Destek",
    title: "Destek Merkezi",
    sub: "Yardım etmek için buradayız. Genellikle 24 saat içinde yanıt veririz.",
    name: "Adınız",
    email: "E-posta adresiniz",
    subject: "Konu",
    message: "Sorununuzu açıklayın (en az 20 karakter)...",
    cta: "Mesaj Gönder",
    sending: "Gönderiliyor...",
    success: (email: string) => `✓ Mesaj gönderildi! ${email} adresine 24 saat içinde yanıt vereceğiz.`,
    error: "Bir şeyler ters gitti. Bize doğrudan e-posta gönderebilirsiniz: tjfit.org@gmail.com",
    faqLink: "SSS'yi incele →",
    subjects: [
      { value: "Technical Issue", label: "Teknik sorun" },
      { value: "Billing Question", label: "Faturalama" },
      { value: "Program Help", label: "Program yardımı" },
      { value: "Account Problem", label: "Hesap sorunu" },
      { value: "Coach Inquiry", label: "Koç talebi" },
      { value: "Other", label: "Diğer" }
    ] as const
  },
  ar: {
    badge: "الدعم",
    title: "مركز الدعم",
    sub: "نحن هنا للمساعدة. نرد عادةً خلال 24 ساعة.",
    name: "اسمك",
    email: "بريدك الإلكتروني",
    subject: "الموضوع",
    message: "صف مشكلتك (٢٠ حرفاً على الأقل)...",
    cta: "إرسال الرسالة",
    sending: "جارٍ الإرسال...",
    success: (email: string) => `✓ تم إرسال الرسالة! سنرد على ${email} خلال 24 ساعة.`,
    error: "حدث خطأ ما. يمكنك مراسلتنا على: tjfit.org@gmail.com",
    faqLink: "تصفح الأسئلة الشائعة →",
    subjects: [
      { value: "Technical Issue", label: "مشكلة تقنية" },
      { value: "Billing Question", label: "الفوترة" },
      { value: "Program Help", label: "مساعدة البرنامج" },
      { value: "Account Problem", label: "مشكلة الحساب" },
      { value: "Coach Inquiry", label: "استفسار عن المدرب" },
      { value: "Other", label: "أخرى" }
    ] as const
  },
  es: {
    badge: "Soporte",
    title: "Centro de Soporte",
    sub: "Estamos aquí para ayudar. Solemos responder en 24 horas.",
    name: "Tu nombre",
    email: "Tu email",
    subject: "Asunto",
    message: "Describe tu problema (mín. 20 caracteres)...",
    cta: "Enviar Mensaje",
    sending: "Enviando...",
    success: (email: string) => `✓ ¡Mensaje enviado! Responderemos a ${email} en 24 horas.`,
    error: "Algo salió mal. También puedes escribirnos a tjfit.org@gmail.com",
    faqLink: "Ver FAQ →",
    subjects: [
      { value: "Technical Issue", label: "Problema técnico" },
      { value: "Billing Question", label: "Facturación" },
      { value: "Program Help", label: "Ayuda con programas" },
      { value: "Account Problem", label: "Problema de cuenta" },
      { value: "Coach Inquiry", label: "Consulta coach" },
      { value: "Other", label: "Otro" }
    ] as const
  },
  fr: {
    badge: "Support",
    title: "Centre de Support",
    sub: "Nous sommes là pour aider. Réponse généralement sous 24h.",
    name: "Votre nom",
    email: "Votre email",
    subject: "Sujet",
    message: "Décrivez votre problème (min. 20 caractères)...",
    cta: "Envoyer le message",
    sending: "Envoi...",
    success: (email: string) => `✓ Message envoyé ! Nous répondrons à ${email} sous 24h.`,
    error: "Une erreur s'est produite. Vous pouvez aussi nous écrire à tjfit.org@gmail.com",
    faqLink: "Voir la FAQ →",
    subjects: [
      { value: "Technical Issue", label: "Problème technique" },
      { value: "Billing Question", label: "Facturation" },
      { value: "Program Help", label: "Aide programme" },
      { value: "Account Problem", label: "Problème de compte" },
      { value: "Coach Inquiry", label: "Question coach" },
      { value: "Other", label: "Autre" }
    ] as const
  }
};

export default function SupportPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const copy = COPY[locale];
  const defaultSubject = useMemo(() => copy.subjects[0]?.value ?? "Technical Issue", [copy.subjects]);
  const [form, setForm] = useState({ name: "", email: "", subject: defaultSubject, message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        setError(copy.error);
        return;
      }
      setSent(true);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs variant="compact" />
      <span className="badge relative">{copy.badge}</span>
      <h1 className="relative mt-4 font-display text-3xl font-semibold sm:text-4xl">
        <span className="tj-title-shimmer">{copy.title}</span>
      </h1>
      <p className="relative mt-2 text-sm text-muted">{copy.sub}</p>

      {sent ? (
        <div
          className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-6 text-sm text-emerald-300"
          role="status"
        >
          {copy.success(form.email)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="support-name" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.name}
            </label>
            <input
              id="support-name"
              className="input"
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="support-email" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.email}
            </label>
            <input
              id="support-email"
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="support-subject" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.subject}
            </label>
            <select
              id="support-subject"
              className="input"
              name="subject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            >
              {copy.subjects.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="support-message" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              {copy.message}
            </label>
            <textarea
              id="support-message"
              className="min-h-[120px] w-full rounded-xl border border-divider bg-surface p-3 text-sm text-white outline-none ring-purple-400/20 placeholder:text-dim focus:border-accent focus:ring-2 focus:ring-accent/20"
              name="message"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              required
              minLength={20}
            />
          </div>
          {error ? (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-full bg-accent py-3 text-sm font-bold text-[#09090B] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? copy.sending : copy.cta}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/legal`}
          className="text-sm text-faint transition-colors hover:text-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copy.faqLink}
        </Link>
      </div>
    </div>
  );
}
