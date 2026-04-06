-- Nichtraucher-App: Tables Only (No Auth Trigger)
-- This file can be executed in Supabase Dashboard

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE IF NOT EXISTS event_type AS ENUM ('craving', 'slip', 'victory');
CREATE TYPE IF NOT EXISTS user_status AS ENUM ('planning', 'active', 'relapsed', 'success');
CREATE TYPE IF NOT EXISTS relationship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE IF NOT EXISTS relationship_type AS ENUM ('supporter', 'mutual');

-- ============================================================================
-- 2. CRAVING_EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event Type
  type event_type NOT NULL,
  intensity INT CHECK (intensity >= 1 AND intensity <= 10),
  duration_minutes INT,
  
  -- Context
  trigger TEXT[],
  location TEXT,
  emotion TEXT[],
  
  -- Response
  response TEXT,
  response_text TEXT,
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Privacy
  shared_with_friend BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_craving_events_user_id ON craving_events(user_id);
CREATE INDEX IF NOT EXISTS idx_craving_events_timestamp ON craving_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_craving_events_type ON craving_events(type);
CREATE INDEX IF NOT EXISTS idx_craving_events_user_date ON craving_events(user_id, DATE(timestamp));

-- ============================================================================
-- 3. DAILY_SUMMARIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_summaries (
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
  top_trigger TEXT,
  all_triggers TEXT[],
  
  -- Personal notes
  notes TEXT,
  victories_text TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);

-- ============================================================================
-- 4. ACCOUNTABILITY_PARTNERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Relationship
  relationship_type relationship_type DEFAULT 'supporter',
  status relationship_status DEFAULT 'pending',
  
  -- Privacy Control
  visibility_settings JSONB DEFAULT '{
    "can_see_daily_summary": true,
    "can_see_cravings": false,
    "can_see_mood": true,
    "can_see_triggers": true,
    "can_see_slips": true,
    "can_send_messages": true
  }'::jsonb,
  
  -- Metadata
  invited_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  last_contacted TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_accountability_user_id ON accountability_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_accountability_friend_id ON accountability_partners(friend_id);
CREATE INDEX IF NOT EXISTS idx_accountability_status ON accountability_partners(status);

-- ============================================================================
-- 5. SUPPORT_MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  message_type TEXT DEFAULT 'custom',
  message TEXT NOT NULL,
  emoji_reaction TEXT,
  related_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  seen_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_messages_to_user ON support_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);

-- ============================================================================
-- 6. TRIGGER_PATTERNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS trigger_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL,
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour_of_day INT CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  
  -- Frequency & severity
  frequency INT,
  avg_intensity FLOAT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, trigger, day_of_week, hour_of_day)
);

CREATE INDEX IF NOT EXISTS idx_trigger_patterns_user ON trigger_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_patterns_trigger ON trigger_patterns(trigger);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE craving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_patterns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS: CRAVING_EVENTS TABLE
-- ============================================================================

CREATE POLICY IF NOT EXISTS "users_see_own_cravings" ON craving_events
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "users_insert_own_cravings" ON craving_events
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "users_update_own_cravings" ON craving_events
  FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "friends_see_shared_cravings" ON craving_events
  FOR SELECT
  USING (
    user_id IN (
      SELECT friend_id FROM accountability_partners
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        AND status = 'accepted'
        AND (visibility_settings->>'can_see_cravings')::BOOLEAN = true
        AND shared_with_friend = true
    )
  );

-- ============================================================================
-- RLS: DAILY_SUMMARIES TABLE
-- ============================================================================

CREATE POLICY IF NOT EXISTS "users_see_own_summaries" ON daily_summaries
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "friends_see_shared_summaries" ON daily_summaries
  FOR SELECT
  USING (
    user_id IN (
      SELECT friend_id FROM accountability_partners
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        AND status = 'accepted'
        AND (visibility_settings->>'can_see_daily_summary')::BOOLEAN = true
    )
  );

-- ============================================================================
-- RLS: ACCOUNTABILITY_PARTNERS TABLE
-- ============================================================================

CREATE POLICY IF NOT EXISTS "users_see_own_partners" ON accountability_partners
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "users_can_invite_partners" ON accountability_partners
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ============================================================================
-- RLS: SUPPORT_MESSAGES TABLE
-- ============================================================================

CREATE POLICY IF NOT EXISTS "users_see_own_messages" ON support_messages
  FOR SELECT
  USING (
    to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "friends_can_send_messages" ON support_messages
  FOR INSERT
  WITH CHECK (
    from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND to_user_id IN (
      SELECT user_id FROM accountability_partners
      WHERE friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        AND status = 'accepted'
        AND (visibility_settings->>'can_send_messages')::BOOLEAN = true
    )
  );

-- ============================================================================
-- RLS: TRIGGER_PATTERNS TABLE
-- ============================================================================

CREATE POLICY IF NOT EXISTS "users_see_own_patterns" ON trigger_patterns
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update daily summary when craving logged
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_summaries (
    user_id, 
    date,
    craving_count,
    slip_count,
    victory_count,
    avg_intensity,
    max_intensity
  )
  SELECT
    NEW.user_id,
    DATE(NEW.timestamp),
    SUM(CASE WHEN type = 'craving' THEN 1 ELSE 0 END),
    SUM(CASE WHEN type = 'slip' THEN 1 ELSE 0 END),
    SUM(CASE WHEN type = 'victory' THEN 1 ELSE 0 END),
    AVG(CASE WHEN intensity IS NOT NULL THEN intensity ELSE NULL END),
    MAX(intensity)
  FROM craving_events
  WHERE user_id = NEW.user_id AND DATE(timestamp) = DATE(NEW.timestamp)
  ON CONFLICT (user_id, date) DO UPDATE SET
    craving_count = EXCLUDED.craving_count,
    slip_count = EXCLUDED.slip_count,
    victory_count = EXCLUDED.victory_count,
    avg_intensity = EXCLUDED.avg_intensity,
    max_intensity = EXCLUDED.max_intensity,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call function
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON craving_events;
CREATE TRIGGER trigger_update_daily_summary
AFTER INSERT ON craving_events
FOR EACH ROW
EXECUTE FUNCTION update_daily_summary();
