// next.config.mjs

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co", // Pour les images stockées sur Supabase
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    esmExternals: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
