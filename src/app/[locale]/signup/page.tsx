import { isLocale } from "@/lib/i18n";

export default function SignupPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8">
        <span className="badge">Signup</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Create your TJFit account.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Premium onboarding flow for users and future coach applications.
        </p>

        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Full name" />
          <input className="input" placeholder="Email" />
          <input className="input" placeholder="Preferred language" />
          <input className="input" type="password" placeholder="Password" />
          <button className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
