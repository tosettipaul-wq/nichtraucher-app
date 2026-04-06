# Nichtraucher-App: Data Model & Schema

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                 │
│  - Dashboard (display)                              │
│  - Log Craving (form)                               │
│  - Friend View (read-only)                          │
└────────────────┬────────────────────────────────────┘
                 │
            (HTTPS/REST)
                 │
         ┌───────▼────────┐
         │ Vercel Edge    │
         │ Functions      │
         │ (API Routes)   │
         └───────┬────────┘
                 │
         ┌───────▼────────────────────┐
         │  Supabase Realtime         │
         │  (WebSocket subscriptions) │
         └───────┬────────────────────┘
                 │
    ┌────────────▼────────────────────┐
    │   PostgreSQL (Supabase)         │
    │   - User data                   │
    │   - Craving events              │
    │   - Daily summaries             │
    │   - Accountability relationships │
    │   - Trigger patterns            │
    └────────────────────────────────┘
```

---

## Core Tables

### 1. `users` (User Profiles)

**Purpose:** Store user profile + quit attempt metadata

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Quit Journey
  quit_date DATE NOT NULL (day you quit or will quit),
  status: 'planning' | 'active' | 'relapsed' | 'success', DEFAULT 'planning',
  cigs_per_day_before INT (baseline before quitting),
  motivation TEXT (why you're quitting),
  
  -- Preferences
  timezone TEXT DEFAULT 'Europe/Berlin',
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '08:00', (morning digest)
  privacy_level: 'private' | 'friend_summary' | 'friend_detailed',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP,
  
  -- Auth (Supabase auto-manages)
  auth_id UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_quit_date ON users(quit_date);
```

**Example Row:**
```
id: uuid-abc123
email: paul@example.com
quit_date: 2026-04-01
status: active
cigs_per_day_before: 15
motivation: "Health for Bo (my dog)"
timezone: Europe/Berlin
notification_time: 08:00
privacy_level: friend_summary
```

---

### 2. `craving_events` (Real-Time Logging)

**Purpose:** Log every craving, slip, or victory with context

```sql
CREATE TABLE craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event Type
  type: 'craving' | 'slip' | 'victory' NOT NULL,
  intensity INT CHECK (intensity >= 1 AND intensity <= 10),
  duration_minutes INT (how long did craving last?),
  
  -- Context
  trigger TEXT[] (ARRAY of trigger tags),
  -- Allowed triggers: 'stress', 'social', 'bored', 'after_meal', 'morning', 'evening', 'location:work', 'emotion:angry', etc.
  location TEXT OPTIONAL (where were you?),
  emotion TEXT[] OPTIONAL (['stressed', 'sad', 'happy', 'bored']),
  
  -- Response (how did you handle it?)
  response: 'breathed' | 'walked' | 'called_friend' | 'drank_water' | 'none' | NULL,
  response_text TEXT OPTIONAL (custom note),
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL (when did craving happen, not when logged),
  created_at TIMESTAMP DEFAULT now() (when user logged it),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Privacy
  shared_with_friend BOOLEAN DEFAULT true (can friend see this event?)
);

-- Indexes
CREATE INDEX idx_craving_events_user_id ON craving_events(user_id);
CREATE INDEX idx_craving_events_timestamp ON craving_events(timestamp);
CREATE INDEX idx_craving_events_type ON craving_events(type);
CREATE INDEX idx_craving_events_user_date ON craving_events(user_id, DATE(timestamp));
```

**Example Rows:**
```
-- Craving logged at 14:32
id: uuid-ev001
user_id: uuid-abc123
type: 'craving'
intensity: 7
trigger: ['stress', 'meeting:difficult']
emotion: ['anxious']
response: 'walked'
timestamp: 2026-04-06 14:30:00
created_at: 2026-04-06 14:32:15

-- Victory (resisted slip)
id: uuid-ev002
user_id: uuid-abc123
type: 'victory'
intensity: 8 (was intense, but survived)
trigger: ['social:friend_smoking']
response: 'called_friend'
response_text: "James told me I got this"
timestamp: 2026-04-06 18:00:00
created_at: 2026-04-06 18:05:00

-- Slip (relapsed)
id: uuid-ev003
user_id: uuid-abc123
type: 'slip'
intensity: null (not applicable)
trigger: ['stress', 'work:deadline']
response_text: "Stressed about launch, smoked 2 cigs"
timestamp: 2026-04-06 20:00:00
created_at: 2026-04-06 20:15:00
```

---

### 3. `daily_summaries` (Auto-Aggregated)

**Purpose:** Nightly aggregation of all craving_events → daily digest (for performance + privacy)

