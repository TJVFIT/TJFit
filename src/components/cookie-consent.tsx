"use client";

import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";

// Cookie-consent provider + banner.
//
// Per Feroot's GDPR SaaS 2026 enforcement notes: scripts loading
// before consent = compliance violation. This component is the
// gatekeeper. Consumers (PostHog, Clarity, GA4 etc.) read consent
// via `getCookieConsent()` before initialising.
//
// Three categories:
//   - essential  : always on (auth, CSRF, locale, cart) — non-negotiable
//   - analytics  : PostHog, Microsoft Clarity, GA4
//   - marketing  : Meta Pixel, ad UTMs, retargeting cookies
//
// Persisted to localStorage. If a logged-in user changes consent,
// the consuming app can also persist to DB (cookie_consent JSONB on
// user_profiles) — left to a follow-up.

const STORAGE_KEY = "tjfit-cookie-consent";
const STORAGE_VERSION = 1;
const RECONSENT_DAYS = 365;

export type ConsentCategory = "essential" | "analytics" | "marketing";

export type CookieConsent = {
  version: number;
  acceptedAt: string; // ISO timestamp
  essential: true; // always
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_REJECTED: CookieConsent = {
  version: STORAGE_VERSION,
  acceptedAt: new Date(0).toISOString(),
  essential: true,
  analytics: false,
  marketing: false
};

function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed?.version !== STORAGE_VERSION) return null;
    if (typeof parsed?.acceptedAt !== "string") return null;
    const acceptedDate = new Date(parsed.acceptedAt).getTime();
    if (Number.isFinite(acceptedDate)) {
      const ageDays = (Date.now() - acceptedDate) / (1000 * 60 * 60 * 24);
      if (ageDays > RECONSENT_DAYS) return null; // re-prompt after a year
    }
    return {
      version: STORAGE_VERSION,
      acceptedAt: parsed.acceptedAt,
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing)
    };
  } catch {
    return null;
  }
}

function writeConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent("tjfit:cookie-consent-changed", { detail: consent }));
  } catch {
    /* localStorage may be disabled in private mode — fail closed (treat as rejected) */
  }
}

// Public API for any analytics consumer that needs to gate itself.
// Returns the current snapshot (rejected by default if nothing
// stored yet).
export function getCookieConsent(): CookieConsent {
  return readConsent() ?? DEFAULT_REJECTED;
}

export function isCategoryAllowed(category: ConsentCategory): boolean {
  if (category === "essential") return true;
  return getCookieConsent()[category];
}

type CopyShape = {
  banner: {
    intro: string;
    acceptAll: string;
    rejectNonEssential: string;
    customize: string;
  };
  modal: {
    title: string;
    intro: string;
    essential: { name: string; desc: string };
    analytics: { name: string; desc: string };
    marketing: { name: string; desc: string };
    save: string;
    acceptAll: string;
    rejectAll: string;
    learnMore: string;
  };
};

