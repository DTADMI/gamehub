# GameHub Architecture Options Analysis

**Last Updated**: January 14, 2026
**Status**: ✅ Current State Verified & Strategic Recommendations

---

## Executive Summary

### Current Reality

After analyzing the actual implementation:

- ✅ **Projects are already independent** (LibraKeeper, QuestHunt, StoryForge)
- ✅ **Each uses appropriate tech stack** for its domain
- ✅ **Database consolidated** (Prisma schema) except QuestHunt (Supabase - intentional)
- ⚠️ **@games/shared is bloated** (87 dependencies, needs splitting)
- ⚠️ **NestJS exists but underutilized** (opportunity for unified admin)

### Key Finding

The **hybrid architecture is optimal**. Different projects need different tools. The main issue is **@games/shared package bloat**, not platform choice.

### Recommended Actions (Priority Order)

1. **Split @games/shared** → 40% bundle reduction (3-4 weeks) ⭐ **DO THIS**
2. **Expand NestJS admin** → Unified management (4-6 weeks) ⭐ **DO THIS**
3. **Keep current stacks** → Each project optimized for its domain ⭐ **DO THIS**
4. **Do NOT migrate to Convex** → High risk, unclear benefit ❌ **AVOID**

---

## Current Architecture (Verified)

### Projects

| Project          | Framework       | Auth              | Database               | Status         | Cost/Month         |
| ---------------- | --------------- | ----------------- | ---------------------- | -------------- | ------------------ |
| **LibraKeeper**  | Next.js 16      | NextAuth + Prisma | Prisma + PostgreSQL    | ✅ Production  | $0 (Vercel hobby)  |
| **QuestHunt**    | Next.js 16      | Supabase Auth     | Supabase (PostGIS)     | ✅ Production  | $0 (Supabase free) |
| **StoryForge**   | Next.js (stub)  | Planned           | Prisma (schema exists) | 🔜 Development | TBD                |
| **VelvetGalaxy** | Not implemented | -                 | -                      | 🔜 Planned     | TBD                |

### Backend Infrastructure

| Component         | Technology             | Usage                           | Status           |
| ----------------- | ---------------------- | ------------------------------- | ---------------- |
| **API Backend**   | NestJS 11 + TypeScript | Minimal (ready to expand)       | ⚠️ Underutilized |
| **Main Database** | Prisma + PostgreSQL    | LibraKeeper, StoryForge schemas | ✅ Consolidated  |
| **Game Database** | Firebase Firestore     | Leaderboards, progress          | ✅ Active        |
| **QuestHunt DB**  | Supabase PostgreSQL    | Geospatial data                 | ✅ Active        |

### Games Infrastructure

| Component            | Implementation               | Dependencies                 | Bundle Impact          |
| -------------------- | ---------------------------- | ---------------------------- | ---------------------- |
| **@games/shared**    | Monolithic package           | 87 packages                  | 800KB-1.4MB            |
| Contains             | UI + Platform + Engines + 3D | Firebase, Three.js, Radix UI | ⚠️ **Needs splitting** |
| **Narrative Engine** | Custom (pointclick/\*)       | React, TypeScript            | ✅ Excellent           |
| **Firebase**         | Leaderboards + Progress      | firebase@12.7.0              | ~200KB                 |
| **Three.js**         | 3D games (Snake)             | three@0.182.0                | ~600KB                 |

---

## Backend Platform Analysis

### Option 1: Convex 🔴 **NOT RECOMMENDED**

**What it is**: Unified BaaS with real-time database, auth, serverless functions

**Pros**:

- ✅ Excellent TypeScript/React integration
- ✅ Built-in real-time (better than Firebase)
- ✅ Automatic API generation
- ✅ Good developer experience

**Cons**:

- ❌ **VERY HIGH vendor lock-in** (proprietary APIs everywhere)
- ❌ **Expensive migration**: 12-20 weeks full-time
- ❌ **Current stack working well** - unclear ROI
- ❌ **Prisma → Convex migration** loses PostgreSQL benefits
- ❌ **Can't self-host**
- ❌ **Costs 2-3x more** than current setup
- ❌ **Team learning curve**

**Cost**: $25/month base + $0.10 per million calls = $60-120/month estimated

**Migration Effort**: 12-20 weeks

**Verdict**: ❌ **DO NOT MIGRATE**

- Risk >> Reward
- Current architecture already optimal
- Would introduce massive lock-in for unclear benefits

---

### Option 2: Supabase (Expand Usage) 🟡 **SITUATIONAL**

**What it is**: Open-source Firebase alternative, PostgreSQL-based

