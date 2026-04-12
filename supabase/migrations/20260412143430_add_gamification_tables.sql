-- Gamification Enhancement Migration
-- Add tables for team challenges, achievement notifications, and profile showcase
-- Created: 2026-04-12

-- ============================================================================
-- 1. TEAM_CHALLENGES TABLE
-- ============================================================================
-- Allows users to create or join group quit-smoking challenges
-- Example: "30-day no-smoke marathon" with 5 friends

CREATE TABLE team_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Challenge Details
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('30_day_streak', '7_day_win', 'group_support', 'custom')),
  goal_days INT NOT NULL DEFAULT 30,
  
  -- Dates
  started_at TIMESTAMP DEFAULT now(),
  ends_at TIMESTAMP NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  max_members INT DEFAULT 10,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_team_challenges_creator ON team_challenges(creator_id);
CREATE INDEX idx_team_challenges_status ON team_challenges(status);
CREATE INDEX idx_team_challenges_public ON team_challenges(is_public) WHERE is_public = true;

-- ============================================================================
-- 2. TEAM_CHALLENGE_MEMBERS TABLE
-- ============================================================================
-- Junction table: users participating in a team challenge

CREATE TABLE team_challenge_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES team_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Member progress
  current_streak INT DEFAULT 0,
  is_leader BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT now(),
  
  -- Status in challenge
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quit_early', 'completed')),
  
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_members_user ON team_challenge_members(user_id);
CREATE INDEX idx_challenge_members_challenge ON team_challenge_members(challenge_id);

-- ============================================================================
-- 3. ACHIEVEMENTS TABLE (Enhanced)
-- ============================================================================
-- Track all unlocked achievements/badges per user

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Achievement Details
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  
  -- Rarity & Progress
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Unlock Info
  unlocked_at TIMESTAMP DEFAULT now(),
  shown_in_profile BOOLEAN DEFAULT true,
  
  -- For milestone tracking
  milestone_day INT, -- e.g., 7, 30, 100, 365
  
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_milestone ON achievements(milestone_day);

-- ============================================================================
-- 4. ACHIEVEMENT_NOTIFICATIONS TABLE
-- ============================================================================
-- Track achievement notifications (for confetti celebration)

CREATE TABLE achievement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Notification state
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
  should_animate BOOLEAN DEFAULT true, -- Trigger confetti animation
  
  created_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP,
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievement_notif_user ON achievement_notifications(user_id);
CREATE INDEX idx_achievement_notif_status ON achievement_notifications(status);

-- ============================================================================
-- 5. MILESTONE_PROGRESS TABLE
-- ============================================================================
-- Visual tracker for milestone progress (7/30/100/365 days)

CREATE TABLE milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Milestones
  days_7_unlocked BOOLEAN DEFAULT false,
  days_7_unlocked_at TIMESTAMP,
  
  days_30_unlocked BOOLEAN DEFAULT false,
  days_30_unlocked_at TIMESTAMP,
  
  days_100_unlocked BOOLEAN DEFAULT false,
  days_100_unlocked_at TIMESTAMP,
  
  days_365_unlocked BOOLEAN DEFAULT false,
  days_365_unlocked_at TIMESTAMP,
  
  -- Progress to next milestone
  current_streak_days INT DEFAULT 0,
  next_milestone_days INT DEFAULT 7,
  progress_percent INT DEFAULT 0, -- 0-100
  
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_milestone_progress_user ON milestone_progress(user_id);

-- ============================================================================
-- 6. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES - TEAM_CHALLENGES
-- ============================================================================

