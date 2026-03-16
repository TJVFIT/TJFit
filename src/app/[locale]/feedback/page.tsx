import { getDictionary, isLocale } from "@/lib/i18n";
import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }
  const dict = getDictionary(params.locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[36px] p-8">
        <span className="badge">{dict.feedback.nav}</span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-white sm:text-4xl">
          {dict.feedback.title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {dict.feedback.subtitle}
        </p>
        <div className="mt-8">
          <FeedbackForm dict={dict.feedback} locale={params.locale} />
        </div>
      </div>
    </div>
  );
}