**Current Usage**: QuestHunt only (working excellently)

**Pros**:

- ✅ **Open-source** (can self-host)
- ✅ PostgreSQL (standard SQL)
- ✅ **Already successful** in QuestHunt
- ✅ Lower lock-in than Convex/Firebase
- ✅ Good free tier
- ✅ PostGIS for geospatial

**Cons**:

- ❌ Less polished than Convex
- ❌ Real-time inferior to Convex/Firebase
- ❌ Migration effort still significant

**Cost**:

- Free: $0/month (500MB DB, 50K MAU)
- Pro: $25/month per project
- Estimated: $25-50/month for 1-2 additional projects

**Verdict**: ✅ **KEEP for QuestHunt**, 🟡 **MAYBE for games** (if Firebase bundle size becomes critical)

**Use Cases**:

- ✅ QuestHunt - geospatial features, working perfectly
- 🟡 Potential Firebase replacement for games (only if bundle size critical)
- ❌ LibraKeeper - Prisma + NextAuth already working

---

### Option 3: Firebase 🟢 **KEEP FOR GAMES**

**What it is**: Google's BaaS platform, NoSQL database

**Current Usage**: All games (leaderboards, progress tracking)

**Pros**:

- ✅ **Already implemented and working**
- ✅ Excellent real-time database
- ✅ **Free tier very generous** (current usage: $0/month)
- ✅ Perfect for game leaderboards
- ✅ Mature, proven at scale

**Cons**:

- ❌ Large bundle size (~200-300KB)
- ❌ Vendor lock-in
- ❌ Can get expensive at scale

**Cost**: $0/month (within free tier limits)

**Verdict**: ✅ **KEEP** - Working perfectly for this use case

**Rationale**:

- Leaderboards ideal for Firestore (nested data, real-time)
- Costs negligible
- Replacing would be ~6-8 weeks effort with no benefit

---

### Option 4: NestJS + Prisma (Expand) 🟢 **RECOMMENDED**

**What it is**: Existing backend infrastructure, currently underutilized

**Current Usage**: Minimal (exists but not leveraged)

**Pros**:

- ✅ **Already exists in codebase**
- ✅ **Zero vendor lock-in** (open-source stack)
- ✅ Full control over architecture
- ✅ **Prisma schema already consolidated**
- ✅ Can self-host anywhere
- ✅ Excellent TypeScript support
- ✅ Perfect for unified admin dashboard

**Cons**:

- ❌ More setup than BaaS (but already done!)
- ❌ Need to implement real-time manually (Socket.io)
- ❌ More DevOps (but manageable)

**Cost** (self-hosted):

- Railway/Render: $20-40/month (includes PostgreSQL)
- Total: $20-40/month

**Verdict**: ✅ **EXPAND USAGE** - Build unified admin panel here

**Recommended Use Cases**:

- ✅ Unified admin dashboard (all projects, games, users)
- ✅ Cross-project features (SSO, analytics)
- ✅ Feature flags management
- ✅ User access control

---

## Authentication Strategy

### Current State: Fragmented (Intentional)

| Project     | Auth System              | Status     | Should Change? |
| ----------- | ------------------------ | ---------- | -------------- |
| LibraKeeper | NextAuth + Prisma        | ✅ Working | ❌ No          |
| QuestHunt   | Supabase Auth            | ✅ Working | ❌ No          |
| StoryForge  | TBD (recommend NextAuth) | 🔜 Planned | -              |
| Games       | Firebase Auth (optional) | ✅ Working | ❌ No          |

### Recommendation: Keep Separate ✅

**Rationale**:

- Projects are **intentionally independent**
- Each auth system optimized for its domain
- Centralized auth would:
  - Break QuestHunt's Supabase integration
  - Force unnecessary coupling
  - Take 8+ weeks to implement
  - Provide little user benefit (separate apps = separate auth is normal)

**Exception**: Build optional account linking via NestJS for users who want unified accounts

---

## Project-Specific Analysis

### Detailed Project Comparison

