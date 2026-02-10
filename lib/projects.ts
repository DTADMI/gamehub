export type ProjectEntry = {
  slug: string;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  repo: string;
  demo?: string;
  featured?: boolean;
  visible?: boolean;
  upcoming?: boolean;
};

export const projects: ProjectEntry[] = [
  {
    slug: "story-forge",
    title: "StoryForge",
    shortDescription: "A gamified writing platform for building consistent habits and worlds.",
    tags: ["Writing", "Gamification", "Social"],
    image: "https://picsum.photos/seed/story-forge/1280/1280",
    repo: "https://github.com/DTADMI/story-forge",
    featured: true,
    visible: true,
  },
  {
    slug: "quest-hunt",
    title: "QuestHunt",
    shortDescription: "Mobile-first geocaching and location-based treasure hunts.",
    tags: ["Geocaching", "Social", "Mobile"],
    image: "https://picsum.photos/seed/quest-hunt/1280/1280",
    repo: "https://github.com/DTADMI/quest-hunt",
    featured: true,
    visible: true,
  },
  {
    slug: "libra-keeper",
    title: "LibraKeeper",
    shortDescription: "Personal library management system for books and items.",
    tags: ["Library", "Management", "Organization"],
    image: "https://picsum.photos/seed/libra-keeper/1280/1280",
    repo: "https://github.com/DTADMI/libra-keeper",
    featured: true,
    visible: true,
  },
  {
    slug: "velvet-galaxy",
    title: "Velvet Galaxy",
    shortDescription: "A lifestyle social network application focused on creativity and community.",
    tags: ["Social", "Community", "Next.js"],
    image: "https://picsum.photos/seed/velvet-galaxy/1280/1280",
    repo: "https://github.com/DTADMI/velvet-galaxy",
    featured: true,
    visible: true,
  },
  {
    slug: "portfolio",
    title: "Portfolio Website",
    shortDescription: "Personal website built with Next.js and TailwindCSS.",
    tags: ["Next.js", "TailwindCSS"],
    image: "https://picsum.photos/seed/portfolio/1280/1280",
    repo: "https://github.com/DTADMI/gamehub-app",
    visible: true,
  },
  {
    slug: "data-viz",
    title: "Data Viz Dashboard",
    shortDescription: "Interactive charts and analytics.",
    tags: ["Charts", "Auth"],
    image: "https://picsum.photos/seed/data-viz/1280/1280",
    repo: "https://github.com/DTADMI/gamehub-app",
    upcoming: true,
    visible: true,
  },
];

export function listProjects(): ProjectEntry[] {
  return projects.filter((p) => p.visible !== false);
}

export function getProject(slug: string): ProjectEntry | undefined {
  return projects.find((p) => p.slug === slug);
}
