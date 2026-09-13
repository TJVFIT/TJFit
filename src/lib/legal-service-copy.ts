import type { Locale } from "@/lib/i18n";

type LegalServiceCopy = {
  updated: string;
  paymentsHeading: string;
  checkout: string;
  historical: string;
  refunds: string;
  paymentData: string;
  sharing: string;
  ai: string;
  cookies: string;
  adult: string;
  categoriesHeading: string;
  servicesHeading: string;
};

/** Public status, not an assertion that a provider account has been approved. */
export const LEGAL_SERVICES: Record<Locale, LegalServiceCopy> = {
  en: {
    updated: "Last updated: 12 September 2026",
    paymentsHeading: "4. Payments and billing",
    checkout: "New digital checkout through Lemon Squeezy is being tested and is awaiting approval. Real purchases are unavailable until checkout is enabled. Available payment methods and final terms will be shown at checkout. Physical products use separate Shopify checkout when enabled. Review the item’s seller, delivery, return and warranty terms before payment.",
    historical: "For an earlier Gumroad purchase, use the support or refund link in your original receipt. The terms and refund commitments supplied with that purchase still apply; this update does not remove existing customer rights.",
    refunds: "For a refund request, keep your receipt and order reference and contact the provider identified on that receipt, or TJFit support at tjfit.org@gmail.com. Refund eligibility follows the terms supplied with your purchase and your applicable legal rights. A request is not confirmation that a refund has been issued.",
    paymentData: "Payment details are handled by the hosted checkout provider identified on your receipt. TJFit stores order references and payment status, not full card numbers or CVV. Earlier Gumroad records remain relevant to those purchases; new Lemon Squeezy checkout is pending testing and approval.",
    sharing: "We do not sell your personal data. Service providers include Supabase for account and stored data, Resend for service email, and Groq for AI responses when enabled. The checkout provider receives the information needed for payment; earlier purchases may have records with Gumroad. New Lemon Squeezy checkout is pending testing and approval.",
    ai: "TJAI is for general fitness, not medical advice. When AI is enabled, selected assessment answers and chat messages are sent to Groq to produce responses. Do not include medical records, diagnoses, or identifying information in chat. Removing a name does not make fitness information anonymous.",
    cookies: "Essential cookies and browser storage support sign-in and preferences. The cookie controls let you choose analytics and marketing preferences. See the Cookie Policy for browser storage and controls.",
    adult: "TJAI is available only to adults aged 18 or older for general fitness.",
    categoriesHeading: "Storage categories",
    servicesHeading: "Connected services"
  },
  tr: {
    updated: "Son güncelleme: 12 Eylül 2026",
    paymentsHeading: "4. Ödeme ve faturalama",
    checkout: "Lemon Squeezy üzerinden yeni dijital ödeme sistemi test ediliyor ve onay bekliyor. Ödeme sistemi açılana kadar gerçek satın alım yapılamaz. Kullanılabilir ödeme yöntemleri ve nihai şartlar ödeme ekranında gösterilecektir. Fiziksel ürünler, etkinleştirildiğinde ayrı Shopify ödeme sistemini kullanır. Ödeme öncesinde ürünün satıcı, teslimat, iade ve garanti koşullarını inceleyin.",
    historical: "Önceki bir Gumroad satın alımı için orijinal makbuzunuzdaki destek veya iade bağlantısını kullanın. Satın alım sırasında sunulan şartlar ve iade taahhütleri geçerliliğini korur; bu güncelleme mevcut müşteri haklarını kaldırmaz.",
    refunds: "İade talebi için makbuzunuzu ve sipariş referansınızı saklayın; makbuzda belirtilen sağlayıcıya veya tjfit.org@gmail.com adresinden TJFit desteğine başvurun. İade uygunluğu, satın alımınızla sunulan şartlara ve geçerli yasal haklarınıza bağlıdır. Talep oluşturmak, iadenin yapıldığı anlamına gelmez.",
    paymentData: "Ödeme ayrıntıları makbuzunuzda belirtilen harici ödeme sağlayıcısı tarafından işlenir. TJFit tam kart numarası veya CVV yerine sipariş referanslarını ve ödeme durumunu saklar. Önceki Gumroad kayıtları ilgili satın alımlar için geçerlidir; yeni Lemon Squeezy ödeme sistemi test ve onay bekliyor.",
    sharing: "Kişisel verilerinizi satmayız. Hizmet sağlayıcıları hesap ve kayıtlı veriler için Supabase, hizmet e-postaları için Resend ve etkin olduğunda yapay zekâ yanıtları için Groq'u içerir. Ödeme sağlayıcısı ödeme için gerekli bilgileri alır; önceki satın alımların kayıtları Gumroad'da bulunabilir. Yeni Lemon Squeezy ödeme sistemi test ve onay bekliyor.",
    ai: "TJAI genel fitness içindir, tıbbi tavsiye sunmaz. Yapay zekâ etkin olduğunda seçili değerlendirme yanıtları ve sohbet mesajları yanıt üretmek için Groq'a gönderilir. Sohbete tıbbi kayıt, teşhis veya kimlik belirleyici bilgi eklemeyin. Bir adı kaldırmak fitness bilgilerini anonim hâle getirmez.",
    cookies: "Zorunlu çerezler ve tarayıcı depolaması oturum açmayı ve tercihleri destekler. Çerez kontrollerinden analiz ve pazarlama tercihlerinizi seçebilirsiniz. Depolama ve kontroller için Çerez Politikasına bakın.",
    adult: "TJAI yalnızca 18 yaş ve üzeri yetişkinler için genel fitness amacıyla sunulur.",
    categoriesHeading: "Depolama kategorileri",
    servicesHeading: "Bağlı hizmetler"
  },
  ar: {
    updated: "آخر تحديث: 12 سبتمبر 2026",
    paymentsHeading: "4. الدفع والفوترة",
    checkout: "نظام الدفع الرقمي الجديد عبر Lemon Squeezy قيد الاختبار وينتظر الموافقة. الشراء الفعلي غير متاح حتى تفعيل الدفع. ستظهر وسائل الدفع المتاحة والشروط النهائية عند الدفع. تستخدم المنتجات المادية نظام دفع منفصلاً عبر Shopify عند تفعيله. راجع شروط البائع والتسليم والإرجاع والضمان الخاصة بالمنتج قبل الدفع.",
    historical: "لعملية شراء سابقة عبر Gumroad، استخدم رابط الدعم أو الاسترداد في إيصالك الأصلي. تظل الشروط والتزامات الاسترداد المقدمة مع تلك العملية سارية؛ لا يلغي هذا التحديث حقوق العملاء الحاليين.",
    refunds: "لطلب استرداد، احتفظ بالإيصال ومرجع الطلب وتواصل مع الجهة المذكورة في الإيصال أو دعم TJFit عبر tjfit.org@gmail.com. تعتمد أهلية الاسترداد على الشروط المقدمة مع عملية الشراء وحقوقك القانونية السارية. تقديم الطلب لا يعني أن الاسترداد قد نُفّذ.",
    paymentData: "تعالج جهة الدفع الخارجية المذكورة في إيصالك تفاصيل الدفع. يحتفظ TJFit بمراجع الطلبات وحالة الدفع، ولا يحتفظ بأرقام البطاقات الكاملة أو CVV. تظل سجلات Gumroad السابقة مرتبطة بتلك المشتريات؛ نظام Lemon Squeezy الجديد ينتظر الاختبار والموافقة.",
    sharing: "لا نبيع بياناتك الشخصية. تشمل جهات الخدمة Supabase للحسابات والبيانات المخزنة، وResend لبريد الخدمة، وGroq لردود الذكاء الاصطناعي عند تفعيله. تتلقى جهة الدفع المعلومات اللازمة للدفع؛ وقد تكون للمشتريات السابقة سجلات لدى Gumroad. نظام Lemon Squeezy الجديد ينتظر الاختبار والموافقة.",
    ai: "TJAI للياقة العامة وليس للاستشارة الطبية. عند تفعيل الذكاء الاصطناعي، تُرسل إجابات مختارة من التقييم ورسائل المحادثة إلى Groq لإنتاج الردود. لا تضف سجلات طبية أو تشخيصات أو معلومات تحدد الهوية إلى المحادثة. حذف الاسم لا يجعل معلومات اللياقة مجهولة الهوية.",
    cookies: "تدعم ملفات الارتباط الأساسية وتخزين المتصفح تسجيل الدخول والتفضيلات. تتيح عناصر التحكم اختيار تفضيلات التحليلات والتسويق. راجع سياسة ملفات الارتباط لمعرفة التخزين وعناصر التحكم.",
    adult: "يتاح TJAI للبالغين بعمر 18 عاماً فأكثر لأغراض اللياقة العامة فقط.",
    categoriesHeading: "فئات التخزين",
    servicesHeading: "الخدمات المرتبطة"
  },
  es: {
    updated: "Última actualización: 12 de septiembre de 2026",
    paymentsHeading: "4. Pagos y facturación",
    checkout: "El nuevo pago digital con Lemon Squeezy está en pruebas y pendiente de aprobación. Las compras reales no están disponibles hasta que se active el pago. Los métodos disponibles y las condiciones finales se mostrarán al pagar. Los productos físicos usan un pago separado mediante Shopify cuando está habilitado. Revisa las condiciones del vendedor, entrega, devolución y garantía del artículo antes del pago.",
    historical: "Para una compra anterior en Gumroad, usa el enlace de soporte o reembolso de tu recibo original. Siguen vigentes las condiciones y compromisos de reembolso entregados con esa compra; esta actualización no elimina los derechos de clientes existentes.",
    refunds: "Para solicitar un reembolso, conserva tu recibo y referencia de pedido y contacta al proveedor identificado en el recibo o al soporte de TJFit en tjfit.org@gmail.com. La elegibilidad depende de las condiciones entregadas con la compra y de tus derechos legales aplicables. Una solicitud no confirma que el reembolso se haya emitido.",
    paymentData: "El proveedor de pago externo identificado en tu recibo gestiona los datos de pago. TJFit guarda referencias de pedido y estados de pago, no números completos de tarjeta ni CVV. Los registros anteriores de Gumroad siguen vinculados a esas compras; el nuevo pago con Lemon Squeezy está pendiente de pruebas y aprobación.",
    sharing: "No vendemos tus datos personales. Los proveedores incluyen Supabase para cuentas y datos guardados, Resend para correo de servicio y Groq para respuestas de IA cuando esté habilitada. El proveedor de pago recibe los datos necesarios para pagar; las compras anteriores pueden tener registros en Gumroad. El nuevo pago con Lemon Squeezy está pendiente de pruebas y aprobación.",
    ai: "TJAI es para fitness general, no para consejo médico. Cuando la IA está habilitada, las respuestas seleccionadas de la evaluación y los mensajes del chat se envían a Groq para producir respuestas. No incluyas historiales médicos, diagnósticos ni datos identificativos en el chat. Eliminar un nombre no hace anónima la información de fitness.",
    cookies: "Las cookies esenciales y el almacenamiento del navegador permiten iniciar sesión y guardar preferencias. Los controles de cookies permiten elegir preferencias de analítica y marketing. Consulta la Política de Cookies para ver el almacenamiento y los controles.",
    adult: "TJAI está disponible solo para adultos de 18 años o más y para fitness general.",
    categoriesHeading: "Categorías de almacenamiento",
    servicesHeading: "Servicios conectados"
  },
  fr: {
    updated: "Dernière mise à jour : 12 septembre 2026",
    paymentsHeading: "4. Paiements et facturation",
    checkout: "Le nouveau paiement numérique via Lemon Squeezy est en cours de test et attend une approbation. Les achats réels sont indisponibles jusqu’à son activation. Les moyens disponibles et les conditions finales seront affichés au paiement. Les produits physiques utilisent un paiement Shopify distinct lorsqu’il est activé. Consultez les conditions du vendeur, de livraison, de retour et de garantie du produit avant de payer.",
    historical: "Pour un ancien achat Gumroad, utilisez le lien d’assistance ou de remboursement de votre reçu original. Les conditions et engagements de remboursement fournis lors de cet achat restent applicables ; cette mise à jour ne supprime aucun droit des clients existants.",
    refunds: "Pour demander un remboursement, conservez votre reçu et votre référence de commande et contactez le prestataire indiqué sur le reçu ou l’assistance TJFit à tjfit.org@gmail.com. L’éligibilité dépend des conditions fournies lors de l’achat et de vos droits légaux applicables. Une demande ne confirme pas qu’un remboursement a été effectué.",
    paymentData: "Le prestataire de paiement externe indiqué sur votre reçu traite les informations de paiement. TJFit conserve les références et statuts de commande, pas les numéros complets de carte ni les CVV. Les anciens dossiers Gumroad restent liés à ces achats ; le nouveau paiement Lemon Squeezy attend les tests et l’approbation.",
    sharing: "Nous ne vendons pas vos données personnelles. Les prestataires comprennent Supabase pour les comptes et données enregistrées, Resend pour les emails de service et Groq pour les réponses IA lorsque cette fonction est activée. Le prestataire de paiement reçoit les informations nécessaires au paiement ; les anciens achats peuvent avoir des dossiers chez Gumroad. Le nouveau paiement Lemon Squeezy attend les tests et l’approbation.",
    ai: "TJAI concerne la forme physique générale, sans conseil médical. Lorsque l’IA est activée, certaines réponses à l’évaluation et les messages du chat sont envoyés à Groq pour produire des réponses. N’incluez pas de dossiers médicaux, de diagnostics ni d’informations identifiantes dans le chat. Retirer un nom ne rend pas les informations de fitness anonymes.",
    cookies: "Les cookies essentiels et le stockage du navigateur permettent la connexion et les préférences. Les contrôles des cookies permettent de choisir les préférences d’analyse et de marketing. Consultez la Politique Cookies pour le stockage et les contrôles.",
    adult: "TJAI est réservé aux adultes de 18 ans ou plus pour la forme physique générale.",
    categoriesHeading: "Catégories de stockage",
    servicesHeading: "Services connectés"
  }
};
