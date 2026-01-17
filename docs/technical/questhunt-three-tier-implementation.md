# QuestHunt - Three-Tier Quest Type System Technical Implementation

> **Document Purpose**: Technical specification for implementing QuestHunt's three-tier quest type system (Virtual/Physical/Hybrid). This document is separate from the monetization analysis and focuses purely on implementation details.

## Table of Contents

- [Database Schema](#database-schema)
- [Row-Level Security Policies](#row-level-security-policies)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Key Technical Considerations](#key-technical-considerations)

## Database Schema

### Quest Types and Subtypes

```sql
-- Quest Types Enum
CREATE TYPE quest_type AS ENUM ('virtual', 'physical', 'hybrid');
CREATE TYPE virtual_quest_subtype AS ENUM (
  'story_hunt',
  'trivia_challenge',
  'neighborhood_explorer',
  'shape_puzzle',
  'picture_puzzle',
  'ar_challenge'
);
CREATE TYPE physical_quest_subtype AS ENUM (
  'simple_geocache',
  'multi_stage',
  'puzzle_trail',
  'treasure_event'
);
CREATE TYPE hybrid_quest_subtype AS ENUM (
  'mixed_reality',
  'qr_enhanced',
  'photo_challenge'
);
```

### Core Tables

```sql
-- Quests Table
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type quest_type NOT NULL,
  virtual_subtype virtual_quest_subtype,
  physical_subtype physical_quest_subtype,
  hybrid_subtype hybrid_quest_subtype,
  creator_id UUID REFERENCES users(id),
  is_admin_curated BOOLEAN DEFAULT false,
  is_procedurally_generated BOOLEAN DEFAULT false,
  difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
  estimated_duration_minutes INT,
  is_indoor BOOLEAN DEFAULT false,
  reward_tokens INT DEFAULT 0, -- Avatar customization currency
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT quest_subtype_check CHECK (
    (quest_type = 'virtual' AND virtual_subtype IS NOT NULL) OR
    (quest_type = 'physical' AND physical_subtype IS NOT NULL) OR
    (quest_type = 'hybrid' AND hybrid_subtype IS NOT NULL)
  )
);

-- Waypoints Table
CREATE TABLE waypoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  sequence_order INT NOT NULL,

  -- Virtual Quest Fields
  virtual_clue_data JSONB,
  picture_fragment BYTEA,
  ar_content_url TEXT,
  trivia_question JSONB, -- {question: "", answers: [], correct_index: 0}

  -- Physical Quest Fields
  physical_description TEXT,
  requires_physical_item BOOLEAN DEFAULT false,
  qr_code_data TEXT,

  -- Hybrid Quest Fields
  is_checkpoint BOOLEAN DEFAULT false,
  unlock_condition JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles and Subscriptions
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) PRIMARY KEY,
  has_puzzle_creator_role BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'explorer', 'creator', 'lifetime', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  avatar_tokens INT DEFAULT 0, -- Currency for avatar customization
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest Progress
CREATE TABLE quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quest_id UUID REFERENCES quests(id),

  virtual_clues_collected INT DEFAULT 0,
  picture_fragments_collected JSONB,
  trivia_answers_correct INT DEFAULT 0,

  physical_caches_found INT DEFAULT 0,
  logbook_signed BOOLEAN DEFAULT false,
  items_exchanged JSONB,

  checkpoints_completed JSONB,
  qr_codes_scanned JSONB,
  photos_submitted JSONB,

  tokens_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avatar Customization System
CREATE TABLE avatar_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hat', 'clothing', 'accessory', 'pet', 'effect'
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'event')),
  token_cost INT NOT NULL,
  is_event_exclusive BOOLEAN DEFAULT false,
  event_id UUID REFERENCES events(id),
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_avatar_items (
  user_id UUID REFERENCES users(id),
  item_id UUID REFERENCES avatar_items(id),
  equipped BOOLEAN DEFAULT false,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- Events System
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  bonus_tokens_multiplier DECIMAL DEFAULT 1.0,
  special_avatar_items JSONB, -- Array of exclusive item IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row-Level Security Policies

```sql
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Free users: Limited virtual quest creation
CREATE POLICY free_user_create_virtual_quest ON quests
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    quest_type = 'virtual' AND
    is_admin_curated = false AND
    is_procedurally_generated = false AND
    -- Check monthly limit (3 quests/month for free tier)
    (
      SELECT COUNT(*)
      FROM quests
      WHERE creator_id = auth.uid()
      AND created_at >= date_trunc('month', NOW())
    ) < 3
  );

-- Explorer tier: Increased virtual quest creation (10/month)
CREATE POLICY explorer_create_virtual_quest ON quests
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    quest_type = 'virtual' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND subscription_tier IN ('explorer', 'creator', 'lifetime', 'enterprise')
    ) AND
    (
      SELECT COUNT(*)
      FROM quests
      WHERE creator_id = auth.uid()
      AND created_at >= date_trunc('month', NOW())
    ) < 10
  );

