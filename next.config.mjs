/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },

  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: [
    "@games/shared",
    "@games/snake",
    "@games/memory",
    "@games/breakout",
    "@games/knitzy",
    "@games/checkers",
    "@games/chess",
    "@games/bubble-pop",
    "@games/platformer",
    "@games/tetris",
    "@games/tower-defense",
    "@games/rite-of-discovery",
    "@games/systems-discovery",
    "@games/toymaker-escape",
    "@games/block-blast",
    "@games/chrono-shift",
    "@games/elemental-conflux",
    "@games/quantum-architect",
    "@games/pointclick-engine",
    "@games/_engine",
    "@gamehub/ui",
    "@gamehub/game-platform",
    "embla-carousel-react",
    "embla-carousel",
    "lucide-react",
    "sonner",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    NEXT_PUBLIC_DISABLE_PROVIDERS: process.env.NEXT_PUBLIC_DISABLE_PROVIDERS || "true",
  },
};

export default nextConfig;
