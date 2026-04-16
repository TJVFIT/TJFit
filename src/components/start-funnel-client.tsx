"use client";

import Link from "next/link";
import { Brain, Calculator, Dumbbell, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { PremiumPageShell } from "@/components/premium";
import type { Locale } from "@/lib/i18n";
import { programs } from "@/lib/content";
import { localizeProgram } from "@/lib/program-localization";

const COPY: Record<
  Locale,
  {
    heroTitle: string;
    heroSub: string;
    freePrograms: string;
    freeProgramsSub: string;
    tjai: string;
    tjaiSub: string;
    calculator: string;
    calculatorSub: string;
    browsePrograms: string;
    startTjai: string;
    calcTdee: string;
    trial: string;
    or: string;
    allIn: string;
    allInSub: string;
    getPro: string;
    getApex: string;
    trustSecure: string;
    trustNoCard: string;
    trustLanguages: string;
    trustCoaches: string;
    freeProgramsTab: string;
    freeDietsTab: string;
    browseDiets: string;
  }
> = {
  en: {
    heroTitle: "Where do you want to start?",
    heroSub: "Programs & TDEE tools below are free to start. TJAI quiz preview is free — pay to unlock your full generated plan.",
    freePrograms: "Free Training Programs",
    freeProgramsSub: "Two complete programs. Zero cost. Start today.",
    tjai: "Start TJAI Preview",
    tjaiSub: "25 questions → preview. Purchase to generate your full plan.",
    calculator: "Free TDEE Calculator",
    calculatorSub: "Find your exact daily calorie target in 60 seconds.",
    browsePrograms: "Browse Free Programs",
    startTjai: "Start TJAI",
    calcTdee: "Calculate My TDEE",
    trial: "1-Day Free Trial",
    or: "or",
    allIn: "Ready to go all-in?",
    allInSub: "Full TJAI access, AI programs, expert coaching.",
    getPro: "Get Pro — $10/mo",
    getApex: "Get Apex — $20/mo",
    trustSecure: "Secure Payments",
    trustNoCard: "No Credit Card",
    trustLanguages: "5 Languages",
    trustCoaches: "Expert Coaches",
    freeProgramsTab: "Programs",
    freeDietsTab: "Diets",
    browseDiets: "Browse Free Diets"
  },
  tr: {
    heroTitle: "Nereden baslamak istersin?",
    heroSub: "Programlar ve TDEE asagida ucretsiz baslar. TJAI on izlemesi ucretsiz — tam plan icin odeme.",
    freePrograms: "Ucretsiz Antrenman Programlari",
    freeProgramsSub: "Iki tam program. Sifir maliyet. Bugun basla.",
    tjai: "TJAI On Izlemesi",
    tjaiSub: "25 soru → onizleme. Tam plan icin satin al.",
    calculator: "Ucretsiz TDEE Hesaplayici",
    calculatorSub: "Gunluk kalori hedefini 60 saniyede bul.",
    browsePrograms: "Ucretsiz Programlari Gor",
    startTjai: "TJAI'yi Baslat",
    calcTdee: "TDEE Hesapla",
    trial: "1 Gun Ucretsiz Deneme",
    or: "veya",
    allIn: "Tam odaklanmaya hazir misin?",
    allInSub: "Tam TJAI erisimi, AI programlari, uzman kocluk.",
    getPro: "Pro Al — $10/ay",
    getApex: "Apex Al — $20/ay",
    trustSecure: "Guvenli Odeme",
    trustNoCard: "Kredi Karti Yok",
    trustLanguages: "5 Dil",
    trustCoaches: "Uzman Koclar",
    freeProgramsTab: "Programlar",
    freeDietsTab: "Diyetler",
    browseDiets: "Ucretsiz Diyetleri Gor"
  },
  ar: {
    heroTitle: "من أين تريد أن تبدأ؟",
    heroSub: "البرامج وحاسبة TDEE تبدأ مجاناً. معاينة TJAI مجانية — ادفع لفتح خطتك الكاملة.",
    freePrograms: "برامج تدريب مجانية",
    freeProgramsSub: "برنامجان كاملان. بدون تكلفة. ابدأ اليوم.",
    tjai: "معاينة TJAI",
    tjaiSub: "25 سؤالاً → معاينة. ادفع لتوليد خطتك الكاملة.",
    calculator: "حاسبة TDEE مجانية",
    calculatorSub: "اعرف احتياجك اليومي من السعرات خلال 60 ثانية.",
    browsePrograms: "استعرض البرامج المجانية",
    startTjai: "ابدأ TJAI",
    calcTdee: "احسب TDEE",
    trial: "تجربة مجانية ليوم واحد",
    or: "أو",
    allIn: "جاهز للالتزام الكامل؟",
    allInSub: "وصول TJAI كامل، برامج AI، وتدريب احترافي.",
    getPro: "احصل على Pro — $10/شهرياً",
    getApex: "احصل على Apex — $20/شهرياً",
    trustSecure: "مدفوعات آمنة",
    trustNoCard: "بدون بطاقة",
    trustLanguages: "5 لغات",
    trustCoaches: "مدربون خبراء",
    freeProgramsTab: "البرامج",
    freeDietsTab: "الأنظمة الغذائية",
    browseDiets: "استعرض الأنظمة المجانية"
  },
  es: {
    heroTitle: "¿Donde quieres empezar?",
    heroSub: "Programas y TDEE abajo empiezan gratis. Vista previa TJAI gratis — paga para el plan completo generado.",
    freePrograms: "Programas de Entrenamiento Gratis",
    freeProgramsSub: "Dos programas completos. Costo cero. Empieza hoy.",
    tjai: "Vista previa TJAI",
    tjaiSub: "25 preguntas → vista previa. Compra para generar tu plan completo.",
    calculator: "Calculadora TDEE Gratis",
    calculatorSub: "Descubre tu objetivo exacto de calorias en 60 segundos.",
    browsePrograms: "Ver Programas Gratis",
    startTjai: "Empezar TJAI",
    calcTdee: "Calcular TDEE",
    trial: "Prueba Gratis de 1 Dia",
    or: "o",
    allIn: "¿Listo para ir al maximo?",
    allInSub: "Acceso total a TJAI, programas AI y coaching experto.",
    getPro: "Get Pro — $10/mes",
    getApex: "Get Apex — $20/mes",
    trustSecure: "Pagos Seguros",
    trustNoCard: "Sin Tarjeta",
    trustLanguages: "5 Idiomas",
    trustCoaches: "Coaches Expertos",
    freeProgramsTab: "Programas",
    freeDietsTab: "Dietas",
    browseDiets: "Ver Dietas Gratis"
  },
  fr: {
    heroTitle: "Ou voulez-vous commencer ?",
    heroSub: "Programmes et TDEE ci-dessous : demarrage gratuit. Aperçu TJAI gratuit — payez pour le plan complet genere.",
    freePrograms: "Programmes d'Entrainement Gratuits",
    freeProgramsSub: "Deux programmes complets. Zero cout. Commencez aujourd'hui.",
    tjai: "Apercu TJAI",
    tjaiSub: "25 questions → aperçu. Payez pour generer votre plan complet.",
    calculator: "Calculateur TDEE Gratuit",
    calculatorSub: "Trouvez votre cible calorique quotidienne exacte en 60 secondes.",
    browsePrograms: "Voir les Programmes Gratuits",
    startTjai: "Demarrer TJAI",
    calcTdee: "Calculer mon TDEE",
    trial: "Essai Gratuit 1 Jour",
    or: "ou",
    allIn: "Pret a passer au niveau superieur ?",
    allInSub: "Acces TJAI complet, programmes IA, coaching expert.",
    getPro: "Get Pro — $10/mois",
    getApex: "Get Apex — $20/mois",
    trustSecure: "Paiements Securises",
    trustNoCard: "Sans Carte",
    trustLanguages: "5 Langues",
    trustCoaches: "Coachs Experts",
    freeProgramsTab: "Programmes",
    freeDietsTab: "Regimes",
    browseDiets: "Voir les Regimes Gratuits"
  }
};

export function StartFunnelClient({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [freeTab, setFreeTab] = useState<"programs" | "diets">("programs");
  const freeItems = useMemo(() => programs.filter((p) => p.is_free), []);
  const freePrograms = useMemo(() => freeItems.filter((p) => !p.category.toLowerCase().includes("nutrition")), [freeItems]);
  const freeDiets = useMemo(() => freeItems.filter((p) => p.category.toLowerCase().includes("nutrition")), [freeItems]);
  const starterNames = useMemo(
    () => (freeTab === "programs" ? freePrograms : freeDiets).slice(0, 2).map((p) => localizeProgram(p, locale).title),
    [freeDiets, freePrograms, freeTab, locale]
  );

  return (
    <PremiumPageShell className="max-w-6xl">
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.14em] text-[#22D3EE]">TJFit</p>
          <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">{copy.heroTitle}</h1>
          <p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">{copy.heroSub}</p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(14,165,233,0.03))] p-6">
            <Dumbbell className="h-10 w-10 text-[#22D3EE]" />
            <h2 className="mt-4 text-xl font-bold text-white">{copy.freePrograms}</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">{copy.freeProgramsSub}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setFreeTab("programs")}
                className={`rounded-full border px-3 py-1.5 text-xs ${freeTab === "programs" ? "border-[#22D3EE] bg-[#22D3EE]/20 text-[#22D3EE]" : "border-white/20 text-zinc-300"}`}
              >
                {copy.freeProgramsTab}
              </button>
              <button
                type="button"
                onClick={() => setFreeTab("diets")}
                className={`rounded-full border px-3 py-1.5 text-xs ${freeTab === "diets" ? "border-[#22D3EE] bg-[#22D3EE]/20 text-[#22D3EE]" : "border-white/20 text-zinc-300"}`}
              >
                {copy.freeDietsTab}
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-200">
              {starterNames.map((name) => (
                <li key={name}>- {name}</li>
              ))}
            </ul>
            <Link
              href={freeTab === "programs" ? `/${locale}/programs?free=1&filter=free` : `/${locale}/diets?free=1&filter=free`}
              className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#22D3EE] px-4 text-sm font-bold text-[#09090B]"
            >
              {freeTab === "programs" ? copy.browsePrograms : copy.browseDiets}
            </Link>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(14,165,233,0.03))] p-6">
            <Sparkles className="h-10 w-10 text-[#22D3EE]" />
            <div className="mt-4 flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-white">{copy.tjai}</h2>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-200">
                {copy.trial}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#A1A1AA]">{copy.tjaiSub}</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0D1015] p-3 text-sm text-zinc-300">
              <p className="typing-line">Calculating your macros...</p>
              <p className="typing-line delay">Building your 12-week plan...</p>
            </div>
            <Link
              href={`/${locale}/ai`}
              className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#22D3EE] px-4 text-sm font-bold text-[#09090B]"
            >
              {copy.startTjai}
            </Link>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(14,165,233,0.03))] p-6">
            <Calculator className="h-10 w-10 text-[#22D3EE]" />
            <h2 className="mt-4 text-xl font-bold text-white">{copy.calculator}</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">{copy.calculatorSub}</p>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0D1015] p-3">
              <Brain className="h-5 w-5 text-cyan-300" />
              <div className="h-2 w-full rounded-full bg-white/5">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9]" />
              </div>
            </div>
            <Link
              href={`/${locale}/calculator`}
              className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#22D3EE] px-4 text-sm font-bold text-[#09090B]"
            >
              {copy.calcTdee}
            </Link>
          </article>
        </div>

        <div className="mx-auto mt-8 max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#52525B]">{copy.or}</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{copy.allIn}</h3>
          <p className="mt-2 text-sm text-[#A1A1AA]">{copy.allInSub}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/${locale}/membership?tier=pro`}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/5"
            >
              {copy.getPro}
            </Link>
            <Link
              href={`/${locale}/membership?tier=apex`}
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#22D3EE] px-4 text-sm font-bold text-[#09090B]"
            >
              {copy.getApex}
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-2 text-center text-xs text-[#52525B] sm:grid-cols-4">
          <p>🔒 {copy.trustSecure}</p>
          <p>✓ {copy.trustNoCard}</p>
          <p>🌍 {copy.trustLanguages}</p>
          <p>⭐ {copy.trustCoaches}</p>
        </div>
      </div>
      <style jsx>{`
        .typing-line {
          width: fit-content;
          border-right: 1px solid rgba(34, 211, 238, 0.45);
          white-space: nowrap;
          overflow: hidden;
          animation: tjtyping 2.6s steps(26, end) infinite;
        }
        .typing-line.delay {
          animation-delay: 0.9s;
        }
        @keyframes tjtyping {
          0% {
            max-width: 0;
            opacity: 0.55;
          }
          20% {
            max-width: 100%;
            opacity: 1;
          }
          70% {
            max-width: 100%;
            opacity: 1;
          }
          100% {
            max-width: 0;
            opacity: 0.55;
          }
        }
      `}</style>
    </PremiumPageShell>
  );
}
