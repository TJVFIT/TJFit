import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";

export default function SettingsIndexPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <ProtectedRoute locale={locale}>
      <section className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">
          <span className="tj-title-shimmer">Settings</span>
        </h1>
        <p className="text-sm text-muted">Manage your profile, messaging, and subscription preferences.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Profile Settings", `/${locale}/settings/profile`],
            ["Messaging Settings", `/${locale}/settings/messaging`],
            ["Subscription", `/${locale}/settings/subscription`]
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="group/setrow flex items-center justify-between rounded-xl border border-divider bg-surface p-4 text-bright transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/[0.04] hover:text-cyan-50 hover:shadow-[0_0_22px_rgba(34,211,238,0.14)]"
            >
              <span>{label}</span>
              <span className="text-faint transition-[transform,color] duration-200 motion-safe:group-hover/setrow:translate-x-0.5 group-hover/setrow:text-cyan-200">→</span>
            </Link>
          ))}
        </div>
      </section>
    </ProtectedRoute>
  );
}
