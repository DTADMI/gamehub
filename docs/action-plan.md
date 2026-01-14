# GameHub Action Plan

**Last Updated**: January 14, 2026
**Current Sprint**: Architecture Optimization & Bundle Size Reduction

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

---

## 📋 Document Overview

**This is the SINGLE SOURCE OF TRUTH for all active tasks and planning.**

This document contains:

- ✅ Current sprint objectives with detailed implementation tasks
- 📊 Project status and progress metrics
- 🏗️ Architecture priorities and decisions
- 🎯 Weekly sprint goals with actionable checklists
- 📝 Summary of key learnings and decisions

**Related Documents**:

- **[Architecture Analysis](./ARCHITECTURE_OPTIONS_ANALYSIS.md)** - Platform strategy ⭐ **UPDATED JAN 14**
- **[Architecture Strategy](./ARCHITECTURE_STRATEGY.md)** - Package splitting details
- **[Game Engine Strategy](./GAME_ENGINE_STRATEGY.md)** - Game implementation patterns
- **[Evaluation Criteria Update](./EVALUATION_CRITERIA_UPDATE.md)** - Why priorities changed ⭐ **NEW**
- **[Completed Archive](./action-plan-archive.md)** - Historical completed tasks

**Note**: `action-plan-current.md` has been marked outdated and replaced by detailed tasks in this document.

**Evaluation Framework**: When making any architecture decision, use this priority order:

1. **Fit for Purpose** - Does it solve the problem well?
2. **Performance** - How does it perform at scale?
3. **Cost** - What's the total cost of ownership?
4. **Bundle Size** - Client-side impact (important but secondary)

---

## 📋 Quick Navigation

