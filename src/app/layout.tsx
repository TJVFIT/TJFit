import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AuthProvider } from "@/components/auth-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { TrackingScripts } from "@/components/marketing/tracking-scripts";
import { BrandOrganizationJsonLd } from "@/components/brand-organization-json-ld";
import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";
import { isTaskAvailable } from "@/lib/tjai/provider-policy";
import "./globals.css";

/* ---------------------------------------------------------------------------
 * Typography — all self-hosted from src/fonts. No Google Fonts request: no
 * third-party round trip on first paint, and no font CDN in the critical path
 * of a page we're trying to sell from.
 *
 * Every Latin face below was verified against its actual binary (fontTools
 * cmap inspection) for Turkish — ı İ ğ Ğ ş Ş — and French/Spanish accents,
 * rather than trusting a "Latin Extended" subset label.
 * ------------------------------------------------------------------------- */

// Display — Bricolage Grotesque. Variable on three axes (opsz 12-96,
// wght 200-800, wdth 75-100), which is where the character lives: headlines
// can tighten and gain weight together instead of just scaling up.
// Subset to Latin + Latin-Ext: 399 KB TTF -> 143 KB woff2.
const display = localFont({
  src: "../fonts/BricolageGrotesque-Variable.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-display",
  preload: true,
  fallback: ["Segoe UI", "system-ui", "sans-serif"]
});

// Body — Switzer. Restrained neo-grotesque that recedes at 14-16px so it
// doesn't argue with the display face.
const sans = localFont({
  src: [
    { path: "../fonts/Switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Switzer-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Switzer-700.woff2", weight: "700", style: "normal" }
  ],
  display: "swap",
  variable: "--font-sans",
  preload: true,
  fallback: ["Segoe UI", "system-ui", "sans-serif"]
});

// Technical mono — JetBrains Mono variable. Numerals, eyebrows, set/rep
// notation; gives programs a lab-instrument feel.
const mono = localFont({
  src: "../fonts/JetBrainsMono-Variable.woff2",
  weight: "100 800",
  display: "swap",
  variable: "--font-mono",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"]
});

// Arabic — IBM Plex Sans Arabic. NOT preloaded and NOT in the global fallback
// chain: its Latin is missing İ, ğ, Ğ, ş and Ş (verified in the binary), so a
// Turkish page falling through to it would lose glyphs. It is applied only
// under :root[lang="ar"] in globals.css.
const arabic = localFont({
  src: [
    { path: "../fonts/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" }
  ],
  display: "swap",
  variable: "--font-arabic",
  preload: false
});

let siteUrl: string;
try {
  siteUrl = getSiteUrl();
  new URL(siteUrl);
} catch {
  siteUrl = "https://tjfit.org";
}

if (!isTaskAvailable("plan_generate")) {
  console.error("FATAL: no LLM backend configured (TJAI_LLM_* / OPENAI_API_KEY / ANTHROPIC_API_KEY) — TJAI plan generation will not work");
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
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} ${arabic.variable}`}
    >
      <body className="tj-grain font-sans antialiased">
        <BrandOrganizationJsonLd />
        <TrackingScripts />
        <SmoothScroll />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
