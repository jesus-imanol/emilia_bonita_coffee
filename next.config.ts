import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de relleno (placeholder). TODO: sustituir por fotos reales en /public.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
