# Projects Integration Plan

**Status**: Planning Phase
**Last Updated**: January 6, 2026

---

## Overview

This document outlines the strategy for integrating standalone project applications (LibraKeeper, QuestHunt, StoryForge) into the main GameHub monorepo while maintaining their functionality and adding centralized access control.

---

## Current State Analysis

### LibraKeeper

- **Type**: Standalone Next.js 16 application
- **Database**: Prisma + PostgreSQL
- **Auth**: NextAuth.js
- **i18n**: next-intl (EN/FR)
- **Features**: Library management, barcode scanning, lending tracker
- **Location**: `packages/projects/libra-keeper/`
- **Structure**: Standard Next.js app with src/ directory

**Dependencies to Mutualize**:

- Radix UI components (already in shared)
- Tailwind CSS configuration
- Authentication utilities
- Database schema (merge into main API)
- i18n configuration

### QuestHunt

- **Type**: Mini-monorepo (apps/web + packages)
- **Database**: Supabase
- **Framework**: Next.js 16
- **Features**: Geocaching, location-based quests, maps
- **Location**: `packages/projects/quest-hunt/`
- **Structure**: Turborepo with apps/web

**Dependencies to Mutualize**:

- UI components (Radix UI, shadcn/ui)
- Supabase utilities
- Map components (could be shared)
- Tailwind configuration

### StoryForge

- **Type**: Mini-project with web subdirectory
- **Database**: Prisma + PostgreSQL
- **Framework**: Next.js (older version)
- **Features**: Narrative creation, collaboration tools
- **Location**: `packages/projects/story-forge/`
- **Structure**: web/ subdirectory with app

**Dependencies to Mutualize**:

- Prisma schema (merge into main API)
- Rich text editor components
- UI components
- Auth utilities

---

## Integration Strategy

### Phase 1: Metadata & Discovery (✅ Complete)

- [x] Create `packages/shared/src/projects/manifest.ts`
- [x] Define ProjectMetadata interface
- [x] Add metadata for all three projects
- [x] Create access control types (AccessTier)
- [x] Export from shared package

### Phase 2: Database Consolidation (Current)

#### Goals

1. Merge all project schemas into `apps/api/prisma/schema.prisma`
2. Create single source of truth for data
3. Maintain data integrity during migration
4. Remove individual project databases

#### Tasks

**LibraKeeper Schema Migration**

- [ ] Analyze libra-keeper Prisma schema
- [ ] Identify overlapping models (User, Account, etc.)
- [ ] Merge unique models into main schema
- [ ] Add `projectId` discriminator where needed
- [ ] Create migration script
- [ ] Test data migration locally

**StoryForge Schema Migration**

- [ ] Analyze story-forge Prisma schema
- [ ] Merge narrative-specific models
- [ ] Handle version control tables
- [ ] Create migration strategy
- [ ] Test with sample data

**QuestHunt Schema Migration** (More Complex)

- [ ] Evaluate Supabase → Prisma migration
- [ ] Document breaking changes
- [ ] Consider keeping Supabase or migrating
- [ ] Create adapter layer if keeping Supabase
- [ ] Migration testing

### Phase 3: Package Standardization

#### Shared Dependencies to Extract

**UI Components**

```
packages/ui/
├── components/
│   ├── project-card/      # Reusable project cards
│   ├── access-badge/      # Premium/Free badges
│   ├── subscription-cta/  # Upgrade prompts
│   └── ...existing shadcn/ui components
```

**Utilities**

```
packages/shared/src/
├── projects/
│   ├── manifest.ts        ✅ Done
│   ├── access-control.ts  🔜 Next
│   └── types.ts           🔜 Next
├── auth/
│   ├── utils.ts           # Shared auth helpers
│   └── providers.ts       # OAuth configs
└── i18n/
    ├── config.ts          # Centralized i18n
    └── translations/      # Shared strings
```

#### Package.json Standardization

**Target Structure for Each Project**:

```json
{
  "name": "@projects/[name]",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port [specific-port]",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "clean": "rimraf .next out coverage"
  },
  "dependencies": {
    "@games/shared": "workspace:*",
    "@games/ui": "workspace:*",
    "next": "15.1.6",
    "react": "19.0.0",
    ...project-specific deps only
  }
}
```

