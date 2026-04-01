import { requireLocaleParam } from "@/lib/require-locale";

export default function AiPage({ params }: { params: { locale: string } }) {
  requireLocaleParam(params.locale);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8 text-center">
        <span className="badge">Coming Soon</span>
        <h1 className="mt-6 text-4xl font-semibold text-white">TJFIT AI Coming Soon</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          Our AI assistant is being prepared with premium fitness guidance and personalized support.
        </p>
      </div>
    </div>
  );
}
