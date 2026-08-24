

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
  | "escape-room"
  | "chrono-shift"
  | "elemental-conflux"
  | "quantum-architect"
  | "tetris"
  | "block-blast"
  | "platformer"
  | "tower-defense"
  | "spell-craft"
  | "glyph-weaver"
  | "mystery-manor"
  | "artifact-hunter"
  | "clockwork-conspiracy";

export type GameEntry = {
  slug: GameSlug;
  title: string;
  shortDescription: string;
  tags: string[];
  image: string;
  /** Game genre for filtering/discovery */
  genre?: "arcade" | "puzzle" | "adventure" | "board" | "creative";
  /** Difficulty level */
  difficulty?: "easy" | "medium" | "hard";
  /** Estimated play time (e.g., "5-10 min", "30+ min") */
  playTime?: string;
  /** Supported player count ("single" or "multi") */
  playerCount?: "single" | "multi";
  /** Age rating (e.g., "All Ages", "10+", "13+") */
  ageRating?: string;
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
    genre: "arcade",
    difficulty: "medium",
    playTime: "5-10 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-neon-grid.svg",
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
    genre: "puzzle",
    difficulty: "easy",
    playTime: "3-5 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.svg",
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
    genre: "arcade",
    difficulty: "easy",
    playTime: "5-10 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-snake.svg",
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
    genre: "puzzle",
    difficulty: "easy",
    playTime: "3-5 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.svg",
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
    shortDescription: "Cozy puzzler — match colorful patterns with rolling balls of wool.",
    tags: ["Puzzle", "Casual", "dom-ui", "impl:react-canvas-custom", "target:react-canvas"],
    image: "/images/games/knitzy-card.svg",
    genre: "puzzle",
    difficulty: "medium",
    playTime: "5-10 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.svg",
    preloadAssets: [
      { key: "click", url: "/sounds/click.mp3" },
      { key: "background", url: "/sounds/memory-bg.mp3", loop: true },
    ],
    // @ts-ignore
    getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
  },
  "bubble-pop": {
    slug: "bubble-pop",
    title: "Bubble Pop",
    shortDescription: "Aim, match and pop bubbles before the board fills!",
    tags: ["Arcade", "Match-3", "Casual", "arcade-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/bubble-pop-card.svg",
    genre: "arcade",
    difficulty: "easy",
    playTime: "3-5 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.svg",
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
    genre: "board",
    difficulty: "medium",
    playTime: "10-20 min",
    playerCount: "multi",
    ageRating: "All Ages",
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
    genre: "board",
    difficulty: "hard",
    playTime: "15-30 min",
    playerCount: "multi",
    ageRating: "All Ages",
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
    shortDescription: "A heartwarming point-and-click journey through family traditions and the magic of growing up.",
    tags: [
      "Adventure",
      "Point & Click",
      "Story",
      "Family",
      "narrative",
      "impl:narrative-engine",
      "target:keep",
    ],
    image: "/images/games/rite-of-discovery-card.svg",
    genre: "adventure",
    difficulty: "easy",
    playTime: "10-15 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-pastel-pattern.svg",
    preloadAssets: [
      { key: "rod-bg", url: "", loop: true },
    ],
    getComponent: () =>
      // @ts-ignore
      import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
  },
  "systems-discovery": {
    slug: "systems-discovery",
    title: "Systems Discovery",
    shortDescription: "Explore how systems work — from the human body to the cosmos — through interactive puzzle packs.",
    tags: [
      "Adventure",
      "Point & Click",
      "Educational",
      "Science",
      "narrative",
      "impl:narrative-engine",
      "target:keep",
    ],
    image: "/images/games/systems-discovery-card.svg",
    genre: "adventure",
    difficulty: "medium",
    playTime: "15-25 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-systems-discovery.svg",
    preloadAssets: [
      { key: "sys-bg", url: "", loop: true },
    ],
    getComponent: () =>
      // @ts-ignore
      import("@games/systems-discovery").then((m) => m.SystemsDiscoveryGame),
  },
  "toymaker-escape": {
    slug: "toymaker-escape",
    title: "Toymaker Escape",
    shortDescription: "A 3-episode escape-room mystery set in a toymaker's workshop. Puzzles, secrets, and a twist ending.",
    tags: ["Escape", "Puzzles", "Story", "Mystery", "narrative", "impl:narrative-engine", "target:keep"],
    image: "/images/games/toymaker-escape-card.svg",
    genre: "adventure",
    difficulty: "medium",
    playTime: "15-20 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-toymaker-escape.svg",
    preloadAssets: [
      { key: "tme-bg", url: "", loop: true },
    ],
    getComponent: () =>
      // @ts-ignore
      import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
  },
  "escape-room": {
    slug: "escape-room",
    title: "Escape Room",
    shortDescription: "You're locked in Professor Aldric's study. Solve puzzles, find clues, and escape. 5 interconnected puzzles.",
    tags: ["Escape", "Puzzles", "Story", "Mystery", "narrative", "impl:narrative-engine", "target:keep"],
    image: "/imagesfile:///games/escape-room-card.svg",
    genre: "adventure",
    difficulty: "medium",
    playTime: "10-15 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    backgroundImage: "/imagesfile:///bg-abstract-dark.svg",
    preloadAssets: [],
    getComponent: () =>
      // @ts-ignore
      import("@games/escape-room").then((m) => m.EscapeRoomGame),
  },
  "chrono-shift": {
    slug: "chrono-shift",
    title: "ChronoShift Labyrinth",
    shortDescription: "Manipulate time and space to navigate shifting environments.",
    tags: ["Puzzle", "Time", "3d", "impl:react-three-fiber", "target:threejs"],
    image: "/images/games/chrono-shift-card.svg",
    genre: "puzzle",
    difficulty: "medium",
    playTime: "10-15 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () => import("@games/chrono-shift").then((m) => m.ChronoShiftGame),
  },
  "elemental-conflux": {
    slug: "elemental-conflux",
    title: "Elemental Conflux",
    shortDescription: "Control fire and water characters, combining abilities to solve 3D puzzles.",
    tags: ["Puzzle", "Elements", "3d", "impl:react-three-fiber", "target:threejs"],
    image: "/images/games/elemental-conflux-card.svg",
    genre: "puzzle",
    difficulty: "medium",
    playTime: "10-15 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/elemental-conflux").then((m) => m.ElementalConfluxGame),
  },
  "quantum-architect": {
    slug: "quantum-architect",
    title: "Quantum Architect",
    shortDescription: "Manipulate quantum states to create/destroy matter and navigate 3D platforms.",
    tags: ["Puzzle", "Quantum", "3d", "impl:react-three-fiber", "target:threejs"],
    image: "/images/games/quantum-architect-card.svg",
    genre: "puzzle",
    difficulty: "hard",
    playTime: "15-25 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/quantum-architect").then((m) => m.QuantumArchitectGame),
  },
  tetris: {
    slug: "tetris",
    title: "Tetris",
    shortDescription: "Classic tile‑matching puzzle game.",
    tags: ["Puzzle", "Arcade", "arcade-2d", "impl:react-canvas-custom", "target:react-canvas"],
    image: "/images/games/tetris-card.svg",
    genre: "arcade",
    difficulty: "medium",
    playTime: "5-15 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () => import("@games/tetris").then((m) => m.TetrisGame),
  },
  "block-blast": {
    slug: "block-blast",
    title: "Block‑Blast",
    shortDescription: "Place pieces to clear rows and columns.",
    tags: ["Puzzle", "Strategy", "dom-ui", "impl:react-dom", "target:keep"],
    image: "/images/games/block-blast-card.svg",
    genre: "arcade",
    difficulty: "easy",
    playTime: "5-10 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    // @ts-ignore
    getComponent: () =>
      import("@games/block-blast").then((m) => m.BlockBlastGame),
  },
  platformer: {
    slug: "platformer",
    title: "Puzzle Platformer",
    shortDescription: "2D platformer with physics‑based puzzles.",
    tags: ["Platformer", "Puzzle", "sim-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/platformer-card.svg",
    genre: "arcade",
    difficulty: "medium",
    playTime: "10-20 min",
    playerCount: "single",
    ageRating: "All Ages",
    upcoming: true,
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-neon-grid.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/platformer").then((m) => m.PlatformerGame),
  },
  "tower-defense": {
    slug: "tower-defense",
    title: "Tower Defense",
    shortDescription: "Strategic towers vs. waves of enemies.",
    tags: ["Strategy", "Tactics", "sim-2d", "impl:react-canvas-custom", "target:pixi"],
    image: "/images/games/tower-defense-card.svg",
    genre: "arcade",
    difficulty: "medium",
    playTime: "15-25 min",
    playerCount: "single",
    ageRating: "10+",
    upcoming: true,
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/tower-defense").then((m) => m.TowerDefenseGame),
  },
  "spell-craft": {
    slug: "spell-craft",
    title: "Spell Craft",
    shortDescription: "Draw magical glyphs and cast elemental spells with particle effects.",
    tags: ["Creative", "Drawing", "Magic", "sim-2d", "impl:react-canvas-custom", "target:react-canvas"],
    image: "/images/games/spell-craft-card.svg",
    genre: "creative",
    difficulty: "easy",
    playTime: "10-20 min",
    playerCount: "single",
    ageRating: "All Ages",
    enabled: true,
    visible: true,
    backgroundImage: "/images/bg-abstract-dark.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/spell-craft").then((m) => m.SpellCraftGame),
  },
  "glyph-weaver": {
    slug: "glyph-weaver",
    title: "Glyph Weaver",
    shortDescription: "Full spell-crafting studio — draw glyphs, weave sigils, compile spells with WebGL particle effects.",
    tags: ["Creative", "Drawing", "Magic", "WebGL", "sim-2d", "impl:react-canvas-custom", "target:webgl"],
    image: "/images/games/glyph-weaver-card.svg",
    genre: "creative",
    difficulty: "medium",
    playTime: "15-30 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    upcoming: false,
    backgroundImage: "/images/bg-abstract-dark.svg",
    preloadAssets: [],
    // @ts-ignore
    getComponent: () => import("@games/glyph-weaver").then((m) => m.GlyphWeaverGame),
  },
  "mystery-manor": {
    slug: "mystery-manor",
    title: "Mystery Manor",
    shortDescription: "Solve a Victorian murder mystery! Deduce the killer with logic grids, ciphers, and clues.",
    tags: ["Adventure", "Puzzle", "target:dom"],
    image: "/images/games/mystery-manor-card.svg",
    genre: "adventure",
    difficulty: "medium",
    playTime: "15-20 min",
    playerCount: "single",
    ageRating: "13+",
    enabled: true,
    visible: true,
    getComponent: () => import("@games/mystery-manor").then((m) => ({ default: m.MysteryManorGame })),
  },
  "artifact-hunter": {
    slug: "artifact-hunter",
    title: "Artifact Hunter",
    shortDescription: "Explore an ancient Egyptian temple! Decode hieroglyphs and recover lost treasures.",
    tags: ["Adventure", "Puzzle", "target:dom"],
    image: "/images/games/artifact-hunter-card.svg",
    genre: "adventure",
    difficulty: "medium",
    playTime: "15-20 min",
    playerCount: "single",
    ageRating: "10+",
    enabled: true,
    visible: true,
    getComponent: () => import("@games/artifact-hunter").then((m) => ({ default: m.ArtifactHunterGame })),
  },
  "clockwork-conspiracy": {
    slug: "clockwork-conspiracy",
    title: "Clockwork Conspiracy",
    shortDescription: "Save the city from a steampunk catastrophe! Align gears, crack ciphers, beat the clock.",
    tags: ["Adventure", "Puzzle", "target:dom"],
    image: "/images/games/clockwork-conspiracy-card.svg",
    genre: "adventure",
    difficulty: "hard",
    playTime: "20-30 min",
    playerCount: "single",
    ageRating: "13+",
    enabled: true,
    visible: true,
    getComponent: () => import("@games/clockwork-conspiracy").then((m) => ({ default: m.ClockworkConspiracyGame })),
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
