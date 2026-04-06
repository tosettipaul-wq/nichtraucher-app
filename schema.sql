-- Nichtraucher-App: Production Schema
-- Deployed to Supabase project: gibuixucragwgxxzoyhn
-- Created: 2026-04-06

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE event_type AS ENUM ('craving', 'slip', 'victory');
CREATE TYPE user_status AS ENUM ('planning', 'active', 'relapsed', 'success');
CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE relationship_type AS ENUM ('supporter', 'mutual');

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Quit Journey
  quit_date DATE NOT NULL,
  status user_status DEFAULT 'planning',
  cigs_per_day_before INT,
  motivation TEXT,
  
  -- Preferences
  timezone TEXT DEFAULT 'Europe/Berlin',
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '08:00',
  privacy_level TEXT DEFAULT 'friend_summary',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP,
  
  -- Auth (Supabase)
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_quit_date ON users(quit_date);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================================================
-- 2. CRAVING_EVENTS TABLE
-- ============================================================================

CREATE TABLE craving_events (
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

CREATE INDEX idx_craving_events_user_id ON craving_events(user_id);
CREATE INDEX idx_craving_events_timestamp ON craving_events(timestamp);
CREATE INDEX idx_craving_events_type ON craving_events(type);
CREATE INDEX idx_craving_events_user_date ON craving_events(user_id, DATE(timestamp));

-- ============================================================================
-- 3. DAILY_SUMMARIES TABLE
-- ============================================================================

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

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);

-- ============================================================================
-- 4. ACCOUNTABILITY_PARTNERS TABLE
-- ============================================================================

CREATE TABLE accountability_partners (
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

CREATE INDEX idx_accountability_user_id ON accountability_partners(user_id);
CREATE INDEX idx_accountability_friend_id ON accountability_partners(friend_id);
CREATE INDEX idx_accountability_status ON accountability_partners(status);

-- ============================================================================
-- 5. SUPPORT_MESSAGES TABLE
-- ============================================================================

CREATE TABLE support_messages (
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

CREATE INDEX idx_support_messages_to_user ON support_messages(to_user_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at DESC);

-- ============================================================================
-- 6. TRIGGER_PATTERNS TABLE
-- ============================================================================

CREATE TABLE trigger_patterns (
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

CREATE INDEX idx_trigger_patterns_user ON trigger_patterns(user_id);
CREATE INDEX idx_trigger_patterns_trigger ON trigger_patterns(trigger);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE craving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_patterns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS: USERS TABLE
-- ============================================================================

CREATE POLICY "users_see_own_data" ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "users_can_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = auth_id);

-- ============================================================================
-- RLS: CRAVING_EVENTS TABLE
-- ============================================================================

CREATE POLICY "users_see_own_cravings" ON craving_events
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

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

-- Friends can see cravings (if visibility allows)
CREATE POLICY "friends_see_shared_cravings" ON craving_events
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

CREATE POLICY "users_see_own_summaries" ON daily_summaries
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "friends_see_shared_summaries" ON daily_summaries
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

CREATE POLICY "users_see_own_partners" ON accountability_partners
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "users_can_invite_partners" ON accountability_partners
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ============================================================================
-- RLS: SUPPORT_MESSAGES TABLE
-- ============================================================================

CREATE POLICY "users_see_own_messages" ON support_messages
  FOR SELECT
  USING (
    to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "friends_can_send_messages" ON support_messages
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

CREATE POLICY "users_see_own_patterns" ON trigger_patterns
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
CREATE TRIGGER trigger_update_daily_summary
AFTER INSERT ON craving_events
FOR EACH ROW
EXECUTE FUNCTION update_daily_summary();

-- ============================================================================
-- FUNCTIONS: User Creation
-- ============================================================================

-- Auto-create user profile when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