-- Creator/Lifetime: Physical and hybrid quest creation
CREATE POLICY creator_create_physical_hybrid ON quests
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    quest_type IN ('physical', 'hybrid') AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND
      has_puzzle_creator_role = true AND
      subscription_tier IN ('creator', 'lifetime', 'enterprise') AND
      (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    )
  );

-- Admin: All quest types including curated and procedurally generated
CREATE POLICY admin_create_any_quest ON quests
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

## API Endpoints

### Virtual Quest Creation (User-Generated)

```typescript
// app/api/quests/virtual/route.ts
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('subscription_tier')
    .eq('user_id', user.id)
    .single();

  // Check monthly quest creation limit
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('quests')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', user.id)
    .gte('created_at', monthStart.toISOString());

  const limit = ['explorer', 'creator', 'lifetime', 'enterprise'].includes(userRole?.subscription_tier) ? 10 : 3;

  if (count >= limit) {
    return Response.json({
      error: `Monthly virtual quest limit reached (${limit}/month)`,
      upgrade_url: userRole?.subscription_tier === 'free' ? '/pricing' : null
    }, { status: 403 });
  }

  const { title, description, waypoints, virtual_subtype, is_indoor, estimated_duration } = await request.json();

  // Create quest
  const { data: quest, error } = await supabase
    .from('quests')
    .insert({
      title,
      description,
      quest_type: 'virtual',
      virtual_subtype,
      is_indoor,
      estimated_duration_minutes: estimated_duration,
      creator_id: user.id,
      reward_tokens: calculateRewardTokens(virtual_subtype, waypoints.length)
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });

  // Create waypoints
  const waypointData = waypoints.map((wp: any, idx: number) => ({
    quest_id: quest.id,
    location: `POINT(${wp.lng} ${wp.lat})`,
    sequence_order: idx + 1,
    virtual_clue_data: wp.clue_data,
    trivia_question: wp.trivia
  }));

  await supabase.from('waypoints').insert(waypointData);

  return Response.json({ quest });
}

function calculateRewardTokens(subtype: string, waypoint_count: number): number {
  const baseTokens = waypoint_count * 10;
  const subtypeMultiplier = {
    'story_hunt': 1.0,
    'trivia_challenge': 1.2,
    'neighborhood_explorer': 1.1,
    'shape_puzzle': 1.5,
    'picture_puzzle': 1.5,
    'ar_challenge': 2.0
  };
  return Math.floor(baseTokens * (subtypeMultiplier[subtype] || 1.0));
}
```

### Procedural Quest Generation

```typescript
// app/api/admin/quests/generate/route.ts
export async function POST(request: Request) {
  const { city, quest_type, difficulty } = await request.json();

  // Generate waypoints based on city POIs (Points of Interest)
  const pois = await fetchCityPOIs(city, quest_type);
  const waypoints = selectWaypointsForDifficulty(pois, difficulty);

  const quest = {
    title: `${city} ${getQuestTheme(quest_type)} Adventure`,
    quest_type: 'virtual',
    virtual_subtype: quest_type,
    is_procedurally_generated: true,
    is_admin_curated: true,
    waypoints: waypoints.map((poi, idx) => ({
      location: poi.coordinates,
      sequence_order: idx + 1,
      trivia_question: generateTrivia(poi),
      virtual_clue_data: generateClue(poi, difficulty)
    }))
  };

  // Save to database
  const { data } = await supabase.from('quests').insert(quest).select().single();
  return Response.json({ quest: data });
}
```

## Frontend Components

### Quest Type Selector with Tier Gating

