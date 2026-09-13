import type { Locale } from "@/lib/i18n";

export const EXTRA_ACCESSORY_IDS = ["yoga-block", "tpe-mat", "nbr-mat", "mini-loops", "ab-wheel"] as const;
export type ExtraAccessoryId = typeof EXTRA_ACCESSORY_IDS[number];
type Detail = { name: string; description: string; detail: string };

export const EXTRA_ACCESSORY_COPY: Record<Locale, Record<ExtraAccessoryId, Detail>> = {
  en: {
    "yoga-block": { name: "Yoga block", description: "Support for balance, stretching and yoga practice.", detail: "Material, dimensions and firmness await supplier confirmation." },
    "tpe-mat": { name: "TPE exercise mat", description: "A mat candidate for home workouts and floor exercises.", detail: "Confirm material, thickness, dimensions, grip and care instructions." },
    "nbr-mat": { name: "NBR exercise mat", description: "A cushioning option for floor-based training.", detail: "Confirm material and actual thickness; no environmental certification is claimed." },
    "mini-loops": { name: "Mini loop resistance bands", description: "Portable bands for controlled warm-up and resistance work.", detail: "The number of bands, material and resistance of each band need confirmation." },
    "ab-wheel": { name: "Foldable ab wheel", description: "A compact candidate for controlled rollout exercises.", detail: "Load rating, included accessories, dimensions and safe-use instructions must be confirmed." }
  },
  tr: {
    "yoga-block": { name: "Yoga bloğu", description: "Denge, esneme ve yoga çalışmaları için destek.", detail: "Malzeme, ölçüler ve sertlik tedarikçi teyidi bekliyor." },
    "tpe-mat": { name: "TPE egzersiz matı", description: "Ev antrenmanları ve yer hareketleri için mat adayı.", detail: "Malzeme, kalınlık, ölçüler, tutuş ve bakım talimatları teyit edilecek." },
    "nbr-mat": { name: "NBR egzersiz matı", description: "Yer antrenmanı için yastıklama seçeneği.", detail: "Malzeme ve gerçek kalınlık teyit edilecek; çevre sertifikası iddia edilmez." },
    "mini-loops": { name: "Mini loop direnç bandı", description: "Kontrollü ısınma ve direnç çalışmaları için taşınabilir bantlar.", detail: "Bant sayısı, malzeme ve her bandın direnci teyit edilecek." },
    "ab-wheel": { name: "Katlanabilir karın tekerleği", description: "Kontrollü ileri uzanma egzersizleri için kompakt ekipman adayı.", detail: "Taşıma sınırı, kutu içeriği, ölçüler ve güvenli kullanım talimatları teyit edilmeli." }
  },
  ar: {
    "yoga-block": { name: "قالب يوغا", description: "دعم للتوازن والتمدد وتمارين اليوغا.", detail: "المادة والأبعاد والصلابة بانتظار تأكيد المورد." },
    "tpe-mat": { name: "بساط تمارين TPE", description: "بساط مقترح للتدريب المنزلي والتمارين الأرضية.", detail: "يجب تأكيد المادة والسماكة والأبعاد والثبات وتعليمات العناية." },
    "nbr-mat": { name: "بساط تمارين NBR", description: "خيار مبطن للتمارين الأرضية.", detail: "المادة والسماكة الفعلية تحتاجان للتأكيد؛ لا ندّعي وجود شهادة بيئية." },
    "mini-loops": { name: "أشرطة مقاومة دائرية صغيرة", description: "أشرطة محمولة للإحماء وتمارين المقاومة المتحكم بها.", detail: "يجب تأكيد عدد الأشرطة والمادة ومقاومة كل شريط." },
    "ab-wheel": { name: "عجلة بطن قابلة للطي", description: "خيار مدمج لتمارين التدحرج المتحكم بها.", detail: "يجب تأكيد حد التحميل والملحقات والأبعاد وتعليمات الاستخدام الآمن." }
  },
  es: {
    "yoga-block": { name: "Bloque de yoga", description: "Apoyo para equilibrio, estiramientos y yoga.", detail: "Material, medidas y firmeza pendientes de confirmación." },
    "tpe-mat": { name: "Esterilla de ejercicio TPE", description: "Una opción para entrenar en casa y realizar ejercicios de suelo.", detail: "Confirmar material, grosor, medidas, agarre y cuidados." },
    "nbr-mat": { name: "Esterilla de ejercicio NBR", description: "Una opción acolchada para entrenamientos en el suelo.", detail: "Material y grosor real por confirmar; no se afirma certificación ambiental." },
    "mini-loops": { name: "Mini bandas de resistencia", description: "Bandas portátiles para calentamiento y resistencia controlados.", detail: "Cantidad, material y resistencia de cada banda por confirmar." },
    "ab-wheel": { name: "Rueda abdominal plegable", description: "Una opción compacta para extensiones controladas.", detail: "Confirmar carga máxima, accesorios, medidas e instrucciones de uso seguro." }
  },
  fr: {
    "yoga-block": { name: "Brique de yoga", description: "Un appui pour l’équilibre, les étirements et le yoga.", detail: "Matière, dimensions et fermeté à confirmer par le fournisseur." },
    "tpe-mat": { name: "Tapis d’exercice TPE", description: "Un tapis envisagé pour l’entraînement à domicile et au sol.", detail: "Matière, épaisseur, dimensions, adhérence et entretien à confirmer." },
    "nbr-mat": { name: "Tapis d’exercice NBR", description: "Une option rembourrée pour les exercices au sol.", detail: "Matière et épaisseur réelle à confirmer ; aucune certification environnementale annoncée." },
    "mini-loops": { name: "Mini bandes de résistance", description: "Des bandes portables pour un échauffement et des mouvements contrôlés.", detail: "Nombre de bandes, matière et résistance de chacune à confirmer." },
    "ab-wheel": { name: "Roue abdominale pliable", description: "Un équipement compact envisagé pour des extensions contrôlées.", detail: "Charge maximale, accessoires, dimensions et consignes de sécurité à confirmer." }
  }
};

export const SUPPLIER_PENDING: Record<Locale, string> = {
  en: "Awaiting supplier confirmation", tr: "Tedarikçi teyidi bekleniyor", ar: "بانتظار تأكيد المورد", es: "Pendiente de confirmación del proveedor", fr: "Confirmation du fournisseur attendue"
};

export const TURKEY_DELIVERY: Record<Locale, string> = {
  en: "Delivery city in Türkiye", tr: "Türkiye’de teslimat şehri", ar: "مدينة التسليم في تركيا", es: "Ciudad de entrega en Turquía", fr: "Ville de livraison en Turquie"
};
