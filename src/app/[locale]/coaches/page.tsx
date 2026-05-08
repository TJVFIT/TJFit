"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CoachCard } from "@/components/coach-card";
import { requireLocaleParam } from "@/lib/require-locale";
import type { Locale } from "@/lib/i18n";

type Coach = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialty_tags?: string[] | null;
  accepting_clients?: boolean | null;
  stats?: { students: number; programs: number; average_rating: number; blog_posts: number };
};

type Copy = {
  title: string;
  subtitle: string;
  filterLanguage: string;
  filterSpecialty: string;
  filterAll: string;
  acceptingOnly: string;
  empty: string;
  loadError: string;
  retry: string;
  applyButton: string;
  applyTitle: string;
  applyWhyLabel: string;
  applyWhyPlaceholder: string;
  applyGoalLabel: string;
  goalFatLoss: string;
  goalMuscleGain: string;
  goalStrength: string;
  goalGeneral: string;
  goalOther: string;
  replaceWarning: string;
  cancel: string;
  send: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorAuth: string;
  errorAlreadyLinked: string;
  errorAlreadyPending: string;
  errorNotAccepting: string;
  errorGeneric: string;
  charsRemaining: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: "Find Your Coach",
    subtitle: "Personalized guidance from certified coaches across 5 languages.",
    filterLanguage: "Language",
    filterSpecialty: "Specialty",
    filterAll: "All",
    acceptingOnly: "Accepting clients only",
    empty: "No coaches match these filters yet.",
    loadError: "Couldn't load coaches. Try again.",
    retry: "Retry",
    applyButton: "Request as Coach",
    applyTitle: "Request {name}",
    applyWhyLabel: "Why do you want to work with this coach?",
    applyWhyPlaceholder: "Share your goals and what you're looking for…",
    applyGoalLabel: "Your main goal",
    goalFatLoss: "Fat loss",
    goalMuscleGain: "Muscle gain",
    goalStrength: "Strength",
    goalGeneral: "General fitness",
    goalOther: "Other",
    replaceWarning: "If you have an active coach, this request will replace them on approval.",
    cancel: "Cancel",
    send: "Send Request",
    sending: "Sending…",
    successTitle: "Request sent",
    successBody: "Your coach will see this in their dashboard.",
    errorAuth: "Sign in to request a coach.",
    errorAlreadyLinked: "You're already linked to this coach.",
    errorAlreadyPending: "You already have a pending request with this coach.",
    errorNotAccepting: "This coach isn't accepting new clients.",
    errorGeneric: "Couldn't send the request. Try again.",
    charsRemaining: "{n} characters left"
  },
  tr: {
    title: "Koçunu Bul",
    subtitle: "5 dilde sertifikalı koçlardan kişisel rehberlik.",
    filterLanguage: "Dil",
    filterSpecialty: "Uzmanlık",
    filterAll: "Hepsi",
    acceptingOnly: "Sadece müsait koçlar",
    empty: "Bu filtrelere uyan koç yok.",
    loadError: "Koçlar yüklenemedi. Tekrar deneyin.",
    retry: "Tekrar dene",
    applyButton: "Koç Olarak İste",
    applyTitle: "{name} ile çalışma talebi",
    applyWhyLabel: "Bu koçla neden çalışmak istiyorsun?",
    applyWhyPlaceholder: "Hedeflerini ve aradığını paylaş…",
    applyGoalLabel: "Ana hedefin",
    goalFatLoss: "Yağ yakımı",
    goalMuscleGain: "Kas kazanımı",
    goalStrength: "Kuvvet",
    goalGeneral: "Genel fitness",
    goalOther: "Diğer",
    replaceWarning: "Aktif bir koçun varsa, onay durumunda bu talep onun yerini alır.",
    cancel: "İptal",
    send: "Talep Gönder",
    sending: "Gönderiliyor…",
    successTitle: "Talep gönderildi",
    successBody: "Koçun bunu panelinde görecek.",
    errorAuth: "Bir koç istemek için giriş yap.",
    errorAlreadyLinked: "Zaten bu koçla bağlısın.",
    errorAlreadyPending: "Bu koçla bekleyen bir talebin var.",
    errorNotAccepting: "Bu koç şu anda yeni öğrenci almıyor.",
    errorGeneric: "Talep gönderilemedi. Tekrar deneyin.",
    charsRemaining: "{n} karakter kaldı"
  },
  ar: {
    title: "اعثر على مدربك",
    subtitle: "إرشاد شخصي من مدربين معتمدين بخمس لغات.",
    filterLanguage: "اللغة",
    filterSpecialty: "التخصص",
    filterAll: "الكل",
    acceptingOnly: "المدربون المتاحون فقط",
    empty: "لا يوجد مدربون يطابقون هذه المرشحات.",
    loadError: "تعذّر تحميل المدربين. حاول مجددًا.",
    retry: "إعادة المحاولة",
    applyButton: "طلب التدريب",
    applyTitle: "طلب {name}",
    applyWhyLabel: "لماذا تريد العمل مع هذا المدرب؟",
    applyWhyPlaceholder: "شارك أهدافك وما تبحث عنه…",
    applyGoalLabel: "هدفك الرئيسي",
    goalFatLoss: "خسارة الدهون",
    goalMuscleGain: "زيادة العضلات",
    goalStrength: "القوة",
    goalGeneral: "اللياقة العامة",
    goalOther: "آخر",
    replaceWarning: "إذا كان لديك مدرب نشط، سيحل هذا الطلب محله عند الموافقة.",
    cancel: "إلغاء",
    send: "إرسال الطلب",
    sending: "جارٍ الإرسال…",
    successTitle: "تم إرسال الطلب",
    successBody: "سيرى المدرب هذا في لوحته.",
    errorAuth: "سجّل الدخول لطلب مدرب.",
    errorAlreadyLinked: "أنت مرتبط بالفعل بهذا المدرب.",
    errorAlreadyPending: "لديك بالفعل طلب معلّق مع هذا المدرب.",
    errorNotAccepting: "هذا المدرب لا يقبل عملاء جدد.",
    errorGeneric: "تعذّر إرسال الطلب. حاول مجددًا.",
    charsRemaining: "{n} حرفًا متبقيًا"
  },
  es: {
    title: "Encuentra tu coach",
    subtitle: "Guía personalizada de coaches certificados en 5 idiomas.",
    filterLanguage: "Idioma",
    filterSpecialty: "Especialidad",
    filterAll: "Todos",
    acceptingOnly: "Solo aceptando clientes",
    empty: "Ningún coach coincide con estos filtros aún.",
    loadError: "No se pudo cargar los coaches. Inténtalo de nuevo.",
    retry: "Reintentar",
    applyButton: "Solicitar como coach",
    applyTitle: "Solicitar a {name}",
    applyWhyLabel: "¿Por qué quieres trabajar con este coach?",
    applyWhyPlaceholder: "Comparte tus objetivos y lo que buscas…",
    applyGoalLabel: "Tu objetivo principal",
    goalFatLoss: "Pérdida de grasa",
    goalMuscleGain: "Ganancia muscular",
    goalStrength: "Fuerza",
    goalGeneral: "Forma general",
    goalOther: "Otro",
    replaceWarning: "Si tienes un coach activo, esta solicitud lo reemplazará al ser aprobada.",
    cancel: "Cancelar",
    send: "Enviar solicitud",
    sending: "Enviando…",
    successTitle: "Solicitud enviada",
    successBody: "Tu coach lo verá en su panel.",
    errorAuth: "Inicia sesión para solicitar un coach.",
    errorAlreadyLinked: "Ya estás vinculado a este coach.",
    errorAlreadyPending: "Ya tienes una solicitud pendiente con este coach.",
    errorNotAccepting: "Este coach no acepta nuevos clientes.",
    errorGeneric: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
    charsRemaining: "{n} caracteres restantes"
  },
  fr: {
    title: "Trouvez votre coach",
    subtitle: "Accompagnement personnalisé par des coachs certifiés en 5 langues.",
    filterLanguage: "Langue",
    filterSpecialty: "Spécialité",
    filterAll: "Tous",
    acceptingOnly: "Acceptant des clients seulement",
    empty: "Aucun coach ne correspond à ces filtres.",
    loadError: "Impossible de charger les coachs. Réessayez.",
    retry: "Réessayer",
    applyButton: "Demander ce coach",
    applyTitle: "Demander {name}",
    applyWhyLabel: "Pourquoi voulez-vous travailler avec ce coach ?",
    applyWhyPlaceholder: "Partagez vos objectifs et ce que vous cherchez…",
    applyGoalLabel: "Votre objectif principal",
    goalFatLoss: "Perte de gras",
    goalMuscleGain: "Prise de muscle",
    goalStrength: "Force",
    goalGeneral: "Forme générale",
    goalOther: "Autre",
    replaceWarning: "Si vous avez un coach actif, cette demande le remplacera après approbation.",
    cancel: "Annuler",
    send: "Envoyer la demande",
    sending: "Envoi…",
    successTitle: "Demande envoyée",
    successBody: "Votre coach la verra dans son tableau de bord.",
    errorAuth: "Connectez-vous pour demander un coach.",
    errorAlreadyLinked: "Vous êtes déjà lié à ce coach.",
    errorAlreadyPending: "Vous avez déjà une demande en attente avec ce coach.",
    errorNotAccepting: "Ce coach n'accepte pas de nouveaux clients.",
    errorGeneric: "Impossible d'envoyer la demande. Réessayez.",
    charsRemaining: "{n} caractères restants"
  }
};

