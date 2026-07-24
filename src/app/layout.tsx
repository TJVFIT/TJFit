import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk, Space_Mono } from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "TJFit — Train with intelligence",
    template: "%s | TJFit"
  },
  description:
    "Personalized training, nutrition systems, coaching and an AI fitness guide in one focused platform.",
  applicationName: "TJFit",
  openGraph: {
    title: "TJFit — Train with intelligence",
    description: "Your training system, rebuilt around measurable progress.",
    type: "website",
    siteName: "TJFit"
  },
  twitter: {
    card: "summary_large_image",
    title: "TJFit — Train with intelligence",
    description: "Your training system, rebuilt around measurable progress."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050a16"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
