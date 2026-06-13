import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
      ],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${API_URL}/:path*`,
        },
      ],
    };
  },
  experimental: {
    proxyTimeout: 300000,
  },
};

export default nextConfig;

