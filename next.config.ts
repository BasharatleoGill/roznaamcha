import type { NextConfig } from "next";

// When NEXT_EXPORT=1 the app is built as a fully-static bundle for GitHub Pages.
// In all other modes (local dev, self-hosted server) the config stays as-is and
// security headers / server-side features remain active.
const isStaticExport = process.env.NEXT_EXPORT === "1";
const BASE_PATH = "/roznaamcha";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  ...(isStaticExport
    ? {
        output: "export",
        basePath: BASE_PATH,
        assetPrefix: BASE_PATH,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              // Ensure the service worker is always re-fetched (never stale-cached)
              source: "/sw.js",
              headers: [
                { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
              ],
            },
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                { key: "X-XSS-Protection", value: "1; mode=block" },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com",
                    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.googleapis.com https://firebasestorage.googleapis.com",
                    "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://*.firebasedatabase.app https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
                    "worker-src 'self'",
                    "frame-src https://accounts.google.com https://*.firebaseapp.com",
                  ].join("; "),
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
