import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { TrackingScripts } from "@/components/marketing/tracking-scripts";
import { BrandOrganizationJsonLd } from "@/components/brand-organization-json-ld";
import { GooeyFilter } from "@/components/ui/gooey-button";
import { WarpBackground } from "@/components/ui/warp-background";
import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Display font — Space Grotesk: futuristic geometric grotesque with a
// technical edge; carries the premium/AI brand voice.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
  preload: true
});

// Body font — Manrope: ultra-clean, engineered for screens
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: true
});

// Technical mono — JetBrains Mono: numerals, eyebrows, set/rep notation.
// Used on bundle pages to give programs a lab-instrument feel.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
  preload: true
});

let siteUrl: string;
try {
  siteUrl = getSiteUrl();
  new URL(siteUrl);
} catch {
  siteUrl = "https://tjfit.org";
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
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#09090B"
};

const defaultTitle = "TJFit — Premium Fitness Transformation Platform";
const defaultDescription =
  "Complete 12-week programs and diet systems built like a real coach plan. Home or gym. Fat loss or muscle gain.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: "%s | TJFit" },
  description: defaultDescription,
  applicationName: "TJFit",
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
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="tj-grain font-sans antialiased">
        <GooeyFilter />
        <WarpBackground />
        <BrandOrganizationJsonLd />
        <TrackingScripts />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
