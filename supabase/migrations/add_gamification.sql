-- Phase 3: Gamification (Streaks + Achievements + Leaderboard + XP)

-- 1. ALTER users table: Add gamification columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

-- 2. CREATE achievements table (new)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT DEFAULT '🏆',
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_type)
);

-- 3. ALTER daily_summaries: Add streak tracking
ALTER TABLE daily_summaries 
ADD COLUMN IF NOT EXISTS streak_maintained BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- 4. CREATE leaderboard view (materialized view for performance)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  u.id,
  u.auth_id,
  u.full_name,
  u.quit_date,
  u.current_streak,
  u.total_badges,
  u.xp_points,
  EXTRACT(DAY FROM (NOW() - u.quit_date::TIMESTAMP WITH TIME ZONE)) AS days_smoke_free,
  ROW_NUMBER() OVER (ORDER BY u.current_streak DESC, u.days_smoke_free DESC) AS rank
FROM users u
WHERE u.quit_date IS NOT NULL
ORDER BY u.current_streak DESC;

-- 5. INDEX for performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id ON daily_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(created_date);

-- 6. Enable RLS on achievements table
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own achievements"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 7. Helper function: Calculate current streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_quit_date DATE;
  v_current_date DATE;
BEGIN
  -- Get user's quit date
  SELECT DATE(quit_date) INTO v_quit_date
  FROM users
  WHERE id = p_user_id;
  
  IF v_quit_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- If quit_date is today or future, streak = 0
  IF v_quit_date >= CURRENT_DATE THEN
    RETURN 0;
  END IF;
  
  -- Calculate streak: consecutive days from quit_date with no slips
  -- A slip is marked in daily_summaries as streak_maintained = FALSE
  SELECT COUNT(*)::INTEGER INTO v_streak
  FROM generate_series(v_quit_date, CURRENT_DATE - 1, '1 day'::INTERVAL) AS series_date
  WHERE NOT EXISTS (
    SELECT 1 FROM daily_summaries
    WHERE user_id = p_user_id
      AND created_date = DATE(series_date)
      AND streak_maintained = FALSE
  );
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Helper function: Unlock achievements
CREATE OR REPLACE FUNCTION unlock_achievements(p_user_id UUID, p_streak INTEGER)
RETURNS TABLE (achievement_type TEXT, achievement_name TEXT) AS $$
DECLARE
  v_existing_count INTEGER;
BEGIN
  -- 7-day streak → Bronze
  IF p_streak >= 7 THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM achievements
    WHERE user_id = p_user_id AND achievement_type = 'streak_7';
    
    IF v_existing_count = 0 THEN
      INSERT INTO achievements (user_id, achievement_type, achievement_name, description, icon_emoji)
      VALUES (p_user_id, 'streak_7', '🥉 Bronze Badge', '7 Tage Streak erreicht', '🥉');
      RETURN QUERY SELECT 'streak_7'::TEXT, '🥉 Bronze Badge'::TEXT;
    END IF;
  END IF;

  -- 30-day streak → Silver
  IF p_streak >= 30 THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM achievements
    WHERE user_id = p_user_id AND achievement_type = 'streak_30';
    
    IF v_existing_count = 0 THEN
      INSERT INTO achievements (user_id, achievement_type, achievement_name, description, icon_emoji)
      VALUES (p_user_id, 'streak_30', '🥈 Silver Badge', '30 Tage Streak erreicht', '🥈');
      RETURN QUERY SELECT 'streak_30'::TEXT, '🥈 Silver Badge'::TEXT;
    END IF;
  END IF;

  -- 100-day streak → Gold
  IF p_streak >= 100 THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM achievements
    WHERE user_id = p_user_id AND achievement_type = 'streak_100';
    
    IF v_existing_count = 0 THEN
      INSERT INTO achievements (user_id, achievement_type, achievement_name, description, icon_emoji)
      VALUES (p_user_id, 'streak_100', '🥇 Gold Badge', '100 Tage Streak erreicht', '🥇');
      RETURN QUERY SELECT 'streak_100'::TEXT, '🥇 Gold Badge'::TEXT;
    END IF;
  END IF;

  -- 365-day streak → Platinum
  IF p_streak >= 365 THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM achievements
    WHERE user_id = p_user_id AND achievement_type = 'streak_365';
    
    IF v_existing_count = 0 THEN
      INSERT INTO achievements (user_id, achievement_type, achievement_name, description, icon_emoji)
      VALUES (p_user_id, 'streak_365', '💎 Platinum Badge', '1 Jahr rauchfrei!', '💎');
      RETURN QUERY SELECT 'streak_365'::TEXT, '💎 Platinum Badge'::TEXT;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Helper function: Sync streak + XP to users table
CREATE OR REPLACE FUNCTION sync_streak_and_xp(p_user_id UUID)
RETURNS TABLE (new_streak INTEGER, new_xp INTEGER, new_badges INTEGER) AS $$
DECLARE
  v_streak INTEGER;
  v_xp INTEGER;
  v_badges INTEGER;
BEGIN
  -- Calculate current streak
  SELECT calculate_streak(p_user_id) INTO v_streak;
  
  -- Calculate XP from daily_summaries
  SELECT COALESCE(SUM(xp_earned), 0)::INTEGER INTO v_xp
  FROM daily_summaries
  WHERE user_id = p_user_id;
  
  -- Count unlocked achievements
  SELECT COUNT(*)::INTEGER INTO v_badges
  FROM achievements
  WHERE user_id = p_user_id;
  
  -- Update users table
  UPDATE users
  SET current_streak = v_streak,
      xp_points = v_xp,
      total_badges = v_badges,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Unlock new achievements based on streak
  PERFORM unlock_achievements(p_user_id, v_streak);
  
  -- Re-count badges after unlocking
  SELECT COUNT(*)::INTEGER INTO v_badges
  FROM achievements
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT v_streak, v_xp, v_badges;
END;
$$ LANGUAGE plpgsql;
