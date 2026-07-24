import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";

import { MotionReveal } from "@/components/home/motion-reveal";
import { buildGumroadTrackedUrl } from "@/lib/gumroad/client";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJAI_ONE_TIME_PRICE_USD } from "@/lib/tjai-pricing";

export const dynamic = "force-dynamic";

const COPY: Record<
  Locale,
  {
    title: string;
    metaDescription: string;
    heading: string;
    sub: string;
    balanceLabel: string;
    perPlan: string;
    save: string;
    popular: string;
    buy: string;
    signInToBuy: string;
    soon: string;
    emailNote: string;
    deliveryNote: string;
    planUnit: (n: number) => string;
    features: string[];
  }
> = {
  en: {
    title: "TJAI Plan Credits | TJFit",
    metaDescription: "Buy TJAI plan credits — each credit unlocks one full personalized 12-week fitness and nutrition plan.",
    heading: "TJAI plan credits",
    sub: "One credit = one complete personalized plan: 12 weeks of training, nutrition, and adaptive check-ins.",
    balanceLabel: "Your credits",
    perPlan: "per plan",
    save: "Save",
    popular: "Most popular",
    buy: "Get credits",
    signInToBuy: "Sign in to buy",
    soon: "Available soon",
    emailNote: "Use your TJFit account email at checkout — credits attach to the matching account.",
    deliveryNote: "Credits are added automatically within a minute of purchase.",
    planUnit: (n) => (n === 1 ? "1 plan" : `${n} plans`),
    features: ["Full 12-week plan", "Meal swaps included", "Adaptive weekly check-ins"]
  },
  tr: {
    title: "TJAI Plan Kredileri | TJFit",
    metaDescription: "TJAI plan kredisi satın al — her kredi tam kişiselleştirilmiş 12 haftalık fitness ve beslenme planı açar.",
    heading: "TJAI plan kredileri",
    sub: "Bir kredi = eksiksiz kişisel bir plan: 12 haftalık antrenman, beslenme ve adaptif kontroller.",
    balanceLabel: "Kredilerin",
    perPlan: "plan başına",
    save: "Tasarruf",
    popular: "En popüler",
    buy: "Kredi al",
    signInToBuy: "Satın almak için giriş yap",
    soon: "Yakında",
    emailNote: "Ödemede TJFit hesabındaki e-postayı kullan — krediler eşleşen hesaba eklenir.",
    deliveryNote: "Krediler satın alımdan sonra bir dakika içinde otomatik eklenir.",
    planUnit: (n) => (n === 1 ? "1 plan" : `${n} plan`),
    features: ["Tam 12 haftalık plan", "Öğün değişimleri dahil", "Adaptif haftalık kontroller"]
  },
  ar: {
    title: "أرصدة خطط TJAI | TJFit",
    metaDescription: "اشترِ أرصدة خطط TJAI — كل رصيد يفتح خطة لياقة وتغذية كاملة مخصصة لمدة 12 أسبوعاً.",
    heading: "أرصدة خطط TJAI",
    sub: "رصيد واحد = خطة شخصية كاملة: 12 أسبوعاً من التدريب والتغذية والمتابعات التكيفية.",
    balanceLabel: "أرصدتك",
    perPlan: "لكل خطة",
    save: "وفّر",
    popular: "الأكثر شيوعاً",
    buy: "احصل على الأرصدة",
    signInToBuy: "سجّل الدخول للشراء",
    soon: "قريباً",
    emailNote: "استخدم بريد حساب TJFit عند الدفع — تُضاف الأرصدة إلى الحساب المطابق.",
    deliveryNote: "تُضاف الأرصدة تلقائياً خلال دقيقة من الشراء.",
    planUnit: (n) => (n === 1 ? "خطة واحدة" : `${n} خطط`),
    features: ["خطة كاملة لمدة 12 أسبوعاً", "تبديل الوجبات مشمول", "متابعات أسبوعية تكيفية"]
  },
  es: {
    title: "Créditos de planes TJAI | TJFit",
    metaDescription: "Compra créditos de planes TJAI: cada crédito desbloquea un plan completo y personalizado de fitness y nutrición de 12 semanas.",
    heading: "Créditos de planes TJAI",
    sub: "Un crédito = un plan personalizado completo: 12 semanas de entrenamiento, nutrición y revisiones adaptativas.",
    balanceLabel: "Tus créditos",
    perPlan: "por plan",
    save: "Ahorra",
    popular: "Más popular",
    buy: "Obtener créditos",
    signInToBuy: "Inicia sesión para comprar",
    soon: "Disponible pronto",
    emailNote: "Usa el correo de tu cuenta TJFit al pagar: los créditos se asignan a la cuenta coincidente.",
    deliveryNote: "Los créditos se añaden automáticamente en menos de un minuto tras la compra.",
    planUnit: (n) => (n === 1 ? "1 plan" : `${n} planes`),
    features: ["Plan completo de 12 semanas", "Cambios de comidas incluidos", "Revisiones semanales adaptativas"]
  },
  fr: {
    title: "Crédits de plans TJAI | TJFit",
    metaDescription: "Achète des crédits de plans TJAI — chaque crédit débloque un plan fitness et nutrition complet et personnalisé sur 12 semaines.",
    heading: "Crédits de plans TJAI",
    sub: "Un crédit = un plan personnalisé complet : 12 semaines d'entraînement, de nutrition et de bilans adaptatifs.",
    balanceLabel: "Tes crédits",
    perPlan: "par plan",
    save: "Économise",
    popular: "Le plus populaire",
    buy: "Obtenir des crédits",
    signInToBuy: "Connecte-toi pour acheter",
    soon: "Bientôt disponible",
    emailNote: "Utilise l'e-mail de ton compte TJFit au paiement — les crédits sont ajoutés au compte correspondant.",
    deliveryNote: "Les crédits sont ajoutés automatiquement dans la minute qui suit l'achat.",
    planUnit: (n) => (n === 1 ? "1 plan" : `${n} plans`),
    features: ["Plan complet de 12 semaines", "Échanges de repas inclus", "Bilans hebdomadaires adaptatifs"]
  }
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  const copy = COPY[locale] ?? COPY.en;
  return { title: copy.title, description: copy.metaDescription };
}

