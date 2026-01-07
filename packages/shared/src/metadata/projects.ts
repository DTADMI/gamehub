// packages/shared/src/metadata/projects.ts

export type ProjectSlug =
    | "story-forge"
    | "quest-hunt"
    | "libra-keeper"
    | "velvet-galaxy"
    | "portfolio"
    | "data-viz";

export type ProjectEntry = {
  slug: ProjectSlug;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  repo: string;
  demo?: string;
  featured?: boolean;
  enabled?: boolean;
  visible?: boolean;
  upcoming?: boolean;
  getComponent: () => Promise<any>;
};

export type ProjectManifest = Record<ProjectSlug, ProjectEntry>;

export const projects: ProjectManifest = {
  "story-forge": {
    slug: "story-forge",
    title: "StoryForge",
    shortDescription:
        "A gamified writing platform for building consistent habits and worlds.",
    tags: ["Writing", "Gamification", "Social"],
    image: "https://picsum.photos/seed/story-forge/1280/1280",
    repo: "https://github.com/DTADMI/story-forge",
    featured: true,
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () =>
        import("@projects/story-forge").then((m) => m.StoryForgeApp),
  },
  "quest-hunt": {
    slug: "quest-hunt",
    title: "QuestHunt",
    shortDescription:
        "Mobile-first geocaching and location-based treasure hunts.",
    tags: ["Geocaching", "Social", "Mobile"],
    image: "https://picsum.photos/seed/quest-hunt/1280/1280",
    repo: "https://github.com/DTADMI/quest-hunt",
    featured: true,
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () =>
        import("@projects/quest-hunt").then((m) => m.QuestHuntApp),
  },
  "libra-keeper": {
    slug: "libra-keeper",
    title: "LibraKeeper",
    shortDescription: "Personal library management system for books and items.",
    tags: ["Library", "Management", "Organization"],
    image: "https://picsum.photos/seed/libra-keeper/1280/1280",
    repo: "https://github.com/DTADMI/libra-keeper",
    featured: true,
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () =>
        import("@projects/libra-keeper").then((m) => m.LibraKeeperApp),
  },
  "velvet-galaxy": {
    slug: "velvet-galaxy",
    title: "Velvet Galaxy",
    shortDescription:
        "A lifestyle social network application focused on creativity and community.",
    tags: ["Social", "Community", "Next.js"],
    image: "https://picsum.photos/seed/velvet-galaxy/1280/1280",
    repo: "https://github.com/DTADMI/velvet-galaxy",
    featured: true,
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () =>
        import("@projects/velvet-galaxy").then((m) => m.VelvetGalaxyApp),
  },
  portfolio: {
    slug: "portfolio",
    title: "Portfolio Website",
    shortDescription: "Personal website built with Next.js and TailwindCSS.",
    tags: ["Next.js", "TailwindCSS"],
    image: "https://picsum.photos/seed/portfolio/1280/1280",
    repo: "https://github.com/DTADMI/gamehub-app",
    enabled: true,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
  "data-viz": {
    slug: "data-viz",
    title: "Data Viz Dashboard",
    shortDescription: "Interactive charts and analytics.",
    tags: ["Charts", "Auth"],
    image: "https://picsum.photos/seed/data-viz/1280/1280",
    repo: "https://github.com/DTADMI/gamehub-app",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
};

export function getProject(slug: string): ProjectEntry | undefined {
  return projects[slug as ProjectSlug];
}

export function listProjects(): ProjectEntry[] {
  return Object.values(projects);
}
