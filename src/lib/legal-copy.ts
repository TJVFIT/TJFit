import type { Locale } from "@/lib/i18n";

type LegalSection = {
  title: string;
  body: string[];
};

type TermsCopy = {
  badge: string;
  title: string;
  sections: LegalSection[];
  versionLabel: string;
};

type PolicyCopy = {
  badge: string;
  title: string;
  paragraphs: string[];
  lastUpdatedLabel: string;
};

export function getTermsCopy(locale: Locale, billingProvider: string, version: string): TermsCopy {
  const copy: Record<Locale, TermsCopy> = {
    en: {
      badge: "Terms of Service",
      title: "Terms and Conditions",
      sections: [
        {
          title: "1. Acceptance of Terms",
          body: [
            "By creating an account or using TJFit, you agree to these Terms, our Privacy Policy, and our Refund Policy.",
            "If you do not agree, you must not use the platform."
          ]
        },
        {
          title: "2. Eligibility and Account Security",
          body: [
            "You must provide accurate information, keep your login credentials secure, and be responsible for activity under your account.",
            "TJFit may suspend accounts used for fraud, abuse, or unlawful activity."
          ]
        },
        {
          title: "3. Health and Medical Disclaimer",
          body: [
            "TJFit provides education and coaching, not medical diagnosis or treatment.",
            "Consult a licensed medical professional before starting any program."
          ]
        },
        {
          title: `4. Payments and Billing (${billingProvider})`,
          body: [
            `Payments for paid products may be processed by ${billingProvider}. By purchasing, you authorize charges through your selected payment method.`,
            "Pricing, refunds, and cancellations follow the terms shown at checkout and the TJFit refund policy."
          ]
        },
        {
          title: "5. Acceptable Use",
          body: [
            "You may not reverse engineer, scrape, harass, upload unlawful content, or interfere with platform security.",
            "Violations may lead to suspension or termination."
          ]
        },
        {
          title: "6. Limitation of Liability",
          body: [
            "To the maximum extent permitted by law, TJFit is not liable for indirect, incidental, special, or consequential damages.",
            "Use the platform at your own risk."
          ]
        },
        {
          title: "7. Updates to Terms",
          body: [
            "We may update these Terms from time to time.",
            "Continued use after updates means you accept the revised version."
          ]
        }
      ],
      versionLabel: `Terms version: ${version}`
    },
    tr: {
      badge: "Hizmet Sartlari",
      title: "Sartlar ve Kosullar",
      sections: [
        { title: "1. Sartlarin Kabul Edilmesi", body: ["TJFit'i kullanarak bu Sartlari, Gizlilik Politikasini ve Iade Politikasini kabul etmis olursun.", "Kabul etmiyorsan platformu kullanmamalisin."] },
        { title: "2. Uygunluk ve Hesap Guvenligi", body: ["Dogru bilgi vermeli, giris bilgilerini korumali ve hesabindaki islemlerden sorumlu olmalisin.", "Dolandiricilik, kotuye kullanim veya yasa disi faaliyetlerde kullanilan hesaplar askiya alinabilir."] },
        { title: "3. Saglik ve Tibbi Uyari", body: ["TJFit egitim ve koçluk sunar; tibbi tani veya tedavi sunmaz.", "Herhangi bir programa baslamadan once lisansli bir saglik uzmanina danis."] },
        { title: `4. Odeme ve Faturalama (${billingProvider})`, body: [`Ucretli urunlerin odemeleri ${billingProvider} tarafindan islenebilir. Satin alarak secilen odeme yontemi uzerinden tahsilati kabul edersin.`, "Fiyatlandirma, iptal ve iadeler odeme ekranindaki sartlara ve TJFit iade politikasina tabidir."] },
        { title: "5. Kabul Edilebilir Kullanim", body: ["Platformu tersine muhendislik icin kullanamaz, veri kaziyamaz, taciz edemez veya guvenlige mudahale edemezsin.", "Ihlaller hesap kisitlamasi veya kapatma ile sonuclanabilir."] },
        { title: "6. Sorumlulugun Sinirlandirilmasi", body: ["Kanunun izin verdigi en genis kapsamda TJFit dolayli veya ozel zararlardan sorumlu tutulamaz.", "Platformu kendi sorumlulugunda kullanirsin."] },
        { title: "7. Sartlarin Guncellenmesi", body: ["Bu Sartlari zaman zaman guncelleyebiliriz.", "Guncellemeden sonra kullanmaya devam etmen yeni surumu kabul ettigin anlamina gelir."] }
      ],
      versionLabel: `Sartlar surumu: ${version}`
    },
    ar: {
      badge: "شروط الخدمة",
      title: "الشروط والاحكام",
      sections: [
        { title: "1. قبول الشروط", body: ["عند انشاء حساب او استخدام TJFit فانك توافق على هذه الشروط وسياسة الخصوصية وسياسة الاسترداد.", "اذا لم توافق فلا يجوز لك استخدام المنصة."] },
        { title: "2. الاهلية وامان الحساب", body: ["يجب تقديم معلومات صحيحة والحفاظ على بيانات الدخول وتحمل مسؤولية النشاط داخل حسابك.", "يجوز لـ TJFit ايقاف الحسابات المستخدمة في الاحتيال او الاساءة او النشاط غير القانوني."] },
        { title: "3. اخلاء المسؤولية الصحية والطبية", body: ["TJFit يقدم تعليما وتوجيها وليس تشخيصا او علاجا طبيا.", "استشر مختصا مرخصا قبل بدء اي برنامج."] },
        { title: `4. الدفع والفوترة (${billingProvider})`, body: [`قد تتم معالجة المدفوعات للمنتجات المدفوعة بواسطة ${billingProvider}. عند الشراء فانك تفوض تحصيل الرسوم من وسيلة الدفع المختارة.`, "تخضع الاسعار والاسترداد والالغاء للشروط المعروضة عند الدفع ولسياسة استرداد TJFit."] },
        { title: "5. الاستخدام المقبول", body: ["لا يجوز الهندسة العكسية او جمع البيانات او المضايقة او رفع محتوى غير قانوني او العبث بامن المنصة.", "قد تؤدي المخالفات الى الايقاف او الاغلاق الدائم."] },
        { title: "6. تحديد المسؤولية", body: ["الى الحد الاقصى الذي يسمح به القانون لا تتحمل TJFit المسؤولية عن الاضرار غير المباشرة او الخاصة او التبعية.", "استخدامك للمنصة على مسؤوليتك الخاصة."] },
        { title: "7. تحديث الشروط", body: ["قد نقوم بتحديث هذه الشروط من وقت لآخر.", "الاستمرار في الاستخدام بعد التحديث يعني قبول النسخة المعدلة."] }
      ],
      versionLabel: `اصدار الشروط: ${version}`
    },
    es: {
      badge: "Terminos del Servicio",
      title: "Terminos y Condiciones",
      sections: [
        { title: "1. Aceptacion de los Terminos", body: ["Al crear una cuenta o usar TJFit, aceptas estos Terminos, nuestra Politica de Privacidad y la Politica de Reembolso.", "Si no estas de acuerdo, no debes usar la plataforma."] },
        { title: "2. Elegibilidad y Seguridad de la Cuenta", body: ["Debes dar informacion correcta, proteger tus credenciales y responsabilizarte de la actividad de tu cuenta.", "TJFit puede suspender cuentas usadas para fraude, abuso o actividad ilegal."] },
        { title: "3. Aviso de Salud y Medicina", body: ["TJFit ofrece educacion y coaching, no diagnostico ni tratamiento medico.", "Consulta a un profesional sanitario antes de iniciar cualquier programa."] },
        { title: `4. Pagos y Facturacion (${billingProvider})`, body: [`Los pagos de productos de pago pueden ser procesados por ${billingProvider}. Al comprar, autorizas los cargos mediante el metodo seleccionado.`, "Los precios, reembolsos y cancelaciones siguen las condiciones mostradas en checkout y la politica de reembolso de TJFit."] },
        { title: "5. Uso Aceptable", body: ["No puedes hacer ingenieria inversa, scraping, acoso, subir contenido ilegal ni interferir con la seguridad.", "Las infracciones pueden llevar a suspension o cierre permanente."] },
        { title: "6. Limitacion de Responsabilidad", body: ["En la medida maxima permitida por la ley, TJFit no es responsable de danos indirectos o consecuentes.", "Usas la plataforma bajo tu propio riesgo."] },
        { title: "7. Actualizaciones de los Terminos", body: ["Podemos actualizar estos Terminos ocasionalmente.", "Seguir usando la plataforma tras los cambios significa que aceptas la nueva version."] }
      ],
      versionLabel: `Version de terminos: ${version}`
    },
    fr: {
      badge: "Conditions d'utilisation",
      title: "Conditions Generales",
      sections: [
        { title: "1. Acceptation des Conditions", body: ["En creant un compte ou en utilisant TJFit, vous acceptez ces Conditions, notre Politique de Confidentialite et notre Politique de Remboursement.", "Si vous n'etes pas d'accord, vous ne devez pas utiliser la plateforme."] },
        { title: "2. Eligibilite et Securite du Compte", body: ["Vous devez fournir des informations exactes, proteger vos identifiants et rester responsable de l'activite de votre compte.", "TJFit peut suspendre les comptes utilises pour fraude, abus ou activite illegale."] },
        { title: "3. Avertissement Sante et Medical", body: ["TJFit fournit de l'education et du coaching, pas un diagnostic ou traitement medical.", "Consultez un professionnel de sante avant de commencer un programme."] },
        { title: `4. Paiements et Facturation (${billingProvider})`, body: [`Les paiements des produits payants peuvent etre traites par ${billingProvider}. En achetant, vous autorisez le debit via le moyen de paiement choisi.`, "Les prix, remboursements et annulations suivent les conditions affichees au paiement et la politique de remboursement TJFit."] },
        { title: "5. Utilisation Acceptable", body: ["Vous ne pouvez pas faire d'ingenierie inverse, de scraping, de harcelement, publier du contenu illegal ou nuire a la securite.", "Les violations peuvent entrainer suspension ou suppression definitive."] },
        { title: "6. Limitation de Responsabilite", body: ["Dans la mesure maximale permise par la loi, TJFit n'est pas responsable des dommages indirects ou consequents.", "Vous utilisez la plateforme a vos propres risques."] },
        { title: "7. Mise a Jour des Conditions", body: ["Nous pouvons mettre a jour ces Conditions de temps en temps.", "L'utilisation continue apres modification signifie que vous acceptez la nouvelle version."] }
      ],
      versionLabel: `Version des conditions : ${version}`
    }
  };

  return copy[locale];
}

