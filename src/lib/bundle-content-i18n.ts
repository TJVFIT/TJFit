import type {
  Bundle,
  BundleExercise,
  BundleGroceryCategory,
  BundleProgressionPhase,
  BundleRecipe,
  BundleWeeklyTemplateDay
} from "@/lib/bundles";
import { resolveCopyLocale } from "@/lib/i18n";

/**
 * Localization overlay for the structured bundle catalogue (WP-CONTENT-01) —
 * the layer bundle-localization.ts explicitly left "tracked as a separate
 * queued task": weeklyTemplate, progression, warmup/cooldown, equipment,
 * recipes, groceryList, whoFor/whoNotFor, faq.
 *
 * Same philosophy as STEP_I18N (tjai-copy.ts): English in bundle-content.ts
 * is the source of truth; every override is optional and a missing locale,
 * bundle, array slot, or field falls back to English — partial coverage is a
 * strict improvement and never a crash.
 *
 * Three layers, cheapest first:
 *  1. SHARED_LINES — exact-EN-string → translation for the warmup/cooldown/
 *     equipment lines drawn from the named constants (GYM/HOME_WARMUP,
 *     STD/ATHLETE_COOLDOWN, FULL_GYM/HOME_EQUIPMENT). Bundles built from those
 *     constants (fat-loss, cutting-peak, recomp, powerbuilding, …) localize in
 *     full; bundles with bespoke warmup/equipment lines get partial coverage
 *     until WP-CONTENT-02 adds their lines. A non-covered line falls back to EN.
 *  2. RECIPE_I18N — keyed by the recipe's EN `name` (stable identifier; the
 *     9 REC_* constants are reused across bundles, so translating them once
 *     benefits every bundle). Macros/kcal/mealType are numeric/enum, never
 *     overridden.
 *  3. BUNDLE_CONTENT_I18N — per-slug structural overlay, positionally merged
 *     (array index = same slot as the EN source). Pilot: `fat-loss`
 *     (WP-CONTENT-02 scales the remaining 11).
 *
 * Units go metric outside `en` (oz→g, lb→kg, °F→°C) — flagged by the
 * refuter pass as non-negotiable for tr/ar/es/fr food culture.
 * TR register: informal "sen", coach-voiced, full diacritics.
 */

type NonEnLocale = "tr" | "ar" | "es" | "fr";

/* ─── Layer 1 · shared lines (warmup / cooldown / equipment) ─────────── */

const SHARED_LINES: Record<NonEnLocale, Record<string, string>> = {
  tr: {
    // GYM_WARMUP
    "5 min easy bike or row · raise core temp": "5 dk hafif bisiklet veya kürek · vücut ısısını yükselt",
    "Hip CARs · 5 reps per side": "Kalça CAR rotasyonları · her yönde 5 tekrar",
    "T-spine rotations · 8 per side": "Sırt (T-omurga) rotasyonu · her yönde 8 tekrar",
    "Banded shoulder dislocates · 10 reps": "Bantla omuz açma · 10 tekrar",
    "2 ramp-up sets on the first main lift (50% · 70%)": "İlk ana harekette 2 ısınma seti (%50 · %70)",
    // HOME_WARMUP
    "5 min brisk walk or marching in place": "5 dk tempolu yürüyüş veya olduğun yerde marş",
    "World's greatest stretch · 5 per side": "World's greatest stretch · her tarafa 5 tekrar",
    "Glute bridges · 12 reps": "Kalça köprüsü · 12 tekrar",
    "Arm circles + scap push-ups · 10 each": "Kol çevirme + skapula şınavı · 10'ar tekrar",
    "Bodyweight squat to stand · 10 reps": "Vücut ağırlığıyla çök-kalk · 10 tekrar",
    // STD_COOLDOWN
    "3 min easy walk to bring HR down": "Nabzı düşürmek için 3 dk hafif yürüyüş",
    "90/90 hip stretch · 60s per side": "90/90 kalça esnetme · her tarafa 60 sn",
    "Doorway pec stretch · 45s per side": "Kapı eşiğinde göğüs esnetme · her tarafa 45 sn",
    "Box breathing · 6 rounds (4-4-4-4)": "Kutu nefesi · 6 tur (4-4-4-4)",
    // ATHLETE_COOLDOWN
    "5 min easy spin or jog": "5 dk hafif pedal veya hafif koşu",
    "Couch stretch · 60s per side": "Couch stretch · her tarafa 60 sn",
    "Ankle dorsiflexion · 10 reps per side": "Ayak bileği dorsifleksiyonu · her tarafa 10 tekrar",
    "Nasal-only breathing · 3 minutes": "Sadece burundan nefes · 3 dakika",
    // FULL_GYM_EQUIPMENT
    "Barbell + plates": "Halter barı + plakalar",
    "Squat rack + bench": "Squat rack + bench sehpası",
    "Dumbbells (light → heavy)": "Dambıllar (hafiften ağıra)",
    "Pull-up bar": "Barfiks barı",
    "Cable stack": "Kablo istasyonu",
    "Bench / box": "Sehpa / plyo kutusu",
    "Lifting belt (optional)": "Ağırlık kemeri (isteğe bağlı)",
    "Resistance bands": "Direnç bantları",
    // HOME_EQUIPMENT
    "Yoga mat": "Yoga matı",
    "Sturdy chair or low table": "Sağlam sandalye veya alçak masa",
    "Doorway pull-up bar (optional)": "Kapı barfiksi (isteğe bağlı)",
    "Resistance band (medium)": "Direnç bandı (orta sertlik)",
    "Towel + water bottle (filled, as load)": "Havlu + dolu su şişesi (ağırlık olarak)",
    "Timer or phone stopwatch": "Zamanlayıcı veya telefon kronometresi"
  },
  ar: {
    "5 min easy bike or row · raise core temp": "5 دقائق دراجة أو تجديف خفيف · لرفع حرارة الجسم",
    "Hip CARs · 5 reps per side": "دوائر مفصل الورك (CARs) · 5 تكرارات لكل جهة",
    "T-spine rotations · 8 per side": "تدوير الفقرات الصدرية · 8 لكل جهة",
    "Banded shoulder dislocates · 10 reps": "فتح الكتفين بالحبل المطاطي · 10 تكرارات",
    "2 ramp-up sets on the first main lift (50% · 70%)": "مجموعتا إحماء تدريجي في أول تمرين أساسي (50% · 70%)",
    "5 min brisk walk or marching in place": "5 دقائق مشي سريع أو مشي في المكان",
    "World's greatest stretch · 5 per side": "تمدد World's Greatest · 5 لكل جهة",
    "Glute bridges · 12 reps": "جسر المؤخرة · 12 تكرارًا",
    "Arm circles + scap push-ups · 10 each": "دوائر الذراعين + ضغط لوح الكتف · 10 لكل منهما",
    "Bodyweight squat to stand · 10 reps": "سكوات بوزن الجسم ثم وقوف · 10 تكرارات",
    "3 min easy walk to bring HR down": "3 دقائق مشي خفيف لخفض نبض القلب",
    "90/90 hip stretch · 60s per side": "تمدد الورك 90/90 · 60 ثانية لكل جهة",
    "Doorway pec stretch · 45s per side": "تمدد الصدر على إطار الباب · 45 ثانية لكل جهة",
    "Box breathing · 6 rounds (4-4-4-4)": "تنفس الصندوق · 6 جولات (4-4-4-4)",
    "5 min easy spin or jog": "5 دقائق دراجة خفيفة أو هرولة",
    "Couch stretch · 60s per side": "تمدد الأريكة (couch stretch) · 60 ثانية لكل جهة",
    "Ankle dorsiflexion · 10 reps per side": "ثني الكاحل الظهري · 10 تكرارات لكل جهة",
    "Nasal-only breathing · 3 minutes": "تنفس من الأنف فقط · 3 دقائق",
    "Barbell + plates": "بار حديد + أوزان",
    "Squat rack + bench": "حامل سكوات + مقعد تمرين",
    "Dumbbells (light → heavy)": "دمبلات (من الخفيف إلى الثقيل)",
    "Pull-up bar": "عقلة",
    "Cable stack": "جهاز الكابل",
    "Bench / box": "مقعد / صندوق قفز",
    "Lifting belt (optional)": "حزام رفع (اختياري)",
    "Resistance bands": "أحبال مقاومة",
    "Yoga mat": "سجادة يوغا",
    "Sturdy chair or low table": "كرسي متين أو طاولة منخفضة",
    "Doorway pull-up bar (optional)": "عقلة باب (اختيارية)",
    "Resistance band (medium)": "حبل مقاومة (متوسط)",
    "Towel + water bottle (filled, as load)": "منشفة + قارورة ماء ممتلئة (كوزن)",
    "Timer or phone stopwatch": "مؤقّت أو ساعة إيقاف الهاتف"
  },
  es: {
    "5 min easy bike or row · raise core temp": "5 min de bici o remo suave · sube la temperatura corporal",
    "Hip CARs · 5 reps per side": "CARs de cadera · 5 repeticiones por lado",
    "T-spine rotations · 8 per side": "Rotaciones torácicas · 8 por lado",
    "Banded shoulder dislocates · 10 reps": "Dislocaciones de hombro con banda · 10 repeticiones",
    "2 ramp-up sets on the first main lift (50% · 70%)": "2 series de aproximación en el primer básico (50% · 70%)",
    "5 min brisk walk or marching in place": "5 min de caminata rápida o marcha en el sitio",
    "World's greatest stretch · 5 per side": "World's greatest stretch · 5 por lado",
    "Glute bridges · 12 reps": "Puente de glúteos · 12 repeticiones",
    "Arm circles + scap push-ups · 10 each": "Círculos de brazos + flexiones escapulares · 10 de cada",
    "Bodyweight squat to stand · 10 reps": "Sentadilla con peso corporal y de pie · 10 repeticiones",
    "3 min easy walk to bring HR down": "3 min de caminata suave para bajar pulsaciones",
    "90/90 hip stretch · 60s per side": "Estiramiento de cadera 90/90 · 60 s por lado",
    "Doorway pec stretch · 45s per side": "Estiramiento de pectoral en el marco de la puerta · 45 s por lado",
    "Box breathing · 6 rounds (4-4-4-4)": "Respiración en caja · 6 rondas (4-4-4-4)",
    "5 min easy spin or jog": "5 min de pedaleo o trote suave",
    "Couch stretch · 60s per side": "Couch stretch · 60 s por lado",
    "Ankle dorsiflexion · 10 reps per side": "Dorsiflexión de tobillo · 10 repeticiones por lado",
    "Nasal-only breathing · 3 minutes": "Respiración solo nasal · 3 minutos",
    "Barbell + plates": "Barra + discos",
    "Squat rack + bench": "Rack de sentadillas + banco",
    "Dumbbells (light → heavy)": "Mancuernas (de ligeras a pesadas)",
    "Pull-up bar": "Barra de dominadas",
    "Cable stack": "Polea",
    "Bench / box": "Banco / cajón",
    "Lifting belt (optional)": "Cinturón de fuerza (opcional)",
    "Resistance bands": "Bandas elásticas",
    "Yoga mat": "Esterilla de yoga",
    "Sturdy chair or low table": "Silla firme o mesa baja",
    "Doorway pull-up bar (optional)": "Barra de dominadas de puerta (opcional)",
    "Resistance band (medium)": "Banda elástica (media)",
    "Towel + water bottle (filled, as load)": "Toalla + botella de agua llena (como carga)",
    "Timer or phone stopwatch": "Temporizador o cronómetro del móvil"
  },
  fr: {
    "5 min easy bike or row · raise core temp": "5 min de vélo ou rameur tranquille · monter en température",
    "Hip CARs · 5 reps per side": "CARs de hanche · 5 répétitions par côté",
    "T-spine rotations · 8 per side": "Rotations thoraciques · 8 par côté",
    "Banded shoulder dislocates · 10 reps": "Dislocations d'épaules à l'élastique · 10 répétitions",
    "2 ramp-up sets on the first main lift (50% · 70%)": "2 séries de montée en charge sur le premier mouvement (50 % · 70 %)",
    "5 min brisk walk or marching in place": "5 min de marche rapide ou de marche sur place",
    "World's greatest stretch · 5 per side": "World's greatest stretch · 5 par côté",
    "Glute bridges · 12 reps": "Pont fessier · 12 répétitions",
    "Arm circles + scap push-ups · 10 each": "Cercles de bras + pompes scapulaires · 10 de chaque",
    "Bodyweight squat to stand · 10 reps": "Squat au poids du corps · 10 répétitions",
    "3 min easy walk to bring HR down": "3 min de marche lente pour redescendre le cardio",
    "90/90 hip stretch · 60s per side": "Étirement de hanche 90/90 · 60 s par côté",
    "Doorway pec stretch · 45s per side": "Étirement des pectoraux dans l'encadrement de porte · 45 s par côté",
    "Box breathing · 6 rounds (4-4-4-4)": "Respiration carrée · 6 tours (4-4-4-4)",
    "5 min easy spin or jog": "5 min de pédalage ou footing léger",
    "Couch stretch · 60s per side": "Couch stretch · 60 s par côté",
    "Ankle dorsiflexion · 10 reps per side": "Dorsiflexion de cheville · 10 répétitions par côté",
    "Nasal-only breathing · 3 minutes": "Respiration nasale uniquement · 3 minutes",
    "Barbell + plates": "Barre + disques",
    "Squat rack + bench": "Rack à squat + banc",
    "Dumbbells (light → heavy)": "Haltères (de légers à lourds)",
    "Pull-up bar": "Barre de traction",
    "Cable stack": "Poulie",
    "Bench / box": "Banc / box",
    "Lifting belt (optional)": "Ceinture de force (optionnelle)",
    "Resistance bands": "Élastiques de résistance",
    "Yoga mat": "Tapis de yoga",
    "Sturdy chair or low table": "Chaise solide ou table basse",
    "Doorway pull-up bar (optional)": "Barre de traction de porte (optionnelle)",
    "Resistance band (medium)": "Élastique (résistance moyenne)",
    "Towel + water bottle (filled, as load)": "Serviette + bouteille d'eau pleine (comme charge)",
    "Timer or phone stopwatch": "Minuteur ou chronomètre du téléphone"
  }
};

