import type { NextConfig } from "next";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const nextConfig: NextConfig = {
  turbopack: {},

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
    "embla-carousel-react",
    "lucide-react",
    "sonner",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*" },
    ],
  },

  webpack: (config) => {
    config.resolve = config.resolve || {};
    const gamesPath = path.resolve(__dirname, "packages/games");
    const gamePlatformPath = path.resolve(__dirname, "packages/game-platform/src");
    const pointclickPath = path.resolve(__dirname, "packages/pointclick-engine/src");
    const uiPath = path.resolve(__dirname, "packages/ui/src");

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Map @games/shared to the game-platform barrel (this is the key alias)
      "@games/shared": gamePlatformPath,
      "@games/shared/components": path.resolve(gamePlatformPath, "components"),
      "@games/shared/contexts": path.resolve(gamePlatformPath, "contexts"),
      "@games/shared/lib": path.resolve(gamePlatformPath, "lib"),
      // Individual game packages
      "@games/_engine": path.resolve(gamesPath, "_engine"),
      "@games/breakout": path.resolve(gamesPath, "breakout/src"),
      "@games/knitzy": path.resolve(gamesPath, "knitzy/src"),
      "@games/memory": path.resolve(gamesPath, "memory/src"),
      "@games/snake": path.resolve(gamesPath, "snake/src"),
      "@games/checkers": path.resolve(gamesPath, "checkers/src"),
      "@games/chess": path.resolve(gamesPath, "chess/src"),
      "@games/bubble-pop": path.resolve(gamesPath, "bubble-pop/src"),
      "@games/platformer": path.resolve(gamesPath, "platformer/src"),
      "@games/tetris": path.resolve(gamesPath, "tetris/src"),
      "@games/tower-defense": path.resolve(gamesPath, "tower-defense/src"),
      "@games/rite-of-discovery": path.resolve(gamesPath, "rite-of-discovery/src"),
      "@games/systems-discovery": path.resolve(gamesPath, "systems-discovery/src"),
      "@games/toymaker-escape": path.resolve(gamesPath, "toymaker-escape/src"),
      "@games/chrono-shift": path.resolve(gamesPath, "chrono-shift/src"),
      "@games/elemental-conflux": path.resolve(gamesPath, "elemental-conflux/src"),
      "@games/quantum-architect": path.resolve(gamesPath, "quantum-architect/src"),
      // Pointclick engine
      "@games/pointclick-engine": pointclickPath,
      // UI package
      "@gamehub/ui": uiPath,
      // Game platform
      "@gamehub/game-platform": gamePlatformPath,
    };
    return config;
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  },
};

export default nextConfig;
