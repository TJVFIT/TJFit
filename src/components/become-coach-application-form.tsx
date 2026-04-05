"use client";

import { useState } from "react";
import { AsyncButton } from "@/components/ui/AsyncButton";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

const SUCCESS_COPY: Record<Locale, string> = {
  en: "Application received. We'll be in touch within 48 hours.",
  tr: "Basvurun alindi. 48 saat icinde sizinle iletisime gececegiz.",
  ar: "تم استلام طلبك. سنتواصل معك خلال 48 ساعة.",
  es: "Hemos recibido tu solicitud. Te contactaremos en 48 horas.",
  fr: "Candidature recue. Nous vous contacterons sous 48 heures."
};

const ERROR_REQUIRED: Record<Locale, string> = {
  en: "Please complete all required fields.",
  tr: "Lutfen tum zorunlu alanlari doldurun.",
  ar: "يرجى إكمال جميع الحقول المطلوبة.",
  es: "Completa todos los campos obligatorios.",
  fr: "Veuillez remplir tous les champs obligatoires."
};

const ERROR_SUBMIT: Record<Locale, string> = {
  en: "Could not submit your application.",
  tr: "Basvuru gonderilemedi.",
  ar: "تعذر إرسال الطلب.",
  es: "No se pudo enviar la solicitud.",
  fr: "Impossible d'envoyer la candidature."
};

const EMAIL_PLACEHOLDER: Record<Locale, string> = {
  en: "Email",
  tr: "E-posta",
  ar: "البريد الالكتروني",
  es: "Correo electronico",
  fr: "Email"
};

export function BecomeCoachApplicationForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const copy = dict.becomeCoach;
  const [age, setAge] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [languages, setLanguages] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (working) return;
    setError(null);
    const ageNum = Number.parseInt(age, 10);
    if (!Number.isFinite(ageNum) || ageNum < 20) {
      setError(copy.ageError);
      return;
    }
    if (!fullName.trim() || !specialty.trim() || !languages.trim() || !country.trim() || !experience.trim()) {
      setError(ERROR_REQUIRED[locale] ?? ERROR_REQUIRED.en);
      return;
    }
    setWorking(true);
    try {
      const res = await fetch("/api/coach-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          age: ageNum,
          full_name: fullName.trim(),
          email: email.trim(),
          specialty: specialty.trim(),
          languages: languages.trim(),
          country: country.trim(),
          certifications_and_style: experience.trim(),
          locale
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : ERROR_SUBMIT[locale] ?? ERROR_SUBMIT.en);
        return;
      }
      setDone(true);
    } catch {
      setError(ERROR_SUBMIT[locale] ?? ERROR_SUBMIT.en);
    } finally {
      setWorking(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
        {SUCCESS_COPY[locale] ?? SUCCESS_COPY.en}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="input" type="number" min={20} value={age} onChange={(e) => setAge(e.target.value)} placeholder={copy.ageQuestion} />
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={copy.fullName} />
      </div>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={EMAIL_PLACEHOLDER[locale]}
      />
      <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder={copy.specialtyPlaceholder} />
      <input className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder={copy.languagesPlaceholder} />
      <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={copy.country} />
      <textarea
        className="input min-h-[120px] resize-y"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        placeholder={copy.certificationsPlaceholder}
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <AsyncButton
        type="submit"
        fullWidth
        loading={working}
        onClick={() => {}}
        className="gradient-button min-h-[48px] rounded-full px-6 py-3 text-sm font-semibold text-[#09090B]"
      >
        {copy.submit}
      </AsyncButton>
    </form>
  );
}