/* ─── Layer 2 · recipes (keyed by EN name) ───────────────────────────── */

type RecipeOverride = {
  name: string;
  time?: string;
  ingredients: string[];
  steps: string[];
};

const RECIPE_I18N: Record<NonEnLocale, Record<string, RecipeOverride>> = {
  tr: {
    "Greek Yogurt Power Oats": {
      name: "Yunan Yoğurtlu Güç Yulafı",
      time: "8 dk",
      ingredients: [
        "1 su bardağı yulaf ezmesi",
        "1 su bardağı yağsız süzme yoğurt",
        "1 ölçek whey protein",
        "Yarım su bardağı karışık orman meyvesi",
        "1 yemek kaşığı bal · bir tutam tarçın"
      ],
      steps: [
        "Yulafı 1,5 su bardağı suyla kıvam alana kadar pişir.",
        "Ocaktan al, whey ve tarçını karıştır.",
        "Üzerine yoğurdu ve meyveleri ekle, balı gezdir.",
        "Sıcak ye ya da buzdolabında bekletip sabah al götür."
      ]
    },
    "Tex-Mex Egg White Scramble": {
      name: "Teks-Meks Yumurta Beyazı Menemeni",
      time: "10 dk",
      ingredients: [
        "5 yumurta beyazı + 2 tam yumurta",
        "Yarım su bardağı haşlanmış barbunya/siyah fasulye (durulanmış)",
        "Çeyrek su bardağı salsa · 2 yemek kaşığı rendelenmiş kaşar",
        "1 küçük tam tahıllı lavaş",
        "Kişniş/maydanoz · isteğe göre acı sos"
      ],
      steps: [
        "Fasulyeyi yapışmaz tavada ısıt.",
        "Çırpılmış yumurtaları dök, 2-3 dk karıştırarak pişir.",
        "Salsa ve peyniri ekleyip peynir eriyene kadar çevir.",
        "Sıcak lavaşın üzerine al, yeşillikle servis et."
      ]
    },
    "Chipotle Chicken Rice Bowl": {
      name: "Baharatlı Tavuklu Pilav Kâsesi",
      time: "20 dk",
      ingredients: [
        "170 g tavuk göğsü",
        "1 su bardağı pişmiş pirinç",
        "Yarım su bardağı siyah fasulye · yarım su bardağı mısır",
        "Çeyrek avokado · çeyrek su bardağı domates salatası (pico de gallo)",
        "Limon (lime) · kimyon · toz kırmızı biber · sarımsak tozu"
      ],
      steps: [
        "Tavuğu kimyon, kırmızı biber, sarımsak ve tuzla harmanla.",
        "Her yüzünü 4 dk mühürle, 3 dk dinlendir, dilimle.",
        "Kâseye pilavı, fasulyeyi ve mısırı diz.",
        "Üzerine tavuğu, avokadoyu, domates salatasını koy; limon sık."
      ]
    },
    "Honey-Garlic Salmon + Sweet Potato": {
      name: "Ballı Sarımsaklı Somon + Tatlı Patates",
      time: "25 dk",
      ingredients: [
        "170 g somon fileto",
        "1 orta boy tatlı patates",
        "2 su bardağı brokoli",
        "1 yemek kaşığı bal · 1 yemek kaşığı soya sosu · 1 diş sarımsak",
        "1 tatlı kaşığı zeytinyağı · susam"
      ],
      steps: [
        "Küp doğranmış tatlı patatesi 220°C fırında 20 dk kızart.",
        "Bal, soya sosu ve ezilmiş sarımsağı çırp; somona sür.",
        "Somonu deri tarafı altta 4 dk, çevirip 2 dk tavada pişir.",
        "Brokoliyi buharda pişir, tabağa al, susam serp."
      ]
    },
    "Lean Beef & Veg Pasta": {
      name: "Yağsız Kıymalı Sebzeli Makarna",
      time: "20 dk",
      ingredients: [
        "170 g az yağlı dana kıyma (%93 yağsız)",
        "60 g kuru tam buğday penne",
        "1 su bardağı domates sosu · 1 su bardağı taze ıspanak",
        "Çeyrek su bardağı rendelenmiş parmesan",
        "Sarımsak · kekik · pul biber"
      ],
      steps: [
        "Makarnayı al dente haşla, çeyrek bardak suyunu ayır.",
        "Kıymayı sarımsakla kavur, fazla yağını süz.",
        "Domates sosu ve ıspanağı ekle, 3 dk kaynat.",
        "Makarnayı ve ayırdığın suyu kat, parmesanla bitir."
      ]
    },
    "Cottage Cheese + Berries": {
      name: "Lor Peyniri + Orman Meyveleri",
      time: "2 dk",
      ingredients: [
        "1 su bardağı az yağlı lor/çökelek",
        "Yarım su bardağı karışık orman meyvesi",
        "1 yemek kaşığı file badem",
        "Bir tutam tarçın"
      ],
      steps: [
        "Loru kâseye al.",
        "Üzerine meyveleri, bademi ve tarçını ekle.",
        "Hemen ye ya da kutuya koyup yanında götür."
      ]
    },
    "PB & Banana Recovery Shake": {
      name: "Fıstık Ezmeli Muzlu Toparlanma Shake'i",
      time: "3 dk",
      ingredients: [
        "1 ölçek whey protein",
        "1 muz",
        "1 yemek kaşığı şekersiz fıstık ezmesi",
        "1 su bardağı şekersiz badem sütü",
        "Buz · tarçın"
      ],
      steps: [
        "Her şeyi blendera at.",
        "30 saniye, pürüzsüz olana kadar çek.",
        "Bardağa dök, tarçın serp; antrenmandan sonraki 30 dk içinde iç."
      ]
    },
    "Asian Turkey Lettuce Wraps": {
      name: "Asya Usulü Hindili Marul Dürümü",
      time: "15 dk",
      ingredients: [
        "170 g az yağlı hindi kıyma",
        "6 büyük yaprak kıvırcık/marul",
        "Çeyrek su bardağı rendelenmiş havuç · 2 taze soğan",
        "1 yemek kaşığı soya sosu · 1 tatlı kaşığı susam yağı · 1 tatlı kaşığı pirinç sirkesi",
        "1 diş sarımsak · 1 tatlı kaşığı rendelenmiş zencefil"
      ],
      steps: [
        "Sarımsak ve zencefili susam yağında 30 sn kavur.",
        "Hindiyi ekle, 4 dk pişir, fazla yağını süz.",
        "Soya sosu ve sirkeyi karıştır; havuç ve soğanı kat.",
        "Marul yapraklarına paylaştır ve servis et."
      ]
    },
    "PB-Chocolate Overnight Oats": {
      name: "Fıstık Ezmeli Çikolatalı Gece Yulafı",
      time: "5 dk + bir gece",
      ingredients: [
        "3/4 su bardağı yulaf ezmesi",
        "1 ölçek çikolatalı whey",
        "1 su bardağı şekersiz badem sütü",
        "1 yemek kaşığı şekersiz fıstık ezmesi",
        "1 yemek kaşığı chia tohumu · yarım muz (dilimlenmiş)"
      ],
      steps: [
        "Yulafı, whey'i, chia'yı ve sütü kavanozda birleştir.",
        "Pürüzsüz olana kadar karıştır, fıstık ezmesini gezdir.",
        "Bir gece (en az 4 saat) buzdolabında beklet.",
        "Yemeden önce üzerine muzu ekle."
      ]
    }
  },
  ar: {
    "Greek Yogurt Power Oats": {
      name: "شوفان الطاقة بالزبادي اليوناني",
      time: "8 دقائق",
      ingredients: [
        "كوب شوفان مطحون",
        "كوب زبادي يوناني خالي الدسم",
        "مكيال بروتين واي",
        "نصف كوب توت مشكل",
        "ملعقة كبيرة عسل · رشة قرفة"
      ],
      steps: [
        "اطبخ الشوفان مع كوب ونصف ماء حتى يصبح كريميًا.",
        "ارفعه عن النار وقلّب الواي والقرفة.",
        "ضع فوقه الزبادي والتوت ورذاذ العسل.",
        "كله دافئًا أو بيّته في الثلاجة ليكون جاهزًا صباحًا."
      ]
    },
    "Tex-Mex Egg White Scramble": {
      name: "بيض مخفوق تكس-مكس ببياض البيض",
      time: "10 دقائق",
      ingredients: [
        "5 بياض بيض + بيضتان كاملتان",
        "نصف كوب فاصولياء سوداء (مغسولة)",
        "ربع كوب صلصة سالسا · ملعقتان كبيرتان جبن مبشور",
        "خبز تورتيلا صغير من الحبوب الكاملة",
        "كزبرة · صلصة حارة حسب الرغبة"
      ],
      steps: [
        "سخّن الفاصولياء في مقلاة غير لاصقة.",
        "اسكب البيض المخفوق وقلّب 2-3 دقائق.",
        "أضف السالسا والجبن حتى يذوب.",
        "ضع المزيج على التورتيلا الدافئة وزيّنه بالكزبرة."
      ]
    },
    "Chipotle Chicken Rice Bowl": {
      name: "طبق أرز بالدجاج المتبّل",
      time: "20 دقيقة",
      ingredients: [
        "170 غ صدر دجاج",
        "كوب أرز مطبوخ",
        "نصف كوب فاصولياء سوداء · نصف كوب ذرة",
        "ربع أفوكادو · ربع كوب بيكو دي غايو (سلطة طماطم)",
        "ليمون أخضر · كمون · بابريكا · ثوم بودرة"
      ],
      steps: [
        "تبّل الدجاج بالكمون والبابريكا والثوم والملح.",
        "حمّره 4 دقائق لكل جهة، أرحه 3 دقائق ثم قطّعه.",
        "رتّب الأرز والفاصولياء والذرة في الطبق.",
        "ضع فوقها الدجاج والأفوكادو والسلطة واعصر الليمون."
      ]
    },
    "Honey-Garlic Salmon + Sweet Potato": {
      name: "سلمون بالعسل والثوم + بطاطا حلوة",
      time: "25 دقيقة",
      ingredients: [
        "170 غ فيليه سلمون",
        "حبة بطاطا حلوة متوسطة",
        "كوبان زهرات بروكلي",
        "ملعقة كبيرة عسل · ملعقة كبيرة صلصة صويا · فص ثوم",
        "ملعقة صغيرة زيت زيتون · سمسم"
      ],
      steps: [
        "حمّص مكعبات البطاطا الحلوة 20 دقيقة على 220°م.",
        "اخفق العسل والصويا والثوم المفروم وادهن السلمون.",
        "حمّر السلمون على الجلد 4 دقائق ثم اقلبه دقيقتين.",
        "اسلق البروكلي على البخار، قدّم الطبق ورش السمسم."
      ]
    },
    "Lean Beef & Veg Pasta": {
      name: "معكرونة باللحم قليل الدهن والخضار",
      time: "20 دقيقة",
      ingredients: [
        "170 غ لحم بقري مفروم قليل الدهن (93/7)",
        "60 غ معكرونة بيني من القمح الكامل (جافة)",
        "كوب صلصة مارينارا · كوب سبانخ طازجة",
        "ربع كوب جبن بارميزان مبشور",
        "ثوم · أوريغانو · رقائق فلفل حار"
      ],
      steps: [
        "اسلق المعكرونة «آل دنتي» واحتفظ بربع كوب من مائها.",
        "حمّر اللحم مع الثوم وصفِّ الدهن الزائد.",
        "أضف الصلصة والسبانخ واتركها 3 دقائق على نار هادئة.",
        "قلّب المعكرونة والماء المحفوظ وأنهِ بالبارميزان."
      ]
    },
    "Cottage Cheese + Berries": {
      name: "جبن قريش + توت",
      time: "دقيقتان",
      ingredients: [
        "كوب جبن قريش قليل الدسم",
        "نصف كوب توت مشكل",
        "ملعقة كبيرة شرائح لوز",
        "رشة قرفة"
      ],
      steps: [
        "ضع الجبن في وعاء.",
        "أضف فوقه التوت واللوز والقرفة.",
        "كله فورًا أو خذه معك في علبة."
      ]
    },
    "PB & Banana Recovery Shake": {
      name: "شيك الاستشفاء بزبدة الفول السوداني والموز",
      time: "3 دقائق",
      ingredients: [
        "مكيال بروتين واي",
        "موزة",
        "ملعقة كبيرة زبدة فول سوداني طبيعية",
        "كوب حليب لوز غير محلّى",
        "ثلج · قرفة"
      ],
      steps: [
        "ضع كل المكونات في الخلاط.",
        "اخلط 30 ثانية حتى يصبح ناعمًا.",
        "اسكبه ورش القرفة؛ اشربه خلال 30 دقيقة بعد التمرين."
      ]
    },
    "Asian Turkey Lettuce Wraps": {
      name: "لفائف الخس بالحبش على الطريقة الآسيوية",
      time: "15 دقيقة",
      ingredients: [
        "170 غ حبش مفروم قليل الدهن",
        "6 أوراق خس كبيرة",
        "ربع كوب جزر مبشور · عودان بصل أخضر",
        "ملعقة كبيرة صلصة صويا · ملعقة صغيرة زيت سمسم · ملعقة صغيرة خل أرز",
        "فص ثوم · ملعقة صغيرة زنجبيل مبشور"
      ],
      steps: [
        "قلّب الثوم والزنجبيل في زيت السمسم 30 ثانية.",
        "أضف الحبش وحمّره 4 دقائق وصفِّ الدهن.",
        "أضف الصويا والخل ثم الجزر والبصل الأخضر.",
        "وزّع الخليط في أوراق الخس وقدّمه."
      ]
    },
    "PB-Chocolate Overnight Oats": {
      name: "شوفان ليلي بالشوكولاتة وزبدة الفول السوداني",
      time: "5 دقائق + ليلة كاملة",
      ingredients: [
        "3/4 كوب شوفان مطحون",
        "مكيال واي بالشوكولاتة",
        "كوب حليب لوز غير محلّى",
        "ملعقة كبيرة زبدة فول سوداني طبيعية",
        "ملعقة كبيرة بذور شيا · نصف موزة شرائح"
      ],
      steps: [
        "اجمع الشوفان والواي والشيا والحليب في برطمان.",
        "قلّب حتى يتجانس ثم أدخل زبدة الفول السوداني.",
        "ضعه في الثلاجة ليلة كاملة (4 ساعات على الأقل).",
        "أضف الموز قبل الأكل."
      ]
    }
  },
  es: {
    "Greek Yogurt Power Oats": {
      name: "Avena energética con yogur griego",
      time: "8 min",
      ingredients: [
        "1 taza de copos de avena",
        "1 taza de yogur griego desnatado",
        "1 cacito de proteína whey",
        "1/2 taza de frutos rojos",
        "1 cda de miel · una pizca de canela"
      ],
      steps: [
        "Cuece la avena con 1,5 tazas de agua hasta que quede cremosa.",
        "Fuera del fuego, mezcla la whey y la canela.",
        "Corona con el yogur, los frutos rojos y un hilo de miel.",
        "Tómala caliente o déjala en la nevera para llevar."
      ]
    },
    "Tex-Mex Egg White Scramble": {
      name: "Revuelto tex-mex de claras",
      time: "10 min",
      ingredients: [
        "5 claras + 2 huevos enteros",
        "1/2 taza de frijoles negros (escurridos)",
        "1/4 taza de salsa · 2 cdas de queso rallado",
        "1 tortilla integral pequeña",
        "Cilantro · salsa picante al gusto"
      ],
      steps: [
        "Calienta los frijoles en una sartén antiadherente.",
        "Vierte los huevos batidos y revuelve 2-3 min.",
        "Añade la salsa y el queso hasta que se funda.",
        "Sirve sobre la tortilla caliente con cilantro."
      ]
    },
    "Chipotle Chicken Rice Bowl": {
      name: "Bowl de arroz con pollo al chipotle",
      time: "20 min",
      ingredients: [
        "170 g de pechuga de pollo",
        "1 taza de arroz cocido",
        "1/2 taza de frijoles negros · 1/2 taza de maíz",
        "1/4 de aguacate · 1/4 taza de pico de gallo",
        "Lima · comino · pimentón · ajo en polvo"
      ],
      steps: [
        "Sazona el pollo con comino, pimentón, ajo y sal.",
        "Séllalo 4 min por lado, déjalo reposar 3 min y córtalo.",
        "Monta el arroz, los frijoles y el maíz en el bowl.",
        "Añade el pollo, el aguacate, el pico y un chorro de lima."
      ]
    },
    "Honey-Garlic Salmon + Sweet Potato": {
      name: "Salmón con miel y ajo + boniato",
      time: "25 min",
      ingredients: [
        "170 g de filete de salmón",
        "1 boniato mediano",
        "2 tazas de brócoli",
        "1 cda de miel · 1 cda de salsa de soja · 1 diente de ajo",
        "1 cdta de aceite de oliva · sésamo"
      ],
      steps: [
        "Asa el boniato en dados 20 min a 220 °C.",
        "Bate miel, soja y ajo picado; pinta el salmón.",
        "Marca el salmón 4 min por la piel y 2 min por el otro lado.",
        "Cuece el brócoli al vapor, emplata y espolvorea sésamo."
      ]
    },
    "Lean Beef & Veg Pasta": {
      name: "Pasta con ternera magra y verduras",
      time: "20 min",
      ingredients: [
        "170 g de carne picada magra (93/7)",
        "60 g de penne integral (en seco)",
        "1 taza de salsa marinara · 1 taza de espinacas frescas",
        "1/4 taza de parmesano rallado",
        "Ajo · orégano · copos de guindilla"
      ],
      steps: [
        "Cuece la pasta al dente y reserva 1/4 taza del agua.",
        "Dora la carne con el ajo y escurre la grasa.",
        "Añade la marinara y las espinacas, 3 min a fuego suave.",
        "Mezcla la pasta con el agua reservada y remata con parmesano."
      ]
    },
    "Cottage Cheese + Berries": {
      name: "Queso cottage con frutos rojos",
      time: "2 min",
      ingredients: [
        "1 taza de queso cottage bajo en grasa",
        "1/2 taza de frutos rojos",
        "1 cda de almendra laminada",
        "Una pizca de canela"
      ],
      steps: [
        "Pon el queso cottage en un bol.",
        "Añade los frutos rojos, la almendra y la canela.",
        "Cómelo al momento o llévatelo en un táper."
      ]
    },
    "PB & Banana Recovery Shake": {
      name: "Batido recuperador de cacahuete y plátano",
      time: "3 min",
      ingredients: [
        "1 cacito de proteína whey",
        "1 plátano",
        "1 cda de crema de cacahuete natural",
        "1 taza de bebida de almendra sin azúcar",
        "Hielo · canela"
      ],
      steps: [
        "Echa todo en la batidora.",
        "Bate 30 s hasta que quede fino.",
        "Sírvelo con canela; tómalo en los 30 min tras entrenar."
      ]
    },
    "Asian Turkey Lettuce Wraps": {
      name: "Wraps de lechuga con pavo al estilo asiático",
      time: "15 min",
      ingredients: [
        "170 g de pavo picado magro",
        "6 hojas grandes de lechuga mantecosa",
        "1/4 taza de zanahoria rallada · 2 cebolletas",
        "1 cda de soja · 1 cdta de aceite de sésamo · 1 cdta de vinagre de arroz",
        "1 diente de ajo · 1 cdta de jengibre rallado"
      ],
      steps: [
        "Sofríe el ajo y el jengibre en el aceite de sésamo 30 s.",
        "Añade el pavo, dóralo 4 min y escurre la grasa.",
        "Incorpora la soja y el vinagre; añade zanahoria y cebolleta.",
        "Reparte en las hojas de lechuga y sirve."
      ]
    },
    "PB-Chocolate Overnight Oats": {
      name: "Avena nocturna de chocolate y cacahuete",
      time: "5 min + una noche",
      ingredients: [
        "3/4 taza de copos de avena",
        "1 cacito de whey de chocolate",
        "1 taza de bebida de almendra sin azúcar",
        "1 cda de crema de cacahuete natural",
        "1 cda de semillas de chía · 1/2 plátano en rodajas"
      ],
      steps: [
        "Combina avena, whey, chía y bebida en un tarro.",
        "Remueve hasta integrar y añade la crema de cacahuete.",
        "Refrigera toda la noche (mínimo 4 horas).",
        "Añade el plátano antes de comer."
      ]
    }
  },
  fr: {
    "Greek Yogurt Power Oats": {
      name: "Porridge protéiné au yaourt grec",
      time: "8 min",
      ingredients: [
        "1 tasse de flocons d'avoine",
        "1 tasse de yaourt grec 0 %",
        "1 dose de whey",
        "1/2 tasse de fruits rouges",
        "1 c. à s. de miel · une pincée de cannelle"
      ],
      steps: [
        "Fais cuire l'avoine avec 1,5 tasse d'eau jusqu'à texture crémeuse.",
        "Hors du feu, incorpore la whey et la cannelle.",
        "Ajoute le yaourt, les fruits rouges et un filet de miel.",
        "À manger chaud, ou au frigo pour la version overnight."
      ]
    },
    "Tex-Mex Egg White Scramble": {
      name: "Brouillade tex-mex aux blancs d'œufs",
      time: "10 min",
      ingredients: [
        "5 blancs d'œufs + 2 œufs entiers",
        "1/2 tasse de haricots noirs (rincés)",
        "1/4 tasse de salsa · 2 c. à s. de fromage râpé",
        "1 petite tortilla complète",
        "Coriandre · sauce piquante au goût"
      ],
      steps: [
        "Réchauffe les haricots dans une poêle antiadhésive.",
        "Verse les œufs battus, remue 2-3 min.",
        "Ajoute salsa et fromage jusqu'à ce qu'il fonde.",
        "Dresse sur la tortilla chaude, parsème de coriandre."
      ]
    },
    "Chipotle Chicken Rice Bowl": {
      name: "Bowl de riz au poulet chipotle",
      time: "20 min",
      ingredients: [
        "170 g de blanc de poulet",
        "1 tasse de riz cuit",
        "1/2 tasse de haricots noirs · 1/2 tasse de maïs",
        "1/4 d'avocat · 1/4 tasse de pico de gallo",
        "Citron vert · cumin · paprika · ail en poudre"
      ],
      steps: [
        "Assaisonne le poulet : cumin, paprika, ail, sel.",
        "Saisis 4 min par face, laisse reposer 3 min, tranche.",
        "Monte le bowl : riz, haricots, maïs.",
        "Ajoute poulet, avocat, pico, un trait de citron vert."
      ]
    },
    "Honey-Garlic Salmon + Sweet Potato": {
      name: "Saumon miel-ail + patate douce",
      time: "25 min",
      ingredients: [
        "170 g de pavé de saumon",
        "1 patate douce moyenne",
        "2 tasses de fleurettes de brocoli",
        "1 c. à s. de miel · 1 c. à s. de sauce soja · 1 gousse d'ail",
        "1 c. à c. d'huile d'olive · graines de sésame"
      ],
      steps: [
        "Rôtis la patate douce en dés 20 min à 220 °C.",
        "Fouette miel, soja, ail haché ; badigeonne le saumon.",
        "Saisis le saumon côté peau 4 min, retourne 2 min.",
        "Cuis le brocoli vapeur, dresse, parsème de sésame."
      ]
    },
    "Lean Beef & Veg Pasta": {
      name: "Pâtes au bœuf maigre et légumes",
      time: "20 min",
      ingredients: [
        "170 g de bœuf haché 5 % MG",
        "60 g de penne complètes (poids sec)",
        "1 tasse de sauce marinara · 1 tasse de jeunes pousses d'épinards",
        "1/4 tasse de parmesan râpé",
        "Ail · origan · piment en flocons"
      ],
      steps: [
        "Cuis les pâtes al dente, réserve 1/4 tasse d'eau de cuisson.",
        "Fais revenir le bœuf avec l'ail, égoutte le gras.",
        "Ajoute marinara et épinards, laisse mijoter 3 min.",
        "Mélange pâtes et eau réservée, termine au parmesan."
      ]
    },
    "Cottage Cheese + Berries": {
      name: "Cottage cheese aux fruits rouges",
      time: "2 min",
      ingredients: [
        "1 tasse de cottage cheese allégé",
        "1/2 tasse de fruits rouges",
        "1 c. à s. d'amandes effilées",
        "Une pincée de cannelle"
      ],
      steps: [
        "Verse le cottage cheese dans un bol.",
        "Ajoute fruits rouges, amandes, cannelle.",
        "À manger tout de suite ou à emporter."
      ]
    },
    "PB & Banana Recovery Shake": {
      name: "Shake récup' cacahuète-banane",
      time: "3 min",
      ingredients: [
        "1 dose de whey",
        "1 banane",
        "1 c. à s. de beurre de cacahuète nature",
        "1 tasse de lait d'amande non sucré",
        "Glaçons · cannelle"
      ],
      steps: [
        "Mets tout dans le blender.",
        "Mixe 30 s jusqu'à texture lisse.",
        "Verse, saupoudre de cannelle, bois dans les 30 min post-séance."
      ]
    },
    "Asian Turkey Lettuce Wraps": {
      name: "Wraps de laitue à la dinde façon asiatique",
      time: "15 min",
      ingredients: [
        "170 g de dinde hachée maigre",
        "6 grandes feuilles de laitue beurre",
        "1/4 tasse de carottes râpées · 2 oignons nouveaux",
        "1 c. à s. de soja · 1 c. à c. d'huile de sésame · 1 c. à c. de vinaigre de riz",
        "1 gousse d'ail · 1 c. à c. de gingembre râpé"
      ],
      steps: [
        "Fais revenir ail + gingembre dans l'huile de sésame, 30 s.",
        "Ajoute la dinde, fais dorer 4 min, égoutte le gras.",
        "Incorpore soja et vinaigre ; ajoute carottes et oignons.",
        "Garnis les feuilles de laitue et sers."
      ]
    },
    "PB-Chocolate Overnight Oats": {
      name: "Overnight oats choco-cacahuète",
      time: "5 min + une nuit",
      ingredients: [
        "3/4 tasse de flocons d'avoine",
        "1 dose de whey chocolat",
        "1 tasse de lait d'amande non sucré",
        "1 c. à s. de beurre de cacahuète nature",
        "1 c. à s. de graines de chia · 1/2 banane en rondelles"
      ],
      steps: [
        "Réunis avoine, whey, chia et lait dans un bocal.",
        "Mélange bien, ajoute le beurre de cacahuète en tourbillon.",
        "Réfrigère une nuit (4 h minimum).",
        "Ajoute la banane avant de déguster."
      ]
    }
  }
};

