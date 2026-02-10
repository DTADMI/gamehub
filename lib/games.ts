export type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  path?: string;
  upcoming?: boolean;
  featured?: boolean;
};

export type GameSlug =
  | "breakout" | "memory" | "snake" | "pattern-matching" | "knitzy"
  | "bubble-pop" | "checkers" | "chess"
  | "rite-of-discovery" | "systems-discovery" | "toymaker-escape"
  | "chrono-shift" | "elemental-conflux" | "quantum-architect"
  | "tetris" | "space-invasion" | "block-blast" | "platformer" | "tower-defense";

export type GameEntry = {
  slug: GameSlug;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  upcoming?: boolean;
  visible?: boolean;
  enabled?: boolean;
};

export type GameManifest = Record<GameSlug, GameEntry>;

export const games: GameManifest = {
  breakout: {
    slug: "breakout",
    title: "Breakout",
    shortDescription: "Break all the bricks and don't let the ball fall!",
    tags: ["Arcade", "Canvas"],
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    enabled: true,
    visible: true,
  },
  memory: {
    slug: "memory",
    title: "Memory",
    shortDescription: "Flip cards and match all pairs in as few moves as possible.",
    tags: ["Casual", "Memory", "Puzzle"],
    image: "/colorful-memory-cards-game-interface.jpg",
    enabled: true,
    visible: true,
  },
  snake: {
    slug: "snake",
    title: "Snake",
    shortDescription: "Eat food, grow longer, and avoid crashing.",
    tags: ["Arcade", "Grid"],
    image: "/retro-snake-game-with-neon-colors.jpg",
    enabled: true,
    visible: true,
  },
  "pattern-matching": {
    slug: "pattern-matching",
    title: "Pattern Matching",
    shortDescription: "Relaxing stitch puzzler -- match the pattern and score combos.",
    tags: ["Puzzle", "Casual"],
    image: "https://picsum.photos/seed/pattern/1280/1280",
    enabled: true,
    visible: true,
  },
  knitzy: {
    slug: "knitzy",
    title: "Knitzy",
    shortDescription: "Cozy puzzler with rolling balls of wool (upcoming).",
    tags: ["Puzzle", "Casual"],
    image: "/colorful-knitting-wool-baskets.jpg",
    upcoming: true,
    enabled: false,
    visible: false,
  },
  "bubble-pop": {
    slug: "bubble-pop",
    title: "Bubble Pop",
    shortDescription: "Aim, match and pop bubbles before the board fills!",
    tags: ["Arcade", "Match-3", "Casual"],
    image: "/soap-bubbles-colorful-nature.jpg",
    enabled: true,
    visible: true,
  },
  checkers: {
    slug: "checkers",
    title: "Checkers",
    shortDescription: "Classic draughts on an 8x8 board -- local two player.",
    tags: ["Board", "Local 2P", "Strategy"],
    image: "/activity-checkers.jpg",
    enabled: true,
    visible: true,
  },
  chess: {
    slug: "chess",
    title: "Chess",
    shortDescription: "Open-source chessboard -- local two player (MVP).",
    tags: ["Board", "Local 2P", "Strategy"],
    image: "/king-chess-pieces.jpg",
    enabled: true,
    visible: true,
  },
  "rite-of-discovery": {
    slug: "rite-of-discovery",
    title: "Rite of Discovery",
    shortDescription: "Gentle point-and-click about family-made magic (Alpha MVP).",
    tags: ["Adventure", "Point & Click", "Story"],
    image: "https://picsum.photos/seed/rod/1280/1280",
    enabled: true,
    visible: true,
  },
  "systems-discovery": {
    slug: "systems-discovery",
    title: "Systems Discovery",
    shortDescription: "Explore everyday systems with extendable packs (Alpha MVP).",
    tags: ["Adventure", "Educational"],
    image: "https://picsum.photos/seed/systems-discovery/1280/1280",
    enabled: true,
    visible: true,
  },
  "toymaker-escape": {
    slug: "toymaker-escape",
    title: "Toymaker Escape",
    shortDescription: "Episodic escape game with a twisty mystery (Alpha MVP).",
    tags: ["Escape", "Puzzles", "Story"],
    image: "/patience-games-toys.jpg",
    enabled: true,
    visible: true,
  },
  "chrono-shift": {
    slug: "chrono-shift",
    title: "ChronoShift Labyrinth",
    shortDescription: "Manipulate time and space to navigate shifting environments.",
    tags: ["Puzzle", "Time", "Upcoming"],
    image: "https://picsum.photos/seed/chrono/1280/1280",
    upcoming: true,
    enabled: false,
    visible: false,
  },
  "elemental-conflux": {
    slug: "elemental-conflux",
    title: "Elemental Conflux",
    shortDescription: "Control multiple characters with complementary elemental abilities.",
    tags: ["Puzzle", "Elements", "Upcoming"],
    image: "https://picsum.photos/seed/elemental/1280/1280",
    upcoming: true,
    enabled: false,
    visible: false,
  },
  "quantum-architect": {
    slug: "quantum-architect",
    title: "Quantum Architect",
    shortDescription: "Manipulate quantum states to create/destroy matter.",
    tags: ["Puzzle", "Quantum", "Upcoming"],
    image: "https://picsum.photos/seed/quantum/1280/1280",
    upcoming: true,
    enabled: false,
    visible: false,
  },
  tetris: {
    slug: "tetris",
    title: "Tetris",
    shortDescription: "Classic tile-matching puzzle game.",
    tags: ["Puzzle", "Arcade"],
    image: "/colorful-tetris-blocks-falling.jpg",
    upcoming: true,
    enabled: false,
    visible: true,
  },
  "space-invasion": {
    slug: "space-invasion",
    title: "Space Invasion",
    shortDescription: "Blast incoming alien waves and dodge projectiles.",
    tags: ["Arcade", "Shooter"],
    image: "/space-invader-colorful-characters.png",
    upcoming: true,
    enabled: false,
    visible: true,
  },
  "block-blast": {
    slug: "block-blast",
    title: "Block-Blast",
    shortDescription: "Place pieces to clear rows and columns.",
    tags: ["Puzzle", "Strategy"],
    image: "/lego-block-blast-colorful.png",
    upcoming: true,
    enabled: false,
    visible: true,
  },
  platformer: {
    slug: "platformer",
    title: "Puzzle Platformer",
    shortDescription: "2D platformer with physics-based puzzles.",
    tags: ["Platformer", "Puzzle"],
    image: "/2d-platformer-game-with-character-and-obstacles.jpg",
    upcoming: true,
    enabled: false,
    visible: true,
  },
  "tower-defense": {
    slug: "tower-defense",
    title: "Tower Defense",
    shortDescription: "Strategic towers vs. waves of enemies.",
    tags: ["Strategy", "Tactics"],
    image: "/tower-defense-game-with-towers-and-enemies.jpg",
    upcoming: true,
    enabled: false,
    visible: true,
  },
};

export function getGame(slug: string): GameEntry | undefined {
  return games[slug as GameSlug];
}

export function listGames(): GameEntry[] {
  return Object.values(games);
}
