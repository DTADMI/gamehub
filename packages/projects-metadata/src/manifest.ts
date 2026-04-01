/**
 * Projects Manifest
 * Central metadata for all projects in the GameHub platform
 * Similar to games manifest but for full-stack applications
 */

export interface ProjectMetadata {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ProjectCategory;
  tags: string[];

  // Visual assets
  image?: string;
  backgroundImage?: string;
  icon?: string;

  // Status and visibility
  enabled: boolean;
  featured: boolean;
  upcoming: boolean;
  inPreview: boolean;

  // Access control
  accessTier: AccessTier;
  requiresAuth: boolean;
  requiresSubscription: boolean;

  // Technical
  route: string;
  externalUrl?: string; // For projects hosted externally

  // Metadata
  version: string;
  author?: string;
  releaseDate?: string;
  lastUpdated?: string;

  // i18n
  supportedLanguages: string[];

  // Features
  features: string[];
  technologies: string[];
}

export type ProjectCategory =
  | "productivity"
  | "creative"
  | "education"
  | "entertainment"
  | "utility"
  | "social";

export type AccessTier =
  | "free" // Open to all users
  | "freemium" // Basic features free, premium features paid
  | "premium" // Requires subscription
  | "enterprise"; // Custom pricing

/**
 * Projects Manifest
 * Add new projects here to make them available in the platform
 */
export const projectsManifest: ProjectMetadata[] = [
  {
    id: "libra-keeper",
    slug: "libra-keeper",
    title: "LibraKeeper",
    shortDescription: "Personal library management system",
    fullDescription:
      "A comprehensive library management system that helps you track your books, manage lending to friends, and keep your collection organized. Features include barcode scanning, lending tracking, and collection analytics.",
    category: "productivity",
    tags: ["library", "books", "management", "organization", "tracking"],

    image: "/images/projects/libra-keeper-card.png",
    backgroundImage: "/images/projects/libra-keeper-bg.png",
    icon: "/images/projects/libra-keeper-icon.svg",

    enabled: true,
    featured: true,
    upcoming: false,
    inPreview: false,

    accessTier: "freemium",
    requiresAuth: true,
    requiresSubscription: false,

    route: "/projects/libra-keeper",

    version: "0.1.0",
    author: "GameHub Team",
    releaseDate: "2024-12-01",
    lastUpdated: "2026-01-06",

    supportedLanguages: ["en", "fr"],

    features: [
      "Book inventory management",
      "Barcode scanning",
      "Lending tracker",
      "Collection analytics",
      "Reading lists",
      "User profiles",
      "Search and filters",
      "PWA support",
    ],

    technologies: [
      "Next.js 16",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Tailwind CSS",
      "shadcn/ui",
      "NextAuth",
    ],
  },

  {
    id: "quest-hunt",
    slug: "quest-hunt",
    title: "QuestHunt",
    shortDescription: "Mobile-first social geocaching platform",
    fullDescription:
      "Create, participate in, and share location-based treasure hunts. Discover hidden gems in your city, create quests for friends, and explore the world around you in a new way.",
    category: "social",
    tags: ["geocaching", "location", "mobile", "social", "adventure", "maps"],

    image: "/images/projects/quest-hunt-card.png",
    backgroundImage: "/images/projects/quest-hunt-bg.png",
    icon: "/images/projects/quest-hunt-icon.svg",

    enabled: true,
    featured: true,
    upcoming: false,
    inPreview: true,

    accessTier: "freemium",
    requiresAuth: true,
    requiresSubscription: false,

    route: "/projects/quest-hunt",

    version: "0.1.0",
    author: "GameHub Team",
    releaseDate: "2025-01-01",
    lastUpdated: "2026-01-06",

    supportedLanguages: ["en", "fr"],

    features: [
      "Create location-based quests",
      "Real-time GPS tracking",
      "Social sharing",
      "Quest discovery",
      "Achievement system",
      "Mobile-optimized maps",
      "Photo challenges",
      "Friend invitations",
    ],

    technologies: [
      "Next.js 16",
      "TypeScript",
      "Supabase",
      "MapLibre",
      "OpenStreetMap",
      "Tailwind CSS",
      "shadcn/ui",
      "PWA",
    ],
  },

  {
    id: "story-forge",
    slug: "story-forge",
    title: "StoryForge",
    shortDescription: "Collaborative narrative creation tool",
    fullDescription:
      "A powerful tool for writers and storytellers to create, collaborate, and organize their narratives. Features branching storylines, character management, and world-building tools.",
    category: "creative",
    tags: ["writing", "storytelling", "creative", "collaboration", "narrative"],

    image: "/images/projects/story-forge-card.png",
    backgroundImage: "/images/projects/story-forge-bg.png",
    icon: "/images/projects/story-forge-icon.svg",

    enabled: true,
    featured: false,
    upcoming: false,
    inPreview: true,

    accessTier: "premium",
    requiresAuth: true,
    requiresSubscription: true,

    route: "/projects/story-forge",

    version: "0.1.0",
    author: "GameHub Team",
    releaseDate: "2025-02-01",
    lastUpdated: "2026-01-06",

    supportedLanguages: ["en", "fr"],

    features: [
      "Branching narrative editor",
      "Character database",
      "World-building tools",
      "Timeline management",
      "Collaboration features",
      "Export to multiple formats",
      "Version control",
      "AI-assisted writing",
    ],

    technologies: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Tailwind CSS",
      "shadcn/ui",
      "Tiptap Editor",
    ],
  },
  {
    id: "collectometal",
    slug: "collectometal",
    title: "CollectoMetal",
    shortDescription: "Bilingual dispatch platform for metal pickup operations",
    fullDescription:
      "CollectoMetal is a bilingual EN/FR operations platform for scrap and metal pickup. It includes dispatch routing, worker status workflows, proof-of-pickup, admin feature flags, and compliance-oriented data controls.",
    category: "utility",
    tags: ["dispatch", "logistics", "recycling", "operations", "supabase", "mobile"],

    image: "/images/projects/collectometal-card.svg",
    backgroundImage: "/images/projects/collectometal-bg.svg",
    icon: "/images/projects/collectometal-icon.svg",

    enabled: true,
    featured: false,
    upcoming: true,
    inPreview: true,

    accessTier: "enterprise",
    requiresAuth: true,
    requiresSubscription: true,

    route: "/projects/collectometal",
    externalUrl: "https://collectometal.app",

    version: "0.2.0",
    author: "Nebula Forge Digital Studio",
    releaseDate: "2026-04-01",
    lastUpdated: "2026-04-01",

    supportedLanguages: ["en", "fr"],

    features: [
      "Request intake and dispatch queue",
      "Route planning and assignment scoring",
      "Worker mobile flow with offline sync",
      "Outbox notifications and retries",
      "Admin feature flags and account controls",
      "Billing usage metering and invoice rollups",
    ],

    technologies: [
      "Next.js 16",
      "Expo React Native",
      "Supabase",
      "PostGIS",
      "Upstash Redis",
      "TanStack Query",
      "TypeScript",
    ],
  },
];