/* ─── Layer 3 · per-bundle structural overlay ────────────────────────── */

type ExerciseOverride = Partial<BundleExercise>;
type DayOverride = {
  day?: string;
  sessionName?: string;
  focus?: string;
  exercises?: Array<ExerciseOverride | undefined>;
};
type PhaseOverride = Partial<BundleProgressionPhase>;
type GroceryItemOverride = Partial<{ item: string; quantity: string }>;
type GroceryCategoryOverride = {
  category?: string;
  items?: Array<GroceryItemOverride | undefined>;
};
type FaqOverride = Partial<{ q: string; a: string }>;

export type ContentOverride = {
  weeklyTemplate?: Array<DayOverride | undefined>;
  progression?: Array<PhaseOverride | undefined>;
  groceryList?: Array<GroceryCategoryOverride | undefined>;
  whoFor?: string[];
  whoNotFor?: string[];
  faq?: Array<FaqOverride | undefined>;
};

const BUNDLE_CONTENT_I18N: Record<NonEnLocale, Partial<Record<string, ContentOverride>>> = {
  tr: {
    "fat-loss": {
      weeklyTemplate: [
        {
          day: "Pzt",
          sessionName: "İtiş A",
          focus: "Göğüs · omuz · triceps + kondisyon bitirişi",
          exercises: [
            { name: "Barbell Bench Press", sets: "4 × 6-8" },
            { name: "Eğimli Dambıl Press", sets: "3 × 10" },
            { name: "Kablo Fly", sets: "3 × 12" },
            { name: "Oturarak Omuz Press", sets: "3 × 8" },
            { name: "Yan Açış (Lateral Raise)", sets: "3 × 15" },
            { name: "Halat Triceps İtiş", sets: "3 × 12" },
            { name: "Bisiklet İntervalleri", sets: "10 dk · 30 sn yüklen / 30 sn dinlen", notes: "Bitiriş" }
          ]
        },
        {
          day: "Sal",
          sessionName: "Çekiş A",
          focus: "Sırt · biceps · arka omuz",
          exercises: [
            { name: "Trap Bar Deadlift", sets: "4 × 5" },
            { name: "Göğüs Destekli Row", sets: "4 × 10" },
            { name: "Lat Pulldown", sets: "3 × 12" },
            { name: "Face Pull", sets: "3 × 15" },
            { name: "Dambıl Curl", sets: "3 × 12" },
            { name: "Çekiç Curl", sets: "3 × 12" }
          ]
        },
        {
          day: "Çar",
          sessionName: "Bacak A",
          focus: "Quadriceps ağırlıklı + karın",
          exercises: [
            { name: "Back Squat", sets: "4 × 6-8" },
            { name: "Leg Press", sets: "3 × 10" },
            { name: "Yürüyerek Lunge", sets: "3 × her bacak 10" },
            { name: "Leg Extension", sets: "3 × 15" },
            { name: "Barda Bacak Kaldırma", sets: "3 × 12" },
            { name: "Plank", sets: "3 × 45 sn" }
          ]
        },
        {
          day: "Cum",
          sessionName: "İtiş B / Kondisyon",
          focus: "Üst vücut hipertrofisi + sabit tempo kardiyo",
          exercises: [
            { name: "Eğimli Bench Press", sets: "4 × 8" },
            { name: "Makine Göğüs Press", sets: "3 × 12" },
            { name: "Dambıl Yan Açış", sets: "4 × 15" },
            { name: "Baş Üstü Triceps Extension", sets: "3 × 12" },
            { name: "Sabit Tempo Kardiyo", sets: "25 dk Zone 2" }
          ]
        },
        {
          day: "Cmt",
          sessionName: "Çekiş B + Arka Zincir",
          focus: "Posterior zincir + sırt hacmi",
          exercises: [
            { name: "Romanian Deadlift", sets: "4 × 8" },
            { name: "Barfiks (gerekirse destekli)", sets: "4 × maks-1" },
            { name: "Oturarak Kablo Row", sets: "3 × 12" },
            { name: "Hip Thrust", sets: "3 × 10" },
            { name: "Ayakta Calf Raise", sets: "4 × 15" },
            { name: "Eğimli Bantta Yürüyüş", sets: "20 dk · %4-6 eğim" }
          ]
        }
      ],
      progression: [
        {
          phase: "Hazırlık",
          weeks: "1-4",
          loadingScheme: "Temel set/tekrar · her hafta sete 1 tekrar ekle, sonra ağırlığı artır",
          intensityCue: "RPE 7 — her çalışma setinde depoda 3 tekrar bırak"
        },
        {
          phase: "Yağ Söküm",
          weeks: "5-8",
          loadingScheme: "Tekrarları 2 azalt, ana hareketlerde 2,5-5 kg ekle, 1 kondisyon bloğu ekle",
          intensityCue: "RPE 8 — depoda 2 tekrar bırak, kardiyoyu zorla"
        },
        {
          phase: "Cila",
          weeks: "9-12",
          loadingScheme: "Ana hareketlerde 1 üst set + 2 geri çekilme seti, her 5. gün refeed",
          intensityCue: "RPE 8-9 — kondisyonun zirvesi, ego değil teknik"
        }
      ],
      groceryList: [
        {
          category: "Proteinler",
          items: [
            { item: "Tavuk göğsü", quantity: "1,4 kg" },
            { item: "Somon fileto", quantity: "900 g" },
            { item: "Az yağlı hindi kıyma", quantity: "680 g" },
            { item: "Yumurta", quantity: "24 adet" },
            { item: "Süzme yoğurt (yağsız)", quantity: "900 g" },
            { item: "Lor/çökelek (az yağlı)", quantity: "450 g" },
            { item: "Whey protein", quantity: "1 kutu" }
          ]
        },
        {
          category: "Karbonhidratlar",
          items: [
            { item: "Pirinç", quantity: "900 g" },
            { item: "Yulaf ezmesi", quantity: "500 g" },
            { item: "Tatlı patates", quantity: "4 orta boy" },
            { item: "Tam tahıllı lavaş", quantity: "1 paket" },
            { item: "Orman meyvesi (donuk karışım)", quantity: "2 paket" }
          ]
        },
        {
          category: "Sebzeler",
          items: [
            { item: "Brokoli", quantity: "900 g" },
            { item: "Kıvırcık marul", quantity: "2 adet" },
            { item: "Taze ıspanak", quantity: "1 paket" },
            { item: "Dolmalık biber", quantity: "4 adet" },
            { item: "Kuru soğan", quantity: "3 adet" },
            { item: "Sarımsak", quantity: "1 baş" }
          ]
        },
        {
          category: "Sağlıklı yağlar",
          items: [
            { item: "Avokado", quantity: "4 adet" },
            { item: "File badem", quantity: "225 g" },
            { item: "Zeytinyağı", quantity: "1 şişe" }
          ]
        },
        {
          category: "Kiler",
          items: [
            { item: "Siyah fasulye (konserve)", quantity: "4 kutu" },
            { item: "Salsa sos", quantity: "1 kavanoz" },
            { item: "Bal", quantity: "1 kavanoz" },
            { item: "Soya sosu (az sodyumlu)", quantity: "1 şişe" },
            { item: "Baharatlar: kimyon, toz biber, tarçın, sarımsak tozu", quantity: "ihtiyaca göre" }
          ]
        }
      ],
      whoFor: [
        "Kas kaybetmeden yağ yakmak isteyen sporcular",
        "Haftada beş gün salona erişimi olanlar",
        "Temel halter hareketlerine zaten hâkim olanlar"
      ],
      whoNotFor: [
        "Sıfırdan başlayanlar — önce Beginner Foundations ile başla",
        "Sadece evde çalışacaklar — Home Starter paketine bak"
      ],
      faq: [
        {
          q: "Haftada kaç gün antrenman yapacağım?",
          a: "Beş: itiş, çekiş ve bacak günleri, ardından bir itiş/kondisyon günü ve bir arka zincir günü. Her seans haftalık şablonda tek tek yazılı."
        },
        {
          q: "Tam donanımlı salon şart mı?",
          a: "Evet. Program halter, rack, dambıl, kablo istasyonu ve barfiks barı kullanıyor."
        },
        {
          q: "Beslenme nasıl görünüyor?",
          a: "Bakım kalorisinin yaklaşık %15 altında temiz bir definasyon: kilo başına ~2,2 g protein, iki refeed haftası, altı tarif ve kategorilere ayrılmış market listesi."
        },
        {
          q: "Bu paket gerçekten ücretsiz mi?",
          a: "Evet. 12 haftalık PDF dosyasının tamamı ücretsiz indirilebilir."
        }
      ]
    }
  },
  ar: {
    "fat-loss": {
      weeklyTemplate: [
        {
          day: "الاثنين",
          sessionName: "دفع A",
          focus: "صدر · أكتاف · ترايسبس + خاتمة لياقة",
          exercises: [
            { name: "ضغط بنش بالبار", sets: "4 × 6-8" },
            { name: "ضغط مائل بالدمبل", sets: "3 × 10" },
            { name: "تفتيح بالكابل", sets: "3 × 12" },
            { name: "ضغط كتف جالسًا", sets: "3 × 8" },
            { name: "رفرفة جانبية", sets: "3 × 15" },
            { name: "دفع الحبل للترايسبس", sets: "3 × 12" },
            { name: "فترات دراجة", sets: "10 دقائق · 30 ث جهد / 30 ث راحة", notes: "خاتمة" }
          ]
        },
        {
          day: "الثلاثاء",
          sessionName: "سحب A",
          focus: "ظهر · بايسبس · كتف خلفي",
          exercises: [
            { name: "رفعة ميتة بالتراب بار", sets: "4 × 5" },
            { name: "تجديف بدعم الصدر", sets: "4 × 10" },
            { name: "سحب أمامي واسع", sets: "3 × 12" },
            { name: "فيس بول", sets: "3 × 15" },
            { name: "مرجحة بايسبس بالدمبل", sets: "3 × 12" },
            { name: "مرجحة مطرقة", sets: "3 × 12" }
          ]
        },
        {
          day: "الأربعاء",
          sessionName: "أرجل A",
          focus: "تركيز على الفخذ الأمامي + بطن",
          exercises: [
            { name: "سكوات خلفي", sets: "4 × 6-8" },
            { name: "دفع الأرجل", sets: "3 × 10" },
            { name: "طعنات مشي", sets: "3 × 10 لكل رجل" },
            { name: "مد الأرجل", sets: "3 × 15" },
            { name: "رفع الأرجل معلقًا", sets: "3 × 12" },
            { name: "بلانك", sets: "3 × 45 ثانية" }
          ]
        },
        {
          day: "الجمعة",
          sessionName: "دفع B / لياقة",
          focus: "تضخيم علوي + كارديو ثابت",
          exercises: [
            { name: "ضغط بنش مائل", sets: "4 × 8" },
            { name: "ضغط صدر على الجهاز", sets: "3 × 12" },
            { name: "رفرفة جانبية بالدمبل", sets: "4 × 15" },
            { name: "مد الترايسبس فوق الرأس", sets: "3 × 12" },
            { name: "كارديو ثابت", sets: "25 دقيقة المنطقة 2" }
          ]
        },
        {
          day: "السبت",
          sessionName: "سحب B + سلسلة خلفية",
          focus: "السلسلة الخلفية + حجم الظهر",
          exercises: [
            { name: "رفعة ميتة رومانية", sets: "4 × 8" },
            { name: "عقلة (بمساعدة إذا لزم)", sets: "4 × الأقصى-1" },
            { name: "تجديف جالسًا بالكابل", sets: "3 × 12" },
            { name: "هيب ثراست", sets: "3 × 10" },
            { name: "رفع السمانة واقفًا", sets: "4 × 15" },
            { name: "مشي على جهاز بميل", sets: "20 دقيقة بميل 4-6%" }
          ]
        }
      ],
      progression: [
        {
          phase: "التأسيس",
          weeks: "1-4",
          loadingScheme: "المجموعات الأساسية · أضف تكرارًا لكل مجموعة أسبوعيًا ثم زد الوزن",
          intensityCue: "RPE 7 — اترك 3 تكرارات في الخزان في كل مجموعة عمل"
        },
        {
          phase: "التجفيف",
          weeks: "5-8",
          loadingScheme: "أنقص تكرارين، وزد 2,5-5 كغ في التمارين الأساسية، وأضف كتلة لياقة",
          intensityCue: "RPE 8 — اترك تكرارين في الخزان وادفع الكارديو"
        },
        {
          phase: "الصقل",
          weeks: "9-12",
          loadingScheme: "مجموعة قصوى + مجموعتا تخفيف في الأساسيات، وريفيد كل خمسة أيام",
          intensityCue: "RPE 8-9 — ذروة اللياقة، التقنية قبل الأنا"
        }
      ],
      groceryList: [
        {
          category: "بروتينات",
          items: [
            { item: "صدر دجاج", quantity: "1,4 كغ" },
            { item: "فيليه سلمون", quantity: "900 غ" },
            { item: "حبش مفروم قليل الدهن", quantity: "680 غ" },
            { item: "بيض", quantity: "24 بيضة" },
            { item: "زبادي يوناني (خالي الدسم)", quantity: "900 غ" },
            { item: "جبن قريش (قليل الدسم)", quantity: "450 غ" },
            { item: "بروتين واي", quantity: "علبة واحدة" }
          ]
        },
        {
          category: "كربوهيدرات",
          items: [
            { item: "أرز ياسمين", quantity: "900 غ" },
            { item: "شوفان مطحون", quantity: "500 غ" },
            { item: "بطاطا حلوة", quantity: "4 حبات متوسطة" },
            { item: "تورتيلا حبوب كاملة", quantity: "عبوة واحدة" },
            { item: "توت مشكل (مجمّد)", quantity: "كيسان" }
          ]
        },
        {
          category: "خضروات",
          items: [
            { item: "زهرات بروكلي", quantity: "900 غ" },
            { item: "خس", quantity: "رأسان" },
            { item: "سبانخ طازجة", quantity: "كيس واحد" },
            { item: "فلفل رومي", quantity: "4 حبات" },
            { item: "بصل", quantity: "3 حبات" },
            { item: "ثوم", quantity: "رأس واحد" }
          ]
        },
        {
          category: "دهون صحية",
          items: [
            { item: "أفوكادو", quantity: "4 حبات" },
            { item: "شرائح لوز", quantity: "225 غ" },
            { item: "زيت زيتون", quantity: "قارورة واحدة" }
          ]
        },
        {
          category: "مؤونة",
          items: [
            { item: "فاصولياء سوداء (معلبة)", quantity: "4 علب" },
            { item: "صلصة سالسا", quantity: "برطمان واحد" },
            { item: "عسل", quantity: "برطمان واحد" },
            { item: "صلصة صويا (قليلة الصوديوم)", quantity: "قارورة واحدة" },
            { item: "بهارات: كمون، بابريكا، قرفة، ثوم بودرة", quantity: "حسب الحاجة" }
          ]
        }
      ],
      whoFor: [
        "المتمرنون الراغبون في التنشيف دون خسارة عضل",
        "من يستطيع الوصول إلى الصالة خمسة أيام أسبوعيًا",
        "كل من يجيد أساسيات تمارين البار"
      ],
      whoNotFor: [
        "المبتدئون تمامًا — ابدأ ببرنامج Beginner Foundations",
        "من يتدرب في المنزل فقط — انظر باقة Home Starter"
      ],
      faq: [
        {
          q: "كم يومًا أتدرب في الأسبوع؟",
          a: "خمسة أيام: دفع وسحب وأرجل، ثم يوم دفع/لياقة ويوم للسلسلة الخلفية. كل حصة مكتوبة بالتفصيل في الجدول الأسبوعي."
        },
        {
          q: "هل أحتاج صالة كاملة التجهيز؟",
          a: "نعم. يعتمد البرنامج على البار والرَاك والدمبلات وجهاز الكابل والعقلة."
        },
        {
          q: "كيف يبدو النظام الغذائي؟",
          a: "تنشيف نظيف بنحو 15% تحت سعرات الثبات مع ~2,2 غ بروتين لكل كغ من وزن الجسم، وأسبوعا ريفيد، وست وصفات، وقائمة مشتريات مصنفة."
        },
        {
          q: "هل هذه الباقة مجانية فعلًا؟",
          a: "نعم. ملف الـ 12 أسبوعًا الكامل بصيغة PDF متاح للتنزيل مجانًا."
        }
      ]
    }
  },
  es: {
    "fat-loss": {
      weeklyTemplate: [
        {
          day: "Lun",
          sessionName: "Empuje A",
          focus: "Pecho · hombros · tríceps + finisher de acondicionamiento",
          exercises: [
            { name: "Press de banca con barra", sets: "4 × 6-8" },
            { name: "Press inclinado con mancuernas", sets: "3 × 10" },
            { name: "Aperturas en polea", sets: "3 × 12" },
            { name: "Press militar sentado", sets: "3 × 8" },
            { name: "Elevaciones laterales", sets: "3 × 15" },
            { name: "Extensión de tríceps con cuerda", sets: "3 × 12" },
            { name: "Intervalos en bici", sets: "10 min · 30 s trabajo / 30 s descanso", notes: "Finisher" }
          ]
        },
        {
          day: "Mar",
          sessionName: "Tirón A",
          focus: "Espalda · bíceps · deltoides posterior",
          exercises: [
            { name: "Peso muerto con barra hexagonal", sets: "4 × 5" },
            { name: "Remo con apoyo en banco", sets: "4 × 10" },
            { name: "Jalón al pecho", sets: "3 × 12" },
            { name: "Face pull", sets: "3 × 15" },
            { name: "Curl con mancuernas", sets: "3 × 12" },
            { name: "Curl martillo", sets: "3 × 12" }
          ]
        },
        {
          day: "Mié",
          sessionName: "Pierna A",
          focus: "Dominante de cuádriceps + core",
          exercises: [
            { name: "Sentadilla trasera", sets: "4 × 6-8" },
            { name: "Prensa de piernas", sets: "3 × 10" },
            { name: "Zancadas caminando", sets: "3 × 10 por pierna" },
            { name: "Extensión de cuádriceps", sets: "3 × 15" },
            { name: "Elevación de piernas colgado", sets: "3 × 12" },
            { name: "Plancha", sets: "3 × 45 s" }
          ]
        },
        {
          day: "Vie",
          sessionName: "Empuje B / Acondicionamiento",
          focus: "Hipertrofia del tren superior + cardio continuo",
          exercises: [
            { name: "Press de banca inclinado", sets: "4 × 8" },
            { name: "Press de pecho en máquina", sets: "3 × 12" },
            { name: "Elevaciones laterales con mancuernas", sets: "4 × 15" },
            { name: "Extensión de tríceps sobre la cabeza", sets: "3 × 12" },
            { name: "Cardio continuo", sets: "25 min zona 2" }
          ]
        },
        {
          day: "Sáb",
          sessionName: "Tirón B + cadena posterior",
          focus: "Cadena posterior + volumen de espalda",
          exercises: [
            { name: "Peso muerto rumano", sets: "4 × 8" },
            { name: "Dominadas (asistidas si hace falta)", sets: "4 × máx-1" },
            { name: "Remo sentado en polea", sets: "3 × 12" },
            { name: "Hip thrust", sets: "3 × 10" },
            { name: "Elevación de talones de pie", sets: "4 × 15" },
            { name: "Caminata en cinta inclinada", sets: "20 min al 4-6 % de inclinación" }
          ]
        }
      ],
      progression: [
        {
          phase: "Base",
          weeks: "1-4",
          loadingScheme: "Series/reps base · añade 1 rep por serie cada semana y luego sube el peso",
          intensityCue: "RPE 7 — deja 3 reps en recámara en cada serie efectiva"
        },
        {
          phase: "Definición",
          weeks: "5-8",
          loadingScheme: "Baja 2 reps, añade 2,5-5 kg en los básicos y suma un bloque de cardio",
          intensityCue: "RPE 8 — deja 2 reps en recámara y aprieta el cardio"
        },
        {
          phase: "Pulido",
          weeks: "9-12",
          loadingScheme: "Serie top + 2 series de descarga en los básicos, refeed cada 5 días",
          intensityCue: "RPE 8-9 — pico de acondicionamiento, técnica antes que ego"
        }
      ],
      groceryList: [
        {
          category: "Proteínas",
          items: [
            { item: "Pechuga de pollo", quantity: "1,4 kg" },
            { item: "Filetes de salmón", quantity: "900 g" },
            { item: "Pavo picado magro", quantity: "680 g" },
            { item: "Huevos", quantity: "2 docenas" },
            { item: "Yogur griego desnatado", quantity: "900 g" },
            { item: "Queso cottage bajo en grasa", quantity: "450 g" },
            { item: "Proteína whey", quantity: "1 bote" }
          ]
        },
        {
          category: "Carbohidratos",
          items: [
            { item: "Arroz jazmín", quantity: "900 g" },
            { item: "Copos de avena", quantity: "500 g" },
            { item: "Boniatos", quantity: "4 medianos" },
            { item: "Tortillas integrales", quantity: "1 paquete" },
            { item: "Frutos rojos (mezcla congelada)", quantity: "2 bolsas" }
          ]
        },
        {
          category: "Verduras",
          items: [
            { item: "Brócoli", quantity: "900 g" },
            { item: "Lechuga mantecosa", quantity: "2 unidades" },
            { item: "Espinacas baby", quantity: "1 bolsa" },
            { item: "Pimientos", quantity: "4" },
            { item: "Cebollas", quantity: "3" },
            { item: "Ajo", quantity: "1 cabeza" }
          ]
        },
        {
          category: "Grasas saludables",
          items: [
            { item: "Aguacate", quantity: "4" },
            { item: "Almendra laminada", quantity: "225 g" },
            { item: "Aceite de oliva", quantity: "1 botella" }
          ]
        },
        {
          category: "Despensa",
          items: [
            { item: "Frijoles negros (en conserva)", quantity: "4 latas" },
            { item: "Salsa", quantity: "1 tarro" },
            { item: "Miel", quantity: "1 tarro" },
            { item: "Salsa de soja (baja en sodio)", quantity: "1 botella" },
            { item: "Especias: comino, pimentón, canela, ajo en polvo", quantity: "según necesidad" }
          ]
        }
      ],
      whoFor: [
        "Personas que quieren definir sin perder músculo",
        "Quienes pueden ir al gimnasio cinco días por semana",
        "Cualquiera que ya domine los básicos con barra"
      ],
      whoNotFor: [
        "Principiantes absolutos — empieza por Beginner Foundations",
        "Quien entrena solo en casa — mira el Home Starter Bundle"
      ],
      faq: [
        {
          q: "¿Cuántos días a la semana entreno?",
          a: "Cinco: sesiones de empuje, tirón y pierna, más un día de empuje/acondicionamiento y otro de cadena posterior. Cada sesión está detallada en la plantilla semanal."
        },
        {
          q: "¿Necesito un gimnasio completo?",
          a: "Sí. El plan usa barra, rack, mancuernas, polea y barra de dominadas."
        },
        {
          q: "¿Cómo es la dieta?",
          a: "Una definición limpia en torno al 15 % por debajo del mantenimiento con ~2,2 g de proteína por kg, dos semanas de refeed, seis recetas y una lista de la compra por categorías."
        },
        {
          q: "¿De verdad este bundle es gratis?",
          a: "Sí. El dossier PDF completo de 12 semanas se descarga gratis."
        }
      ]
    }
  },
  fr: {
    "fat-loss": {
      weeklyTemplate: [
        {
          day: "Lun",
          sessionName: "Poussée A",
          focus: "Pecs · épaules · triceps + finisher cardio",
          exercises: [
            { name: "Développé couché à la barre", sets: "4 × 6-8" },
            { name: "Développé incliné haltères", sets: "3 × 10" },
            { name: "Écarté à la poulie", sets: "3 × 12" },
            { name: "Développé militaire assis", sets: "3 × 8" },
            { name: "Élévations latérales", sets: "3 × 15" },
            { name: "Extension triceps à la corde", sets: "3 × 12" },
            { name: "Intervalles vélo", sets: "10 min · 30 s effort / 30 s repos", notes: "Finisher" }
          ]
        },
        {
          day: "Mar",
          sessionName: "Tirage A",
          focus: "Dos · biceps · deltoïdes postérieurs",
          exercises: [
            { name: "Soulevé de terre trap-bar", sets: "4 × 5" },
            { name: "Rowing buste appuyé", sets: "4 × 10" },
            { name: "Tirage vertical", sets: "3 × 12" },
            { name: "Face pull", sets: "3 × 15" },
            { name: "Curl haltères", sets: "3 × 12" },
            { name: "Curl marteau", sets: "3 × 12" }
          ]
        },
        {
          day: "Mer",
          sessionName: "Jambes A",
          focus: "Dominante quadriceps + gainage",
          exercises: [
            { name: "Squat barre", sets: "4 × 6-8" },
            { name: "Presse à cuisses", sets: "3 × 10" },
            { name: "Fentes marchées", sets: "3 × 10 par jambe" },
            { name: "Leg extension", sets: "3 × 15" },
            { name: "Relevés de jambes suspendu", sets: "3 × 12" },
            { name: "Planche", sets: "3 × 45 s" }
          ]
        },
        {
          day: "Ven",
          sessionName: "Poussée B / Cardio",
          focus: "Hypertrophie du haut + cardio continu",
          exercises: [
            { name: "Développé couché incliné", sets: "4 × 8" },
            { name: "Développé machine", sets: "3 × 12" },
            { name: "Élévations latérales haltères", sets: "4 × 15" },
            { name: "Extension triceps au-dessus de la tête", sets: "3 × 12" },
            { name: "Cardio continu", sets: "25 min zone 2" }
          ]
        },
        {
          day: "Sam",
          sessionName: "Tirage B + chaîne postérieure",
          focus: "Chaîne postérieure + volume de dos",
          exercises: [
            { name: "Soulevé de terre roumain", sets: "4 × 8" },
            { name: "Tractions (assistées si besoin)", sets: "4 × max-1" },
            { name: "Rowing assis à la poulie", sets: "3 × 12" },
            { name: "Hip thrust", sets: "3 × 10" },
            { name: "Mollets debout", sets: "4 × 15" },
            { name: "Marche inclinée sur tapis", sets: "20 min à 4-6 % d'inclinaison" }
          ]
        }
      ],
      progression: [
        {
          phase: "Amorçage",
          weeks: "1-4",
          loadingScheme: "Séries/reps de base · +1 rep par série chaque semaine, puis monte la charge",
          intensityCue: "RPE 7 — garde 3 reps en réserve sur chaque série de travail"
        },
        {
          phase: "Sèche",
          weeks: "5-8",
          loadingScheme: "Baisse de 2 reps, +2,5-5 kg sur les mouvements principaux, +1 bloc cardio",
          intensityCue: "RPE 8 — garde 2 reps en réserve, pousse le cardio"
        },
        {
          phase: "Finition",
          weeks: "9-12",
          loadingScheme: "Série top + 2 back-off sur les principaux, refeed tous les 5 jours",
          intensityCue: "RPE 8-9 — pic de condition, la technique avant l'ego"
        }
      ],
      groceryList: [
        {
          category: "Protéines",
          items: [
            { item: "Blanc de poulet", quantity: "1,4 kg" },
            { item: "Pavés de saumon", quantity: "900 g" },
            { item: "Dinde hachée maigre", quantity: "680 g" },
            { item: "Œufs", quantity: "2 douzaines" },
            { item: "Yaourt grec 0 %", quantity: "900 g" },
            { item: "Cottage cheese allégé", quantity: "450 g" },
            { item: "Whey", quantity: "1 pot" }
          ]
        },
        {
          category: "Glucides",
          items: [
            { item: "Riz jasmin", quantity: "900 g" },
            { item: "Flocons d'avoine", quantity: "500 g" },
            { item: "Patates douces", quantity: "4 moyennes" },
            { item: "Tortillas complètes", quantity: "1 paquet" },
            { item: "Fruits rouges (mélange surgelé)", quantity: "2 sachets" }
          ]
        },
        {
          category: "Légumes",
          items: [
            { item: "Fleurettes de brocoli", quantity: "900 g" },
            { item: "Laitue beurre", quantity: "2 têtes" },
            { item: "Jeunes pousses d'épinards", quantity: "1 sachet" },
            { item: "Poivrons", quantity: "4" },
            { item: "Oignons", quantity: "3" },
            { item: "Ail", quantity: "1 tête" }
          ]
        },
        {
          category: "Bonnes graisses",
          items: [
            { item: "Avocat", quantity: "4" },
            { item: "Amandes effilées", quantity: "225 g" },
            { item: "Huile d'olive", quantity: "1 bouteille" }
          ]
        },
        {
          category: "Épicerie",
          items: [
            { item: "Haricots noirs (en conserve)", quantity: "4 boîtes" },
            { item: "Salsa", quantity: "1 pot" },
            { item: "Miel", quantity: "1 pot" },
            { item: "Sauce soja (pauvre en sel)", quantity: "1 bouteille" },
            { item: "Épices : cumin, paprika, cannelle, ail en poudre", quantity: "selon besoin" }
          ]
        }
      ],
      whoFor: [
        "Pratiquants qui veulent sécher sans perdre de muscle",
        "Ceux qui ont accès à une salle cinq jours par semaine",
        "Toute personne à l'aise avec les bases à la barre"
      ],
      whoNotFor: [
        "Grands débutants — commencez par Beginner Foundations",
        "Entraînement 100 % maison — voyez le Home Starter Bundle"
      ],
      faq: [
        {
          q: "Combien de jours d'entraînement par semaine ?",
          a: "Cinq : des séances poussée, tirage et jambes, puis une journée poussée/cardio et une journée chaîne postérieure. Chaque séance est détaillée dans le planning hebdomadaire."
        },
        {
          q: "Faut-il une salle complète ?",
          a: "Oui. Le plan utilise barre, rack, haltères, poulie et barre de traction."
        },
        {
          q: "À quoi ressemble la diète ?",
          a: "Une sèche propre à environ 15 % sous la maintenance, ~2,2 g de protéines par kg, deux semaines de refeed, six recettes et une liste de courses par catégories."
        },
        {
          q: "Ce bundle est-il vraiment gratuit ?",
          a: "Oui. Le dossier PDF complet de 12 semaines est téléchargeable gratuitement."
        }
      ]
    }
  }
};

