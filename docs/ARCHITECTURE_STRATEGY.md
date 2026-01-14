# GameHub Architecture Strategy

**Status:** 🎯 Approved & Ready for Implementation
**Date:** January 12, 2026
**Context:** Next.js 16 Turbopack workspace limitations + bundle optimization

---

## Executive Summary

GameHub currently has a massive `@games/shared` package (87 dependencies) that mixes:

- Universal UI components
- Game platform infrastructure
- Specialized game engines
- Heavy external dependencies (Firebase, Three.js)

**The Problem:**

- Projects can't use shared UI without bundling game dependencies
- Simple games bundle Three.js unnecessarily
- Unclear boundaries and responsibilities
- Turbopack workspace resolution issues

**The Solution:**
Strategic decomposition into focused packages with clear boundaries.

---

## Current State

### Inventory

**Projects (4):**

- `libra-keeper` - Finance app (independent, NextAuth + Prisma)
- `quest-hunt` - Geocaching social network (independent, Supabase)
- `story-forge` - Writing platform (stub, planned independent)
- `velvet-galaxy` - Lifestyle network (stub, planned independent)

**Games (17):**

- Simple canvas: bubble-pop, platformer, tower-defense, knitzy
- Board/strategy: chess, checkers, memory, breakout, tetris
- Point-and-click: rite-of-discovery, systems-discovery, toymaker-escape
- 3D: snake (Three.js)
- Planned: chrono-shift, elemental-conflux, quantum-architect

**Shared Package:**

- 87 dependencies
- 100+ exports (components, contexts, engines, utilities)
- Serves multiple incompatible purposes

---

## Target Architecture

### Package Structure

```
packages/
├── ui/                                    # @gamehub/ui (NEW - 15 deps)
│   ├── components/ui/                     # shadcn/ui components
│   ├── hooks/                             # use-toast, use-mobile
│   ├── lib/utils.ts                       # cn(), merge utils
│   └── components/theme-provider.tsx      # Theme context
│
├── game-platform/                         # @gamehub/game-platform (30 deps)
│   ├── components/                        # GameShell, GameHUD, GameCard
│   ├── contexts/                          # Game*, Settings*, Sound*
│   ├── lib/                               # Firebase, sound, progress
│   ├── metadata/                          # Game registry
│   └── services/                          # Leaderboards, presence
│
├── pointclick-engine/                     # @games/pointclick-engine (5 deps)
│   ├── core/                              # Engine, SceneManager
│   ├── puzzles/                           # Puzzle systems
│   ├── react/                             # DialogueBox, InventoryBar
│   └── i18n/                              # Narrative translations
│
├── games/
│   ├── [simple-games]/                    # Optional game-platform usage
│   ├── [board-games]/                     # ui + game-platform
│   ├── [pointclick-games]/                # All three packages
│   └── snake/                             # ui + game-platform + own Three.js
│
└── projects/
    ├── libra-keeper/                      # Independent (own UI)
    ├── quest-hunt/                        # Independent (own UI)
    ├── story-forge/                       # Independent (optional @gamehub/ui)
    └── velvet-galaxy/                     # Independent (optional @gamehub/ui)
```

---

## Package Definitions

### 1. @gamehub/ui

**Purpose:** Universal, lightweight UI component library

**Contents:**

- All shadcn/ui components (button, card, dialog, input, etc.)
- Radix UI wrappers
- Tailwind utilities (cn, merge)
- Theme provider (next-themes)
- Basic hooks (use-toast, use-mobile)

**Dependencies:** ~15

```json
{
  "@radix-ui/react-*": "^1.x",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^3.4.0",
  "next-themes": "^0.4.0",
  "react": "19.x",
  "react-dom": "19.x"
}
```

**Usage:** ANY application (games or projects)

**Build:** Turbopack compatible (no workspace dependencies)

---

### 2. @gamehub/game-platform

**Purpose:** Game hosting platform infrastructure for GameHub

**Contents:**