const COPY: Record<Locale, CopyShape> = {
  en: {
    banner: {
      intro:
        "We use cookies to improve your experience. Essential cookies are always on; analytics and marketing are off until you accept.",
      acceptAll: "Accept all",
      rejectNonEssential: "Reject non-essential",
      customize: "Customize"
    },
    modal: {
      title: "Cookie preferences",
      intro: "Toggle each category. Your choice is stored locally and applies across this browser.",
      essential: {
        name: "Essential",
        desc: "Required for login, locale, checkout. Can't be disabled."
      },
      analytics: {
        name: "Analytics",
        desc: "PostHog and Microsoft Clarity — helps us understand which features earn their keep."
      },
      marketing: {
        name: "Marketing",
        desc: "Ad attribution and retargeting pixels. Off by default; we don't run ads yet."
      },
      save: "Save preferences",
      acceptAll: "Accept all",
      rejectAll: "Reject non-essential",
      learnMore: "Read the cookie policy"
    }
  },
  tr: {
    banner: {
      intro:
        "Deneyimini iyileştirmek için çerez kullanıyoruz. Temel çerezler hep açık; analiz ve pazarlama çerezleri sen kabul edene kadar kapalı.",
      acceptAll: "Tümünü kabul et",
      rejectNonEssential: "Temel olmayanları reddet",
      customize: "Özelleştir"
    },
    modal: {
      title: "Çerez tercihleri",
      intro: "Her kategoriyi aç/kapat. Tercihin yerel olarak saklanır ve bu tarayıcıda geçerlidir.",
      essential: {
        name: "Temel",
        desc: "Giriş, dil ve ödeme için gerekli. Devre dışı bırakılamaz."
      },
      analytics: {
        name: "Analiz",
        desc: "PostHog ve Microsoft Clarity — hangi özelliklerin işe yaradığını anlamamıza yardımcı olur."
      },
      marketing: {
        name: "Pazarlama",
        desc: "Reklam atıfları ve yeniden hedefleme pikselleri. Varsayılan olarak kapalı."
      },
      save: "Tercihleri kaydet",
      acceptAll: "Tümünü kabul et",
      rejectAll: "Temel olmayanları reddet",
      learnMore: "Çerez politikasını oku"
    }
  },
  ar: {
    banner: {
      intro:
        "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. الأساسية تعمل دائماً؛ تحليلات والتسويق متوقفة حتى توافق.",
      acceptAll: "قبول الكل",
      rejectNonEssential: "رفض غير الأساسي",
      customize: "تخصيص"
    },
    modal: {
      title: "تفضيلات ملفات تعريف الارتباط",
      intro: "بدّل كل فئة. خيارك يُحفظ محلياً ويُطبَّق على هذا المتصفح.",
      essential: {
        name: "أساسي",
        desc: "مطلوب لتسجيل الدخول واللغة والدفع. لا يمكن تعطيله."
      },
      analytics: {
        name: "تحليلات",
        desc: "PostHog و Microsoft Clarity — يساعدنا في فهم الميزات التي تستحق."
      },
      marketing: {
        name: "تسويق",
        desc: "إسناد الإعلانات وبكسلات إعادة الاستهداف. متوقف افتراضياً."
      },
      save: "حفظ التفضيلات",
      acceptAll: "قبول الكل",
      rejectAll: "رفض غير الأساسي",
      learnMore: "اقرأ سياسة ملفات تعريف الارتباط"
    }
  },
  es: {
    banner: {
      intro:
        "Usamos cookies para mejorar tu experiencia. Las esenciales están siempre activas; analítica y marketing están desactivadas hasta que aceptes.",
      acceptAll: "Aceptar todo",
      rejectNonEssential: "Rechazar no esenciales",
      customize: "Personalizar"
    },
    modal: {
      title: "Preferencias de cookies",
      intro: "Activa o desactiva cada categoría. Tu elección se guarda localmente en este navegador.",
      essential: {
        name: "Esenciales",
        desc: "Necesarias para login, idioma, checkout. No pueden deshabilitarse."
      },
      analytics: {
        name: "Analítica",
        desc: "PostHog y Microsoft Clarity — nos ayudan a entender qué funciones aportan valor."
      },
      marketing: {
        name: "Marketing",
        desc: "Atribución de anuncios y retargeting. Desactivado por defecto; aún no usamos anuncios."
      },
      save: "Guardar preferencias",
      acceptAll: "Aceptar todo",
      rejectAll: "Rechazar no esenciales",
      learnMore: "Leer la política de cookies"
    }
  },
  fr: {
    banner: {
      intro:
        "Nous utilisons des cookies pour améliorer ton expérience. Les essentiels sont toujours actifs ; analyse et marketing sont désactivés tant que tu n'acceptes pas.",
      acceptAll: "Tout accepter",
      rejectNonEssential: "Refuser les non-essentiels",
      customize: "Personnaliser"
    },
    modal: {
      title: "Préférences cookies",
      intro: "Active ou désactive chaque catégorie. Ton choix est sauvegardé localement sur ce navigateur.",
      essential: {
        name: "Essentiels",
        desc: "Requis pour la connexion, la langue, le paiement. Non désactivables."
      },
      analytics: {
        name: "Analytique",
        desc: "PostHog et Microsoft Clarity — nous aident à comprendre ce qui marche."
      },
      marketing: {
        name: "Marketing",
        desc: "Attribution publicitaire et pixels de retargeting. Désactivé par défaut."
      },
      save: "Enregistrer",
      acceptAll: "Tout accepter",
      rejectAll: "Refuser les non-essentiels",
      learnMore: "Lire la politique cookies"
    }
  }
};