- **[Current Sprint](#-current-sprint)** - Active work items
- **[Sprint Goals](#-sprint-goals)** - Detailed weekly tasks with checklists
- **[Project Status](#-project-status)** - Overall progress
- **[Architecture Priorities](#-architecture-priorities)** - Key decisions
- **[Technical Priorities](#-technical-priorities)** - What to do (and NOT do)

---

## 🎯 Current Sprint

**Focus**: Bundle Size Optimization & Architecture Validation
**Duration**: January 14 - January 28, 2026

### Active Tasks

#### 🟡 In Progress

1. **Architecture Validation Complete** ✅
   - Verified current implementation state
   - Updated ARCHITECTURE_OPTIONS_ANALYSIS.md with accurate information
   - Confirmed hybrid architecture is optimal
   - Documented clear priorities

#### 🔜 Up Next (Priority Order)

1. **⭐ PRIORITY 1: Split @games/shared Package** (3-4 weeks)
   - Extract `@gamehub/ui` (UI components only, ~15 deps)
   - Extract `@gamehub/game-platform` (Game infra + Firebase, ~30 deps)
   - Extract `@games/pointclick-engine` (Narrative engine, ~5 deps)
   - **Expected Impact**: 40-60% bundle reduction per game (200-400KB savings)
   - **Status**: Documented in ARCHITECTURE_STRATEGY.md, ready to implement

2. **⭐ PRIORITY 2: Build Unified Admin Dashboard** (4-6 weeks)
   - Expand NestJS backend with admin modules
   - Create admin frontend in main app
   - Unified management for all projects, games, users
   - Feature flags and access control
   - Connect to Firebase/Supabase data sources

3. **Documentation & Optimization** (1-2 weeks)
   - Document current architecture patterns
   - Create deployment guides per project
   - Audit unused dependencies
   - Performance profiling

### Completed This Sprint

- ✅ Analyzed actual codebase implementation
- ✅ Verified projects are already independent (no @games/shared dependency)
- ✅ Confirmed database consolidation complete (Prisma schema)
- ✅ Documented accurate current state
- ✅ Updated architecture strategy with reality-based recommendations
- ✅ Identified @games/shared bloat as primary optimization target
- ✅ **Updated evaluation criteria** (Fit → Performance → Cost → Bundle)
- ✅ **Enhanced platform comparison** with proper priorities
- ✅ **Added Search component** to infrastructure table
- ✅ **Integrated external research** on platform capabilities

---

## 📊 Project Status

### Overall Progress

```
Monorepo Infrastructure:  ██████████ 100% ✅
Architecture Validation:   ██████████ 100% ✅
Projects Independence:     ██████████ 100% ✅
Database Consolidation:    █████████░  90% (QuestHunt separate - intentional)
Bundle Optimization:       ███░░░░░░░  30% (split @games/shared = next priority)
Admin Dashboard:          ██░░░░░░░░  20% (NestJS ready, needs implementation)
Documentation:            ████████░░  80%
```

### Current Sprint Status

- **Total Tasks**: 3 major priorities
- **Completed This Sprint**: Architecture validation ✅
- **In Progress**: Planning @games/shared split 🟡
- **Next Up**: Implementation phase 🔜

### Key Metrics

- **Active Games**: 10 playable (7 arcade/board, 3 narrative)
- **Projects**: 2 production (LibraKeeper, QuestHunt), 2 planned (StoryForge, VelvetGalaxy)
- **Current Bundle Sizes**: 800KB-1.4MB per game (optimization target: 400KB-900KB)
- **Monthly Costs**: $20-40 (optimal)
- **Test Coverage**: 85% (backend), 75% (frontend)
- **Build Time**: ~2 minutes (Turbo optimized)

---

## 🏗️ Architecture Priorities

### 1. Monorepo Infrastructure ✅ (100% Complete)

**Status**: ✅ Complete and working

**Achievements**:

- ✅ Turborepo + pnpm workspaces configured
- ✅ Projects independently deployable
- ✅ Database schema consolidated (Prisma)
- ✅ CI/CD pipelines established
- ✅ Docker configurations ready

**Reality Check**: Projects are **already independent** with local UI components (Turbopack limitation solved)

### 2. Bundle Size Optimization ⭐ (30% Complete - TOP PRIORITY)

**Status**: Problem identified, solution documented, ready to implement

**See**: [ARCHITECTURE_STRATEGY.md](./ARCHITECTURE_STRATEGY.md)

**Problem**: @games/shared package bloat (87 dependencies)

- Contains: UI + Game Platform + Firebase + Three.js + Narrative Engine
- Impact: Every game bundles everything (800KB-1.4MB)
- Should be: Games only bundle what they use (400KB-900KB)

**Solution**: Split into 3 focused packages

1. `@gamehub/ui` - UI components only (~15 deps, ~50KB)
2. `@gamehub/game-platform` - Game infra + Firebase (~30 deps, ~200KB)
3. `@games/pointclick-engine` - Narrative engine (~5 deps, ~30KB)

**Expected Impact**: 40-60% bundle reduction (200-400KB savings per game)

**Timeline**: 3-4 weeks

**Next Steps**:

1. Create packages/ui directory structure
2. Move UI components from shared
3. Update game imports
4. Test and validate

### 3. Unified Admin Dashboard (20% Complete - PRIORITY 2)

**Status**: NestJS backend ready, admin features need implementation

**Goal**: Single interface to manage all projects, games, users, features

**Architecture**:

- Backend: Expand NestJS (apps/api/src/modules/admin)
- Frontend: Admin section in main app (apps/app/app/admin)
- Data: Connect to Prisma, Firebase Admin SDK, Supabase API

**Features Needed**:

- User management across all projects
- Feature flags per project/game
- Analytics dashboard
- Access control management
- Content management

**Timeline**: 4-6 weeks

### 4. Game Engine Strategy (Documented - On Hold)

**Status**: Strategy complete, defer implementation

**See**: [GAME_ENGINE_STRATEGY.md](./GAME_ENGINE_STRATEGY.md) for detailed patterns

**Decision**: Address @games/shared bloat first, then consider game engine standardization

**Current Game Engines**:

- ✅ **React + DOM**: Board games (Chess, Checkers, Memory) - Keep current
- ✅ **React + Canvas**: Arcade games (Breakout, Snake, Bubble Pop) - Keep current, consider PixiJS for v2
- ✅ **Custom Pointclick Engine**: Narrative games (RoD, TME, SD) - Extract to package, excellent
- 🔜 **PixiJS**: Future arcade games needing sprites/particles (~200-300KB)
- 🔜 **Phaser 3**: Future platformers/tower defense (~400KB)
- 🔜 **Three.js + R3F**: Future 3D games (~600KB)

**Next Steps** (after @games/shared split):

- Consider PixiJS pilot for new arcade game or Bubble Pop v2
- Use Phaser 3 for Platformer when ready
- Keep current implementations (working well)

### 5. Platform Strategy ✅ (100% Complete)

**Status**: Analysis complete, decisions made

**See**: [ARCHITECTURE_OPTIONS_ANALYSIS.md](./ARCHITECTURE_OPTIONS_ANALYSIS.md) ⭐ **UPDATED JAN 14**

**Evaluation Priority**: 1️⃣ Fit for Purpose → 2️⃣ Performance → 3️⃣ Cost → 4️⃣ Bundle Size

**Key Decisions** (based on proper evaluation criteria):

| Project/System  | Platform           | Why (Fit → Performance → Cost → Bundle)                                         |
| --------------- | ------------------ | ------------------------------------------------------------------------------- |
| **LibraKeeper** | NextAuth + Prisma  | CRUD operations, relational data → Optimized queries → $0/month → Server-side   |
| **QuestHunt**   | Supabase           | PostGIS (geospatial critical) → PostgreSQL + RLS → $0/month → ~100KB            |
| **StoryForge**  | Prisma + NextAuth  | Writing platform, relational content → SQL power → Shared infra → Server-side   |
| **Games**       | Firebase Firestore | Leaderboards (nested data), real-time → Battle-tested scale → $0/month → ~200KB |
| **Admin**       | NestJS + Prisma    | Unified dashboard, full control → Customizable → Minimal → Server-side          |

**Rejections**:

- ❌ **Convex**: Wrong fit for diverse project types, high lock-in, expensive migration (12-20w)
- ❌ **Centralized Auth**: Wrong fit (breaks project independence), 8+ weeks effort
- ❌ **Firebase for everything**: Wrong fit (not all projects need real-time NoSQL)

**Cost Analysis**: Current stack ($20-40/month) vs All-Convex ($60-140/month) = 200-250% more expensive

**Key Insight**: Bundle size is important but **secondary to functionality**. Each platform chosen for its **domain fit** and **core strengths**, not its size.

---

## 🎮 Games & Projects Status

### Games (10 Playable)

**Arcade/Board Games (7)**:

- ✅ **Breakout** - Particles and effects (~900KB, target: ~500KB)
- ✅ **Snake** - 2D canvas + Three.js 3D mode (~1.4MB, target: ~1.1MB)
- ✅ **Bubble Pop** - Simple arcade (~850KB, target: ~450KB)
- ✅ **Memory** - Pure React/DOM (~700KB, target: ~400KB)
- ✅ **Chess** - Pure React/DOM (~800KB, target: ~400KB)
- ✅ **Checkers** - Pure React/DOM (~800KB, target: ~400KB)
- ✅ **Pattern Matching (Knitzy)** - Pure React (~750KB, target: ~400KB)

**Narrative Games (3)**:

- ✅ **Rite of Discovery** - Complete EN/FR (~950KB, target: ~580KB)
- ✅ **Toymaker Escape** - Multi-route puzzle (~920KB, target: ~560KB)
- ✅ **Systems Discovery** - Educational (~940KB, target: ~570KB)

**Bundle Optimization Potential**: 40-60% reduction after @games/shared split

### Projects (2 Production, 2 Planned)

**Production**:

- ✅ **LibraKeeper** - Library management
  - Stack: Next.js 16 + NextAuth + Prisma
  - Status: ✅ Independent, production-ready
  - Auth: NextAuth (local accounts + OAuth)
  - Database: Prisma + PostgreSQL
  - Cost: $0/month (Vercel hobby)
  - **No changes needed** ✅

- ✅ **QuestHunt** - Geocaching social network
  - Stack: Next.js 16 + Supabase
  - Status: ✅ Independent, production-ready
  - Auth: Supabase Auth
  - Database: Supabase (PostGIS for geospatial)
  - Cost: $0/month (Supabase free tier)
  - **Keep Supabase - critical for geospatial** ✅

**In Development**:

- 🔜 **StoryForge** - Writing platform
  - Stack: Next.js (planned: NextAuth + Prisma)
  - Status: Stub, schema defined
  - Database: Schema exists in main Prisma
  - Recommendation: Prisma + NextAuth + Socket.io for real-time

- 🔜 **VelvetGalaxy** - Lifestyle network
  - Stack: TBD
  - Status: Stub only
  - Recommendation: Decide based on requirements (Prisma or Supabase)

---

## 🚧 Technical Priorities

### ⭐ High Priority (Do These)

1. **Split @games/shared Package** (3-4 weeks)
   - [ ] Create packages/ui directory
   - [ ] Extract UI components to @gamehub/ui
   - [ ] Create packages/game-platform
   - [ ] Extract game infrastructure to @gamehub/game-platform
   - [ ] Create packages/pointclick-engine
   - [ ] Extract narrative engine to @games/pointclick-engine
   - [ ] Update all game imports
   - [ ] Test and validate all games
   - **Impact**: 40-60% bundle reduction

2. **Build Unified Admin Dashboard** (4-6 weeks)
   - [ ] Create admin modules in NestJS
   - [ ] Build admin frontend in main app
   - [ ] Implement user management
   - [ ] Implement feature flags system
   - [ ] Connect to Firebase/Supabase
   - [ ] Add analytics dashboard
   - **Impact**: Unified management of all projects/games

3. **Documentation** (1-2 weeks)
   - [ ] Document deployment per project
   - [ ] Create admin user guide
   - [ ] Document feature flag system
   - [ ] Architecture decision records

### ✅ Completed (Don't Redo)

- ✅ Projects are independent (no @games/shared dependency)
- ✅ Database schema consolidated (Prisma)
- ✅ Architecture analysis complete
- ✅ Platform decisions made
- ✅ Monorepo infrastructure working

### ❌ Don't Do (Avoid These)

- ❌ Migrate to Convex (high risk, unclear benefit)
- ❌ Centralize auth forcibly (breaks project independence)
- ❌ Migrate games from Firebase (working perfectly, $0 cost)
- ❌ Change QuestHunt from Supabase (PostGIS critical)
- ❌ Merge project Prisma schemas further (QuestHunt intentionally separate)

---

## 📚 Documentation Status

### ✅ Complete & Accurate

- ✅ **README.md** - Main project overview
- ✅ **SETUP.md** - Getting started guide
- ✅ **ARCHITECTURE_STRATEGY.md** - Package splitting strategy
- ✅ **ARCHITECTURE_OPTIONS_ANALYSIS.md** - Platform analysis ⭐ **UPDATED JAN 14**
- ✅ **GAME_ENGINE_STRATEGY.md** - Game implementation patterns
- ✅ **DATABASE_CONSOLIDATION_STATUS.md** - Schema status
- ✅ **STANDALONE_PROJECTS_MIGRATION.md** - Project independence
- ✅ **DEPLOYMENT.md** - Production deployment

### 🟡 Needs Update

- 🟡 **action-plan-current.md** - Update with new priorities
- 🟡 **PROJECTS_INTEGRATION_PLAN.md** - Reflect reality (projects already independent)

### 🔜 To Create

- 🔜 **ADMIN_DASHBOARD_GUIDE.md** - Admin interface documentation
- 🔜 **DEPLOYMENT_PER_PROJECT.md** - Individual project deploy guides
- 🔜 **FEATURE_FLAGS_GUIDE.md** - Feature flag system usage

---

## 🎯 Sprint Goals

### Week 1-2 (Jan 6-14) - Architecture Validation ✅

- [x] Complete monorepo base structure ✅
- [x] Verify project independence ✅
- [x] Document game engine strategy ✅
- [x] Analyze platform options ✅
- [x] Update ARCHITECTURE_OPTIONS_ANALYSIS.md ✅
- [x] Identify optimization priorities ✅
- [x] Update action plan ✅

### Week 3-4 (Jan 15-28) - @games/shared Split Phase 1

**Goal**: Extract @gamehub/ui package

**1. Create Package Structure**

- [ ] Create `packages/ui` directory
- [ ] Create `packages/ui/package.json` with dependencies:
  - @radix-ui/react-\* components (~15 packages)
  - class-variance-authority
  - clsx, tailwind-merge
  - next-themes
  - react, react-dom
- [ ] Create `packages/ui/tsconfig.json`
- [ ] Create `packages/ui/src/index.ts` (main export)

**2. Move Components** (from packages/shared/src/components/ui/)

- [ ] Move all shadcn/ui components (button, card, dialog, input, etc.)
- [ ] Move theme-provider.tsx
- [ ] Move hooks (use-toast.ts, use-mobile.ts)
- [ ] Move lib/utils.ts (cn function)
- [ ] Update internal imports within @gamehub/ui

**3. Pilot Migration** (2-3 games as test)

- [ ] Update Chess imports to use `@gamehub/ui`
- [ ] Update Checkers imports to use `@gamehub/ui`
- [ ] Update Memory imports to use `@gamehub/ui`
- [ ] Test builds: `pnpm --filter @games/chess build`
- [ ] Measure bundle sizes (before/after)
- [ ] Verify functionality (run games, test UI)

**4. Validation & Documentation**

- [ ] All pilot games build without errors
- [ ] Bundle sizes reduced by 30-40%
- [ ] No visual or functional regressions
- [ ] Document import pattern in ARCHITECTURE_STRATEGY.md
- [ ] Create migration checklist for remaining games

**Success Metrics**:

- ✅ Pilot games build successfully
- ✅ Bundle size reduced by 30-40% (target: ~400KB for board games)
- ✅ No functionality broken
- ✅ Clear migration pattern documented

### Week 5-6 (Jan 29 - Feb 11) - @games/shared Split Phase 2-3

**Goal**: Extract game-platform and pointclick-engine

**Phase 2A: Extract @gamehub/game-platform**

**1. Create Package Structure**

- [ ] Create `packages/game-platform` directory
- [ ] Create `packages/game-platform/package.json` with dependencies:
  - @gamehub/ui (workspace:\*)
  - firebase (~10 packages)
  - @stomp/stompjs
  - sonner, howler (if needed)
  - react, react-dom
- [ ] Create tsconfig.json
- [ ] Create src/index.ts

**2. Move Game Platform Code** (from packages/shared/src/)

- [ ] Move components/ (GameShell, GameHUD, GameContainer, GameCard)
- [ ] Move contexts/ (GameContext, GameSettingsContext, SoundContext)
- [ ] Move lib/ (Firebase integration, sound utilities, progress tracking)
- [ ] Move metadata/ (Game registry)
- [ ] Move services/ (Leaderboards, presence)
- [ ] Update imports to use @gamehub/ui

**3. Update Games Using Platform**

- [ ] Update Breakout to use @gamehub/game-platform
- [ ] Update Snake to use @gamehub/game-platform
- [ ] Update Bubble Pop to use @gamehub/game-platform
- [ ] Test Firebase integration still works
- [ ] Verify leaderboards functional

**Phase 2B: Extract @games/pointclick-engine**

**1. Create Package Structure**

- [ ] Create `packages/pointclick-engine` directory
- [ ] Create package.json with minimal deps (~5 packages)
- [ ] Dependencies: @gamehub/ui, react, react-dom
- [ ] Create tsconfig.json

**2. Move Narrative Engine** (from packages/shared/src/pointclick/)

- [ ] Move core/ (Engine, SceneManager, Persistence)
- [ ] Move puzzles/ (Puzzle systems)
- [ ] Move react/ (DialogueBox, InventoryBar, SceneController)
- [ ] Move i18n/ (Narrative translations)
- [ ] Move types/ (Narrative types)

**3. Update Narrative Games**

- [ ] Update Rite of Discovery to use @games/pointclick-engine
- [ ] Update Toymaker Escape to use @games/pointclick-engine
- [ ] Update Systems Discovery to use @games/pointclick-engine
- [ ] Test save/load functionality
- [ ] Verify puzzles work correctly
- [ ] Test i18n (EN/FR)

**4. Final Cleanup**

- [ ] Remove old code from packages/shared
- [ ] Update remaining games (if any)
- [ ] Full test suite on all 10 games
- [ ] Performance benchmarks (bundle sizes)
- [ ] Document final architecture

### Week 7-10 (Feb 12 - Mar 11) - Unified Admin Dashboard

**Goal**: Build centralized management interface

**Week 7-8: Backend Setup**

**1. NestJS Admin Modules** (apps/api/src/modules/admin/)

- [ ] Create admin.module.ts
- [ ] Create user-management/ module
  - [ ] List all users across projects
  - [ ] View user details (projects accessed, games played)
  - [ ] Grant/revoke project access
  - [ ] Role management (admin, user, moderator)
- [ ] Create project-management/ module
  - [ ] Enable/disable projects
  - [ ] Feature flag toggles per project
  - [ ] Configuration management
- [ ] Create game-management/ module
  - [ ] Enable/disable games
  - [ ] Leaderboard management (reset, moderation)
  - [ ] Game settings configuration
- [ ] Create analytics/ module
  - [ ] Usage statistics per project/game
  - [ ] User activity tracking
  - [ ] Cost monitoring (API calls, storage)

**2. Data Source Connections**

- [ ] Prisma service (LibraKeeper, StoryForge data)
- [ ] Firebase Admin SDK integration (game data)
- [ ] Supabase API client (QuestHunt data via service key)
- [ ] Implement data aggregation logic

**Week 9-10: Frontend & Integration**

**3. Admin Frontend** (apps/app/app/admin/)

- [ ] Create admin layout with sidebar navigation
- [ ] Build dashboard home page (overview stats)
- [ ] Build users/ page
  - [ ] User list with search/filter
  - [ ] User detail view
  - [ ] Access management UI
- [ ] Build projects/ page
  - [ ] Project list with status
  - [ ] Project configuration UI
  - [ ] Feature flags toggles
- [ ] Build games/ page
  - [ ] Game list with status
  - [ ] Game settings UI
  - [ ] Leaderboard moderation tools
- [ ] Build analytics/ page
  - [ ] Charts and graphs (recharts)
  - [ ] Usage reports
  - [ ] Cost breakdown

**4. Authentication & Authorization**

- [ ] Extend NestJS auth with admin role check
- [ ] Protect admin routes (frontend)
- [ ] Protect admin endpoints (backend)
- [ ] Add audit logging for admin actions

**5. Testing & Documentation**

- [ ] Test all admin features
- [ ] Create admin user guide
- [ ] Document API endpoints
- [ ] Security review

---

## 🔄 Development Workflow

### Daily

1. Morning: Review sprint board, pick tasks
2. Development: TDD approach, commit frequently
3. Testing: Run affected tests before commits
4. Documentation: Update inline and README as needed
5. Evening: Update sprint board, create PR if ready

### Weekly

1. **Monday**: Sprint planning, task assignment
2. **Wednesday**: Mid-sprint review, adjust priorities
3. **Friday**: Sprint retrospective, demo completed work

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite locally
4. Create PR with description
5. Wait for CI/CD checks
6. Request review
7. Address feedback
8. Merge after approval

---

## 📞 Contact & Support

### Team Leads

- **Tech Lead**: [Contact info]
- **Product Owner**: [Contact info]
- **DevOps**: [Contact info]

### Communication Channels

- **Slack**: #gamehub-dev
- **Email**: dtadmi@gmail.com
- **GitHub**: Issues and Discussions

---

## 🔗 Quick Links

### Key Documentation

- ⭐ **[Architecture Options Analysis](./ARCHITECTURE_OPTIONS_ANALYSIS.md)** - Platform strategy (UPDATED JAN 14)
- ⭐ **[Architecture Strategy](./ARCHITECTURE_STRATEGY.md)** - Package splitting plan
- ⭐ **[Game Engine Strategy](./GAME_ENGINE_STRATEGY.md)** - Game implementation
- [Database Consolidation](./DATABASE_CONSOLIDATION_STATUS.md) - Schema status
- [Standalone Projects](./STANDALONE_PROJECTS_MIGRATION.md) - Project independence
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

### Archive

- [Completed Tasks Archive](./action-plan-archive.md) - Historical work
- [Action Plan Current](./action-plan-current.md) - Detailed tasks (needs update)

---

## 📝 Summary

### What We Learned

1. ✅ **Projects are already independent** - No shared package dependency
2. ✅ **Hybrid architecture is optimal** - Different tools for different domains
3. ✅ **@games/shared is the bloat problem** - Not platform choice
4. ✅ **Current costs are optimal** - $20-40/month
5. ✅ **Evaluation priorities matter** - Fit for purpose > Performance > Cost > Bundle size
6. ✅ **Each platform chosen for domain fit** - Not bundle size compromise
7. ❌ **Convex migration not recommended** - Wrong fit, high lock-in, expensive migration

### What's Next

1. **Split @games/shared** (3-4 weeks) - 40-60% bundle reduction
2. **Build admin dashboard** (4-6 weeks) - Unified management
3. **Keep current platforms** - Each optimized for its domain

### Key Decisions (Based on Fit → Performance → Cost → Bundle)

- ✅ **LibraKeeper**: Prisma + NextAuth (best fit for CRUD + relational data)
- ✅ **QuestHunt**: Supabase (PostGIS critical for geospatial)
- ✅ **StoryForge**: Prisma + NextAuth (SQL power for writing platform)
- ✅ **Games**: Firebase (perfect fit for leaderboards + real-time)
- ✅ **Admin**: Expand NestJS (full control for unified dashboard)
- ❌ **Do NOT** migrate to Convex (wrong fit, high lock-in)
- ❌ **Do NOT** centralize auth (wrong fit, breaks independence)

---

**Last Updated**: January 14, 2026
**Major Updates**:

- ✅ Architecture validation complete
- ✅ Evaluation criteria updated (Fit → Performance → Cost → Bundle)
- ✅ Platform comparison tables enhanced
- ✅ Search component added to infrastructure
- ✅ All documentation consolidated and accurate

**Next Review**: January 28, 2026 (after @games/shared split Phase 1)
**Current Sprint Focus**: Package splitting for modularity + bundle optimization
**Evaluation Framework**: 1️⃣ Fit for Purpose → 2️⃣ Performance → 3️⃣ Cost → 4️⃣ Bundle Size
