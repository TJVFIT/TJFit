import { resolveCopyLocale, type Locale } from "@/lib/i18n";

/**
 * Copy for /settings/email (page header + EmailPreferencesForm) — WP-GAP-10.
 * The toggle keys mirror src/app/api/email/preferences/route.ts exactly.
 */

export type EmailPreferencesCopy = {
  title: string;
  subtitle: string;
  fields: {
    weekly_program: { label: string; help: string };
    achievements: { label: string; help: string };
    blog_updates: { label: string; help: string };
    streak_milestones: { label: string; help: string };
    referrals: { label: string; help: string };
    platform_news: { label: string; help: string };
  };
  errorGeneric: string;
  tryAgain: string;
  saving: string;
  save: string;
  updated: string;
};

const COPY: Record<Locale, EmailPreferencesCopy> = {
  en: {
    title: "Email Preferences",
    subtitle: "Choose which emails TJFit sends you.",
    fields: {
      weekly_program: {
        label: "Weekly program updates",
        help: "Your upcoming week's plan and any coach notes."
      },
      achievements: {
        label: "Achievement emails",
        help: "Badges, milestones, and personal records you unlock."
      },
      blog_updates: {
        label: "Blog updates",
        help: "New articles from coaches and the TJFit team."
      },
      streak_milestones: {
        label: "Streak milestones",
        help: "Celebrations when you hit a training streak."
      },
      referrals: {
        label: "Referral emails",
        help: "Updates when someone signs up with your referral code."
      },
      platform_news: {
        label: "Platform news",
        help: "Product announcements and account-relevant changes."
      }
    },
    errorGeneric: "Something went wrong. Please try again.",
    tryAgain: "Try again",
    saving: "Saving...",
    save: "Save preferences",
    updated: "Email preferences updated ✓"
  },
  tr: {
    title: "E-posta Tercihleri",
    subtitle: "TJFit'in size hangi e-postaları göndereceğini seçin.",
    fields: {
      weekly_program: {
        label: "Haftalık program güncellemeleri",
        help: "Önümüzdeki haftanın planı ve koç notları."
      },
      achievements: {
        label: "Başarı e-postaları",
        help: "Kazandığınız rozetler, kilometre taşları ve kişisel rekorlar."
      },
      blog_updates: {
        label: "Blog güncellemeleri",
        help: "Koçlardan ve TJFit ekibinden yeni yazılar."
      },
      streak_milestones: {
        label: "Seri dönüm noktaları",
        help: "Antrenman serinizi yakaladığınızda kutlamalar."
      },
      referrals: {
        label: "Davet e-postaları",
        help: "Davet kodunuzla biri kaydolduğunda bildirim."
      },
      platform_news: {
        label: "Platform haberleri",
        help: "Ürün duyuruları ve hesabınızı ilgilendiren değişiklikler."
      }
    },
    errorGeneric: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    tryAgain: "Tekrar dene",
    saving: "Kaydediliyor...",
    save: "Tercihleri kaydet",
    updated: "E-posta tercihleri güncellendi ✓"
  },
  ar: {
    title: "تفضيلات البريد الإلكتروني",
    subtitle: "اختر الرسائل التي يرسلها لك TJFit.",
    fields: {
      weekly_program: {
        label: "تحديثات البرنامج الأسبوعي",
        help: "خطة الأسبوع القادم وملاحظات المدرب."
      },
      achievements: {
        label: "رسائل الإنجازات",
        help: "الشارات والمحطات والأرقام القياسية الشخصية التي تحققها."
      },
      blog_updates: {
        label: "تحديثات المدونة",
        help: "مقالات جديدة من المدربين وفريق TJFit."
      },
      streak_milestones: {
        label: "محطات سلسلة التمرين",
        help: "احتفالات عند وصولك إلى سلسلة تدريب متواصلة."
      },
      referrals: {
        label: "رسائل الإحالة",
        help: "إشعارات عند تسجيل شخص برمز الإحالة الخاص بك."
      },
      platform_news: {
        label: "أخبار المنصة",
        help: "إعلانات المنتج والتغييرات المتعلقة بحسابك."
      }
    },
    errorGeneric: "حدث خطأ ما. حاول مرة أخرى.",
    tryAgain: "حاول مجددًا",
    saving: "جارٍ الحفظ...",
    save: "حفظ التفضيلات",
    updated: "تم تحديث تفضيلات البريد ✓"
  },
  es: {
    title: "Preferencias de correo",
    subtitle: "Elige qué correos te envía TJFit.",
    fields: {
      weekly_program: {
        label: "Novedades del programa semanal",
        help: "El plan de tu próxima semana y las notas de tu coach."
      },
      achievements: {
        label: "Correos de logros",
        help: "Insignias, hitos y récords personales que desbloqueas."
      },
      blog_updates: {
        label: "Novedades del blog",
        help: "Nuevos artículos de los coaches y del equipo de TJFit."
      },
      streak_milestones: {
        label: "Hitos de racha",
        help: "Celebraciones cuando alcanzas una racha de entrenamiento."
      },
      referrals: {
        label: "Correos de referidos",
        help: "Avisos cuando alguien se registra con tu código de referido."
      },
      platform_news: {
        label: "Noticias de la plataforma",
        help: "Anuncios de producto y cambios relevantes para tu cuenta."
      }
    },
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    tryAgain: "Reintentar",
    saving: "Guardando...",
    save: "Guardar preferencias",
    updated: "Preferencias de correo actualizadas ✓"
  },
  fr: {
    title: "Préférences e-mail",
    subtitle: "Choisissez les e-mails que TJFit vous envoie.",
    fields: {
      weekly_program: {
        label: "Mises à jour du programme hebdo",
        help: "Le plan de votre semaine à venir et les notes du coach."
      },
      achievements: {
        label: "E-mails de réussites",
        help: "Badges, étapes et records personnels que vous débloquez."
      },
      blog_updates: {
        label: "Actualités du blog",
        help: "Nouveaux articles des coachs et de l'équipe TJFit."
      },
      streak_milestones: {
        label: "Paliers de série",
        help: "Une célébration quand vous atteignez une série d'entraînement."
      },
      referrals: {
        label: "E-mails de parrainage",
        help: "Notifications quand quelqu'un s'inscrit avec votre code de parrainage."
      },
      platform_news: {
        label: "Actualités de la plateforme",
        help: "Annonces produit et changements liés à votre compte."
      }
    },
    errorGeneric: "Un problème est survenu. Veuillez réessayer.",
    tryAgain: "Réessayer",
    saving: "Enregistrement...",
    save: "Enregistrer les préférences",
    updated: "Préférences e-mail mises à jour ✓"
  }
};

export function getEmailPreferencesCopy(locale: string): EmailPreferencesCopy {
  return COPY[resolveCopyLocale(locale)];
}
