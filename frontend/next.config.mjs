import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,

  buildExcludes: [/app-build-manifest\.json$/],

  // fallbacks: {
  //   document: "/_offline",
  // },

  runtimeCaching: [
   
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "interview-ai-pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },

    // Static JS/CSS/font assets
    {
      urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "interview-ai-static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },

    // Images/icons
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "interview-ai-images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
};

export default withPWA(nextConfig);