| Project          | Current Stack                  | Recommended Stack                 | Rationale                                          | Pros                                                        | Cons                            | Alternatives                                                      |
| ---------------- | ------------------------------ | --------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| **LibraKeeper**  | Next.js 16 + NextAuth + Prisma | **Keep Current**                  | Perfect CRUD stack for library management          | Type-safe Prisma, NextAuth flexibility, already working     | None significant                | Convex (rejected: migration cost, no benefit)                     |
| **QuestHunt**    | Next.js 16 + Supabase          | **Keep Supabase**                 | PostGIS critical for geospatial features           | Built-in geospatial, real-time, good free tier              | None significant                | Convex (rejected: no PostGIS), Prisma (rejected: loses real-time) |
| **StoryForge**   | Stub (schema in Prisma)        | **Prisma + NextAuth + Socket.io** | Consistent with LibraKeeper, flexible for features | Full SQL power, Socket.io for real-time if needed, flexible | Requires manual real-time setup | Convex (consider only if heavy collaborative editing needed)      |
| **VelvetGalaxy** | Not implemented                | **TBD** (Prisma or Supabase)      | Depends on requirements                            | Decision deferred until requirements clear                  | N/A                             | Follow pattern of LibraKeeper (CRUD) or QuestHunt (social)        |

### LibraKeeper ✅ **KEEP CURRENT STACK**

**Current**: Next.js 16 + NextAuth + Prisma + PostgreSQL

**Assessment**: ✅ Well-architected, no changes needed

**Rationale**:

- Perfect stack for CRUD library management app
- Already independent with local UI components
- Prisma ideal for relational book/loan data
- NextAuth appropriate for username/password + OAuth

**Optimization**: Audit unused Radix UI components

**Alternative Considered**: Convex
**Why Rejected**: High migration cost (4-5 weeks), no benefit for CRUD app

**Cost**: $0/month (Vercel hobby tier)

---

### QuestHunt ✅ **DEFINITELY KEEP SUPABASE**

**Current**: Next.js 16 + Supabase (Auth + PostGIS + Real-time)

**Assessment**: ✅ Excellent choice, MUST keep Supabase

**Rationale**:

- **PostGIS (geospatial) is CRITICAL** for geocaching app
- Supabase provides PostGIS out-of-the-box
- Real-time presence working well
- Low costs on free tier

**Do NOT**:

- ❌ Migrate to Convex (no geospatial support)
- ❌ Migrate to Prisma (loses Supabase real-time + PostGIS)
- ❌ Change anything - it's working perfectly

**Cost**: $0/month (Supabase free tier)

---

### StoryForge 🔜 **USE PRISMA + NEXTAUTH**

**Current**: Stub, schema defined in main Prisma

**Recommendation**: Prisma + NextAuth + Socket.io (if real-time needed)

**Rationale**:

- Consistent with LibraKeeper
- Full SQL power for complex queries
- Socket.io can add real-time without BaaS lock-in
- Flexible for future changes

**Alternative Considered**: Convex
**Why Rejected**: High lock-in, Story Forge may not need heavy real-time

**When to Consider Convex**: Only if Google Docs-style collaborative editing becomes core requirement

---

### VelvetGalaxy 🔜 **DECIDE BASED ON REQUIREMENTS**

**Current**: Not implemented

**Recommendations**:

- If social-heavy: Consider Supabase (like QuestHunt)
- If CRUD-heavy: Use Prisma + NextAuth (like LibraKeeper)
- Wait until requirements clear

---

## Game Infrastructure Analysis

### Game Engine & Implementation Strategy

**See**: [GAME_ENGINE_STRATEGY.md](./GAME_ENGINE_STRATEGY.md) for detailed implementation patterns

### Detailed Game Comparison