type PackRow = {
  id: string;
  slug: string;
  name_i18n: Record<string, string> | null;
  credits: number;
  price_usd: string | number;
};

type SyncRow = {
  product_id: string;
  gumroad_product_id: string | null;
  gumroad_permalink: string | null;
};

export default async function TjaiCreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  const copy = COPY[locale] ?? COPY.en;

  const admin = getSupabaseServerClient();

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) user = { id: data.user.id, email: data.user.email ?? undefined };
  } catch {
    /* signed-out render */
  }

  let packs: PackRow[] = [];
  let syncBy = new Map<string, SyncRow>();
  let balance: number | null = null;

  if (admin) {
    const [{ data: packRows }, { data: syncRows }] = await Promise.all([
      admin
        .from("tjai_credit_packs")
        .select("id,slug,name_i18n,credits,price_usd")
        .eq("is_published", true)
        .order("display_order"),
      admin
        .from("product_gumroad_sync")
        .select("product_id,gumroad_product_id,gumroad_permalink")
        .eq("product_type", "tjai_credits")
    ]);
    packs = (packRows ?? []) as PackRow[];
    syncBy = new Map(
      ((syncRows ?? []) as SyncRow[])
        .filter((r) => r.gumroad_product_id && !r.gumroad_product_id.startsWith("test_"))
        .map((r) => [r.product_id, r])
    );

    if (user) {
      const { data: lastTx } = await admin
        .from("tjai_credit_transactions")
        .select("balance_after")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      balance = Number(lastTx?.balance_after ?? 0);
    }
  }

  const popularIndex = packs.length === 3 ? 1 : -1;

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(124,58,237,0.18)] blur-[110px]" aria-hidden />
      <div className="relative max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-200">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          TJAI
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-white sm:text-5xl">{copy.heading}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{copy.sub}</p>
        {user && balance !== null ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-divider bg-surface-2 px-4 py-2 text-sm text-white">
            <Zap className="h-4 w-4 text-purple-300" aria-hidden />
            <span className="text-muted">{copy.balanceLabel}:</span>
            <span className="font-bold">{balance}</span>
          </p>
        ) : null}
      </div>

      <div className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack, index) => {
          const sync = syncBy.get(pack.id);
          const priceUsd = Number(pack.price_usd);
          const perPlan = pack.credits > 0 ? priceUsd / pack.credits : priceUsd;
          const savings = Math.max(
            0,
            Math.round((1 - perPlan / TJAI_ONE_TIME_PRICE_USD) * 100)
          );
          const isPopular = index === popularIndex;

          const trackedUrl =
            sync?.gumroad_permalink && user
              ? buildGumroadTrackedUrl(sync.gumroad_permalink, {
                  programSlug: `tjai-credits-${pack.slug}`,
                  orderId: `credits-${pack.slug}`,
                  email: user.email,
                  userId: user.id,
                  locale
                })
              : null;

          return (
            <MotionReveal key={pack.id} delayMs={index * 120} className="h-full">
            <article
              className={`bundle-card-tilt relative flex h-full flex-col rounded-2xl border p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 ${
                isPopular
                  ? "border-purple-400/45 bg-[linear-gradient(165deg,rgba(124,58,237,0.16),rgba(9,9,11,0.6))] shadow-[0_0_42px_rgba(168,85,247,0.16)]"
                  : "border-divider bg-surface hover:shadow-[0_0_28px_rgba(168,85,247,0.10)]"
              }`}
            >
              {isPopular ? (
                <span className="absolute -top-3 start-6 rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {copy.popular}
                </span>
              ) : null}

              <h2 className="text-lg font-bold text-white">{copy.planUnit(pack.credits)}</h2>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-white">${priceUsd}</span>
                <span className="text-xs text-dim">
                  ${perPlan.toFixed(2)} {copy.perPlan}
                </span>
              </p>
              {savings > 0 ? (
                <p className="mt-2 inline-flex w-fit rounded-full bg-emerald-400/12 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  {copy.save} {savings}%
                </p>
              ) : null}

              <ul className="mt-5 space-y-2.5">
                {copy.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                {!sync ? (
                  <span className="block rounded-full border border-divider px-5 py-3 text-center text-sm font-semibold text-dim">
                    {copy.soon}
                  </span>
                ) : !user ? (
                  <Link
                    href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/tjai/credits`)}`}
                    className="block rounded-full border border-purple-300/40 px-5 py-3 text-center text-sm font-bold text-purple-100 transition-colors hover:bg-purple-300/10"
                  >
                    {copy.signInToBuy}
                  </Link>
                ) : (
                  <a
                    href={trackedUrl ?? sync.gumroad_permalink ?? "#"}
                    className={`tj-cta-sheen block rounded-full px-5 py-3 text-center text-sm font-bold text-white transition-[transform,box-shadow,filter] duration-200 hover:scale-[1.02] hover:brightness-110 ${
                      isPopular
                        ? "bg-[linear-gradient(135deg,#A855F7,#7C3AED)] shadow-[0_0_28px_rgba(168,85,247,0.25)]"
                        : "bg-[linear-gradient(135deg,#7C3AED,#5B21B6)] shadow-[0_0_18px_rgba(124,58,237,0.20)]"
                    }`}
                  >
                    {copy.buy}
                  </a>
                )}
              </div>
            </article>
            </MotionReveal>
          );
        })}
      </div>

      <div className="relative mt-8 max-w-2xl space-y-1.5">
        <p className="text-xs text-dim">{copy.emailNote}</p>
        <p className="text-xs text-dim">{copy.deliveryNote}</p>
      </div>
    </section>
  );
}