const SPECIALTIES = ["fat_loss", "muscle_gain", "strength", "general"] as const;

export default function CoachesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const c = COPY[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [coaches, setCoaches] = useState<Coach[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [openCoachId, setOpenCoachId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterSpecialty) params.set("specialty", filterSpecialty);
      if (acceptingOnly) params.set("accepting", "1");
      const res = await fetch(`/api/coaches?${params.toString()}`);
      if (!res.ok) throw new Error("network");
      const j = await res.json();
      setCoaches(j.coaches ?? []);
    } catch {
      setError(c.loadError);
    }
  }, [filterSpecialty, acceptingOnly, c.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const goalLabels = useMemo(
    () => ({
      fat_loss: c.goalFatLoss,
      muscle_gain: c.goalMuscleGain,
      strength: c.goalStrength,
      general: c.goalGeneral,
      other: c.goalOther
    }),
    [c]
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white" dir={dir}>
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ animation: "tj-fade-up 0.38s ease-out 0ms forwards", opacity: 0 }}
          >
            {c.title}
          </h1>
          <p
            className="mt-3 max-w-2xl text-base text-[#A1A1AA]"
            style={{ animation: "tj-fade-up 0.38s ease-out 100ms forwards", opacity: 0 }}
          >
            {c.subtitle}
          </p>
        </div>
      </section>

      <div className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <label className="text-xs uppercase tracking-wider text-[#A1A1AA]">{c.filterSpecialty}</label>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="rounded-full border border-white/10 bg-[#111215] px-3 py-1.5 text-sm text-white"
          >
            <option value="">{c.filterAll}</option>
            {SPECIALTIES.map((sp) => (
              <option key={sp} value={sp}>
                {goalLabels[sp]}
              </option>
            ))}
          </select>
          <label className="ml-2 inline-flex cursor-pointer items-center gap-2 text-sm text-[#A1A1AA]">
            <input
              type="checkbox"
              checked={acceptingOnly}
              onChange={(e) => setAcceptingOnly(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            {c.acceptingOnly}
          </label>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-[#A1A1AA]">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-4 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              {c.retry}
            </button>
          </div>
        ) : null}

        {!error && coaches === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-[#111215]" />
            ))}
          </div>
        ) : null}

        {!error && coaches !== null && coaches.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#111215] p-10 text-center">
            <p className="text-sm text-[#A1A1AA]">{c.empty}</p>
          </div>
        ) : null}

        {!error && coaches !== null && coaches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <div key={coach.id} className="space-y-3">
                <CoachCard locale={locale} coach={coach} />
                {openCoachId === coach.id ? (
                  <CoachApplyForm
                    coach={coach}
                    copy={c}
                    onClose={() => setOpenCoachId(null)}
                  />
                ) : (
                  <button
                    onClick={() => setOpenCoachId(coach.id)}
                    disabled={coach.accepting_clients === false}
                    className="w-full rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {c.applyButton}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function CoachApplyForm({
  coach,
  copy,
  onClose
}: {
  coach: Coach;
  copy: Copy;
  onClose: () => void;
}) {
  const [why, setWhy] = useState("");
  const [goal, setGoal] = useState<"fat_loss" | "muscle_gain" | "strength" | "general" | "other">(
    "general"
  );
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrMsg(null);
    try {
      const res = await fetch("/api/coach-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coach_user_id: coach.id, message: why, goal })
      });
      if (res.ok) {
        setDone(true);
        return;
      }
      if (res.status === 401) {
        setErrMsg(copy.errorAuth);
      } else if (res.status === 409) {
        const j = await res.json().catch(() => ({}));
        const text = (j?.error ?? "").toLowerCase();
        if (text.includes("already linked")) setErrMsg(copy.errorAlreadyLinked);
        else if (text.includes("pending request")) setErrMsg(copy.errorAlreadyPending);
        else if (text.includes("not accepting")) setErrMsg(copy.errorNotAccepting);
        else setErrMsg(copy.errorGeneric);
      } else {
        setErrMsg(copy.errorGeneric);
      }
    } catch {
      setErrMsg(copy.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm">
        <p className="font-semibold text-cyan-200">{copy.successTitle}</p>
        <p className="mt-1 text-[#A1A1AA]">{copy.successBody}</p>
      </div>
    );
  }

  const remaining = 500 - why.length;
  const title = copy.applyTitle.replace("{name}", coach.display_name || coach.username);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111215] p-4">
      <p className="text-sm font-semibold text-white">{title}</p>

      <label className="mt-3 block text-xs uppercase tracking-wider text-[#A1A1AA]">
        {copy.applyWhyLabel}
      </label>
      <textarea
        value={why}
        onChange={(e) => setWhy(e.target.value.slice(0, 500))}
        placeholder={copy.applyWhyPlaceholder}
        className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-[#0A0A0B] p-3 text-sm text-white placeholder:text-[#A1A1AA]/60 focus:border-cyan-400/40 focus:outline-none"
        rows={4}
      />
      <p className="mt-1 text-right text-[11px] text-[#A1A1AA]">
        {copy.charsRemaining.replace("{n}", String(remaining))}
      </p>

      <label className="mt-3 block text-xs uppercase tracking-wider text-[#A1A1AA]">
        {copy.applyGoalLabel}
      </label>
      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value as typeof goal)}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0A0A0B] p-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
      >
        <option value="fat_loss">{copy.goalFatLoss}</option>
        <option value="muscle_gain">{copy.goalMuscleGain}</option>
        <option value="strength">{copy.goalStrength}</option>
        <option value="general">{copy.goalGeneral}</option>
        <option value="other">{copy.goalOther}</option>
      </select>

      <p className="mt-3 text-xs text-[#A1A1AA]">{copy.replaceWarning}</p>

      {errMsg ? (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-xs text-red-300">
          {errMsg}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-[#A1A1AA] transition hover:text-white"
        >
          {copy.cancel}
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="rounded-full bg-cyan-500 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {submitting ? copy.sending : copy.send}
        </button>
      </div>
    </div>
  );
}
