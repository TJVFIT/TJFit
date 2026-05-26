import type { Locale } from "@/lib/i18n";

// User-facing strings for the TJAI memory + persona settings surface.
// The previous version of this UI hardcoded English text; this module
// keeps en/tr/ar/es/fr in one place so we can spot mismatches quickly.

export type TjaiMemoryCopy = {
  coachStyleLabel: string;
  coachingStyleTitle: string;
  coachingStyleHint: string;
  longMemoryTitle: string;
  longMemoryHint: string;
  autoplayTitle: string;
  autoplayHint: string;
  storedFactsTitle: string;
  wipeAll: string;
  wipeConfirm: string;
  loading: string;
  empty: string;
  forget: string;
  forgetAria: string;
  toggleAria: (label: string) => string;
  categories: {
    goal: string;
    injury: string;
    constraint: string;
    lift: string;
    milestone: string;
    preference: string;
    general: string;
  };
};

const en: TjaiMemoryCopy = {
  coachStyleLabel: "Coach style:",
  coachingStyleTitle: "Coaching style",
  coachingStyleHint: "Pick how TJAI talks to you. Changes apply on the next message.",
  longMemoryTitle: "Long-term memory",
  longMemoryHint: "When on, TJAI remembers facts you share across conversations. Off = session-only.",
  autoplayTitle: "Auto-play voice replies",
  autoplayHint: "Speak each reply automatically using your coach’s voice.",
  storedFactsTitle: "Stored facts",
  wipeAll: "Wipe all",
  wipeConfirm: "Wipe everything TJAI remembers about you? This can’t be undone.",
  loading: "Loading…",
  empty: "Nothing stored yet. Talk to TJAI and it’ll remember the durable stuff.",
  forget: "forget",
  forgetAria: "Forget this",
  toggleAria: (label) => `Toggle ${label}`,
  categories: {
    goal: "Goals",
    injury: "Injuries",
    constraint: "Constraints",
    lift: "Lifts",
    milestone: "Milestones",
    preference: "Preferences",
    general: "General"
  }
};

const tr: TjaiMemoryCopy = {
  coachStyleLabel: "Koç tarzı:",
  coachingStyleTitle: "Koçluk tarzı",
  coachingStyleHint: "TJAI seninle nasıl konuşsun seç. Değişiklikler bir sonraki mesajda geçerli olur.",
  longMemoryTitle: "Uzun süreli hafıza",
  longMemoryHint: "Açıkken TJAI konuşmalar arası paylaştığın bilgileri hatırlar. Kapalı = sadece bu oturum.",
  autoplayTitle: "Sesli yanıtları otomatik oynat",
  autoplayHint: "Her yanıtı koçunun sesiyle otomatik seslendir.",
  storedFactsTitle: "Hatırlananlar",
  wipeAll: "Hepsini sil",
  wipeConfirm: "TJAI’nin senin hakkında hatırladığı her şey silinsin mi? Geri alınamaz.",
  loading: "Yükleniyor…",
  empty: "Henüz bir şey kayıtlı değil. TJAI ile konuş, kalıcı şeyleri hatırlar.",
  forget: "unut",
  forgetAria: "Bunu unut",
  toggleAria: (label) => `${label} aç/kapat`,
  categories: {
    goal: "Hedefler",
    injury: "Sakatlıklar",
    constraint: "Kısıtlar",
    lift: "Kaldırışlar",
    milestone: "Kilometre taşları",
    preference: "Tercihler",
    general: "Genel"
  }
};

