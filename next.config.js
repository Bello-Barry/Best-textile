// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    esmExternals: true, // Active le support des modules ECMAScript
  },
  reactStrictMode: true,
};

// next.config.mjs

export default nextConfig;