### Phase 4: UI Integration

#### Project Cards

**Create in**: `apps/app/components/projects/ProjectCard.tsx`

```typescript
interface ProjectCardProps {
  project: ProjectMetadata;
  userAccess?: {
    hasAccess: boolean;
    isPremium: boolean;
  };
}

// Features:
- Display project info
- Show access tier badge
- Lock icon for premium
- CTA based on access level
- Consistent with game cards
```

#### Project Routes

**Structure**:

```
apps/app/app/projects/
├── page.tsx                 # Projects listing page
├── [slug]/
│   ├── page.tsx            # Project detail/launch page
│   └── loading.tsx         # Loading state
└── components/
    ├── ProjectCard.tsx
    ├── ProjectFilters.tsx
    └── AccessGate.tsx
```

#### Design System Application

**Consistency Requirements**:

- Use global CSS variables (`--app-bg`, colors)
- Apply shared header/footer from main app
- Use shadcn/ui components exclusively
- Follow mobile-first responsive patterns
- Maintain WCAG 2.1 AA accessibility
- Support i18n (EN/FR minimum)

### Phase 5: Access Control Implementation

#### Backend API Additions

**New Prisma Models**:

```prisma
model UserProjectAccess {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  tier      AccessTier
  grantedAt DateTime @default(now())
  expiresAt DateTime?

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

model ProjectPurchase {
  id              String   @id @default(cuid())
  userId          String
  projectId       String
  purchaseType    PurchaseType // single, subscription, bundle
  amount          Decimal
  currency        String
  stripeSessionId String?
  status          PurchaseStatus
  purchasedAt     DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([projectId])
  @@index([stripeSessionId])
}

enum AccessTier {
  FREE
  FREEMIUM
  PREMIUM
  ENTERPRISE
}

enum PurchaseType {
  SINGLE
  MONTHLY
  YEARLY
  BUNDLE
  LIFETIME
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

**API Endpoints** (`apps/api/src/`):

```
modules/
├── access-control/
│   ├── access-control.module.ts
│   ├── access-control.service.ts
│   ├── access-control.controller.ts
│   └── dto/
│       ├── check-access.dto.ts
│       └── grant-access.dto.ts
├── projects/
│   ├── projects.module.ts
│   ├── projects.service.ts
│   ├── projects.controller.ts
│   └── dto/
│       └── project-query.dto.ts
└── purchases/
    ├── purchases.module.ts
    ├── purchases.service.ts
    ├── purchases.controller.ts
    ├── stripe.service.ts
    └── dto/
        ├── create-purchase.dto.ts
        └── webhook-event.dto.ts
```

**Key Endpoints**:

- `GET /api/projects` - List all accessible projects
- `GET /api/projects/:slug` - Get project details
- `GET /api/access/:projectId/check` - Check user access
- `POST /api/purchases/checkout` - Initiate purchase
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/admin/projects` - Admin project management

#### Frontend Context

**Create**: `apps/app/contexts/AccessControlContext.tsx`

```typescript
interface AccessControlContextValue {
  userAccess: Map<string, boolean>;
  checkAccess: (projectId: string) => boolean;
  refreshAccess: () => Promise<void>;
  isLoading: boolean;
}

// Features:
- Cache user access per project
- Provide easy access checks
- Handle loading states
- Refresh on auth changes
```

### Phase 6: Admin Controls

#### Admin Dashboard Enhancements

**New Admin Sections**:

```
apps/app/app/admin/
├── projects/
│   ├── page.tsx              # Projects management
│   ├── [id]/edit/page.tsx    # Edit project metadata
│   └── access/page.tsx       # Access management
├── users/
│   └── [id]/access/page.tsx  # User access grants
└── analytics/
    └── projects/page.tsx     # Project analytics
```

**Admin Features**:

- Enable/disable projects
- Toggle featured status
- Change access tiers
- Grant/revoke user access
- View usage analytics
- Manage pricing
- Review purchase history

### Phase 7: Payment Integration

#### Stripe Setup

**Implementation**:

- [ ] Create Stripe products for each project/tier
- [ ] Set up webhooks for subscription events
- [ ] Implement checkout flow
- [ ] Handle subscription management
- [ ] Add invoice generation
- [ ] Implement refund handling

