import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { TrackingScripts } from "@/components/marketing/tracking-scripts";
import { BrandOrganizationJsonLd } from "@/components/brand-organization-json-ld";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";
import "../../sentry.client.config";
import "./globals.css";

// Display font — Sora: premium geometric, modern tech-forward
const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
  preload: true
});

// Body font — DM Sans: ultra-clean, engineered for screens
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: true
});

let siteUrl: string;
try {
  siteUrl = getSiteUrl();
  new URL(siteUrl);
} catch {
  siteUrl = "https://tjfit.com";
}

if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set — TJAI plan generation will not work");
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
  title: { default: defaultTitle, template: "%s | TJFit" },
  description: defaultDescription,
  applicationName: "TJFit",
  themeColor: "#09090B",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: BRAND.faviconIco, type: "image/x-icon" }],
    apple: [{ url: BRAND.appleTouchIcon, type: "image/png" }],
    other: [
      { rel: "icon", url: BRAND.logoIcon192, type: "image/png", sizes: "192x192" },
      { rel: "icon", url: BRAND.logoIcon512, type: "image/png", sizes: "512x512" }
    ]
  },
  appleWebApp: { capable: true, title: "TJFit", statusBarStyle: "black-translucent" },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TJFit",
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: BRAND.ogDefault, width: 1200, height: 630, alt: defaultTitle }]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [BRAND.ogDefault]
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sora.variable}`}>
      <body className="tj-grain font-sans antialiased">
        <BrandOrganizationJsonLd />
        <TrackingScripts />
        <CursorGlow />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
