import type { Locale } from "@/lib/i18n";

type PressCopy = {
  title: string; intro: string; assets: string; download: string; logoTerms: string;
  assetNames: [string, string, string, string];
  colors: string; colorNames: [string, string, string, string];
  about: string; aboutText: string; contact: string; contactText: string;
  coverage: string; noCoverage: string; back: string;
};

export const PRESS_COPY: Record<Locale, PressCopy> = {
  en: {
    title: "Press & Media", intro: "Brand resources and a contact for media and partnership inquiries.",
    assets: "TJFit Brand Assets", download: "Download", logoTerms: "Do not alter the logo or use it in misleading ways.",
    assetNames: ["TJFit logo (PNG)", "TJFit logo source image", "TJFit mark (PNG)", "Social sharing image"],
    colors: "Brand Colors", colorNames: ["Primary", "Secondary", "Background", "Text"],
    about: "About TJFit", aboutText: "TJFit brings together training and nutrition bundles, TJAI general fitness planning, and an equipment catalog. TJAI is intended for adults aged 18 or older. Product details and availability are shown on the relevant pages.",
    contact: "Media & Partnership Contact", contactText: "Send media and partnership inquiries to TJFit support:",
    coverage: "Press Coverage", noCoverage: "No press coverage is listed here.", back: "Back to TJFit"
  },
  tr: {
    title: "Basın ve Medya", intro: "Marka kaynakları ile medya ve iş birliği talepleri için iletişim.",
    assets: "TJFit Marka Dosyaları", download: "İndir", logoTerms: "Logoyu değiştirmeyin veya yanıltıcı şekilde kullanmayın.",
    assetNames: ["TJFit logosu (PNG)", "TJFit logo kaynak görseli", "TJFit simgesi (PNG)", "Sosyal paylaşım görseli"],
    colors: "Marka Renkleri", colorNames: ["Birincil", "İkincil", "Arka plan", "Metin"],
    about: "TJFit Hakkında", aboutText: "TJFit; antrenman ve beslenme paketlerini, TJAI genel fitness planlamasını ve ekipman kataloğunu bir araya getirir. TJAI, 18 yaş ve üzeri yetişkinlere yöneliktir. Ürün ayrıntıları ve kullanılabilirlik ilgili sayfalarda gösterilir.",
    contact: "Medya ve İş Birliği İletişimi", contactText: "Medya ve iş birliği taleplerini TJFit desteğine gönderin:",
    coverage: "Basında TJFit", noCoverage: "Burada henüz basın haberi listelenmiyor.", back: "TJFit’e dön"
  },
  ar: {
    title: "الصحافة والإعلام", intro: "موارد العلامة التجارية ووسيلة تواصل للاستفسارات الإعلامية والشراكات.",
    assets: "ملفات علامة TJFit", download: "تنزيل", logoTerms: "لا تعدّل الشعار أو تستخدمه بطرق مضللة.",
    assetNames: ["شعار TJFit (PNG)", "الصورة المصدر لشعار TJFit", "رمز TJFit (PNG)", "صورة المشاركة الاجتماعية"],
    colors: "ألوان العلامة التجارية", colorNames: ["أساسي", "ثانوي", "الخلفية", "النص"],
    about: "عن TJFit", aboutText: "يجمع TJFit بين باقات التدريب والتغذية وتخطيط اللياقة العامة عبر TJAI وكتالوج المعدات. يتوجه TJAI إلى البالغين بعمر 18 عاماً فأكثر. تظهر تفاصيل المنتجات وتوافرها في الصفحات ذات الصلة.",
    contact: "التواصل للإعلام والشراكات", contactText: "أرسل الاستفسارات الإعلامية وطلبات الشراكة إلى دعم TJFit:",
    coverage: "التغطية الصحفية", noCoverage: "لا توجد تغطية صحفية مدرجة هنا.", back: "العودة إلى TJFit"
  },
  es: {
    title: "Prensa y medios", intro: "Recursos de marca y un contacto para consultas de prensa y colaboraciones.",
    assets: "Recursos de marca de TJFit", download: "Descargar", logoTerms: "No alteres el logotipo ni lo utilices de forma engañosa.",
    assetNames: ["Logotipo TJFit (PNG)", "Imagen fuente del logotipo TJFit", "Símbolo TJFit (PNG)", "Imagen para compartir en redes"],
    colors: "Colores de marca", colorNames: ["Primario", "Secundario", "Fondo", "Texto"],
    about: "Acerca de TJFit", aboutText: "TJFit reúne paquetes de entrenamiento y nutrición, planificación de fitness general con TJAI y un catálogo de equipamiento. TJAI está dirigido a adultos de 18 años o más. Los detalles y la disponibilidad de los productos se muestran en sus páginas.",
    contact: "Contacto para prensa y colaboraciones", contactText: "Envía las consultas de prensa y colaboraciones al soporte de TJFit:",
    coverage: "Cobertura de prensa", noCoverage: "Aquí no se muestra ninguna cobertura de prensa.", back: "Volver a TJFit"
  },
  fr: {
    title: "Presse et médias", intro: "Ressources de marque et contact pour les demandes des médias et de partenariat.",
    assets: "Ressources de marque TJFit", download: "Télécharger", logoTerms: "Ne modifiez pas le logo et ne l’utilisez pas de manière trompeuse.",
    assetNames: ["Logo TJFit (PNG)", "Image source du logo TJFit", "Symbole TJFit (PNG)", "Image de partage social"],
    colors: "Couleurs de marque", colorNames: ["Primaire", "Secondaire", "Arrière-plan", "Texte"],
    about: "À propos de TJFit", aboutText: "TJFit réunit des programmes d’entraînement et de nutrition, la planification de fitness général avec TJAI et un catalogue d’équipement. TJAI s’adresse aux adultes de 18 ans ou plus. Les détails et la disponibilité des produits figurent sur leurs pages respectives.",
    contact: "Contact presse et partenariats", contactText: "Envoyez vos demandes de presse et de partenariat à l’assistance TJFit :",
    coverage: "Couverture médiatique", noCoverage: "Aucune couverture médiatique n’est répertoriée ici.", back: "Retour à TJFit"
  }
};
