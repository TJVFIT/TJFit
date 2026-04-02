import type { Locale } from "@/lib/i18n";

/** Query values for `?notice=` after role redirects */
export const URL_NOTICE = {
  FORBIDDEN_ADMIN: "forbidden_admin",
  FORBIDDEN_COACH: "forbidden_coach",
  FORBIDDEN_UPLOAD: "forbidden_upload"
} as const;

export type UrlNotice = (typeof URL_NOTICE)[keyof typeof URL_NOTICE];

const messages: Record<UrlNotice, Record<Locale, string>> = {
  forbidden_admin: {
    en: "That area is for administrators only.",
    tr: "Bu bolge yalnizca yoneticiler icindir.",
    ar: "هذا القسم للمسؤولين فقط.",
    es: "Esa zona es solo para administradores.",
    fr: "Cette zone est reservee aux administrateurs."
  },
  forbidden_coach: {
    en: "That area is for coaches or admins only.",
    tr: "Bu bolge yalnizca koçlar veya yoneticiler icindir.",
    ar: "هذا القسم للمدربين أو المسؤولين فقط.",
    es: "Esa zona es solo para coaches o administradores.",
    fr: "Cette zone est reservee aux coaches et administrateurs."
  },
  forbidden_upload: {
    en: "Only coaches and admins can upload programs.",
    tr: "Program yukleme yalnizca koç ve yonetici icindir.",
    ar: "رفع البرامج للمدربين والمسؤولين فقط.",
    es: "Solo coaches y admins pueden subir programas.",
    fr: "Seuls les coaches et admins peuvent televerser des programmes."
  }
};

export function getUrlNoticeMessage(locale: Locale, notice: string | null): string | null {
  if (!notice || !(notice in messages)) return null;
  const row = messages[notice as UrlNotice];
  return row[locale] ?? row.en;
}
