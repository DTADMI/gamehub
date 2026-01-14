# Game Engine Strategy

**Last Updated**: January 14, 2026
**Status**: Recommended Architecture Approved

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Game Inventory](#game-inventory)
4. [Engine Evaluation](#engine-evaluation)
5. [Recommended Strategy](#recommended-strategy)
6. [Hybrid 2D/3D Architecture](#hybrid-2d3d-architecture)
7. [Centralization Strategy](#centralization-strategy)
8. [Implementation Plan](#implementation-plan)
9. [Game-Specific Recommendations](#game-specific-recommendations)

---

## Executive Summary

### Quick Recommendation

**Keep multiple engines based on game type:**

- **Narrative/Point-and-Click (2D/3D assets)** → Keep in-house React narrative engine
- **Simple 2D Arcade** → Adopt PixiJS (replaces custom canvas implementations)
- **Arcade with Optional 3D** → PixiJS (2D) + Three.js (3D mode toggle)
- **Complex 2D/Physics** → Phaser 3 (platformer, tower defense)
- **3D Puzzle Games** → Three.js with @react-three/fiber (QA, ES, CS)
- **Board Games with 3D Mode** → React/DOM (2D) + Three.js layer (3D view)

### Key Principles

1. **No forced unification** — different game types need different tools
2. **Maximize existing assets** — narrative engine is already excellent
3. **Minimize maintenance** — use mature libraries for complex features
4. **Progressive adoption** — pilot before committing
5. **Separate logic from rendering** — enables hybrid 2D/3D implementations

### Centralization Strategy

**PixiJS FIRST** (recommended) — PixiJS provides centralization inherently. Avoid double work of extracting custom canvas patterns then replacing with PixiJS. Pilot with Bubble Pop, extract shared utilities, then migrate others.

---

## Current Architecture

### 1. Narrative/Point-and-Click Engine

**Location**: `packages/shared/src/pointclick/*`

**Used By**: Toymaker Escape (TME), Rite of Discovery (ROD), Systems Discovery (SD)

**Core Features**:

- State model: `SaveState` with sceneId + context (flags, inventory, variables)
- Scene model: Narrative/choices with optional React render
- Runtime: React component controller (`SceneController.tsx`)
  - Navigation
  - Persistence (localStorage)
  - Inventory & flags
  - Multi-language support
- Rendering: **DOM/React UI for narrative + optional visual assets (2D or 3D)**

**Visual Asset Flexibility**:

- ✅ Can use 2D images/sprites for scenes (current approach)
- ✅ Can integrate canvas-based mini-games (e.g., TME cabinet puzzle)
- ✅ **Can integrate 3D scenes** using Three.js for richer visual environments
- ✅ Designer-driven: visual complexity depends on available resources

**Strengths**:

- ✅ Fast development for narrative games
- ✅ Excellent accessibility and UI
- ✅ Simple persistence and deterministic logic
- ✅ Already production-ready
- ✅ **Flexible rendering: supports 2D, 3D, or hybrid visuals**

**Limitations**:

- ❌ No real-time simulation (physics, particles) - but can embed mini-games

**Verdict**: **Keep and maintain** — already optimal for its purpose. Can be enhanced with Three.js for 3D scene backgrounds/environments without changing core narrative mechanics.

---

### 2. Canvas 2D Game Engine (GameEngine)

**Location**: `packages/shared/src/pointclick/core/Engine.ts`

**Actually Used By**: Only Toymaker Escape (E1CabinetCanvas mini-puzzle)

**Core Features**:

- Render target: `CanvasRenderingContext2D`
- Systems: input (with macro support), assets, animation, scene, plugin, event
- Main loop: `requestAnimationFrame` with `update(delta)` + `render()`
- Plugin model: dialogue, inventory, achievements

**Current Reality**:

- ⚠️ **Snake**: Custom **React + Canvas** implementation (own game loop)
- ⚠️ **Breakout**: Custom **React + Canvas** implementation (own game loop)
- ⚠️ **Bubble Pop**: Custom **React + Canvas** implementation (own game loop)
- ⚠️ **Memory**: Pure **React/DOM** (no canvas)
- ⚠️ **Chess, Checkers**: Pure **React/DOM** (no canvas)
- ✅ **GameEngine**: Only used for one mini-puzzle in Toymaker Escape

**What Arcade Games Actually Use**:

- `GameContainer` wrapper component from `@games/shared`
- `soundManager` for audio from `@games/shared`
- `ParticlePool` utility for effects (Breakout)
- **Each game has its own canvas rendering loop in React components**
- **No shared canvas engine infrastructure**

**Problem Statement**:

- Code duplication: each arcade game reimplements canvas setup, game loop, resize handling
- No standardization: different patterns for similar functionality
- Maintenance burden: fixes/improvements must be applied to each game individually

**Verdict**: **GameEngine exists but is NOT used by arcade games. Arcade games use standalone React + Canvas patterns. Adopting a shared solution (PixiJS or Phaser) would eliminate duplication and standardize architecture.**

---

## Game Inventory

### Production Games

| Game                  | Type          | Current Implementation     | Status      |
| --------------------- | ------------- | -------------------------- | ----------- |
| **Breakout**          | Arcade 2D     | React + Custom Canvas Loop | ✅ Complete |
| **Snake**             | Arcade 2D     | React + Custom Canvas Loop | ✅ Complete |
| **Bubble Pop**        | Arcade 2D     | React + Custom Canvas Loop | ✅ Complete |
| **Memory**            | Casual Puzzle | React/DOM only             | ✅ Complete |
| **Chess**             | Board Game    | React/DOM only             | ✅ Complete |
| **Checkers**          | Board Game    | React/DOM only             | ✅ Complete |
| **Pattern Matching**  | Puzzle        | React/DOM only             | ✅ Complete |
| **Toymaker Escape**   | Narrative     | Narrative Engine + React   | ✅ Complete |
| **Rite of Discovery** | Narrative     | Narrative Engine + React   | ✅ Complete |
| **Systems Discovery** | Narrative     | Narrative Engine + React   | ✅ Complete |

### Planned Games

| Game                  | Type           | Recommended Engine       | Priority |
| --------------------- | -------------- | ------------------------ | -------- |
| **Platformer**        | Physics 2D     | Phaser 3                 | High     |
| **Tower Defense**     | Strategy 2D    | Phaser 3                 | High     |
| **Tetris**            | Puzzle Arcade  | React + Canvas or PixiJS | Medium   |
| **Quantum Architect** | 3D Puzzle      | Three.js                 | Medium   |
| **Elemental Conflux** | 3D Puzzle      | Three.js                 | Medium   |
| **Chrono-Shift**      | 3D/Time Puzzle | Three.js                 | Low      |
| **Space Invasion**    | Arcade Shooter | Phaser 3 or PixiJS       | Low      |
| **Block Blast**       | Puzzle         | React/DOM                | Low      |

---

## Engine Evaluation

### Option 1: PixiJS (2D Renderer)

**Type**: High-performance 2D rendering library (not full engine)

**Pros**:

- ✅ Excellent WebGL-based 2D performance
- ✅ Flexible — works with custom architecture
- ✅ Great for effects, particles, shaders
- ✅ Good React integration options
- ✅ Smaller than full engines

**Cons**:

- ❌ Must bring your own: physics, scene management, collision, animation pipelines
- ❌ Can require rebuilding engine features

**Best For**: Arcade games needing smooth animation and visual polish (Bubble Pop, enhanced Breakout)

**Bundle Size**: ~400KB gzipped

---

### Option 2: Phaser 3 (2D Game Engine)

**Type**: Full-featured 2D game framework

**Pros**:

- ✅ Batteries included: scenes, loaders, animation, camera, input, particles
- ✅ Excellent documentation and community
- ✅ Built-in physics (Arcade Physics, Matter.js support)
- ✅ Fast prototyping for classic 2D genres
- ✅ WebGL/Canvas fallback

**Cons**:

- ❌ Opinionated patterns and architecture
- ❌ React/Next.js integration requires care (canvas lifecycle, SSR)
- ❌ Can feel like "two frameworks"

**Best For**: Platformer, Tower Defense, complex arcade games

**Bundle Size**: ~1MB gzipped

---

### Option 3: Three.js (3D Graphics Library)

**Type**: Industry-standard WebGL 3D rendering library

**Pros**:

- ✅ De facto standard for WebGL
- ✅ Massive ecosystem and examples
- ✅ Excellent 3D rendering capabilities
- ✅ Good React integration via `@react-three/fiber`
- ✅ Active maintenance

**Cons**:

- ❌ Not a game engine — must build game systems
- ❌ No built-in physics (requires add-ons)
- ❌ Steeper learning curve
- ❌ You provide scene/game loop architecture

**Best For**: All 3D games (Quantum Architect, Elemental Conflux, Chrono-Shift)

**Bundle Size**: ~600KB gzipped

---

### Option 4: Babylon.js (3D Game Engine)

**Type**: Full-featured 3D game engine

**Pros**:

- ✅ More complete engine than Three.js
- ✅ Built-in physics plugins
- ✅ Advanced rendering (PBR, lighting)
- ✅ Strong tooling (inspector)

**Cons**:

- ❌ Larger bundle (~1.5MB gzipped)
- ❌ Steeper learning curve
- ❌ More complex API

**Best For**: High-end 3D games requiring full engine features

**Bundle Size**: ~1.5MB gzipped

---

### Other Options (Not Recommended)

- **MelonJS**: Smaller ecosystem than Phaser, no compelling advantage
- **Kaboom.js**: Too simplistic, games may outgrow it
- **PlayCanvas**: Editor-centric workflow conflicts with monorepo structure

---

## Recommended Strategy

### Architecture by Game Category

#### Category 1: Board/UI Games

**Games**: Chess, Checkers, Memory
**Engine**: React/DOM
**Rationale**: Accessibility, responsive layout, simple animations — canvas is overkill

#### Category 2: Simple Arcade/Grid Games

**Games**: Snake, Tetris, Breakout, Bubble Pop
**Current**: Each game has custom React + Canvas implementation
**Options**:

- Keep current custom implementations (working but duplicative)
- Standardize with **PixiJS** for better rendering and shared patterns

**Rationale**: Current approach works but creates code duplication. PixiJS would add polish, standardization, and reduce maintenance burden

#### Category 3: Narrative/Adventure Games

**Games**: Toymaker Escape, Rite of Discovery, Systems Discovery
**Engine**: Keep existing narrative engine
**Enhancement**: Add optional embedded mini-games using Canvas or PixiJS

**Rationale**: Narrative engine already excellent — don't fix what isn't broken

#### Category 4: Complex 2D Real-Time Games

**Games**: Platformer, Tower Defense
**Engine**: **Phaser 3**
**Rationale**:

- Physics, collisions, camera controls built-in
- Pathfinding, waves, entity management
- Faster development than building from scratch

#### Category 5: 3D Games

**Games**: Quantum Architect, Elemental Conflux, Chrono-Shift
**Engine**: **Three.js** (with `@react-three/fiber`)
**Rationale**:

- Industry standard for WebGL
- Best React integration
- Flexible for custom mechanics
- Defer until concrete 3D requirement exists

---

### Summary Decision Matrix

| Game Type     | Recommended Engine       | Current Reality     | Alternative             |
| ------------- | ------------------------ | ------------------- | ----------------------- |
| Board/UI      | React/DOM                | ✅ React/DOM        | -                       |
| Narrative     | Narrative Engine         | ✅ Narrative Engine | -                       |
| Simple Arcade | React + Canvas or PixiJS | ⚠️ Custom per-game  | Standardize with PixiJS |
| Complex 2D    | Phaser 3                 | ❌ Not implemented  | PixiJS + custom         |
| 3D            | Three.js                 | ❌ Not implemented  | Babylon.js              |

---

## Hybrid 2D/3D Architecture

### Games with Optional 3D Modes

Several arcade and board games will support **optional 3D modes** alongside their primary 2D implementations:

| Game           | Primary Mode       | Optional 3D Mode    | Strategy                               |
| -------------- | ------------------ | ------------------- | -------------------------------------- |
| **Tetris**     | 2D (PixiJS/Canvas) | 3D visualization    | Game logic shared, renderer toggleable |
| **Snake**      | 2D (PixiJS/Canvas) | 3D world with depth | Game logic shared, renderer toggleable |
| **Chess**      | 2D (React/DOM)     | 3D board and pieces | Game logic shared, 3D view layer       |
| **Checkers**   | 2D (React/DOM)     | 3D board and pieces | Game logic shared, 3D view layer       |
| **Bubble Pop** | 2D (PixiJS/Canvas) | 3D particle effects | Game logic shared, enhanced visuals    |

### Architecture Pattern for Hybrid Games

**Core Principle**: **Separate game logic from rendering**

```typescript
// Example structure for hybrid 2D/3D game
interface GameState {
  // Pure game state (no rendering logic)
  board: Board;
  score: number;
  level: number;
}

interface Renderer {
  // Renderer-agnostic interface
  render(state: GameState): void;
  cleanup(): void;
}

class PixiRenderer implements Renderer {
  // 2D rendering with PixiJS
}

class ThreeRenderer implements Renderer {
  // 3D rendering with Three.js
}

class HybridGame {
  private state: GameState;
  private renderer: Renderer;

  toggleRenderer(mode: '2d' | '3d') {
    this.renderer.cleanup();
    this.renderer = mode === '2d'
      ? new PixiRenderer()
      : new ThreeRenderer();
  }
}
```

### Implementation Strategy

#### Option A: Shared Game Logic Layer

- ✅ **Recommended for arcade games** (Tetris, Snake, Bubble Pop)
- Game state and rules in pure TypeScript
- 2D renderer: PixiJS
- 3D renderer: Three.js
- Toggle between renderers without affecting gameplay

#### Option B: View Layer Addition

- ✅ **Recommended for board games** (Chess, Checkers)
- Keep existing 2D React/DOM implementation
- Add Three.js 3D view as alternative
- Share move validation and game state
- Simpler than full rewrite

### Three.js Integration Points

**For Narrative Games (TME, ROD, SD)**:

- Use Three.js for **background scenes** and **environment atmosphere**
- Narrative engine remains DOM-based
- 3D scenes are visual enhancement, not interactive gameplay
- Example: 3D-rendered room as background for point-and-click

**For Arcade Games with 3D Mode**:

- Use Three.js for **alternative visualization**
- Core game loop stays the same
- 3D mode is optional player preference
- Example: Tetris pieces falling in 3D space

**For 3D Puzzle Games (QA, ES, CS)**:

- Use Three.js as **primary engine**
- Full 3D interaction required for gameplay
- Example: Quantum Architect manipulating 3D quantum structures

---

## Centralization Strategy

### The Central Question

**Should we centralize arcade game canvas/loop management BEFORE adopting PixiJS?**

### Analysis

#### Current State

- ✅ **Breakout**: ~500 lines of custom canvas + game loop
- ✅ **Snake**: ~400 lines of custom canvas + game loop
- ✅ **Bubble Pop**: ~350 lines of custom canvas + game loop
- **Duplication**: Canvas setup, resize handlers, game loop, DPR scaling

#### Option 1: Centralize First, Then PixiJS

**Approach**: Extract common canvas patterns into shared utilities

**Pros**:

- ✅ Immediate value: reduce duplication in existing games
- ✅ Clearer understanding of what needs to be standardized
- ✅ Easier to identify shared patterns
- ✅ Lower risk: no engine change, just refactoring

**Cons**:

- ❌ Double work: centralize custom code, then replace with PixiJS
- ❌ Delays PixiJS benefits (WebGL, performance, effects)
- ❌ May design abstraction that doesn't fit PixiJS well

**Timeline**: 2-3 weeks refactoring + 2-3 weeks PixiJS migration = **4-6 weeks total**

---

#### Option 2: PixiJS First, Centralization Comes Free

**Approach**: Migrate one game to PixiJS as pilot, then apply pattern to others

**Pros**:

- ✅ PixiJS provides the centralization (Application, Container, Renderer)
- ✅ Single step: custom code → PixiJS unified approach
- ✅ Immediate performance benefits from WebGL
- ✅ Standard patterns from established library
- ✅ Centralization is inherent in PixiJS architecture

**Cons**:

- ❌ Higher initial learning curve
- ❌ Risk if PixiJS doesn't fit well
- ❌ Must learn PixiJS concepts before refactoring all games

**Timeline**: 2-3 weeks PixiJS pilot + 2-3 weeks migrate others = **4-6 weeks total**

---

### Recommendation: **PixiJS First** (Option 2)

**Rationale**:

1. **PixiJS IS the centralization**
   - `PIXI.Application` handles canvas, renderer, ticker (game loop)
   - `PIXI.Container` handles scene graph
   - Resizing, DPR, and lifecycle management built-in

2. **Avoid double work**
   - Centralizing custom code creates temporary abstractions
   - PixiJS provides better, tested abstractions
   - Less throwaway code

3. **Standard patterns**
   - Well-documented PixiJS patterns
   - Community best practices
   - React integration examples exist

4. **Performance gains sooner**
   - WebGL-accelerated rendering
   - Better particle effects
   - Smoother animations

### Hybrid Approach: Pilot + Extract Pattern

**Step 1: PixiJS Pilot (2-3 weeks)**

- Choose one game (recommend **Bubble Pop** - simplest, benefits most from particles)
- Build PixiJS wrapper with React lifecycle
- Extract common patterns into shared utilities
- Document approach

**Step 2: Create Shared PixiJS Utilities (1 week)**

```typescript
// packages/shared/src/pixi/PixiGameHost.tsx
export class PixiGameHost {
  private app: PIXI.Application;

  constructor(canvas: HTMLCanvasElement, options: PixiGameOptions) {
    // Handles app creation, resize, cleanup
  }

  destroy() {
    // Proper cleanup
  }
}
```

**Step 3: Migrate Remaining Games (2-3 weeks)**

- Snake: 2D → PixiJS + add optional 3D mode with Three.js
- Breakout: 2D → PixiJS (enhanced particles)
- Tetris (new): PixiJS + optional 3D mode

### PixiJS Relationship to Custom Canvas

**PixiJS will REPLACE custom canvas implementations**, not complement them:

| Aspect              | Custom Canvas                       | PixiJS                         |
| ------------------- | ----------------------------------- | ------------------------------ |
| **Canvas creation** | Manual                              | `PIXI.Application`             |
| **Game loop**       | `requestAnimationFrame`             | `PIXI.Ticker`                  |
| **Drawing**         | `ctx.fillRect()`, `ctx.drawImage()` | `PIXI.Sprite`, `PIXI.Graphics` |
| **Resize handling** | Manual event listeners              | Built-in resize support        |
| **DPR scaling**     | Manual calculation                  | Automatic                      |
| **Particles**       | Custom implementation               | `@pixi/particle-emitter`       |
| **Performance**     | Canvas 2D                           | WebGL (10-20x faster)          |

**Migration Path Per Game**:

1. Keep game logic (state, rules, collision detection)
2. Replace canvas rendering code with PixiJS equivalents
3. Use `PIXI.Application` instead of custom game loop
4. Use `PIXI.Sprite` / `PIXI.Graphics` instead of `ctx` drawing
5. Leverage PixiJS plugins for effects

### Decision Point

**Before starting PixiJS adoption, decide**:

- [ ] Migrate existing games to PixiJS? (Recommended: Yes, but one at a time)
- [ ] Keep existing games as-is, use PixiJS for new games only? (Safe but misses cleanup opportunity)
- [ ] Hybrid: Pilot one existing game, then decide? (Most pragmatic ✅)

**Recommended**: **Hybrid approach with Bubble Pop as pilot**

---

## Implementation Plan

### Phase 0: Establish Engine Policy (1 week)

#### 1. Tag Games by Category

Update `packages/shared/src/metadata/games.ts` with engine tags:

```typescript
tags: ["Board", "DOM"]           // Chess, Checkers
tags: ["Narrative", "React"]     // Toymaker, Rite of Discovery
tags: ["Arcade", "Canvas"]       // Snake, Breakout
tags: ["Simulation", "Phaser"]   // Platformer, Tower Defense
tags: ["3D", "Three.js"]         // Quantum Architect
```

#### 2. Document Target Stack per Category

| Category    | Stack            | Games                                              |
| ----------- | ---------------- | -------------------------------------------------- |
| `dom-ui`    | React/DOM        | Chess, Checkers, Memory                            |
| `narrative` | Narrative Engine | Toymaker, Rite of Discovery, Systems Discovery     |
| `arcade-2d` | Canvas / PixiJS  | Snake, Tetris, Breakout, Bubble Pop                |
| `sim-2d`    | Phaser 3         | Platformer, Tower Defense                          |
| `3d`        | Three.js         | Quantum Architect, Elemental Conflux, Chrono-Shift |

---

### Phase 1: Create Unified Game Host (2 weeks)

**Goal**: Every engine runs inside the same app shell predictably.

#### Create GameHost Component

```typescript
// packages/shared/src/game-host/GameHost.tsx
interface GameHostProps {
  gameSlug: string;
  engine: 'dom' | 'canvas' | 'phaser' | 'threejs';
  onMount?: () => void;
  onUnmount?: () => void;
}

export function GameHost({ gameSlug, engine }: GameHostProps) {
  // Handle lifecycle: mount, unmount, pause on blur
  // Standardize: sizing, DPR, input focus, audio policy
  // Bridge: save/load, achievements
}
```

**Features**:

- Mount engine on component mount
- Destroy engine on unmount
- Pause on tab blur (optional)
- Handle responsive sizing and DPR
- Centralize input focus and audio mute
- Bridge save/load and achievements

---

### Phase 2: PixiJS Pilot (1-2 weeks)

**Target Game**: Bubble Pop or Breakout

**Tasks**:

1. Add PixiJS dependency to game package
2. Create `PixiGame` class:
   - Constructor takes DOM element
   - Creates `PIXI.Application`
   - Handles resize and cleanup
3. Keep gameplay logic pure TypeScript
4. PixiJS only handles rendering

**Success Criteria**:

- ✅ Stable mount/unmount without leaks
- ✅ Consistent 60 FPS
- ✅ Works in Next.js (`"use client"`)
- ✅ Clean hot-reload behavior

---

### Phase 3: Phaser 3 Pilot (2-3 weeks)

**Target Game**: Platformer or Tower Defense

**Tasks**:

1. Add Phaser dependency to game package
2. Create Phaser bootstrap scene:
   - Preload assets
   - Create main scene with physics
   - Implement game mechanics
3. Build React wrapper:
   - Instantiates `Phaser.Game` into div
   - Ensures cleanup: `game.destroy(true)` on unmount
4. Integrate with GameHub systems (save/load, achievements)

**Success Criteria**:

- ✅ Smooth input and camera controls
- ✅ Clean asset workflow
- ✅ Minimal friction with monorepo build
- ✅ No memory leaks on route changes

---

### Phase 4: Evaluate and Standardize (1 week)

**After both pilots complete:**

**If PixiJS pilot succeeds:**

- Use PixiJS for all arcade-2d games wanting polish
- Document PixiJS patterns and best practices

**If Phaser pilot succeeds:**

- Use Phaser 3 for all sim-2d games
- Create Phaser game template in monorepo

**If both succeed:**

- Maintain both: PixiJS for rendering, Phaser for full games
- Update documentation with decision matrix

---

### Phase 5: Three.js Foundation (Defer until needed)

**Trigger**: When first 3D game (Quantum Architect) enters active development

**Tasks**:

1. Add Three.js and `@react-three/fiber` to monorepo
2. Create 3D game template
3. Implement common 3D interactions (camera, controls, raycasting)
4. Set up asset pipeline (GLTF models, textures)
5. Document 3D development workflow

---

## Game-Specific Recommendations

### Breakout

- **Current**: React + Custom Canvas Loop
- **Recommendation**: Keep as-is or upgrade to PixiJS for better particle effects and rendering
- **Effort**: Low-Medium (PixiJS pilot candidate)

### Chess & Checkers

- **Current**: DOM/React
- **Recommendation**: Keep as-is
- **Potential**: Add optional 3D mode with Three.js (future)
- **Effort**: None

### Toymaker Escape / Rite of Discovery / Systems Discovery

- **Current**: Narrative Engine
- **Recommendation**: Keep narrative engine
- **Enhancements**: Add WebGL shader effects for scene transitions (optional)
- **Effort**: None required

### Platformer

- **Current**: Not implemented
- **Recommendation**: **Phaser 3** (strong candidate)
- **Rationale**: Physics, tilemap support, camera controls
- **Effort**: Medium (Phaser pilot)

### Tower Defense

- **Current**: Not implemented
- **Recommendation**: **Phaser 3**
- **Rationale**: Entity management, pathfinding, performance with many units
- **Effort**: Medium-High

### Tetris

- **Current**: Not implemented
- **Recommendation**: Canvas Engine (simple) or PixiJS (polished)
- **Effort**: Low

### Quantum Architect / Elemental Conflux / Chrono-Shift

- **Current**: Not implemented
- **Recommendation**: **Three.js with @react-three/fiber**
- **Rationale**: Full 3D capabilities, React integration
- **Effort**: High (defer until active development)

---

## Performance Considerations

### Rendering Optimization

- Use texture atlases to reduce draw calls
- Implement sprite batching for multiple objects
- Use WebGL where possible (PixiJS, Phaser, Three.js)
- Implement level-of-detail (LOD) for complex 3D scenes

### Memory Management

- Proper cleanup on unmount (critical for SPA routing)
- Use object pooling for frequently created/destroyed objects
- Monitor memory usage in dev tools
- Test hot-reload behavior

### Asset Loading

- Implement asset preloading with progress indicators
- Optimize asset sizes (compress textures, audio)
- Use CDN for large assets
- Lazy-load game code with dynamic imports

---

## Dependencies Summary

### Core Dependencies

| Engine          | Size (gzipped) | Use Case                |
| --------------- | -------------- | ----------------------- |
| In-house Canvas | 0 KB           | Simple 2D games         |
| PixiJS          | ~400 KB        | Polished 2D rendering   |
| Phaser 3        | ~1 MB          | Full-featured 2D games  |
| Three.js        | ~600 KB        | 3D games                |
| Babylon.js      | ~1.5 MB        | Advanced 3D (if needed) |

### Optional Add-ons

- **Howler.js**: Enhanced audio management (if needed beyond native Web Audio)
- **Matter.js**: Advanced physics for PixiJS games (if not using Phaser)
- **@react-three/fiber**: React bindings for Three.js
- **@react-three/drei**: Helper components for Three.js

---

## Conclusion

### Final Architecture

1. **Keep and maintain** the narrative engine at `packages/shared/src/pointclick/*` (optimal for its purpose)
2. **Acknowledge reality**: GameEngine at `packages/shared/src/pointclick/core/Engine.ts` is NOT used by arcade games
3. **Arcade games currently**: Each uses custom React + Canvas implementation (working but duplicative)
4. **Recommend**: Adopt PixiJS to standardize arcade game rendering and reduce code duplication
5. **Adopt Phaser 3** for complex 2D games requiring physics (platformer, tower defense)
6. **Adopt Three.js** for 3D games when needed (defer until active development)

### Key Benefits

- ✅ **Right tool for each job** — no forced unification
- ✅ **Preserve existing work** — narrative and canvas engines stay
- ✅ **Reduce maintenance** — leverage mature libraries for complex features
- ✅ **Progressive adoption** — pilot before committing
- ✅ **Performance optimized** — WebGL where it matters, DOM where it's simpler

### Next Steps

1. Tag games in manifest with engine categories ✅
2. Create GameHost component for unified lifecycle management
3. Run PixiJS pilot on Bubble Pop
4. Run Phaser pilot on Platformer
5. Document patterns and update developer guide
