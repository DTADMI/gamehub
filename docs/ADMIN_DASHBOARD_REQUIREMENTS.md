# Unified Admin Dashboard - Requirements Document

**Project**: GameHub Admin Dashboard
**Status**: 📋 Planning Phase
**Estimated Effort**: 4-6 weeks
**Priority**: Medium (after bundle optimization complete)

---

## Executive Summary

Build a unified admin dashboard to manage all GameHub projects, games, users, and system configuration from a single interface. Currently, admin tasks require direct database access or scattered management across multiple systems (Firebase, Supabase, individual project admins).

### Goals

1. **Centralized Management**: Single dashboard for all administrative tasks
2. **Multi-Data Source**: Integrate Firebase (games) and Supabase (projects)
3. **User Management**: Manage users across all projects and games
4. **Feature Flags**: Control feature rollout and A/B testing
5. **Analytics**: Monitor usage, performance, and costs
6. **Access Control**: Role-based permissions for admin users

---

## Current Pain Points

### Problems to Solve

1. **Scattered Admin Interfaces**:
   - Firebase Console for game data
   - Supabase Dashboard for LibraKeeper/QuestHunt
   - No unified view of users across systems

2. **Manual Processes**:
   - Granting project access requires database queries
   - Feature flags spread across multiple configs
   - No centralized analytics

3. **Limited Visibility**:
   - Can't see which users play which games
   - Can't track user journey across projects
   - No cost monitoring dashboard

4. **Access Control Issues**:
   - Binary admin access (all or nothing)
   - Can't delegate specific admin tasks
   - No audit trail for admin actions

---

## User Personas

### Super Admin

- **Who**: Platform owner
- **Needs**: Full system access, analytics, cost monitoring
- **Can Do**: Everything

### Project Admin

- **Who**: Individual project maintainer (LibraKeeper, QuestHunt)
- **Needs**: Manage their project's users and content
- **Can Do**: User management for their project, feature flags for their project

### Game Admin

- **Who**: Game developer/moderator
- **Needs**: Manage leaderboards, moderate content
- **Can Do**: View game stats, reset leaderboards, moderate user-generated content

### Support Agent

- **Who**: Customer support team
- **Needs**: View user information, help with issues
- **Can Do**: Read-only access, basic user lookup

---

## Functional Requirements

### 1. User Management

#### View All Users

- **List View**: Paginated table of all users across systems
- **Columns**: Name, Email, Created Date, Last Active, Projects Accessed, Games Played
- **Filters**: By project, by activity date, by registration source
- **Search**: By name, email, user ID

#### User Details

- **Profile**: Name, email, avatar, bio, location
- **Activity**: Projects accessed, games played, playtime, achievements
- **Access**: Which projects they have access to
- **Authentication**: Sign-in methods, last login, account status
- **Actions**: Grant/revoke project access, disable account, reset password

#### Bulk Operations

- Grant access to multiple users
- Send email to user segment
- Export user data (GDPR compliance)

---

### 2. Project Management

#### Project List

- **View**: All projects (LibraKeeper, QuestHunt, StoryForge, future projects)
- **Status**: Enabled/Disabled, Public/Private, Beta/Production
- **Stats**: User count, active users (7d/30d), API calls

#### Project Configuration

- **Basic Info**: Name, description, URL, logo
- **Access Control**: Public access vs invite-only
- **Feature Flags**: Per-project feature toggles
- **Integrations**: Connected services (Supabase, APIs)
- **Limits**: Rate limits, user quotas, storage limits

#### Project Analytics

- User growth over time
- Daily/weekly/monthly active users
- Feature usage stats
- API usage and costs

---

### 3. Game Management

#### Game List

- **View**: All 13+ games in platform
- **Columns**: Name, Type, Status, Players (total/active), Last Updated
- **Filters**: By category, by status (enabled/disabled)

#### Game Configuration

- **Basic Info**: Name, description, thumbnail, category
- **Status**: Enabled/Disabled, Featured, Beta
- **Settings**: Default settings, difficulty levels
- **Leaderboards**: View, reset, moderate

#### Game Analytics

- Total plays, unique players
- Average playtime, completion rate
- Popular games ranking
- Performance metrics (load time, error rate)

---

### 4. Feature Flags

#### Global Flags

- **System-wide features**: New game engine, beta features, maintenance mode
- **Rollout Control**: Percentage-based rollout, user segment targeting

