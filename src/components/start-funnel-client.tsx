"use client";

import Link from "next/link";
import { ArrowRight, Download, Dumbbell, Scale, ScrollText, UtensilsCrossed, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PremiumPageShell } from "@/components/premium";
import type { Locale } from "@/lib/i18n";
import { programs } from "@/lib/content";
import { localizeProgram } from "@/lib/program-localization";
import { cn } from "@/lib/utils";

type BlogItem = { id: string; title: string; content: string };

const COPY: Record<
  Locale,
  {
    title: string;
    sub: string;
    freePrograms: string;
    freeDiets: string;
    directDownload: string;
    openDetails: string;
    freeTools: string;
    tdee: string;
    blogs: string;
    community: string;
    noPayment: string;
    emptyBlogs: string;
  }
> = {
  en: {
    title: "Start Free Map",
    sub: "Everything free in one place: free programs, free diets, TDEE calculator, blogs, and community.",
    freePrograms: "Free Programs",
    freeDiets: "Free Diets",
    directDownload: "Direct Download",
    openDetails: "Open Details",
    freeTools: "Free Tools",
    tdee: "TDEE Calculator",
    blogs: "Blogs",
    community: "Community",
    noPayment: "No payment required for these free resources.",
    emptyBlogs: "No blog posts yet."
  },
  tr: {
    title: "Ucretsiz Baslangic Haritasi",
    sub: "Tum ucretsiz hizmetler tek yerde: programlar, diyetler, TDEE hesaplayici, bloglar ve topluluk.",
    freePrograms: "Ucretsiz Programlar",
    freeDiets: "Ucretsiz Diyetler",
    directDownload: "Direkt Indir",
    openDetails: "Detayi Ac",
    freeTools: "Ucretsiz Araclar",
    tdee: "TDEE Hesaplayici",
    blogs: "Bloglar",
    community: "Topluluk",
    noPayment: "Bu ucretsiz kaynaklar icin odeme gerekmez.",
    emptyBlogs: "Henuz blog yok."
  },
  ar: {
    title: "خريطة ابدأ مجاناً",
    sub: "كل الخدمات المجانية في مكان واحد: برامج مجانية، أنظمة غذائية مجانية، حاسبة TDEE، المدونات، والمجتمع.",
    freePrograms: "البرامج المجانية",
    freeDiets: "الأنظمة الغذائية المجانية",
    directDownload: "تحميل مباشر",
    openDetails: "فتح التفاصيل",
    freeTools: "أدوات مجانية",
    tdee: "حاسبة TDEE",
    blogs: "المدونات",
    community: "المجتمع",
    noPayment: "لا حاجة لأي دفع لهذه الموارد المجانية.",
    emptyBlogs: "لا توجد مقالات بعد."
  },
  es: {
    title: "Mapa Empezar Gratis",
    sub: "Todo lo gratis en un lugar: programas, dietas, calculadora TDEE, blogs y comunidad.",
    freePrograms: "Programas Gratis",
    freeDiets: "Dietas Gratis",
    directDownload: "Descarga Directa",
    openDetails: "Abrir Detalles",
    freeTools: "Herramientas Gratis",
    tdee: "Calculadora TDEE",
    blogs: "Blogs",
    community: "Comunidad",
    noPayment: "No se requiere pago para estos recursos gratis.",
    emptyBlogs: "Aun no hay blogs."
  },
  fr: {
    title: "Carte Commencer Gratuitement",
    sub: "Tous les services gratuits en un seul endroit : programmes, regimes, calculateur TDEE, blogs et communaute.",
    freePrograms: "Programmes Gratuits",
    freeDiets: "Regimes Gratuits",
    directDownload: "Telechargement Direct",
    openDetails: "Voir Details",
    freeTools: "Outils Gratuits",
    tdee: "Calculateur TDEE",
    blogs: "Blogs",
    community: "Communaute",
    noPayment: "Aucun paiement requis pour ces ressources gratuites.",
    emptyBlogs: "Pas encore de blogs."
  }
};

export function StartFunnelClient({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const freeItems = useMemo(() => programs.filter((p) => p.is_free), []);
  const freePrograms = useMemo(
    () => freeItems.filter((p) => !p.category.toLowerCase().includes("nutrition")).map((p) => localizeProgram(p, locale)),
    [freeItems, locale]
  );
  const freeDiets = useMemo(
    () => freeItems.filter((p) => p.category.toLowerCase().includes("nutrition")).map((p) => localizeProgram(p, locale)),
    [freeItems, locale]
  );

  useEffect(() => {
    void fetch("/api/blog/posts?status=published", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setBlogs((data?.posts ?? []).slice(0, 4) as BlogItem[]))
      .catch(() => setBlogs([]));
  }, []);

  return (
    <PremiumPageShell className="max-w-3xl">
      <section className="mx-auto px-4 py-14 sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">{copy.sub}</p>
        <p className="mt-2 text-xs text-cyan-300">{copy.noPayment}</p>
      </section>

      <section className="mx-auto px-4 pb-10 sm:px-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Dumbbell className="h-5 w-5 text-cyan-300" /> {copy.freePrograms}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {freePrograms.map((p) => (
            <article key={p.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{p.title}</p>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/api/free/download?slug=${encodeURIComponent(p.slug)}&locale=${locale}`}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100"
                >
                  <Download className="h-3.5 w-3.5" /> {copy.directDownload}
                </a>
                <Link href={`/${locale}/programs/${p.slug}`} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-200">
                  {copy.openDetails} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto px-4 pb-10 sm:px-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <UtensilsCrossed className="h-5 w-5 text-cyan-300" /> {copy.freeDiets}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {freeDiets.map((p) => (
            <article key={p.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{p.title}</p>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/api/free/download?slug=${encodeURIComponent(p.slug)}&locale=${locale}`}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100"
                >
                  <Download className="h-3.5 w-3.5" /> {copy.directDownload}
                </a>
                <Link href={`/${locale}/programs/${p.slug}`} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-200">
                  {copy.openDetails} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto px-4 pb-10 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{copy.freeTools}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href={`/${locale}/calculator`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-zinc-100">
            <Scale className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-sm font-medium">{copy.tdee}</p>
          </Link>
          <Link href={`/${locale}/community?tab=blogs`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-zinc-100">
            <ScrollText className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-sm font-medium">{copy.blogs}</p>
          </Link>
          <Link href={`/${locale}/community`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-zinc-100">
            <Users className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-sm font-medium">{copy.community}</p>
          </Link>
        </div>
      </section>

      <section className="mx-auto px-4 pb-14 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{copy.blogs}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {blogs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">{copy.emptyBlogs}</div>
          ) : (
            blogs.map((post) => (
              <article key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{post.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{post.content}</p>
                <Link href={`/${locale}/community?tab=blogs`} className="mt-3 inline-flex text-xs text-cyan-300">
                  {copy.openDetails}
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </PremiumPageShell>
  );
}
