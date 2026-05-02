import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TjaiPublicLanding } from "@/components/tjai-public-landing";
import { isAdminEmail } from "@/lib/auth-utils";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "TJAI — AI Fitness & Nutrition Coach | TJFit",
    description: "TJAI: complete an adaptive assessment for a personalized preview, then unlock your full 12-week fitness and nutrition plan."
  },
  tr: {
    title: "TJAI — Yapay Zeka Fitness ve Beslenme Koçu | TJFit",
    description: "TJAI: kişiselleştirilmiş önizleme için adaptif değerlendirmeni tamamla, ardından 12 haftalık fitness ve beslenme planını aç."
  },
  ar: {
    title: "TJAI — مدرب اللياقة والتغذية بالذكاء الاصطناعي | TJFit",
    description: "TJAI: أكمل تقييماً تكيفياً للحصول على معاينة مخصصة، ثم افتح خطة اللياقة والتغذية الكاملة لمدة 12 أسبوعاً."
  },
  es: {
    title: "TJAI — Entrenador de fitness y nutrición con IA | TJFit",
    description: "TJAI: completa una evaluación adaptativa para una vista previa personalizada y luego desbloquea tu plan completo de fitness y nutrición de 12 semanas."
  },
  fr: {
    title: "TJAI — Coach IA de fitness et nutrition | TJFit",
    description: "TJAI : complète une évaluation adaptative pour un aperçu personnalisé, puis débloque ton plan complet de fitness et nutrition sur 12 semaines."
  }
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const meta = PAGE_METADATA[locale] ?? PAGE_METADATA.en;
  return {
    title: meta.title,
    description: meta.description,
    keywords: ["AI fitness coach", "AI personal trainer", "AI nutrition plan", "AI workout plan"]
  };
}

export default function TjaiLandingPage({ params }: { params: { locale: string } }) {
  return <TjaiLandingPageContent params={params} />;
}

async function TjaiLandingPageContent({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      const isAdminByEmail = Boolean(user.email && isAdminEmail(user.email));
      const role = isAdminByEmail
        ? "admin"
        : (await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()).data?.role;
      if (role === "admin" || role === "coach" || role === "user") {
        redirect(`/${locale}/ai`);
      }
    }
  } catch {
    /* fall through to public landing */
  }

  return <TjaiPublicLanding locale={locale} />;
}
