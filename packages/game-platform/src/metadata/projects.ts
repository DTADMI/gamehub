export type ProjectSlug =
  | "gamehub"
  | "story-forge"
  | "quest-hunt"
  | "libra-keeper"
  | "velvet-galaxy";

export type ProjectEntry = {
  slug: ProjectSlug;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  repo: string;
  featured?: boolean;
  enabled?: boolean;
  visible?: boolean;
  upcoming?: boolean;
};

export type ProjectManifest = Record<ProjectSlug, ProjectEntry>;

export const projects: ProjectManifest = {
  gamehub: {
    slug: "gamehub",
    title: "GameHub",
    shortDescription:
      "Unified platform hosting 15+ interactive games with shared UI, performance tuning, and real-time features.",
    tags: ["Platform", "Games", "Monorepo", "Next.js"],
    image: "https://picsum.photos/seed/gamehub/1280/1280",
    repo: "https://github.com/DTADMI/gamehub-app",
    featured: true,
    enabled: true,
    visible: true,
  },
  "story-forge": {
    slug: "story-forge",
    title: "StoryForge",
    shortDescription:
      "Gamified writing platform with world-building tools, versioning, and habit-building loops.",
    tags: ["Writing", "Gamification", "Productivity"],
    image: "https://picsum.photos/seed/story-forge/1280/1280",
    repo: "https://github.com/DTADMI/story-forge",
    featured: true,
    enabled: true,
    visible: true,
  },
  "quest-hunt": {
    slug: "quest-hunt",
    title: "QuestHunt",
    shortDescription:
      "Mobile-first geocaching experience with social quests, live maps, and progress tracking.",
    tags: ["Geocaching", "Social", "Mobile"],
    image: "https://picsum.photos/seed/quest-hunt/1280/1280",
    repo: "https://github.com/DTADMI/quest-hunt",
    featured: true,
    enabled: true,
    visible: true,
  },
  "libra-keeper": {
    slug: "libra-keeper",
    title: "LibraKeeper",
    shortDescription:
      "Personal library manager with cataloging, lending workflows, and multilingual support.",
    tags: ["Library", "Management", "PWA"],
    image: "https://picsum.photos/seed/libra-keeper/1280/1280",
    repo: "https://github.com/DTADMI/libra-keeper",
    featured: false,
    enabled: true,
    visible: true,
  },
  "velvet-galaxy": {
    slug: "velvet-galaxy",
    title: "Velvet Galaxy",
    shortDescription:
      "Customizable social network focused on community curation and fine-grained interaction controls.",
    tags: ["Social", "Community", "Next.js"],
    image: "https://picsum.photos/seed/velvet-galaxy/1280/1280",
    repo: "https://github.com/DTADMI/velvet-galaxy",
    featured: false,
    enabled: true,
    visible: true,
  },
};

export function getProject(slug: string): ProjectEntry | undefined {
  return projects[slug as ProjectSlug];
}

export function listProjects(): ProjectEntry[] {
  return Object.values(projects);
}
