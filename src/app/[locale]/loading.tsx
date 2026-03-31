export default function LocaleLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col gap-4 px-4 py-20 sm:px-6 lg:px-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="h-6 w-full max-w-xl animate-pulse rounded-lg bg-white/[0.04]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
      </div>
    </div>
  );
}
