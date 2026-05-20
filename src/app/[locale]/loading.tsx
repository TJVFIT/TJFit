export default function LocaleLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col gap-4 px-4 py-20 sm:px-6 lg:px-8">
      <div className="tj-skeleton h-10 w-48 rounded-lg" />
      <div className="tj-skeleton h-6 w-full max-w-xl rounded-lg" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="tj-skeleton h-40 rounded-2xl ring-1 ring-white/[0.06]" />
        <div className="tj-skeleton h-40 rounded-2xl ring-1 ring-white/[0.06]" />
      </div>
    </div>
  );
}
