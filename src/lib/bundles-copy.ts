import { resolveCopyLocale } from "@/lib/i18n";
import type { BundleGoal } from "@/lib/bundles";

/**
 * Localized copy for the /bundles listing page + bundle grid.
 *
 * The bundle *content* (names, hooks, phases, sample days) still lives in
 * English inside src/lib/bundles.ts — translating that catalogue is a
 * separate queued task. This module covers the page chrome only:
 * headings, filter chips, card labels, CTAs, footnotes, and a11y strings.
 */

type FilterKey = "all" | BundleGoal;

export type BundlesCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: (count: number) => string;
  lead: string;
  coachEyebrow: string;
  coachBody: string;
  filterAria: string;
  filterLabels: Record<FilterKey, string>;
  emptyFilter: string;
  duration: string;
  sessions: string;
  weeksValue: (n: number) => string;
  sessionsValue: (n: number) => string;
  download: string;
  details: string;
  footnoteFree: string;
  footnotePaid: string;
  goalAria: (label: string) => string;
  priceAria: (save: string) => string;
  downloadAria: (name: string) => string;
  detailsAria: (name: string) => string;
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", BundlesCopy> = {
  en: {
    metaTitle: "Program Bundles · TJFit",
    metaDescription:
      "Twelve 12-week training + diet bundles, delivered as branded PDF dossiers. Train smarter, eat sharper.",
    eyebrow: "Bundles",
    title: (count) => `${count} bundles. One way to train.`,
    lead: "Each bundle pairs a 12-week training protocol with a matching diet system, delivered as a branded PDF dossier. Pick the goal — we built the rest.",
    coachEyebrow: "For coaches & affiliates",
    coachBody:
      "Each PDF dossier is generated from the same blueprint that powers TJAI. Print it, mail it, white-label sections in your own coaching workflow — your TJFit purchase grants you a personal-use license.",
    filterAria: "Filter bundles by goal",
    filterLabels: {
      all: "All",
      "fat-loss": "Cut",
      "muscle-gain": "Build",
      recomp: "Recomp",
      strength: "Strength",
      conditioning: "Conditioning",
      foundation: "Start"
    },
    emptyFilter: "No bundles match this filter yet.",
    duration: "Duration",
    sessions: "Sessions",
    weeksValue: (n) => `${n} weeks`,
    sessionsValue: (n) => `${n}×/wk`,
    download: "Download PDF",
    details: "Details",
    footnoteFree: "Free with sign-in · branded dossier · A4 print-ready",
    footnotePaid: "Sign in required · branded dossier · A4 print-ready",
    goalAria: (label) => `Goal: ${label}`,
    priceAria: (save) => `Price: ${save}`,
    downloadAria: (name) => `Download ${name} PDF`,
    detailsAria: (name) => `Open ${name} details`
  },
  tr: {
    metaTitle: "Program Paketleri · TJFit",
    metaDescription:
      "On iki adet 12 haftalık antrenman + diyet paketi, markalı PDF dosyaları olarak. Daha akıllı antrenman, daha net beslenme.",
    eyebrow: "Paketler",
    title: (count) => `${count} paket. Tek bir antrenman yolu.`,
    lead: "Her paket, 12 haftalık bir antrenman protokolünü uyumlu bir diyet sistemiyle eşleştirir ve markalı bir PDF dosyası olarak sunulur. Hedefi seç — gerisini biz kurduk.",
    coachEyebrow: "Koçlar ve ortaklar için",
    coachBody:
      "Her PDF dosyası, TJAI'yi çalıştıran aynı şablondan üretilir. Yazdır, gönder, kendi koçluk akışında bölümleri kendi markanla kullan — TJFit satın alımın sana kişisel kullanım lisansı verir.",
    filterAria: "Paketleri hedefe göre filtrele",
    filterLabels: {
      all: "Tümü",
      "fat-loss": "Yağ yak",
      "muscle-gain": "Kas yap",
      recomp: "Rekomp",
      strength: "Güç",
      conditioning: "Kondisyon",
      foundation: "Başlangıç"
    },
    emptyFilter: "Bu filtreye uyan paket henüz yok.",
    duration: "Süre",
    sessions: "Seans",
    weeksValue: (n) => `${n} hafta`,
    sessionsValue: (n) => `${n}×/hafta`,
    download: "PDF indir",
    details: "Detaylar",
    footnoteFree: "Girişle ücretsiz · markalı dosya · A4 baskıya hazır",
    footnotePaid: "Giriş gerekli · markalı dosya · A4 baskıya hazır",
    goalAria: (label) => `Hedef: ${label}`,
    priceAria: (save) => `Fiyat: ${save}`,
    downloadAria: (name) => `${name} PDF dosyasını indir`,
    detailsAria: (name) => `${name} detaylarını aç`
  },
  ar: {
    metaTitle: "حزم البرامج · TJFit",
    metaDescription:
      "اثنتا عشرة حزمة تدريب وتغذية لمدة 12 أسبوعاً، تُسلَّم كملفات PDF تحمل العلامة. تدرّب بذكاء، وتغذَّ بدقة.",
    eyebrow: "الحزم",
    title: (count) => `${count} حزمة. طريق واحد للتدريب.`,
    lead: "تجمع كل حزمة بروتوكول تدريب لمدة 12 أسبوعاً مع نظام غذائي متوافق، وتُسلَّم كملف PDF يحمل العلامة. اختر الهدف — وقد بنينا الباقي.",
    coachEyebrow: "للمدربين والشركاء",
    coachBody:
      "يُنشأ كل ملف PDF من المخطط نفسه الذي يشغّل TJAI. اطبعه، أرسله، وأضف علامتك على الأقسام ضمن سير عملك التدريبي — يمنحك شراؤك من TJFit ترخيص استخدام شخصي.",
    filterAria: "تصفية الحزم حسب الهدف",
    filterLabels: {
      all: "الكل",
      "fat-loss": "تنشيف",
      "muscle-gain": "تضخيم",
      recomp: "ريكومب",
      strength: "قوة",
      conditioning: "لياقة",
      foundation: "بداية"
    },
    emptyFilter: "لا توجد حزم تطابق هذا التصفية بعد.",
    duration: "المدة",
    sessions: "الجلسات",
    weeksValue: (n) => `${n} أسبوعاً`,
    sessionsValue: (n) => `${n}×/أسبوع`,
    download: "تنزيل PDF",
    details: "التفاصيل",
    footnoteFree: "مجاني مع تسجيل الدخول · ملف بالعلامة · جاهز للطباعة A4",
    footnotePaid: "يتطلب تسجيل الدخول · ملف بالعلامة · جاهز للطباعة A4",
    goalAria: (label) => `الهدف: ${label}`,
    priceAria: (save) => `السعر: ${save}`,
    downloadAria: (name) => `تنزيل ملف ${name} بصيغة PDF`,
    detailsAria: (name) => `فتح تفاصيل ${name}`
  },
  es: {
    metaTitle: "Paquetes de programas · TJFit",
    metaDescription:
      "Doce paquetes de entrenamiento y dieta de 12 semanas, entregados como dossiers PDF de marca. Entrena con cabeza, come con precisión.",
    eyebrow: "Paquetes",
    title: (count) => `${count} paquetes. Una sola forma de entrenar.`,
    lead: "Cada paquete combina un protocolo de entrenamiento de 12 semanas con un sistema de dieta a juego, entregado como un dossier PDF de marca. Elige el objetivo — el resto ya lo construimos.",
    coachEyebrow: "Para coaches y afiliados",
    coachBody:
      "Cada dossier PDF se genera con el mismo blueprint que impulsa TJAI. Imprímelo, envíalo, etiqueta secciones con tu marca en tu propio flujo de coaching — tu compra en TJFit te otorga una licencia de uso personal.",
    filterAria: "Filtrar paquetes por objetivo",
    filterLabels: {
      all: "Todos",
      "fat-loss": "Definición",
      "muscle-gain": "Volumen",
      recomp: "Recomp",
      strength: "Fuerza",
      conditioning: "Acondicionamiento",
      foundation: "Inicio"
    },
    emptyFilter: "Ningún paquete coincide con este filtro todavía.",
    duration: "Duración",
    sessions: "Sesiones",
    weeksValue: (n) => `${n} semanas`,
    sessionsValue: (n) => `${n}×/sem`,
    download: "Descargar PDF",
    details: "Detalles",
    footnoteFree: "Gratis con inicio de sesión · dossier de marca · listo para imprimir A4",
    footnotePaid: "Requiere inicio de sesión · dossier de marca · listo para imprimir A4",
    goalAria: (label) => `Objetivo: ${label}`,
    priceAria: (save) => `Precio: ${save}`,
    downloadAria: (name) => `Descargar el PDF de ${name}`,
    detailsAria: (name) => `Abrir los detalles de ${name}`
  },
  fr: {
    metaTitle: "Packs de programmes · TJFit",
    metaDescription:
      "Douze packs entraînement et diète de 12 semaines, livrés en dossiers PDF de marque. Entraîne-toi mieux, mange plus juste.",
    eyebrow: "Packs",
    title: (count) => `${count} packs. Une seule façon de s'entraîner.`,
    lead: "Chaque pack associe un protocole d'entraînement de 12 semaines à un système de diète assorti, livré en dossier PDF de marque. Choisis l'objectif — on a construit le reste.",
    coachEyebrow: "Pour coachs et affiliés",
    coachBody:
      "Chaque dossier PDF est généré à partir du même blueprint qui propulse TJAI. Imprime-le, envoie-le, appose ta marque sur des sections dans ton propre flux de coaching — ton achat TJFit t'accorde une licence d'usage personnel.",
    filterAria: "Filtrer les packs par objectif",
    filterLabels: {
      all: "Tous",
      "fat-loss": "Sèche",
      "muscle-gain": "Prise de masse",
      recomp: "Recomp",
      strength: "Force",
      conditioning: "Conditionnement",
      foundation: "Débuter"
    },
    emptyFilter: "Aucun pack ne correspond à ce filtre pour l'instant.",
    duration: "Durée",
    sessions: "Séances",
    weeksValue: (n) => `${n} semaines`,
    sessionsValue: (n) => `${n}×/sem`,
    download: "Télécharger le PDF",
    details: "Détails",
    footnoteFree: "Gratuit avec connexion · dossier de marque · prêt à imprimer A4",
    footnotePaid: "Connexion requise · dossier de marque · prêt à imprimer A4",
    goalAria: (label) => `Objectif : ${label}`,
    priceAria: (save) => `Prix : ${save}`,
    downloadAria: (name) => `Télécharger le PDF de ${name}`,
    detailsAria: (name) => `Ouvrir les détails de ${name}`
  }
};

export function getBundlesCopy(locale: string): BundlesCopy {
  return COPY[resolveCopyLocale(locale)];
}
