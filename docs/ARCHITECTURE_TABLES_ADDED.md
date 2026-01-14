# Architecture Tables Added - January 14, 2026

## What Was Added

Re-added critical comparison tables to `ARCHITECTURE_OPTIONS_ANALYSIS.md` and enhanced `action-plan.md` with game engine information.

## Tables Added to ARCHITECTURE_OPTIONS_ANALYSIS.md

### 1. Detailed Project Comparison Table

Complete comparison of all 4 projects:

| Project      | Current Stack               | Recommended Stack     | Rationale | Pros | Cons | Alternatives       |
| ------------ | --------------------------- | --------------------- | --------- | ---- | ---- | ------------------ |
| LibraKeeper  | Next.js + NextAuth + Prisma | **Keep Current**      | ...       | ...  | ...  | Convex (rejected)  |
| QuestHunt    | Next.js + Supabase          | **Keep Supabase**     | ...       | ...  | ...  | Convex, Prisma     |
| StoryForge   | Stub                        | **Prisma + NextAuth** | ...       | ...  | ...  | Convex             |
| VelvetGalaxy | Not implemented             | **TBD**               | ...       | ...  | ...  | Prisma or Supabase |

**Location**: Section "Project-Specific Analysis"

### 2. Detailed Game Comparison Table

Complete comparison of all 10+ games with engine recommendations:

| Game              | Type               | Current Implementation | Recommended Stack            | Rationale | Pros | Cons | Alternatives      |
| ----------------- | ------------------ | ---------------------- | ---------------------------- | --------- | ---- | ---- | ----------------- |
| Chess             | Board              | React + DOM            | **Keep Current**             | ...       | ...  | ...  | PixiJS (overkill) |
| Breakout          | Arcade             | React + Canvas         | **Keep Current** / PixiJS v2 | ...       | ...  | ...  | PixiJS            |
| Rite of Discovery | Narrative          | Custom pointclick      | **Keep** (extract)           | ...       | ...  | ...  | -                 |
| Platformer        | Platform (planned) | Not implemented        | **Phaser 3**                 | ...       | ...  | ...  | PixiJS + custom   |
| Quantum Architect | 3D (planned)       | Not implemented        | **Three.js + R3F**           | ...       | ...  | ...  | Babylon.js        |

**Total Games Covered**: 16 (10 existing + 6 planned)

**Location**: Section "Game Infrastructure Analysis"

### 3. Game Engine Recommendations Table

Quick reference for engine selection:

| Engine                | Best For                    | Bundle Size | Pros                              | Cons                        | Use When                |
| --------------------- | --------------------------- | ----------- | --------------------------------- | --------------------------- | ----------------------- |
| **React + DOM**       | Board, card, simple puzzles | ~50-100KB   | Lightweight, accessible           | Not for complex animations  | Static/simple games     |
| **React + Canvas**    | Simple arcade               | ~100-200KB  | Full control, lightweight         | Manual sprites, duplication | Custom requirements     |
| **PixiJS**            | 2D arcade, sprites          | ~200-300KB  | Sprite handling, WebGL, particles | Learning curve              | Arcade with sprites     |
| **Phaser 3**          | Platformers, tower defense  | ~400KB      | Full framework, physics, tilemap  | Larger bundle               | Complex 2D with physics |
| **Three.js + R3F**    | 3D games                    | ~600KB      | Industry standard 3D              | Heavy bundle, steep curve   | Any 3D requirement      |
| **Custom Pointclick** | Narrative/adventure         | ~50KB       | Optimized, i18n, saves            | Genre-specific              | Narrative games         |

**Location**: Section "Game Infrastructure Analysis"

### 4. Core Application Infrastructure Table

Complete infrastructure component comparison:

| Component         | Recommendation          | Rationale              | Pros                        | Cons            | Alternatives           |
| ----------------- | ----------------------- | ---------------------- | --------------------------- | --------------- | ---------------------- |
| **API Layer**     | **Expand NestJS**       | Unified backend        | Full control, TypeScript    | Manual setup    | Convex, tRPC           |
| **Main Database** | **Prisma + PostgreSQL** | Best balance           | ACID, type-safe, migrations | More setup      | Supabase, Convex       |
| **Auth**          | **Per-project**         | Each optimized         | Maximum flexibility         | No SSO          | Centralized (rejected) |
| **Game Database** | **Firebase Firestore**  | Ideal for leaderboards | Free tier, real-time        | Large bundle    | Supabase               |
| **Email**         | **Resend**              | Developer-friendly     | Simple API                  | -               | SendGrid, Postmark     |
| **Monitoring**    | **TBD** (plan Sentry)   | Error tracking needed  | -                           | Additional cost | Sentry, LogRocket      |

