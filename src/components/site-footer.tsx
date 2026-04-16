"use client";

import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";
import { getFooterCopy } from "@/lib/launch-copy";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = getFooterCopy(locale);

  const linkClass = "text-[#A1A1AA] transition-colors duration-150 hover:text-white inline-block";

  const productLinks = [
    { href: `/${locale}/programs`, label: copy.programs },
    { href: `/${locale}/diets`, label: copy.diets },
    { href: `/${locale}/start`, label: copy.startFree },
    { href: `/${locale}/coaches`, label: copy.findCoach }
  ];

  const companyLinks = [
    { href: `/${locale}/legal`, label: copy.legalHub },
    { href: `/${locale}/legal#faq`, label: copy.faq },
    { href: `/${locale}/terms-and-conditions`, label: copy.terms },
    { href: `/${locale}/privacy-policy`, label: copy.privacy },
    { href: `/${locale}/refund-policy`, label: copy.refundPolicy },
    { href: `/${locale}/press`, label: "Press & Media" }
  ];

  const supportLinks = [
    { href: `/${locale}/support`, label: copy.contact },
    { href: `/${locale}/become-a-coach`, label: copy.becomeCoach },
    { href: `/${locale}/community`, label: copy.community }
  ];

  return (
    <footer className="border-t border-[#1E2028] bg-[#09090B]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-16 text-sm lg:grid-cols-4 lg:gap-12 lg:px-8">
        <div className="text-center lg:text-start">
          <Link href={`/${locale}`} className="inline-flex justify-center py-1 lg:justify-start transition-opacity hover:opacity-80">
            <Image
              src="/assets/hero/logo-tjfit-3d.png"
              alt="TJFit"
              width={400}
              height={320}
              style={{
                height: 72,
                width: "auto",
                filter: "drop-shadow(0 0 10px rgba(34,211,238,0.4))"
              }}
            />
          </Link>
          <p className="mt-3 text-sm font-medium uppercase tracking-widest text-[#A1A1AA]">{copy.tagline}</p>
          <p className="mt-4 max-w-sm leading-relaxed text-zinc-500 lg:max-w-none">{copy.description}</p>
        </div>

        <div className="text-center lg:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{copy.productTitle}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {productLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center lg:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{copy.companyTitle}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {companyLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center lg:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{copy.supportTitle}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {supportLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E2028] px-6 py-5 text-center text-xs text-zinc-500 lg:px-8">
        © {new Date().getFullYear()} TJFit. All rights reserved.
      </div>
    </footer>
  );
}

