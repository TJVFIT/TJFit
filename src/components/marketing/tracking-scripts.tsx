"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { getCookieConsent } from "@/components/cookie-consent";

/**
 * Loads GA4 / Meta / TikTok only when BOTH are true:
 *   1. the matching public env ID is set, and
 *   2. the visitor has granted the matching consent category.
 * GA4 is "analytics"; Meta + TikTok pixels are "marketing". Firing pixels
 * before consent is a GDPR/ePrivacy violation (see cookie-consent.tsx), so
 * this gate is required, not optional. Re-evaluates live when the consent
 * banner dispatches "tjfit:cookie-consent-changed".
 */
export function TrackingScripts() {
  const [consent, setConsent] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const sync = () => {
      const c = getCookieConsent();
      setConsent({ analytics: c.analytics, marketing: c.marketing });
    };
    sync();
    window.addEventListener("tjfit:cookie-consent-changed", sync);
    return () => window.removeEventListener("tjfit:cookie-consent-changed", sync);
  }, []);

  const ga4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();

  return (
    <>
      {ga4 && consent.analytics ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="tjfit-ga4" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4}', { anonymize_ip: true });
            `.trim()}
          </Script>
        </>
      ) : null}

      {meta && consent.marketing ? (
        <Script id="tjfit-meta-pixel" strategy="afterInteractive">
          {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${meta}');
fbq('track', 'PageView');
          `.trim()}
        </Script>
      ) : null}

      {tiktok && consent.marketing ? (
        <Script
          src={`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(tiktok)}&lib=ttq`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
