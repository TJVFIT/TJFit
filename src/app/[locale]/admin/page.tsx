import { BarChart3 } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AdminCoachApplications } from "@/components/admin-coach-applications";
import { AdminCoachAuthorization } from "@/components/admin-coach-authorization";
import { AdminBlogPanel } from "@/components/admin-blog-panel";
import { AdminChallengesPanel } from "@/components/admin-challenges-panel";
import { AdminBundlePayments } from "@/components/admin-bundle-payments";
import { AdminCreditPackPayments } from "@/components/admin-credit-pack-payments";
import { AdminFeedbackList } from "@/components/admin-feedback-list";
import { AdminTransformationsPanel } from "@/components/admin-transformations-panel";
import { ProtectedRoute } from "@/components/protected-route";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const dict = getDictionary(locale);

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
    <ProtectedRoute locale={locale} requireAdmin>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">Admin Panel</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Marketplace operations command center.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Approve coaches, review payments, issue refunds, inspect analytics, and manage programs from one premium admin experience.
        </p>
      </div>

      <EmptyState icon={BarChart3} subtext={dict.admin.statsEmpty} />

      <AdminCoachAuthorization locale={locale} />

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
                className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-bright transition hover:border-accent/40"
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
          <div className="mt-6">
            <p className="text-sm text-faint">No pending approvals.</p>
          </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminBundlePayments />
        <AdminCreditPackPayments />
        <AdminChallengesPanel />
        <AdminBlogPanel />
        <AdminTransformationsPanel />
        <AdminFeedbackList initialSubmissions={submissions} />
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Advanced analytics</p>
          {/* Fake-zero tiles removed (chunk C follow-up) — real revenue/conversion
              aggregation is Wave-2 work; until then this panel is honestly empty. */}
          <EmptyState icon={BarChart3} subtext={dict.admin.statsEmpty} className="mt-6" />
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Security and platform controls</p>
          <div className="mt-6 space-y-3">
            {[
              "Secure authentication with role-ready access control",
              "Anti-spam systems for community and signup flows",
              "Payment webhooks and checkout completion verified server-side",
              "Rate limiting for public endpoints",
              "Architecture ready for AI workout, nutrition, and injury prevention"
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-bright">
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
