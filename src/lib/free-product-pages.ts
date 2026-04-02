import type { Locale } from "@/lib/i18n";

export const FREE_PRODUCT_SLUGS = [
  "home-fat-loss-starter",
  "gym-muscle-starter",
  "clean-cut-starter",
  "lean-bulk-starter"
] as const;

export type FreeProductSlug = (typeof FREE_PRODUCT_SLUGS)[number];

export function isFreeProductSlug(slug: string): slug is FreeProductSlug {
  return (FREE_PRODUCT_SLUGS as readonly string[]).includes(slug);
}

function L(row: Record<Locale, string>, locale: Locale): string {
  return row[locale] ?? row.en;
}

export type FreeExerciseRow = { line: string; note?: string };
export type FreeDaySection = {
  title: string;
  warmupLines: string[];
  exercises: FreeExerciseRow[];
  cooldownLines: string[];
};

export type FreeProductBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "day"; day: FreeDaySection };

export type FreeProductPageModel = {
  blocks: FreeProductBlock[];
  upgrade: {
    body: string;
    cta: string;
    checkoutSlug: string;
  };
};

const common = {
  monWedFri: {
    en: "3 days per week: Monday, Wednesday, Friday.",
    tr: "Haftada 3 gun: Pazartesi, Carsamba, Cuma.",
    ar: "3 ايام في الاسبوع: الاثنين والاربعاء والجمعة.",
    es: "3 dias por semana: lunes, miercoles y viernes.",
    fr: "3 jours par semaine : lundi, mercredi et vendredi."
  },
  warm5: {
    en: "Warm-up (5 min): light marching, arm circles, leg swings, easy bodyweight squats.",
    tr: "Isinma (5 dk): tempolu yuruyus, kol daireleri, bacak salinimlari, hafif squat.",
    ar: "احماء (5 د): مشي خفيف، دوائر الذراع، تأرجح الساقين، قرفصاء خفيفة.",
    es: "Calentamiento (5 min): marcha ligera, circulos de brazos, balanceos de pierna, sentadillas suaves.",
    fr: "Echauffement (5 min) : marche sur place, cercles de bras, balancements de jambe, squats legers."
  },
  cool3: {
    en: "Cool-down (3 min): hamstring stretch, quad stretch, chest doorway stretch, deep breathing.",
    tr: "Soguma (3 dk): arka bacak esnetme, on bacak esnetme, gogus esnetmesi, derin nefes.",
    ar: "تبريد (3 د): سحب الخلفية، سحب الرباعية، تمدد الصدر، تنفس عميق.",
    es: "Enfriamiento (3 min): isquiotibiales, cuadriceps, pecho en marco, respiracion profunda.",
    fr: "Retour au calme (3 min) : ischio-jambiers, quadriceps, etirement poitrine, respiration profonde."
  }
};

