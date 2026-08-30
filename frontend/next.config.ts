import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination:
        process.env.NODE_ENV === "production"
          ? "https://your-backend-url.com/api/:path*"   // ← replace with your production backend URL
          : "http://localhost:4000/api/:path*",          // ← make sure this is port 3000
    },
  ],
};

export default nextConfig;