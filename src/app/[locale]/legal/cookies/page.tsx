import type { Metadata } from "next";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

type SectionShape = {
  title: string;
  updated: string;
  intro: string;
  categories: Array<{ name: string; purpose: string; examples: string }>;
  thirdParties: Array<{ name: string; purpose: string }>;
  optOutHeading: string;
  optOutBody: string[];
};

const COPY: Record<Locale, SectionShape> = {
  en: {
    title: "Cookie Policy",
    updated: "Last updated: 2026-05-02",
    intro:
      "TJFit uses cookies and similar technologies (localStorage, sessionStorage) to make the site work, understand usage, and — once we run ads — measure marketing. This page explains what's stored and how to opt out.",
    categories: [
      { name: "Essential", purpose: "Login session, locale preference, checkout state, CSRF protection. Always on; the site won't work without these.", examples: "tjfit-session, tjfit-locale, sb-* (Supabase auth)" },
      { name: "Analytics", purpose: "Helps us see which features earn their keep. Off until you accept.", examples: "PostHog (ph_*), Microsoft Clarity (_clck, _clsk)" },
      { name: "Marketing", purpose: "Ad attribution and retargeting. Off by default; we don't run ads yet.", examples: "Reserved" }
    ],
    thirdParties: [
      { name: "Supabase", purpose: "Authentication, database, storage. Privacy policy at supabase.com/privacy." },
      { name: "Vercel", purpose: "Hosting, analytics (anonymous). Privacy at vercel.com/legal/privacy-policy." },
      { name: "Gumroad", purpose: "Payments + merchant of record. Privacy at gumroad.com/privacy." },
      { name: "Resend", purpose: "Transactional email. Privacy at resend.com/legal/privacy-policy." },
      { name: "OpenAI", purpose: "TJAI plan generation. Privacy at openai.com/policies/privacy-policy." },
      { name: "PostHog", purpose: "Product analytics (only with consent). EU-region. Privacy at posthog.com/privacy." },
      { name: "Sentry", purpose: "Error monitoring. Privacy at sentry.io/privacy." }
    ],
    optOutHeading: "How to opt out",
    optOutBody: [
      "Open the cookie banner anytime from the footer of any page (\"Cookie preferences\") and toggle Analytics or Marketing off.",
      "You can also clear cookies in your browser at any time. We'll re-prompt you for consent every 12 months."
    ]
  },
  tr: {
    title: "Çerez Politikası",
    updated: "Son güncelleme: 2026-05-02",
    intro:
      "TJFit; siteyi çalıştırmak, kullanımı anlamak ve — reklam yayınladığımızda — pazarlamayı ölçmek için çerezler ve benzer teknolojiler (localStorage, sessionStorage) kullanır. Bu sayfa neyin saklandığını ve nasıl iptal edileceğini açıklar.",
    categories: [
      { name: "Temel", purpose: "Oturum, dil tercihi, ödeme durumu, CSRF koruması. Hep açık; bunlar olmadan site çalışmaz.", examples: "tjfit-session, tjfit-locale, sb-* (Supabase auth)" },
      { name: "Analiz", purpose: "Hangi özelliklerin işe yaradığını görmemize yardımcı olur. Kabul edene kadar kapalı.", examples: "PostHog (ph_*), Microsoft Clarity (_clck, _clsk)" },
      { name: "Pazarlama", purpose: "Reklam atıfları ve yeniden hedefleme. Varsayılan kapalı; henüz reklam yayınlamıyoruz.", examples: "Ayrılmış" }
    ],
    thirdParties: [
      { name: "Supabase", purpose: "Kimlik doğrulama, veritabanı, depolama. supabase.com/privacy" },
      { name: "Vercel", purpose: "Barındırma, anonim analiz. vercel.com/legal/privacy-policy" },
      { name: "Gumroad", purpose: "Ödeme + merchant of record. gumroad.com/privacy" },
      { name: "Resend", purpose: "İşlemsel e-posta. resend.com/legal/privacy-policy" },
      { name: "OpenAI", purpose: "TJAI plan üretimi. openai.com/policies/privacy-policy" },
      { name: "PostHog", purpose: "Ürün analizi (yalnızca onayla). EU bölgesi. posthog.com/privacy" },
      { name: "Sentry", purpose: "Hata izleme. sentry.io/privacy" }
    ],
    optOutHeading: "Nasıl reddedilir",
    optOutBody: [
      "Herhangi bir sayfanın altbilgisinden çerez banner'ını istediğin zaman aç (\"Çerez tercihleri\") ve Analiz veya Pazarlama'yı kapat.",
      "Tarayıcında istediğin zaman çerezleri temizleyebilirsin. 12 ayda bir tekrar onay isteyeceğiz."
    ]
  },
  ar: {
    title: "سياسة ملفات تعريف الارتباط",
    updated: "آخر تحديث: 2026-05-02",
    intro:
      "تستخدم TJFit ملفات تعريف الارتباط وتقنيات مشابهة (localStorage، sessionStorage) لتشغيل الموقع وفهم الاستخدام — وعند تشغيل الإعلانات — قياس التسويق. تشرح هذه الصفحة ما يُحفظ وكيفية الانسحاب.",
    categories: [
      { name: "أساسي", purpose: "جلسة الدخول، تفضيل اللغة، حالة الدفع، حماية CSRF. دائماً مفعّل؛ بدونها لا يعمل الموقع.", examples: "tjfit-session، tjfit-locale، sb-* (Supabase auth)" },
      { name: "تحليلات", purpose: "يساعدنا في رؤية الميزات التي تستحق. متوقف حتى توافق.", examples: "PostHog (ph_*)، Microsoft Clarity (_clck، _clsk)" },
      { name: "تسويق", purpose: "إسناد الإعلانات وإعادة الاستهداف. متوقف افتراضياً.", examples: "محجوز" }
    ],
    thirdParties: [
      { name: "Supabase", purpose: "المصادقة وقاعدة البيانات والتخزين. supabase.com/privacy" },
      { name: "Vercel", purpose: "الاستضافة والتحليلات المجهولة. vercel.com/legal/privacy-policy" },
      { name: "Gumroad", purpose: "الدفع. gumroad.com/privacy" },
      { name: "Resend", purpose: "البريد المعاملاتي. resend.com/legal/privacy-policy" },
      { name: "OpenAI", purpose: "توليد خطط TJAI. openai.com/policies/privacy-policy" },
      { name: "PostHog", purpose: "تحليلات المنتج (بموافقة فقط). منطقة الاتحاد الأوروبي. posthog.com/privacy" },
      { name: "Sentry", purpose: "مراقبة الأخطاء. sentry.io/privacy" }
    ],
    optOutHeading: "كيفية الانسحاب",
    optOutBody: [
      "افتح شريط الموافقة في أي وقت من تذييل أي صفحة (\"تفضيلات ملفات تعريف الارتباط\") وأطفئ التحليلات أو التسويق.",
      "يمكنك أيضاً مسح ملفات تعريف الارتباط في متصفحك في أي وقت. سنطلب الموافقة مجدداً كل 12 شهراً."
    ]
  },
  es: {
    title: "Política de Cookies",
    updated: "Última actualización: 2026-05-02",
    intro:
      "TJFit usa cookies y tecnologías similares (localStorage, sessionStorage) para que el sitio funcione, entender el uso y — cuando lancemos anuncios — medir marketing. Esta página explica qué se guarda y cómo cancelar.",
    categories: [
      { name: "Esenciales", purpose: "Sesión, idioma, estado de checkout, protección CSRF. Siempre activas; sin ellas el sitio no funciona.", examples: "tjfit-session, tjfit-locale, sb-* (Supabase auth)" },
      { name: "Analítica", purpose: "Nos ayuda a ver qué funciones aportan valor. Desactivada hasta que aceptes.", examples: "PostHog (ph_*), Microsoft Clarity (_clck, _clsk)" },
      { name: "Marketing", purpose: "Atribución de anuncios y retargeting. Desactivado por defecto.", examples: "Reservado" }
    ],
    thirdParties: [
      { name: "Supabase", purpose: "Auth, base de datos, storage. supabase.com/privacy" },
      { name: "Vercel", purpose: "Hosting, analítica anónima. vercel.com/legal/privacy-policy" },
      { name: "Gumroad", purpose: "Pagos + merchant of record. gumroad.com/privacy" },
      { name: "Resend", purpose: "Email transaccional. resend.com/legal/privacy-policy" },
      { name: "OpenAI", purpose: "Generación de planes TJAI. openai.com/policies/privacy-policy" },
      { name: "PostHog", purpose: "Analítica de producto (solo con consentimiento). Región UE. posthog.com/privacy" },
      { name: "Sentry", purpose: "Monitoreo de errores. sentry.io/privacy" }
    ],
    optOutHeading: "Cómo cancelar",
    optOutBody: [
      "Abre el banner de cookies en cualquier momento desde el pie de página (\"Preferencias de cookies\") y desactiva Analítica o Marketing.",
      "También puedes limpiar cookies en tu navegador. Volveremos a pedir consentimiento cada 12 meses."
    ]
  },
  fr: {
    title: "Politique Cookies",
    updated: "Dernière mise à jour : 2026-05-02",
    intro:
      "TJFit utilise des cookies et technologies similaires (localStorage, sessionStorage) pour faire fonctionner le site, comprendre l'usage et — quand on lancera de la publicité — mesurer le marketing. Cette page explique ce qui est stocké et comment refuser.",
    categories: [
      { name: "Essentiels", purpose: "Session, langue, état checkout, protection CSRF. Toujours actifs ; sans eux le site ne fonctionne pas.", examples: "tjfit-session, tjfit-locale, sb-* (Supabase auth)" },
      { name: "Analytique", purpose: "Nous aide à voir quelles fonctions apportent de la valeur. Désactivé tant que tu n'acceptes pas.", examples: "PostHog (ph_*), Microsoft Clarity (_clck, _clsk)" },
      { name: "Marketing", purpose: "Attribution publicitaire et retargeting. Désactivé par défaut.", examples: "Réservé" }
    ],
    thirdParties: [
      { name: "Supabase", purpose: "Auth, base de données, stockage. supabase.com/privacy" },
      { name: "Vercel", purpose: "Hébergement, analytique anonyme. vercel.com/legal/privacy-policy" },
      { name: "Gumroad", purpose: "Paiements + merchant of record. gumroad.com/privacy" },
      { name: "Resend", purpose: "Email transactionnel. resend.com/legal/privacy-policy" },
      { name: "OpenAI", purpose: "Génération des plans TJAI. openai.com/policies/privacy-policy" },
      { name: "PostHog", purpose: "Analytique produit (avec consentement uniquement). Région UE. posthog.com/privacy" },
      { name: "Sentry", purpose: "Suivi des erreurs. sentry.io/privacy" }
    ],
    optOutHeading: "Comment refuser",
    optOutBody: [
      "Ouvre la bannière cookies à tout moment depuis le pied de page (\"Préférences cookies\") et désactive Analytique ou Marketing.",
      "Tu peux aussi vider les cookies dans ton navigateur à tout moment. Nous redemanderons consentement tous les 12 mois."
    ]
  }
};

