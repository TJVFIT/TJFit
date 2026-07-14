"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n";
import {
  projectWeightChange,
  proteinTarget,
  trainingVolumeTier,
  type ProteinGoal,
  type ProteinTier,
  type VolumeTier,
  type WeightTier
} from "@/lib/tjai/what-if";

const SESSION_MINUTES = 60;

type WhatIfCopy = {
  title: string;
  subtitle: string;
  weightInput: string;
  deficitLabel: string;
  deficitDeficit: string;
  deficitSurplus: string;
  deficitMaintenance: string;
  weeksLabel: string;
  weeksUnit: string;
  sessionsLabel: string;
  sessionsNote: string;
  projectedWeight: string;
  rangeLabel: string;
  proteinTitle: string;
  proteinUnit: string;
  volumeTitle: string;
  volumeUnit: string;
  weightTiers: Record<WeightTier, string>;
  proteinTiers: Record<ProteinTier, string>;
  volumeTiers: Record<VolumeTier, string>;
  disclaimer: string;
};

const COPY: Record<Locale, WhatIfCopy> = {
  en: {
    title: "What-if projections",
    subtitle: "Drag the sliders to see how today's choices compound over time.",
    weightInput: "Current weight (kg)",
    deficitLabel: "Daily energy balance",
    deficitDeficit: "kcal deficit",
    deficitSurplus: "kcal surplus",
    deficitMaintenance: "maintenance",
    weeksLabel: "Timeframe",
    weeksUnit: "weeks",
    sessionsLabel: "Training sessions per week",
    sessionsNote: "assumes about 60 minutes per session",
    projectedWeight: "Projected weight",
    rangeLabel: "likely range",
    proteinTitle: "Daily protein target",
    proteinUnit: "g/day",
    volumeTitle: "Weekly training volume",
    volumeUnit: "min/week",
    weightTiers: {
      surplus: "A surplus builds mass; keep it small so more of the gain is muscle.",
      maintenance: "At maintenance your weight holds steady; focus on training quality.",
      gradual: "A gentle pace that is easy to sustain and protects muscle.",
      standard: "A solid, sustainable rate backed by sports science.",
      aggressive: "Capped at 1% of bodyweight per week; faster than this costs muscle and rebounds."
    },
    proteinTiers: {
      preserve: "Higher protein protects lean mass while in a deficit.",
      build: "Enough building blocks to support new muscle.",
      maintain: "Keeps muscle maintained at your current activity level."
    },
    volumeTiers: {
      minimal: "Below the 150-minute weekly guideline; add one more session.",
      foundation: "Meets the health guideline; progress by adding sets each week.",
      solid: "Strong training base; progression comes from load, not more hours.",
      high: "High volume; recovery (sleep, food) becomes the limiting factor."
    },
    disclaimer: "Projections are estimates from population averages, not medical advice."
  },
  tr: {
    title: "Senaryo projeksiyonları",
    subtitle: "Bugünkü seçimlerin zamanla nasıl biriktiğini görmek için kaydırıcıları oynatın.",
    weightInput: "Mevcut kilo (kg)",
    deficitLabel: "Günlük enerji dengesi",
    deficitDeficit: "kcal açık",
    deficitSurplus: "kcal fazla",
    deficitMaintenance: "koruma",
    weeksLabel: "Zaman aralığı",
    weeksUnit: "hafta",
    sessionsLabel: "Haftalık antrenman seansı",
    sessionsNote: "seans başına yaklaşık 60 dakika varsayılır",
    projectedWeight: "Öngörülen kilo",
    rangeLabel: "olası aralık",
    proteinTitle: "Günlük protein hedefi",
    proteinUnit: "g/gün",
    volumeTitle: "Haftalık antrenman hacmi",
    volumeUnit: "dk/hafta",
    weightTiers: {
      surplus: "Kalori fazlası kütle kazandırır; kazancın daha çok kas olması için fazlayı küçük tutun.",
      maintenance: "Koruma kalorisinde kilo sabit kalır; odağınız antrenman kalitesi olsun.",
      gradual: "Sürdürmesi kolay, kası koruyan yumuşak bir tempo.",
      standard: "Spor bilimiyle desteklenen sağlam ve sürdürülebilir bir hız.",
      aggressive: "Haftada vücut ağırlığının %1'i ile sınırlandırıldı; daha hızlısı kas kaybettirir ve geri teper."
    },
    proteinTiers: {
      preserve: "Yüksek protein, kalori açığında kas kütlesini korur.",
      build: "Yeni kas yapımını destekleyecek kadar yapı taşı sağlar.",
      maintain: "Mevcut aktivite düzeyinde kası korumaya yeter."
    },
    volumeTiers: {
      minimal: "Haftalık 150 dakikalık sağlık eşiğinin altında; bir seans daha ekleyin.",
      foundation: "Sağlık önerisini karşılıyor; her hafta set ekleyerek ilerleyin.",
      solid: "Güçlü bir antrenman tabanı; ilerleme daha fazla saatten değil yükten gelir.",
      high: "Yüksek hacim; artık sınırlayıcı etken toparlanma (uyku, beslenme) olur."
    },
    disclaimer: "Projeksiyonlar nüfus ortalamalarına dayalı tahminlerdir; tıbbi tavsiye değildir."
  },
  ar: {
    title: "توقعات ماذا لو",
    subtitle: "حرّك أشرطة التمرير لترى كيف تتراكم خيارات اليوم مع الوقت.",
    weightInput: "الوزن الحالي (كجم)",
    deficitLabel: "توازن الطاقة اليومي",
    deficitDeficit: "سعرة عجز",
    deficitSurplus: "سعرة فائض",
    deficitMaintenance: "ثبات",
    weeksLabel: "المدة الزمنية",
    weeksUnit: "أسابيع",
    sessionsLabel: "حصص التدريب في الأسبوع",
    sessionsNote: "بافتراض نحو 60 دقيقة لكل حصة",
    projectedWeight: "الوزن المتوقع",
    rangeLabel: "النطاق المرجح",
    proteinTitle: "هدف البروتين اليومي",
    proteinUnit: "غ/يوم",
    volumeTitle: "حجم التدريب الأسبوعي",
    volumeUnit: "دقيقة/أسبوع",
    weightTiers: {
      surplus: "الفائض يبني الكتلة؛ أبقه صغيرًا ليكون معظم الزيادة عضلًا.",
      maintenance: "عند سعرات الثبات يبقى الوزن مستقرًا؛ ركّز على جودة التدريب.",
      gradual: "وتيرة لطيفة يسهل الاستمرار عليها وتحافظ على العضلات.",
      standard: "معدل ثابت ومستدام تدعمه علوم الرياضة.",
      aggressive: "محدود عند 1% من وزن الجسم أسبوعيًا؛ الأسرع من ذلك يفقدك عضلًا ويرتد."
    },
    proteinTiers: {
      preserve: "البروتين المرتفع يحمي الكتلة العضلية أثناء العجز.",
      build: "لبنات كافية لدعم بناء عضل جديد.",
      maintain: "يكفي للحفاظ على العضلات عند مستوى نشاطك الحالي."
    },
    volumeTiers: {
      minimal: "أقل من إرشاد 150 دقيقة أسبوعيًا؛ أضف حصة إضافية.",
      foundation: "يحقق الإرشاد الصحي؛ تقدّم بإضافة مجموعات كل أسبوع.",
      solid: "قاعدة تدريب قوية؛ التقدم يأتي من الحمل لا من ساعات أكثر.",
      high: "حجم مرتفع؛ يصبح التعافي (النوم والغذاء) هو العامل المحدد."
    },
    disclaimer: "التوقعات تقديرات مبنية على متوسطات عامة وليست نصيحة طبية."
  },
  es: {
    title: "Proyecciones de escenarios",
    subtitle: "Mueve los controles para ver cómo se acumulan las decisiones de hoy.",
    weightInput: "Peso actual (kg)",
    deficitLabel: "Balance energético diario",
    deficitDeficit: "kcal de déficit",
    deficitSurplus: "kcal de superávit",
    deficitMaintenance: "mantenimiento",
    weeksLabel: "Horizonte",
    weeksUnit: "semanas",
    sessionsLabel: "Sesiones de entrenamiento por semana",
    sessionsNote: "asume unos 60 minutos por sesión",
    projectedWeight: "Peso proyectado",
    rangeLabel: "rango probable",
    proteinTitle: "Objetivo diario de proteína",
    proteinUnit: "g/día",
    volumeTitle: "Volumen semanal de entrenamiento",
    volumeUnit: "min/semana",
    weightTiers: {
      surplus: "Un superávit construye masa; mantenlo pequeño para que la ganancia sea más músculo.",
      maintenance: "En mantenimiento el peso se mantiene estable; céntrate en la calidad del entrenamiento.",
      gradual: "Un ritmo suave, fácil de sostener y que protege el músculo.",
      standard: "Un ritmo sólido y sostenible respaldado por la ciencia del deporte.",
      aggressive: "Limitado al 1% del peso corporal por semana; ir más rápido cuesta músculo y rebota."
    },
    proteinTiers: {
      preserve: "Más proteína protege la masa magra durante el déficit.",
      build: "Suficientes bloques de construcción para ganar músculo nuevo.",
      maintain: "Mantiene el músculo con tu nivel de actividad actual."
    },
    volumeTiers: {
      minimal: "Por debajo de la pauta de 150 minutos semanales; añade una sesión.",
      foundation: "Cumple la pauta de salud; progresa añadiendo series cada semana.",
      solid: "Base de entrenamiento fuerte; el progreso viene de la carga, no de más horas.",
      high: "Volumen alto; la recuperación (sueño, comida) pasa a ser el factor limitante."
    },
    disclaimer: "Las proyecciones son estimaciones basadas en promedios; no son consejo médico."
  },
  fr: {
    title: "Projections de scénarios",
    subtitle: "Déplacez les curseurs pour voir comment les choix d'aujourd'hui se cumulent.",
    weightInput: "Poids actuel (kg)",
    deficitLabel: "Bilan énergétique quotidien",
    deficitDeficit: "kcal de déficit",
    deficitSurplus: "kcal de surplus",
    deficitMaintenance: "maintien",
    weeksLabel: "Horizon",
    weeksUnit: "semaines",
    sessionsLabel: "Séances d'entraînement par semaine",
    sessionsNote: "environ 60 minutes par séance",
    projectedWeight: "Poids projeté",
    rangeLabel: "fourchette probable",
    proteinTitle: "Objectif quotidien de protéines",
    proteinUnit: "g/jour",
    volumeTitle: "Volume d'entraînement hebdomadaire",
    volumeUnit: "min/semaine",
    weightTiers: {
      surplus: "Un surplus construit de la masse ; gardez-le modéré pour gagner surtout du muscle.",
      maintenance: "Au maintien, le poids reste stable ; concentrez-vous sur la qualité de l'entraînement.",
      gradual: "Un rythme doux, facile à tenir et qui protège le muscle.",
      standard: "Un rythme solide et durable, appuyé par la science du sport.",
      aggressive: "Plafonné à 1 % du poids corporel par semaine ; aller plus vite coûte du muscle et provoque l'effet rebond."
    },
    proteinTiers: {
      preserve: "Plus de protéines protège la masse maigre pendant le déficit.",
      build: "Assez de briques pour construire du muscle neuf.",
      maintain: "Suffisant pour entretenir le muscle à votre niveau d'activité."
    },
    volumeTiers: {
      minimal: "Sous le repère de 150 minutes par semaine ; ajoutez une séance.",
      foundation: "Atteint le repère santé ; progressez en ajoutant des séries chaque semaine.",
      solid: "Base d'entraînement solide ; la progression vient de la charge, pas des heures.",
      high: "Volume élevé ; la récupération (sommeil, alimentation) devient le facteur limitant."
    },
    disclaimer: "Ces projections sont des estimations fondées sur des moyennes ; ce n'est pas un avis médical."
  }
};

