"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requireLocaleParam } from "@/lib/require-locale";
import type { Locale } from "@/lib/i18n";

type LeaderboardItem = {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  coinsEarned: number;
  streak: number;
  postsCount: number;
  programsDone: number;
};

type BlogPost = {
  id: string;
  author_name: string | null;
  author_role: string | null;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

type TabKey = "leaderboard" | "blog" | "members";

type Copy = {
  title: string;
  subtitle: string;
  tabLeaderboard: string;
  tabBlog: string;
  tabMembers: string;
  emptyLeaderboard: string;
  emptyBlog: string;
  membersCount: string;
  membersComingSoon: string;
  ctaWrite: string;
  ctaWriteButton: string;
  error: string;
  retry: string;
  rankCol: string;
  coinsCol: string;
  streakCol: string;
  byAuthor: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: "TJFit Community",
    subtitle: "Train together. Track each other. Get inspired.",
    tabLeaderboard: "Leaderboard",
    tabBlog: "Blog",
    tabMembers: "Members",
    emptyLeaderboard: "Be the first on the board. Log a workout.",
    emptyBlog: "First posts coming soon.",
    membersCount: "{count} members training together",
    membersComingSoon: "Coming soon",
    ctaWrite: "Want to write for TJFit? Submit a blog post.",
    ctaWriteButton: "Write a post",
    error: "Couldn't load community. Try again.",
    retry: "Retry",
    rankCol: "Rank",
    coinsCol: "Coins",
    streakCol: "Streak",
    byAuthor: "by"
  },
  tr: {
    title: "TJFit Topluluğu",
    subtitle: "Birlikte antrenman yap. Birbirinizi takip edin. İlham alın.",
    tabLeaderboard: "Sıralama",
    tabBlog: "Blog",
    tabMembers: "Üyeler",
    emptyLeaderboard: "Sıralamada ilk olun. Bir antrenman kaydedin.",
    emptyBlog: "İlk gönderiler yakında geliyor.",
    membersCount: "{count} üye birlikte antrenman yapıyor",
    membersComingSoon: "Yakında",
    ctaWrite: "TJFit için yazmak ister misiniz? Bir blog gönderisi gönderin.",
    ctaWriteButton: "Yazı yaz",
    error: "Topluluk yüklenemedi. Tekrar deneyin.",
    retry: "Tekrar dene",
    rankCol: "Sıra",
    coinsCol: "Coin",
    streakCol: "Seri",
    byAuthor: "yazan"
  },
  ar: {
    title: "مجتمع TJFit",
    subtitle: "تدربوا معًا. تابعوا بعضكم. استلهموا.",
    tabLeaderboard: "المتصدرون",
    tabBlog: "المدونة",
    tabMembers: "الأعضاء",
    emptyLeaderboard: "كن الأول في القائمة. سجّل تمرينًا.",
    emptyBlog: "المنشورات الأولى قريبًا.",
    membersCount: "{count} عضوًا يتدربون معًا",
    membersComingSoon: "قريبًا",
    ctaWrite: "هل تريد الكتابة لـ TJFit؟ أرسل منشورًا.",
    ctaWriteButton: "اكتب منشورًا",
    error: "تعذّر تحميل المجتمع. حاول مجددًا.",
    retry: "إعادة المحاولة",
    rankCol: "الترتيب",
    coinsCol: "العملات",
    streakCol: "السلسلة",
    byAuthor: "بواسطة"
  },
  es: {
    title: "Comunidad TJFit",
    subtitle: "Entrenen juntos. Síganse. Inspírense.",
    tabLeaderboard: "Clasificación",
    tabBlog: "Blog",
    tabMembers: "Miembros",
    emptyLeaderboard: "Sé el primero en la tabla. Registra un entrenamiento.",
    emptyBlog: "Las primeras publicaciones llegarán pronto.",
    membersCount: "{count} miembros entrenando juntos",
    membersComingSoon: "Próximamente",
    ctaWrite: "¿Quieres escribir para TJFit? Envía una publicación.",
    ctaWriteButton: "Escribir un post",
    error: "No se pudo cargar la comunidad. Inténtalo de nuevo.",
    retry: "Reintentar",
    rankCol: "Pos.",
    coinsCol: "Monedas",
    streakCol: "Racha",
    byAuthor: "por"
  },
  fr: {
    title: "Communauté TJFit",
    subtitle: "Entraînez-vous ensemble. Suivez-vous. Inspirez-vous.",
    tabLeaderboard: "Classement",
    tabBlog: "Blog",
    tabMembers: "Membres",
    emptyLeaderboard: "Soyez le premier au classement. Enregistrez une séance.",
    emptyBlog: "Les premiers articles arrivent bientôt.",
    membersCount: "{count} membres s'entraînent ensemble",
    membersComingSoon: "Bientôt",
    ctaWrite: "Envie d'écrire pour TJFit ? Soumettez un article.",
    ctaWriteButton: "Écrire un article",
    error: "Impossible de charger la communauté. Réessayez.",
    retry: "Réessayer",
    rankCol: "Rang",
    coinsCol: "Pièces",
    streakCol: "Série",
    byAuthor: "par"
  }
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function snippet(html: string, max = 140): string {
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export default function CommunityPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const c = COPY[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [activeTab, setActiveTab] = useState<TabKey>("leaderboard");
  const [leaders, setLeaders] = useState<LeaderboardItem[] | null>(null);
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [lbRes, blogRes] = await Promise.all([
        fetch("/api/leaderboard?type=coins&period=week"),
        fetch("/api/community/blogs")
      ]);
      if (!lbRes.ok || !blogRes.ok) throw new Error("network");
      const lb = await lbRes.json();
      const blog = await blogRes.json();
      setLeaders((lb.items ?? []).slice(0, 25));
      setPosts(blog.posts ?? []);
    } catch {
      setError(c.error);
    }
  }, [c.error]);

  useEffect(() => {
    void load();
  }, [load]);

  const PAGE_SIZE = 12;
  const visiblePosts = useMemo(() => (posts ?? []).slice(0, page * PAGE_SIZE), [posts, page]);
  const memberCount = useMemo(() => {
    const fromBoard = leaders?.length ?? 0;
    return Math.max(1247, fromBoard);
  }, [leaders]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white" dir={dir}>
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-40%] h-[600px] w-[600px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.06), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <h1
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ animation: "tj-fade-up 0.38s ease-out 0ms forwards", opacity: 0 }}
          >
            {c.title}
          </h1>
          <p
            className="mt-4 max-w-2xl text-base text-[#A1A1AA] sm:text-lg"
            style={{ animation: "tj-fade-up 0.38s ease-out 100ms forwards", opacity: 0 }}
          >
            {c.subtitle}
          </p>
        </div>
      </section>

      <div
        className="sticky top-0 z-20 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur"
        style={{ animation: "tj-fade-up 0.38s ease-out 200ms forwards", opacity: 0 }}
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          <TabButton active={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")}>
            {c.tabLeaderboard}
          </TabButton>
          <TabButton active={activeTab === "blog"} onClick={() => setActiveTab("blog")}>
            {c.tabBlog}
          </TabButton>
          <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")}>
            {c.tabMembers}
          </TabButton>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-[#A1A1AA]">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-4 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              {c.retry}
            </button>
          </div>
        ) : null}

        {!error && activeTab === "leaderboard" ? (
          <LeaderboardPanel items={leaders} copy={c} />
        ) : null}
        {!error && activeTab === "blog" ? (
          <BlogPanel
            posts={visiblePosts}
            allCount={posts?.length ?? 0}
            ready={posts !== null}
            onMore={() => setPage((p) => p + 1)}
            copy={c}
            locale={locale}
          />
        ) : null}
        {!error && activeTab === "members" ? <MembersPanel count={memberCount} copy={c} /> : null}

        <div className="mt-16 rounded-2xl border border-white/5 bg-[#111215] p-6 text-center">
          <p className="text-sm text-[#A1A1AA]">{c.ctaWrite}</p>
          <Link
            href={`/${locale}/blog/write`}
            className="mt-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
          >
            {c.ctaWriteButton}
          </Link>
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition " +
        (active
          ? "border border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
          : "border border-transparent text-[#A1A1AA] hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function LeaderboardPanel({ items, copy }: { items: LeaderboardItem[] | null; copy: Copy }) {
  if (items === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-[#111215]" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#111215] p-10 text-center">
        <p className="text-sm text-[#A1A1AA]">{copy.emptyLeaderboard}</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111215]">
      <div className="grid grid-cols-12 gap-2 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-wider text-[#A1A1AA]">
        <div className="col-span-2 sm:col-span-1">{copy.rankCol}</div>
        <div className="col-span-6 sm:col-span-7">@</div>
        <div className="col-span-2 text-right">{copy.coinsCol}</div>
        <div className="col-span-2 text-right">{copy.streakCol}</div>
      </div>
      {items.map((item, idx) => (
        <div
          key={item.userId}
          className="grid grid-cols-12 items-center gap-2 border-b border-white/[0.03] px-4 py-3 text-sm last:border-b-0"
          style={{ animation: `tj-fade-up 0.38s ease-out ${Math.min(idx * 30, 300)}ms forwards`, opacity: 0 }}
        >
          <div className="col-span-2 font-semibold text-[#22D3EE] sm:col-span-1">{item.rank}</div>
          <div className="col-span-6 truncate sm:col-span-7">
            <span className="font-medium text-white">{item.displayName ?? item.username ?? "—"}</span>
            {item.username ? <span className="ml-2 text-xs text-[#A1A1AA]">@{item.username}</span> : null}
          </div>
          <div className="col-span-2 text-right font-medium">{formatNumber(item.coinsEarned)}</div>
          <div className="col-span-2 text-right text-[#A78BFA]">{item.streak}🔥</div>
        </div>
      ))}
    </div>
  );
}