/* ─── Merge engine ───────────────────────────────────────────────────── */

function localizeLines(lines: string[] | undefined, map: Record<string, string>): string[] | undefined {
  if (!lines) return lines;
  return lines.map((line) => map[line] ?? line);
}

function localizeRecipes(
  recipes: BundleRecipe[] | undefined,
  map: Record<string, RecipeOverride>
): BundleRecipe[] | undefined {
  if (!recipes) return recipes;
  return recipes.map((recipe) => {
    const o = map[recipe.name];
    if (!o) return recipe;
    return {
      ...recipe,
      name: o.name,
      time: o.time ?? recipe.time,
      // Length guard: a drifted override never truncates or pads EN content.
      ingredients:
        o.ingredients.length === recipe.ingredients.length ? o.ingredients : recipe.ingredients,
      steps: o.steps.length === recipe.steps.length ? o.steps : recipe.steps
    };
  });
}

function mergeArray<T extends object, O extends object>(
  base: T[] | undefined,
  overrides: Array<O | undefined> | undefined,
  mergeOne: (b: T, o: O) => T
): T[] | undefined {
  if (!base) return base;
  if (!overrides) return base;
  // Positional merge: index i overrides slot i. Extra overrides are ignored,
  // missing ones leave the EN slot untouched.
  return base.map((item, i) => {
    const o = overrides[i];
    return o ? mergeOne(item, o) : item;
  });
}

