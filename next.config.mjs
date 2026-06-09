import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@splinetool/react-spline",
    "@splinetool/runtime"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "kohuiyqyixvrcqeepalz.supabase.co"
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true
      }
    ];
  },
  // Baseline security headers applied to every response. Deliberately omits
  // Content-Security-Policy: a CSP needs per-embed testing
  // (Spline/Three.js/GA4/Meta/Supabase/Sentry/Gumroad) in a supervised pass.
  // Permissions-Policy keeps microphone=(self) — TJAI voice input uses the
  // Web Speech API; camera/geolocation are unused anywhere in the app.
  // HSTS uses no `preload` to avoid the irreversible preload-list commitment.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" }
        ]
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  }
});
