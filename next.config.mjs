import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei"
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
  // Baseline security headers applied to every response.
  // Permissions-Policy keeps microphone=(self) — TJAI voice input uses the
  // Web Speech API; camera/geolocation are unused anywhere in the app.
  // HSTS uses no `preload` to avoid the irreversible preload-list commitment.
  // CSP ships Report-Only (production builds only, so dev webpack-eval noise
  // stays out of local consoles): it cannot break anything, and DevTools
  // surfaces every violation so the policy can be tightened then enforced.
  // 'unsafe-inline' in script-src is required until Next.js nonces are wired.
  async headers() {
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://kohuiyqyixvrcqeepalz.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://www.facebook.com",
      "font-src 'self' data:",
      "connect-src 'self' https://kohuiyqyixvrcqeepalz.supabase.co wss://kohuiyqyixvrcqeepalz.supabase.co https://*.google-analytics.com https://analytics.tiktok.com https://www.facebook.com https://*.sentry.io",
      "media-src 'self' blob: data: https://kohuiyqyixvrcqeepalz.supabase.co",
      "worker-src 'self' blob:",
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      // WP-SEC-03 stage 1: both reporting wires point at the same collector —
      // report-uri for legacy engines, report-to (Reporting-Endpoints header
      // below) for modern Chromium. Relative URLs resolve per-origin, so
      // preview deploys report to themselves, never to prod.
      "report-uri /api/csp-report",
      "report-to csp"
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          ...(process.env.NODE_ENV === "production"
            ? [
                { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
                { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' }
              ]
            : [])
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
