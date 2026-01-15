# Package Architecture - GameHub Monorepo

**Last Updated**: January 15, 2026
**Status**: ✅ Production Ready

## Overview

GameHub uses a focused package architecture optimized for bundle size and maintainability. The original monolithic `@games/shared` package (87 dependencies) has been split into three specialized packages.

## Package Structure

```
packages/
├── ui/                          # @gamehub/ui
│   ├── src/
│   │   ├── components/          # 55 shadcn/ui components
│   │   ├── hooks/              # use-mobile, use-toast
│   │   └── lib/                # utils (cn function)
│   └── package.json            # 23 dependencies
│
├── game-platform/               # @gamehub/game-platform
│   ├── src/
│   │   ├── components/         # Game infrastructure
│   │   ├── contexts/           # Game/Auth/Sound contexts
│   │   ├── lib/                # Firebase, i18n, sound
│   │   └── metadata/           # Game registry
│   └── package.json            # ~70 dependencies
│
└── pointclick-engine/           # @games/pointclick-engine
    ├── src/
    │   ├── core/               # Engine, SceneManager
    │   ├── puzzles/            # Gears, pipes, wires, etc.
    │   ├── react/              # DialogueBox, InventoryBar
    │   └── i18n/               # Narrative translations
    └── package.json            # 2 dependencies
```

---

## Package Details

### @gamehub/ui

**Purpose**: Universal UI component library based on shadcn/ui
**Dependencies**: 23
**Size**: ~50KB gzipped
**Used By**: Future games and project UIs (LibraKeeper, QuestHunt, StoryForge)

**Components**:

- 55 UI components (Button, Card, Dialog, Select, Input, etc.)
- 2 hooks (use-mobile, use-toast)
- Utils (cn function for className merging)
- Theme provider (dark/light mode)

**Import Pattern**:

```typescript
import { Button, Card, Dialog } from '@gamehub/ui';
import { useToast } from '@gamehub/ui';
import { cn } from '@gamehub/ui';
```

**Key Features**:

- Fully typed TypeScript
- Radix UI primitives
- Tailwind CSS styling
- Accessible components
- Dark mode support

---

### @gamehub/game-platform

**Purpose**: Game hosting infrastructure and Firebase integration
**Dependencies**: ~70
**Size**: ~200KB gzipped
**Used By**: All 13 games

**Core Features**:

- **Game Infrastructure**: GameContainer, GameHUD, GameShell
- **Contexts**: GameContext, GameSettingsContext, SoundContext, AuthContext
- **Firebase Integration**: Auth, Firestore, Realtime Database
- **Sound System**: soundManager with Howler.js
- **i18n**: Internationalization (EN/FR)
- **Game Progress**: Save/load, leaderboards
- **Metadata**: Game registry and project manifest

**Import Pattern**:

```typescript
import { GameContainer, soundManager } from '@gamehub/game-platform';
import { t, initI18n } from '@gamehub/game-platform/lib/i18n';
import { auth, db } from '@gamehub/game-platform/lib/firebase';
import { useGameSettings } from '@gamehub/game-platform';
```

**Components**:

- GameContainer (universal game wrapper)
- GameCard (game catalog cards)
- Footer, Header, Navbar (app chrome)
- SettingsPanel, SoundControls
- PresenceBadge (real-time user presence)

**Services**:

- Firebase (auth, firestore, realtime DB)
- Sound management
- Game progress tracking
- Leaderboards
- Feature flags

---

### @games/pointclick-engine

**Purpose**: Point-and-click narrative game engine
**Dependencies**: 2 (react, react-dom)
**Size**: ~30KB gzipped
**Used By**: 3 narrative games (rite-of-discovery, toymaker-escape, systems-discovery)

**Core Features**:

- **Game Engine**: Scene management, state persistence
- **Puzzle Systems**: Gears, pipes, wires, keypads, sequences
- **React Components**: DialogueBox, InventoryBar, SceneController
- **i18n**: Narrative-specific translations (EN/FR)
- **Persistence**: Save/load with migrations

**Import Pattern**:

```typescript
import {
  DialogueBox,
  InventoryBar,
  SceneController,
  Scene
} from '@games/pointclick-engine';

import {
  createPipesState,
  evaluatePipes
} from '@games/pointclick-engine';

import {
  versionedSave,
  versionedLoad
} from '@games/pointclick-engine';
```

**Puzzle Systems**:

- Gears (rotation puzzle)
- Pipes (flow puzzle)
- Wires (connection puzzle)
- Keypads (code entry)
- Sequences (pattern matching)

---

## Game Dependencies

### Board/Arcade Games (10)

**Games**: chess, checkers, memory, breakout, snake, bubble-pop, knitzy, platformer, tower-defense, tetris

**Dependencies**:

- `@gamehub/game-platform` ✅
- `@gamehub/ui` ❌ (not needed - use plain HTML/CSS)
- `@games/pointclick-engine` ❌ (not needed)

**Typical Imports**:

```typescript
import { GameContainer, soundManager } from '@gamehub/game-platform';
```

### Narrative Games (3)

**Games**: rite-of-discovery, toymaker-escape, systems-discovery

**Dependencies**:

