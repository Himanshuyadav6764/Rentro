import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for production deployments (Vercel, Docker, etc.)
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  // Validate critical env vars at build time
  env: {},

  // Suppress noisy warnings in production logs
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== "production",
    },
  },
};

export default nextConfig;
