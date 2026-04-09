import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

import { programs } from "@/lib/content";
import { type FreeProductBlock, getFreeProductPageModel, isFreeProductSlug } from "@/lib/free-product-pages";
import { isLocale, type Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";

const COPY: Record<
  Locale,
  {
    category: string;
    difficulty: string;
    duration: string;
    includedAssets: string;
    warmup: string;
    main: string;
    cooldown: string;
    evidenceTitle: string;
    safetyTitle: string;
    footer1: string;
    footer2: string;
    line: string;
  }
> = {
  en: {
    category: "Category",
    difficulty: "Difficulty",
    duration: "Duration",
    includedAssets: "Included assets",
    warmup: "Warm-up",
    main: "Main work",
    cooldown: "Cooldown",
    evidenceTitle: "Evidence-based execution rules",
    safetyTitle: "Safety and expectations",
    footer1: "Use this resource with the free TDEE calculator and community support inside TJFit.",
    footer2: "This is a free download from Start Free.",
    line: "=============================="
  },
  tr: {
    category: "Kategori",
    difficulty: "Seviye",
    duration: "Sure",
    includedAssets: "Icerikteki varliklar",
    warmup: "Isinma",
    main: "Ana bolum",
    cooldown: "Soguma",
    evidenceTitle: "Bilim temelli uygulama kurallari",
    safetyTitle: "Guvenlik ve beklenti notlari",
    footer1: "Bu kaynagi TJFit icindeki ucretsiz TDEE hesaplayici ve topluluk destegiyle birlikte kullanin.",
    footer2: "Bu dosya Start Free uzerinden ucretsiz indirilmistir.",
    line: "=============================="
  },
  ar: {
    category: "التصنيف",
    difficulty: "المستوى",
    duration: "المدة",
    includedAssets: "المحتويات",
    warmup: "الإحماء",
    main: "الجزء الأساسي",
    cooldown: "التهدئة",
    evidenceTitle: "قواعد تطبيق مبنية على الأدلة",
    safetyTitle: "السلامة وتوقعات النتائج",
    footer1: "استخدم هذا المورد مع حاسبة TDEE المجانية ودعم المجتمع داخل TJFit.",
    footer2: "هذا تنزيل مجاني من Start Free.",
    line: "=============================="
  },
  es: {
    category: "Categoria",
    difficulty: "Nivel",
    duration: "Duracion",
    includedAssets: "Activos incluidos",
    warmup: "Calentamiento",
    main: "Trabajo principal",
    cooldown: "Enfriamiento",
    evidenceTitle: "Reglas de ejecucion basadas en evidencia",
    safetyTitle: "Seguridad y expectativas",
    footer1: "Usa este recurso junto con la calculadora TDEE gratuita y el soporte de comunidad de TJFit.",
    footer2: "Esta descarga gratuita viene desde Start Free.",
    line: "=============================="
  },
  fr: {
    category: "Categorie",
    difficulty: "Niveau",
    duration: "Duree",
    includedAssets: "Contenu inclus",
    warmup: "Echauffement",
    main: "Travail principal",
    cooldown: "Retour au calme",
    evidenceTitle: "Regles d'execution basees sur les preuves",
    safetyTitle: "Securite et attentes",
    footer1: "Utilisez cette ressource avec le calculateur TDEE gratuit et le support communaute dans TJFit.",
    footer2: "Ce fichier est un telechargement gratuit depuis Start Free.",
    line: "=============================="
  }
};

function evidenceRules(locale: Locale, isNutrition: boolean) {
  const text: Record<Locale, string[]> = {
    en: [
      "Progressive overload: increase load 2-10% (or 1-2 reps) once all target reps are completed cleanly.",
      "Training frequency target: each major muscle group at least 2x/week with 1-3 min rest for most working sets.",
      "Protein target: most active adults progress well around 1.4-2.2 g/kg/day, split into 3-5 feedings.",
      isNutrition
        ? "Nutrition adherence rule: keep meal timing consistent, hit protein first, then adjust carbs/fats to target calories."
        : "Conditioning baseline: aim for 150-300 min moderate weekly activity (or equivalent vigorous work) across the week.",
      "Sleep and recovery: target 7-9 h sleep, 2.5-3.5 L fluids/day, and keep 7k-10k daily steps where possible."
    ],
    tr: [
      "Progresif yukleme: hedef tekrarlar temiz cikinca agirligi %2-10 (veya 1-2 tekrar) artirin.",
      "Antrenman sikligi: buyuk kas gruplarini haftada en az 2 kez calistirin; ana setlerde 1-3 dk dinlenin.",
      "Protein hedefi: aktif bireylerde genelde 1.4-2.2 g/kg/gun araligi etkili olur; 3-5 ogune bolun.",
      isNutrition
        ? "Beslenme kuralı: ogun saatini tutarli tutun, once proteini tamamlayin, sonra karbonhidrat/yagi kaloriye gore ayarlayin."
        : "Kondisyon tabani: haftaya yayilmis sekilde 150-300 dk orta siddet (veya esdeger yuksek siddet) hedefleyin.",
      "Uyku ve toparlanma: 7-9 saat uyku, gunluk 2.5-3.5 L su ve mumkunse 7k-10k adim hedefleyin."
    ],
    ar: [
      "الحمل التدريجي: زد الحمل 2-10% (أو 1-2 تكرار) عندما تنهي جميع التكرارات بجودة عالية.",
      "التكرار الأسبوعي: درّب كل مجموعة عضلية رئيسية مرتين أسبوعياً على الأقل، مع راحة 1-3 دقائق لمعظم المجموعات.",
      "هدف البروتين: أغلب النشطين يتقدمون جيداً عند 1.4-2.2 غ/كغ يومياً موزعة على 3-5 وجبات.",
      isNutrition
        ? "قاعدة الالتزام الغذائي: ثبّت توقيت الوجبات، أنجز البروتين أولاً، ثم عدّل الكارب/الدهون حسب السعرات."
        : "خط أساس اللياقة: استهدف 150-300 دقيقة نشاط متوسط أسبوعياً (أو ما يعادله عالي الشدة).",
      "النوم والتعافي: 7-9 ساعات نوم، 2.5-3.5 لتر سوائل يومياً، و7k-10k خطوة عند الإمكان."
    ],
    es: [
      "Sobrecarga progresiva: sube la carga 2-10% (o 1-2 repeticiones) cuando completes el objetivo con tecnica limpia.",
      "Frecuencia: trabaja cada grupo muscular principal al menos 2 veces por semana; descanso 1-3 min en series principales.",
      "Proteina: la mayoria de personas activas progresa bien con 1.4-2.2 g/kg/dia repartidos en 3-5 tomas.",
      isNutrition
        ? "Regla nutricional: manten horarios consistentes, cumple primero la proteina y ajusta carbohidratos/grasas a calorias objetivo."
        : "Base de actividad: busca 150-300 min semanales de actividad moderada (o equivalente vigorosa).",
      "Sueno y recuperacion: apunta a 7-9 h de sueno, 2.5-3.5 L de agua y 7k-10k pasos diarios cuando sea posible."
    ],
    fr: [
      "Surcharge progressive : augmentez la charge de 2-10% (ou 1-2 repetitions) quand toutes les reps sont propres.",
      "Frequence : entrainer chaque grand groupe musculaire au moins 2 fois/semaine; repos 1-3 min sur la plupart des series.",
      "Proteines : la plupart des actifs progressent bien autour de 1.4-2.2 g/kg/jour en 3-5 prises.",
      isNutrition
        ? "Regle nutrition : gardez des horaires stables, validez d'abord les proteines, puis ajustez glucides/lipides selon les calories."
        : "Base cardio : visez 150-300 min d'activite moderee/semaine (ou equivalent vigoureux).",
      "Sommeil et recuperation : ciblez 7-9 h de sommeil, 2.5-3.5 L d'eau et 7k-10k pas/jour quand possible."
    ]
  };
  return text[locale];
}

function buildFreeGuidePdf(args: {
  locale: Locale;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  assets: string[];
  blocks: FreeProductBlock[];
  evidenceLines: string[];
  safetyLines: string[];
  footer1: string;
  footer2: string;
}) {
  const { locale, title, category, difficulty, duration, description, assets, blocks, evidenceLines, safetyLines, footer1, footer2 } = args;
  const c = COPY[locale];
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  let y = margin;

  const drawCover = () => {
    pdf.setFillColor(9, 9, 11);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(34, 211, 238);
    pdf.rect(0, 0, pageWidth, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(34, 211, 238);
    pdf.text("TJFit", margin, 36);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.text(title, margin, 84, { maxWidth: pageWidth - margin * 2 });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(161, 161, 170);
    pdf.text(`${c.category}: ${category}`, margin, 128);
    pdf.text(`${c.difficulty}: ${difficulty}`, margin, 146);
    pdf.text(`${c.duration}: ${duration}`, margin, 164);

    pdf.setTextColor(212, 212, 216);
    const overview = pdf.splitTextToSize(description, pageWidth - margin * 2) as string[];
    pdf.text(overview, margin, 200);
    y = 250;
  };

  const drawBodyPage = () => {
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setDrawColor(34, 211, 238);
    pdf.setLineWidth(1);
    pdf.line(0, 16, pageWidth, 16);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(20, 20, 20);
    pdf.text(title, margin, 36, { maxWidth: pageWidth - margin * 2 });
    y = 58;
  };

  const ensureSpace = (need = 22) => {
    if (y + need <= pageHeight - margin) return;
    drawBodyPage();
  };

  const writeWrapped = (text: string, fontSize = 11, color: [number, number, number] = [39, 39, 42], lineHeight = 16) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2) as string[];
    ensureSpace(lines.length * lineHeight + 10);
    pdf.text(lines, margin, y);
    y += lines.length * lineHeight + 8;
  };

  const writeH2 = (text: string) => {
    ensureSpace(34);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.setTextColor(8, 145, 178);
    pdf.text(text, margin, y);
    y += 20;
    pdf.setDrawColor(186, 230, 253);
    pdf.setLineWidth(0.8);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  const writeH3 = (text: string) => {
    ensureSpace(24);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(17, 24, 39);
    pdf.text(text, margin, y);
    y += 16;
  };

  const writeBullets = (items: string[]) => {
    for (const item of items) {
      const lines = pdf.splitTextToSize(item, pageWidth - margin * 2 - 14) as string[];
      ensureSpace(lines.length * 15 + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(39, 39, 42);
      pdf.text("•", margin, y);
      pdf.text(lines, margin + 12, y);
      y += lines.length * 15 + 5;
    }
  };

  drawCover();
  drawBodyPage();

  writeH2(c.includedAssets);
  writeBullets(assets);
  y += 4;

  for (const block of blocks) {
    if (block.type === "h2") {
      writeH2(block.text);
      continue;
    }
    if (block.type === "h3") {
      writeH3(block.text);
      continue;
    }
    if (block.type === "p") {
      writeWrapped(block.text);
      continue;
    }
    if (block.type === "ul") {
      writeBullets(block.items);
      continue;
    }
    if (block.type === "day") {
      writeH3(block.day.title);
      writeWrapped(`${c.warmup}:`, 11, [8, 145, 178], 14);
      writeBullets(block.day.warmupLines);
      writeWrapped(`${c.main}:`, 11, [8, 145, 178], 14);
      writeBullets(
        block.day.exercises.map((ex, i) => (ex.note ? `${i + 1}. ${ex.line} (${ex.note})` : `${i + 1}. ${ex.line}`))
      );
      writeWrapped(`${c.cooldown}:`, 11, [8, 145, 178], 14);
      writeBullets(block.day.cooldownLines);
      y += 4;
    }
  }

  writeH2(c.evidenceTitle);
  writeBullets(evidenceLines);
  writeH2(c.safetyTitle);
  writeBullets(safetyLines);
  y += 10;
  writeWrapped(footer1, 10, [82, 82, 91], 14);
  writeWrapped(footer2, 10, [82, 82, 91], 14);

  return pdf.output("arraybuffer");
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const slug = String(sp.get("slug") ?? "").trim();
  const localeRaw = String(sp.get("locale") ?? "en");
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "en";
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const program = programs.find((p) => p.slug === slug && p.is_free);
  if (!program) {
    return NextResponse.json({ error: "Free resource not found" }, { status: 404 });
  }

  const localized = localizeProgram(program, locale);
  const copy = COPY[locale];
  const isNutrition = localized.category.toLowerCase().includes("nutrition");

  const model = isFreeProductSlug(slug) ? getFreeProductPageModel(slug, locale) : null;
  const safetyLines =
    locale === "ar"
      ? [
          "ابدأ بمستواك الحالي وعدّل الشدة عند الحاجة.",
          "أوقف التمرين فوراً عند ألم حاد أو دوخة أو ضيق نفس.",
          "النتائج تختلف حسب الالتزام، النوم، التغذية، والحالة الصحية."
        ]
      : locale === "tr"
        ? [
            "Her zaman mevcut seviyenden basla, siddeti ihtiyaca gore ayarla.",
            "Keskin agri, bas donmesi veya nefes darliginda antrenmani hemen durdur.",
            "Sonuclar kisiden kisiye; tutarlilik, uyku, beslenme ve saglik durumuna gore degisir."
          ]
        : locale === "es"
          ? [
              "Empieza desde tu nivel actual y ajusta la intensidad cuando sea necesario.",
              "Deten el entrenamiento si aparece dolor agudo, mareo o falta de aire.",
              "Los resultados varian segun adherencia, sueno, nutricion y estado de salud."
            ]
          : locale === "fr"
            ? [
                "Commencez a votre niveau actuel et ajustez l'intensite selon le besoin.",
                "Arretez immediatement en cas de douleur vive, vertige ou essoufflement.",
                "Les resultats varient selon la regularite, le sommeil, l'alimentation et l'etat de sante."
              ]
            : [
                "Start from your current level and scale intensity as needed.",
                "Stop immediately for sharp pain, dizziness, or shortness of breath.",
                "Results vary based on consistency, sleep, nutrition, and baseline health."
              ];
  const pdf = buildFreeGuidePdf({
    locale,
    title: localized.title,
    category: localized.category,
    difficulty: localized.difficulty,
    duration: localized.duration,
    description: localized.description,
    assets: program.assets.map((a, i) => `${i + 1}. ${a.label}`),
    blocks: model?.blocks ?? [],
    evidenceLines: evidenceRules(locale, isNutrition),
    safetyLines,
    footer1: copy.footer1,
    footer2: copy.footer2
  });

  const safeName = slug.replace(/[^a-z0-9\-]/gi, "-");
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`
    }
  });
}
