import Link from "next/link";
import { BecomeCoachApplicationForm } from "@/components/become-coach-application-form";
import { requireLocaleParam } from "@/lib/require-locale";
import type { Locale } from "@/lib/i18n";

const COPY: Record<Locale, {
  badge: string;
  hero: string;
  heroSub: string;
  applyNow: string;
  b1title: string; b1sub: string;
  b2title: string; b2sub: string;
  b3title: string; b3sub: string;
  howTitle: string;
  steps: Array<{ num: string; title: string; sub: string }>;
  createTitle: string;
  c1: string; c1sub: string;
  c2: string; c2sub: string;
  reqTitle: string;
  reqs: string[];
  formTitle: string;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
}> = {
  en: {
    badge: "FOR FITNESS PROFESSIONALS",
    hero: "Turn Your Expertise Into Income.",
    heroSub: "Publish your programs on TJFit and reach a global fitness community across 5 languages.",
    applyNow: "Apply Now ↓",
    b1title: "🌍 5 Languages", b1sub: "English, Turkish, Arabic, Spanish, French",
    b2title: "📈 Growing Platform", b2sub: "Members actively buying daily",
    b3title: "💰 You Set the Price", b3sub: "We handle payments and delivery",
    howTitle: "How It Works",
    steps: [
      { num: "01", title: "Apply", sub: "Complete the short application below" },
      { num: "02", title: "Get Approved", sub: "Team reviews within 48 hours" },
      { num: "03", title: "Upload", sub: "Create your program in our builder" },
      { num: "04", title: "Earn", sub: "Paid on every sale, monthly" }
    ],
    createTitle: "What You Can Create",
    c1: "🏋️ Training Programs", c1sub: "12-week structured workout plans",
    c2: "🥗 Diet Plans", c2sub: "Meal plans with macros and shopping lists",
    reqTitle: "Requirements",
    reqs: [
      "✓ Certified personal trainer or nutrition qualification",
      "✓ Minimum 2 years coaching experience",
      "✓ Commits to creating quality content",
      "✗ No certification = no approval"
    ],
    formTitle: "Apply to Become a Coach",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "What % does TJFit take?", a: "TJFit takes a platform fee. You keep the majority. Exact % shared upon approval." },
      { q: "Who handles payments?", a: "TJFit via Paddle. Earnings paid monthly to your bank account." },
      { q: "Can I publish in multiple languages?", a: "Yes — any of our 5 supported languages." }
    ]
  },
  tr: {
    badge: "FİTNESS PROFESYONELLERİ İÇİN",
    hero: "Uzmanlığınızı Gelire Dönüştürün.",
    heroSub: "TJFit'te programlarınızı yayınlayın ve 5 dilde küresel fitness topluluğuna ulaşın.",
    applyNow: "Hemen Başvur ↓",
    b1title: "🌍 5 Dil", b1sub: "Türkçe, İngilizce, Arapça, İspanyolca, Fransızca",
    b2title: "📈 Büyüyen Platform", b2sub: "Üyeler her gün aktif olarak satın alıyor",
    b3title: "💰 Fiyatı Siz Belirleyin", b3sub: "Ödemeleri ve teslimatı biz hallederiz",
    howTitle: "Nasıl Çalışır",
    steps: [
      { num: "01", title: "Başvur", sub: "Aşağıdaki kısa formu doldurun" },
      { num: "02", title: "Onay Al", sub: "Ekibimiz 48 saat içinde inceler" },
      { num: "03", title: "Yükle", sub: "Programınızı oluşturucu ile oluşturun" },
      { num: "04", title: "Kazan", sub: "Her satışta aylık ödeme alırsınız" }
    ],
    createTitle: "Ne Oluşturabilirsiniz",
    c1: "🏋️ Antrenman Programları", c1sub: "12 haftalık yapılandırılmış egzersiz planları",
    c2: "🥗 Diyet Planları", c2sub: "Makrolar ve alışveriş listeli beslenme planları",
    reqTitle: "Gereksinimler",
    reqs: [
      "✓ Sertifikalı personal trainer veya beslenme uzmanı",
      "✓ En az 2 yıl koçluk deneyimi",
      "✓ Kaliteli içerik oluşturmaya bağlılık",
      "✗ Sertifika yok = onay yok"
    ],
    formTitle: "Koç Başvurusu",
    faqTitle: "Sıkça Sorulan Sorular",
    faqs: [
      { q: "TJFit ne kadar kesinti yapar?", a: "TJFit platform ücreti alır. Büyük çoğunluğu siz alırsınız. Kesin oran onay sonrası paylaşılır." },
      { q: "Ödemeleri kim yönetir?", a: "TJFit, Paddle aracılığıyla. Kazançlar aylık banka hesabınıza yatırılır." },
      { q: "Birden fazla dilde yayınlayabilir miyim?", a: "Evet — desteklenen 5 dilden herhangi birinde." }
    ]
  },
  ar: {
    badge: "للمحترفين في اللياقة البدنية",
    hero: "حوّل خبرتك إلى دخل.",
    heroSub: "انشر برامجك على TJFit وتواصل مع مجتمع لياقة عالمي بـ 5 لغات.",
    applyNow: "قدّم الآن ↓",
    b1title: "🌍 5 لغات", b1sub: "العربية والإنجليزية والتركية والإسبانية والفرنسية",
    b2title: "📈 منصة متنامية", b2sub: "أعضاء يشترون بنشاط يومياً",
    b3title: "💰 أنت تحدد السعر", b3sub: "نحن نتولى المدفوعات والتسليم",
    howTitle: "كيف يعمل",
    steps: [
      { num: "01", title: "قدّم طلبك", sub: "أكمل النموذج القصير أدناه" },
      { num: "02", title: "احصل على الموافقة", sub: "يراجع الفريق خلال 48 ساعة" },
      { num: "03", title: "ارفع المحتوى", sub: "أنشئ برنامجك في أداة الإنشاء" },
      { num: "04", title: "اكسب", sub: "تُدفع على كل عملية بيع، شهرياً" }
    ],
    createTitle: "ما يمكنك إنشاؤه",
    c1: "🏋️ برامج التدريب", c1sub: "خطط تمرين منظمة لمدة 12 أسبوعاً",
    c2: "🥗 خطط الحمية", c2sub: "خطط وجبات مع المغذيات وقوائم التسوق",
    reqTitle: "المتطلبات",
    reqs: [
      "✓ مدرب شخصي معتمد أو مؤهل تغذية",
      "✓ خبرة تدريب لا تقل عن سنتين",
      "✓ الالتزام بإنشاء محتوى عالي الجودة",
      "✗ لا شهادة = لا موافقة"
    ],
    formTitle: "التقدم لتصبح مدرباً",
    faqTitle: "أسئلة متكررة",
    faqs: [
      { q: "ما نسبة رسوم TJFit؟", a: "TJFit تأخذ رسوم منصة. الأغلبية لك. النسبة الدقيقة تُشارك عند الموافقة." },
      { q: "من يتولى المدفوعات؟", a: "TJFit عبر Paddle. الأرباح تُدفع شهرياً." },
      { q: "هل يمكنني النشر بعدة لغات؟", a: "نعم — أي من اللغات الخمس المدعومة." }
    ]
  },
  es: {
    badge: "PARA PROFESIONALES DEL FITNESS",
    hero: "Convierte Tu Experiencia en Ingresos.",
    heroSub: "Publica tus programas en TJFit y llega a una comunidad global en 5 idiomas.",
    applyNow: "Solicitar Ahora ↓",
    b1title: "🌍 5 Idiomas", b1sub: "Español, Inglés, Turco, Árabe, Francés",
    b2title: "📈 Plataforma en Crecimiento", b2sub: "Miembros comprando activamente cada día",
    b3title: "💰 Tú Fijas el Precio", b3sub: "Nosotros gestionamos pagos y entrega",
    howTitle: "Cómo Funciona",
    steps: [
      { num: "01", title: "Solicita", sub: "Completa el formulario corto" },
      { num: "02", title: "Aprobación", sub: "El equipo revisa en 48 horas" },
      { num: "03", title: "Sube", sub: "Crea tu programa con nuestro editor" },
      { num: "04", title: "Gana", sub: "Pagado en cada venta, mensualmente" }
    ],
    createTitle: "Qué Puedes Crear",
    c1: "🏋️ Programas de Entrenamiento", c1sub: "Planes de entrenamiento estructurados de 12 semanas",
    c2: "🥗 Planes de Dieta", c2sub: "Planes de comidas con macros y listas de compras",
    reqTitle: "Requisitos",
    reqs: [
      "✓ Entrenador personal certificado o cualificación nutricional",
      "✓ Mínimo 2 años de experiencia en coaching",
      "✓ Compromiso con contenido de calidad",
      "✗ Sin certificación = sin aprobación"
    ],
    formTitle: "Solicita Ser Coach",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
      { q: "¿Qué % toma TJFit?", a: "TJFit cobra una tarifa de plataforma. Tú te quedas la mayoría. El % exacto se comparte tras la aprobación." },
      { q: "¿Quién gestiona los pagos?", a: "TJFit a través de Paddle. Ganancias pagadas mensualmente." },
      { q: "¿Puedo publicar en varios idiomas?", a: "Sí, en cualquiera de los 5 idiomas admitidos." }
    ]
  },
  fr: {
    badge: "POUR LES PROFESSIONNELS DU FITNESS",
    hero: "Transformez Votre Expertise en Revenus.",
    heroSub: "Publiez vos programmes sur TJFit et rejoignez une communauté mondiale en 5 langues.",
    applyNow: "Postuler Maintenant ↓",
    b1title: "🌍 5 Langues", b1sub: "Français, Anglais, Turc, Arabe, Espagnol",
    b2title: "📈 Plateforme en Croissance", b2sub: "Des membres achètent activement chaque jour",
    b3title: "💰 Vous Fixez le Prix", b3sub: "Nous gérons les paiements et la livraison",
    howTitle: "Comment Ça Marche",
    steps: [
      { num: "01", title: "Postulez", sub: "Remplissez le formulaire ci-dessous" },
      { num: "02", title: "Validation", sub: "L'équipe examine sous 48h" },
      { num: "03", title: "Publiez", sub: "Créez votre programme avec notre outil" },
      { num: "04", title: "Gagnez", sub: "Payé à chaque vente, mensuellement" }
    ],
    createTitle: "Ce Que Vous Pouvez Créer",
    c1: "🏋️ Programmes d'Entraînement", c1sub: "Plans d'entraînement structurés sur 12 semaines",
    c2: "🥗 Plans Alimentaires", c2sub: "Plans de repas avec macros et listes de courses",
    reqTitle: "Conditions",
    reqs: [
      "✓ Coach personnel certifié ou qualification en nutrition",
      "✓ Minimum 2 ans d'expérience en coaching",
      "✓ Engagement à créer du contenu de qualité",
      "✗ Pas de certification = pas d'approbation"
    ],
    formTitle: "Postuler pour Devenir Coach",
    faqTitle: "Questions Fréquentes",
    faqs: [
      { q: "Quel % prend TJFit ?", a: "TJFit prend des frais de plateforme. Vous gardez la majorité. Le % exact est partagé après approbation." },
      { q: "Qui gère les paiements ?", a: "TJFit via Paddle. Les gains sont versés mensuellement." },
      { q: "Puis-je publier en plusieurs langues ?", a: "Oui — dans l'une de nos 5 langues prises en charge." }
    ]
  }
};

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const c = COPY[locale] ?? COPY.en;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.10)_0%,transparent_72%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            {c.badge}
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-5xl">
            {c.hero}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{c.heroSub}</p>
          <a
            href="#apply"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-bold text-[#09090B] transition hover:bg-white"
          >
            {c.applyNow}
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: c.b1title, sub: c.b1sub },
            { title: c.b2title, sub: c.b2sub },
            { title: c.b3title, sub: c.b3sub }
          ].map((b) => (
            <div key={b.title} className="rounded-2xl border border-divider bg-surface p-6 text-center">
              <p className="text-lg font-semibold text-white">{b.title}</p>
              <p className="mt-2 text-sm text-muted">{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">{c.howTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {c.steps.map((step) => (
            <div key={step.num} className="rounded-2xl border border-divider bg-surface p-5 text-center">
              <p className="text-3xl font-extrabold text-accent opacity-60">{step.num}</p>
              <p className="mt-2 font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Can Create */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">{c.createTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-divider bg-surface p-6">
            <p className="text-lg font-semibold text-white">{c.c1}</p>
            <p className="mt-2 text-sm text-muted">{c.c1sub}</p>
          </div>
          <div className="rounded-2xl border border-divider bg-surface p-6">
            <p className="text-lg font-semibold text-white">{c.c2}</p>
            <p className="mt-2 text-sm text-muted">{c.c2sub}</p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-2xl border border-divider bg-surface p-6">
          <h2 className="text-lg font-semibold text-white">{c.reqTitle}</h2>
          <ul className="mt-4 space-y-3">
            {c.reqs.map((req) => (
              <li key={req} className={`text-sm ${req.startsWith("✗") ? "text-faint" : "text-bright"}`}>
                {req}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-divider bg-surface p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            {c.badge}
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white">{c.formTitle}</h2>
          <div className="mt-6">
            <BecomeCoachApplicationForm locale={locale} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-6 pb-20 sm:px-6">
        <h2 className="text-xl font-bold text-white">{c.faqTitle}</h2>
        <div className="mt-5 space-y-4">
          {c.faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-divider bg-surface p-5">
              <summary className="cursor-pointer font-semibold text-white">{faq.q}</summary>
              <p className="mt-3 text-sm text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/programs`}
            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/50"
          >
            Browse Programs
          </Link>
          <Link
            href={`/${locale}/coaches`}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-bright transition hover:border-white/25"
          >
            Meet the Coaches
          </Link>
        </div>
      </section>
    </div>
  );
}