| Game                  | Type               | Current Implementation      | Recommended Stack                   | Rationale                       | Pros                             | Cons               | Alternatives            |
| --------------------- | ------------------ | --------------------------- | ----------------------------------- | ------------------------------- | -------------------------------- | ------------------ | ----------------------- |
| **Chess**             | Board              | React + DOM                 | **Keep Current**                    | Simple DOM perfect for board    | Lightweight, accessible, working | None               | PixiJS (overkill)       |
| **Checkers**          | Board              | React + DOM                 | **Keep Current**                    | Same as Chess                   | Simple, working                  | None               | -                       |
| **Memory**            | Card               | React + DOM                 | **Keep Current**                    | Pure React ideal for card flips | Lightweight, CSS animations      | None               | -                       |
| **Breakout**          | Arcade             | React + Canvas              | **Keep Current**, PixiJS for v2     | Working well, some duplication  | Custom, working                  | Canvas duplication | PixiJS (better sprites) |
| **Snake**             | Arcade             | Canvas (2D) + Three.js (3D) | **Keep 2D**, remove or lazy-load 3D | 2D working well                 | Lightweight 2D                   | 3D adds 600KB      | Remove 3D mode          |
| **Bubble Pop**        | Arcade             | React + Canvas              | Consider **PixiJS** for v2          | Could benefit from sprites      | Working                          | Manual physics     | PixiJS (particles)      |
| **Knitzy**            | Puzzle             | React + DOM                 | **Keep Current**                    | DOM perfect for patterns        | Simple, lightweight              | None               | -                       |
| **Rite of Discovery** | Narrative          | Custom pointclick           | **Keep** (extract to package)       | Excellent engine                | Mature, i18n, saves              | None               | -                       |
| **Toymaker Escape**   | Narrative          | Custom pointclick           | **Keep** (extract to package)       | Same engine as RoD              | Multi-route, puzzles             | None               | -                       |
| **Systems Discovery** | Narrative          | Custom pointclick           | **Keep** (extract to package)       | Same engine                     | Working well                     | None               | -                       |
| **Platformer**        | Platform (planned) | Not implemented             | **Phaser 3**                        | Best for platformers            | Physics, tilemap, animations     | ~400KB bundle      | PixiJS + custom         |
| **Tower Defense**     | Strategy (planned) | Not implemented             | **Phaser 3**                        | Built-in pathfinding            | TD patterns                      | ~400KB bundle      | Custom Canvas           |
| **Tetris**            | Puzzle (planned)   | Not implemented             | **PixiJS** or Canvas                | Good for grid games             | Sprite handling or lightweight   | -                  | Either works            |
| **Quantum Architect** | 3D (planned)       | Not implemented             | **Three.js + R3F**                  | 3D required                     | WebGL, ecosystem                 | ~600KB             | Babylon.js              |
| **Elemental Conflux** | 3D (planned)       | Not implemented             | **Three.js + R3F**                  | 3D required                     | Same as QA                       | ~600KB             | Babylon.js              |
| **Chrono Shift**      | 3D (planned)       | Not implemented             | **Three.js + R3F**                  | 3D required                     | Same as QA                       | ~600KB             | Babylon.js              |

### Game Engine Recommendations

| Engine                | Best For                    | Bundle Size | Pros                              | Cons                        | Use When                |
| --------------------- | --------------------------- | ----------- | --------------------------------- | --------------------------- | ----------------------- |
| **React + DOM**       | Board, card, simple puzzles | ~50-100KB   | Lightweight, accessible           | Not for complex animations  | Static/simple games     |
| **React + Canvas**    | Simple arcade               | ~100-200KB  | Full control, lightweight         | Manual sprites, duplication | Custom requirements     |
| **PixiJS**            | 2D arcade, sprites          | ~200-300KB  | Sprite handling, WebGL, particles | Learning curve, larger      | Arcade with sprites     |
| **Phaser 3**          | Platformers, tower defense  | ~400KB      | Full framework, physics, tilemap  | Larger bundle               | Complex 2D with physics |
| **Three.js + R3F**    | 3D games                    | ~600KB      | Industry standard 3D              | Heavy bundle, steep curve   | Any 3D requirement      |
| **Custom Pointclick** | Narrative/adventure         | ~50KB       | Optimized, i18n, saves, excellent | Genre-specific              | Narrative games         |

### Current Game Backend: Firebase

**Used For**:

- Leaderboards (Firestore)
- Progress tracking (Firestore)
- User authentication (Firebase Auth - optional)
- Real-time presence (limited use)

**Bundle Impact**: ~200-300KB gzipped per game using Firebase

**Costs**: $0/month (well within free tier)

### Problem: @games/shared Package Bloat ⚠️

**Current**: Monolithic package with 87 dependencies

**Contains**:

- 30x Radix UI packages
- Firebase (10 packages)
- Three.js + @react-three/fiber (3 packages, 600KB)
- Game platform code
- Narrative engine
- Utilities, types, contexts

**Impact**: Every game bundles everything, even if using 10%

**Bundle Sizes**:

- Simple game (Chess): ~800KB (should be ~300KB)
- Arcade game (Breakout): ~900KB (should be ~500KB)
- 3D game (Snake): ~1400KB (should be ~1100KB)

### Solution: Split into Focused Packages ⭐

**See**: ARCHITECTURE_STRATEGY.md for detailed plan

**New Structure**:

1. `@gamehub/ui` - UI components only (~15 deps, 50KB)
2. `@gamehub/game-platform` - Platform + Firebase (~30 deps, 200KB)
3. `@games/pointclick-engine` - Narrative engine (~5 deps, 30KB)

**Expected Savings**: 40-60% bundle reduction per game (200-400KB savings)

**Effort**: 3-4 weeks

**Priority**: ⭐ **HIGHEST** - Biggest impact for least effort

---

### Firebase for Games: Keep or Replace?

**Current**: Firebase Firestore for leaderboards + progress

