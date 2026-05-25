// import withPWAInit from 'next-pwa';

// const withPWA = withPWAInit({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: false,
// });

// const nextConfig = {
//   reactStrictMode: true,
// };

// export default withPWA(nextConfig);
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: false,
  skipWaiting: true,
  disable: false,

  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);