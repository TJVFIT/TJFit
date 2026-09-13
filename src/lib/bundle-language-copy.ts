import type { Locale } from './i18n';

/** Labels are localized; the existing detailed training library is not fully translated. */
const languageNotice: Record<Locale, string> = {
  en: 'PDFs include English exercise instructions and recipes. Headings and introductory sections are available in five languages.',
  tr: 'PDF’lerdeki ayrıntılı egzersiz talimatları ve tarifler İngilizcedir. Başlıklar ve giriş bölümleri beş dilde sunulur.',
  ar: 'تتضمن ملفات PDF تعليمات تمارين ووصفات تفصيلية بالإنجليزية. تتوفر العناوين والأقسام التمهيدية بخمس لغات.',
  es: 'Los PDF incluyen instrucciones detalladas de ejercicios y recetas en inglés. Los títulos y las introducciones están disponibles en cinco idiomas.',
  fr: 'Les PDF contiennent des instructions détaillées d’exercices et des recettes en anglais. Les titres et les introductions sont disponibles en cinq langues.',
};

export function getBundleLanguageNotice(locale: Locale): string {
  return languageNotice[locale];
}
