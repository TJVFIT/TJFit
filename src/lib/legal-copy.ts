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
  const copy: Record<Locale, PolicyCopy> = {
    en: {
      badge: "Privacy Policy",
      title: "Privacy Policy",
      paragraphs: [
        "TJFit collects account details, progress data, and service activity required to provide coaching and program services.",
        "Payment processing is handled by third-party payment providers. We do not store full payment card details on TJFit servers.",
        "You can request access, correction, or deletion of your personal data by contacting support."
      ],
      lastUpdatedLabel: "Last updated: 2026-03-29"
    },
    tr: {
      badge: "Gizlilik Politikasi",
      title: "Gizlilik Politikasi",
      paragraphs: [
        "TJFit, koçluk ve program hizmetlerini sunmak icin gerekli hesap bilgilerini, ilerleme verilerini ve hizmet etkinligini toplar.",
        "Odeme islemleri ucuncu taraf odeme saglayicilari tarafindan yapilir. TJFit sunucularinda kart bilgileri tam olarak saklanmaz.",
        "Kisisel verilerine erisim, duzeltme veya silme talebi icin destek iletisime gecebilirsin."
      ],
      lastUpdatedLabel: "Son guncelleme: 2026-03-29"
    },
    ar: {
      badge: "سياسة الخصوصية",
      title: "سياسة الخصوصية",
      paragraphs: [
        "يجمع TJFit بيانات الحساب والتقدم ونشاط الخدمة اللازمة لتقديم خدمات التدريب والبرامج.",
        "تتم معالجة المدفوعات بواسطة مزودي دفع خارجيين، ولا نقوم بتخزين تفاصيل البطاقة الكاملة على خوادم TJFit.",
        "يمكنك طلب الوصول الى بياناتك الشخصية او تصحيحها او حذفها عبر التواصل مع الدعم."
      ],
      lastUpdatedLabel: "اخر تحديث: 2026-03-29"
    },
    es: {
      badge: "Politica de Privacidad",
      title: "Politica de Privacidad",
      paragraphs: [
        "TJFit recopila datos de cuenta, progreso y actividad necesarios para ofrecer coaching y programas.",
        "Los pagos son procesados por proveedores externos. No almacenamos los datos completos de la tarjeta en servidores de TJFit.",
        "Puedes solicitar acceso, correccion o eliminacion de tus datos personales contactando al soporte."
      ],
      lastUpdatedLabel: "Ultima actualizacion: 2026-03-29"
    },
    fr: {
      badge: "Politique de confidentialite",
      title: "Politique de confidentialite",
      paragraphs: [
        "TJFit collecte les informations de compte, de progression et d'activite necessaires pour fournir les services de coaching et de programmes.",
        "Le paiement est traite par des prestataires tiers. Nous ne stockons pas les donnees completes de carte sur les serveurs TJFit.",
        "Vous pouvez demander l'acces, la correction ou la suppression de vos donnees personnelles en contactant le support."
      ],
      lastUpdatedLabel: "Derniere mise a jour : 2026-03-29"
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
