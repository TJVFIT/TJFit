import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const dict = getDictionary(params.locale as Locale);
  const ls = dict.launchingSoon;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge">{ls.badge}</span>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {ls.title}
        </h1>
        <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
          {ls.subtitle}
        </p>
        <div className="mt-10">
          <Link
            href={`/${params.locale}/login`}
            className="gradient-button inline-flex rounded-full px-8 py-4 text-base font-medium text-white"
          >
            {ls.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
