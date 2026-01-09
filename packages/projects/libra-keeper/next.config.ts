import type { NextConfig } from "next";
import path from "path";

// Only apply PWA in production or when explicitly enabled in development
const withPWA =
  process.env.ENABLE_PWA === "true"
    ? require("next-pwa")({
        dest: "public",
        disable: process.env.NODE_ENV !== "production",
      })
    : (config: NextConfig) => config;

const nextConfig: NextConfig = withPWA({
  transpilePackages: ["@games/shared"],

  // Configure output file tracing
  output: "standalone",

  // Set the root directory for file tracing
  outputFileTracingRoot: __dirname,

  // Turbopack configuration for module resolution
  turbopack: {},

  // Your other Next.js config options here
  experimental: {
    // Add any experimental features here
  },

  // Webpack configuration for module aliases
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@games/shared": path.resolve(__dirname, "../../shared/src"),
    };
    return config;
  },
});

export default nextConfig;
