import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "https://your-backend-url.com";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/__clerk/:path*",
      destination: "https://api.clerk.com/v1/:path*",
    },
    {
      source: "/api/:path*",
      destination:
        process.env.NODE_ENV === "production"
          ? `${backendUrl.replace(/\/$/, "")}/api/:path*`
          : "http://localhost:4000/api/:path*",
    },
  ],
};

export default nextConfig;