**Alternatives Considered**:

1. **Supabase** - Smaller bundle (~100KB vs ~200KB)
2. **Convex** - Better real-time, more expensive

**Verdict**: ✅ **KEEP FIREBASE**

**Rationale**:

- Working perfectly
- Costs: $0/month (free tier)
- Firestore ideal for leaderboards (nested data, real-time updates)
- Migration: 6-8 weeks effort with no benefit
- Bundle size not critical after @games/shared split

**When to Reconsider**: If Firebase costs exceed $20/month or bundle size becomes critical issue

---

## Bundle Size & Cost Optimization

### Current vs Optimized Bundle Sizes

| Game Type         | Current | After Split | Savings |
| ----------------- | ------- | ----------- | ------- |
| Board (Chess)     | 800KB   | 400KB       | 50% ⬇️  |
| Arcade (Breakout) | 900KB   | 500KB       | 44% ⬇️  |
| Narrative (RoD)   | 950KB   | 580KB       | 39% ⬇️  |
| 3D (Snake)        | 1400KB  | 1100KB      | 21% ⬇️  |

**Primary Optimization**: Split @games/shared package

**Effort**: 3-4 weeks

**Impact**: 200-400KB savings per game

---

### Hosting Cost Comparison

#### Current Stack (Optimal) ✅

| Service         | Provider           | Monthly Cost     |
| --------------- | ------------------ | ---------------- |
| Frontend (main) | Vercel             | $0-20            |
| Projects (3x)   | Vercel             | $0 (hobby)       |
| NestJS API      | Railway            | $20              |
| PostgreSQL      | Railway (included) | $0               |
| Firebase        | Firebase           | $0 (free tier)   |
| Supabase        | Supabase           | $0 (free tier)   |
| **TOTAL**       |                    | **$20-40/month** |

#### All-Convex Stack ❌

| Service              | Provider | Monthly Cost      |
| -------------------- | -------- | ----------------- |
| Frontend             | Vercel   | $0-20             |
| Convex (all backend) | Convex   | $60-120           |
| **TOTAL**            |          | **$60-140/month** |

**Cost Increase**: 200-250% MORE expensive

#### Expanded Supabase Stack 🟡

| Service               | Provider | Monthly Cost     |
| --------------------- | -------- | ---------------- |
| Frontend              | Vercel   | $0-20            |
| Supabase (2 projects) | Supabase | $25-50           |
| **TOTAL**             |          | **$25-70/month** |

**Cost Increase**: 25-75% more expensive

### Recommendation: Keep Current Stack ✅

Most cost-effective, already optimized

---

## Platform Comparison Matrix

**Evaluation Priority**: 1️⃣ Fit for Purpose → 2️⃣ Performance → 3️⃣ Cost → 4️⃣ Bundle Size
_Security and Modularity are foundational requirements across all options_

### Detailed Feature Comparison