-- Users can see public challenges and their own challenges
CREATE POLICY "view_public_challenges" ON team_challenges
  FOR SELECT
  USING (is_public = true OR creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can create challenges
CREATE POLICY "create_own_challenge" ON team_challenges
  FOR INSERT
  WITH CHECK (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Only creator can update their challenge
CREATE POLICY "update_own_challenge" ON team_challenges
  FOR UPDATE
  USING (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 8. RLS POLICIES - TEAM_CHALLENGE_MEMBERS
-- ============================================================================

-- Users can see members in challenges they're part of
CREATE POLICY "view_challenge_members" ON team_challenge_members
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR challenge_id IN (
      SELECT id FROM team_challenges WHERE is_public = true
      OR creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
    OR user_id IN (
      SELECT user_id FROM team_challenge_members
      WHERE challenge_id IN (
        SELECT id FROM team_challenges
        WHERE creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
      )
    )
  );

-- Users can join public challenges
CREATE POLICY "join_public_challenge" ON team_challenge_members
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND challenge_id IN (
      SELECT id FROM team_challenges WHERE is_public = true AND status = 'active'
    )
  );

-- Users can update their own membership
CREATE POLICY "update_own_membership" ON team_challenge_members
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 9. RLS POLICIES - ACHIEVEMENTS
-- ============================================================================

-- Users can see their own achievements and others' showcased achievements
CREATE POLICY "view_own_achievements" ON achievements
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR (shown_in_profile = true) -- Public showcase
  );

-- ============================================================================
-- 10. RLS POLICIES - ACHIEVEMENT_NOTIFICATIONS
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY "view_own_notifications" ON achievement_notifications
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- System can insert notifications
CREATE POLICY "system_insert_notifications" ON achievement_notifications
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can update their notification status
CREATE POLICY "update_own_notifications" ON achievement_notifications
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 11. RLS POLICIES - MILESTONE_PROGRESS
-- ============================================================================

-- Users can only see their own progress
CREATE POLICY "view_own_milestone_progress" ON milestone_progress
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- System can update milestone progress
CREATE POLICY "update_own_milestone_progress" ON milestone_progress
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 12. UPDATE USERS TABLE (Add missing gamification columns)
-- ============================================================================

-- These should already exist but ensuring they do:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_points INT DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS total_badges INT DEFAULT 0;

-- Add new profile customization columns for badge showcase
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_badges_on_profile BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_showcase_order TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ============================================================================
-- 13. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Auto-initialize milestone_progress when user is created
CREATE OR REPLACE FUNCTION initialize_milestone_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO milestone_progress (user_id, current_streak_days, next_milestone_days, progress_percent)
  VALUES (NEW.id, 0, 7, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_milestone_progress
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION initialize_milestone_progress();

-- Function: Update milestone progress when streak changes
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_streak IS DISTINCT FROM OLD.current_streak THEN
    UPDATE milestone_progress
    SET
      current_streak_days = NEW.current_streak,
      days_7_unlocked = CASE WHEN NEW.current_streak >= 7 THEN true ELSE days_7_unlocked END,
      days_7_unlocked_at = CASE WHEN NEW.current_streak >= 7 AND days_7_unlocked = false THEN now() ELSE days_7_unlocked_at END,
      days_30_unlocked = CASE WHEN NEW.current_streak >= 30 THEN true ELSE days_30_unlocked END,
      days_30_unlocked_at = CASE WHEN NEW.current_streak >= 30 AND days_30_unlocked = false THEN now() ELSE days_30_unlocked_at END,
      days_100_unlocked = CASE WHEN NEW.current_streak >= 100 THEN true ELSE days_100_unlocked END,
      days_100_unlocked_at = CASE WHEN NEW.current_streak >= 100 AND days_100_unlocked = false THEN now() ELSE days_100_unlocked_at END,
      days_365_unlocked = CASE WHEN NEW.current_streak >= 365 THEN true ELSE days_365_unlocked END,
      days_365_unlocked_at = CASE WHEN NEW.current_streak >= 365 AND days_365_unlocked = false THEN now() ELSE days_365_unlocked_at END,
      next_milestone_days = CASE
        WHEN NEW.current_streak >= 365 THEN 730
        WHEN NEW.current_streak >= 100 THEN 365
        WHEN NEW.current_streak >= 30 THEN 100
        WHEN NEW.current_streak >= 7 THEN 30
        ELSE 7
      END,
      progress_percent = CASE
        WHEN NEW.current_streak >= 365 THEN 100
        WHEN NEW.current_streak >= 100 THEN LEAST(100, (NEW.current_streak * 100) / 365)
        WHEN NEW.current_streak >= 30 THEN LEAST(100, (NEW.current_streak * 100) / 100)
        WHEN NEW.current_streak >= 7 THEN LEAST(100, (NEW.current_streak * 100) / 30)
        ELSE (NEW.current_streak * 100) / 7
      END,
      updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_milestone_progress
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_milestone_progress();

-- ============================================================================
-- 14. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_team_challenges_ends_at ON team_challenges(ends_at);
CREATE INDEX idx_achievements_user_unlocked ON achievements(user_id, unlocked_at DESC);
CREATE INDEX idx_achievement_notif_created ON achievement_notifications(created_at DESC);
