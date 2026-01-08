# Database Consolidation Status

**Last Updated**: January 6, 2026
**Status**: ✅ Already Consolidated!

---

## Overview

The database schema consolidation has already been completed! The main Prisma schema at `apps/api/prisma/schema.prisma` contains all models from the three projects.

---

## Current Schema Structure

### ✅ Core GameHub Models

**User Model** (Unified)

- Base fields: id, email, username, name, avatar, image
- Auth fields: password, passwordHash, emailVerified
- Project access: `allowedProjects`, `isAdmin`
- Subscription: `subscriptionStatus`, `subscriptionExpiresAt`
- Relations to all project models

**GameHub Original**

- `GameStat` - Game statistics and high scores
- `Comment` - Game comments and ratings

### ✅ LibraKeeper Models

**Core Models**:

- `Item` - Library items (books, electronics, tools)
- `Loan` - Lending tracking
- `Tag` - Item categorization
- `LK_Comment` - Item comments
- `LK_Like` - Item likes
- `Message` - User messaging
- `ItemRequest` - User requests for new items
- `WaitlistEntry` - Waitlist for items

**Auth Models** (NextAuth):

- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification

**Settings**:

- `AppSettings` - Application configuration
- `FeatureFlag` - Feature toggles (with game/project slug support)

### ✅ StoryForge Models

**Core Models**:

- `SF_Project` - Story projects
- `Character` - Story characters
- `Location` - Story locations
- `TimelineEvent` - Story timeline

**Gamification**:

- `InkPot` - Virtual currency system
- `InkTx` - Transaction history
- `Goal` - Writing goals
- `ProgressLog` - Progress tracking
- `Badge` - Achievement badges
- `UserBadge` - User achievements

**Social**:

- `Follow` - User following
- `Group` - User groups
- `GroupMember` - Group membership

### ✅ QuestHunt Models

**Search**:

- `SearchQuery` - Popular searches
- `SearchHistory` - User search history

**Note**: QuestHunt uses Supabase for its main data (quests, locations, check-ins). These models may need migration or remain in Supabase with an adapter layer.

---

## Enums Defined

```prisma
enum Role {
  USER
  ADMIN
}

enum SettingType {
  STRING
  BOOLEAN
  NUMBER
  JSON
}

enum ItemType {
  BOOK
  ELECTRONIC
  TOOL
  OTHER
}

enum ItemStatus {
  AVAILABLE
  LOANED
  MAINTENANCE
  LOST
}

enum LoanStatus {
  ACTIVE
  RETURNED
  OVERDUE
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

enum VisibilityScope {
  PRIVATE
  FRIENDS
  PUBLIC_AUTHENTICATED
  PUBLIC_ANYONE
}
```

---

## What Still Needs To Be Done

### 1. Add Access Control Models

Need to add models for project access management:

```prisma
model UserProjectAccess {
  id        String     @id @default(cuid())
  userId    String
  projectId String     // 'libra-keeper', 'quest-hunt', 'story-forge'
  tier      AccessTier
  grantedAt DateTime   @default(now())
  expiresAt DateTime?

  user      User       @relation(fields: [userId], references: [id])

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

model ProjectPurchase {
  id              String         @id @default(cuid())
  userId          String
  projectId       String
  purchaseType    PurchaseType
  amount          Decimal
  currency        String         @default("USD")
  stripeSessionId String?        @unique
  status          PurchaseStatus
  purchasedAt     DateTime       @default(now())

  user            User           @relation(fields: [userId], references: [id])

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

### 2. QuestHunt Data Strategy

**Decision Needed**: Keep Supabase or migrate to Prisma?

**Option A: Keep Supabase** (Recommended for now)

- Create adapter layer in `apps/api`
- Bridge authentication between systems
- Minimal disruption to existing QuestHunt
- Can migrate later if needed

**Option B: Migrate to Prisma**

- Design quest/location models
- Migrate existing data
- More work upfront
- Better long-term integration

**Recommended**: Option A for initial integration

### 3. Migration Scripts

Create migration scripts for:

- Existing LibraKeeper data (if any)
- Existing StoryForge data (if any)
- Seed data for development

---

## Benefits of Current Schema

### ✅ Single Source of Truth

- One database for all data
- Easier to maintain
- Better for cross-project features

### ✅ Unified User Model

- Single user account across all projects
- Shared authentication
- Centralized permissions

### ✅ Access Control Ready

- `allowedProjects` field on User
- `FeatureFlag` supports project slugs
- Ready for access control implementation

### ✅ Compatibility Fields

- Multiple password fields for migration
- Image/avatar fields unified
- Backward compatibility maintained

---

## Next Steps

### Immediate (This Week)

1. **Add Access Control Models**
   - [ ] Add `UserProjectAccess` model
   - [ ] Add `ProjectPurchase` model
   - [ ] Add access/purchase enums
   - [ ] Create migration
   - [ ] Test locally

2. **Update User Relations**
   - [ ] Add UserProjectAccess relation to User
   - [ ] Add ProjectPurchase relation to User
   - [ ] Update types in shared package

3. **Seed Development Data**
   - [ ] Create seed script
   - [ ] Add test users with different access levels
   - [ ] Add sample project data
   - [ ] Add test purchases

### Next Week

1. **QuestHunt Strategy**
   - [ ] Decide: Keep Supabase vs. Migrate
   - [ ] If keeping: Create Supabase adapter service
   - [ ] If migrating: Design quest models
   - [ ] Document decision

2. **API Implementation**
   - [ ] Create AccessControl module in NestJS
   - [ ] Create Purchases module
   - [ ] Create Projects module
   - [ ] Add endpoints for access checks

---

## Migration Commands

### Generate Prisma Client

```bash
pnpm prisma:generate
```

### Create New Migration

```bash
pnpm --filter @gamehub/api prisma migrate dev --name add-access-control
```

### Reset Database (Development)

```bash
pnpm --filter @gamehub/api prisma migrate reset
```

### Run Migrations (Production)

```bash
pnpm --filter @gamehub/api prisma migrate deploy
```

---

## Schema Maintenance

### Adding New Models

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm prisma:generate`
3. Create migration: `pnpm --filter @gamehub/api prisma migrate dev --name <name>`
4. Test migration works
5. Update TypeScript types if needed
6. Commit both schema and migration

### Modifying Existing Models

1. Make changes to schema
2. Generate new migration
3. Test migration on dev database
4. Verify data integrity
5. Update related code
6. Commit changes

---

## Conclusion

✅ **Database consolidation is already complete!**

The main work remaining is:

1. Adding access control models
2. Deciding QuestHunt strategy
3. Creating seed data
4. Implementing API services

The hard work of merging schemas is done. Now we can focus on building the access control system and integrating the UIs.

---

**Status**: Schema Consolidated ✅
**Next Phase**: Access Control Implementation
**Blocker**: None
**Risk Level**: Low
