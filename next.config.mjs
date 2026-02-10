/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Speed up builds -- type checking done separately via tsc
    ignoreBuildErrors: true,
  },

  eslint: {
    // Speed up builds -- linting done separately
    ignoreDuringBuilds: true,
  },

  images: {
    // Offload image processing: use unoptimized for external CDN images
    // (e.g., Bunny CDN, Cloudinary) to reduce Vercel build load.
    // For self-hosted images, Next.js will still optimize on-demand (ISR).
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Limit image sizes to reduce build-time processing
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/avif", "image/webp"],
  },

  // Enable output tracing for smaller deployments
  output: "standalone",

  // Experimental optimizations
  experimental: {
    // Enable build-time cache for faster subsequent builds
    webpackBuildWorker: true,
  },

  // Cache static assets aggressively
  headers: async () => [
    {
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