const PAGE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: { title: "Cookie Policy | TJFit", description: "What TJFit stores in your browser, why, and how to opt out." },
  tr: { title: "Çerez Politikası | TJFit", description: "TJFit'in tarayıcında ne sakladığı, neden ve nasıl reddedileceği." },
  ar: { title: "سياسة ملفات تعريف الارتباط | TJFit", description: "ما تحفظه TJFit في متصفحك، لماذا، وكيفية الانسحاب." },
  es: { title: "Política de Cookies | TJFit", description: "Qué guarda TJFit en tu navegador, por qué y cómo cancelar." },
  fr: { title: "Politique Cookies | TJFit", description: "Ce que TJFit stocke dans ton navigateur, pourquoi et comment refuser." }
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const meta = PAGE_METADATA[locale] ?? PAGE_METADATA.en;
  return { title: meta.title, description: meta.description };
}

export default function CookiesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = COPY[locale] ?? COPY.en;
  return (
    <>
      <AmbientBackground variant="cyan" />
      <div className="relative z-[1] mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-xs text-faint">{copy.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-muted">{copy.intro}</p>

        <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-white">Categories</h2>
        <div className="mt-4 space-y-3">
          {copy.categories.map((c) => (
            <div key={c.name} className="rounded-xl border border-divider bg-surface p-4">
              <p className="text-sm font-semibold text-white">{c.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.purpose}</p>
              <p className="mt-2 text-xs text-faint">{c.examples}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-white">Sub-processors</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {copy.thirdParties.map((p) => (
            <li key={p.name} className="rounded-xl border border-divider bg-surface px-4 py-3">
              <span className="font-semibold text-white">{p.name}</span>
              <span className="ms-2 text-muted">{p.purpose}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-white">{copy.optOutHeading}</h2>
        <div className="mt-3 space-y-3 text-sm leading-[1.8] text-muted">
          {copy.optOutBody.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </>
  );
}