/**
 * Get all projects
 */
export function getAllProjects(): ProjectMetadata[] {
  return projectsManifest;
}

/**
 * Get enabled projects only
 */
export function getEnabledProjects(): ProjectMetadata[] {
  return projectsManifest.filter((p) => p.enabled);
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(): ProjectMetadata[] {
  return projectsManifest.filter((p) => p.enabled && p.featured);
}

/**
 * Get upcoming projects
 */
export function getUpcomingProjects(): ProjectMetadata[] {
  return projectsManifest.filter((p) => p.enabled && p.upcoming);
}

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): ProjectMetadata | undefined {
  return projectsManifest.find((p) => p.slug === slug);
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(category: ProjectCategory): ProjectMetadata[] {
  return projectsManifest.filter((p) => p.enabled && p.category === category);
}

/**
 * Get projects by access tier
 */
export function getProjectsByAccessTier(tier: AccessTier): ProjectMetadata[] {
  return projectsManifest.filter((p) => p.enabled && p.accessTier === tier);
}

/**
 * Get free projects (free and freemium tiers)
 */
export function getFreeProjects(): ProjectMetadata[] {
  return projectsManifest.filter(
    (p) => p.enabled && (p.accessTier === "free" || p.accessTier === "freemium"),
  );
}

/**
 * Check if user has access to project
 * @param project Project to check
 * @param user User object with subscription info
 * @returns true if user has access
 */
export function hasProjectAccess(
  project: ProjectMetadata,
  user?: { isAuthenticated: boolean; hasSubscription: boolean },
): boolean {
  // Project must be enabled
  if (!project.enabled) {return false;}

  // Check authentication requirement
  if (project.requiresAuth && !user?.isAuthenticated) {return false;}

  // Check subscription requirement
  if (project.requiresSubscription && !user?.hasSubscription) {return false;}

  // Free tier is always accessible
  if (project.accessTier === "free") {return true;}

  // Freemium has basic access for everyone
  if (project.accessTier === "freemium") {return true;}

  // Premium and enterprise require subscription
  if (project.accessTier === "premium" || project.accessTier === "enterprise") {
    return user?.hasSubscription || false;
  }

  return true;
}
