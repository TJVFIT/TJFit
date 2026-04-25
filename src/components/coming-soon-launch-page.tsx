import Link from "next/link";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n";

type ComingSoonKey = "live" | "store" | "ai" | "membership";

type Copy = {
  badge: string;
  headline: string;
  sub: string;
  back: string;
};

const COPY: Record<Locale, Record<ComingSoonKey, Copy>> = {
  en: {
    live: {
      badge: "COMING SOON",
      headline: "Live Training. Coming Soon.",
      sub: "Join scheduled live sessions, guided coaching blocks, and premium class drops.",
      back: "Back to TJFit"
    },
    store: {
      badge: "COMING SOON",
      headline: "The TJFit Store. Coming Soon.",
      sub: "Premium gear, essentials, and curated picks are on the way.",
      back: "Back to TJFit"
    },
    ai: {
      badge: "COMING SOON",
      headline: "TJAI - Your AI Coach. Coming Soon.",
      sub: "Get structured guidance, smart adjustments, and daily accountability.",
      back: "Back to TJFit"
    },
    membership: {
      badge: "COMING SOON",
      headline: "TJFit Membership. Coming Soon.",
      sub: "One premium membership for programs, tools, and member-only features.",
      back: "Back to TJFit"
    }
  },
  tr: {
    live: {
      badge: "YAKINDA",
      headline: "Canli Antrenman. Yakinda.",
      sub: "Planli canli dersler, yonlendirmeli koçluk ve premium yayinlar geliyor.",
      back: "TJFit'e don"
    },
    store: {
      badge: "YAKINDA",
      headline: "TJFit Store. Yakinda.",
      sub: "Premium ekipmanlar ve secili urunler cok yakinda.",
      back: "TJFit'e don"
    },
    ai: {
      badge: "YAKINDA",
      headline: "TJAI - Yapay Zeka Koçun. Yakinda.",
      sub: "Yapilandirilmis yonlendirme, akilli ayarlamalar ve gunluk takip geliyor.",
      back: "TJFit'e don"
    },
    membership: {
      badge: "YAKINDA",
      headline: "TJFit Uyelik. Yakinda.",
      sub: "Programlar ve uyelere ozel ozellikler icin tek premium uyelik.",
      back: "TJFit'e don"
    }
  },
  ar: {
    live: {
      badge: "قريباً",
      headline: "التدريب المباشر. قريباً.",
      sub: "جلسات مباشرة مجدولة وتجارب تدريب مميزة في الطريق.",
      back: "العودة إلى TJFit"
    },
    store: {
      badge: "قريباً",
      headline: "متجر TJFit. قريباً.",
      sub: "منتجات ومعدات مميزة سيتم إطلاقها قريباً.",
      back: "العودة إلى TJFit"
    },
    ai: {
      badge: "قريباً",
      headline: "TJAI - مدربك الذكي. قريباً.",
      sub: "توجيه منظم وتعديلات ذكية ومتابعة يومية.",
      back: "العودة إلى TJFit"
    },
    membership: {
      badge: "قريباً",
      headline: "عضوية TJFit. قريباً.",
      sub: "عضوية واحدة للوصول إلى البرامج والمزايا الحصرية.",
      back: "العودة إلى TJFit"
    }
  },
  es: {
    live: {
      badge: "PROXIMAMENTE",
      headline: "Entrenamiento en vivo. Proximamente.",
      sub: "Sesiones en vivo programadas y bloques premium de coaching muy pronto.",
      back: "Volver a TJFit"
    },
    store: {
      badge: "PROXIMAMENTE",
      headline: "La Tienda TJFit. Proximamente.",
      sub: "Equipamiento premium y productos seleccionados estan en camino.",
      back: "Volver a TJFit"
    },
    ai: {
      badge: "PROXIMAMENTE",
      headline: "TJAI - Tu entrenador IA. Proximamente.",
      sub: "Guia estructurada, ajustes inteligentes y seguimiento diario.",
      back: "Volver a TJFit"
    },
    membership: {
      badge: "PROXIMAMENTE",
      headline: "Membresia TJFit. Proximamente.",
      sub: "Una membresia premium para programas y funciones exclusivas.",
      back: "Volver a TJFit"
    }
  },
  fr: {
    live: {
      badge: "BIENTOT",
      headline: "Entrainement en direct. Bientot.",
      sub: "Sessions live programmees et experiences premium en preparation.",
      back: "Retour a TJFit"
    },
    store: {
      badge: "BIENTOT",
      headline: "La boutique TJFit. Bientot.",
      sub: "Equipements premium et selections exclusives arrivent bientot.",
      back: "Retour a TJFit"
    },
    ai: {
      badge: "BIENTOT",
      headline: "TJAI - Votre coach IA. Bientot.",
      sub: "Conseils structures, ajustements intelligents et suivi quotidien.",
      back: "Retour a TJFit"
    },
    membership: {
      badge: "BIENTOT",
      headline: "Abonnement TJFit. Bientot.",
      sub: "Un abonnement premium pour programmes et avantages membres.",
      back: "Retour a TJFit"
    }
  }
};

export function ComingSoonLaunchPage({
  locale,
  page,
  source
}: {
  locale: Locale;
  page: ComingSoonKey;
  source: string;
}) {
  const c = COPY[locale]?.[page] ?? COPY.en[page];
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.10)_0%,transparent_72%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[80svh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <div className="animate-[tj-fade-up_400ms_ease-out_forwards]" style={{ animationDelay: "100ms", opacity: 0 }}>
          <Logo variant="icon" size="auth" href={`/${locale}`} />
        </div>
        <span
          className="mt-8 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 animate-[tj-fade-up_420ms_ease-out_forwards]"
          style={{ animationDelay: "200ms", opacity: 0 }}
        >
          {c.badge}
        </span>
        <h1
          className="mt-6 text-balance font-display text-4xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-5xl animate-[tj-fade-up_440ms_ease-out_forwards]"
          style={{ animationDelay: "350ms", opacity: 0 }}
        >
          {c.headline}
        </h1>
        <p
          className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base animate-[tj-fade-up_420ms_ease-out_forwards]"
          style={{ animationDelay: "500ms", opacity: 0 }}
        >
          {c.sub}
        </p>
        <div
          className="mt-8 w-full max-w-xl animate-[tj-fade-up_420ms_ease-out_forwards]"
          style={{ animationDelay: "650ms", opacity: 0 }}
        >
          <LeadCaptureForm locale={locale} source={source} variant="panel" />
        </div>
        <Link href={`/${locale}`} className="mt-8 text-sm text-muted transition-colors hover:text-white">
          <span className="rtl:rotate-180 inline-block">←</span> {c.back}
        </Link>
      </div>
    </section>
  );
}
