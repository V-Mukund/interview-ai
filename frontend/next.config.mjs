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
    // ─── POLLING ENDPOINTS: NEVER CACHE ────────────────────────────
    // Queue status polling must always go to network (stale data = broken UX)
    {
      urlPattern: /\/queue\/status\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "interview-ai-polling",
      },
    },
    {
      urlPattern: /\/queue\/jobs\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "interview-ai-jobs-polling",
      },
    },
    // Async question generation — always network
    {
      urlPattern: /\/prep\/questions\/async/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "interview-ai-question-gen",
      },
    },
    // Submission endpoint — always network
    {
      urlPattern: /\/prep\/submit/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "interview-ai-submit",
      },
    },

    // ─── API DATA: NETWORK FIRST (cacheable for offline fallback) ──
    // Backend API on Railway (production)
    {
      urlPattern: /^https:\/\/interview-ai-production-517f\.up\.railway\.app\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "interview-ai-api-cache",
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Local backend (development)
    {
      urlPattern: /^http:\/\/localhost:8000\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "interview-ai-local-api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

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