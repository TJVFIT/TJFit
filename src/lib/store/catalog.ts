import type { Locale } from "@/lib/i18n";

export type StoreCategory = "all" | "cardio" | "strength" | "freeweights";
export type ProductId =
  | "treadmill"
  | "multi-press"
  | "lat-row"
  | "leg"
  | "pec"
  | "hip"
  | "rack"
  | "dumbbells"
  | "bench";

export type StoreProduct = {
  id: ProductId;
  category: Exclude<StoreCategory, "all">;
  quantity: number;
  unit: "units" | "kg";
  name: string;
  subtitle: string;
  requirements: string[];
};

export type StoreCopy = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  browse: string;
  packageCta: string;
  illustration: string;
  collection: string;
  collectionDescription: string;
  priceOnRequest: string;
  details: string;
  quoteItem: string;
  packageEyebrow: string;
  packageTitle: string;
  packageDescription: string;
  packageNote: string;
  packageContents: string;
  requestEyebrow: string;
  requestTitle: string;
  requestDescription: string;
  requestFor: string;
  fullPackage: string;
  customProject: string;
  location: string;
  locationPlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  openEmail: string;
  copyRequest: string;
  copied: string;
  copyFailed: string;
  emailHelp: string;
  emailFallback: string;
  requestPreview: string;
  contact: string;
  processEyebrow: string;
  processTitle: string;
  processSteps: Array<{ title: string; body: string }>;
  newOnly: string;
  quantityLabel: string;
  unitLabel: string;
  kgLabel: string;
  resultsLabel: string;
  backToCatalog: string;
  requestReady: string;
  categories: Record<StoreCategory, string>;
  products: StoreProduct[];
};

const PRODUCT_SPEC: Array<Pick<StoreProduct, "id" | "category" | "quantity" | "unit">> = [
  { id: "treadmill", category: "cardio", quantity: 2, unit: "units" },
  { id: "multi-press", category: "strength", quantity: 1, unit: "units" },
  { id: "lat-row", category: "strength", quantity: 1, unit: "units" },
  { id: "leg", category: "strength", quantity: 1, unit: "units" },
  { id: "pec", category: "strength", quantity: 1, unit: "units" },
  { id: "hip", category: "strength", quantity: 1, unit: "units" },
  { id: "rack", category: "freeweights", quantity: 1, unit: "units" },
  { id: "dumbbells", category: "freeweights", quantity: 390, unit: "kg" },
  { id: "bench", category: "freeweights", quantity: 2, unit: "units" },
];

function products(copy: Record<ProductId, Pick<StoreProduct, "name" | "subtitle" | "requirements">>): StoreProduct[] {
  return PRODUCT_SPEC.map((spec) => ({ ...spec, ...copy[spec.id] }));
}

export const STORE_EMAIL = "vexafit.co@gmail.com";

