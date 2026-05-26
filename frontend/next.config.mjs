
// import withPWAInit from "next-pwa";

// const withPWA = withPWAInit({
//   dest: "public",
//   register: false,
//   skipWaiting: true,
//   disable: false,

//   buildExcludes: [
//     /app-build-manifest\.json$/,
//     /middleware-manifest\.json$/,
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
      urlPattern: /^http:\/\/localhost:8000\/.*/i,
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
      urlPattern: /^http:\/\/localhost:3000\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "interview-ai-page-cache",
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);