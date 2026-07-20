import type { NextConfig } from "next";

/**
 * Phase 5A note: adjust `images.remotePatterns` and `env` once the
 * real Technical Architecture doc specifies CMS/media/API hosts.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // SEO/AEO/GEO (Phase 6): trailing slash + redirects policy should be
  // finalized against that doc; left at framework defaults for now.
  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