export function CookieConsentBanner({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [hydrated, setHydrated] = useState(false);
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setNeedsPrompt(readConsent() === null);
  }, []);

  const persist = useCallback((next: { analytics: boolean; marketing: boolean }) => {
    writeConsent({
      version: STORAGE_VERSION,
      acceptedAt: new Date().toISOString(),
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing
    });
    setNeedsPrompt(false);
    setCustomizing(false);
  }, []);

  if (!hydrated || !needsPrompt) return null;

  if (customizing) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.modal.title}
        className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 pt-3"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-2xl rounded-2xl border border-white/[0.08] bg-[#111215] p-6 shadow-[0_-12px_60px_-20px_rgba(0,0,0,0.7)]">
          <h2 className="text-lg font-semibold text-white">{copy.modal.title}</h2>
          <p className="mt-2 text-sm text-muted">{copy.modal.intro}</p>

          <div className="mt-5 space-y-3">
            <label className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 opacity-70">
              <div>
                <p className="text-sm font-semibold text-white">{copy.modal.essential.name}</p>
                <p className="mt-1 text-xs text-muted">{copy.modal.essential.desc}</p>
              </div>
              <input type="checkbox" checked readOnly disabled aria-label={copy.modal.essential.name} />
            </label>

            <label className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12]">
              <div>
                <p className="text-sm font-semibold text-white">{copy.modal.analytics.name}</p>
                <p className="mt-1 text-xs text-muted">{copy.modal.analytics.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label={copy.modal.analytics.name}
              />
            </label>

            <label className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12]">
              <div>
                <p className="text-sm font-semibold text-white">{copy.modal.marketing.name}</p>
                <p className="mt-1 text-xs text-muted">{copy.modal.marketing.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                aria-label={copy.modal.marketing.name}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => persist({ analytics: true, marketing: true })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-[#09090B] transition-transform duration-150 active:scale-[0.97]"
            >
              {copy.modal.acceptAll}
            </button>
            <button
              type="button"
              onClick={() => persist({ analytics, marketing })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.15] px-5 text-sm font-semibold text-white transition-colors duration-150 hover:border-white/[0.3]"
            >
              {copy.modal.save}
            </button>
            <button
              type="button"
              onClick={() => persist({ analytics: false, marketing: false })}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.08] px-5 text-sm text-muted transition-colors duration-150 hover:text-white"
            >
              {copy.modal.rejectAll}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-4 pt-3"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#111215]/95 p-5 shadow-[0_-12px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-[13px] leading-relaxed text-muted">{copy.banner.intro}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCustomizing(true)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.08] px-4 text-[13px] text-muted transition-colors duration-150 hover:border-white/[0.2] hover:text-white"
          >
            {copy.banner.customize}
          </button>
          <button
            type="button"
            onClick={() => persist({ analytics: false, marketing: false })}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.15] px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:border-white/[0.3]"
          >
            {copy.banner.rejectNonEssential}
          </button>
          <button
            type="button"
            onClick={() => persist({ analytics: true, marketing: true })}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-4 text-[13px] font-bold text-[#09090B] transition-transform duration-150 active:scale-[0.97]"
          >
            {copy.banner.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
