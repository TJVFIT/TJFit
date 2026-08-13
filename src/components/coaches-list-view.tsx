"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, Star, Users } from "lucide-react";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/lib/i18n";

type CoachStats = {
  students: number;
  programs: number;
  average_rating: number;
  blog_posts: number;
};

type CoachListing = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialty_tags: string[];
  accepting_clients: boolean;
  stats: CoachStats;
};

type CoachesCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  loading: string;
  errorGeneric: string;
  retryLabel: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  accepting: string;
  notAccepting: string;
  statStudents: string;
  statRating: string;
  viewProfile: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
};

const COPY: Record<Locale, CoachesCopy> = {
  en: {
    eyebrow: "Certified Coaches",
    title: "Find Your Coach",
    lead: "Work directly with certified fitness coaches who build, adjust, and support your training and nutrition — in your language.",
    loading: "Loading coaches...",
    errorGeneric: "Something went wrong loading coaches.",
    retryLabel: "Try again",
    emptyTitle: "Our first coaches are joining now",
    emptyBody: "TJFit is opening its coach roster to certified professionals. Be the first to publish your programs here and reach members across five languages.",
    emptyCta: "Apply to Be a Coach",
    accepting: "Accepting clients",
    notAccepting: "Not accepting clients",
    statStudents: "Students",
    statRating: "Rating",
    viewProfile: "View profile",
    ctaEyebrow: "For Fitness Professionals",
    ctaTitle: "Are you a certified coach?",
    ctaBody: "Publish your training and nutrition programs on TJFit and get discovered by members in five languages. You set the price — we handle payments and delivery.",
    ctaButton: "Become a Coach"
  },
  tr: {
    eyebrow: "Sertifikalı Koçlar",
    title: "Koçunu Bul",
    lead: "Antrenman ve beslenmeni oluşturan, ayarlayan ve destekleyen sertifikalı fitness koçlarıyla doğrudan çalış — kendi dilinde.",
    loading: "Koçlar yükleniyor...",
    errorGeneric: "Koçlar yüklenirken bir sorun oluştu.",
    retryLabel: "Tekrar dene",
    emptyTitle: "İlk koçlarımız şu anda katılıyor",
    emptyBody: "TJFit, koç kadrosunu sertifikalı profesyonellere açıyor. Programlarını burada yayınlayan ilk koç ol ve beş dilde üyelere ulaş.",
    emptyCta: "Koç Olmak İçin Başvur",
    accepting: "Danışan kabul ediyor",
    notAccepting: "Danışan kabul etmiyor",
    statStudents: "Öğrenciler",
    statRating: "Puan",
    viewProfile: "Profili görüntüle",
    ctaEyebrow: "Fitness Profesyonelleri İçin",
    ctaTitle: "Sertifikalı bir koç musun?",
    ctaBody: "Antrenman ve beslenme programlarını TJFit'te yayınla, beş dilde üyeler tarafından keşfedil. Fiyatı sen belirle — ödeme ve teslimatı biz hallederiz.",
    ctaButton: "Koç Ol"
  },
  ar: {
    eyebrow: "مدربون معتمدون",
    title: "اعثر على مدربك",
    lead: "اعمل مباشرة مع مدربي لياقة معتمدين يبنون تدريبك وتغذيتك ويعدّلونها ويدعمونك — بلغتك.",
    loading: "جارٍ تحميل المدربين...",
    errorGeneric: "حدث خطأ أثناء تحميل المدربين.",
    retryLabel: "أعد المحاولة",
    emptyTitle: "مدربونا الأوائل ينضمون الآن",
    emptyBody: "يفتح TJFit قائمة المدربين للمحترفين المعتمدين. كن أول من ينشر برامجه هنا ويصل إلى الأعضاء بخمس لغات.",
    emptyCta: "قدّم لتصبح مدرباً",
    accepting: "يقبل عملاء جدداً",
    notAccepting: "لا يقبل عملاء حالياً",
    statStudents: "الطلاب",
    statRating: "التقييم",
    viewProfile: "عرض الملف الشخصي",
    ctaEyebrow: "للمحترفين في اللياقة البدنية",
    ctaTitle: "هل أنت مدرب معتمد؟",
    ctaBody: "انشر برامج التدريب والتغذية الخاصة بك على TJFit واكتشفها من قبل أعضاء بخمس لغات. أنت تحدد السعر — نحن نتولى المدفوعات والتسليم.",
    ctaButton: "كن مدرباً"
  },
  es: {
    eyebrow: "Coaches Certificados",
    title: "Encuentra a Tu Coach",
    lead: "Trabaja directamente con coaches de fitness certificados que crean, ajustan y apoyan tu entrenamiento y nutrición, en tu idioma.",
    loading: "Cargando coaches...",
    errorGeneric: "Ocurrió un error al cargar los coaches.",
    retryLabel: "Reintentar",
    emptyTitle: "Nuestros primeros coaches se están uniendo",
    emptyBody: "TJFit está abriendo su plantilla de coaches a profesionales certificados. Sé el primero en publicar tus programas aquí y llega a miembros en cinco idiomas.",
    emptyCta: "Solicita Ser Coach",
    accepting: "Acepta nuevos clientes",
    notAccepting: "No acepta clientes por ahora",
    statStudents: "Estudiantes",
    statRating: "Valoración",
    viewProfile: "Ver perfil",
    ctaEyebrow: "Para Profesionales del Fitness",
    ctaTitle: "¿Eres un coach certificado?",
    ctaBody: "Publica tus programas de entrenamiento y nutrición en TJFit y consigue que te descubran miembros en cinco idiomas. Tú fijas el precio — nosotros gestionamos pagos y entrega.",
    ctaButton: "Conviértete en Coach"
  },
  fr: {
    eyebrow: "Coachs Certifiés",
    title: "Trouvez Votre Coach",
    lead: "Travaillez directement avec des coachs de fitness certifiés qui construisent, ajustent et soutiennent votre entraînement et votre nutrition — dans votre langue.",
    loading: "Chargement des coachs...",
    errorGeneric: "Une erreur est survenue lors du chargement des coachs.",
    retryLabel: "Réessayer",
    emptyTitle: "Nos premiers coachs rejoignent la plateforme",
    emptyBody: "TJFit ouvre son équipe de coachs aux professionnels certifiés. Soyez le premier à publier vos programmes ici et à toucher des membres en cinq langues.",
    emptyCta: "Postuler pour Devenir Coach",
    accepting: "Accepte de nouveaux clients",
    notAccepting: "N'accepte pas de clients pour le moment",
    statStudents: "Élèves",
    statRating: "Note",
    viewProfile: "Voir le profil",
    ctaEyebrow: "Pour les Professionnels du Fitness",
    ctaTitle: "Êtes-vous un coach certifié ?",
    ctaBody: "Publiez vos programmes d'entraînement et de nutrition sur TJFit et faites-vous découvrir par des membres en cinq langues. Vous fixez le prix — nous gérons les paiements et la livraison.",
    ctaButton: "Devenir Coach"
  }
};