- Game containers & layouts (GameShell, GameHUD, GameContainer)
- Game contexts (GameContext, GameSettingsContext, SoundContext)
- Sound system (SoundManager, sound utilities)
- Game progress tracking (Firebase integration)
- Leaderboards & scoring
- Game metadata registry
- Presence system (realtime features)
- Platform authentication wrapper
- Settings panels

**Dependencies:** ~30

```json
{
  "@gamehub/ui": "workspace:*",
  "firebase": "^11.x",
  "@stomp/stompjs": "^7.0.0",
  "sonner": "^2.0.0",
  "howler": "^2.2.0",
  "react": "19.x"
}
```

**Usage:** Games hosted on GameHub platform

**Build:** Uses @gamehub/ui (alias-based, works with Turbopack)

---

### 3. @games/pointclick-engine

**Purpose:** Specialized engine for point-and-click narrative games

**Contents:**

- Core engine (GameEngine, SceneManager, Persistence)
- Puzzle systems (gears, keypad, pipes, sequence, wires)
- React components (DialogueBox, InventoryBar, SceneController)
- Scene services & utilities
- i18n system for narratives
- Entity management

**Dependencies:** ~5

```json
{
  "@gamehub/ui": "workspace:*",
  "react": "19.x",
  "react-dom": "19.x"
}
```

**Usage:** Point-and-click adventure games only

**Build:** Uses @gamehub/ui (alias-based, works with Turbopack)

---

## Dependency Strategy

### Projects (Standalone Apps)

**Decision:** Fully Independent

**Rationale:**

1. Different authentication providers (NextAuth, Supabase, custom)
2. Different databases (Prisma PostgreSQL, Supabase, custom)
3. Different deployment targets
4. No game platform coupling needed
5. Turbopack workspace limitations

**Architecture:**

- Own local UI components (copied from @gamehub/ui if desired)
- Own authentication strategy
- Own database schema
- Own deployment configuration

**Benefits:**

