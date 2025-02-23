// next.config.mjs

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**"
      }
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 1 semaine
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  experimental: {
    esmExternals: true
  },
  reactStrictMode: true,
  // Optionnel : Activation de la compression Brotli
  compress: true
};

export default nextConfig;