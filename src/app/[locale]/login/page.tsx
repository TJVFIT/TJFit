import Link from "next/link";

import { isLocale } from "@/lib/i18n";

export default function LoginPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">Login</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Welcome back.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Supabase auth-ready login page for users, coaches, and admin roles.
        </p>

        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Email" />
          <input className="input" type="password" placeholder="Password" />
          <button className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white">
            Login
          </button>
        </div>

        <p className="mt-6 text-sm text-zinc-400">
          New here?{" "}
          <Link href={`/${params.locale}/signup`} className="text-white underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
