/**
 * Seed script for Nichtraucher-App database
 * Runs once at startup to ensure schema exists
 * 
 * Usage: tsx scripts/seed-db.ts
 */

import { createClient } from '@supabase/supabase-js';

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE env vars');
}

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const seedSQL = `
-- Create types
CREATE TYPE IF NOT EXISTS event_type AS ENUM ('craving', 'slip', 'victory');
CREATE TYPE IF NOT EXISTS user_status AS ENUM ('planning', 'active', 'relapsed', 'success');
CREATE TYPE IF NOT EXISTS relationship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE IF NOT EXISTS relationship_type AS ENUM ('supporter', 'mutual');

-- Create craving_events table
CREATE TABLE IF NOT EXISTS craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type event_type NOT NULL,
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

-- Create daily_summaries table
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

-- Create accountability_partners table
CREATE TABLE IF NOT EXISTS accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type relationship_type DEFAULT 'supporter',
  status relationship_status DEFAULT 'pending',
  visibility_settings JSONB DEFAULT '{"can_see_daily_summary":true,"can_see_cravings":false,"can_see_mood":true,"can_see_triggers":true,"can_see_slips":true,"can_send_messages":true}'::jsonb,
  invited_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  last_contacted TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create support_messages table
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

-- Create trigger_patterns table
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
CREATE INDEX IF NOT EXISTS idx_craving_events_user_date ON craving_events(user_id, DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX IF NOT EXISTS idx_accountability_user_id ON accountability_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_accountability_friend_id ON accountability_partners(friend_id);
CREATE INDEX IF NOT EXISTS idx_accountability_status ON accountability_partners(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_to_user ON support_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trigger_patterns_user ON trigger_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_patterns_trigger ON trigger_patterns(trigger);

-- Enable RLS
ALTER TABLE craving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies (sample - full policies in schema.sql)
CREATE POLICY IF NOT EXISTS "users_see_own_cravings" ON craving_events
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "users_see_own_summaries" ON daily_summaries
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "users_see_own_partners" ON accountability_partners
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR friend_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "users_see_own_messages" ON support_messages
  FOR SELECT USING (to_user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR from_user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "users_see_own_patterns" ON trigger_patterns
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Trigger function
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_summaries (
    user_id, date, craving_count, slip_count, victory_count, avg_intensity, max_intensity
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

DROP TRIGGER IF EXISTS trigger_update_daily_summary ON craving_events;
CREATE TRIGGER trigger_update_daily_summary
AFTER INSERT ON craving_events FOR EACH ROW
EXECUTE FUNCTION update_daily_summary();
`;

async function seed() {
  console.log('🌱 Seeding Supabase schema...');

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: seedSQL,
    });

    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }

    console.log('✅ Schema created successfully!');
    console.log('\n📊 Tables created:');
    console.log('  - users (existing)');
    console.log('  - craving_events');
    console.log('  - daily_summaries');
    console.log('  - accountability_partners');
    console.log('  - support_messages');
    console.log('  - trigger_patterns');
    console.log('\n✅ RLS enabled on all tables');
    console.log('✅ Indexes created');
    console.log('✅ Trigger function deployed');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seed:', error);
    process.exit(1);
  }
}

seed();
