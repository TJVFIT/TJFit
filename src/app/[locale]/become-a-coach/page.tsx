import { isLocale } from "@/lib/i18n";

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8 text-center">
        <span className="badge">Coming Soon</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Coach Applications Coming Soon</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          We are currently onboarding coaches privately. Public applications will open soon.
        </p>
      </div>
    </div>
  );
}