**Plus**: Caching, Background Jobs, Analytics, File Storage, Real-time

**Location**: New section "Core Application Infrastructure"

## Game Engine Info Added to action-plan.md

### Current Game Engines Section

Added clear breakdown of current game implementations:

```markdown
**Current Game Engines**:

- ✅ React + DOM: Board games (Chess, Checkers, Memory) - Keep current
- ✅ React + Canvas: Arcade games (Breakout, Snake, Bubble Pop) - Keep current
- ✅ Custom Pointclick Engine: Narrative games - Extract to package, excellent
- 🔜 PixiJS: Future arcade games needing sprites/particles
- 🔜 Phaser 3: Future platformers/tower defense
- 🔜 Three.js + R3F: Future 3D games
```

**Location**: Section "4. Game Engine Strategy"

## Why This Was Important

### Problem

The original ARCHITECTURE_OPTIONS_ANALYSIS.md had these tables but they were **removed** in the consolidation, losing critical information:

- **Project comparison** with pros/cons/alternatives
- **Game-by-game recommendations** with engine choices
- **Infrastructure components** with decision rationale
- **Engine selection guide** for future games

### Solution

Re-added all tables with:

- ✅ Accurate current state information
- ✅ Clear recommendations for each item
- ✅ Pros, cons, and alternatives for informed decisions
- ✅ Links to detailed strategy documents
- ✅ Bundle size impacts
- ✅ Cost information

## Benefits

### 1. Quick Reference

Tables provide at-a-glance comparison without reading full analysis:

- Which projects use what stack
- Which games need which engines
- What infrastructure to use for what

### 2. Decision Making

Clear alternatives and rationale for each decision:

- Why keep LibraKeeper on Prisma? (See pros/cons)
- Why not use Convex for QuestHunt? (No PostGIS)
- When to use PixiJS vs Phaser 3? (See engine table)

### 3. Future Planning

Recommendations for unimplemented items:

- StoryForge: Prisma + NextAuth + Socket.io
- VelvetGalaxy: TBD based on requirements
- New games: Clear engine selection guide

### 4. Consistency

All documents now aligned:

- ARCHITECTURE_OPTIONS_ANALYSIS.md: Detailed tables
- GAME_ENGINE_STRATEGY.md: Implementation patterns
- action-plan.md: Quick reference and timeline

## Tables Summary

| Table                         | Items Covered                     | Location                         |
| ----------------------------- | --------------------------------- | -------------------------------- |
| **Project Comparison**        | 4 projects                        | ARCHITECTURE_OPTIONS_ANALYSIS.md |
| **Game Comparison**           | 16 games (10 existing, 6 planned) | ARCHITECTURE_OPTIONS_ANALYSIS.md |
| **Engine Recommendations**    | 6 engine types                    | ARCHITECTURE_OPTIONS_ANALYSIS.md |
| **Infrastructure Components** | 11 components                     | ARCHITECTURE_OPTIONS_ANALYSIS.md |
| **Game Engine Summary**       | Quick reference                   | action-plan.md                   |

## Cross-References

All tables link to detailed documentation:

- Game tables → [GAME_ENGINE_STRATEGY.md](./GAME_ENGINE_STRATEGY.md)
- Package split → [ARCHITECTURE_STRATEGY.md](./ARCHITECTURE_STRATEGY.md)
- Backend platforms → Platform sections in same document
- Implementation tasks → [action-plan.md](./action-plan.md)

## Next Steps

**For Development**:

1. Use **Project Comparison table** when making stack decisions
2. Use **Game Comparison table** when implementing/refactoring games
3. Use **Engine Recommendations table** when starting new games
4. Use **Infrastructure table** when adding new components

**For Documentation**:

- Tables are now the single source of truth for recommendations
- Update tables when decisions change
- Keep consistent with implementation reality

---

**Date**: January 14, 2026
**Status**: ✅ Complete
**Result**: All critical comparison tables restored and enhanced
