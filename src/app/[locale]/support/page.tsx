"use client";

import Link from "next/link";
import { useState } from "react";

import { isLocale } from "@/lib/i18n";

const SUBJECTS = ["Technical Issue", "Billing Question", "Program Help", "Account Problem", "Coach Inquiry", "Other"] as const;

const COPY = {
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
    faqLink: "Browse FAQ →"
  },
  tr: {
    badge: "Destek",
    title: "Destek Merkezi",
    sub: "Yardım etmek için buradayız. Genellikle 24 saat içinde yanıt veririz.",
    name: "Adınız",
    email: "E-posta adresiniz",
    subject: "Konu",
    message: "Sorununuzu açıklayın...",
    cta: "Mesaj Gönder",
    sending: "Gönderiliyor...",
    success: (email: string) => `✓ Mesaj gönderildi! ${email} adresine 24 saat içinde yanıt vereceğiz.`,
    error: "Bir şeyler ters gitti. Bize doğrudan e-posta gönderebilirsiniz: tjfit.org@gmail.com",
    faqLink: "SSS'yi incele →"
  },
  ar: {
    badge: "الدعم",
    title: "مركز الدعم",
    sub: "نحن هنا للمساعدة. نرد عادةً خلال 24 ساعة.",
    name: "اسمك",
    email: "بريدك الإلكتروني",
    subject: "الموضوع",
    message: "صف مشكلتك...",
    cta: "إرسال الرسالة",
    sending: "جارٍ الإرسال...",
    success: (email: string) => `✓ تم إرسال الرسالة! سنرد على ${email} خلال 24 ساعة.`,
    error: "حدث خطأ ما. يمكنك مراسلتنا على: tjfit.org@gmail.com",
    faqLink: "تصفح الأسئلة الشائعة →"
  },
  es: {
    badge: "Soporte",
    title: "Centro de Soporte",
    sub: "Estamos aquí para ayudar. Solemos responder en 24 horas.",
    name: "Tu nombre",
    email: "Tu email",
    subject: "Asunto",
    message: "Describe tu problema...",
    cta: "Enviar Mensaje",
    sending: "Enviando...",
    success: (email: string) => `✓ ¡Mensaje enviado! Responderemos a ${email} en 24 horas.`,
    error: "Algo salió mal. También puedes escribirnos a tjfit.org@gmail.com",
    faqLink: "Ver FAQ →"
  },
  fr: {
    badge: "Support",
    title: "Centre de Support",
    sub: "Nous sommes là pour aider. Réponse généralement sous 24h.",
    name: "Votre nom",
    email: "Votre email",
    subject: "Sujet",
    message: "Décrivez votre problème...",
    cta: "Envoyer le message",
    sending: "Envoi...",
    success: (email: string) => `✓ Message envoyé ! Nous répondrons à ${email} sous 24h.`,
    error: "Une erreur s'est produite. Vous pouvez aussi nous écrire à tjfit.org@gmail.com",
    faqLink: "Voir la FAQ →"
  }
} as const;

export default function SupportPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const copy = COPY[locale] ?? COPY.en;
  const [form, setForm] = useState({ name: "", email: "", subject: "Technical Issue", message: "" });
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
      if (!res.ok) { setError(copy.error); return; }
      setSent(true);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">{copy.badge}</span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{copy.sub}</p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-6 text-sm text-emerald-300">
          {copy.success(form.email)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="input" type="text" placeholder={copy.name} value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="input" type="email" placeholder={copy.email} value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <select className="input" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-[#1E2028] bg-[#111215] p-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#22D3EE]"
            placeholder={copy.message} value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            required minLength={20}
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-[#22D3EE] py-3 text-sm font-bold text-[#09090B] disabled:opacity-50">
            {loading ? copy.sending : copy.cta}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href={`/${locale}/legal`} className="text-sm text-zinc-500 hover:text-zinc-300">
          {copy.faqLink}
        </Link>
      </div>
    </div>
  );
}
