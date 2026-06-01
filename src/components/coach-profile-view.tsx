"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CoachStats = {
  student_count: number;
  program_count: number;
  average_rating: number;
  review_count: number;
  blog_post_count: number;
  blog_view_count: number;
};

type CoachPayload = {
  coach: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    about_me: string | null;
    specialty_tags: string[] | null;
    certifications: string[] | null;
    accepting_clients: boolean | null;
    featured_program_id: string | null;
  };
  stats: CoachStats;
};

type CoachProfileCopy = {
  loading: string;
  notFound: string;
  accepting: string;
  notAccepting: string;
  statStudents: string;
  statPrograms: string;
  statRating: string;
  statBlogPosts: string;
  aboutTitle: string;
  noProfile: string;
  readMore: string;
  readLess: string;
  certsTitle: string;
  noCerts: string;
  featuredEyebrow: string;
  noFeatured: string;
  programLabel: string;
  viewBundles: string;
};

const COPY: Record<"en" | "tr" | "ar" | "es" | "fr", CoachProfileCopy> = {
  en: {
    loading: "Loading coach profile...",
    notFound: "Coach not found.",
    accepting: "Accepting New Clients",
    notAccepting: "Not Currently Accepting Clients",
    statStudents: "Students",
    statPrograms: "Programs",
    statRating: "Avg Rating",
    statBlogPosts: "Blog Posts",
    aboutTitle: "About Me",
    noProfile: "No detailed profile yet.",
    readMore: "Read more",
    readLess: "Read less",
    certsTitle: "Certifications",
    noCerts: "No certifications listed.",
    featuredEyebrow: "Most popular program by this coach",
    noFeatured: "No featured program selected yet",
    programLabel: "Program",
    viewBundles: "View Bundles"
  },
  tr: {
    loading: "Koç profili yükleniyor...",
    notFound: "Koç bulunamadı.",
    accepting: "Yeni Danışan Kabul Ediyor",
    notAccepting: "Şu Anda Danışan Kabul Etmiyor",
    statStudents: "Öğrenciler",
    statPrograms: "Programlar",
    statRating: "Ort. Puan",
    statBlogPosts: "Blog Yazıları",
    aboutTitle: "Hakkımda",
    noProfile: "Henüz detaylı profil yok.",
    readMore: "Daha fazla",
    readLess: "Daha az",
    certsTitle: "Sertifikalar",
    noCerts: "Sertifika listelenmemiş.",
    featuredEyebrow: "Bu koçun en popüler programı",
    noFeatured: "Henüz öne çıkan program seçilmedi",
    programLabel: "Program",
    viewBundles: "Paketleri gör"
  },
  ar: {
    loading: "جارٍ تحميل ملف المدرب...",
    notFound: "لم يتم العثور على المدرب.",
    accepting: "يقبل عملاء جدداً",
    notAccepting: "لا يقبل عملاء حالياً",
    statStudents: "الطلاب",
    statPrograms: "البرامج",
    statRating: "متوسط التقييم",
    statBlogPosts: "مقالات المدونة",
    aboutTitle: "نبذة عني",
    noProfile: "لا يوجد ملف تفصيلي بعد.",
    readMore: "اقرأ المزيد",
    readLess: "اعرض أقل",
    certsTitle: "الشهادات",
    noCerts: "لا توجد شهادات مدرجة.",
    featuredEyebrow: "أكثر برامج هذا المدرب رواجاً",
    noFeatured: "لم يُختر برنامج مميز بعد",
    programLabel: "برنامج",
    viewBundles: "عرض الحزم"
  },
  es: {
    loading: "Cargando perfil del coach...",
    notFound: "Coach no encontrado.",
    accepting: "Aceptando nuevos clientes",
    notAccepting: "No acepta clientes por ahora",
    statStudents: "Estudiantes",
    statPrograms: "Programas",
    statRating: "Valoración media",
    statBlogPosts: "Entradas de blog",
    aboutTitle: "Sobre mí",
    noProfile: "Aún no hay un perfil detallado.",
    readMore: "Leer más",
    readLess: "Leer menos",
    certsTitle: "Certificaciones",
    noCerts: "No hay certificaciones listadas.",
    featuredEyebrow: "El programa más popular de este coach",
    noFeatured: "Aún no se ha seleccionado un programa destacado",
    programLabel: "Programa",
    viewBundles: "Ver paquetes"
  },
  fr: {
    loading: "Chargement du profil du coach...",
    notFound: "Coach introuvable.",
    accepting: "Accepte de nouveaux clients",
    notAccepting: "N'accepte pas de clients pour le moment",
    statStudents: "Élèves",
    statPrograms: "Programmes",
    statRating: "Note moyenne",
    statBlogPosts: "Articles de blog",
    aboutTitle: "À propos de moi",
    noProfile: "Pas encore de profil détaillé.",
    readMore: "Lire plus",
    readLess: "Lire moins",
    certsTitle: "Certifications",
    noCerts: "Aucune certification listée.",
    featuredEyebrow: "Le programme le plus populaire de ce coach",
    noFeatured: "Aucun programme mis en avant pour l'instant",
    programLabel: "Programme",
    viewBundles: "Voir les packs"
  }
};