export function getPrivacyCopy(locale: Locale): PolicyCopy {
  const enParagraphs = [
    "Last updated: April 2026 | Contact: tjfit.org@gmail.com",
    "1. WHO WE ARE — TJFit (\"we\", \"us\", \"our\") operates the website tjfit.org. We provide AI-powered fitness programs, nutrition plans, and coach marketplace services.",
    "2. WHAT DATA WE COLLECT — (a) Account data: email address, display name, profile photo, username. (b) Health & fitness data: weight, height, age, fitness goals, workout logs, meal tracking. (c) Payment data: processed entirely by Paddle. TJFit never stores card numbers or CVV. (d) Usage data: pages visited, features used, session duration. (e) Communications: messages sent through TJFit messaging system. (f) AI interaction data: TJAI quiz answers and generated plans.",
    "3. HOW WE USE YOUR DATA — To provide and improve TJFit services. To generate personalized fitness and nutrition plans via TJAI. To process payments through Paddle. To send transactional emails (receipts, verification). To send newsletters (with your consent). To display your public profile to other TJFit members.",
    "4. WHO WE SHARE DATA WITH — We do NOT sell your personal data. We share with: Paddle (payment processing) — paddle.com/privacy. Supabase (database hosting) — supabase.com/privacy. Resend (email delivery) — resend.com/privacy. Anthropic/Claude API (AI plan generation — anonymized prompts only, no personal identifiers sent). Coaches on TJFit see: your username and messages you send them. Coaches do NOT see your email, payment details, or private data.",
    "5. YOUR RIGHTS (GDPR) — Access: request a copy of all data we hold. Correction: update incorrect data via profile settings. Deletion: delete your account and all associated data. Portability: export your data in machine-readable format. Objection: opt out of non-essential data processing. Withdraw consent: unsubscribe from marketing anytime. To exercise rights: email tjfit.org@gmail.com. We respond within 30 days.",
    "6. DATA RETENTION — Active accounts: data retained while account is active. Deleted accounts: personal data deleted within 30 days. Anonymized analytics: retained indefinitely. Payment records: retained as required by tax law (7 years).",
    "7. HEALTH DATA — Body metrics, weight logs, and fitness data are sensitive. We store them encrypted. We never sell health data. TJAI sends anonymized prompts to Claude API. No personally identifiable information is sent to Anthropic.",
    "8. COOKIES — Essential cookies for login sessions and preferences. Analytics cookies to understand site usage (anonymized). You can disable non-essential cookies in your browser settings.",
    "9. CHILDREN — TJFit is not intended for users under 16. If we discover a user is under 16, we delete their account immediately.",
    "10. SECURITY — Industry-standard encryption (HTTPS, encrypted database). Passwords are hashed and never stored in plain text. We regularly review our security practices.",
    "11. CHANGES — We may update this policy. We notify users by email for major changes. Continued use after changes = acceptance.",
    "12. CONTACT — Privacy questions: tjfit.org@gmail.com"
  ];
  const copy: Record<Locale, PolicyCopy> = {
    en: { badge: "Privacy Policy", title: "Privacy Policy", paragraphs: enParagraphs, lastUpdatedLabel: "Last updated: April 2026" },
    tr: {
      badge: "Gizlilik Politikası",
      title: "Gizlilik Politikası",
      paragraphs: [
        "Son güncelleme: Nisan 2026 | İletişim: tjfit.org@gmail.com",
        "1. BİZ KİMİZ — TJFit tjfit.org adresinde faaliyet göstermektedir. Yapay zeka destekli fitness programları, beslenme planları ve koç platformu hizmetleri sunuyoruz.",
        "2. HANGİ VERİLERİ TOPLUYORUZ — (a) Hesap verileri: e-posta, görünen ad, profil fotoğrafı, kullanıcı adı. (b) Sağlık ve fitness verileri: kilo, boy, yaş, hedefler, antrenman kayıtları. (c) Ödeme verileri: tamamen Paddle tarafından işlenir. Kart numarası veya CVV saklamıyoruz. (d) Kullanım verileri: ziyaret edilen sayfalar, kullanılan özellikler. (e) İletişim: TJFit üzerinden gönderilen mesajlar. (f) Yapay zeka etkileşim verileri: TJAI quiz yanıtları ve oluşturulan planlar.",
        "3. VERİLERİNİZİ NASIL KULLANIYORUZ — TJFit hizmetlerini sunmak ve iyileştirmek. TJAI aracılığıyla kişiselleştirilmiş planlar oluşturmak. Paddle üzerinden ödemeleri işlemek. İşlemsel e-postalar göndermek. Bülten göndermek (onayınızla). Profilinizi diğer üyelere göstermek.",
        "4. VERİLERİNİZİ KİMLERLE PAYLAŞIYORUZ — Kişisel verilerinizi SATMIYORUZ. Şunlarla paylaşıyoruz: Paddle (ödeme işleme), Supabase (veritabanı barındırma), Resend (e-posta iletimi), Anthropic/Claude API (yapay zeka plan üretimi — anonimleştirilmiş istemler, kişisel tanımlayıcı yok).",
        "5. HAKLARINIZ (GDPR) — Erişim, düzeltme, silme, taşıma, itiraz, onay geri çekme. Talepler için: tjfit.org@gmail.com. 30 gün içinde yanıt veriyoruz.",
        "6. VERİ SAKLAMA — Aktif hesaplar: hesap aktif olduğu sürece. Silinen hesaplar: 30 gün içinde kişisel veriler silinir. Anonim analizler: süresiz.",
        "7. SAĞLIK VERİLERİ — Şifreli olarak saklanır. Satılmaz. TJAI, Claude API'ye anonimleştirilmiş istemler gönderir.",
        "8. ÇEREZLER — Oturum ve tercihler için zorunlu çerezler. Analitik çerezler (anonimleştirilmiş).",
        "9. ÇOCUKLAR — TJFit 16 yaş altı kullanıcılara yönelik değildir.",
        "10. GÜVENLİK — HTTPS ve şifreli veritabanı. Şifreler hashlenir.",
        "11. DEĞİŞİKLİKLER — Büyük değişiklikler için e-posta bildirimi yapılır.",
        "12. İLETİŞİM — tjfit.org@gmail.com"
      ],
      lastUpdatedLabel: "Son güncelleme: Nisan 2026"
    },
    ar: {
      badge: "سياسة الخصوصية",
      title: "سياسة الخصوصية",
      paragraphs: [
        "آخر تحديث: أبريل 2026 | التواصل: tjfit.org@gmail.com",
        "1. من نحن — يشغّل TJFit الموقع tjfit.org ويوفر برامج لياقة بالذكاء الاصطناعي وخطط تغذية وسوق للمدربين.",
        "2. البيانات التي نجمعها — (أ) بيانات الحساب: البريد الإلكتروني، الاسم، الصورة، اسم المستخدم. (ب) بيانات الصحة: الوزن والطول والعمر والأهداف. (ج) بيانات الدفع: تُعالَج بالكامل عبر Paddle، لا نحفظ أرقام البطاقات. (د) بيانات الاستخدام: الصفحات والميزات. (هـ) الاتصالات. (و) بيانات الذكاء الاصطناعي.",
        "3. كيف نستخدم بياناتك — لتقديم الخدمات وتحسينها، وإنشاء خطط مخصصة، ومعالجة المدفوعات، وإرسال رسائل خدمة، وعرض ملفك الشخصي.",
        "4. من يتلقى بياناتك — لا نبيع بياناتك. نشاركها مع: Paddle وSupabase وResend وAnthropic/Claude API (موجّهات مجهولة فقط).",
        "5. حقوقك (GDPR) — الوصول والتصحيح والحذف والنقل والاعتراض. للتواصل: tjfit.org@gmail.com. الرد خلال 30 يوماً.",
        "6. الاحتفاظ بالبيانات — الحسابات النشطة: طوال فترة النشاط. المحذوفة: حذف خلال 30 يوماً.",
        "7. بيانات الصحة — مشفرة ولا تُباع. TJAI يرسل موجّهات مجهولة فقط لـ Claude API.",
        "8. ملفات تعريف الارتباط — أساسية للجلسات والتحليلات المجهولة.",
        "9. الأطفال — TJFit ليس مخصصاً لمن هم دون 16 عاماً.",
        "10. الأمان — تشفير HTTPS وقاعدة بيانات مشفرة وكلمات مرور مجزأة.",
        "11. التغييرات — إشعار بالبريد للتغييرات الكبرى.",
        "12. التواصل — tjfit.org@gmail.com"
      ],
      lastUpdatedLabel: "آخر تحديث: أبريل 2026"
    },
    es: {
      badge: "Política de Privacidad",
      title: "Política de Privacidad",
      paragraphs: [
        "Última actualización: Abril 2026 | Contacto: tjfit.org@gmail.com",
        "1. QUIÉNES SOMOS — TJFit opera el sitio web tjfit.org con programas de fitness con IA, planes de nutrición y un marketplace de entrenadores.",
        "2. DATOS QUE RECOPILAMOS — (a) Datos de cuenta: email, nombre, foto, usuario. (b) Salud y fitness: peso, altura, edad, objetivos. (c) Pagos: procesados íntegramente por Paddle, no almacenamos datos de tarjeta. (d) Uso: páginas visitadas. (e) Comunicaciones. (f) Datos de IA: respuestas del cuestionario TJAI.",
        "3. USO DE TUS DATOS — Proveer y mejorar los servicios, generar planes personalizados, procesar pagos, enviar emails transaccionales, mostrar tu perfil público.",
        "4. CON QUIÉN COMPARTIMOS — No vendemos tus datos. Compartimos con: Paddle, Supabase, Resend, Anthropic/Claude API (prompts anónimos).",
        "5. TUS DERECHOS (GDPR) — Acceso, corrección, eliminación, portabilidad, oposición. Contacto: tjfit.org@gmail.com. Respondemos en 30 días.",
        "6. RETENCIÓN DE DATOS — Cuentas activas: mientras estén activas. Eliminadas: datos borrados en 30 días.",
        "7. DATOS DE SALUD — Cifrados, no vendidos. TJAI envía prompts anónimos a Claude API.",
        "8. COOKIES — Esenciales para sesiones y analíticas anónimas.",
        "9. MENORES — TJFit no está dirigido a menores de 16 años.",
        "10. SEGURIDAD — HTTPS, base de datos cifrada, contraseñas hasheadas.",
        "11. CAMBIOS — Notificación por email en cambios importantes.",
        "12. CONTACTO — tjfit.org@gmail.com"
      ],
      lastUpdatedLabel: "Última actualización: Abril 2026"
    },
    fr: {
      badge: "Politique de confidentialité",
      title: "Politique de confidentialité",
      paragraphs: [
        "Dernière mise à jour : Avril 2026 | Contact : tjfit.org@gmail.com",
        "1. QUI SOMMES-NOUS — TJFit exploite le site web tjfit.org et propose des programmes fitness par IA, des plans nutritionnels et une marketplace de coachs.",
        "2. DONNÉES COLLECTÉES — (a) Compte : email, nom, photo, pseudo. (b) Santé et fitness : poids, taille, âge, objectifs. (c) Paiements : traités par Paddle, nous ne stockons pas les données de carte. (d) Utilisation : pages visitées. (e) Communications. (f) Données IA : réponses au quiz TJAI.",
        "3. UTILISATION DES DONNÉES — Fournir et améliorer nos services, générer des plans personnalisés, traiter les paiements, envoyer des emails de service, afficher votre profil public.",
        "4. PARTAGE DES DONNÉES — Nous ne vendons pas vos données. Nous partageons avec : Paddle, Supabase, Resend, Anthropic/Claude API (prompts anonymisés).",
        "5. VOS DROITS (RGPD) — Accès, correction, suppression, portabilité, opposition. Contact : tjfit.org@gmail.com. Réponse sous 30 jours.",
        "6. CONSERVATION — Comptes actifs : tant que le compte est actif. Comptes supprimés : données supprimées sous 30 jours.",
        "7. DONNÉES DE SANTÉ — Chiffrées, non vendues. TJAI envoie des prompts anonymisés à Claude API.",
        "8. COOKIES — Essentiels pour les sessions et les analyses anonymisées.",
        "9. MINEURS — TJFit n'est pas destiné aux moins de 16 ans.",
        "10. SÉCURITÉ — HTTPS, base de données chiffrée, mots de passe hachés.",
        "11. MODIFICATIONS — Notification par email pour les changements majeurs.",
        "12. CONTACT — tjfit.org@gmail.com"
      ],
      lastUpdatedLabel: "Dernière mise à jour : Avril 2026"
    }
  };

  return copy[locale];
}

