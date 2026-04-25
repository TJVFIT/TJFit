import Link from "next/link";

export default function RootNotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[25rem] w-[25rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.06)_0%,transparent_72%)]"
        aria-hidden
      />
      <p className="animate-[tj-fade-up_380ms_ease-out_forwards] bg-gradient-to-br from-[#1E2028] to-[#2D2F38] bg-clip-text text-[clamp(6rem,20vw,12rem)] font-extrabold leading-none text-transparent" style={{ animationDelay: "100ms", opacity: 0 }}>
        404
      </p>
      <h1 className="mt-4 animate-[tj-fade-up_380ms_ease-out_forwards] text-3xl font-bold text-white" style={{ animationDelay: "200ms", opacity: 0 }}>
        Page not found.
      </h1>
      <p className="mt-2 animate-[tj-fade-up_380ms_ease-out_forwards] text-sm text-muted sm:text-base" style={{ animationDelay: "300ms", opacity: 0 }}>
        This page does not exist or has been moved.
      </p>
      <Link
        href="/en"
        className="mt-8 inline-flex min-h-[44px] animate-[tj-fade-up_380ms_ease-out_forwards] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white"
        style={{ animationDelay: "400ms", opacity: 0 }}
      >
        ? Back to TJFit
      </Link>
    </section>
  );
}