const ar: TjaiMemoryCopy = {
  coachStyleLabel: "أسلوب المدرّب:",
  coachingStyleTitle: "أسلوب التدريب",
  coachingStyleHint: "اختر كيف يخاطبك TJAI. التغييرات تسري مع الرسالة التالية.",
  longMemoryTitle: "الذاكرة طويلة المدى",
  longMemoryHint: "عند التفعيل يتذكّر TJAI ما تشاركه عبر المحادثات. عند الإيقاف يقتصر التذكّر على الجلسة الحالية.",
  autoplayTitle: "تشغيل الردود الصوتية تلقائياً",
  autoplayHint: "اقرأ كل رد تلقائياً بصوت مدرّبك.",
  storedFactsTitle: "ما يتذكره عنك",
  wipeAll: "مسح الكل",
  wipeConfirm: "هل ترغب في مسح كل ما يتذكّره TJAI عنك؟ لا يمكن التراجع.",
  loading: "جارٍ التحميل…",
  empty: "لا شيء محفوظ بعد. تحدّث مع TJAI وسيحفظ النقاط المستمرة.",
  forget: "أنسَ",
  forgetAria: "أنسَ هذه",
  toggleAria: (label) => `تبديل ${label}`,
  categories: {
    goal: "الأهداف",
    injury: "الإصابات",
    constraint: "القيود",
    lift: "تمارين الرفع",
    milestone: "الإنجازات",
    preference: "التفضيلات",
    general: "عام"
  }
};

const es: TjaiMemoryCopy = {
  coachStyleLabel: "Estilo de coach:",
  coachingStyleTitle: "Estilo de coaching",
  coachingStyleHint: "Elige cómo te habla TJAI. Los cambios se aplican en el próximo mensaje.",
  longMemoryTitle: "Memoria a largo plazo",
  longMemoryHint: "Cuando está activa, TJAI recuerda lo que compartes entre conversaciones. Desactivada = solo la sesión.",
  autoplayTitle: "Reproducir respuestas de voz automáticamente",
  autoplayHint: "Reproduce cada respuesta automáticamente con la voz de tu coach.",
  storedFactsTitle: "Datos guardados",
  wipeAll: "Borrar todo",
  wipeConfirm: "¿Borrar todo lo que TJAI recuerda de ti? No se puede deshacer.",
  loading: "Cargando…",
  empty: "Aún no hay nada guardado. Habla con TJAI y recordará lo importante.",
  forget: "olvidar",
  forgetAria: "Olvidar esto",
  toggleAria: (label) => `Alternar ${label}`,
  categories: {
    goal: "Objetivos",
    injury: "Lesiones",
    constraint: "Restricciones",
    lift: "Levantamientos",
    milestone: "Hitos",
    preference: "Preferencias",
    general: "General"
  }
};

const fr: TjaiMemoryCopy = {
  coachStyleLabel: "Style de coach :",
  coachingStyleTitle: "Style de coaching",
  coachingStyleHint: "Choisissez comment TJAI vous parle. Les changements s’appliquent au prochain message.",
  longMemoryTitle: "Mémoire long terme",
  longMemoryHint: "Activée, TJAI retient les informations partagées entre les conversations. Désactivée = session uniquement.",
  autoplayTitle: "Lire les réponses vocales automatiquement",
  autoplayHint: "Lit chaque réponse avec la voix de votre coach.",
  storedFactsTitle: "Faits mémorisés",
  wipeAll: "Tout effacer",
  wipeConfirm: "Effacer tout ce que TJAI retient sur vous ? Action irréversible.",
  loading: "Chargement…",
  empty: "Rien de stocké pour l’instant. Discutez avec TJAI et il mémorisera l’essentiel.",
  forget: "oublier",
  forgetAria: "Oublier ceci",
  toggleAria: (label) => `Basculer ${label}`,
  categories: {
    goal: "Objectifs",
    injury: "Blessures",
    constraint: "Contraintes",
    lift: "Levés",
    milestone: "Étapes",
    preference: "Préférences",
    general: "Général"
  }
};

const TABLE: Record<Locale, TjaiMemoryCopy> = { en, tr, ar, es, fr };

export function getTjaiMemoryCopy(locale: Locale): TjaiMemoryCopy {
  return TABLE[locale] ?? en;
}
