import type { Locale } from "@/lib/i18n";

export const BLOG_CATEGORIES = ["Training", "Nutrition", "Mindset", "Recovery", "Lifestyle"] as const;

type BlogEditorCopy = {
  locked: string; unlock: string; programCompleted: string; daysActive: string;
  heading: string; title: string; category: string; content: string; write: string;
  tags: string; cover: string; preview: string; submit: string; saved: string; failed: string;
  categories: Record<(typeof BLOG_CATEGORIES)[number], string>;
};

export const BLOG_EDITOR_COPY: Record<Locale, BlogEditorCopy> = {
  en: {
    locked: "Blog posting locked", unlock: "Complete a 12-week program and be active for 30+ days to unlock.",
    programCompleted: "Program completed", daysActive: "Days active", heading: "Write a Blog Post",
    title: "Post title", category: "Category", content: "Article content", write: "Write your article…",
    tags: "Tags (comma separated)", cover: "Cover image", preview: "Search description preview",
    submit: "Submit for Review", saved: "Post saved successfully.", failed: "Could not submit your post. Please try again.",
    categories: { Training: "Training", Nutrition: "Nutrition", Mindset: "Mindset", Recovery: "Recovery", Lifestyle: "Lifestyle" }
  },
  tr: {
    locked: "Blog yazma kilitli", unlock: "Kilidi açmak için 12 haftalık bir programı tamamla ve en az 30 gün aktif ol.",
    programCompleted: "Program tamamlandı", daysActive: "Aktif günler", heading: "Blog Yazısı Yaz",
    title: "Yazı başlığı", category: "Kategori", content: "Yazı içeriği", write: "Yazını yaz…",
    tags: "Etiketler (virgülle ayır)", cover: "Kapak görseli", preview: "Arama açıklaması önizlemesi",
    submit: "İncelemeye Gönder", saved: "Yazı başarıyla kaydedildi.", failed: "Yazın gönderilemedi. Lütfen tekrar dene.",
    categories: { Training: "Antrenman", Nutrition: "Beslenme", Mindset: "Zihniyet", Recovery: "Toparlanma", Lifestyle: "Yaşam tarzı" }
  },
  ar: {
    locked: "نشر المقالات مقفل", unlock: "أكمل برنامجاً مدته 12 أسبوعاً وكن نشطاً لمدة 30 يوماً على الأقل لفتح النشر.",
    programCompleted: "البرنامج مكتمل", daysActive: "أيام النشاط", heading: "اكتب مقالة",
    title: "عنوان المقالة", category: "الفئة", content: "محتوى المقالة", write: "اكتب مقالتك…",
    tags: "الوسوم (افصل بينها بفواصل)", cover: "صورة الغلاف", preview: "معاينة وصف البحث",
    submit: "إرسال للمراجعة", saved: "تم حفظ المقالة بنجاح.", failed: "تعذر إرسال مقالتك. حاول مرة أخرى.",
    categories: { Training: "التدريب", Nutrition: "التغذية", Mindset: "العقلية", Recovery: "التعافي", Lifestyle: "نمط الحياة" }
  },
  es: {
    locked: "Publicación en el blog bloqueada", unlock: "Completa un programa de 12 semanas y mantente activo durante al menos 30 días para desbloquearla.",
    programCompleted: "Programa completado", daysActive: "Días de actividad", heading: "Escribe una publicación",
    title: "Título de la publicación", category: "Categoría", content: "Contenido del artículo", write: "Escribe tu artículo…",
    tags: "Etiquetas (separadas por comas)", cover: "Imagen de portada", preview: "Vista previa de la descripción de búsqueda",
    submit: "Enviar para revisión", saved: "Publicación guardada correctamente.", failed: "No se pudo enviar tu publicación. Inténtalo de nuevo.",
    categories: { Training: "Entrenamiento", Nutrition: "Nutrición", Mindset: "Mentalidad", Recovery: "Recuperación", Lifestyle: "Estilo de vida" }
  },
  fr: {
    locked: "Publication sur le blog verrouillée", unlock: "Termine un programme de 12 semaines et reste actif pendant au moins 30 jours pour la débloquer.",
    programCompleted: "Programme terminé", daysActive: "Jours d’activité", heading: "Rédiger un article",
    title: "Titre de l’article", category: "Catégorie", content: "Contenu de l’article", write: "Rédige ton article…",
    tags: "Étiquettes (séparées par des virgules)", cover: "Image de couverture", preview: "Aperçu de la description de recherche",
    submit: "Envoyer pour validation", saved: "Article enregistré avec succès.", failed: "Impossible d’envoyer ton article. Réessaie.",
    categories: { Training: "Entraînement", Nutrition: "Nutrition", Mindset: "État d’esprit", Recovery: "Récupération", Lifestyle: "Mode de vie" }
  }
};
