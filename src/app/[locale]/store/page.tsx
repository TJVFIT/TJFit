import { getDictionary } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

export default function StorePage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);

  const dict = getDictionary(locale);
  const cs = dict.comingSoon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge">{cs.title}</span>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {cs.title}
        </h1>
        <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
          {cs.subtitle}
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          {cs.storeDescription}
        </p>
      </div>
    </div>
  );
}