function homeFatLoss(locale: Locale): FreeProductPageModel {
  const w = (line: Record<Locale, string>) => L(line, locale);
  const blocks: FreeProductBlock[] = [
    { type: "h2", text: w({ en: "Overview", tr: "Genel bakis", ar: "نظرة عامة", es: "Resumen", fr: "Apercu" }) },
    {
      type: "p",
      text: w({
        en: "Goal: fat loss. Location: home. Level: beginner. Duration: 4 weeks.",
        tr: "Hedef: yag yakimi. Konum: ev. Seviye: baslangic. Sure: 4 hafta.",
        ar: "الهدف: حرق الدهون. المكان: المنزل. المستوى: مبتدئ. المدة: 4 اسابيع.",
        es: "Objetivo: perdida de grasa. Lugar: casa. Nivel: principiante. Duracion: 4 semanas.",
        fr: "Objectif : perte de graisse. Lieu : maison. Niveau : debutant. Duree : 4 semaines."
      })
    },
    { type: "p", text: w(common.monWedFri) },
    { type: "h2", text: w({ en: "Weeks 1-2 — Foundation", tr: "Hafta 1-2 — Temel", ar: "الاسابيع 1-2 — اساس", es: "Semanas 1-2 — Base", fr: "Semaines 1-2 — Fondation" }) },
    {
      type: "day",
      day: {
        title: w({ en: "Day A — Lower body", tr: "Gun A — Alt vucut", ar: "اليوم ا — اسفل الجسم", es: "Dia A — Tren inferior", fr: "Jour A — Bas du corps" }),
        warmupLines: [w(common.warm5)],
        exercises: [
          { line: "Bodyweight squats — 3x15, 45s rest.", note: w({ en: "Keep chest up, push through heels.", tr: "Gogus yukari, topuklari it.", ar: "الصدر مرفوع، ادفع بالكعبين.", es: "Pecho arriba, empuja con los talones.", fr: "Poitrine haute, poussez par les talons." }) },
          { line: "Reverse lunges — 3x10 each leg, 45s rest.", note: w({ en: "Control the descent.", tr: "Alcalisi kontrol et.", ar: "تحكم في النزول.", es: "Controla el descenso.", fr: "Controlez la descente." }) },
          { line: "Glute bridges — 3x15, 30s rest.", note: w({ en: "Squeeze at the top.", tr: "Ustte sikistir.", ar: "اضغط في الأعلى.", es: "Aprieta arriba.", fr: "Serrez en haut." }) },
          { line: "Calf raises — 3x20, 30s rest." },
          { line: "Plank — 3x30s, 30s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    {
      type: "day",
      day: {
        title: w({ en: "Day B — Upper body", tr: "Gun B — Ust vucut", ar: "اليوم ب — الجزء العلوي", es: "Dia B — Tren superior", fr: "Jour B — Haut du corps" }),
        warmupLines: [w(common.warm5)],
        exercises: [
          { line: "Push-ups — 3x10, 45s rest.", note: w({ en: "Full range, don't flare elbows.", tr: "Tam amplitud, dirsekleri acma.", ar: "مدى كامل، لا تفتح المرفقين زيادة.", es: "Rango completo, sin abrir codos.", fr: "Amplitude complete, coudes serres." }) },
          { line: "Pike push-ups — 3x8, 45s rest." },
          { line: "Superman hold — 3x12, 30s rest." },
          { line: "Tricep dips (chair) — 3x10, 45s rest." },
          { line: "Dead bug — 3x8 each side, 30s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    {
      type: "day",
      day: {
        title: w({ en: "Day C — Full body + cardio", tr: "Gun C — Tum vucut + kardiyo", ar: "اليوم ج — كامل الجسم + كارديو", es: "Dia C — Cuerpo completo + cardio", fr: "Jour C — Corps entier + cardio" }),
        warmupLines: [w(common.warm5)],
        exercises: [
          { line: "Jumping jacks — 3x30s, 30s rest." },
          { line: "Burpees — 3x8, 60s rest.", note: w({ en: "Controlled. No crashing down.", tr: "Kontrollu, sert dusme yok.", ar: "بتحكم، بدون ارتطام.", es: "Controlado, sin golpes bruscos.", fr: "Controle, sans s'ecraser." }) },
          { line: "Mountain climbers — 3x20s, 30s rest." },
          { line: "Squat jumps — 3x10, 60s rest." },
          { line: "Plank to downward dog — 3x10, 30s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    { type: "h2", text: w({ en: "Weeks 3-4 — Progression", tr: "Hafta 3-4 — Ilerleme", ar: "الاسابيع 3-4 — تقدم", es: "Semanas 3-4 — Progresion", fr: "Semaines 3-4 — Progression" }) },
    {
      type: "ul",
      items: [
        w({
          en: "Increase all sets from 3 to 4.",
          tr: "Tum setleri 3'ten 4'e cikarin.",
          ar: "ازداد المجموعات من 3 الى 4.",
          es: "Sube todas las series de 3 a 4.",
          fr: "Passez toutes les series de 3 a 4."
        }),
        w({
          en: "Add 2-3 reps per exercise where you can keep clean form.",
          tr: "Formu bozmadan her harekete 2-3 tekrar ekleyin.",
          ar: "اضف 2-3 تكرارات مع الحفاظ على الشكل.",
          es: "Anade 2-3 repeticiones con buena tecnica.",
          fr: "Ajoutez 2-3 repetitions avec une forme propre."
        }),
        w({
          en: "Reduce rest by 5-10s on easier movements when possible.",
          tr: "Mumkunse kolay hareketlerde dinlenmeyi 5-10 sn kisaltin.",
          ar: "قلل الراحة 5-10 ثوانٍ للحركات الأسهل.",
          es: "Reduce el descanso 5-10 s en movimientos mas faciles.",
          fr: "Reduisez le repos de 5-10 s sur les mouvements plus faciles."
        }),
        w({
          en: "Day A add: Wall sit 3x30s.",
          tr: "Gun A ek: Duvar oturusu 3x30sn.",
          ar: "اليوم ا اضف: جلوس على الحائط 3×30ث.",
          es: "Dia A anade: sentado en pared 3x30s.",
          fr: "Jour A ajoutez : chaise murale 3x30s."
        }),
        w({
          en: "Day B add: Diamond push-ups 3x8.",
          tr: "Gun B ek: Elmas sinav 3x8.",
          ar: "اليوم ب اضف: ضغط الماس 3×8.",
          es: "Dia B anade: flexiones diamante 3x8.",
          fr: "Jour B ajoutez : pompes diamant 3x8."
        }),
        w({
          en: "Day C add: High knees 3x30s.",
          tr: "Gun C ek: Yuksek diz 3x30sn.",
          ar: "اليوم ج اضف: رفع الركبة العالي 3×30ث.",
          es: "Dia C anade: rodillas altas 3x30s.",
          fr: "Jour C ajoutez : montees de genoux 3x30s."
        })
      ]
    },
    {
      type: "p",
      text: w({
        en: "Rotate Day A / B / C on your Mon / Wed / Fri schedule.",
        tr: "Pzt / Car / Cum icin Gun A / B / C donusumunu uygulayin.",
        ar: "طبق التناوب بين اليوم أ/ب/ج على جدول الاثنين والاربعاء والجمعة.",
        es: "Rota Dia A / B / C en tu calendario de lun / mie / vie.",
        fr: "Alternez jour A / B / C sur lun / mer / ven."
      })
    }
  ];

  return {
    blocks,
    upgrade: {
      body: w({
        en: "You've completed the starter. The full 12-week Home Fat Loss program includes daily workouts, full progression, advanced techniques, and your complete transformation plan.",
        tr: "Baslangici tamamladiniz. Tam 12 haftalik Ev Yag Yakim programi gunluk antrenmanlar, tam ilerleme, ileri teknikler ve donusum planinizi icerir.",
        ar: "انتهيت من البداية. برنامج حرق الدهون المنزلي لمدة 12 اسبوعاً يشمل تمارين يومية وتقدماً كاملاً وتقنيات متقدمة وخطة تحول كاملة.",
        es: "Completaste el inicio. El programa completo de 12 semanas incluye entrenamientos diarios, progresion total y plan de transformacion.",
        fr: "Vous avez termine le demarrage. Le programme complet 12 semaines a domicile inclut des seances quotidiennes et toute la progression."
      }),
      cta: w({
        en: "Upgrade to full program",
        tr: "Tam programa yukselt",
        ar: "ترقية للبرنامج الكامل",
        es: "Pasar al programa completo",
        fr: "Passer au programme complet"
      }),
      checkoutSlug: "home-fat-burn-accelerator-12w"
    }
  };
}

function gymMuscle(locale: Locale): FreeProductPageModel {
  const w = (line: Record<Locale, string>) => L(line, locale);
  const blocks: FreeProductBlock[] = [
    { type: "h2", text: w({ en: "Overview", tr: "Genel bakis", ar: "نظرة عامة", es: "Resumen", fr: "Apercu" }) },
    {
      type: "p",
      text: w({
        en: "Goal: muscle gain. Location: gym. Level: beginner. Duration: 4 weeks.",
        tr: "Hedef: kas gelisimi. Konum: salon. Seviye: baslangic. Sure: 4 hafta.",
        ar: "الهدف: بناء العضلات. المكان: الجيم. المستوى: مبتدئ. المدة: 4 اسابيع.",
        es: "Objetivo: ganar musculo. Lugar: gimnasio. Nivel: principiante. Duracion: 4 semanas.",
        fr: "Objectif : prise de muscle. Lieu : salle. Niveau : debutant. Duree : 4 semaines."
      })
    },
    { type: "p", text: w(common.monWedFri) },
    { type: "h2", text: w({ en: "Weeks 1-2 — Foundation", tr: "Hafta 1-2 — Temel", ar: "الاسابيع 1-2 — اساس", es: "Semanas 1-2 — Base", fr: "Semaines 1-2 — Fondation" }) },
    {
      type: "day",
      day: {
        title: w({ en: "Day A — Chest + triceps", tr: "Gun A — Gogus + triceps", ar: "اليوم ا — صدر + ترايسبس", es: "Dia A — Pecho + triceps", fr: "Jour A — Pectoraux + triceps" }),
        warmupLines: [
          w({
            en: "Warm-up (5 min): light cardio, band pull-aparts, empty-bar or light dumbbell presses.",
            tr: "Isinma (5 dk): hafif kardiyo, lastik acilisi, bos bar veya hafif dumbell press.",
            ar: "احماء (5 د): كارديو خفيف، سحب بالحبل، ضغط ببار فارغ أو دامبل خفيف.",
            es: "Calentamiento (5 min): cardio ligero, aperturas con banda, press ligero.",
            fr: "Echauffement (5 min) : cardio leger, bande d'ouverture, presses legeres."
          })
        ],
        exercises: [
          { line: "Flat barbell bench press — 3x8, 90s rest.", note: w({ en: "Control the bar down, drive up.", tr: "Baraji kontrol indir, yukari it.", ar: "انزل البار بتحكم، ادفع للأعلى.", es: "Baja la barra con control, sube fuerte.", fr: "Descendez la barre sous controle, poussez." }) },
          { line: "Incline dumbbell press — 3x10, 90s rest." },
          { line: "Cable chest fly — 3x12, 60s rest." },
          { line: "Tricep pushdown — 3x12, 60s rest." },
          { line: "Overhead tricep extension — 3x10, 60s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    {
      type: "day",
      day: {
        title: w({ en: "Day B — Back + biceps", tr: "Gun B — Sirt + biceps", ar: "اليوم ب — ظهر + عضلة ذراعية", es: "Dia B — Espalda + biceps", fr: "Jour B — Dos + biceps" }),
        warmupLines: [w(common.warm5)],
        exercises: [
          { line: "Lat pulldown — 3x10, 90s rest.", note: w({ en: "Pull to upper chest, squeeze lats.", tr: "Ust goguse cek, lat sikistir.", ar: "اسحب نحو الصدر العلوي، اضغط الظهر العريض.", es: "Tira al pecho alto, aprieta dorsales.", fr: "Tirez vers le haut de la poitrine, serrez les dorsaux." }) },
          { line: "Seated cable row — 3x10, 90s rest." },
          { line: "Dumbbell row — 3x10 each side, 60s rest." },
          { line: "Barbell curl — 3x10, 60s rest." },
          { line: "Hammer curl — 3x12, 60s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    {
      type: "day",
      day: {
        title: w({ en: "Day C — Legs + shoulders", tr: "Gun C — Bacak + omuz", ar: "اليوم ج — ارجل + اكتاف", es: "Dia C — Piernas + hombros", fr: "Jour C — Jambes + epaules" }),
        warmupLines: [w(common.warm5)],
        exercises: [
          { line: "Leg press — 3x12, 90s rest.", note: w({ en: "Full range, don't lock knees.", tr: "Tam hareket, diz kilidi yok.", ar: "مدى كامل، بدون قفل الركبتين.", es: "Rango completo, sin bloquear rodillas.", fr: "Amplitude complete, genoux souples." }) },
          { line: "Leg curl — 3x12, 60s rest." },
          { line: "Leg extension — 3x12, 60s rest." },
          { line: "Seated DB shoulder press — 3x10, 90s rest." },
          { line: "Lateral raises — 3x15, 45s rest." }
        ],
        cooldownLines: [w(common.cool3)]
      }
    },
    { type: "h2", text: w({ en: "Weeks 3-4 — Progression", tr: "Hafta 3-4 — Ilerleme", ar: "الاسابيع 3-4 — تقدم", es: "Semanas 3-4 — Progresion", fr: "Semaines 3-4 — Progression" }) },
    {
      type: "ul",
      items: [
        w({
          en: "Increase weight by 2.5-5 kg where form stays solid.",
          tr: "Form saglam kaldiginda 2,5-5 kg agirlik artirin.",
          ar: "زد الوزن 2.5-5 كجم مع تقنية سليمة.",
          es: "Sube 2,5-5 kg si mantienes buena tecnica.",
          fr: "Augmentez de 2,5 a 5 kg si la forme reste propre."
        }),
        w({
          en: "Add 1 set to each exercise (3 to 4).",
          tr: "Her egzersize 1 set ekleyin (3'ten 4'e).",
          ar: "اضف مجموعة واحدة لكل تمرين (من 3 الى 4).",
          es: "Anade 1 serie a cada ejercicio (de 3 a 4).",
          fr: "Ajoutez 1 serie a chaque exercice (3 a 4)."
        }),
        w({
          en: "Day A add: Dips 3x8.",
          tr: "Gun A ek: Dips 3x8.",
          ar: "اليوم ا اضف: غطس 3×8.",
          es: "Dia A anade: fondos 3x8.",
          fr: "Jour A ajoutez : dips 3x8."
        }),
        w({
          en: "Day B add: Pull-ups or assisted pull-ups 3x6.",
          tr: "Gun B ek: Barfiks veya yardimli barfiks 3x6.",
          ar: "اليوم ب اضف: شد للأعلى أو مساعد 3×6.",
          es: "Dia B anade: dominadas o asistidas 3x6.",
          fr: "Jour B ajoutez : tractions ou assistees 3x6."
        }),
        w({
          en: "Day C add: Romanian deadlift 3x10.",
          tr: "Gun C ek: Romen deadlift 3x10.",
          ar: "اليوم ج اضف: ديدلفت روماني 3×10.",
          es: "Dia C anade: peso muerto rumano 3x10.",
          fr: "Jour C ajoutez : souleve roumain 3x10."
        })
      ]
    }
  ];

  return {
    blocks,
    upgrade: {
      body: w({
        en: "You've completed the starter. The full 12-week Gym Muscle program includes 6-day splits, advanced progressive overload, and your complete muscle-building system.",
        tr: "Baslangici tamamladiniz. Tam 12 haftalik Salon Kas programi 6 gunluk bolunme, ileri progresif asiri yukleme ve tam kas gelistirme sisteminizi icerir.",
        ar: "انتهيت من البداية. برنامج بناء العضلات لمدة 12 اسبوعاً في الجيم يشمل انقسامات 6 ايام وحمل تدريجي متقدم.",
        es: "Completaste el inicio. El programa de 12 semanas incluye rutinas de 6 dias y sobrecarga progresiva avanzada.",
        fr: "Demarrage termine. Le programme salle 12 semaines inclut des splits 6 jours et une surcharge progressive avancee."
      }),
      cta: w({
        en: "Upgrade to full program",
        tr: "Tam programa yukselt",
        ar: "ترقية للبرنامج الكامل",
        es: "Pasar al programa completo",
        fr: "Passer au programme complet"
      }),
      checkoutSlug: "gym-mass-builder-12w"
    }
  };
}

function cleanCut(locale: Locale): FreeProductPageModel {
  const w = (line: Record<Locale, string>) => L(line, locale);
  const blocks: FreeProductBlock[] = [
    { type: "h2", text: w({ en: "Overview", tr: "Genel bakis", ar: "نظرة عامة", es: "Resumen", fr: "Apercu" }) },
    {
      type: "p",
      text: w({
        en: "Goal: cutting. About 1800 kcal/day in week 1, then ~1650 kcal in week 2. Drink at least 2.5 L water daily.",
        tr: "Hedef: definisyon. 1. hafta ~1800 kcal/gun, 2. hafta ~1650 kcal. Gunluk en az 2,5 L su.",
        ar: "هدف: تنشيف. حوالي 1800 سعرة في الأسبوع الأول ثم ~1650 في الثاني. اشرب 2.5 لتر ماء يومياً.",
        es: "Objetivo: definicion. ~1800 kcal dia en semana 1, luego ~1650. Minimo 2,5 L de agua.",
        fr: "Objectif : seche. ~1800 kcal/j semaine 1 puis ~1650. Eau : au moins 2,5 L/j."
      })
    },
    {
      type: "p",
      text: w({
        en: "Weigh food raw for accuracy. Prep in bulk to stay consistent.",
        tr: "Hassasiyet icin yiyecekleri cig tartın. Tutarlilik icin toplu hazirlik yapin.",
        ar: "زن الطعام نيئاً للدقة. حضّر بالجملة للالتزام.",
        es: "Pesa crudo para precision. Prepara en batch para ser constante.",
        fr: "Pesez cru pour la precision. Preparez en batch pour rester regulier."
      })
    },
    { type: "h2", text: w({ en: "Week 1 — Base phase (~1800 kcal)", tr: "Hafta 1 — Temel (~1800 kcal)", ar: "الاسبوع 1 — اساس (~1800)", es: "Semana 1 — Base (~1800 kcal)", fr: "Semaine 1 — Base (~1800 kcal)" }) },
    {
      type: "h3",
      text: w({ en: "Breakfast (~400 kcal) — ~30P / 25C / 18F", tr: "Kahvalti (~400 kcal) — ~30K / 25KH / 18Y", ar: "فطور (~400 سعرة)", es: "Desayuno (~400 kcal)", fr: "Petit-dejeuner (~400 kcal)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "3 whole eggs scrambled", tr: "3 tam yumurta omlet", ar: "3 بيضات كاملة مخفوقة", es: "3 huevos enteros revueltos", fr: "3 oeufs entiers brouilles" }),
        w({ en: "1 slice wholegrain toast", tr: "1 dilim tam bugday tostu", ar: "شريحة توست كامل", es: "1 rebanada pan integral", fr: "1 tranche pain complet" }),
        w({ en: "1 cup black coffee or green tea", tr: "1 fincan siyah cay veya yesil cay", ar: "قهوة سوداء أو شاي اخضر", es: "Cafe negro o te verde", fr: "Cafe noir ou the vert" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Lunch (~500 kcal) — ~40P / 45C / 10F", tr: "Ogle (~500 kcal)", ar: "غداء (~500)", es: "Almuerzo (~500 kcal)", fr: "Dejeuner (~500 kcal)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "150 g grilled chicken breast", tr: "150 g izgara tavuk gogsu", ar: "150 غ صدر دجاج مشوي", es: "150 g pechuga pollo a la plancha", fr: "150 g blanc de poulet grille" }),
        w({ en: "150 g brown rice", tr: "150 g esmer pirinc", ar: "150 غ أرز بني", es: "150 g arroz integral", fr: "150 g riz complet" }),
        w({
          en: "Large mixed salad (lettuce, tomato, cucumber) with olive oil + lemon",
          tr: "Buyuk salata (marul, domates, salatalik), zeytinyagi + limon",
          ar: "سلطة كبيرة مع زيت زيتون وليمون",
          es: "Ensalada grande con aceite de oliva y limon",
          fr: "Grande salade, huile d'olive + citron"
        })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Dinner (~500 kcal) — ~35P / 35C / 8F", tr: "Aksam (~500 kcal)", ar: "عشاء (~500)", es: "Cena (~500 kcal)", fr: "Diner (~500 kcal)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "150 g white fish (cod or tilapia)", tr: "150 g beyaz balik (morina/tilapia)", ar: "150 غ سمك ابيض", es: "150 g pescado blanco", fr: "150 g poisson blanc" }),
        w({ en: "200 g roasted vegetables (broccoli, zucchini, pepper)", tr: "200 g firin sebze", ar: "200 غ خضار مشوية", es: "200 g verduras asadas", fr: "200 g legumes rotis" }),
        w({ en: "100 g sweet potato", tr: "100 g tatli patates", ar: "100 غ بطاطا حلوة", es: "100 g batata", fr: "100 g patate douce" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Snack (~200 kcal) — ~15P / 18C / 8F", tr: "Ara ogun (~200 kcal)", ar: "وجبة خفيفة (~200)", es: "Snack (~200 kcal)", fr: "Collation (~200 kcal)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "150 g 0% Greek yogurt + 1 tbsp honey + 15 g almonds", tr: "150 g Yunan yogurdu + 1 yk bal + 15 g badem", ar: "زبادي يوناني + عسل + لوز", es: "Yogur griego + miel + almendras", fr: "Yaourt grec + miel + amandes" })
      ]
    },
    {
      type: "p",
      text: w({
        en: "Daily total week 1: ~1800 kcal | ~120P / ~123C / ~44F",
        tr: "Hafta 1 gunluk: ~1800 kcal | ~120P / ~123KH / ~44Y",
        ar: "مجموع الأسبوع 1: ~1800 سعرة",
        es: "Total semana 1: ~1800 kcal | ~120P / ~123C / ~44G",
        fr: "Total semaine 1 : ~1800 kcal | ~120P / ~123G / ~44L"
      })
    },
    { type: "h2", text: w({ en: "Week 2 — Adjustment (~1650 kcal)", tr: "Hafta 2 — Ayarlama (~1650)", ar: "الاسبوع 2 — تعديل", es: "Semana 2 — Ajuste (~1650)", fr: "Semaine 2 — Ajustement (~1650)" }) },
    {
      type: "ul",
      items: [
        w({ en: "Remove breakfast toast.", tr: "Kahvaltidaki tostu kaldir.", ar: "ازل التوست من الفطور.", es: "Quita el pan del desayuno.", fr: "Retirez le pain du petit-dejeuner." }),
        w({ en: "Lunch: replace rice with extra salad.", tr: "Ogle: pirinci ekstra salata ile degistir.", ar: "الغداء: استبدل الأرز بسلطة اضافية.", es: "Almuerzo: cambia arroz por mas ensalada.", fr: "Dejeuner : remplacez le riz par plus de salade." }),
        w({ en: "Dinner: reduce sweet potato to 70 g.", tr: "Aksam: tatli patatesi 70 g yap.", ar: "العشاء: بطاطا حلوة 70 غ.", es: "Cena: baja batata a 70 g.", fr: "Diner : patate douce 70 g." })
      ]
    }
  ];

  return {
    blocks,
    upgrade: {
      body: w({
        en: "This starter gives you the foundation. The full 12-week Clean Cut diet includes daily meals, full macro tracking, weekly calorie cycling, supplement protocol, and alternatives for every food.",
        tr: "Bu baslangic temeli verir. Tam 12 haftalik Temiz Definisyon diyeti gunluk ogunler, tam makro takibi, haftalik kalori dongusu ve her yiyecek icin alternatifler icerir.",
        ar: "هذه البداية تمنحك الأساس. النظام الكامل لمدة 12 اسبوعاً يشمل وجبات يومية وتتبع ماكرو وتدوير سعرات ومكملات وبدائل.",
        es: "Esta base es el inicio. El plan de 12 semanas incluye comidas diarias, macros, ciclos y alternativas.",
        fr: "Ce demarrage pose les bases. Le plan 12 semaines inclut repas quotidiens, macros, cycles et alternatives."
      }),
      cta: w({
        en: "Upgrade to full diet plan",
        tr: "Tam diyet planina gec",
        ar: "ترقية لخطة غذائية كاملة",
        es: "Pasar al plan dietetico completo",
        fr: "Passer au plan alimentaire complet"
      }),
      checkoutSlug: "clean-cutting-diet-12w"
    }
  };
}

function leanBulk(locale: Locale): FreeProductPageModel {
  const w = (line: Record<Locale, string>) => L(line, locale);
  const blocks: FreeProductBlock[] = [
    { type: "h2", text: w({ en: "Overview", tr: "Genel bakis", ar: "نظرة عامة", es: "Resumen", fr: "Apercu" }) },
    {
      type: "p",
      text: w({
        en: "Goal: lean bulk. About 2800 kcal/day in week 1, then ~2950 kcal in week 2. Drink at least 3 L water daily.",
        tr: "Hedef: lean bulk. Hafta 1 ~2800 kcal/gun, hafta 2 ~2950. Gunluk en az 3 L su.",
        ar: "هدف: زيادة نظيفة. ~2800 ثم ~2950. ماء 3 لتر يومياً.",
        es: "Objetivo: volumen limpio. ~2800 luego ~2950. Minimo 3 L agua.",
        fr: "Objectif : prise seche. ~2800 puis ~2950. Eau 3 L/j minimum."
      })
    },
    {
      type: "p",
      text: w({
        en: "Consistency over perfection. Hit your protein first, then fill carbs.",
        tr: "Mukemmellikten cok tutarlilik. Once protein, sonra karbonhidrat.",
        ar: "الالتزام أهم من الكمال. البروتين أولاً ثم الكارب.",
        es: "Constancia antes que perfeccion. Proteina primero, luego carbos.",
        fr: "Regularite avant perfection. Proteines d'abord, puis glucides."
      })
    },
    { type: "h2", text: w({ en: "Week 1 — Base phase (~2800 kcal)", tr: "Hafta 1 — Temel (~2800)", ar: "الاسبوع 1 — اساس", es: "Semana 1 — Base (~2800)", fr: "Semaine 1 — Base (~2800)" }) },
    {
      type: "h3",
      text: w({ en: "Breakfast (~700 kcal) — ~45P / 75C / 22F", tr: "Kahvalti (~700 kcal)", ar: "فطور (~700)", es: "Desayuno (~700)", fr: "Petit-dejeuner (~700)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "4 whole eggs scrambled + 2 egg whites", tr: "4 tam yumurta + 2 yumurta beyazi", ar: "4 بيضات + بياضان", es: "4 huevos + 2 claras", fr: "4 oeufs + 2 blancs" }),
        w({ en: "2 slices wholegrain toast", tr: "2 dilim tam bugday tostu", ar: "شريحتا توست", es: "2 rebanadas pan integral", fr: "2 tranches pain complet" }),
        w({ en: "1 banana", tr: "1 muz", ar: "موزة", es: "1 platano", fr: "1 banane" }),
        w({ en: "250 ml whole milk", tr: "250 ml tam yagli sut", ar: "250 مل حليب كامل", es: "250 ml leche entera", fr: "250 ml lait entier" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Lunch (~750 kcal) — ~50P / 80C / 15F", tr: "Ogle (~750 kcal)", ar: "غداء (~750)", es: "Almuerzo (~750)", fr: "Dejeuner (~750)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "200 g chicken breast or lean beef mince", tr: "200 g tavuk gogsu veya yagsiz kiyma", ar: "200 غ دجاج أو لحم مفروم قليل الدهن", es: "200 g pollo o carne magra", fr: "200 g poulet ou boeuf maigre hache" }),
        w({ en: "200 g white or brown rice", tr: "200 g beyaz veya esmer pirinc", ar: "200 غ أرز", es: "200 g arroz", fr: "200 g riz" }),
        w({ en: "150 g mixed vegetables stir-fried in olive oil", tr: "150 g karisik sebze (zeytinyaginda)", ar: "150 غ خضار بقلي بزيت الزيتون", es: "150 g verduras salteadas", fr: "150 g legumes sautes a l'huile d'olive" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Dinner (~750 kcal) — ~48P / 78C / 20F", tr: "Aksam (~750 kcal)", ar: "عشاء (~750)", es: "Cena (~750)", fr: "Diner (~750)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "200 g salmon or chicken thigh", tr: "200 g somon veya but", ar: "200 غ سلمون أو فخذ دجاج", es: "200 g salmon o muslo", fr: "200 g saumon ou cuisse" }),
        w({ en: "200 g pasta or potatoes", tr: "200 g makarna veya patates", ar: "200 غ معكرونة أو بطاطا", es: "200 g pasta o patata", fr: "200 g pates ou pommes de terre" }),
        w({ en: "Large salad with olive oil dressing", tr: "Buyuk salata (zeytinyagi soslu)", ar: "سلطة كبيرة بزيت الزيتون", es: "Ensalada grande con aceite", fr: "Grande salade, vinaigrette olive" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Snack 1 (~300 kcal)", tr: "Ara ogun 1 (~300)", ar: "وجبة خفيفة 1", es: "Snack 1 (~300)", fr: "Collation 1 (~300)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "200 g Greek yogurt, 40 g dry oats, 1 tbsp peanut butter", tr: "200 g yogurt, 40 g yulaf (kuru), 1 yk fistik ezmesi", ar: "زبادي + شوفان جاف + فول سوداني", es: "Yogur, 40 g avena seca, cacahuete", fr: "Yaourt, 40 g flocons secs, beurre de cacahuete" })
      ]
    },
    {
      type: "h3",
      text: w({ en: "Snack 2 (~300 kcal)", tr: "Ara ogun 2 (~300)", ar: "وجبة خفيفة 2", es: "Snack 2 (~300)", fr: "Collation 2 (~300)" })
    },
    {
      type: "ul",
      items: [
        w({ en: "2 rice cakes, 50 g tuna, 1 tbsp light mayo, 1 apple", tr: "2 pirinc keki, 50 g ton, 1 yk hafif mayonez, 1 elma", ar: "كعكتان أرز، تونة، مايونيز خفيف، تفاحة", es: "2 tortitas arroz, atun, mayonesa light, manzana", fr: "2 galettes riz, thon, mayo legere, pomme" })
      ]
    },
    {
      type: "p",
      text: w({
        en: "Daily total week 1: ~2800 kcal | ~185P / ~306C / ~73F",
        tr: "Hafta 1 gunluk: ~2800 kcal | ~185P / ~306KH / ~73Y",
        ar: "مجموع الأسبوع 1: ~2800",
        es: "Total semana 1: ~2800 kcal",
        fr: "Total semaine 1 : ~2800 kcal"
      })
    },
    { type: "h2", text: w({ en: "Week 2 — Bump (+~150 kcal)", tr: "Hafta 2 — Artis (+~150 kcal)", ar: "الاسبوع 2 — زيادة", es: "Semana 2 — Subida (+150)", fr: "Semaine 2 — +150 kcal" }) },
    {
      type: "ul",
      items: [
        w({ en: "Add 30 g oats to breakfast.", tr: "Kahvaltiya 30 g yulaf ekle.", ar: "أضف 30 غ شوفان للفطور.", es: "Anade 30 g avena al desayuno.", fr: "Ajoutez 30 g flocons au petit-dejeuner." }),
        w({ en: "Add 50 g extra rice at lunch.", tr: "Oglede 50 g ekstra pirinc.", ar: "50 غ أرز إضافي في الغداء.", es: "50 g arroz extra en almuerzo.", fr: "50 g riz en plus au dejeuner." })
      ]
    },
    {
      type: "p",
      text: w({
        en: "New daily total: ~2950 kcal.",
        tr: "Yeni gunluk toplam: ~2950 kcal.",
        ar: "المجموع الجديد ~2950.",
        es: "Nuevo total ~2950 kcal.",
        fr: "Nouveau total ~2950 kcal."
      })
    }
  ];

  return {
    blocks,
    upgrade: {
      body: w({
        en: "This starter is your foundation for lean muscle gain. The full 12-week Lean Bulk diet includes daily meals with full recipes, cook times, weekly calorie progression, supplement stack, and food alternatives.",
        tr: "Bu baslangic lean kas kazanimi icin temeldir. Tam 12 haftalik Lean Bulk diyeti gunluk ogunler, tarifler, pisirme suresi, haftalik kalori ilerlemesi ve alternatifler icerir.",
        ar: "هذه البداية لبناء عضلات نظيفة. الخطة الكاملة 12 اسبوعاً تشمل وجبات يومية ووصفات وتقدم سعرات ومكملات.",
        es: "Base para ganar musculo limpio. El plan 12 semanas incluye comidas, recetas y progresion.",
        fr: "Base pour prise de muscle seche. Le plan 12 semaines inclut repas, recettes et progression."
      }),
      cta: w({
        en: "Upgrade to full diet plan",
        tr: "Tam diyet planina gec",
        ar: "ترقية لخطة غذائية كاملة",
        es: "Pasar al plan dietetico completo",
        fr: "Passer au plan alimentaire complet"
      }),
      checkoutSlug: "lean-bulk-diet-12w"
    }
  };
}

export function getFreeProductPageModel(slug: FreeProductSlug, locale: Locale): FreeProductPageModel {
  switch (slug) {
    case "home-fat-loss-starter":
      return homeFatLoss(locale);
    case "gym-muscle-starter":
      return gymMuscle(locale);
    case "clean-cut-starter":
      return cleanCut(locale);
    case "lean-bulk-starter":
      return leanBulk(locale);
    default:
      return homeFatLoss(locale);
  }
}