```sql
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Aggregates
  craving_count INT DEFAULT 0,
  slip_count INT DEFAULT 0,
  victory_count INT DEFAULT 0,
  
  -- Stats
  avg_intensity FLOAT,
  max_intensity INT,
  total_duration_minutes INT,
  
  -- Mood
  mood_morning INT CHECK (mood_morning >= 1 AND mood_morning <= 5),
  mood_evening INT CHECK (mood_evening >= 1 AND mood_evening <= 5),
  
  -- Trigger summary
  top_trigger TEXT (most common trigger today),
  all_triggers TEXT[] (unique triggers logged),
  
  -- Personal notes
  notes TEXT (daily reflection, optional),
  victories_text TEXT[] (logged victories/successes),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);
```

**Example Row:**
```
id: uuid-ds001
user_id: uuid-abc123
date: 2026-04-06
craving_count: 3
slip_count: 0
victory_count: 2
avg_intensity: 6.7
mood_morning: 3 (okay)
mood_evening: 4 (better)
top_trigger: stress
all_triggers: ['stress', 'meeting', 'social']
notes: "Hard morning meeting, but walked it off"
```

---

### 4. `accountability_partners` (Relationships)

**Purpose:** Define who can see whose data + privacy settings

```sql
CREATE TABLE accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Relationship
  relationship_type: 'supporter' | 'mutual' DEFAULT 'supporter',
  -- 'supporter': Friend just supports Paul
  -- 'mutual': Both are quitting, mutual support (Phase 2)
  
  status: 'pending' | 'accepted' | 'blocked' DEFAULT 'pending',
  -- 'pending': Friend invited, not yet accepted
  -- 'accepted': Active accountability relationship
  -- 'blocked': Paul revoked access
  
  -- Privacy Control
  visibility_settings: JSONB DEFAULT {
    'can_see_daily_summary': true,
    'can_see_cravings': false,
    'can_see_mood': true,
    'can_see_triggers': true,
    'can_see_slips': true,
    'can_send_messages': true
  },
  
  -- Metadata
  invited_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  last_contacted TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Indexes
CREATE INDEX idx_accountability_user_id ON accountability_partners(user_id);
CREATE INDEX idx_accountability_friend_id ON accountability_partners(friend_id);
CREATE INDEX idx_accountability_status ON accountability_partners(status);
```

**Example Rows:**
```
-- Paul's friend (supporter)
id: uuid-ap001
user_id: uuid-abc123 (Paul)
friend_id: uuid-friend123 (Friend)
relationship_type: 'supporter'
status: 'accepted'
visibility_settings: {
  'can_see_daily_summary': true,
  'can_see_cravings': false,
  'can_see_mood': true,
  'can_see_triggers': true,
  'can_see_slips': true,
  'can_send_messages': true
}
invited_at: 2026-04-01
accepted_at: 2026-04-02
```

---

### 5. `support_messages` (Friend → User)

**Purpose:** Track messages + reactions from accountability partner

```sql
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  message_type: 'preset' | 'custom' DEFAULT 'custom',
  -- 'preset': "You got this!", "Proud of you"
  -- 'custom': Free-form message from friend
  
  message TEXT NOT NULL,
  emoji_reaction TEXT OPTIONAL ('👍', '💪', '🙌', etc.),
  
  related_date DATE (which day was this about?),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  seen_at TIMESTAMP,
  
  FOREIGN KEY (from_user_id, to_user_id) 
    REFERENCES accountability_partners(friend_id, user_id)
);

-- Indexes
CREATE INDEX idx_support_messages_to_user ON support_messages(to_user_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at DESC);
```

**Example Row:**
```
id: uuid-sm001
from_user_id: uuid-friend123
to_user_id: uuid-abc123
message_type: preset
message: "You got this! I'm proud of you 💪"
related_date: 2026-04-06
created_at: 2026-04-06 20:30:00
seen_at: 2026-04-06 20:35:00
```

---

### 6. `trigger_patterns` (Analytics)

**Purpose:** Pre-calculated trigger statistics (optimized for reporting)

```sql
CREATE TABLE trigger_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Pattern
  trigger TEXT NOT NULL,
  
  -- Time-based analysis
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = Monday, 6 = Sunday
  
  hour_of_day INT CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  
  -- Frequency & severity
  frequency INT (how many times this trigger happened?),
  avg_intensity FLOAT (average intensity when this trigger happened),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, trigger, day_of_week, hour_of_day)
);

-- Indexes
CREATE INDEX idx_trigger_patterns_user ON trigger_patterns(user_id);
CREATE INDEX idx_trigger_patterns_trigger ON trigger_patterns(trigger);
```

**Example Rows:**
```
-- Friday meetings are stressful for Paul
id: uuid-tp001
user_id: uuid-abc123
trigger: stress:meeting
day_of_week: 4 (Friday)
hour_of_day: 14
frequency: 5
avg_intensity: 7.4

-- Monday mornings too
id: uuid-tp002
user_id: uuid-abc123
trigger: stress:morning
day_of_week: 0 (Monday)
hour_of_day: 8
frequency: 3
avg_intensity: 6.0
```

---

## Row-Level Security (RLS) Policies

**Key Principle:** Users can only see their own data, except when explicitly shared via accountability relationships.

### Policy 1: User sees own data

