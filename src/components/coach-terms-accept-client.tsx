"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { acceptCoachTermsAction } from "@/lib/actions/coach-terms-accept";
import type { Locale } from "@/lib/i18n";
import { getCoachTermsCopy, getCoachTermsSections } from "@/lib/coach-terms-copy";

export function CoachTermsAcceptClient({
  locale,
  redirectTo,
  termsVersion
}: {
  locale: Locale;
  redirectTo: string;
  termsVersion: string;
}) {
  const copy = getCoachTermsCopy(locale);
  const sections = getCoachTermsSections(locale);
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const versionNoteByLocale: Record<Locale, string> = {
    en: "Please retain a copy for your records.",
    tr: "Lutfen kayitlariniz icin bir kopya saklayin.",
    ar: "يرجى الاحتفاظ بنسخة لسجلاتك.",
    es: "Conserva una copia para tus registros.",
    fr: "Conservez une copie pour vos dossiers."
  };
  const bindingNoteByLocale: Record<Locale, string> = {
    en: "Binding terms are provided in English.",
    tr: "Baglayici sartlar Ingilizce olarak saglanir.",
    ar: "الشروط الملزمة متاحة باللغة الإنجليزية.",
    es: "Los terminos vinculantes se proporcionan en ingles.",
    fr: "Les conditions contraignantes sont fournies en anglais."
  };

  const onAccept = async () => {
    setError(null);
    if (!checked) {
      setError(copy.mustCheck);
      return;
    }
    setWorking(true);
    try {
      const data = await acceptCoachTermsAction();
      if (!data.ok) {
        setError(data.error || copy.errorGeneric);
        setWorking(false);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError(copy.errorGeneric);
      setWorking(false);
    }
  };

  return (
    <div className="mx-auto max-w-[680px] space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">{copy.badge}</span>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Version {termsVersion} —{" "}
          {locale !== "en" ? bindingNoteByLocale[locale] : versionNoteByLocale[locale]}
        </p>
      </div>

      <div className="space-y-8 rounded-[28px] border border-white/[0.08] bg-[#111215]/90 p-6 sm:p-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold text-white">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-400">
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400/40"
          />
          <span>{copy.checkboxLabel}</span>
        </label>
        {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}
        <button
          type="button"
          disabled={working}
          onClick={onAccept}
          className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-semibold text-[#05080a] shadow-[0_0_28px_-10px_rgba(34,211,238,0.45)] disabled:opacity-50 sm:w-auto"
        >
          {working ? copy.accepting : copy.acceptButton}
        </button>
      </div>
    </div>
  );
}
