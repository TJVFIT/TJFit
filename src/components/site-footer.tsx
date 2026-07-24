import Link from "next/link";
import { ArrowUpRight, Dumbbell } from "lucide-react";

import type { Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-24 border-t border-white/[0.08]">
      <div className="page-shell py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.7fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent-soft/20 bg-accent/10">
                <Dumbbell className="h-4 w-4 text-accent-soft" aria-hidden />
              </span>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-white">TJFit</p>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
              Train with a clear system. Adapt with real data. Keep the work focused on progress you can measure.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Platform</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-300">
              <Link href={`/${locale}/programs`} className="hover:text-white">Programs</Link>
              <Link href={`/${locale}/ai`} className="hover:text-white">TJAI</Link>
              <Link href={`/${locale}/community`} className="hover:text-white">Community</Link>
              <Link href={`/${locale}/membership`} className="hover:text-white">Membership</Link>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Legal</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-300">
              <Link href={`/${locale}/privacy-policy`} className="hover:text-white">Privacy</Link>
              <Link href={`/${locale}/terms-and-conditions`} className="hover:text-white">Terms</Link>
              <Link href={`/${locale}/refund-policy`} className="hover:text-white">Refunds</Link>
              <Link href={`/${locale}/support`} className="inline-flex items-center gap-2 hover:text-white">
                Support <ArrowUpRight className="h-3.5 w-3.5 text-accent-soft" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.08] pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TJFit</p>
          <p>Train / adapt / progress</p>
        </div>
      </div>
    </footer>
  );
}