**Pricing Tiers** (Example):

```typescript
const projectPricing = {
  'libra-keeper': {
    free: { price: 0, features: ['basic', 'up-to-100-books'] },
    premium: { price: 4.99, features: ['unlimited', 'lending', 'analytics'] }
  },
  'quest-hunt': {
    free: { price: 0, features: ['join-quests', 'limited-creates'] },
    premium: { price: 6.99, features: ['unlimited-creates', 'advanced-maps'] }
  },
  'story-forge': {
    premium: { price: 9.99, features: ['all-features'] }
  }
};
```

---

## Migration Checklist

### Pre-Migration

- [ ] Backup all project databases
- [ ] Document current state of each project
- [ ] Create test accounts in each project
- [ ] Export sample data for testing
- [ ] Set up staging environment

### Migration Steps

1. **Database**
   - [ ] Create unified schema
   - [ ] Run migrations
   - [ ] Migrate data (with scripts)
   - [ ] Verify data integrity
   - [ ] Update connection strings

2. **Code**
   - [ ] Move projects to standardized structure
   - [ ] Update imports to use workspace packages
   - [ ] Remove duplicate dependencies
   - [ ] Update configurations
   - [ ] Run linting and type checks

3. **Testing**
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] E2E tests for each project
   - [ ] Access control tests
   - [ ] Payment flow tests

4. **Documentation**
   - [ ] Update README
   - [ ] Create integration guide
   - [ ] Document API endpoints
   - [ ] Update user guides

### Post-Migration

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features work
- [ ] Gather user feedback
- [ ] Iterate on issues

---

## Timeline

### Week 1 (Jan 6-12) - ✅ Current

- [x] Create projects metadata system
- [x] Update action plan
- [ ] Analyze and document schemas
- [ ] Design unified schema
- [ ] Create database migration scripts

### Week 2 (Jan 13-19)

- [ ] Execute database migrations
- [ ] Standardize package.json files
- [ ] Create project cards component
- [ ] Build project routes

### Week 3 (Jan 20-26)

- [ ] Implement access control backend
- [ ] Create access control frontend
- [ ] Integrate first project (LibraKeeper)
- [ ] Admin project management UI

### Week 4 (Jan 27 - Feb 2)

- [ ] Integrate remaining projects
- [ ] Implement payment flow
- [ ] Comprehensive testing
- [ ] Documentation update

### Week 5 (Feb 3-9)

- [ ] Staging deployment
- [ ] User acceptance testing
- [ ] Bug fixes and polish
- [ ] Prepare for production

---

## Success Criteria

- [ ] All three projects accessible from main app
- [ ] Consistent UI/UX across platform
- [ ] Working access control (can restrict access)
- [ ] Admin can manage all aspects
- [ ] No duplicate code or dependencies
- [ ] Single database for all data
- [ ] All tests passing (>85% coverage)
- [ ] Performance maintained or improved
- [ ] Documentation complete
- [ ] Deployed to production

---

## Risks & Mitigation

### Risk 1: Data Loss During Migration

**Mitigation**:

- Complete backups before migration
- Test migrations on copies first
- Have rollback scripts ready
- Verify data integrity at each step

### Risk 2: Breaking Changes for Existing Users

**Mitigation**:

- Maintain backward compatibility where possible
- Communicate changes clearly
- Gradual rollout with feature flags
- Monitor and respond quickly to issues

### Risk 3: Access Control Bugs

**Mitigation**:

- Comprehensive testing
- Default to deny (fail secure)
- Audit logs for all access decisions
- Admin override capabilities

### Risk 4: Payment Integration Issues

**Mitigation**:

- Use Stripe test mode extensively
- Handle all webhook events
- Implement retry logic
- Clear error messages
- Support team trained on refunds

---

## Resources

- [Main Action Plan](./action-plan.md)
- [Current Sprint Tasks](./action-plan-current.md)
- [Setup Guide](../SETUP.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Projects Manifest](../packages/shared/src/projects/manifest.ts)

---

**Document Owner**: Tech Lead
**Last Review**: January 6, 2026
**Next Review**: January 13, 2026
