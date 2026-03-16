import { ProtectedRoute } from "@/components/protected-route";
import { membershipPlans } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function MembershipPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <ProtectedRoute locale={params.locale} requireAdmin>
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="badge">Premium Membership</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Subscription access for your best users.</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Membership lowers booking friction, increases retention, and unlocks exclusive programs, challenge entry, and priority access.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {membershipPlans.map((plan) => (
          <div key={plan.name} className="glass-panel rounded-[36px] p-8 text-center">
            <p className="text-3xl font-semibold text-white">{plan.name}</p>
            <p className="mt-4 text-sm text-zinc-400">Pricing hidden for now</p>

            <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
              {plan.benefits.map((benefit) => (
                <div key={benefit} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
                  {benefit}
                </div>
              ))}
            </div>

            <button className="gradient-button mt-8 rounded-full px-6 py-3 text-sm font-medium text-white">
              Start membership
            </button>
          </div>
        ))}
      </div>
    </div>
    </ProtectedRoute>
  );
}
