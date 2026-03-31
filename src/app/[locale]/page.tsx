import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  const copy = {
    en: {
      welcome: "Welcome to TJFIT",
      headline: "A premium digital fitness platform built to turn motivation into measurable results.",
      summary:
        "TJFIT combines elite-ready training programs, practical nutrition systems, and a focused community experience so users can start quickly, stay consistent, and see real progress. Every section is designed to reduce decision fatigue, increase confidence, and make healthy routines easier to maintain long-term.",
      categoriesTitle: "Platform Categories",
      categoriesSubtitle: "Move step by step. Each category has a clear purpose.",
      viewCategory: "Open",
      primaryCta: "Explore Programs",
      secondaryCta: "Create Account"
    },
    tr: {
      welcome: "TJFIT'e Hos Geldiniz",
      headline: "Motivasyonu olculebilir sonuclara donusturmek icin tasarlanmis premium dijital fitness platformu.",
      summary:
        "TJFIT, ust duzey antrenman programlari, uygulanabilir beslenme sistemleri ve odakli bir topluluk deneyimini birlestirir. Boylece kullanicilar hizli baslar, duzeni korur ve gercek ilerleme gorur. Her bolum karar yorgunlugunu azaltmak, guveni artirmak ve saglikli aliskanliklari surdurulebilir hale getirmek icin tasarlandi.",
      categoriesTitle: "Platform Kategorileri",
      categoriesSubtitle: "Adim adim ilerleyin. Her kategorinin net bir amaci var.",
      viewCategory: "Ac",
      primaryCta: "Programlari Kesfet",
      secondaryCta: "Hesap Olustur"
    },
    ar: {
      welcome: "مرحبا بك في TJFIT",
      headline: "منصة لياقة رقمية مميزة مصممة لتحويل الحافز إلى نتائج قابلة للقياس.",
      summary:
        "تجمع TJFIT بين برامج تدريب قوية، وأنظمة تغذية عملية، وتجربة مجتمع مركزة لمساعدة المستخدم على البدء بسرعة والاستمرار وتحقيق تقدم حقيقي. كل قسم مصمم لتقليل التشتت وزيادة الثقة وجعل العادات الصحية أسهل على المدى الطويل.",
      categoriesTitle: "اقسام المنصة",
      categoriesSubtitle: "تقدم خطوة بخطوة. كل قسم له هدف واضح.",
      viewCategory: "فتح",
      primaryCta: "استكشاف البرامج",
      secondaryCta: "انشاء حساب"
    },
    es: {
      welcome: "Bienvenido a TJFIT",
      headline: "Una plataforma fitness digital premium creada para convertir motivacion en resultados medibles.",
      summary:
        "TJFIT combina programas de entrenamiento de alto nivel, sistemas de nutricion practicos y una experiencia de comunidad enfocada para que los usuarios empiecen rapido, mantengan constancia y logren progreso real. Cada seccion esta disenada para reducir fatiga de decisiones, aumentar confianza y sostener habitos saludables a largo plazo.",
      categoriesTitle: "Categorias de la Plataforma",
      categoriesSubtitle: "Avanza paso a paso. Cada categoria tiene un objetivo claro.",
      viewCategory: "Abrir",
      primaryCta: "Explorar Programas",
      secondaryCta: "Crear Cuenta"
    },
    fr: {
      welcome: "Bienvenue sur TJFIT",
      headline: "Une plateforme fitness digitale premium concue pour transformer la motivation en resultats mesurables.",
      summary:
        "TJFIT combine des programmes d'entrainement de haut niveau, des systemes nutritionnels pratiques et une experience communautaire focalisee pour aider les utilisateurs a demarrer vite, rester reguliers et obtenir de vrais resultats. Chaque section est pensee pour reduire la fatigue decisionnelle, renforcer la confiance et maintenir des habitudes saines durablement.",
      categoriesTitle: "Categories de la Plateforme",
      categoriesSubtitle: "Avancez etape par etape. Chaque categorie a un objectif clair.",
      viewCategory: "Ouvrir",
      primaryCta: "Explorer les Programmes",
      secondaryCta: "Creer un Compte"
    }
  }[locale];

  const categories = [
    {
      title:
        locale === "tr"
          ? "Programlar"
          : locale === "ar"
            ? "البرامج"
            : locale === "es"
              ? "Programas"
              : locale === "fr"
                ? "Programmes"
                : "Programs",
      description:
        locale === "tr"
          ? "Hazir antrenman ve beslenme planlariyla hemen baslayin."
          : locale === "ar"
            ? "ابدأ فوراً بخطط تدريب وتغذية جاهزة."
            : locale === "es"
              ? "Empieza al instante con planes de entrenamiento y nutricion listos."
              : locale === "fr"
                ? "Demarrez immediatement avec des plans d'entrainement et nutrition prets."
                : "Start instantly with ready-to-use training and nutrition plans.",
      href: `/${locale}/programs`
    },
    {
      title: dict.nav.community,
      description:
        locale === "tr"
          ? "Threadler, meydan okumalar ve donusumler tek merkezde."
          : locale === "ar"
            ? "المناقشات والتحديات والتحولات في مركز واحد."
            : locale === "es"
              ? "Hilos, retos y transformaciones en un solo hub."
              : locale === "fr"
                ? "Discussions, defis et transformations dans un seul hub."
                : "Threads, challenges, and transformations in one focused hub.",
      href: `/${locale}/community`
    },
    {
      title:
        locale === "tr"
          ? "Koçlar"
          : locale === "ar"
            ? "المدربون"
            : locale === "es"
              ? "Coaches"
              : locale === "fr"
                ? "Coachs"
                : "Coaches",
      description:
        locale === "tr"
          ? "Koç sistemi yakinda. Hedefiniz icin hazirlaniyoruz."
          : locale === "ar"
            ? "نظام المدربين قريباً. نجهز تجربة احترافية لهدفك."
            : locale === "es"
              ? "El sistema de coaches llega pronto, preparado para tus metas."
              : locale === "fr"
                ? "Le systeme de coachs arrive bientot, pret pour vos objectifs."
                : "Coach system is coming soon, prepared for goal-focused support.",
      href: `/${locale}/coaches`
    },
    {
      title:
        locale === "tr"
          ? "Destek"
          : locale === "ar"
            ? "الدعم"
            : locale === "es"
              ? "Soporte"
              : locale === "fr"
                ? "Support"
                : "Support",
      description:
        locale === "tr"
          ? "Yardim ve cozumler icin destek kanali her zaman acik."
          : locale === "ar"
            ? "قناة الدعم متاحة دائماً للمساعدة والحلول."
            : locale === "es"
              ? "Canal de soporte siempre disponible para ayuda y soluciones."
              : locale === "fr"
                ? "Canal de support toujours disponible pour aide et solutions."
                : "Support channel is always open for help and fast solutions.",
      href: `/${locale}/support`
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="glass-panel rounded-[36px] p-8 sm:p-10 lg:p-12">
        <span className="badge">{copy.welcome}</span>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {copy.headline}
        </h1>
        <p className="mt-6 max-w-4xl text-base leading-8 text-zinc-300 sm:text-lg">
          {copy.summary}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/programs`}
            className="gradient-button inline-flex rounded-full px-7 py-3.5 text-sm font-medium text-white sm:text-base"
          >
            {copy.primaryCta}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-zinc-100 transition hover:bg-white/5 sm:text-base"
          >
            {copy.secondaryCta}
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{copy.categoriesTitle}</h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">{copy.categoriesSubtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="rounded-[24px] border border-white/10 bg-white/5 p-6 transition hover:border-accent/40 hover:bg-white/[0.07]"
            >
              <h3 className="text-xl font-semibold text-white">{category.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{category.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-500">{copy.viewCategory}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