function initials(name: string) {
  const base = name.trim();
  if (!base) return "??";
  return base
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CoachesListView({ locale }: { locale: Locale }) {
  const c = COPY[locale] ?? COPY.en;
  const [coaches, setCoaches] = useState<CoachListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/coaches", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(true);
          setCoaches([]);
          return;
        }
        setCoaches(Array.isArray(data.coaches) ? (data.coaches as CoachListing[]) : []);
      } catch {
        if (!cancelled) {
          setError(true);
          setCoaches([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const showEmpty = !loading && !error && coaches.length === 0;

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <AmbientOrbs />

      <div className="relative text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-200/80">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="tj-title-shimmer">{c.title}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{c.lead}</p>
      </div>

      {loading ? (
        <ul className="relative mt-10 space-y-4" aria-busy="true" aria-label={c.loading}>
          {["a", "b", "c"].map((k) => (
            <li key={k} className="overflow-hidden rounded-[24px] border border-white/[0.06] p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 tj-skeleton rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-40 tj-skeleton rounded-md" />
                  <div className="h-3 w-56 tj-skeleton rounded-md" />
                  <div className="h-3 w-32 tj-skeleton rounded-md" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <div role="alert" className="relative mt-10 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200/90">
          <p>{c.errorGeneric}</p>
          <button
            type="button"
            className="mt-3 rounded-full border border-white/15 px-4 py-1.5 text-xs text-bright transition-[border-color,color,box-shadow] duration-200 hover:border-purple-300/40 hover:text-purple-100 hover:shadow-[0_0_14px_rgba(168,85,247,0.12)]"
            onClick={() => setReloadToken((t) => t + 1)}
          >
            {c.retryLabel}
          </button>
        </div>
      ) : null}

      {showEmpty ? (
        <EmptyState
          className="relative mt-10 overflow-hidden rounded-[28px] border border-purple-300/20 bg-[linear-gradient(180deg,rgba(168,85,247,0.08),rgba(8,8,11,0.4))] px-6 py-14 shadow-[0_0_60px_-24px_rgba(168,85,247,0.25)]"
          icon={Award}
          iconClassName="mx-auto h-9 w-9 text-purple-200/80"
          iconStrokeWidth={1.5}
          title={c.emptyTitle}
          subtext={c.emptyBody}
          subtextClassName="mx-auto max-w-md"
          cta={
            <Link
              href={`/${locale}/become-a-coach`}
              className="tj-cta-sheen mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-6 text-sm font-semibold text-[#09090B] shadow-[0_0_16px_rgba(168,85,247,0.2)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(168,85,247,0.32)]"
            >
              {c.emptyCta}
            </Link>
          }
        />
      ) : null}

      {!loading && !error && coaches.length > 0 ? (
        <ul className="relative mt-10 space-y-4">
          {coaches.map((coach) => {
            const name = (coach.display_name || coach.username || "").trim() || coach.username;
            const bio = (coach.bio ?? "").trim();
            return (
              <li key={coach.id}>
                <Link
                  href={`/${locale}/coaches/${encodeURIComponent(coach.username)}`}
                  className="group block overflow-hidden rounded-[24px] border border-purple-400/20 bg-[linear-gradient(180deg,rgba(8,8,11,0.9),rgba(8,8,11,0.55))] p-5 shadow-[0_0_32px_rgba(168,85,247,0.06)] transition-[border-color,box-shadow,transform] duration-300 hover:border-purple-300/45 hover:shadow-[0_0_48px_rgba(168,85,247,0.16)] motion-safe:hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-background shadow-inner ring-1 ring-white/5">
                        {coach.avatar_url ? (
                          <Image src={coach.avatar_url} alt="" fill sizes="64px" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/40 to-violet-700/40 text-sm font-semibold text-white">
                            {initials(name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-display text-lg font-semibold text-white transition-colors duration-200 group-hover:text-purple-50">
                            {name}
                          </h2>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              coach.accepting_clients
                                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                                : "border-red-400/30 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {coach.accepting_clients ? c.accepting : c.notAccepting}
                          </span>
                        </div>
                        {bio ? <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{bio}</p> : null}
                        {coach.specialty_tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {coach.specialty_tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-purple-300/25 bg-purple-300/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-purple-100/90"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5">
                      <div className="flex items-center gap-3 text-xs text-faint">
                        <span className="inline-flex items-center gap-1" aria-label={`${c.statStudents}: ${coach.stats.students}`}>
                          <Users className="h-3.5 w-3.5 text-purple-300/80" aria-hidden />
                          {coach.stats.students}
                        </span>
                        <span className="inline-flex items-center gap-1" aria-label={`${c.statRating}: ${coach.stats.average_rating}`}>
                          <Star className="h-3.5 w-3.5 fill-current text-purple-300/80" aria-hidden />
                          {coach.stats.average_rating || "—"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-purple-200 transition-colors duration-200 group-hover:text-purple-100">
                        {c.viewProfile}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="relative mt-14 overflow-hidden rounded-2xl border border-divider bg-surface/40 p-6 transition-[border-color,box-shadow] duration-300 hover:border-purple-300/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.10)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(168,85,247,0.45) 30%, rgba(237,233,254,0.75) 50%, rgba(168,85,247,0.45) 70%, transparent)"
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-40 w-64 rtl:right-auto rtl:left-0"
          style={{ background: "radial-gradient(60% 70% at 80% 20%, rgba(168,85,247,0.12), transparent 70%)" }}
        />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-200/80">{c.ctaEyebrow}</p>
        <h2 className="relative mt-3 text-lg font-semibold text-white">{c.ctaTitle}</h2>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{c.ctaBody}</p>
        <Link
          href={`/${locale}/become-a-coach`}
          className="tj-cta-sheen relative mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-purple-300/45 bg-purple-300/[0.08] px-6 text-sm font-semibold text-purple-50 transition-[border-color,background-color,box-shadow] duration-200 hover:border-purple-300/65 hover:bg-purple-300/[0.14] hover:shadow-[0_0_22px_rgba(168,85,247,0.2)]"
        >
          {c.ctaButton}
        </Link>
      </div>
    </section>
  );
}