export const STORE_COPY: Record<Locale, StoreCopy> = {
  en: {
    eyebrow: "TJFit Equipment",
    title: "Make room",
    titleAccent: "for strength.",
    description: "A considered equipment plan for your residential gym. Explore the specifications, then shape a quote around your space.",
    browse: "Explore equipment",
    packageCta: "Request this package",
    illustration: "Equipment illustration. The exact model is subject to the written quote.",
    collection: "The equipment collection",
    collectionDescription: "Nine equipment rows, with quantities and requirements ready to discuss.",
    priceOnRequest: "Quote on request",
    details: "Requested specifications",
    quoteItem: "Request this equipment",
    packageEyebrow: "The residential gym package",
    packageTitle: "One complete equipment brief.",
    packageDescription: "Two treadmills, five combination machines, one rack, 390 kg of TPU dumbbells and two adjustable benches.",
    packageNote: "All equipment must be new. Equivalent brands may be proposed with the same functions; compact substitutes are excluded. Exact models, dumbbell progression and site access require confirmation.",
    packageContents: "Package contents",
    requestEyebrow: "Start your project",
    requestTitle: "Let’s define your gym.",
    requestDescription: "Choose your scope and add the site details. Prepare an email to request a written quote.",
    requestFor: "Equipment scope",
    fullPackage: "Full residential gym package",
    customProject: "Custom equipment project",
    location: "Project location",
    locationPlaceholder: "City, district and building details",
    notes: "Project notes",
    notesPlaceholder: "Room dimensions, access, intended use and equipment requirements",
    openEmail: "Open email draft",
    copyRequest: "Copy request",
    copied: "Request copied",
    copyFailed: "Copy was unavailable. Select and copy the preview below.",
    emailHelp: "This opens your email app. Review and send the draft there; nothing is submitted here.",
    emailFallback: "If no email app opens, copy the request and email it to",
    requestPreview: "Your request preview",
    contact: "Equipment enquiries",
    processEyebrow: "From brief to decision",
    processTitle: "Know what you’re choosing.",
    processSteps: [
      { title: "Define the space", body: "Share the location, room dimensions, access and intended use." },
      { title: "Confirm the equipment", body: "Request exact models, specifications and written warranty terms for shared residential use." },
      { title: "Review the complete quote", body: "Confirm VAT, freight, unloading, installation and the proposed delivery schedule before deciding." },
    ],
    newOnly: "New equipment requested",
    quantityLabel: "Package quantity",
    unitLabel: "units",
    kgLabel: "kg",
    resultsLabel: "equipment rows",
    backToCatalog: "Back to equipment",
    requestReady: "Your request is prepared. Review and send it from your email app.",
    categories: { all: "All equipment", cardio: "Cardio", strength: "Strength", freeweights: "Free weights & benches" },
    products: products({
      treadmill: {
        name: "Commercial treadmill",
        subtitle: "Two treadmills for the shared training space.",
        requirements: ["Request new commercial equipment with the exact model identified.", "Confirm written warranty coverage for shared residential use.", "Verify dimensions, electrical requirements and maximum user weight."],
      },
      "multi-press": {
        name: "Multi press",
        subtitle: "Chest, incline and shoulder press in one combination machine.",
        requirements: ["Confirm all three press functions on the proposed model.", "Request a new full-size combination machine; no compact substitute.", "Verify adjustments, resistance specification and installed dimensions."],
      },
      "lat-row": {
        name: "Lat pulldown / low row",
        subtitle: "Vertical pulls and seated low rows in one machine.",
        requirements: ["Confirm both lat pulldown and low row functions.", "Request a new full-size combination machine with the required handles.", "Verify resistance specification, adjustments and installed dimensions."],
      },
      leg: {
        name: "Leg extension / curl",
        subtitle: "Two leg movements in one combination machine.",
        requirements: ["Confirm both leg extension and leg curl functions.", "Request a new full-size combination machine with adjustable supports.", "Verify resistance specification, movement settings and installed dimensions."],
      },
      pec: {
        name: "Pec fly / rear delt",
        subtitle: "Chest fly and rear shoulder work in one machine.",
        requirements: ["Confirm both pec fly and rear delt functions.", "Request a new full-size combination machine with adjustable positioning.", "Verify resistance specification, range settings and installed dimensions."],
      },
      hip: {
        name: "Hip abductor / adductor",
        subtitle: "Inner and outer thigh movements in one machine.",
        requirements: ["Confirm both hip abduction and adduction functions.", "Request a new full-size combination machine with adjustable supports.", "Verify resistance specification, range settings and installed dimensions."],
      },
      rack: {
        name: "Equipment rack",
        subtitle: "One rack; exact format to be confirmed in the brief.",
        requirements: ["Confirm the intended rack type and exact new model.", "Verify capacity and compatibility with the intended equipment.", "Confirm dimensions, assembly and any anchoring requirements."],
      },
      dumbbells: {
        name: "TPU dumbbell set",
        subtitle: "390 kg total. Exact pairs and weight progression to be confirmed.",
        requirements: ["Request new TPU dumbbells; rubber is not a substitute.", "Confirm a total dumbbell weight of 390 kg.", "Confirm every pair and weight increment; the proposed 2.5–30 kg pairs are not yet agreed."],
      },
      bench: {
        name: "Adjustable FID bench",
        subtitle: "Two benches with flat, incline and decline positions.",
        requirements: ["Confirm flat, incline and decline positions on each bench.", "Request two new benches with the exact model identified.", "Verify adjustment locks, load rating and installed dimensions."],
      },
    }),
  },
  tr: {
    eyebrow: "TJFit Ekipman",
    title: "Güce",
    titleAccent: "yer açın.",
    description: "Yaşam alanınızın spor salonu için özenle hazırlanmış bir ekipman planı. İhtiyaçları inceleyin, alanınıza uygun teklif talebini oluşturun.",
    browse: "Ekipmanları keşfedin",
    packageCta: "Paket teklifi isteyin",
    illustration: "Temsili ekipman görseli. Kesin model yazılı teklifle belirlenir.",
    collection: "Ekipman seçkisi",
    collectionDescription: "Miktarları ve talep edilen özellikleriyle dokuz ekipman kalemi.",
    priceOnRequest: "Teklif üzerine",
    details: "Talep edilen özellikler",
    quoteItem: "Bu ekipman için teklif isteyin",
    packageEyebrow: "Site spor salonu paketi",
    packageTitle: "Eksiksiz bir ekipman kapsamı.",
    packageDescription: "İki koşu bandı, beş kombine makine, bir rack, toplam 390 kg TPU dambıl ve iki ayarlanabilir sehpa.",
    packageNote: "Tüm ekipmanlar sıfır olmalıdır. Aynı işlevleri sunan muadil markalar önerilebilir; kompakt alternatifler kapsam dışıdır. Kesin modeller, dambıl ağırlık dağılımı ve saha erişimi teyit edilmelidir.",
    packageContents: "Paket içeriği",
    requestEyebrow: "Projenize başlayın",
    requestTitle: "Spor salonunuzu birlikte tanımlayalım.",
    requestDescription: "Kapsamı seçin ve saha bilgilerini ekleyin. Yazılı teklif istemek için bir e-posta hazırlayın.",
    requestFor: "Ekipman kapsamı",
    fullPackage: "Tam site spor salonu paketi",
    customProject: "Özel ekipman projesi",
    location: "Proje konumu",
    locationPlaceholder: "İl, ilçe ve bina bilgileri",
    notes: "Proje notları",
    notesPlaceholder: "Alan ölçüleri, giriş koşulları, kullanım amacı ve ekipman ihtiyaçları",
    openEmail: "E-posta taslağını aç",
    copyRequest: "Talebi kopyala",
    copied: "Talep kopyalandı",
    copyFailed: "Kopyalama kullanılamıyor. Aşağıdaki ön izlemeyi seçip kopyalayın.",
    emailHelp: "E-posta uygulamanız açılır. Taslağı orada inceleyip gönderin; bu sayfadan talep gönderilmez.",
    emailFallback: "E-posta uygulaması açılmazsa talebi kopyalayıp şu adrese gönderin:",
    requestPreview: "Talep ön izlemesi",
    contact: "Ekipman talepleri",
    processEyebrow: "Kapsamdan karara",
    processTitle: "Her ayrıntıyı bilerek seçin.",
    processSteps: [
      { title: "Alanı tanımlayın", body: "Konumu, alan ölçülerini, giriş koşullarını ve kullanım amacını paylaşın." },
      { title: "Ekipmanı teyit edin", body: "Kesin modelleri, teknik özellikleri ve ortak site kullanımına ilişkin yazılı garanti koşullarını isteyin." },
      { title: "Toplam teklifi inceleyin", body: "Karar vermeden önce KDV, nakliye, indirme, kurulum ve önerilen teslimat takvimini teyit edin." },
    ],
    newOnly: "Sıfır ekipman talebi",
    quantityLabel: "Paket miktarı",
    unitLabel: "adet",
    kgLabel: "kg",
    resultsLabel: "ekipman kalemi",
    backToCatalog: "Ekipmanlara dön",
    requestReady: "Talebiniz hazırlandı. E-posta uygulamanızda inceleyip gönderin.",
    categories: { all: "Tüm ekipmanlar", cardio: "Kardiyo", strength: "Kuvvet", freeweights: "Serbest ağırlık ve sehpalar" },
    products: products({
      treadmill: {
        name: "Ticari koşu bandı",
        subtitle: "Ortak antrenman alanı için iki koşu bandı.",
        requirements: ["Kesin modeli belirtilmiş sıfır ticari ekipman talep edin.", "Ortak site kullanımının yazılı garanti kapsamına girdiğini teyit edin.", "Ölçüleri, elektrik gereksinimlerini ve azami kullanıcı ağırlığını doğrulayın."],
      },
      "multi-press": {
        name: "Çok işlevli press",
        subtitle: "Göğüs, eğimli göğüs ve omuz press işlevleri tek kombine makinede.",
        requirements: ["Önerilen modelde üç press işlevinin de bulunduğunu teyit edin.", "Sıfır, tam boy kombine makine talep edin; kompakt alternatif kabul edilmez.", "Ayarları, direnç özelliklerini ve kurulu ölçüleri doğrulayın."],
      },
      "lat-row": {
        name: "Lat pulldown / low row",
        subtitle: "Üstten çekiş ve oturarak alt çekiş tek makinede.",
        requirements: ["Hem lat pulldown hem low row işlevlerini teyit edin.", "Gerekli tutamaklarıyla sıfır, tam boy kombine makine talep edin.", "Direnç özelliklerini, ayarları ve kurulu ölçüleri doğrulayın."],
      },
      leg: {
        name: "Bacak açış / büküş",
        subtitle: "Leg extension ve leg curl tek kombine makinede.",
        requirements: ["Hem leg extension hem leg curl işlevlerini teyit edin.", "Ayarlanabilir destekleriyle sıfır, tam boy kombine makine talep edin.", "Direnç özelliklerini, hareket ayarlarını ve kurulu ölçüleri doğrulayın."],
      },
      pec: {
        name: "Pec fly / arka omuz",
        subtitle: "Göğüs açış ve arka omuz çalışması tek makinede.",
        requirements: ["Hem pec fly hem rear delt işlevlerini teyit edin.", "Konum ayarları bulunan sıfır, tam boy kombine makine talep edin.", "Direnç özelliklerini, hareket aralığını ve kurulu ölçüleri doğrulayın."],
      },
      hip: {
        name: "İç / dış bacak",
        subtitle: "Abduksiyon ve adduksiyon tek kombine makinede.",
        requirements: ["Hem kalça abduksiyon hem adduksiyon işlevlerini teyit edin.", "Ayarlanabilir destekleriyle sıfır, tam boy kombine makine talep edin.", "Direnç özelliklerini, hareket aralığını ve kurulu ölçüleri doğrulayın."],
      },
      rack: {
        name: "Ekipman rack’i",
        subtitle: "Bir rack; kesin tipi kapsam görüşmesinde teyit edilecektir.",
        requirements: ["İstenen rack tipini ve sıfır ürünün kesin modelini teyit edin.", "Kapasiteyi ve kullanılacak ekipmanla uyumluluğu doğrulayın.", "Ölçüleri, montajı ve gerekiyorsa sabitleme koşullarını teyit edin."],
      },
      dumbbells: {
        name: "TPU dambıl seti",
        subtitle: "Toplam 390 kg. Çiftler ve ağırlık dağılımı teyit edilecektir.",
        requirements: ["Sıfır TPU dambıl talep edin; kauçuk muadil kabul edilmez.", "Toplam dambıl ağırlığının 390 kg olduğunu teyit edin.", "Her çifti ve ağırlık artışını teyit edin; önerilen 2,5–30 kg çiftler henüz kesinleşmemiştir."],
      },
      bench: {
        name: "Ayarlanabilir FID sehpa",
        subtitle: "Düz, pozitif ve negatif eğimli konumları olan iki sehpa.",
        requirements: ["Her sehpada düz, pozitif ve negatif eğimli konumları teyit edin.", "Kesin modeli belirtilmiş iki sıfır sehpa talep edin.", "Ayar kilitlerini, taşıma kapasitesini ve kurulu ölçüleri doğrulayın."],
      },
    }),
  },
  ar: {
    eyebrow: "معدات TJFit",
    title: "مساحة",
    titleAccent: "تصنع القوة.",
    description: "خطة معدات مدروسة لصالة مجمّعك السكني. استعرض المواصفات وجهّز طلب عرض يناسب مساحتك.",
    browse: "استعرض المعدات",
    packageCta: "اطلب عرضًا لهذه الباقة",
    illustration: "رسم توضيحي للمعدات. يُحدّد الطراز الفعلي في عرض السعر المكتوب.",
    collection: "تشكيلة المعدات",
    collectionDescription: "تسعة بنود معدات، بكمياتها ومواصفاتها المطلوبة، جاهزة للنقاش.",
    priceOnRequest: "السعر حسب العرض",
    details: "المواصفات المطلوبة",
    quoteItem: "اطلب عرضًا لهذه المعدات",
    packageEyebrow: "باقة صالة المجمّع السكني",
    packageTitle: "قائمة معدات متكاملة.",
    packageDescription: "جهازا مشي، وخمسة أجهزة مزدوجة أو متعددة الوظائف، ورف واحد، و390 كجم من دمبل TPU، ومقعدان قابلان للتعديل.",
    packageNote: "يجب أن تكون جميع المعدات جديدة. يمكن اقتراح علامات مكافئة بالوظائف نفسها؛ البدائل المدمجة الصغيرة غير مقبولة. يجب تأكيد الطرازات وتدرّج أوزان الدمبل ومسار إدخال المعدات.",
    packageContents: "محتويات الباقة",
    requestEyebrow: "ابدأ مشروعك",
    requestTitle: "لنحدّد تفاصيل صالتك.",
    requestDescription: "اختر نطاق المعدات وأضف تفاصيل الموقع. جهّز رسالة لطلب عرض سعر مكتوب.",
    requestFor: "نطاق المعدات",
    fullPackage: "باقة صالة سكنية كاملة",
    customProject: "مشروع معدات مخصّص",
    location: "موقع المشروع",
    locationPlaceholder: "المدينة والمنطقة وتفاصيل المبنى",
    notes: "ملاحظات المشروع",
    notesPlaceholder: "أبعاد الغرفة ومسار الإدخال والاستخدام المقصود ومتطلبات المعدات",
    openEmail: "افتح مسودة البريد",
    copyRequest: "انسخ الطلب",
    copied: "تم نسخ الطلب",
    copyFailed: "تعذّر النسخ. حدّد نص المعاينة أدناه وانسخه.",
    emailHelp: "سيُفتح تطبيق بريدك. راجع المسودة وأرسلها من هناك؛ لا يُرسل أي طلب من هذه الصفحة.",
    emailFallback: "إذا لم يفتح تطبيق البريد، انسخ الطلب وأرسله إلى",
    requestPreview: "معاينة طلبك",
    contact: "استفسارات المعدات",
    processEyebrow: "من التفاصيل إلى القرار",
    processTitle: "اختر على أساس واضح.",
    processSteps: [
      { title: "عرّف المساحة", body: "شارك الموقع وأبعاد الغرفة ومسار إدخال المعدات والاستخدام المقصود." },
      { title: "أكّد المعدات", body: "اطلب الطرازات الدقيقة والمواصفات وشروط ضمان مكتوبة للاستخدام السكني المشترك." },
      { title: "راجع العرض الكامل", body: "أكّد ضريبة القيمة المضافة والشحن والتنزيل والتركيب والجدول المقترح للتسليم قبل القرار." },
    ],
    newOnly: "المطلوب معدات جديدة",
    quantityLabel: "كمية الباقة",
    unitLabel: "وحدة",
    kgLabel: "كجم",
    resultsLabel: "بنود معدات",
    backToCatalog: "العودة إلى المعدات",
    requestReady: "تم تجهيز طلبك. راجعه وأرسله من تطبيق بريدك.",
    categories: { all: "جميع المعدات", cardio: "الكارديو", strength: "القوة", freeweights: "الأوزان الحرة والمقاعد" },
    products: products({
      treadmill: {
        name: "جهاز مشي تجاري",
        subtitle: "جهازا مشي لمساحة التدريب المشتركة.",
        requirements: ["اطلب معدات تجارية جديدة مع تحديد الطراز الدقيق.", "أكّد خطيًا شمول الضمان للاستخدام السكني المشترك.", "تحقّق من الأبعاد ومتطلبات الكهرباء والوزن الأقصى للمستخدم."],
      },
      "multi-press": {
        name: "جهاز ضغط متعدد الوظائف",
        subtitle: "ضغط الصدر والمائل والأكتاف في جهاز واحد.",
        requirements: ["أكّد وظائف الضغط الثلاث في الطراز المقترح.", "اطلب جهازًا جديدًا بالحجم الكامل؛ لا بديل مدمجًا صغيرًا.", "تحقّق من الضبط ومواصفات المقاومة والأبعاد بعد التركيب."],
      },
      "lat-row": {
        name: "سحب علوي / تجديف سفلي",
        subtitle: "السحب العلوي والتجديف السفلي جالسًا في جهاز واحد.",
        requirements: ["أكّد وظيفتَي السحب العلوي والتجديف السفلي.", "اطلب جهازًا مزدوجًا جديدًا بالحجم الكامل مع المقابض المطلوبة.", "تحقّق من مواصفات المقاومة والضبط والأبعاد بعد التركيب."],
      },
      leg: {
        name: "تمديد / ثني الساقين",
        subtitle: "تمديد الساقين وثنيهما في جهاز مزدوج واحد.",
        requirements: ["أكّد وظيفتَي تمديد الساقين وثنيهما.", "اطلب جهازًا مزدوجًا جديدًا بالحجم الكامل مع دعامات قابلة للضبط.", "تحقّق من مواصفات المقاومة وإعدادات الحركة والأبعاد بعد التركيب."],
      },
      pec: {
        name: "تفتيح الصدر / الكتف الخلفي",
        subtitle: "تفتيح الصدر وتمرين الكتف الخلفي في جهاز واحد.",
        requirements: ["أكّد وظيفتَي تفتيح الصدر وتمرين الكتف الخلفي.", "اطلب جهازًا مزدوجًا جديدًا بالحجم الكامل مع وضعيات قابلة للضبط.", "تحقّق من مواصفات المقاومة ومدى الحركة والأبعاد بعد التركيب."],
      },
      hip: {
        name: "إبعاد / تقريب الفخذين",
        subtitle: "تمارين الفخذ الداخلية والخارجية في جهاز واحد.",
        requirements: ["أكّد وظيفتَي إبعاد الفخذين وتقريبهما.", "اطلب جهازًا مزدوجًا جديدًا بالحجم الكامل مع دعامات قابلة للضبط.", "تحقّق من مواصفات المقاومة ومدى الحركة والأبعاد بعد التركيب."],
      },
      rack: {
        name: "رف معدات",
        subtitle: "رف واحد؛ يُؤكّد نوعه الدقيق ضمن تفاصيل المشروع.",
        requirements: ["أكّد نوع الرف المطلوب والطراز الجديد الدقيق.", "تحقّق من الحمولة والتوافق مع المعدات المقصودة.", "أكّد الأبعاد والتجميع وأي متطلبات للتثبيت."],
      },
      dumbbells: {
        name: "مجموعة دمبل TPU",
        subtitle: "إجمالي 390 كجم. الأزواج وتدرّج الأوزان بانتظار التأكيد.",
        requirements: ["اطلب دمبل TPU جديدًا؛ المطاط ليس بديلًا مقبولًا.", "أكّد أن الوزن الإجمالي للدمبل 390 كجم.", "أكّد كل زوج وزيادة في الوزن؛ الأزواج المقترحة من 2.5 إلى 30 كجم لم تُعتمد بعد."],
      },
      bench: {
        name: "مقعد FID قابل للتعديل",
        subtitle: "مقعدان بوضعيات مسطحة ومائلة للأعلى وللأسفل.",
        requirements: ["أكّد الوضعيات المسطحة والمائلة للأعلى وللأسفل لكل مقعد.", "اطلب مقعدين جديدين مع تحديد الطراز الدقيق.", "تحقّق من أقفال الضبط والحمولة المسموحة والأبعاد بعد التركيب."],
      },
    }),
  },
  es: {
    eyebrow: "Equipamiento TJFit",
    title: "Haz espacio",
    titleAccent: "para la fuerza.",
    description: "Un plan de equipamiento pensado para tu gimnasio residencial. Explora las especificaciones y prepara una solicitud adaptada a tu espacio.",
    browse: "Explorar equipamiento",
    packageCta: "Solicitar este paquete",
    illustration: "Ilustración del equipo. El modelo exacto se determinará en el presupuesto escrito.",
    collection: "La colección de equipamiento",
    collectionDescription: "Nueve partidas de equipamiento, con cantidades y requisitos para concretar tu proyecto.",
    priceOnRequest: "Presupuesto a petición",
    details: "Especificaciones solicitadas",
    quoteItem: "Solicitar este equipo",
    packageEyebrow: "Paquete de gimnasio residencial",
    packageTitle: "Una propuesta de equipamiento completa.",
    packageDescription: "Dos cintas de correr, cinco máquinas combinadas, un rack, 390 kg de mancuernas de TPU y dos bancos ajustables.",
    packageNote: "Todo el equipamiento debe ser nuevo. Se pueden proponer marcas equivalentes con las mismas funciones; se excluyen las alternativas compactas. Hay que confirmar los modelos, la progresión de las mancuernas y el acceso al recinto.",
    packageContents: "Contenido del paquete",
    requestEyebrow: "Empieza tu proyecto",
    requestTitle: "Definamos tu gimnasio.",
    requestDescription: "Elige el alcance y añade los datos del recinto. Prepara un correo para solicitar un presupuesto escrito.",
    requestFor: "Alcance del equipamiento",
    fullPackage: "Paquete completo de gimnasio residencial",
    customProject: "Proyecto de equipamiento a medida",
    location: "Ubicación del proyecto",
    locationPlaceholder: "Ciudad, distrito y datos del edificio",
    notes: "Notas del proyecto",
    notesPlaceholder: "Dimensiones, acceso, uso previsto y requisitos del equipamiento",
    openEmail: "Abrir borrador de correo",
    copyRequest: "Copiar solicitud",
    copied: "Solicitud copiada",
    copyFailed: "No se pudo copiar. Selecciona y copia la vista previa de abajo.",
    emailHelp: "Se abrirá tu aplicación de correo. Revisa y envía el borrador allí; esta página no envía ninguna solicitud.",
    emailFallback: "Si no se abre el correo, copia la solicitud y envíala a",
    requestPreview: "Vista previa de tu solicitud",
    contact: "Consultas de equipamiento",
    processEyebrow: "De la idea a la decisión",
    processTitle: "Elige con toda la información.",
    processSteps: [
      { title: "Define el espacio", body: "Comparte la ubicación, las dimensiones, el acceso y el uso previsto." },
      { title: "Confirma los equipos", body: "Solicita modelos exactos, especificaciones y condiciones de garantía por escrito para uso residencial compartido." },
      { title: "Revisa el presupuesto completo", body: "Confirma IVA, transporte, descarga, instalación y calendario de entrega propuesto antes de decidir." },
    ],
    newOnly: "Se solicita equipamiento nuevo",
    quantityLabel: "Cantidad del paquete",
    unitLabel: "unidades",
    kgLabel: "kg",
    resultsLabel: "partidas de equipamiento",
    backToCatalog: "Volver al equipamiento",
    requestReady: "Tu solicitud está preparada. Revísala y envíala desde tu aplicación de correo.",
    categories: { all: "Todo", cardio: "Cardio", strength: "Fuerza", freeweights: "Pesos libres y bancos" },
    products: products({
      treadmill: {
        name: "Cinta de correr comercial",
        subtitle: "Dos cintas para el espacio de entrenamiento compartido.",
        requirements: ["Solicita equipos comerciales nuevos con el modelo exacto identificado.", "Confirma por escrito la cobertura de garantía para uso residencial compartido.", "Verifica dimensiones, requisitos eléctricos y peso máximo del usuario."],
      },
      "multi-press": {
        name: "Press múltiple",
        subtitle: "Press de pecho, inclinado y de hombros en una máquina combinada.",
        requirements: ["Confirma las tres funciones de press en el modelo propuesto.", "Solicita una máquina combinada nueva de tamaño completo; sin alternativa compacta.", "Verifica ajustes, especificaciones de resistencia y dimensiones una vez instalada."],
      },
      "lat-row": {
        name: "Jalón dorsal / remo bajo",
        subtitle: "Jalón vertical y remo bajo sentado en una sola máquina.",
        requirements: ["Confirma las funciones de jalón dorsal y remo bajo.", "Solicita una máquina combinada nueva de tamaño completo con los agarres necesarios.", "Verifica resistencia, ajustes y dimensiones una vez instalada."],
      },
      leg: {
        name: "Extensión / curl de piernas",
        subtitle: "Extensión y flexión de piernas en una máquina combinada.",
        requirements: ["Confirma las funciones de extensión y curl de piernas.", "Solicita una máquina combinada nueva de tamaño completo con apoyos ajustables.", "Verifica resistencia, ajustes de movimiento y dimensiones una vez instalada."],
      },
      pec: {
        name: "Pectoral / deltoides posterior",
        subtitle: "Aperturas de pecho y trabajo del hombro posterior en una máquina.",
        requirements: ["Confirma las funciones de aperturas pectorales y deltoides posterior.", "Solicita una máquina combinada nueva de tamaño completo con posición ajustable.", "Verifica resistencia, rango de movimiento y dimensiones una vez instalada."],
      },
      hip: {
        name: "Abductor / aductor",
        subtitle: "Trabajo interior y exterior de los muslos en una máquina.",
        requirements: ["Confirma las funciones de abducción y aducción de cadera.", "Solicita una máquina combinada nueva de tamaño completo con apoyos ajustables.", "Verifica resistencia, rango de movimiento y dimensiones una vez instalada."],
      },
      rack: {
        name: "Rack de equipamiento",
        subtitle: "Un rack; el formato exacto se confirmará en el proyecto.",
        requirements: ["Confirma el tipo de rack necesario y el modelo nuevo exacto.", "Verifica capacidad y compatibilidad con los equipos previstos.", "Confirma dimensiones, montaje y posibles requisitos de anclaje."],
      },
      dumbbells: {
        name: "Juego de mancuernas de TPU",
        subtitle: "390 kg en total. Pares y progresión de pesos por confirmar.",
        requirements: ["Solicita mancuernas nuevas de TPU; el caucho no es una alternativa.", "Confirma un peso total de mancuernas de 390 kg.", "Confirma cada par e incremento; los pares propuestos de 2,5 a 30 kg aún no están acordados."],
      },
      bench: {
        name: "Banco ajustable FID",
        subtitle: "Dos bancos con posiciones plana, inclinada y declinada.",
        requirements: ["Confirma las posiciones plana, inclinada y declinada en cada banco.", "Solicita dos bancos nuevos con el modelo exacto identificado.", "Verifica bloqueos de ajuste, carga admisible y dimensiones una vez instalado."],
      },
    }),
  },
  fr: {
    eyebrow: "Équipement TJFit",
    title: "Faites place",
    titleAccent: "à la force.",
    description: "Un plan d’équipement pensé pour votre salle de sport résidentielle. Explorez les spécifications et préparez une demande adaptée à votre espace.",
    browse: "Découvrir les équipements",
    packageCta: "Demander cet ensemble",
    illustration: "Illustration de l’équipement. Le modèle exact sera précisé dans le devis écrit.",
    collection: "La sélection d’équipements",
    collectionDescription: "Neuf postes d’équipement, avec leurs quantités et les exigences à préciser.",
    priceOnRequest: "Devis sur demande",
    details: "Spécifications demandées",
    quoteItem: "Demander cet équipement",
    packageEyebrow: "L’ensemble pour salle résidentielle",
    packageTitle: "Un cahier des charges complet.",
    packageDescription: "Deux tapis de course, cinq machines combinées, un rack, 390 kg d’haltères en TPU et deux bancs réglables.",
    packageNote: "Tous les équipements doivent être neufs. Des marques équivalentes peuvent être proposées avec les mêmes fonctions ; les alternatives compactes sont exclues. Modèles, progression des haltères et accès au site restent à confirmer.",
    packageContents: "Composition de l’ensemble",
    requestEyebrow: "Lancez votre projet",
    requestTitle: "Définissons votre salle.",
    requestDescription: "Choisissez le périmètre et ajoutez les informations du site. Préparez un e-mail pour demander un devis écrit.",
    requestFor: "Périmètre de l’équipement",
    fullPackage: "Ensemble complet pour salle résidentielle",
    customProject: "Projet d’équipement sur mesure",
    location: "Lieu du projet",
    locationPlaceholder: "Ville, quartier et informations sur le bâtiment",
    notes: "Notes du projet",
    notesPlaceholder: "Dimensions, accès, usage prévu et besoins en équipement",
    openEmail: "Ouvrir le brouillon d’e-mail",
    copyRequest: "Copier la demande",
    copied: "Demande copiée",
    copyFailed: "La copie est indisponible. Sélectionnez et copiez l’aperçu ci-dessous.",
    emailHelp: "Votre messagerie s’ouvrira. Vérifiez et envoyez le brouillon depuis celle-ci ; cette page n’envoie aucune demande.",
    emailFallback: "Si la messagerie ne s’ouvre pas, copiez la demande et envoyez-la à",
    requestPreview: "Aperçu de votre demande",
    contact: "Demandes d’équipement",
    processEyebrow: "Du projet à la décision",
    processTitle: "Choisissez en connaissance de cause.",
    processSteps: [
      { title: "Définir l’espace", body: "Partagez le lieu, les dimensions, les conditions d’accès et l’usage prévu." },
      { title: "Confirmer les équipements", body: "Demandez les modèles exacts, les spécifications et les conditions écrites de garantie pour un usage résidentiel partagé." },
      { title: "Examiner le devis complet", body: "Confirmez la TVA, le transport, le déchargement, l’installation et le calendrier de livraison proposé avant de décider." },
    ],
    newOnly: "Équipements neufs demandés",
    quantityLabel: "Quantité dans l’ensemble",
    unitLabel: "unités",
    kgLabel: "kg",
    resultsLabel: "postes d’équipement",
    backToCatalog: "Retour aux équipements",
    requestReady: "Votre demande est préparée. Vérifiez-la et envoyez-la depuis votre messagerie.",
    categories: { all: "Tous les équipements", cardio: "Cardio", strength: "Musculation", freeweights: "Poids libres et bancs" },
    products: products({
      treadmill: {
        name: "Tapis de course professionnel",
        subtitle: "Deux tapis pour l’espace d’entraînement partagé.",
        requirements: ["Demandez des équipements professionnels neufs avec le modèle exact précisé.", "Confirmez par écrit la garantie pour un usage résidentiel partagé.", "Vérifiez les dimensions, les besoins électriques et le poids maximal de l’utilisateur."],
      },
      "multi-press": {
        name: "Presse multi-positions",
        subtitle: "Développé couché, incliné et épaules sur une machine combinée.",
        requirements: ["Confirmez les trois fonctions de développé sur le modèle proposé.", "Demandez une machine combinée neuve de taille complète, sans alternative compacte.", "Vérifiez les réglages, la résistance et les dimensions une fois installée."],
      },
      "lat-row": {
        name: "Tirage vertical / horizontal bas",
        subtitle: "Tirage vertical et tirage horizontal bas assis sur une machine.",
        requirements: ["Confirmez les fonctions de tirage vertical et horizontal bas.", "Demandez une machine combinée neuve de taille complète avec les poignées nécessaires.", "Vérifiez la résistance, les réglages et les dimensions une fois installée."],
      },
      leg: {
        name: "Extension / flexion des jambes",
        subtitle: "Leg extension et leg curl sur une machine combinée.",
        requirements: ["Confirmez les fonctions d’extension et de flexion des jambes.", "Demandez une machine combinée neuve de taille complète avec des appuis réglables.", "Vérifiez la résistance, les réglages du mouvement et les dimensions installées."],
      },
      pec: {
        name: "Pectoraux / deltoïdes arrière",
        subtitle: "Écartés pectoraux et travail des épaules arrière sur une machine.",
        requirements: ["Confirmez les fonctions pec fly et deltoïdes arrière.", "Demandez une machine combinée neuve de taille complète avec un positionnement réglable.", "Vérifiez la résistance, l’amplitude et les dimensions une fois installée."],
      },
      hip: {
        name: "Abducteurs / adducteurs",
        subtitle: "Travail de l’intérieur et de l’extérieur des cuisses sur une machine.",
        requirements: ["Confirmez les fonctions d’abduction et d’adduction des hanches.", "Demandez une machine combinée neuve de taille complète avec des appuis réglables.", "Vérifiez la résistance, l’amplitude et les dimensions une fois installée."],
      },
      rack: {
        name: "Rack d’équipement",
        subtitle: "Un rack ; son type exact reste à confirmer dans le projet.",
        requirements: ["Confirmez le type de rack souhaité et le modèle neuf exact.", "Vérifiez la capacité et la compatibilité avec les équipements prévus.", "Confirmez les dimensions, le montage et les éventuels besoins d’ancrage."],
      },
      dumbbells: {
        name: "Jeu d’haltères en TPU",
        subtitle: "390 kg au total. Paires et progression des poids à confirmer.",
        requirements: ["Demandez des haltères neufs en TPU ; le caoutchouc n’est pas un substitut.", "Confirmez un poids total d’haltères de 390 kg.", "Confirmez chaque paire et chaque incrément ; les paires proposées de 2,5 à 30 kg ne sont pas encore validées."],
      },
      bench: {
        name: "Banc réglable FID",
        subtitle: "Deux bancs avec positions à plat, inclinée et déclinée.",
        requirements: ["Confirmez les positions à plat, inclinée et déclinée sur chaque banc.", "Demandez deux bancs neufs avec le modèle exact précisé.", "Vérifiez les verrouillages, la charge admissible et les dimensions installées."],
      },
    }),
  },
};