| Feature                | Convex                                               | Supabase                                                 | Firebase                                           | NestJS + Prisma                                       |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **Database**           | Reactive document store (ACID)                       | PostgreSQL (relational, SQL)                             | Firestore (NoSQL document) / Realtime DB (JSON)    | Any DB via Prisma ORM (typically Postgres/MySQL)      |
| **Real-time**          | ⭐⭐⭐⭐⭐ Built-in, automatic WebSocket sync        | ⭐⭐⭐⭐ Powerful (logical replication, Realtime server) | ⭐⭐⭐⭐⭐ Excellent, battle-tested, offline sync  | ⭐⭐ Manual (Socket.io, polling, custom)              |
| **TypeScript Support** | ⭐⭐⭐⭐⭐ End-to-end type safety (backend/frontend) | ⭐⭐⭐⭐ Strong (auto-generated types, Edge Functions)   | ⭐⭐⭐ Good (SDKs)                                 | ⭐⭐⭐⭐⭐ Full control, native TypeScript/Node.js    |
| **Authentication**     | Built-in integrations (e.g., Clerk)                  | ⭐⭐⭐⭐⭐ Full-featured Auth service with RLS           | ⭐⭐⭐⭐⭐ Advanced (OAuth, SSO, anonymous, phone) | Manual setup required (Passport.js, NextAuth, custom) |
| **Security**           | TypeScript-based access control (functions)          | ⭐⭐⭐⭐⭐ Row Level Security (RLS) policies in SQL      | Service-specific declarative security rules        | ⭐⭐⭐⭐⭐ Full control & full responsibility         |
| **Performance**        | ⭐⭐⭐⭐ Optimized for real-time collaborative apps  | ⭐⭐⭐⭐⭐ PostgreSQL performance, complex queries       | ⭐⭐⭐⭐ Good at scale, Google infrastructure      | ⭐⭐⭐⭐⭐ Fully customizable, fine-tune everything   |
| **Flexibility**        | ⭐⭐ Opinionated, streamlined DX                     | ⭐⭐⭐⭐ Flexible (Postgres), open-source, less lock-in  | ⭐⭐⭐ Opinionated, Google ecosystem integration   | ⭐⭐⭐⭐⭐ Maximum control over entire stack          |
| **Vendor Lock-in**     | ⭐ Very High (proprietary)                           | ⭐⭐⭐⭐ Low (open-source, self-hostable)                | ⭐⭐ High (Google Cloud ecosystem)                 | ⭐⭐⭐⭐⭐ None (open-source stack)                   |
| **Hosting**            | ☁️ Cloud-only (fully managed)                        | ☁️ Cloud (managed) or 🏠 Self-hosted                     | ☁️ Cloud-only (Google Cloud)                       | 🏠 Self-hosted (any server/cloud provider)            |
| **Costs**              | Pay-as-you-go, predictable                           | Predictable pricing, open-source allows cost control     | ⚠️ Can be expensive at scale (pay-per-read/write)  | Highly variable, depends on infrastructure choices    |
| **Free Tier**          | ⭐⭐⭐ Good                                          | ⭐⭐⭐⭐ Very Good                                       | ⭐⭐⭐⭐⭐ Excellent (generous limits)             | N/A (self-hosted, control your costs)                 |
| **Bundle Size**        | ~50KB                                                | ~100KB                                                   | ~200KB                                             | Minimal (server-side only)                            |
| **Learning Curve**     | ⭐⭐ High (new patterns)                             | ⭐⭐⭐ Medium (familiar SQL)                             | ⭐⭐⭐ Medium (NoSQL concepts)                     | ⭐⭐⭐⭐ Low (standard Node.js stack)                 |
| **Migration Effort**   | ⭐ Very High (12-20 weeks)                           | ⭐⭐⭐ Medium (6-8 weeks)                                | ✅ Current (N/A)                                   | ⭐⭐⭐ Medium (expand existing)                       |

### Best Use Cases by Platform

| Platform            | Ideal For                                                                                             | Why Choose This                                                                                          | Key Strength                            |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Convex**          | Real-time collaborative apps (messaging, multiplayer tools, shared documents, live cursors)           | Built-in automatic sync, strong consistency guarantees, optimistic updates simplified, presence tracking | Real-time is core design, not an add-on |
| **Supabase**        | SaaS applications, data-heavy apps, complex business logic, geospatial features                       | PostgreSQL power & flexibility, complex queries, data integrity, RLS security, predictable scaling       | Full SQL power with modern DX           |
| **Firebase**        | Mobile-first apps, rapid prototyping, offline-required applications, simple real-time needs           | Excellent mobile SDKs, robust offline sync, battle-tested at massive scale, Google Cloud integration     | Proven mobile-first platform            |
| **NestJS + Prisma** | Total control needed, specific performance needs, compliance/security requirements, experienced teams | Maximum flexibility, no vendor lock-in, full ownership, customizable performance, any infrastructure     | Complete architectural freedom          |

### GameHub-Specific Assessment

| Platform            | Recommendation for GameHub       | Rationale                                                                                                                                           | Current Usage                               |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Convex**          | ❌ **Not Recommended**           | Overkill for current needs, very high lock-in, unclear benefits for diverse project types, expensive migration (12-20w), current stack working well | None                                        |
| **Supabase**        | ✅ **Excellent for QuestHunt**   | PostGIS for geospatial features (critical), RLS for security, real-time for social features, perfect fit for requirements                           | QuestHunt (production)                      |
| **Firebase**        | ✅ **Ideal for Games**           | Perfect for leaderboards, progress tracking, real-time updates, generous free tier, battle-tested, working perfectly                                | All 10 games (production)                   |
| **NestJS + Prisma** | ✅ **Expand for Admin & Shared** | Already exists (underutilized), perfect for unified admin dashboard, cross-project features, no vendor lock-in, full control                        | LibraKeeper (Prisma), API backend (minimal) |

---

## Core Application Infrastructure

### Infrastructure Component Comparison