function useCountUp(target: number, decimals: number) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    const from = displayRef.current;
    if (from === target) return;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const t = Math.min(1, (now - start) / 420);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (target - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return display.toFixed(decimals);
}

function SliderRow({
  label,
  display,
  note,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  display: string;
  note?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{label}</span>
        <span className="text-sm font-semibold text-purple-200">{display}</span>
      </div>
      {note ? <p className="mt-0.5 text-[11px] text-faint">{note}</p> : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer"
        style={{ accentColor: "#A855F7" }}
      />
    </label>
  );
}

function ResultCard({
  title,
  value,
  unit,
  sub,
  message
}: {
  title: string;
  value: string;
  unit: string;
  sub?: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-divider bg-surface-2 p-4 transition-shadow duration-300 hover:shadow-[0_0_22px_-10px_rgba(168,85,247,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{title}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-accent">
        {value} <span className="text-sm font-semibold text-muted">{unit}</span>
      </p>
      {sub ? <p className="mt-1 text-xs tabular-nums text-faint">{sub}</p> : null}
      <p className="mt-2 text-xs text-muted">{message}</p>
    </div>
  );
}

export function WhatIfPanel({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.en;
  const [weightInput, setWeightInput] = useState("80");
  const [deficit, setDeficit] = useState(400);
  const [weeks, setWeeks] = useState(12);
  const [sessions, setSessions] = useState(4);

  const weightKg = Math.min(250, Math.max(30, Number(weightInput) || 80));
  const proteinGoal: ProteinGoal = deficit > 0 ? "fat_loss" : deficit < 0 ? "muscle_gain" : "fitness";

  const projection = useMemo(
    () => projectWeightChange({ currentKg: weightKg, dailyDeficitKcal: deficit, weeks }),
    [weightKg, deficit, weeks]
  );
  const protein = useMemo(() => proteinTarget({ weightKg, goal: proteinGoal }), [weightKg, proteinGoal]);
  const volume = useMemo(
    () => trainingVolumeTier({ sessionsPerWeek: sessions, minutesPerSession: SESSION_MINUTES }),
    [sessions]
  );

  const projectedDisplay = useCountUp(projection.projectedKg, 1);
  const proteinMinDisplay = useCountUp(protein.minGrams, 0);
  const proteinMaxDisplay = useCountUp(protein.maxGrams, 0);
  const volumeDisplay = useCountUp(volume.weeklyMinutes, 0);

  const deficitDisplay =
    deficit === 0
      ? t.deficitMaintenance
      : deficit > 0
        ? `${deficit} ${t.deficitDeficit}`
        : `${Math.abs(deficit)} ${t.deficitSurplus}`;

  return (
    <section className="rounded-2xl border border-divider bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.title}</h3>
          <p className="mt-1 text-xs text-muted">{t.subtitle}</p>
        </div>
        <label className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t.weightInput}</span>
          <input
            type="number"
            min={30}
            max={250}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="w-20 rounded-lg border border-divider bg-surface-2 px-3 py-1.5 text-sm tabular-nums text-bright focus:border-purple-300/50 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-5">
          <SliderRow
            label={t.deficitLabel}
            display={deficitDisplay}
            min={-500}
            max={1200}
            step={50}
            value={deficit}
            onChange={setDeficit}
          />
          <SliderRow
            label={t.weeksLabel}
            display={`${weeks} ${t.weeksUnit}`}
            min={2}
            max={24}
            step={1}
            value={weeks}
            onChange={setWeeks}
          />
          <SliderRow
            label={t.sessionsLabel}
            display={`${sessions}`}
            note={t.sessionsNote}
            min={1}
            max={7}
            step={1}
            value={sessions}
            onChange={setSessions}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ResultCard
            title={t.projectedWeight}
            value={projectedDisplay}
            unit="kg"
            sub={
              projection.totalChangeKg !== 0
                ? `${t.rangeLabel}: ${projection.lowerBoundKg.toFixed(1)}–${projection.upperBoundKg.toFixed(1)} kg`
                : undefined
            }
            message={t.weightTiers[projection.tier]}
          />
          <ResultCard
            title={t.proteinTitle}
            value={`${proteinMinDisplay}–${proteinMaxDisplay}`}
            unit={t.proteinUnit}
            message={t.proteinTiers[protein.tier]}
          />
          <ResultCard
            title={t.volumeTitle}
            value={volumeDisplay}
            unit={t.volumeUnit}
            message={t.volumeTiers[volume.tier]}
          />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-faint">{t.disclaimer}</p>
    </section>
  );
}
