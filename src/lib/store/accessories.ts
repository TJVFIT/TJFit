import type { Locale } from "@/lib/i18n";
import { EXTRA_ACCESSORY_COPY, EXTRA_ACCESSORY_IDS } from "@/lib/store/accessory-details";

export const SHOPIFY_STORE_URL = "https://shop.tjfit.org";
export const ACCESSORY_IDS = ["speed-rope", "training-gloves", "ankle-bands", ...EXTRA_ACCESSORY_IDS] as const;
export type AccessoryId = typeof ACCESSORY_IDS[number];
export type AccessorySelection = Partial<Record<AccessoryId, number>>;

type AccessoryCopy = {
  title: string; intro: string; status: string; add: string; selected: string;
  remove: string; empty: string; request: string; location: string; note: string;
  quantity: string; preview: string; store: string; gear: string; gyms: string;
  items: Record<AccessoryId, { name: string; description: string; detail: string }>;
};

export const ACCESSORY_COPY: Record<Locale, AccessoryCopy> = {
  en: {
    title: "Small kit. More ways to train.", intro: "Explore the opening accessory collection and build your own enquiry list.",
    status: "Collection preview", add: "Add to enquiry", selected: "Your selection", remove: "Remove",
    empty: "Choose an accessory to start your list.", request: "Prepare email enquiry", location: "Delivery city / country",
    note: "Availability, final specifications and delivered prices are confirmed in your quote. This prepares an email; it does not place an order.",
    quantity: "Quantity", preview: "Illustrative artwork. Final product shown with your quote.", store: "Shopify store preview",
    gear: "Accessories", gyms: "Build your gym",
    items: {
      ...EXTRA_ACCESSORY_COPY.en,
      "speed-rope": {name: "Adjustable speed rope", description: "A compact option for skipping sessions and warm-ups.", detail: "Sourcing brief: coated steel cable, adjustable length and metal handles."},
      "training-gloves": {name: "Training gloves", description: "Half-finger gloves with an adjustable wrist closure.", detail: "Choose a size after checking the supplier's palm measurements."},
      "ankle-bands": {name: "Ankle resistance set", description: "A portable addition to lower-body training.", detail: "Band resistance, fastening and the exact pieces in each set are confirmed before ordering."}
    }
  },
  tr: {
    title: "Küçük ekipman. Daha çok hareket.", intro: "İlk aksesuar koleksiyonunu inceleyin, kendi teklif listenizi oluşturun.",
    status: "Koleksiyon önizlemesi", add: "Teklif listesine ekle", selected: "Seçiminiz", remove: "Kaldır",
    empty: "Listenizi oluşturmak için bir aksesuar seçin.", request: "E-posta talebini hazırla", location: "Teslimat şehri / ülkesi",
    note: "Stok, kesin özellikler ve teslimat dahil fiyat teklifinizde netleşir. Bu işlem e-posta hazırlar; sipariş oluşturmaz.",
    quantity: "Adet", preview: "Temsili çizim. Kesin ürün teklifinizde gösterilir.", store: "Shopify mağaza önizlemesi",
    gear: "Aksesuarlar", gyms: "Spor alanını kur",
    items: {
      ...EXTRA_ACCESSORY_COPY.tr,
      "speed-rope": {name: "Ayarlanabilir atlama ipi", description: "İp atlama ve ısınma seansları için kompakt bir seçenek.", detail: "Tedarik kapsamı: kaplamalı çelik tel, ayarlanabilir uzunluk ve metal tutacak."},
      "training-gloves": {name: "Antrenman eldiveni", description: "Ayarlanabilir bilek kapamalı yarım parmak eldiven.", detail: "Beden seçimi, tedarikçinin avuç ölçü tablosuna göre yapılır."},
      "ankle-bands": {name: "Ayak bileği direnç seti", description: "Alt vücut antrenmanına taşınabilir bir ek.", detail: "Direnç, bağlantılar ve set içeriği siparişten önce netleştirilir."}
    }
  },
  ar: {
    title: "معدات صغيرة. خيارات تدريب أكثر.", intro: "تصفح مجموعة الإكسسوارات الأولى وأنشئ قائمة طلب عرض السعر.",
    status: "معاينة المجموعة", add: "أضف إلى الطلب", selected: "اختياراتك", remove: "إزالة",
    empty: "اختر إكسسواراً لبدء قائمتك.", request: "جهّز رسالة الاستفسار", location: "مدينة / بلد التسليم",
    note: "نؤكد التوفر والمواصفات النهائية والسعر شاملاً التسليم في عرض السعر. هذا يجهز رسالة بريد ولا ينشئ طلب شراء.",
    quantity: "الكمية", preview: "رسم توضيحي. يُعرض المنتج النهائي مع عرض السعر.", store: "معاينة متجر Shopify",
    gear: "الإكسسوارات", gyms: "جهّز صالتك",
    items: {
      ...EXTRA_ACCESSORY_COPY.ar,
      "speed-rope": {name: "حبل قفز قابل للتعديل", description: "خيار صغير لجلسات القفز والإحماء.", detail: "مواصفات التوريد: سلك فولاذي مغطى وطول قابل للتعديل ومقابض معدنية."},
      "training-gloves": {name: "قفازات تدريب", description: "قفازات نصف إصبع مع إغلاق قابل للتعديل حول المعصم.", detail: "يُختار المقاس بعد مراجعة جدول قياسات الكف من المورد."},
      "ankle-bands": {name: "مجموعة مقاومة للكاحل", description: "إضافة محمولة لتدريب الجزء السفلي من الجسم.", detail: "تُؤكد المقاومة والتثبيت ومحتويات المجموعة قبل الطلب."}
    }
  },
  fr: {
    title: "Petit équipement. Plus de mouvements.", intro: "Découvrez la première sélection et composez votre demande.",
    status: "Aperçu de la collection", add: "Ajouter à la demande", selected: "Votre sélection", remove: "Retirer",
    empty: "Choisissez un accessoire pour commencer.", request: "Préparer la demande par e-mail", location: "Ville / pays de livraison",
    note: "Disponibilité, caractéristiques et prix livré seront confirmés sur devis. Cette action prépare un e-mail, pas une commande.",
    quantity: "Quantité", preview: "Illustration indicative. Le produit final figurera sur le devis.", store: "Aperçu de la boutique Shopify",
    gear: "Accessoires", gyms: "Équipez votre salle",
    items: {
      ...EXTRA_ACCESSORY_COPY.fr,
      "speed-rope": {name: "Corde à sauter réglable", description: "Un format compact pour vos séances et échauffements.", detail: "Recherche fournisseur : câble en acier gainé, longueur réglable et poignées métalliques."},
      "training-gloves": {name: "Gants d'entraînement", description: "Gants courts avec fermeture réglable au poignet.", detail: "Choisissez la taille selon le tableau de mesures du fournisseur."},
      "ankle-bands": {name: "Kit de résistance pour chevilles", description: "Un complément portable pour le bas du corps.", detail: "Résistance, fixations et contenu exact à confirmer avant commande."}
    }
  },
  es: {
    title: "Equipo pequeño. Más movimiento.", intro: "Explora la primera colección y prepara tu selección.",
    status: "Vista previa de la colección", add: "Añadir a la consulta", selected: "Tu selección", remove: "Quitar",
    empty: "Elige un accesorio para empezar.", request: "Preparar consulta por correo", location: "Ciudad / país de entrega",
    note: "Confirmaremos disponibilidad, características y precio con entrega en el presupuesto. Esto prepara un correo; no crea un pedido.",
    quantity: "Cantidad", preview: "Ilustración orientativa. El producto final se muestra en el presupuesto.", store: "Vista previa de Shopify",
    gear: "Accesorios", gyms: "Equipa tu gimnasio",
    items: {
      ...EXTRA_ACCESSORY_COPY.es,
      "speed-rope": {name: "Cuerda de salto ajustable", description: "Una opción compacta para saltar y calentar.", detail: "Selección: cable de acero recubierto, longitud ajustable y mangos metálicos."},
      "training-gloves": {name: "Guantes de entrenamiento", description: "Guantes sin dedos con cierre ajustable en la muñeca.", detail: "Elige la talla según la tabla de medidas del proveedor."},
      "ankle-bands": {name: "Kit de resistencia para tobillos", description: "Un complemento portátil para entrenar el tren inferior.", detail: "Resistencia, cierres y contenido se confirman antes del pedido."}
    }
  }
};

export function normalizeAccessoryQuantity(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(20, Math.floor(value))) : 1;
}

export function buildAccessoryRequest(locale: Locale, selection: AccessorySelection, location: string) {
  const copy = ACCESSORY_COPY[locale];
  const lines = ACCESSORY_IDS.filter(id => !!selection[id]).map(id => `${copy.items[id].name} × ${normalizeAccessoryQuantity(selection[id]!)}`);
  const subject = `TJFit — ${copy.gear}`;
  const body = [copy.selected, ...lines, "", `${copy.location}: ${location.trim().slice(0, 160)}`, "", copy.note].join("\n");
  const encode = (text: string) => encodeURIComponent(text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD"));
  return { count: lines.length, body, mailto: `mailto:vexafit.co@gmail.com?subject=${encode(subject)}&body=${encode(body)}` };
}