#### Project Flags

- **Per-project features**: StoryForge AI generation, QuestHunt multiplayer
- **Override**: Project admins can override global settings

#### Flag Management

- Create/edit/delete flags
- View flag usage and impact
- A/B test results
- Rollback capability

---

### 5. Analytics Dashboard

#### System Overview

- **Metrics**: Total users, active users, total plays, projects active
- **Charts**: User growth, game popularity, project usage
- **Alerts**: System errors, cost spikes, performance issues

#### User Analytics

- User acquisition sources
- Retention cohorts
- User journey across projects
- Churn analysis

#### Financial Analytics

- Firebase costs (reads/writes, storage, functions)
- Supabase costs (database, auth, storage)
- API costs (OpenAI for StoryForge)
- Cost per user, cost per project

---

### 6. Content Moderation

#### User-Generated Content

- View flagged content
- Review and approve/reject
- Ban users creating inappropriate content

#### Leaderboards

- View all leaderboard entries
- Detect suspicious scores
- Remove cheaters/bots

---

### 7. System Configuration

#### Platform Settings

- **Maintenance Mode**: Enable/disable platform access
- **Notifications**: System announcements, maintenance notices
- **Email Templates**: Customize email notifications

#### Access Control

- **Admin Roles**: Super Admin, Project Admin, Game Admin, Support
- **Permissions**: Granular permission management
- **Audit Log**: Track all admin actions

---

## Technical Requirements

### Backend (NestJS)

#### New Modules

1. **Admin Module** (`apps/api/src/modules/admin/`)
   - AdminController
   - AdminService
   - AdminGuard (authentication/authorization)

2. **User Management Module**
   - UserManagementController
   - UserManagementService
   - Queries across Firebase + Supabase

3. **Project Management Module**
   - ProjectManagementController
   - ProjectManagementService
   - Project CRUD operations

4. **Game Management Module**
   - GameManagementController
   - GameManagementService
   - Game stats, leaderboard operations

5. **Feature Flags Module**
   - FeatureFlagsController
   - FeatureFlagsService
   - Flag evaluation engine

6. **Analytics Module**
   - AnalyticsController
   - AnalyticsService
   - Data aggregation from multiple sources

#### API Endpoints

**Users**:

- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/:id` - User details
- `POST /api/admin/users/:id/grant-access` - Grant project access
- `DELETE /api/admin/users/:id/revoke-access` - Revoke access
- `PATCH /api/admin/users/:id` - Update user

**Projects**:

- `GET /api/admin/projects` - List projects
- `GET /api/admin/projects/:id` - Project details
- `PATCH /api/admin/projects/:id` - Update project
- `GET /api/admin/projects/:id/analytics` - Project analytics

**Games**:

- `GET /api/admin/games` - List games
- `GET /api/admin/games/:id` - Game details
- `PATCH /api/admin/games/:id` - Update game
- `DELETE /api/admin/games/:id/leaderboard` - Reset leaderboard

**Feature Flags**:

- `GET /api/admin/flags` - List all flags
- `POST /api/admin/flags` - Create flag
- `PATCH /api/admin/flags/:id` - Update flag
- `DELETE /api/admin/flags/:id` - Delete flag

**Analytics**:

- `GET /api/admin/analytics/overview` - System overview
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/costs` - Cost analytics

#### Data Sources Integration

**Firebase**:

- Users (auth)
- Game progress, leaderboards
- Real-time presence

**Supabase** (for each project):

- LibraKeeper: profiles, budgets, transactions
- QuestHunt: profiles, quests, activities
- StoryForge: profiles, stories

**Aggregation Strategy**:

- Cache expensive queries
- Background jobs for analytics
- Real-time for critical operations

---

### Frontend (Next.js)

#### Routes Structure

```
/admin
  /dashboard          - Overview/homepage
  /users              - User management
    /:id              - User details
  /projects           - Project management
    /:id              - Project details
    /:id/analytics    - Project analytics
  /games              - Game management
    /:id              - Game details
    /:id/leaderboard  - Leaderboard management
  /flags              - Feature flags
  /analytics          - System analytics
  /settings           - Admin settings
```

#### UI Components (use @gamehub/ui)

- DataTable (sortable, filterable, paginated)
- StatCard (metrics display)
- Chart components (line, bar, pie)
- UserCard, ProjectCard, GameCard
- FeatureFlag toggle
- AdminLayout (sidebar navigation)

