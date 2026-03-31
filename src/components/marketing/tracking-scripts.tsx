import Script from "next/script";

/**
 * Loads GA4 / Meta / TikTok only when public env IDs are set.
 * Extend with a CMP gate later by wrapping or conditional rendering.
 */
export function TrackingScripts() {
  const ga4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();

  return (
    <>
      {ga4 ? (
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

      {meta ? (
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

      {tiktok ? (
        <Script
          src={`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(tiktok)}&lib=ttq`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
