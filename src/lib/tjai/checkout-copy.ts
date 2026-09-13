import type { Locale } from '@/lib/i18n';

const copy = {
  en: {
    checking: 'Checking your intake, access and payment…', unavailable: 'TJAI purchases are not available yet.',
    pending: 'Payment confirmation is pending. Check its status or reopen this same checkout.',
    paidAwaitingAccess: 'Payment is confirmed. We are checking your TJAI access; you do not need to pay again.',
    testPaid: 'Test receipt recorded. This did not purchase or unlock TJAI access.', testLabel: 'Test checkout — no purchase or access grant',
    refunded: 'This payment was refunded. It no longer provides TJAI access.', review: 'This payment needs review before access can be granted. Contact support.',
    mismatch: 'This checkout does not match this TJAI intake. Review your intake or contact support.',
    failed: 'Checkout or payment confirmation is unavailable. Please try again.', checkStatus: 'Check payment status',
    resumeCheckout: 'Reopen this checkout', startNew: 'Start a new checkout', existingAccess: 'Your existing TJAI access is available.', expired: 'This checkout has expired. You can start a new one.'
  },
  tr: {
    checking: 'Yanıtların, erişimin ve ödemen kontrol ediliyor…', unavailable: 'TJAI satın alımları henüz kullanılamıyor.',
    pending: 'Ödeme onayı bekleniyor. Durumunu kontrol et veya aynı ödeme sayfasını yeniden aç.',
    paidAwaitingAccess: 'Ödeme onaylandı. TJAI erişimini kontrol ediyoruz; tekrar ödeme yapmana gerek yok.',
    testPaid: 'Test kaydı alındı. TJAI satın alınmadı ve erişim açılmadı.', testLabel: 'Test ödemesi — satın alma veya erişim sağlamaz',
    refunded: 'Bu ödeme iade edildi. Artık TJAI erişimi sağlamıyor.', review: 'Erişim verilmeden önce bu ödeme incelenmeli. Destekle iletişime geç.',
    mismatch: 'Bu ödeme, bu TJAI değerlendirmesiyle eşleşmiyor. Yanıtlarını incele veya destekle iletişime geç.',
    failed: 'Ödeme veya ödeme onayı kullanılamıyor. Lütfen tekrar dene.', checkStatus: 'Ödeme durumunu kontrol et',
    resumeCheckout: 'Bu ödemeyi yeniden aç', startNew: 'Yeni bir ödeme başlat', existingAccess: 'Mevcut TJAI erişimin kullanılabilir.', expired: 'Bu ödeme sayfasının süresi doldu. Yeni bir ödeme başlatabilirsin.'
  },
  ar: {
    checking: 'جارٍ التحقق من إجاباتك ووصولك والدفع…', unavailable: 'شراء TJAI غير متاح بعد.',
    pending: 'ننتظر تأكيد الدفع. تحقق من حالته أو أعد فتح صفحة الدفع نفسها.',
    paidAwaitingAccess: 'تم تأكيد الدفع. نتحقق من وصولك إلى TJAI؛ لا تحتاج إلى الدفع مجدداً.',
    testPaid: 'تم تسجيل إيصال تجريبي. لم يتم شراء أو فتح الوصول إلى TJAI.', testLabel: 'دفع تجريبي — لا يشتري أو يفتح الوصول',
    refunded: 'تم رد هذه الدفعة. لم تعد تمنح الوصول إلى TJAI.', review: 'تحتاج هذه الدفعة إلى مراجعة قبل منح الوصول. تواصل مع الدعم.',
    mismatch: 'صفحة الدفع هذه لا تطابق تقييم TJAI الحالي. راجع إجاباتك أو تواصل مع الدعم.',
    failed: 'الدفع أو تأكيده غير متاح. حاول مجدداً.', checkStatus: 'تحقق من حالة الدفع',
    resumeCheckout: 'أعد فتح صفحة الدفع نفسها', startNew: 'ابدأ عملية دفع جديدة', existingAccess: 'وصولك الحالي إلى TJAI متاح.', expired: 'انتهت صلاحية صفحة الدفع هذه. يمكنك بدء عملية جديدة.'
  },
  es: {
    checking: 'Comprobando tus respuestas, acceso y pago…', unavailable: 'Las compras de TJAI aún no están disponibles.',
    pending: 'La confirmación del pago está pendiente. Comprueba su estado o vuelve a abrir este mismo pago.',
    paidAwaitingAccess: 'Pago confirmado. Estamos comprobando tu acceso a TJAI; no necesitas pagar de nuevo.',
    testPaid: 'Recibo de prueba registrado. No se ha comprado ni desbloqueado el acceso a TJAI.', testLabel: 'Pago de prueba — sin compra ni acceso',
    refunded: 'Este pago fue reembolsado. Ya no proporciona acceso a TJAI.', review: 'Este pago requiere revisión antes de conceder acceso. Contacta con soporte.',
    mismatch: 'Este pago no corresponde a esta evaluación de TJAI. Revisa tus respuestas o contacta con soporte.',
    failed: 'El pago o su confirmación no están disponibles. Inténtalo de nuevo.', checkStatus: 'Comprobar el pago',
    resumeCheckout: 'Volver a abrir este pago', startNew: 'Iniciar un nuevo pago', existingAccess: 'Tu acceso existente a TJAI está disponible.', expired: 'Este pago ha caducado. Puedes iniciar uno nuevo.'
  },
  fr: {
    checking: 'Vérification de vos réponses, de votre accès et du paiement…', unavailable: 'Les achats TJAI ne sont pas encore disponibles.',
    pending: 'La confirmation du paiement est en attente. Vérifiez son état ou rouvrez ce même paiement.',
    paidAwaitingAccess: 'Paiement confirmé. Nous vérifions votre accès à TJAI ; vous n’avez pas besoin de payer à nouveau.',
    testPaid: 'Reçu de test enregistré. Aucun accès à TJAI n’a été acheté ou débloqué.', testLabel: 'Paiement de test — aucun achat ni accès',
    refunded: 'Ce paiement a été remboursé. Il ne donne plus accès à TJAI.', review: 'Ce paiement doit être examiné avant d’accorder l’accès. Contactez l’assistance.',
    mismatch: 'Ce paiement ne correspond pas à cette évaluation TJAI. Vérifiez vos réponses ou contactez l’assistance.',
    failed: 'Le paiement ou sa confirmation est indisponible. Réessayez.', checkStatus: 'Vérifier le paiement',
    resumeCheckout: 'Rouvrir ce paiement', startNew: 'Commencer un nouveau paiement', existingAccess: 'Votre accès TJAI existant est disponible.', expired: 'Ce paiement a expiré. Vous pouvez en commencer un nouveau.'
  }
};

export function getTjaiCheckoutCopy(locale: Locale) { return copy[locale]; }