| Component           | Recommendation                                    | Rationale                                 | Pros                                     | Cons                       | Alternatives                                   |
| ------------------- | ------------------------------------------------- | ----------------------------------------- | ---------------------------------------- | -------------------------- | ---------------------------------------------- |
| **API Layer**       | **Expand NestJS**                                 | Unified backend for admin & cross-project | Full control, TypeScript-first, flexible | Requires manual setup      | Convex (rejected: lock-in), tRPC               |
| **Main Database**   | **Prisma + PostgreSQL**                           | Best balance for LibraKeeper, StoryForge  | ACID, type-safe, migrations, JSONB       | More setup than BaaS       | Supabase (using for QuestHunt), Convex         |
| **Auth**            | **Per-project** (NextAuth, Supabase, Firebase)    | Each optimized for domain                 | Maximum flexibility, no coupling         | No single sign-on          | Centralized (rejected: breaks independence)    |
| **Game Database**   | **Firebase Firestore**                            | Ideal for leaderboards, real-time         | Free tier generous, real-time, working   | Large bundle (~200KB)      | Supabase (smaller bundle, migration effort)    |
| **File Storage**    | **Per-project** (Prisma, Supabase, Firebase)      | No centralized need currently             | Project-specific optimization            | -                          | Convex Storage, S3, Cloudinary                 |
| **Real-time**       | **Per-need** (Firebase, Supabase, Socket.io)      | Different requirements per project        | Optimized per use case                   | No unified system          | Convex (rejected), Ably, Pusher                |
| **Email**           | **Resend** (LibraKeeper)                          | Developer-friendly, good deliverability   | Simple API, good docs                    | -                          | SendGrid, Postmark, Nodemailer                 |
| **Search**          | **Per-project** (Postgres FTS, Supabase, Algolia) | Different needs per project               | Optimized for each use case              | No unified search          | Meilisearch, Typesense, Algolia, ElasticSearch |
| **Caching**         | **TBD** (if needed)                               | Not critical currently                    | -                                        | Additional cost/complexity | Upstash Redis, Vercel KV, in-memory            |
| **Background Jobs** | **TBD** (if needed)                               | Not critical currently                    | -                                        | Additional service         | BullMQ, Inngest, Convex Schedulers             |
| **Analytics**       | **TBD** (basic GA)                                | Basic tracking sufficient                 | -                                        | -                          | Plausible, PostHog, Vercel Analytics           |
| **Monitoring**      | **TBD** (plan Sentry)                             | Error tracking needed                     | -                                        | Additional cost            | Sentry, LogRocket, Datadog                     |

### Key Infrastructure Decisions

**Decentralized by Design** ✅

- Each project uses tools optimal for its requirements
- No forced unification where it doesn't make sense
- Hybrid approach reduces risk and maintains flexibility

**Centralized Where Beneficial** ✅

- Admin dashboard (NestJS) for unified management
- Shared UI components (@gamehub/ui) for consistency
- Feature flags in main database
- Documentation and deployment procedures

---

## Strategic Recommendations

### Priority 1: Split @games/shared ⭐⭐⭐

**Action**: Decompose into 3 focused packages

**Timeline**: 3-4 weeks

**Impact**:

- ✅ 40-60% bundle size reduction
- ✅ Clearer dependencies
- ✅ Better tree-shaking
- ✅ Easier maintenance

**Status**: Documented in ARCHITECTURE_STRATEGY.md, ready to implement

---

### Priority 2: Build Unified Admin Dashboard ⭐⭐

**Action**: Expand NestJS backend with admin features

**Timeline**: 4-6 weeks

**Features**:

- User management across all projects
- Feature flags per project/game
- Analytics dashboard
- Access control management
- Content management

**Benefits**:

- ✅ Single interface for all admin tasks
- ✅ Leverages existing NestJS + Prisma
- ✅ Can connect to Firebase/Supabase as data sources
- ✅ No migration required

---

### Priority 3: Document Current Architecture ⭐

**Action**: Create comprehensive documentation

**Timeline**: 1-2 weeks

**Include**:

- How to add new projects
- Feature flag system
- Deployment procedures per project
- Monitoring and alerts
- Admin dashboard usage

---

### What NOT to Do ❌

#### ❌ DO NOT Migrate to Convex

**Reasons**:

- High risk (12-20 weeks, complex migration)
- Unclear ROI (current stack working well)
- Massive vendor lock-in
- Cost increase of 200-250%
- Team learning curve

#### ❌ DO NOT Centralize Auth Forcibly

**Reasons**:

- Doesn't fit independent project architecture
- Would break QuestHunt's Supabase integration
- Major refactoring (8+ weeks) with little user benefit
- Separate apps = separate auth is normal

#### ❌ DO NOT Migrate Games from Firebase

**Reasons**:

