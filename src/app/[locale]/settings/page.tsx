import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { requireLocaleParam } from "@/lib/require-locale";

export default function SettingsIndexPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  return (
    <ProtectedRoute locale={locale}>
      <section className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted">Manage your profile, messaging, and subscription preferences.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/${locale}/settings/profile`} className="rounded-xl border border-divider bg-surface p-4 text-bright">
            Profile Settings
          </Link>
          <Link href={`/${locale}/settings/messaging`} className="rounded-xl border border-divider bg-surface p-4 text-bright">
            Messaging Settings
          </Link>
          <Link href={`/${locale}/settings/subscription`} className="rounded-xl border border-divider bg-surface p-4 text-bright">
            Subscription
          </Link>
        </div>
      </section>
    </ProtectedRoute>
  );
}
