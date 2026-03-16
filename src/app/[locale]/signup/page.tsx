import Link from "next/link";

import { isLocale } from "@/lib/i18n";

export default function SignupPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8 text-center">
        <span className="badge">Coming soon</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Account creation is not available yet.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Customer and coach accounts will be available soon. If you have admin access, use the login page.
        </p>
        <Link
          href={`/${params.locale}/login`}
          className="mt-8 inline-block rounded-full border border-white/10 px-6 py-3 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
