// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co", // Ajout du wildcard pour tous les sous-domaines
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
  },
  experimental: {
    esmExternals: true,
  },
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;
