import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:4000";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination:
        process.env.NODE_ENV === "production"
          ? `${backendUrl.replace(/\/$/, "")}/api/:path*`
          : "http://localhost:4000/api/:path*",
    },
  ],
   experimental: {
    proxyTimeout: 60000,
  },
};

export default nextConfig;