```sql
-- users table
CREATE POLICY "users_see_own_data" ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

-- craving_events table
CREATE POLICY "users_see_own_cravings" ON craving_events
  FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- daily_summaries table
CREATE POLICY "users_see_own_summaries" ON daily_summaries
  FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

### Policy 2: Friends see shared data (if privacy allows)

```sql
-- friends can see daily_summaries (if visibility_settings allows)
CREATE POLICY "friends_see_shared_summaries" ON daily_summaries
  FOR SELECT
  USING (
    user_id IN (
      SELECT friend_id FROM accountability_partners
      WHERE (user_id = (SELECT users.id FROM users WHERE auth_id = auth.uid()))
        AND status = 'accepted'
        AND visibility_settings->>'can_see_daily_summary' = 'true'
    )
  );

-- friends can see craving_events (if visibility_settings allows)
CREATE POLICY "friends_see_shared_cravings" ON craving_events
  FOR SELECT
  USING (
    user_id IN (
      SELECT friend_id FROM accountability_partners
      WHERE (user_id = (SELECT users.id FROM users WHERE auth_id = auth.uid()))
        AND status = 'accepted'
        AND visibility_settings->>'can_see_cravings' = 'true'
        AND shared_with_friend = true
    )
  );
```

### Policy 3: Users can only insert/update their own data

```sql
CREATE POLICY "users_insert_own_cravings" ON craving_events
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "users_update_own_cravings" ON craving_events
  FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );
```

---

## Real-Time Subscriptions (Supabase Realtime)

### Paul's Dashboard (Real-Time Updates)

```typescript
// Watch for own craving_events changes
supabase
  .from('craving_events')
  .on('*', payload => {
    // Update dashboard immediately
    refreshDashboard();
  })
  .subscribe();

// Watch for own daily_summary changes
supabase
  .from('daily_summaries')
  .on('INSERT', payload => {
    // New summary aggregated
    updateSummaryDisplay(payload.new);
  })
  .subscribe();

// Watch for support messages
supabase
  .from('support_messages')
  .on('INSERT', payload => {
    // New message from friend
    showNotification(payload.new);
  })
  .subscribe();
```

### Friend's View (Real-Time Updates)

```typescript
// Friend watches for Paul's new daily summaries (if allowed)
supabase
  .from('daily_summaries')
  .on('INSERT', payload => {
    if (canSeeData(payload.user_id)) {
      updateFriendDashboard(payload);
    }
  })
  .subscribe();
```

---

## Computed Fields (Triggers + Functions)

### Daily Summary Auto-Aggregation

```sql
-- Trigger on craving_events INSERT → update daily_summary
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_summaries (user_id, date, craving_count, ...)
  SELECT 
    NEW.user_id,
    DATE(NEW.timestamp),
    COUNT(CASE WHEN type = 'craving' THEN 1 END),
    ...
  FROM craving_events
  WHERE user_id = NEW.user_id AND DATE(timestamp) = DATE(NEW.timestamp)
  ON CONFLICT (user_id, date) DO UPDATE SET
    craving_count = EXCLUDED.craving_count,
    ...
  ;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_summary
AFTER INSERT ON craving_events
FOR EACH ROW
EXECUTE FUNCTION update_daily_summary();
```

### Streak Calculation (Virtual Field)

```sql
-- No column stored; calculated on-the-fly
SELECT 
  DATE(NOW()) - quit_date AS days_sober,
  (DATE(NOW()) - quit_date) * cigs_per_day_before * 0.40 AS money_saved_eur -- rough est.
FROM users
WHERE id = $1;
```

---

## Data Types & Enums

### Enum: Event Types

```sql
CREATE TYPE event_type AS ENUM ('craving', 'slip', 'victory');
```

### Enum: User Status

```sql
CREATE TYPE user_status AS ENUM ('planning', 'active', 'relapsed', 'success');
```

### Enum: Relationship Status

```sql
CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'blocked');
```

### JSONB: Visibility Settings

```json
{
  "can_see_daily_summary": true,
  "can_see_cravings": false,
  "can_see_mood": true,
  "can_see_triggers": true,
  "can_see_slips": true,
  "can_send_messages": true
}
```

---

## Migration & Deployment

**Supabase CLI Commands:**

```bash
# Create migration (local)
supabase migration new create_quitting_schema

# Apply migration
supabase migration up

# Deploy to production
supabase db push

# Verify RLS policies
supabase auth rules check
```

**Backup & Recovery:**
- Supabase auto-backups daily
- Paul can request manual backups anytime
- Data export: CSV dumps available via API endpoint

---

## Future Enhancements (Phase 2)

- `group_challenges` — Friends quitting together
- `medications` — Nicotine substitutes tracking
- `health_integrations` — Apple Health sync
- `expert_chat` — Doctor/counselor advice
- `timeline_view` — Visual calendar of events

---

**This schema is:** Production-ready for Supabase implementation  
**Next step:** Create migrations + deploy to test environment  
**Timeline:** Day 1 of Week 1 (development)
