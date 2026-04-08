import type { Locale } from "@/lib/i18n";
import type { ProgramBlueprint } from "@/lib/program-blueprints";

export type ProgramQualityPack = {
  standardsTitle: string;
  checkinsTitle: string;
  standards: string[];
  checkins: string[];
};

function isAdvanced(level: string) {
  const l = level.toLowerCase();
  return l.includes("advanced") || l.includes("ileri") || l.includes("متقدم");
}

export function getProgramQualityPack(locale: Locale, blueprint: ProgramBlueprint, isDiet: boolean): ProgramQualityPack {
  const advanced = isAdvanced(blueprint.level);

  if (locale === "tr") {
    return {
      standardsTitle: "Uygulama standartlari",
      checkinsTitle: "Haftalik takip listesi",
      standards: isDiet
        ? [
            "Kalori hedefini gunluk ±100 kcal araliginda tut. Haftalik trendi esas al, tek gunluk dalgalanmaya takilma.",
            "Protein hedefi: genelde 1.6-2.2 g/kg/gun. Ogunlere dagit ve her ana ogunde kaliteli protein tut.",
            "Antrenman gunlerinde karbonhidrati calisma oncesi/sonrasi yogunlastir; dinlenme gunlerinde toplam kaloriyi koru.",
            "Adim, uyku ve suyu sabitlemeden diyeti degistirme: once davranis tutarliligini kur."
          ]
        : [
            `Progresif yukleme: hedef tekrarlar rahat cikarsa agirligi %2-10 artir (ileri seviyede daha kucuk artislar tercih et${advanced ? "" : "ilebilir"}).`,
            "Ana setlerde RPE 7-9 bandini hedefle; teknik bozuluyorsa seti bitir.",
            "Haftalik set hacmini ani siramalar yerine kademeli artir; 4-6 haftada bir hacim azaltma (deload) uygula.",
            "Toparlanma temeli: 7-9 saat uyku, yeterli su, dusuk gunlerde aktif toparlanma."
          ],
      checkins: isDiet
        ? [
            "Vucut agirligi: haftada 3 olcum al, ortalamayi takip et.",
            "Bel cevresi ve ayna kontrolu: haftada 1.",
            "Aclik/enerji performansi: 1-10 puanla gunluk not al.",
            "2 hafta trend yoksa kalori ayari yap: kesimde -100/-150, bulkta +100/+150."
          ]
        : [
            "Ana hareketlerde yuk/tekrar kaydi tut (haftalik).",
            "Set sonu zorluk (RPE) notu yaz: hedef 7-9.",
            "Toparlanma puani (uyku, kas agrisi, enerji) haftada en az 3 gun kaydet.",
            "Iki hafta ust uste gerileme varsa hacmi %20-30 azaltip tekrar yuklen."
          ]
    };
  }

  if (locale === "ar") {
    return {
      standardsTitle: "معايير التنفيذ",
      checkinsTitle: "متابعة أسبوعية",
      standards: isDiet
        ? [
            "حافظ على السعرات ضمن ±100 يومياً، وقيّم الاتجاه الأسبوعي لا التذبذب اليومي.",
            "هدف البروتين غالباً 1.6-2.2 غ/كغ يومياً موزعة على الوجبات الرئيسية.",
            "في أيام التدريب ركّز الكارب قبل/بعد التمرين، وفي الراحة حافظ على إجمالي السعرات.",
            "لا تعدّل الخطة قبل تثبيت النوم والماء والخطوات اليومية."
          ]
        : [
            "الحمل التدريجي: ارفع الوزن 2-10% عندما تُنجز التكرارات بجودة عالية.",
            "استهدف RPE بين 7-9 في المجموعات الأساسية، وأوقف المجموعة عند تدهور التقنية.",
            "زد الحجم التدريبي تدريجياً، مع أسبوع تخفيف كل 4-6 أسابيع.",
            "التعافي أساس النتائج: 7-9 ساعات نوم، سوائل كافية، وتعافٍ نشط."
          ],
      checkins: isDiet
        ? [
            "الوزن: 3 قياسات أسبوعياً وخذ المتوسط.",
            "قياس الخصر وصورة مقارنة: مرة أسبوعياً.",
            "تقييم الجوع والطاقة يومياً (1-10).",
            "إذا توقف الاتجاه أسبوعين: عدّل السعرات بمقدار 100-150."
          ]
        : [
            "سجّل الأوزان/التكرارات للحركات الأساسية أسبوعياً.",
            "دوّن RPE بعد كل مجموعة عمل رئيسية.",
            "تابع جودة التعافي (النوم/الألم/الطاقة) على الأقل 3 أيام أسبوعياً.",
            "إذا انخفض الأداء أسبوعين متتاليين، خفّض الحجم 20-30% ثم أعد التصعيد."
          ]
    };
  }

  if (locale === "es") {
    return {
      standardsTitle: "Estandares de ejecucion",
      checkinsTitle: "Checklist semanal",
      standards: isDiet
        ? [
            "Mantén calorías en ±100 kcal/día y evalúa la tendencia semanal, no un solo día.",
            "Proteína objetivo: normalmente 1.6-2.2 g/kg/día repartida en comidas principales.",
            "Concentra carbohidratos alrededor del entrenamiento y mantén consistencia en días de descanso.",
            "No cambies dieta antes de estabilizar sueño, agua y pasos diarios."
          ]
        : [
            "Sobrecarga progresiva: sube 2-10% cuando completas reps con tecnica limpia.",
            "Trabaja en RPE 7-9 en series principales; corta la serie si cae la tecnica.",
            "Sube volumen de forma gradual y aplica deload cada 4-6 semanas.",
            "Recuperación base: 7-9 h de sueño, hidratación y actividad ligera en días suaves."
          ],
      checkins: isDiet
        ? [
            "Peso corporal: 3 mediciones por semana y usa promedio.",
            "Cintura y foto comparativa: 1 vez por semana.",
            "Hambre/energía: nota diaria 1-10.",
            "Sin progreso en 2 semanas: ajusta 100-150 kcal."
          ]
        : [
            "Registra carga y reps en movimientos clave cada semana.",
            "Anota RPE al final de series principales.",
            "Monitoriza recuperación (sueño/dolor/energía) al menos 3 días/semana.",
            "Si rendimiento cae 2 semanas seguidas, reduce volumen 20-30% y reconstruye."
          ]
    };
  }

  if (locale === "fr") {
    return {
      standardsTitle: "Standards d'execution",
      checkinsTitle: "Suivi hebdomadaire",
      standards: isDiet
        ? [
            "Gardez les calories dans ±100 kcal/jour et suivez la tendance hebdomadaire.",
            "Proteines: cible generale 1.6-2.2 g/kg/jour, reparties sur les repas.",
            "Concentrez les glucides autour de l'entraînement, restez constants les jours de repos.",
            "N'ajustez pas la diete avant de stabiliser sommeil, hydratation et pas quotidiens."
          ]
        : [
            "Surcharge progressive: augmentez de 2-10% quand les repetitions sont propres.",
            "Ciblez RPE 7-9 sur les series de travail; arretez si la technique degrade.",
            "Augmentez le volume progressivement et deload toutes les 4-6 semaines.",
            "Base recuperation: 7-9 h de sommeil, hydratation, recuperation active."
          ],
      checkins: isDiet
        ? [
            "Poids: 3 mesures/semaine, suivez la moyenne.",
            "Tour de taille + photo: 1 fois/semaine.",
            "Faim/energie: note quotidienne 1-10.",
            "Aucun changement sur 2 semaines: ajustez 100-150 kcal."
          ]
        : [
            "Notez charge/reps sur les mouvements principaux chaque semaine.",
            "Renseignez le RPE apres les series de travail.",
            "Suivez la recuperation (sommeil/douleur/energie) au moins 3 jours/semaine.",
            "Si la performance baisse 2 semaines, reduisez le volume de 20-30% puis remontez."
          ]
    };
  }

  return {
    standardsTitle: "Execution Standards",
    checkinsTitle: "Weekly Check-ins",
    standards: isDiet
      ? [
          "Keep calories within a daily ±100 kcal band and judge progress by weekly trend, not single-day scale noise.",
          "Protein target for most users: 1.6-2.2 g/kg/day, distributed across core meals.",
          "Bias carbs around training windows and keep food timing stable before making plan edits.",
          "Do not change calories until sleep, hydration, and daily movement consistency are in place."
        ]
      : [
          `Progressive overload rule: increase load by 2-10% once target reps are achieved with clean form${advanced ? " (smaller jumps for advanced lifters)" : ""}.`,
          "Keep working sets mostly around RPE 7-9 and stop sets when technical quality drops.",
          "Progress volume gradually and schedule a deload every 4-6 weeks to sustain adaptation.",
          "Recovery baseline: 7-9 h sleep, hydration, and low-intensity movement on lighter days."
        ],
    checkins: isDiet
      ? [
          "Bodyweight: 3 weigh-ins per week, track weekly average.",
          "Waist measurement + progress photo: once per week.",
          "Hunger/energy score: daily 1-10 note.",
          "No trend change for 2 weeks: adjust by 100-150 kcal."
        ]
      : [
          "Log load and reps for key lifts every week.",
          "Record end-set RPE for primary working sets.",
          "Track recovery (sleep/soreness/energy) at least 3 days per week.",
          "If performance regresses 2 straight weeks, cut volume 20-30% then rebuild."
        ]
  };
}
