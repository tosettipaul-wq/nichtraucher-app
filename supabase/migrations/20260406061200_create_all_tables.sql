-- Create all application tables
-- This migration assumes 'users' table already exists

CREATE TABLE IF NOT EXISTS craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  intensity INT CHECK (intensity >= 1 AND intensity <= 10),
  duration_minutes INT,
  trigger TEXT[],
  location TEXT,
  emotion TEXT[],
  response TEXT,
  response_text TEXT,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  shared_with_friend BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  craving_count INT DEFAULT 0,
  slip_count INT DEFAULT 0,
  victory_count INT DEFAULT 0,
  avg_intensity FLOAT,
  max_intensity INT,
  total_duration_minutes INT,
  mood_morning INT CHECK (mood_morning >= 1 AND mood_morning <= 5),
  mood_evening INT CHECK (mood_evening >= 1 AND mood_evening <= 5),
  top_trigger TEXT,
  all_triggers TEXT[],
  notes TEXT,
  victories_text TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'supporter',
  status TEXT DEFAULT 'pending',
  visibility_settings JSONB DEFAULT '{"can_see_daily_summary":true,"can_see_cravings":false,"can_see_mood":true,"can_see_triggers":true,"can_see_slips":true,"can_send_messages":true}'::jsonb,
  invited_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  last_contacted TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'custom',
  message TEXT NOT NULL,
  emoji_reaction TEXT,
  related_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  seen_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trigger_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL,
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour_of_day INT CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  frequency INT,
  avg_intensity FLOAT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, trigger, day_of_week, hour_of_day)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_craving_events_user_id ON craving_events(user_id);
CREATE INDEX IF NOT EXISTS idx_craving_events_timestamp ON craving_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_accountability_user_id ON accountability_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_to_user ON support_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_patterns_user ON trigger_patterns(user_id);

-- Enable RLS
ALTER TABLE craving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "users_see_own_cravings" ON craving_events FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "users_see_own_summaries" ON daily_summaries FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "users_see_own_partners" ON accountability_partners FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR friend_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "users_see_own_messages" ON support_messages FOR SELECT USING (to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "users_see_own_patterns" ON trigger_patterns FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