#### State Management

- **React Query**: Server state, caching
- **Zustand**: Client state (filters, preferences)

---

## Database Schema

### New Tables (Supabase main admin DB)

#### admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL, -- 'super_admin', 'project_admin', 'game_admin', 'support'
  permissions JSONB, -- Granular permissions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### feature_flags

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  target_segments JSONB, -- User segments to target
  project_id UUID, -- NULL for global flags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### admin_audit_log

```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- 'user_grant_access', 'project_disable', etc.
  entity_type VARCHAR(50), -- 'user', 'project', 'game', 'flag'
  entity_id VARCHAR(255),
  changes JSONB, -- What changed
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### user_project_access

```sql
CREATE TABLE user_project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  granted_by UUID REFERENCES admin_users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL for permanent access
  UNIQUE(user_id, project_id)
);
```

---

## Security Considerations

### Authentication

- **Admin Users**: Separate from regular users
- **MFA Required**: Two-factor authentication for admin access
- **Session Management**: Short-lived sessions, auto-logout

### Authorization

- **Role-Based Access Control (RBAC)**
- **Least Privilege**: Admins only get permissions they need
- **Audit Everything**: Log all admin actions

### Data Protection

- **Encryption**: Encrypt sensitive data at rest
- **PII Handling**: Careful with personally identifiable information
- **GDPR Compliance**: Data export, right to be forgotten

### Rate Limiting

- Prevent abuse of admin APIs
- Different limits per role
- Alert on suspicious activity

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Set up admin database (Supabase)
- [ ] Create admin authentication (NestJS)
- [ ] Build basic admin layout (Next.js)
- [ ] Implement RBAC system
- [ ] Create audit logging

### Phase 2: User Management (Week 2-3)

- [ ] User list view
- [ ] User detail view
- [ ] Grant/revoke access
- [ ] User search and filters
- [ ] Bulk operations

### Phase 3: Project & Game Management (Week 3-4)

- [ ] Project list and details
- [ ] Game list and details
- [ ] Enable/disable controls
- [ ] Basic configuration

### Phase 4: Feature Flags (Week 4-5)

- [ ] Flag management UI
- [ ] Flag evaluation API
- [ ] Rollout controls
- [ ] A/B testing support

### Phase 5: Analytics (Week 5-6)

- [ ] System overview dashboard
- [ ] User analytics
- [ ] Cost monitoring
- [ ] Charts and visualizations

### Phase 6: Polish & Launch (Week 6)

- [ ] Testing
- [ ] Documentation
- [ ] Admin user training
- [ ] Soft launch to selected admins

---

## Success Metrics

### Adoption

- [ ] 100% of admin tasks possible through dashboard
- [ ] Admin satisfaction score > 8/10
- [ ] Reduced time for common tasks by 50%

### Reliability

- [ ] 99.9% uptime
- [ ] < 500ms average response time
- [ ] Zero security incidents

### Impact

- [ ] Faster feature rollouts (days → hours)
- [ ] Better user support (response time cut in half)
- [ ] Cost visibility and optimization

---

## Risks & Mitigations

### Risk: Security Breach

- **Mitigation**: MFA, audit logging, regular security audits

### Risk: Performance Issues

- **Mitigation**: Caching, background jobs, pagination

### Risk: Data Inconsistency

- **Mitigation**: Transaction management, data validation, rollback capability

### Risk: Scope Creep

- **Mitigation**: Stick to phases, MVP first, iterate based on feedback

---

## Open Questions

1. **Which admins need access first?** → Prioritize most common use cases
2. **How to handle Firebase vs Supabase user ID conflicts?** → Unified user ID mapping table
3. **Real-time vs batch analytics?** → Hybrid: Real-time for critical, batch for historical
4. **Self-service project creation?** → Phase 2+ feature, manual for MVP
5. **Multi-tenancy for project admins?** → Yes, use RLS in Supabase

---

## Next Steps

1. **Review & Approve**: Get stakeholder buy-in on requirements
2. **Design Phase**: Create UI mockups, finalize DB schema
3. **Tech Stack Confirmation**: NestJS + Next.js + Supabase + Firebase
4. **Sprint Planning**: Break into 2-week sprints
5. **Start Phase 1**: Begin with foundation work

---

**Document Status**: 📋 Draft for Review
**Last Updated**: January 15, 2026
**Owner**: Development Team
