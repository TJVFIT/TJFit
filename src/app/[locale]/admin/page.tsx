import { adminAdvancedStats, adminStats } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AdminCoachApplications } from "@/components/admin-coach-applications";
import { AdminCoachAuthorization } from "@/components/admin-coach-authorization";
import { AdminFeedbackList } from "@/components/admin-feedback-list";
import { ProtectedRoute } from "@/components/protected-route";
import { StatGrid } from "@/components/ui";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  const dict = getDictionary(params.locale);

  const supabase = getSupabaseServerClient();
  let applications: Array<{
    id: string;
    created_at: string;
    age: number;
    full_name: string;
    specialty: string;
    languages: string;
    country: string;
    certifications_and_style: string;
    locale: string | null;
  }> = [];
  let submissions: Array<{
    id: string;
    created_at: string;
    type: string;
    subject: string | null;
    message: string;
    order_reference: string | null;
    email: string | null;
    locale: string | null;
  }> = [];

  if (supabase) {
    const [appsRes, feedbackRes] = await Promise.all([
      supabase.from("coach_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback_submissions").select("*").order("created_at", { ascending: false })
    ]);
    if (appsRes.data) applications = appsRes.data;
    if (feedbackRes.data) submissions = feedbackRes.data;
  }

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">Admin Panel</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Marketplace operations command center.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Approve coaches, review payments, issue refunds, inspect analytics, and manage programs from one premium admin experience.
        </p>
      </div>

      <StatGrid stats={adminStats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminAdvancedStats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-[24px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{stat.label}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <AdminCoachAuthorization />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Admin actions</p>
          <div className="mt-6 space-y-3">
            {[
              "Approve coaches",
              "Manage payments",
              "Issue refunds",
              "View analytics",
              "Manage programs",
              "Inspect referrals",
              "Review challenge data",
              "Review social moderation"
            ].map((item) => (
              <button
                key={item}
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-accent/40"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <AdminCoachApplications dict={dict.admin} initialApplications={applications} />
          <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Approval queue</p>
          <div className="mt-6 space-y-4">
            {[
              "Hassan Ali - Nutrition - UAE",
              "Zeynep Kaya - Pilates - Turkey",
              "Rana Mahmoud - Rehab - Saudi Arabia"
            ].map((entry) => (
              <div
                key={entry}
                className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-zinc-200">{entry}</p>
                <div className="flex gap-3">
                  <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Review</button>
                  <button className="gradient-button rounded-full px-4 py-2 text-sm font-medium text-white">Approve</button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminFeedbackList initialSubmissions={submissions} />
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Advanced analytics</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Revenue", "184,000 TRY"],
              ["Top programs", "Home Fat Loss, Vertical Jump Training"],
              ["Coach conversion", "5.8%"],
              ["Membership growth", "+11.4%"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-200">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Security and platform controls</p>
          <div className="mt-6 space-y-3">
            {[
              "Secure authentication with role-ready access control",
              "Anti-spam systems for community and signup flows",
              "PayTR callback verification for payment integrity",
              "Rate limiting for public endpoints",
              "Architecture ready for AI workout, nutrition, and injury prevention"
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