- True independence
- Smaller bundles (only what's used)
- No game platform code
- Easier deployment

**Example:**

```typescript
// libra-keeper - fully independent
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// NO @gamehub/* dependencies
```

---

### Simple Canvas Games

**Decision:** Minimal or No Game Platform

**Rationale:**

1. Self-contained game logic
2. Don't need Firebase, leaderboards, or platform features
3. Smaller bundle is critical for performance

**Architecture:**

- Optional @gamehub/game-platform (for leaderboards only)
- Own canvas rendering
- Own game state management

**Example:**

```typescript
// bubble-pop - standalone canvas game
export default function BubblePopGame() {
  // Pure canvas logic, no dependencies
  return <canvas ref={canvasRef} />;
}
```

---

### Board/Strategy Games

**Decision:** UI + Game Platform

**Rationale:**

1. Need UI components for game controls
2. Benefit from leaderboards & scoring
3. Use sound system
4. Want game progress tracking

**Architecture:**

- @gamehub/ui for components
- @gamehub/game-platform for platform features
- Own game logic

**Example:**

```typescript
// chess
import { Button, Card } from '@gamehub/ui';
import { GameContainer, useGameSettings, soundManager } from '@gamehub/game-platform';

export default function ChessGame() {
  const { difficulty } = useGameSettings();
  // Game logic with platform integration
}
```

---

### Point-and-Click Games

**Decision:** All Three Packages

**Rationale:**

1. Need UI components
2. Need game platform features
3. Require specialized narrative engine

**Architecture:**

- @gamehub/ui for components
- @gamehub/game-platform for platform
- @games/pointclick-engine for engine

**Example:**

```typescript
// rite-of-discovery
import { Button } from '@gamehub/ui';
import { GameContainer } from '@gamehub/game-platform';
import { SceneController, DialogueBox, GameEngine } from '@games/pointclick-engine';

// Rich narrative game with engine integration
```

---

### 3D Games

**Decision:** UI + Game Platform + Own 3D Dependencies

**Rationale:**

1. Only snake uses Three.js
2. Don't force all games to bundle 3D libraries
3. Game-specific rendering needs

**Architecture:**

- @gamehub/ui for UI components
- @gamehub/game-platform for platform
- Own Three.js dependencies

**Example:**

```typescript
// snake
import { Button } from '@gamehub/ui';
import { GameContainer } from '@gamehub/game-platform';
import { Canvas } from '@react-three/fiber';
// Three.js only in snake's package.json
```

---

## Authentication Strategy

### Current State

- **@games/shared**: Custom AuthContext for backend API
- **libra-keeper**: NextAuth with Prisma adapter
- **quest-hunt**: Supabase Auth
- **No unification possible** due to different providers

### Recommendation

**Keep Separate** - No forced auth unification

**Rationale:**

1. Projects have different auth requirements
2. Different databases require different adapters
3. Forced unification would limit flexibility
4. Each app can optimize for its use case

**Strategy:**

- Projects: Use whatever auth best fits needs
- Games: Use @gamehub/game-platform auth wrapper (optional)
- No shared auth infrastructure

---

## Database Strategy

### Current State

- **libra-keeper**: Prisma + PostgreSQL
- **quest-hunt**: Supabase (PostgreSQL)
- **story-forge**: Prisma (planned)
- **Games**: Firebase (game platform features)

### Recommendation

**Keep Separate** - No shared database schemas

**Rationale:**

1. Different apps have completely different domains
2. Different ORMs (Prisma vs Supabase client)
3. Games use Firebase for real-time features
4. No benefit to forced unification

**Strategy:**

- Each project: Own database & schema
- Game platform: Firebase for leaderboards/progress
- No centralized database

---

## Shared Types Strategy

### Problem

Currently duplicating types across packages

### Solution

**Types follow domain boundaries**

**Rules:**

1. **UI types** → @gamehub/ui

   ```typescript
   // packages/ui/src/types/index.ts
   export type ButtonVariant = 'default' | 'destructive' | 'outline';
   export interface ToastOptions { ... }
   ```

2. **Game platform types** → @gamehub/game-platform

   ```typescript
   // packages/game-platform/src/types/index.ts
   export interface Game { id, name, description, ... }
   export interface GameSettings { difficulty, sound, ... }
   ```

3. **Project-specific types** → Stay in project

   ```typescript
   // libra-keeper/src/types/
   export interface Item { ... }
   export interface Loan { ... }
   ```

4. **Shared utility types** → Create if truly universal
   ```typescript
   // packages/types/ (if needed)
   export type Nullable<T> = T | null;
   export type AsyncState<T> = { data?: T, loading: boolean, error?: Error };
   ```

**No duplication:**

- Import types from source package
- Use TypeScript's `export type` for type-only imports
- Tree-shaking will remove unused types

---

## Bundle Size Optimization

### Current State

- Games bundling Firebase + Three.js unnecessarily
- Projects can't use shared UI without game deps
- ~87 dependencies in every import

### Target State

| Package                  | Dependencies | Typical Bundle Impact |
| ------------------------ | ------------ | --------------------- |
| @gamehub/ui              | 15           | ~50KB gzipped         |
| @gamehub/game-platform   | 30           | ~200KB gzipped        |
| @games/pointclick-engine | 5            | ~30KB gzipped         |
| **Simple game**          | 0-15         | ~50KB or less         |
| **Board game**           | 15+30        | ~250KB                |
| **Point-and-click**      | 15+30+5      | ~280KB                |

**Savings:**

- Simple games: ~500KB+ savings (no Firebase/Three.js)
- Projects: ~800KB+ savings (no game platform code)
- Board games: ~300KB+ savings (no Three.js)

---

## Migration Plan

### Phase 1: Extract @gamehub/ui (Week 1)

**Steps:**

1. Create packages/ui directory structure
2. Move UI components from shared
3. Move hooks (use-toast, use-mobile)
4. Move utils (cn, merge)
5. Setup package.json with minimal deps
6. Configure tsconfig for exports
7. Update imports in games using UI

**Impact:**

- 10-15 games need import updates
- Low risk (isolated changes)
- Immediate bundle savings

**Validation:**

- All games build successfully
- Bundle sizes reduced
- No functionality broken

---

### Phase 2: Rename & Refactor (Week 1-2)

**Steps:**

1. Rename packages/shared → packages/game-platform
2. Update package name in package.json
3. Update all imports across games
4. Remove UI components (now in @gamehub/ui)
5. Update tsconfig aliases
6. Update documentation

**Impact:**

- All games using shared
- Medium effort (find-replace)
- Low risk

**Validation:**

- All games build successfully
- Imports resolved correctly
- No missing dependencies

---

### Phase 3: Extract Point-and-Click Engine (Week 2)

**Steps:**

1. Create packages/pointclick-engine directory
2. Move pointclick code from game-platform
3. Update 3 point-and-click games
4. Remove from game-platform

**Impact:**

- 3 games
- Low risk (small surface area)

**Validation:**

- Point-and-click games work correctly
- Other games don't bundle pointclick code
- Bundle sizes reduced

---

### Phase 4: Externalize Heavy Deps (Week 2)

**Steps:**

1. Move Three.js deps to snake game only
2. Remove from game-platform
3. Update snake build config

**Impact:**

- 1 game
- Medium risk (build config)

**Validation:**

- Snake game works with 3D rendering
- Other games don't bundle Three.js
- Significant bundle savings

---

### Phase 5: Cleanup & Documentation (Week 3)

**Steps:**

1. Remove unused files (e.g., \_engine if unused)
2. Consolidate duplicate utilities
3. Update all documentation
4. Create usage guidelines
5. Add examples for each pattern

**Impact:**

- All packages
- Low risk

---

## File Structure Cleanup

### Remove from Git Tracking:

```
.next/
.turbo/
node_modules/
dist/
build/
*.log
.env (keep .env.example)
coverage/
.cache/
```

### Consolidate:

```
docs/                    # All documentation
  ├── ARCHITECTURE_STRATEGY.md
  ├── STANDALONE_PROJECTS_MIGRATION.md
  ├── UI_COMPONENTS.md
  ├── GAME_PLATFORM_API.md
  └── POINTCLICK_ENGINE_API.md

tests/                   # All tests (if not co-located)
  ├── integration/
  └── e2e/
```

### Delete Redundant:

- Duplicate Tailwind configs (consolidate)
- Unused \_engine package (if confirmed)
- Old migration docs (archived)
- Duplicate ESLint configs (use root)

---

## Success Criteria

### Must Achieve:

- ✅ All games build successfully
- ✅ All projects build successfully
- ✅ Bundle sizes reduced by >40%
- ✅ Clear package boundaries
- ✅ No duplicate dependencies
- ✅ Turbopack compatibility maintained
- ✅ All tests pass
- ✅ Documentation complete

### Quality Metrics:

- Package dependency count:
  - @gamehub/ui: <20 deps
  - @gamehub/game-platform: <35 deps
  - @games/pointclick-engine: <10 deps
- Bundle sizes:
  - Simple games: <100KB
  - Board games: <300KB
  - Point-and-click: <350KB
- Build times: <30s per package

---

## Risk Mitigation

### High Risk Areas:

1. **Import updates** across many files
   - Mitigation: Use automated find-replace, test incrementally

2. **Turbopack compatibility** with new structure
   - Mitigation: Test early, use aliases, document workarounds

3. **Breaking changes** to game APIs
   - Mitigation: Maintain backward compatibility where possible

### Rollback Plan:

- Git branches for each phase
- Can revert to working state anytime
- Test each phase independently

---

## Conclusion

This architecture strategy provides:

- **Clear boundaries** between packages
- **Smaller bundles** through strategic decomposition
- **Maintained flexibility** for projects to stay independent
- **Better maintainability** through focused packages
- **Turbopack compatibility** through proper structure

**Estimated effort:** 2-3 weeks with low risk when following phased approach.

**Next step:** Begin Phase 1 - Extract @gamehub/ui package
