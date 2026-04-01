// packages/shared/src/metadata/games.ts

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
  | "breakout"
  | "memory"
  | "snake"
  | "pattern-matching"
  | "knitzy"
  | "bubble-pop"
  | "checkers"
  | "chess"
  | "rite-of-discovery"
  | "systems-discovery"
  | "toymaker-escape"
  | "chrono-shift"
  | "elemental-conflux"
  | "quantum-architect"
  | "tetris"
  | "space-invasion"
  | "block-blast"
  | "platformer"
  | "tower-defense";

export type GameEntry = {
  slug: GameSlug;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  upcoming?: boolean;
  visible?: boolean;
  enabled?: boolean;
  backgroundImage?: string;
  preloadAssets?: { key: string; url: string; loop?: boolean }[];
  getComponent: () => Promise<any>;
};

export type GameManifest = Record<GameSlug, GameEntry>;

export const games: GameManifest = {
  breakout: {
    slug: "breakout",
    title: "Breakout",
    shortDescription: "Break all the bricks and don't let the ball fall!",
    tags: ["Arcade", "Canvas", "arcade-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/breakout-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-neon-grid.jpg",
    preloadAssets: [
      { key: "paddle", url: "/sounds/paddle.mp3" },
      { key: "brickHit", url: "/sounds/brick-hit.mp3" },
      { key: "brickBreak", url: "/sounds/brick-break.mp3" },
      { key: "wall", url: "/sounds/wall.mp3" },
      { key: "loseLife", url: "/sounds/lose-life.mp3" },
      { key: "gameOver", url: "/sounds/game-over.mp3" },
      { key: "levelComplete", url: "/sounds/level-complete.mp3" },
      { key: "powerUp", url: "/sounds/power-up.mp3" },
      { key: "background", url: "/sounds/breakout-bg.mp3", loop: true },
    ],
    // @ts-ignore
    getComponent: () => import("@games/breakout").then((m) => m.BreakoutGame),
  },
  memory: {
    slug: "memory",
    title: "Memory",
    shortDescription: "Flip cards and match all pairs in as few moves as possible.",
    tags: ["Casual", "Memory", "Puzzle", "dom-ui", "impl:react-dom", "target:keep"],
    image: "/images/games/memory-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.jpg",
    preloadAssets: [
      { key: "cardFlip", url: "/sounds/card-flip.mp3" },
      { key: "match", url: "/sounds/match.mp3" },
      { key: "win", url: "/sounds/win.mp3" },
      { key: "background", url: "/sounds/memory-bg.mp3", loop: true },
    ],
    // @ts-ignore
    getComponent: () => import("@games/memory").then((m) => m.MemoryGame),
  },
  snake: {
    slug: "snake",
    title: "Snake",
    shortDescription: "Eat food, grow longer, and avoid crashing.",
    tags: ["Arcade", "Grid", "Swipe", "arcade-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/snake-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: undefined,
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/snake").then((m) => m.SnakeGame),
  },
  "pattern-matching": {
    slug: "pattern-matching",
    title: "Pattern Matching",
    shortDescription: "Relaxing stitch puzzler — match the pattern and score combos.",
    tags: ["Puzzle", "Casual", "Mobile", "dom-ui", "impl:react-dom", "target:keep"],
    image: "/images/games/pattern-matching-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.jpg",
    preloadAssets: [
      { key: "click", url: "/sounds/click.mp3" },
      { key: "background", url: "/sounds/memory-bg.mp3", loop: true },
    ],
    // @ts-ignore
    getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
  },
  knitzy: {
    slug: "knitzy",
    title: "Knitzy",
    shortDescription: "Cozy puzzler with rolling balls of wool (upcoming).",
    tags: ["Puzzle", "Casual"],
    image: "/images/games/knitzy-card.svg",
    upcoming: true,
    enabled: false,
    visible: false,
    backgroundImage: "/images/bg-pastel-pattern.jpg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
  },
  "bubble-pop": {
    slug: "bubble-pop",
    title: "Bubble Pop",
    shortDescription: "Aim, match and pop bubbles before the board fills!",
    tags: ["Arcade", "Match-3", "Casual", "arcade-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/bubble-pop-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.jpg",
    preloadAssets: [
      { key: "pop", url: "/sounds/brick-hit.mp3" },
      { key: "background", url: "/sounds/breakout-bg.mp3", loop: true },
    ],
    getComponent: () =>
      // @ts-ignore
      import("@games/bubble-pop").then((m) => m.BubblePopGame),
  },
  checkers: {
    slug: "checkers",
    title: "Checkers",
    shortDescription: "Classic draughts on an 8×8 board — local two player.",
    tags: ["Board", "Local 2P", "Strategy", "dom-ui", "impl:react-dom", "target:keep"],
    image: "/images/games/checkers-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-checkers.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/checkers").then((m) => m.CheckersGame),
  },
  chess: {
    slug: "chess",
    title: "Chess",
    shortDescription: "Open‑source chessboard — local two player (MVP).",
    tags: ["Board", "Local 2P", "Strategy", "dom-ui", "impl:react-dom", "target:keep"],
    image: "/images/games/chess-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-chess.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/chess").then((m) => m.ChessGame),
  },
  "rite-of-discovery": {
    slug: "rite-of-discovery",
    title: "Rite of Discovery",
    shortDescription: "Gentle point‑and‑click about family‑made magic (Alpha MVP).",
    tags: [
      "Adventure",
      "Point & Click",
      "Story",
      "narrative",
      "impl:narrative-engine",
      "target:keep",
    ],
    image: "/images/games/rite-of-discovery-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.jpg",
    preloadAssets: [],
    getComponent: () =>
      // @ts-ignore
      import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
  },
  "systems-discovery": {
    slug: "systems-discovery",
    title: "Systems Discovery",
    shortDescription: "Explore everyday systems with extendable packs (Alpha MVP).",
    tags: [
      "Adventure",
      "Point & Click",
      "Educational",
      "narrative",
      "impl:narrative-engine",
      "target:keep",
    ],
    image: "/images/games/systems-discovery-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-systems-discovery.svg",
    preloadAssets: [],
    getComponent: () =>
      // @ts-ignore
      import("@games/systems-discovery").then((m) => m.SystemsDiscoveryGame),
  },
  "toymaker-escape": {
    slug: "toymaker-escape",
    title: "Toymaker Escape",
    shortDescription: "Episodic escape game with a twisty mystery (Alpha MVP).",
    tags: ["Escape", "Puzzles", "Story", "narrative", "impl:narrative-engine", "target:keep"],
    image: "/images/games/toymaker-escape-card.svg",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-toymaker-escape.svg",
    preloadAssets: [],
    getComponent: () =>
      // @ts-ignore
      import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
  },
  "chrono-shift": {
    slug: "chrono-shift",
    title: "ChronoShift Labyrinth",
    shortDescription: "Manipulate time and space to navigate shifting environments.",
    tags: ["Puzzle", "Time", "Upcoming", "3d", "impl:none", "target:threejs"],
    image: "/images/games/chrono-shift-card.svg",
    upcoming: true,
    enabled: false,
    visible: false,
    // @ts-ignore
    getComponent: () => import("@games/chrono-shift").then((m) => m.game),
  },
  "elemental-conflux": {
    slug: "elemental-conflux",
    title: "Elemental Conflux",
    shortDescription: "Control multiple characters with complementary elemental abilities.",
    tags: ["Puzzle", "Elements", "Upcoming", "3d", "impl:none", "target:threejs"],
    image: "/images/games/elemental-conflux-card.svg",
    upcoming: true,
    enabled: false,
    visible: false,
    // @ts-ignore
    getComponent: () => import("@games/elemental-conflux").then((m) => m.game),
  },
  "quantum-architect": {
    slug: "quantum-architect",
    title: "Quantum Architect",
    shortDescription: "Manipulate quantum states to create/destroy matter.",
    tags: ["Puzzle", "Quantum", "Upcoming", "3d", "impl:none", "target:threejs"],
    image: "/images/games/quantum-architect-card.svg",
    upcoming: true,
    enabled: false,
    visible: false,
    // @ts-ignore
    getComponent: () => import("@games/quantum-architect").then((m) => m.game),
  },
  tetris: {
    slug: "tetris",
    title: "Tetris",
    shortDescription: "Classic tile‑matching puzzle game.",
    tags: ["Puzzle", "Arcade", "arcade-2d", "impl:none", "target:react-canvas-or-pixi"],
    image: "/images/games/tetris-card.svg",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
  "space-invasion": {
    slug: "space-invasion",
    title: "Space Invasion",
    shortDescription: "Blast incoming alien waves and dodge projectiles.",
    tags: ["Arcade", "Shooter", "arcade-2d", "impl:none", "target:phaser-or-pixi"],
    image: "/images/games/space-invasion-card.svg",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
  "block-blast": {
    slug: "block-blast",
    title: "Block‑Blast",
    shortDescription: "Place pieces to clear rows and columns.",
    tags: ["Puzzle", "Strategy", "dom-ui", "impl:none", "target:react-dom"],
    image: "/images/games/block-blast-card.svg",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
  platformer: {
    slug: "platformer",
    title: "Puzzle Platformer",
    shortDescription: "2D platformer with physics‑based puzzles.",
    tags: ["Platformer", "Puzzle", "sim-2d", "impl:none", "target:phaser"],
    image: "/images/games/platformer-card.svg",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
  "tower-defense": {
    slug: "tower-defense",
    title: "Tower Defense",
    shortDescription: "Strategic towers vs. waves of enemies.",
    tags: ["Strategy", "Tactics", "sim-2d", "impl:none", "target:phaser"],
    image: "/images/games/tower-defense-card.svg",
    upcoming: true,
    enabled: false,
    visible: true,
    getComponent: () => Promise.resolve({}),
  },
};

export function getGame(slug: string): GameEntry | undefined {
  return games[slug as GameSlug];
}

export function listGames(): GameEntry[] {
  return Object.values(games);
}

/**
 * Returns whether a game entry has an implementation that can be rendered by the launcher.
 * We treat `impl:none` as a scaffold/placeholder marker that should not be exposed as playable.
 */
export function isGameLaunchable(entry: GameEntry): boolean {
  return !entry.tags.includes("impl:none");
}
