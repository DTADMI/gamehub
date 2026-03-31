import type { NextConfig } from "next";
import path from "path";

// Central Next.js config (single source of truth)
const nextConfig: NextConfig = {
  // Prefer standalone when building in Docker runtime
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  // Force absolute asset URLs so chunks load correctly on nested routes (Cloud Run)
  assetPrefix: "/",

  // As of Next.js 16, Turbopack is the default bundler. Because we also define a
  // custom `webpack` config (for local aliases), Next expects a `turbopack` key
  // to acknowledge Turbopack usage. An empty object is sufficient and silences
  // the warning/error: "using Turbopack with a webpack config and no turbopack config".
  // If you need to force webpack instead, invoke `next build --webpack` in CI.
  turbopack: {},

  experimental: {
    // Allow importing files from outside the frontend/ directory using TS path aliases
    externalDir: true,
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Ensure Next transpiles our local workspace packages
  transpilePackages: [
    "@gamehub/game-platform",
    "@gamehub/ui",
    "@games/pointclick-engine",
    "@games/snake",
    "@games/memory",
    "@games/breakout",
    "@games/knitzy",
    "@games/chrono-shift",
    "@games/elemental-conflux",
    "@games/quantum-architect",
    // New point-and-click games (scaffolded)
    "@games/_engine",
    "@games/rite-of-discovery",
    "@games/systems-discovery",
    "@games/toymaker-escape",
    "@react-three/fiber",
    "@react-three/drei",
    "three",
    "lucide-react",
    "sonner",
    "date-fns",
  ],

  // Images: use remotePatterns only (domains is deprecated in Next 16)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*" },
    ],
  },

  // Ensure webpack can resolve our local "@games/*" workspace-style aliases
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    const gamesPath = path.resolve(__dirname, "packages/games");
    const platformPath = path.resolve(__dirname, "packages/game-platform/src");
    const pointClickPath = path.resolve(__dirname, "packages/pointclick-engine/src");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@gamehub/game-platform": platformPath,
      "@games/pointclick-engine": pointClickPath,
      "@games/_engine": path.resolve(gamesPath, "_engine"),
      "@games/breakout": path.resolve(gamesPath, "breakout/src"),
      "@games/knitzy": path.resolve(gamesPath, "knitzy/src"),
      "@games/memory": path.resolve(gamesPath, "memory/src"),
      "@games/snake": path.resolve(gamesPath, "snake/src"),
      "@games/chrono-shift": path.resolve(gamesPath, "chrono-shift/src"),
      "@games/elemental-conflux": path.resolve(gamesPath, "elemental-conflux/src"),
      "@games/quantum-architect": path.resolve(gamesPath, "quantum-architect/src"),
      // New point-and-click games (scaffolded)
      "@games/rite-of-discovery": path.resolve(gamesPath, "rite-of-discovery/src"),
      "@games/systems-discovery": path.resolve(gamesPath, "systems-discovery/src"),
      "@games/toymaker-escape": path.resolve(gamesPath, "toymaker-escape/src"),
      // Force resolution of three and related packages from the apps/frontend node_modules
      three: path.resolve(__dirname, "node_modules/three"),
      "@react-three/fiber": path.resolve(__dirname, "node_modules/@react-three/fiber"),
      "@react-three/drei": path.resolve(__dirname, "node_modules/@react-three/drei"),
      sonner: path.resolve(__dirname, "node_modules/sonner"),
      "date-fns": path.resolve(__dirname, "node_modules/date-fns"),
    };
    return config;
  },

  // No backend proxy; Supabase is accessed directly from the app

  // Redirects for renamed routes
  async redirects() {
    return [
      {
        source: "/games/knitzy",
        destination: "/games/pattern-matching",
        permanent: true,
      },
    ];
  },

  // Security headers with CSP tuned for Next.js 16, next/font, and optional Google Fonts
  async headers() {
    // Allow Google Fonts when used by older pages; next/font is self-hosted and works with 'self'
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: http:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