const REQUEST_COPY: Record<Locale, {
  subject: string;
  unitSingular: string;
  introduction: string;
  unconfirmed: string;
  custom: string;
  quote: string;
  warranty: string;
  access: string;
  closing: string;
}> = {
  en: {
    subject: "Equipment quote request",
    unitSingular: "unit",
    introduction: "Please provide a written quote for the following equipment scope:",
    unconfirmed: "To be confirmed",
    custom: "Please confirm the equipment list and quantities from the project notes before quoting.",
    quote: "Please identify every exact model and provide an itemised delivered quote including VAT, freight, unloading and installation, with any other charges shown separately. All equipment must be new. Equivalent brands are acceptable only with the same requested functions; no compact substitutes.",
    warranty: "Please confirm in writing the warranty terms for shared residential use, service arrangements and the proposed delivery schedule.",
    access: "Please confirm site access, door and route dimensions, lifting or disassembly needs and installation conditions before finalising the quote.",
    closing: "This is a request for a quote, not an order or payment authorisation.",
  },
  tr: {
    subject: "Ekipman teklif talebi",
    unitSingular: "adet",
    introduction: "Aşağıdaki ekipman kapsamı için yazılı teklifinizi rica ederim:",
    unconfirmed: "Teyit edilecek",
    custom: "Tekliften önce proje notlarından ekipman listesini ve miktarları teyit etmenizi rica ederim.",
    quote: "Lütfen her kalemin kesin modelini belirtin. KDV, nakliye, indirme ve kurulum dâhil kalem bazında teslim teklifi sunun; diğer giderleri ayrıca gösterin. Tüm ekipmanlar sıfır olmalıdır. Muadil markalar yalnızca aynı talep edilen işlevlerle kabul edilebilir; kompakt alternatifler kabul edilmez.",
    warranty: "Ortak site kullanımına ilişkin garanti koşullarını, servis düzenini ve önerilen teslimat takvimini yazılı olarak teyit etmenizi rica ederim.",
    access: "Teklif kesinleşmeden önce saha erişimini, kapı ve taşıma güzergâhı ölçülerini, kaldırma veya söküm ihtiyaçlarını ve kurulum koşullarını teyit edin.",
    closing: "Bu ileti bir teklif talebidir; sipariş veya ödeme yetkisi değildir.",
  },
  ar: {
    subject: "طلب عرض سعر للمعدات",
    unitSingular: "وحدة",
    introduction: "يرجى تقديم عرض سعر مكتوب لنطاق المعدات التالي:",
    unconfirmed: "يُؤكّد لاحقًا",
    custom: "يرجى تأكيد قائمة المعدات وكمياتها من ملاحظات المشروع قبل إعداد العرض.",
    quote: "يرجى تحديد الطراز الدقيق لكل بند وتقديم عرض مفصّل للتسليم يشمل ضريبة القيمة المضافة والشحن والتنزيل والتركيب، مع إظهار أي رسوم أخرى بشكل منفصل. يجب أن تكون جميع المعدات جديدة. تُقبل العلامات المكافئة فقط بالوظائف المطلوبة نفسها؛ لا تُقبل البدائل المدمجة الصغيرة.",
    warranty: "يرجى تأكيد شروط الضمان للاستخدام السكني المشترك وترتيبات الخدمة والجدول المقترح للتسليم خطيًا.",
    access: "يرجى تأكيد مسار إدخال المعدات وأبعاد الأبواب والممرات ومتطلبات الرفع أو الفك وشروط التركيب قبل اعتماد العرض النهائي.",
    closing: "هذه الرسالة طلب عرض سعر، وليست طلب شراء أو تفويضًا بالدفع.",
  },
  es: {
    subject: "Solicitud de presupuesto de equipamiento",
    unitSingular: "unidad",
    introduction: "Solicito un presupuesto escrito para el siguiente equipamiento:",
    unconfirmed: "Por confirmar",
    custom: "Confirmen la lista de equipos y las cantidades a partir de las notas del proyecto antes de presupuestar.",
    quote: "Indiquen cada modelo exacto y faciliten un presupuesto desglosado de entrega que incluya IVA, transporte, descarga e instalación, con cualquier otro cargo por separado. Todo el equipamiento debe ser nuevo. Solo se aceptan marcas equivalentes con las mismas funciones solicitadas; no se aceptan alternativas compactas.",
    warranty: "Confirmen por escrito las condiciones de garantía para uso residencial compartido, el servicio técnico y el calendario de entrega propuesto.",
    access: "Confirmen el acceso al recinto, las dimensiones de puertas y recorridos, las necesidades de elevación o desmontaje y las condiciones de instalación antes del presupuesto definitivo.",
    closing: "Esta es una solicitud de presupuesto, no un pedido ni una autorización de pago.",
  },
  fr: {
    subject: "Demande de devis d’équipement",
    unitSingular: "unité",
    introduction: "Merci de fournir un devis écrit pour les équipements suivants :",
    unconfirmed: "À confirmer",
    custom: "Merci de confirmer la liste des équipements et les quantités à partir des notes du projet avant de chiffrer.",
    quote: "Merci de préciser chaque modèle exact et de fournir un devis détaillé livré, TVA, transport, déchargement et installation inclus, en indiquant séparément tout autre frais. Tous les équipements doivent être neufs. Les marques équivalentes sont acceptables uniquement avec les mêmes fonctions demandées ; aucune alternative compacte.",
    warranty: "Merci de confirmer par écrit les conditions de garantie pour un usage résidentiel partagé, le service après-vente et le calendrier de livraison proposé.",
    access: "Merci de confirmer l’accès au site, les dimensions des portes et passages, les besoins de levage ou de démontage et les conditions d’installation avant de finaliser le devis.",
    closing: "Il s’agit d’une demande de devis, sans commande ni autorisation de paiement.",
  },
};

