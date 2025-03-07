// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
  },
  experimental: {
    esmExternals: "loose", // Utiliser "loose" au lieu de true pour plus de compatibilité
  },
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;