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
            "These Terms of Service are provided by TJFit (\"TJFit\", \"we\", \"us\", or \"our\"), the brand and platform operator of tjfit.org.",
            "By creating an account or using TJFit, you agree to these Terms, our Privacy Policy, and our Refund Policy.",
            "If you do not agree, you must not use the platform."
          ]
        },
        {
          title: "2. Eligibility and Account Security",
          body: [
            "You must be at least 13 years old to create an account or use TJFit. Users under 13 are not permitted, and accounts found to belong to a child under 13 are deleted. Users aged 13–17 must have parental consent.",
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
      badge: "Hizmet Şartları",
      title: "Şartlar ve Koşullar",
      sections: [
        { title: "1. Şartların Kabul Edilmesi", body: ["TJFit'i kullanarak bu Şartları, Gizlilik Politikasını ve İade Politikasını kabul etmiş olursun.", "Kabul etmiyorsan platformu kullanmamalısın."] },
        { title: "2. Uygunluk ve Hesap Güvenliği", body: ["TJFit'i kullanmak veya hesap oluşturmak için en az 13 yaşında olmalısın. 13 yaş altı kullanıcılara izin verilmez; 13 yaş altına ait olduğu tespit edilen hesaplar silinir. 13-17 yaş arası kullanıcıların ebeveyn onayı gerekir.", "Doğru bilgi vermeli, giriş bilgilerini korumalı ve hesabındaki işlemlerden sorumlu olmalısın.", "Dolandırıcılık, kötüye kullanım veya yasa dışı faaliyetlerde kullanılan hesaplar askıya alınabilir."] },
        { title: "3. Sağlık ve Tıbbi Uyarı", body: ["TJFit eğitim ve koçluk sunar; tıbbi tanı veya tedavi sunmaz.", "Herhangi bir programa başlamadan önce lisanslı bir sağlık uzmanına danış."] },
        { title: `4. Ödeme ve Faturalama (${billingProvider})`, body: [`Ücretli ürünlerin ödemeleri ${billingProvider} tarafından işlenebilir. Satın alarak seçilen ödeme yöntemi üzerinden tahsilatı kabul edersin.`, "Fiyatlandırma, iptal ve iadeler ödeme ekranındaki şartlara ve TJFit iade politikasına tabidir."] },
        { title: "5. Kabul Edilebilir Kullanım", body: ["Platformu tersine mühendislik için kullanamaz, veri kazıyamaz, taciz edemez veya güvenliğe müdahale edemezsin.", "İhlaller hesap kısıtlaması veya kapatma ile sonuçlanabilir."] },
        { title: "6. Sorumluluğun Sınırlandırılması", body: ["Kanunun izin verdiği en geniş kapsamda TJFit dolaylı veya özel zararlardan sorumlu tutulamaz.", "Platformu kendi sorumluluğunda kullanırsın."] },
        { title: "7. Şartların Güncellenmesi", body: ["Bu Şartları zaman zaman güncelleyebiliriz.", "Güncellemeden sonra kullanmaya devam etmen yeni sürümü kabul ettiğin anlamına gelir."] }
      ],
      versionLabel: `Şartlar sürümü: ${version}`
    },
    ar: {
      badge: "شروط الخدمة",
      title: "الشروط والاحكام",
      sections: [
        { title: "1. قبول الشروط", body: ["عند انشاء حساب او استخدام TJFit فانك توافق على هذه الشروط وسياسة الخصوصية وسياسة الاسترداد.", "اذا لم توافق فلا يجوز لك استخدام المنصة."] },
        { title: "2. الاهلية وامان الحساب", body: ["يجب ان يكون عمرك 13 عاماً على الاقل لإنشاء حساب او استخدام TJFit. لا يُسمح لمن هم دون 13 عاماً، وتُحذف الحسابات التي يتبيّن انها تخص طفلاً دون 13. على من تتراوح اعمارهم بين 13 و17 الحصول على موافقة ولي الامر.", "يجب تقديم معلومات صحيحة والحفاظ على بيانات الدخول وتحمل مسؤولية النشاط داخل حسابك.", "يجوز لـ TJFit ايقاف الحسابات المستخدمة في الاحتيال او الاساءة او النشاط غير القانوني."] },
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
        { title: "2. Elegibilidad y Seguridad de la Cuenta", body: ["Debes tener al menos 13 anos para crear una cuenta o usar TJFit. No se permite a menores de 13; las cuentas que pertenezcan a un menor de 13 se eliminan. Los usuarios de 13 a 17 anos necesitan consentimiento parental.", "Debes dar informacion correcta, proteger tus credenciales y responsabilizarte de la actividad de tu cuenta.", "TJFit puede suspender cuentas usadas para fraude, abuso o actividad ilegal."] },
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
        { title: "2. Eligibilite et Securite du Compte", body: ["Vous devez avoir au moins 13 ans pour creer un compte ou utiliser TJFit. Les moins de 13 ans ne sont pas autorises ; les comptes appartenant a un enfant de moins de 13 ans sont supprimes. Les utilisateurs de 13 a 17 ans doivent avoir le consentement parental.", "Vous devez fournir des informations exactes, proteger vos identifiants et rester responsable de l'activite de votre compte.", "TJFit peut suspendre les comptes utilises pour fraude, abus ou activite illegale."] },
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
    "2. WHAT DATA WE COLLECT — (a) Account data: email address, display name, profile photo, username. (b) Health & fitness data: weight, height, age, fitness goals, workout logs, meal tracking. (c) Payment data: processed entirely by Gumroad. TJFit never stores card numbers or CVV. (d) Usage data: pages visited, features used, session duration. (e) Communications: messages sent through TJFit messaging system. (f) AI interaction data: TJAI quiz answers and generated plans.",
    "3. HOW WE USE YOUR DATA — To provide and improve TJFit services. To generate personalized fitness and nutrition plans via TJAI. To process payments through Gumroad. To send transactional emails (receipts, verification). To send newsletters (with your consent). To display your public profile to other TJFit members.",
    "4. WHO WE SHARE DATA WITH — We do NOT sell your personal data. We share with: Gumroad (payment processing) — gumroad.com/privacy. Supabase (database hosting) — supabase.com/privacy. Resend (email delivery) — resend.com/privacy. Anthropic/Claude API (AI plan generation — anonymized prompts only, no personal identifiers sent). Coaches on TJFit see: your username and messages you send them. Coaches do NOT see your email, payment details, or private data.",
    "5. YOUR RIGHTS (GDPR) — Access: request a copy of all data we hold. Correction: update incorrect data via profile settings. Deletion: delete your account and all associated data. Portability: export your data in machine-readable format. Objection: opt out of non-essential data processing. Withdraw consent: unsubscribe from marketing anytime. To exercise rights: email tjfit.org@gmail.com. We respond within 30 days.",
    "6. DATA RETENTION — Active accounts: data retained while account is active. Deleted accounts: personal data deleted within 30 days. Anonymized analytics: retained indefinitely. Payment records: retained as required by tax law (7 years).",
    "7. HEALTH DATA — Body metrics, weight logs, and fitness data are sensitive. We store them encrypted. We never sell health data. TJAI sends anonymized prompts to Claude API. No personally identifiable information is sent to Anthropic.",
    "8. COOKIES — Essential cookies for login sessions and preferences. Analytics cookies to understand site usage (anonymized). You can disable non-essential cookies in your browser settings.",
    "9. CHILDREN'S PRIVACY (COPPA) — TJFit is not directed to children under 13 and we do not knowingly collect personal information from anyone under 13. Account creation requires a date of birth and is blocked for users under 13. If we learn that we have collected data from a child under 13, we delete that account and its data immediately. Parents or guardians who believe their under-13 child has provided us data can contact tjfit.org@gmail.com for removal. Users aged 13–17 should use TJFit only with parental consent.",
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
        "2. HANGİ VERİLERİ TOPLUYORUZ — (a) Hesap verileri: e-posta, görünen ad, profil fotoğrafı, kullanıcı adı. (b) Sağlık ve fitness verileri: kilo, boy, yaş, hedefler, antrenman kayıtları. (c) Ödeme verileri: tamamen Gumroad tarafından işlenir. Kart numarası veya CVV saklamıyoruz. (d) Kullanım verileri: ziyaret edilen sayfalar, kullanılan özellikler. (e) İletişim: TJFit üzerinden gönderilen mesajlar. (f) Yapay zeka etkileşim verileri: TJAI quiz yanıtları ve oluşturulan planlar.",
        "3. VERİLERİNİZİ NASIL KULLANIYORUZ — TJFit hizmetlerini sunmak ve iyileştirmek. TJAI aracılığıyla kişiselleştirilmiş planlar oluşturmak. Gumroad üzerinden ödemeleri işlemek. İşlemsel e-postalar göndermek. Bülten göndermek (onayınızla). Profilinizi diğer üyelere göstermek.",
        "4. VERİLERİNİZİ KİMLERLE PAYLAŞIYORUZ — Kişisel verilerinizi SATMIYORUZ. Şunlarla paylaşıyoruz: Gumroad (ödeme işleme), Supabase (veritabanı barındırma), Resend (e-posta iletimi), Anthropic/Claude API (yapay zeka plan üretimi — anonimleştirilmiş istemler, kişisel tanımlayıcı yok).",
        "5. HAKLARINIZ (GDPR) — Erişim, düzeltme, silme, taşıma, itiraz, onay geri çekme. Talepler için: tjfit.org@gmail.com. 30 gün içinde yanıt veriyoruz.",
        "6. VERİ SAKLAMA — Aktif hesaplar: hesap aktif olduğu sürece. Silinen hesaplar: 30 gün içinde kişisel veriler silinir. Anonim analizler: süresiz.",
        "7. SAĞLIK VERİLERİ — Şifreli olarak saklanır. Satılmaz. TJAI, Claude API'ye anonimleştirilmiş istemler gönderir.",
        "8. ÇEREZLER — Oturum ve tercihler için zorunlu çerezler. Analitik çerezler (anonimleştirilmiş).",
        "9. ÇOCUKLARIN GİZLİLİĞİ (COPPA) — TJFit 13 yaş altı çocuklara yönelik değildir ve 13 yaş altından bilerek kişisel veri toplamayız. Hesap oluşturmak doğum tarihi gerektirir ve 13 yaş altı için engellenir. 13 yaşından küçük birinden veri topladığımızı öğrenirsek hesabı ve verilerini derhal sileriz. Kaldırma talepleri için: tjfit.org@gmail.com. 13–17 yaş arası kullanıcılar TJFit'i yalnızca ebeveyn onayıyla kullanmalıdır.",
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
        "2. البيانات التي نجمعها — (أ) بيانات الحساب: البريد الإلكتروني، الاسم، الصورة، اسم المستخدم. (ب) بيانات الصحة: الوزن والطول والعمر والأهداف. (ج) بيانات الدفع: تُعالَج بالكامل عبر Gumroad، لا نحفظ أرقام البطاقات. (د) بيانات الاستخدام: الصفحات والميزات. (هـ) الاتصالات. (و) بيانات الذكاء الاصطناعي.",
        "3. كيف نستخدم بياناتك — لتقديم الخدمات وتحسينها، وإنشاء خطط مخصصة، ومعالجة المدفوعات، وإرسال رسائل خدمة، وعرض ملفك الشخصي.",
        "4. من يتلقى بياناتك — لا نبيع بياناتك. نشاركها مع: Gumroad وSupabase وResend وAnthropic/Claude API (موجّهات مجهولة فقط).",
        "5. حقوقك (GDPR) — الوصول والتصحيح والحذف والنقل والاعتراض. للتواصل: tjfit.org@gmail.com. الرد خلال 30 يوماً.",
        "6. الاحتفاظ بالبيانات — الحسابات النشطة: طوال فترة النشاط. المحذوفة: حذف خلال 30 يوماً.",
        "7. بيانات الصحة — مشفرة ولا تُباع. TJAI يرسل موجّهات مجهولة فقط لـ Claude API.",
        "8. ملفات تعريف الارتباط — أساسية للجلسات والتحليلات المجهولة.",
        "9. خصوصية الأطفال (COPPA) — TJFit غير موجَّه للأطفال دون 13 عاماً ولا نجمع عن قصد بيانات ممن هم دون 13. يتطلب إنشاء الحساب تاريخ ميلاد ويُمنع لمن هم دون 13 عاماً. إذا علمنا بجمع بيانات من طفل دون 13 نحذف الحساب وبياناته فوراً. لطلب الحذف: tjfit.org@gmail.com. على من تتراوح أعمارهم بين 13 و17 عاماً استخدام TJFit بموافقة ولي الأمر فقط.",
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
        "2. DATOS QUE RECOPILAMOS — (a) Datos de cuenta: email, nombre, foto, usuario. (b) Salud y fitness: peso, altura, edad, objetivos. (c) Pagos: procesados íntegramente por Gumroad, no almacenamos datos de tarjeta. (d) Uso: páginas visitadas. (e) Comunicaciones. (f) Datos de IA: respuestas del cuestionario TJAI.",
        "3. USO DE TUS DATOS — Proveer y mejorar los servicios, generar planes personalizados, procesar pagos, enviar emails transaccionales, mostrar tu perfil público.",
        "4. CON QUIÉN COMPARTIMOS — No vendemos tus datos. Compartimos con: Gumroad, Supabase, Resend, Anthropic/Claude API (prompts anónimos).",
        "5. TUS DERECHOS (GDPR) — Acceso, corrección, eliminación, portabilidad, oposición. Contacto: tjfit.org@gmail.com. Respondemos en 30 días.",
        "6. RETENCIÓN DE DATOS — Cuentas activas: mientras estén activas. Eliminadas: datos borrados en 30 días.",
        "7. DATOS DE SALUD — Cifrados, no vendidos. TJAI envía prompts anónimos a Claude API.",
        "8. COOKIES — Esenciales para sesiones y analíticas anónimas.",
        "9. PRIVACIDAD DE MENORES (COPPA) — TJFit no está dirigido a menores de 13 años y no recopilamos a sabiendas datos de menores de 13. Crear una cuenta requiere fecha de nacimiento y está bloqueado para menores de 13. Si detectamos datos de un menor de 13, eliminamos la cuenta y sus datos de inmediato. Para solicitudes de eliminación: tjfit.org@gmail.com. Los usuarios de 13 a 17 años deben usar TJFit solo con consentimiento parental.",
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
        "2. DONNÉES COLLECTÉES — (a) Compte : email, nom, photo, pseudo. (b) Santé et fitness : poids, taille, âge, objectifs. (c) Paiements : traités par Gumroad, nous ne stockons pas les données de carte. (d) Utilisation : pages visitées. (e) Communications. (f) Données IA : réponses au quiz TJAI.",
        "3. UTILISATION DES DONNÉES — Fournir et améliorer nos services, générer des plans personnalisés, traiter les paiements, envoyer des emails de service, afficher votre profil public.",
        "4. PARTAGE DES DONNÉES — Nous ne vendons pas vos données. Nous partageons avec : Gumroad, Supabase, Resend, Anthropic/Claude API (prompts anonymisés).",
        "5. VOS DROITS (RGPD) — Accès, correction, suppression, portabilité, opposition. Contact : tjfit.org@gmail.com. Réponse sous 30 jours.",
        "6. CONSERVATION — Comptes actifs : tant que le compte est actif. Comptes supprimés : données supprimées sous 30 jours.",
        "7. DONNÉES DE SANTÉ — Chiffrées, non vendues. TJAI envoie des prompts anonymisés à Claude API.",
        "8. COOKIES — Essentiels pour les sessions et les analyses anonymisées.",
        "9. CONFIDENTIALITÉ DES MINEURS (COPPA) — TJFit n'est pas destiné aux enfants de moins de 13 ans et nous ne collectons pas sciemment de données de personnes de moins de 13 ans. La création de compte exige une date de naissance et est bloquée pour les moins de 13 ans. Si nous apprenons avoir collecté des données d'un enfant de moins de 13 ans, nous supprimons immédiatement le compte et ses données. Pour toute demande de suppression : tjfit.org@gmail.com. Les utilisateurs de 13 à 17 ans doivent utiliser TJFit uniquement avec le consentement parental.",
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
        "Last updated: April 15, 2026",
        "Payments for TJFit products and subscriptions are processed by Gumroad (gumroad.com), who acts as the Merchant of Record for all transactions. All refund requests are handled directly by Gumroad in accordance with their refund policy.",
        "You are entitled to a full refund if you submit your request within 14 days of the transaction date. To request a refund, use the 'View receipt' or 'Manage subscription' link in your purchase confirmation email, or visit gumroad.com/refunds and select 'Request refund'.",
        "Refund requests submitted within 14 days of purchase are reviewed by Gumroad. Gumroad's decision is final and applies to all purchases made through TJFit.",
        "For refund inquiries, contact Gumroad's buyer support at gumroad.com/refunds. For general TJFit support, email tjfit.org@gmail.com."
      ],
      lastUpdatedLabel: "Last updated: April 15, 2026"
    },
    tr: {
      badge: "İade Politikası",
      title: "İade Politikası",
      paragraphs: [
        "Son güncelleme: 15 Nisan 2026",
        "TJFit ürünleri ve abonelikleri için ödemeler, tüm işlemlerde Kayıtlı Satıcı olarak hareket eden Gumroad (gumroad.com) tarafından işlenir. Tüm iade talepleri doğrudan Gumroad tarafından, kendi iade politikasına göre karşılanır.",
        "İşlem tarihinden itibaren 14 gün içinde talepte bulunmanız halinde tam iade hakkına sahipsiniz. İade talebinde bulunmak için satın alma onay e-postanızdaki 'Makbuzu görüntüle' veya 'Aboneliği yönet' bağlantısını kullanın ya da gumroad.com/refunds adresini ziyaret edip 'İade talebi' seçeneğini belirleyin.",
        "Satın alma tarihinden itibaren 14 gün içinde iletilen iade talepleri Gumroad tarafından incelenir. Gumroad'ın kararı kesin olup TJFit üzerinden yapılan tüm satın alımlar için geçerlidir.",
        "İade sorularınız için Gumroad alıcı desteğine gumroad.com/refunds adresinden ulaşabilirsiniz. Genel TJFit desteği için tjfit.org@gmail.com adresine e-posta gönderin."
      ],
      lastUpdatedLabel: "Son güncelleme: 15 Nisan 2026"
    },
    ar: {
      badge: "سياسة الاسترداد",
      title: "سياسة الاسترداد",
      paragraphs: [
        "آخر تحديث: 15 أبريل 2026",
        "تتم معالجة المدفوعات لمنتجات TJFit والاشتراكات عبر Gumroad (gumroad.com)، التي تعمل بصفة التاجر الرسمي لجميع المعاملات. تُعالج جميع طلبات الاسترداد مباشرةً من قِبل Gumroad وفقًا لسياسة الاسترداد الخاصة بها.",
        "يحق لك الحصول على استرداد كامل إذا قدّمت طلبك خلال 14 يومًا من تاريخ المعاملة. لتقديم طلب الاسترداد، استخدم رابط 'عرض الإيصال' أو 'إدارة الاشتراك' في بريد تأكيد الشراء، أو تفضل بزيارة gumroad.com/refunds واختر 'طلب استرداد'.",
        "تُراجَع طلبات الاسترداد المقدَّمة خلال 14 يومًا من تاريخ الشراء من قِبل Gumroad. قرار Gumroad نهائي ويُطبَّق على جميع عمليات الشراء التي تُجرى عبر TJFit.",
        "للاستفسار عن الاسترداد، تواصل مع دعم المشترين في Gumroad عبر gumroad.com/refunds. للحصول على دعم TJFit العام، أرسل بريدًا إلكترونيًا إلى tjfit.org@gmail.com."
      ],
      lastUpdatedLabel: "آخر تحديث: 15 أبريل 2026"
    },
    es: {
      badge: "Política de Reembolso",
      title: "Política de Reembolso",
      paragraphs: [
        "Última actualización: 15 de abril de 2026",
        "Los pagos de productos y suscripciones de TJFit son procesados por Gumroad (gumroad.com), que actúa como Merchant of Record para todas las transacciones. Todas las solicitudes de reembolso son gestionadas directamente por Gumroad conforme a su política de reembolsos.",
        "Tienes derecho a un reembolso completo si presentas tu solicitud dentro de los 14 días siguientes a la fecha de la transacción. Para solicitarlo, usa el enlace 'Ver recibo' o 'Gestionar suscripción' en el correo de confirmación de tu compra, o visita gumroad.com/refunds y selecciona 'Solicitar reembolso'.",
        "Las solicitudes de reembolso presentadas dentro de los 14 días posteriores a la compra son revisadas por Gumroad. La decisión de Gumroad es definitiva y se aplica a todas las compras realizadas a través de TJFit.",
        "Para consultas sobre reembolsos, contacta el soporte al comprador de Gumroad en gumroad.com/refunds. Para soporte general de TJFit, escribe a tjfit.org@gmail.com."
      ],
      lastUpdatedLabel: "Última actualización: 15 de abril de 2026"
    },
    fr: {
      badge: "Politique de remboursement",
      title: "Politique de remboursement",
      paragraphs: [
        "Dernière mise à jour : 15 avril 2026",
        "Les paiements pour les produits et abonnements TJFit sont traités par Gumroad (gumroad.com), qui agit en tant que Merchant of Record pour toutes les transactions. Toutes les demandes de remboursement sont traitées directement par Gumroad conformément à sa politique de remboursement.",
        "Vous avez droit à un remboursement complet si vous soumettez votre demande dans les 14 jours suivant la date de la transaction. Pour demander un remboursement, utilisez le lien 'Voir le reçu' ou 'Gérer l'abonnement' dans votre e-mail de confirmation d'achat, ou rendez-vous sur gumroad.com/refunds et sélectionnez 'Demander un remboursement'.",
        "Les demandes de remboursement soumises dans les 14 jours suivant l'achat sont examinées par Gumroad. La décision de Gumroad est définitive et s'applique à tous les achats effectués via TJFit.",
        "Pour toute question concernant les remboursements, contactez le support acheteur de Gumroad sur gumroad.com/refunds. Pour le support général TJFit, écrivez à tjfit.org@gmail.com."
      ],
      lastUpdatedLabel: "Dernière mise à jour : 15 avril 2026"
    }
  };

  return copy[locale];
}