```typescript
// components/QuestTypeSelector.tsx
export function QuestTypeSelector({ userRole }: { userRole: UserRole }) {
  const monthlyQuests = useMonthlyQuestCount(userRole.user_id);
  const limit = getTierQuestLimit(userRole.subscription_tier);

  return (
    <div className="quest-type-selector">
      <h3>Create Quest</h3>

      {/* Virtual Quests */}
      <QuestTypeCard
        type="virtual"
        icon="🌐"
        title="Virtual Quest"
        available={monthlyQuests < limit}
        usageText={`${monthlyQuests}/${limit} quests this month`}
        subtypes={[
          { name: 'Story Hunt', description: 'Follow a narrative through locations' },
          { name: 'Trivia Challenge', description: 'Answer questions at each location' },
          { name: 'Neighborhood Explorer', description: 'Discover hidden gems nearby' }
        ]}
        upgradeMessage={
          userRole.subscription_tier === 'free'
            ? 'Upgrade to Explorer for 10 quests/month'
            : null
        }
      />

      {/* Physical Quests */}
      <QuestTypeCard
        type="physical"
        icon="📍"
        title="Physical Quest"
        available={userRole.has_puzzle_creator_role}
        locked={!userRole.has_puzzle_creator_role}
        note="Requires Creator tier + puzzle_creator role"
        upgradeMessage="Upgrade to Creator to hide real-world caches"
      />

      {/* Hybrid Quests */}
      <QuestTypeCard
        type="hybrid"
        icon="🔀"
        title="Hybrid Quest"
        available={userRole.has_puzzle_creator_role}
        locked={!userRole.has_puzzle_creator_role}
        upgradeMessage="Upgrade to Creator for hybrid quests"
      />
    </div>
  );
}

function getTierQuestLimit(tier: string): number {
  return {
    'free': 3,
    'explorer': 10,
    'creator': 10, // Same as Explorer for virtual quests
    'lifetime': 999,
    'enterprise': 999
  }[tier] || 3;
}
```

### Avatar Customization UI

```typescript
// components/AvatarCustomization.tsx
export function AvatarCustomization({ userId, tokens }: Props) {
  const { data: items } = useAvatarItems();
  const { data: owned } = useUserAvatarItems(userId);

  return (
    <div className="avatar-customization">
      <div className="token-balance">
        <CoinIcon />
        <span>{tokens} Quest Tokens</span>
      </div>

      <div className="avatar-preview">
        <AvatarRenderer equipped={owned.filter(i => i.equipped)} />
      </div>

      <div className="item-shop">
        {items.map(item => (
          <AvatarItemCard
            key={item.id}
            item={item}
            owned={owned.some(o => o.item_id === item.id)}
            canAfford={tokens >= item.token_cost}
            onPurchase={() => purchaseItem(userId, item.id, item.token_cost)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Key Technical Considerations

### 1. PostGIS Performance

- All location queries use `ST_DWithin` for efficient radius searches
- Create spatial indexes: `CREATE INDEX waypoints_location_idx ON waypoints USING GIST (location);`
- Use geography type (not geometry) for accurate distance calculations

### 2. Procedural Generation

- POI data sourced from OpenStreetMap Overpass API
- Trivia questions generated using GPT-4 API (cached to reduce costs)
- Quest difficulty adjusted by waypoint distance spread and clue complexity

### 3. Avatar Token Economy

- Tokens earned: 10 per waypoint + subtype multiplier
- No real money value (prevents gambling regulations)
- Event bonuses: 1.5x-3x tokens during special events

### 4. Indoor Quest Mechanics

- Indoor quests use smaller radius triggers (5m vs 50m outdoor)
- Support for multi-floor buildings (altitude tracking)
- QR codes for precise indoor location verification

### 5. Offline Support

- Service Workers cache quest data and map tiles
- IndexedDB stores in-progress quest state
- Background sync uploads completed quests when online

### 6. Physical Quest Moderation

- All physical quests enter review queue before going live
- Admin dashboard shows pending quests with map preview
- Community flagging system for abandoned/problematic caches

---

**Related Documents**:

- [QuestHunt Monetization Analysis](../projects_analysis/questhunt-geocaching-platform.md)
- [Database Migration Scripts](./migrations/)
- [API Documentation](./api-reference.md)