export function CoachProfileView({ locale, slug }: { locale: string; slug: string }) {
  const c = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const [data, setData] = useState<CoachPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/coaches/${encodeURIComponent(slug)}/stats`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setData(json as CoachPayload);
      setLoading(false);
      void fetch(`/api/coaches/${encodeURIComponent(slug)}/view`, { method: "POST" });
    };
    void load();
  }, [slug]);

  const about = useMemo(() => {
    const text = (data?.coach.about_me || data?.coach.bio || "").trim();
    if (!text) return "";
    if (expanded || text.length <= 300) return text;
    return `${text.slice(0, 300)}...`;
  }, [data?.coach.about_me, data?.coach.bio, expanded]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-14 text-sm text-muted">{c.loading}</div>;
  if (!data) return <div className="mx-auto max-w-4xl px-4 py-14 text-sm text-muted">{c.notFound}</div>;

  const coach = data.coach;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-10">
      <section className="rounded-2xl border border-divider bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <span className="tj-title-shimmer">{coach.display_name || coach.username}</span>
            </h1>
            <p className="mt-1 text-sm text-faint">@{coach.username}</p>
            <p className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${coach.accepting_clients === false ? "border-red-400/30 bg-red-500/10 text-red-300" : "tj-accepting-pulse border-emerald-400/35 bg-emerald-500/10 text-emerald-200"}`}>
              {coach.accepting_clients === false ? c.notAccepting : c.accepting}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(coach.specialty_tags ?? []).slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-divider bg-surface p-4 md:grid-cols-4">
        {[
          [c.statStudents, data.stats.student_count],
          [c.statPrograms, data.stats.program_count],
          [c.statRating, data.stats.average_rating],
          [c.statBlogPosts, data.stats.blog_post_count]
        ].map(([label, value]) => (
          <article key={String(label)} className="group/stat rounded-lg border border-divider bg-surface-2 p-3 transition-[border-color,box-shadow] duration-200 hover:border-purple-300/30 hover:shadow-[0_0_18px_rgba(168, 85, 247,0.12)]">
            <p className="text-xl font-bold text-white transition-colors duration-200 group-hover/stat:text-purple-50">{value}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-faint transition-colors duration-200 group-hover/stat:text-purple-200/80">{label}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">{c.aboutTitle}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-bright">{about || c.noProfile}</p>
        {(coach.about_me || "").length > 300 ? (
          <button type="button" className="mt-3 text-xs text-purple-300" onClick={() => setExpanded((v) => !v)}>
            {expanded ? c.readLess : c.readMore}
          </button>
        ) : null}
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <h2 className="text-lg font-semibold text-white">{c.certsTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(coach.certifications ?? []).map((cert) => (
            <span
              key={cert}
              className="group/cert inline-flex items-center gap-1.5 rounded-full border border-purple-300/20 bg-purple-300/[0.04] px-3 py-1.5 text-xs text-bright transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-purple-300/45 hover:bg-purple-300/[0.08] hover:text-purple-50 hover:shadow-[0_0_16px_rgba(168, 85, 247,0.16)]"
            >
              <Check className="h-3.5 w-3.5 text-green-400 transition-transform duration-200 motion-safe:group-hover/cert:scale-110" />
              {cert}
            </span>
          ))}
          {(coach.certifications ?? []).length === 0 ? <p className="text-sm text-faint">{c.noCerts}</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-divider bg-surface p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-faint">{c.featuredEyebrow}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{coach.featured_program_id ? `${c.programLabel} ${coach.featured_program_id}` : c.noFeatured}</h3>
        {coach.featured_program_id ? (
          <Link href={`/${locale}/bundles`} className="mt-3 inline-flex tj-cta-sheen rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] shadow-[0_0_16px_rgba(168, 85, 247,0.2)] hover:shadow-[0_0_24px_rgba(168, 85, 247,0.32)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] px-4 py-2 text-sm font-semibold text-[#09090B]">
            {c.viewBundles}
          </Link>
        ) : null}
      </section>
    </div>
  );
}