- `@gamehub/game-platform` ✅
- `@games/pointclick-engine` ✅
- `@gamehub/ui` ❌ (not needed)

**Typical Imports**:

```typescript
import { GameContainer } from '@gamehub/game-platform';
import { t } from '@gamehub/game-platform/lib/i18n';
import {
  DialogueBox,
  InventoryBar,
  Scene,
  createPipesState
} from '@games/pointclick-engine';
```

---

## Bundle Size Impact

### Before Refactoring

- **Simple game**: ~600KB (bundling Firebase + unused deps)
- **Board game**: ~800KB (bundling Three.js + unused deps)
- **Narrative game**: ~900KB (bundling everything)

### After Refactoring (Expected)

- **Simple game**: ~100KB (minimal deps)
- **Board game**: ~300KB (game-platform only)
- **Narrative game**: ~350KB (game-platform + pointclick-engine)

### Savings

- **Simple games**: 83% reduction (~500KB saved)
- **Board games**: 62% reduction (~500KB saved)
- **Narrative games**: 61% reduction (~550KB saved)

---

## Migration History

### Phase 1: @gamehub/ui (Complete)

- Extracted 59 files from @games/shared
- Reduced dependencies: 87 → 23
- Eliminated duplication
- Status: ✅ Production ready

### Phase 2: @gamehub/game-platform (Complete)

- Renamed packages/shared → packages/game-platform
- Updated 15 files across 13 games
- All games migrated successfully
- Status: ✅ Production ready

### Phase 3: @games/pointclick-engine (Complete)

- Extracted narrative engine from game-platform
- Updated 3 narrative games
- Other 10 games automatically have smaller bundles
- Status: ✅ Production ready

---

## Development Guidelines

### Creating a New Game

**Option A: Simple Game (no UI components)**

```json
{
  "dependencies": {
    "@gamehub/game-platform": "workspace:*"
  }
}
```

**Option B: Game with UI Components**

```json
{
  "dependencies": {
    "@gamehub/game-platform": "workspace:*",
    "@gamehub/ui": "workspace:*"
  }
}
```

**Option C: Narrative Game**

```json
{
  "dependencies": {
    "@gamehub/game-platform": "workspace:*",
    "@games/pointclick-engine": "workspace:*"
  }
}
```

### Import Best Practices

1. **Always import from package root when possible**:

   ```typescript
   // ✅ Good
   import { Button } from '@gamehub/ui';

   // ❌ Avoid (breaks tree-shaking)
   import Button from '@gamehub/ui/components/button';
   ```

2. **Use specific sub-paths for large modules**:

   ```typescript
   // ✅ Good (avoids importing all of i18n)
   import { t } from '@gamehub/game-platform/lib/i18n';
   ```

3. **Don't import from internal paths**:

   ```typescript
   // ❌ Wrong
   import { something } from '@gamehub/game-platform/src/internal';

   // ✅ Correct
   import { something } from '@gamehub/game-platform';
   ```

---

## Testing Strategy

### Package Testing

```bash
# Type-check a package
pnpm --filter @gamehub/ui type-check

# Type-check all packages
pnpm -r type-check

# Lint a package
pnpm --filter @gamehub/game-platform lint
```

### Game Testing

```bash
# Test a specific game builds
pnpm --filter @games/chess build

# Test all games
pnpm --filter "@games/*" build
```

---

## Troubleshooting

### TypeScript Errors

**Problem**: Module not found errors
**Solution**: Check tsconfig.json paths are correct

```json
{
  "paths": {
    "@gamehub/ui": ["./packages/ui/src"],
    "@gamehub/game-platform": ["./packages/game-platform/src"],
    "@games/pointclick-engine": ["./packages/pointclick-engine/src"]
  }
}
```

### Import Errors

**Problem**: Cannot find module '@gamehub/ui'
**Solution**: Ensure package.json includes dependency

```json
{
  "dependencies": {
    "@gamehub/ui": "workspace:*"
  }
}
```

### Build Errors

**Problem**: Workspace dependency not found
**Solution**: Run `pnpm install` at root

```bash
pnpm install
```

---

## Future Considerations

### Potential New Packages

1. **@gamehub/3d-engine** - For 3D games using Three.js/React Three Fiber
2. **@gamehub/physics** - Physics engine wrapper (Matter.js/Rapier)
3. **@gamehub/multiplayer** - Real-time multiplayer infrastructure
4. **@gamehub/analytics** - Game analytics and telemetry

### Package Split Criteria

Split a package when:

- ✅ Subset of games need it (like pointclick-engine)
- ✅ Dependencies are heavy (>10MB)
- ✅ Clear domain boundary exists
- ✅ Multiple games would benefit from smaller bundles

Don't split when:

- ❌ Only 1 game uses the code
- ❌ Code is tightly coupled
- ❌ Dependencies are already in game-platform
- ❌ Split provides <5% bundle size improvement

---

## Related Documentation

- [Action Plan](./action-plan.md) - Overall project roadmap
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Migration progress
- [Architecture Strategy](./ARCHITECTURE_STRATEGY.md) - Long-term architecture vision

---

**For Questions**: Contact the development team or refer to the action plan.
