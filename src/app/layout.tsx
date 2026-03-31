import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TJFit | Premium Coaching Platform",
  description:
    "A premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation.",
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
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TJFit | Premium Coaching Platform",
    description:
      "A premium multilingual coaching platform for fitness, performance, nutrition, and rehabilitation."
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
