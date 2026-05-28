
// import withPWAInit from "next-pwa";

// const withPWA = withPWAInit({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: false,
//   buildExcludes: [/app-build-manifest\.json$/],
//   runtimeCaching: [
//     {
//       urlPattern: /^http:\/\/localhost:8000\/.*/i,
//       handler: "NetworkFirst",
//       options: {
//         cacheName: "interview-ai-api-cache",
//         expiration: {
//           maxEntries: 50,
//           maxAgeSeconds: 60 * 60,
//         },
//       },
//     },
//     {
//       urlPattern: /^http:\/\/localhost:3000\/.*/i,
//       handler: "StaleWhileRevalidate",
//       options: {
//         cacheName: "interview-ai-page-cache",
//       },
//     },
//   ],
// });

// const nextConfig = {
//   reactStrictMode: true,
// };

// export default withPWA(nextConfig);
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/app-build-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/interview-ai-production-517f\.up\.railway\.app\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "interview-ai-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https:\/\/welcoming-alignment-production-92b0\.up\.railway\.app\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "interview-ai-page-cache",
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

export default withPWA(nextConfig);