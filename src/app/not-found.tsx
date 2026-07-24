import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-4">
      <div className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-soft">404 / off route</p>
        <h1 className="mt-6 font-display text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl">
          This path is not part of the plan.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-400">
          Return to TJFit and keep moving toward the next measurable result.
        </p>
        <Link
          href="/en"
          className="gradient-button mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