- Working perfectly
- Costs negligible ($0/month)
- Migration effort (6-8 weeks) not justified
- Firestore ideal for game leaderboards

#### ❌ DO NOT Migrate QuestHunt from Supabase

**Reasons**:

- PostGIS/geospatial features critical
- Supabase excellent fit
- No better alternative exists
- Would be architectural regression

---

## Unified Admin Dashboard Strategy

### Goal

Single admin interface to manage all projects, games, users, and features

### Architecture

**Frontend**: Next.js admin section in main app (`apps/app/app/admin`)

**Backend**: NestJS modules (`apps/api/src/modules/admin`)

**Data Access**:

- Prisma for LibraKeeper, StoryForge
- Firebase Admin SDK for games
- Supabase API for QuestHunt (service key)

**Features**:

1. **User Management**
   - View users across all projects
   - Grant/revoke access
   - Role management

2. **Project Management**
   - Enable/disable projects
   - Feature flags per project
   - Usage analytics

3. **Game Management**
   - Enable/disable games
   - Leaderboard moderation
   - Game settings

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance metrics
   - Cost monitoring
   - User activity

**Benefit**: Uses existing infrastructure, no migration needed ✅

---

## Conclusion

### The Hybrid Architecture is Optimal ✅

After comprehensive analysis:

**Why Each Platform Was Chosen** (Priority: Fit → Performance → Cost → Bundle):

1. ✅ **LibraKeeper**: NextAuth + Prisma
   - **Fit**: CRUD operations, relational data (books, loans, users)
   - **Performance**: Prisma optimized queries, PostgreSQL reliability
   - **Cost**: $0/month (Vercel hobby tier)
   - **Bundle**: Server-side, minimal client impact
   - **Security**: Full control, NextAuth flexibility

2. ✅ **QuestHunt**: Supabase
   - **Fit**: Geospatial features (PostGIS critical), social networking, real-time
   - **Performance**: PostgreSQL performance, RLS security at DB level
   - **Cost**: $0/month (free tier), predictable scaling
   - **Bundle**: ~100KB (acceptable for functionality)
   - **Security**: Row Level Security (RLS) policies in SQL

3. ✅ **StoryForge**: Prisma + NextAuth
   - **Fit**: Writing platform, relational content, optional real-time (Socket.io)
   - **Performance**: Full SQL power for complex queries
   - **Cost**: Low (shared Prisma DB), add Socket.io only if needed
   - **Bundle**: Server-side, minimal client impact
   - **Security**: Full control over access patterns

4. ✅ **Games**: Firebase Firestore
   - **Fit**: Leaderboards (nested data), progress tracking, real-time updates
   - **Performance**: Battle-tested at scale, Google infrastructure
   - **Cost**: $0/month (generous free tier, current usage minimal)
   - **Bundle**: ~200KB (acceptable for game functionality)
   - **Security**: Declarative rules, proven secure at scale

5. ✅ **Admin**: Expand NestJS + Prisma
   - **Fit**: Unified management dashboard, cross-project features
   - **Performance**: Full control, optimize as needed
   - **Cost**: Minimal (same infrastructure as LibraKeeper)
   - **Bundle**: Server-side only (admin panel)
   - **Security**: Complete control, custom auth logic

**Key Insight**: Bundle size is important but **secondary to functionality**. Each platform chosen for its **core strengths**, not its size. The hybrid approach optimizes for each project's specific needs.

### Action Plan

1. **Split @games/shared** → Better modularity, 40% bundle reduction (3-4 weeks) ⭐
2. **Build NestJS admin** → Unified management, leverage existing (4-6 weeks) ⭐
3. **Document architecture** → Clarify decisions, deployment guides (1-2 weeks) ⭐
4. **Keep everything else as-is** → Already optimal for each domain ✅

### Final Verdict

**DO**:

- ✅ Split @games/shared package (modularity + bundle optimization)
- ✅ Expand NestJS for admin (leverage existing infrastructure)
- ✅ Keep current project architectures (each optimized for its domain)

**DON'T**:

- ❌ Migrate to Convex (wrong fit, high lock-in, expensive migration)
- ❌ Centralize auth forcibly (breaks project independence, wrong fit)
- ❌ Change Firebase/Supabase (perfect fit for their domains)

---

**Document Accuracy**: ✅ Verified against actual codebase
**Evaluation Priority**: 1️⃣ Fit for Purpose → 2️⃣ Performance → 3️⃣ Cost → 4️⃣ Bundle Size
**Last Updated**: January 14, 2026 (Updated evaluation criteria to prioritize fit and performance over bundle size)
**Next Review**: After @games/shared package split
