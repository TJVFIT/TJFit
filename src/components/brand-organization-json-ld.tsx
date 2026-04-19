import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";

function safeOrigin(): string {
  try {
    const u = getSiteUrl();
    new URL(u);
    return u.replace(/\/$/, "");
  } catch {
    return "https://tjfit.com";
  }
}

/** Organization + logo for Google rich results (best-effort; requires indexing). */
export function BrandOrganizationJsonLd() {
  const origin = safeOrigin();
  const logoUrl = `${origin}${BRAND.logoFull}`;
  const ogImage = `${origin}${BRAND.ogDefault}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TJFit",
    url: origin,
    logo: logoUrl,
    image: ogImage,
    sameAs: [] as string[],
    description: "Premium fitness transformation platform."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