export function getRefundCopy(locale: Locale): PolicyCopy {
  const copy: Record<Locale, PolicyCopy> = {
    en: {
      badge: "Refund Policy",
      title: "Refund Policy",
      paragraphs: [
        "Digital programs and coaching services may be refunded according to the service type and usage status.",
        "Program purchases are generally non-refundable after meaningful content access, unless required by law or in cases of duplicate or failed charges.",
        "To request a refund, submit a request through Support with your order reference and account email."
      ],
      lastUpdatedLabel: "Last updated: 2026-03-29"
    },
    tr: {
      badge: "Iade Politikasi",
      title: "Iade Politikasi",
      paragraphs: [
        "Dijital programlar ve koçluk hizmetleri, hizmet turu ve kullanim durumuna gore iade edilebilir.",
        "Program satin alimlari, icerige anlamli erisim saglandiktan sonra genellikle iade edilmez; kanunun gerektirdigi durumlar ve cift/hatali tahsilatlar haric.",
        "Iade talebi icin Siparis referansin ve hesap e-postan ile Destek uzerinden basvuru gonder."
      ],
      lastUpdatedLabel: "Son guncelleme: 2026-03-29"
    },
    ar: {
      badge: "سياسة الاسترداد",
      title: "سياسة الاسترداد",
      paragraphs: [
        "قد يتم استرداد البرامج الرقمية وخدمات التدريب بحسب نوع الخدمة وحالة الاستخدام.",
        "عادة لا يتم رد قيمة البرامج بعد الوصول الفعلي للمحتوى الا اذا كان القانون يفرض ذلك او في حالات التكرار او فشل السحب.",
        "لطلب استرداد، ارسل طلبا عبر الدعم مع مرجع الطلب وبريد الحساب."
      ],
      lastUpdatedLabel: "اخر تحديث: 2026-03-29"
    },
    es: {
      badge: "Politica de Reembolso",
      title: "Politica de Reembolso",
      paragraphs: [
        "Los programas digitales y servicios de coaching pueden reembolsarse segun el tipo de servicio y su uso.",
        "Las compras de programas normalmente no son reembolsables tras un acceso relevante al contenido, salvo exigencia legal o cargos duplicados/fallidos.",
        "Para solicitar un reembolso, envia una solicitud por Soporte con tu referencia de pedido y correo de cuenta."
      ],
      lastUpdatedLabel: "Ultima actualizacion: 2026-03-29"
    },
    fr: {
      badge: "Politique de remboursement",
      title: "Politique de remboursement",
      paragraphs: [
        "Les programmes digitaux et services de coaching peuvent etre rembourses selon le type de service et le niveau d'utilisation.",
        "Les achats de programmes ne sont generalement pas remboursables apres un acces significatif au contenu, sauf obligation legale ou doubles/echecs de paiement.",
        "Pour demander un remboursement, envoyez une demande via Support avec votre reference de commande et l'email du compte."
      ],
      lastUpdatedLabel: "Derniere mise a jour : 2026-03-29"
    }
  };

  return copy[locale];
}