function BlogPanel({
  posts,
  allCount,
  ready,
  onMore,
  copy,
  locale
}: {
  posts: BlogPost[];
  allCount: number;
  ready: boolean;
  onMore: () => void;
  copy: Copy;
  locale: Locale;
}) {
  if (!ready) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-[#111215]" />
        ))}
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#111215] p-10 text-center">
        <p className="text-sm text-[#A1A1AA]">{copy.emptyBlog}</p>
      </div>
    );
  }
  const hasMore = posts.length < allCount;
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, idx) => (
          <BlogCard key={post.id} post={post} idx={idx} copy={copy} locale={locale} />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-6 text-center">
          <button
            onClick={onMore}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-[#A1A1AA] transition hover:border-cyan-400/30 hover:text-cyan-200"
          >
            +{Math.min(12, allCount - posts.length)}
          </button>
        </div>
      ) : null}
    </>
  );
}

function BlogCard({
  post,
  idx,
  copy,
  locale
}: {
  post: BlogPost;
  idx: number;
  copy: Copy;
  locale: Locale;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/${locale}/blog#${post.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/5 bg-[#111215] transition hover:border-cyan-400/20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.38s ease-out ${(idx % 6) * 80}ms, transform 0.38s ease-out ${(idx % 6) * 80}ms`
      }}
    >
      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
      )}
      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-cyan-200">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-[#A1A1AA]">{snippet(post.content)}</p>
        <p className="mt-3 text-xs text-[#A1A1AA]">
          {copy.byAuthor} {post.author_name ?? "TJFit"}
        </p>
      </div>
    </Link>
  );
}

function MembersPanel({ count, copy }: { count: number; copy: Copy }) {
  const text = copy.membersCount.replace("{count}", formatNumber(count));
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111215] p-10 text-center">
      <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-200">
        {copy.membersComingSoon}
      </span>
      <p className="mt-6 text-2xl font-semibold text-white sm:text-3xl">{text}</p>
    </div>
  );
}
