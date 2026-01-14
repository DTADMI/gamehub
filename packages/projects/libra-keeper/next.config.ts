import type { NextConfig } from "next";

// Only apply PWA in production or when explicitly enabled in development
const withPWA =
  process.env.ENABLE_PWA === "true"
    ? require("next-pwa")({
        dest: "public",
        disable: process.env.NODE_ENV !== "production",
      })
    : (config: NextConfig) => config;

const nextConfig: NextConfig = withPWA({
  // Configure output file tracing
  output: "standalone",

  // Set the root directory for file tracing
  outputFileTracingRoot: __dirname,

  // Skip TypeScript errors during build (Prisma client not generated)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow importing from workspace packages
  experimental: {
    externalDir: true,
  },
});

export default nextConfig;