function mergeDay(base: BundleWeeklyTemplateDay, o: DayOverride): BundleWeeklyTemplateDay {
  return {
    day: o.day ?? base.day,
    sessionName: o.sessionName ?? base.sessionName,
    focus: o.focus ?? base.focus,
    exercises:
      mergeArray(base.exercises, o.exercises, (b, e: ExerciseOverride) => ({
        name: e.name ?? b.name,
        sets: e.sets ?? b.sets,
        ...(b.notes || e.notes ? { notes: e.notes ?? b.notes } : {})
      })) ?? base.exercises
  };
}

/**
 * Localize the structured content of an (already enriched) bundle. Returns a
 * NEW top-level object; `en` (or an unknown locale) returns the input as-is.
 *
 * Read-only by design: like `getBundle()` itself, the no-overlay path shares
 * the module-singleton nested arrays (weeklyTemplate/progression/… ) by
 * reference rather than deep-cloning per request. Callers must treat the
 * result as immutable — never sort/splice bundle content in place.
 */
export function localizeBundleContent(bundle: Bundle, locale: string): Bundle {
  const resolved = resolveCopyLocale(locale);
  if (resolved === "en") return bundle;
  const loc = resolved as NonEnLocale;

  const lines = SHARED_LINES[loc];
  const recipes = RECIPE_I18N[loc];
  const overlay = BUNDLE_CONTENT_I18N[loc][bundle.slug];

  const localized: Bundle = {
    ...bundle,
    warmup: localizeLines(bundle.warmup, lines),
    cooldown: localizeLines(bundle.cooldown, lines),
    equipment: localizeLines(bundle.equipment, lines),
    recipes: localizeRecipes(bundle.recipes, recipes)
  };

  if (!overlay) return localized;

  return {
    ...localized,
    weeklyTemplate: mergeArray(bundle.weeklyTemplate, overlay.weeklyTemplate, mergeDay),
    progression: mergeArray(bundle.progression, overlay.progression, (b, o: PhaseOverride) => ({
      phase: o.phase ?? b.phase,
      weeks: o.weeks ?? b.weeks,
      loadingScheme: o.loadingScheme ?? b.loadingScheme,
      intensityCue: o.intensityCue ?? b.intensityCue
    })),
    groceryList: mergeArray(
      bundle.groceryList,
      overlay.groceryList,
      (b, o: GroceryCategoryOverride): BundleGroceryCategory => ({
        category: o.category ?? b.category,
        items:
          mergeArray(b.items, o.items, (bi, oi: GroceryItemOverride) => ({
            item: oi.item ?? bi.item,
            quantity: oi.quantity ?? bi.quantity
          })) ?? b.items
      })
    ),
    whoFor:
      overlay.whoFor && overlay.whoFor.length === (bundle.whoFor?.length ?? 0)
        ? overlay.whoFor
        : bundle.whoFor,
    whoNotFor:
      overlay.whoNotFor && overlay.whoNotFor.length === (bundle.whoNotFor?.length ?? 0)
        ? overlay.whoNotFor
        : bundle.whoNotFor,
    faq: mergeArray(bundle.faq, overlay.faq, (b, o: FaqOverride) => ({
      q: o.q ?? b.q,
      a: o.a ?? b.a
    }))
  };
}

/** Test/tooling hook: the raw overlay tables, keyed by locale. */
export const __CONTENT_I18N_INTERNALS = {
  SHARED_LINES,
  RECIPE_I18N,
  BUNDLE_CONTENT_I18N
} as const;