export function buildQuoteRequest(
  locale: Locale,
  selection: ProductId | "package" | "custom",
  location: string,
  notes: string,
): { subject: string; body: string; mailto: string } {
  const copy = STORE_COPY[locale];
  const request = REQUEST_COPY[locale];
  const selectedProducts = selection === "package"
    ? copy.products
    : copy.products.filter((product) => product.id === selection);
  const scope = selection === "package"
    ? copy.fullPackage
    : selection === "custom"
      ? copy.customProject
      : selectedProducts[0].name;
  const equipment = selectedProducts.map((product, index) => {
    const unit = product.unit === "kg"
      ? copy.kgLabel
      : product.quantity === 1 ? request.unitSingular : copy.unitLabel;
    return `${index + 1}. ${product.name} — ${product.quantity} ${unit}\n${product.subtitle}\n${product.requirements.map((requirement) => `- ${requirement}`).join("\n")}`;
  }).join("\n\n");
  const subject = `${request.subject} | TJFit | ${scope}`;
  const body = [
    request.introduction,
    `${copy.requestFor}: ${scope}`,
    `${copy.location}: ${location.trim() || request.unconfirmed}`,
    equipment || request.custom,
    `${copy.notes}:\n${notes.trim() || request.unconfirmed}`,
    request.quote,
    request.warranty,
    request.access,
    request.closing,
  ].join("\n\n");
  const query = new URLSearchParams({ subject, body }).toString().replace(/\+/g, "%20");
  return { subject, body, mailto: `mailto:${STORE_EMAIL}?${query}` };
}
