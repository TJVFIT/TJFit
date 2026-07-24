import type { Locale } from "@/lib/i18n";

const lastUpdated = "Last updated: 24 July 2026";

export function getPrivacyCopy(locale: Locale) {
  void locale;
  return {
    badge: "Legal / privacy",
    title: "Privacy policy",
    paragraphs: [
      "TJFit collects the account, training and purchase information needed to deliver the platform. We do not sell personal data.",
      "Authentication and application data are processed through Supabase. Payment card details are entered in PayTR’s secure checkout and are not stored by TJFit.",
      "Fitness answers can include sensitive health context. TJFit uses them only to personalize the service and limits access to authorized systems and people.",
      "You may request access, correction or deletion of your personal data through TJFit support, subject to legal retention requirements for payments and fraud prevention.",
      "AI features must not be used for diagnosis or emergency advice. Conversations may be retained only for the period disclosed in the product before submission."
    ],
    lastUpdatedLabel: lastUpdated
  };
}

export function getRefundCopy(locale: Locale) {
  void locale;
  return {
    badge: "Legal / refunds",
    title: "Refund policy",
    paragraphs: [
      "Refund eligibility depends on the product, delivery status and applicable consumer law. Contact support with your order reference so we can review the purchase.",
      "Digital programs that have already been accessed or downloaded may have limited cancellation rights where the customer gave the legally required consent.",
      "Approved refunds are returned through the original payment method. Bank processing time is outside TJFit’s control.",
      "TJFit coins and program access connected to a refunded purchase may be reversed when the refund is completed."
    ],
    lastUpdatedLabel: lastUpdated
  };
}

export function getTermsCopy(locale: Locale, billingProvider: string, version: string) {
  void locale;
  return {
    badge: "Legal / terms",
    title: "Terms and conditions",
    sections: [
      {
        title: "Using TJFit",
        body: [
          "You must provide accurate account information and keep your login secure. You are responsible for activity performed through your account.",
          "TJFit training and nutrition content is educational and is not a substitute for medical diagnosis, treatment or emergency care."
        ]
      },
      {
        title: "Programs and coaching",
        body: [
          "Program outcomes vary by person. Stop training and seek qualified care when symptoms, pain or health risks require it.",
          "Coach access, response windows and deliverables depend on the purchased service."
        ]
      },
      {
        title: "Payments",
        body: [
          `${billingProvider} processes card payments. TJFit does not store complete card data.`,
          "Prices and currency are confirmed in checkout before payment. Access is granted only after server-side payment confirmation."
        ]
      },
      {
        title: "Acceptable use",
        body: [
          "Do not abuse the platform, bypass access controls, upload unlawful material or interfere with other members.",
          "TJFit may restrict access when necessary to protect users, coaches, payments or the service."
        ]
      }
    ],
    versionLabel: `Terms version ${version} · ${lastUpdated}`
  };
}
