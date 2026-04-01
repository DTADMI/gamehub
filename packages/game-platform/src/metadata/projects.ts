export type ProjectSlug =
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
  repoUrl: string;
  websiteUrl?: string;
  repoVisibility: "public" | "private";
  deployed: boolean;
  featured?: boolean;
  enabled?: boolean;
  visible?: boolean;
  upcoming?: boolean;
};

export type ProjectManifest = Record<ProjectSlug, ProjectEntry>;

export const projects: ProjectManifest = {
  "story-forge": {
    slug: "story-forge",
    title: "StoryForge",
    shortDescription:
      "Gamified writing platform with world-building tools, versioning, and habit-building loops.",
    tags: ["Writing", "Gamification", "Productivity"],
    image: "/images/projects/story-forge-card.svg",
    repoUrl: "https://github.com/DTADMI/story-forge",
    repoVisibility: "public",
    deployed: false,
    featured: true,
    enabled: true,
    visible: true,
    upcoming: true,
  },
  "quest-hunt": {
    slug: "quest-hunt",
    title: "QuestHunt",
    shortDescription:
      "Mobile-first geocaching experience with social quests, live maps, and progress tracking.",
    tags: ["Geocaching", "Social", "Mobile"],
    image: "/images/projects/quest-hunt-card.svg",
    repoUrl: "https://github.com/DTADMI/quest-hunt-web",
    websiteUrl: "https://questhunt.app",
    repoVisibility: "private",
    deployed: true,
    featured: true,
    enabled: true,
    visible: true,
    upcoming: false,
  },
  "libra-keeper": {
    slug: "libra-keeper",
    title: "LibraKeeper",
    shortDescription:
      "Personal library manager with cataloging, lending workflows, and multilingual support.",
    tags: ["Library", "Management", "PWA"],
    image: "/images/projects/libra-keeper-card.svg",
    repoUrl: "https://github.com/DTADMI/libra-keep",
    repoVisibility: "public",
    deployed: false,
    featured: false,
    enabled: true,
    visible: true,
    upcoming: true,
  },
  "velvet-galaxy": {
    slug: "velvet-galaxy",
    title: "Velvet Galaxy",
    shortDescription:
      "Customizable social network focused on community curation and fine-grained interaction controls.",
    tags: ["Social", "Community", "Next.js"],
    image: "/images/projects/velvet-galaxy-card.svg",
    repoUrl: "https://github.com/DTADMI/velvet-galaxy",
    repoVisibility: "public",
    deployed: false,
    featured: false,
    enabled: true,
    visible: true,
    upcoming: true,
  },
};

export function getProject(slug: string): ProjectEntry | undefined {
  return projects[slug as ProjectSlug];
}

export function listProjects(): ProjectEntry[] {
  return Object.values(projects);
}
