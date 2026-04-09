import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { TrackingScripts } from "@/components/marketing/tracking-scripts";
import { BrandOrganizationJsonLd } from "@/components/brand-organization-json-ld";
import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";
import "../../sentry.client.config";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans"
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display"
});

let siteUrl: string;
try {
  siteUrl = getSiteUrl();
  new URL(siteUrl);
} catch {
  siteUrl = "https://tjfit.com";
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("FATAL: ANTHROPIC_API_KEY is not set");
}

if (!process.env.RESEND_API_KEY) {
  console.error("FATAL: RESEND_API_KEY is not set");
}

function googleVerificationToken(): string | undefined {
  const raw = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (!raw) return undefined;
  const prefix = "google-site-verification=";
  return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
}

const googleVerification = googleVerificationToken();

export const viewport: Viewport = {
  viewportFit: "cover"
};

const defaultTitle = "TJFit — Premium Fitness Transformation Platform";
const defaultDescription =
  "Complete 12-week programs and diet systems built like a real coach plan. Home or gym. Fat loss or muscle gain.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | TJFit"
  },
  description: defaultDescription,
  applicationName: "TJFit",
  themeColor: "#09090B",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    capable: true,
    title: "TJFit",
    statusBarStyle: "black-translucent"
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TJFit",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: BRAND.ogDefault,
        width: 1200,
        height: 630,
        alt: defaultTitle
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [BRAND.ogDefault]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <BrandOrganizationJsonLd />
        <TrackingScripts />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
