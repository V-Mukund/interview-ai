import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
  buildExcludes: [/app-build-manifest\.json$/],
  fallbacks: {
    // Offline fallback page for navigation requests
    document: "/_offline",
  },
  runtimeCaching: [
    // ─── NO BACKEND API CACHING / INTERCEPTION ──────────────────────
    // By NOT registering any handlers for backend routes (like /auth/, /prep/, /queue/),
    // the service worker will completely ignore all backend API traffic (localhost:8000
    // or Railway). Requests will bypass Workbox entirely and be handled natively by the browser.
    // This permanently prevents any PWA-related CORS preflight or opaque-response fetch bugs.

    // ─── FRONTEND PAGES: STALE WHILE REVALIDATE ───────────────────
    // Production frontend on Railway
    {
      urlPattern: /^https:\/\/welcoming-alignment-production-92b0\.up\.railway\.app\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "interview-ai-page-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    // Local frontend (development)
    {
      urlPattern: /^http:\/\/localhost:3000\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "interview-ai-local-page-cache",
      },
    },

    // ─── STATIC ASSETS: CACHE FIRST ──────────────────────────────
    {
      urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "interview-ai-static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "interview-ai-images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);