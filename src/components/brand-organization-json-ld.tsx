import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";

function safeOrigin(): string {
  try {
    const u = getSiteUrl();
    new URL(u);
    return u.replace(/\/$/, "");
  } catch {
    return "https://tjfit.org";
  }
}

/** Organization + logo for Google rich results (best-effort; requires indexing). */
export function BrandOrganizationJsonLd() {
  const origin = safeOrigin();
  const logoUrl = `${origin}${BRAND.logoIcon192}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TJFit",
    url: origin,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      contentUrl: logoUrl,
      width: 192,
      height: 192
    },
    image: `${origin}${BRAND.ogDefault}`,
    description:
      "Premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
