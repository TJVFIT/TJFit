import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { TrackingScripts } from "@/components/marketing/tracking-scripts";
import { BrandOrganizationJsonLd } from "@/components/brand-organization-json-ld";
import { BRAND } from "@/lib/brand-assets";
import { getSiteUrl } from "@/lib/site-url";
import "../../sentry.client.config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

let siteUrl: string;
try {
  siteUrl = getSiteUrl();
  new URL(siteUrl);
} catch {
  siteUrl = "https://tjfit.org";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TJFit | Premium Coaching Platform",
  description:
    "A premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation.",
  applicationName: "TJFit",
  themeColor: "#0a0a0b",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-touch-icon.png"
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
    title: "TJFit | Premium Coaching Platform",
    description:
      "A premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation.",
    url: siteUrl,
    siteName: "TJFit",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: BRAND.ogDefault,
        width: 1200,
        height: 630,
        alt: "TJFit"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TJFit | Premium Coaching Platform",
    description:
      "A premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation.",
    images: [{ url: BRAND.ogDefault, width: 1200, height: 630, alt: "TJFit" }]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        <BrandOrganizationJsonLd />
        <TrackingScripts />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
