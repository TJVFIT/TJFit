import type { Locale } from "@/lib/i18n";

// Used for new acceptances only; historical acceptance records keep their version.
export const TERMS_VERSION = "2026-09-12";
export const PRIVACY_VERSION = "2026-09-12";
// Describes the intended new digital provider, not account approval or availability.
export const BILLING_PROVIDER = "Lemon Squeezy";

const BILLING_ACCEPTANCE: Record<Locale, string> = {
  en: "the billing terms for digital purchases through Lemon Squeezy (pending activation) and physical orders through Shopify. Final order terms are shown before payment.",
  tr: "Lemon Squeezy üzerinden dijital satın alımların (etkinleştirme bekliyor) ve Shopify üzerinden fiziksel siparişlerin faturalama koşulları. Nihai sipariş koşulları ödeme öncesinde gösterilir.",
  ar: "شروط فوترة المشتريات الرقمية عبر Lemon Squeezy (بانتظار التفعيل) والطلبات المادية عبر Shopify. تظهر شروط الطلب النهائية قبل الدفع.",
  es: "las condiciones de facturación de compras digitales mediante Lemon Squeezy (pendiente de activación) y pedidos físicos mediante Shopify. Las condiciones finales del pedido se muestran antes del pago.",
  fr: "les conditions de facturation des achats numériques via Lemon Squeezy (en attente d’activation) et des commandes physiques via Shopify. Les conditions finales de commande sont affichées avant le paiement."
};

export function getBillingAcceptanceCopy(locale: Locale): string {
  return BILLING_ACCEPTANCE[locale];
}
