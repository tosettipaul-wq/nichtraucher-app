import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin-only initialization route for gamification schema
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.ADMIN_SECRET_KEY || 'admin-secret';

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Use service role key for schema changes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Execute migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add gamification columns to users
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

        -- Create achievements table
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

        -- Add streak tracking to daily_summaries
        ALTER TABLE daily_summaries 
        ADD COLUMN IF NOT EXISTS streak_maintained BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
        CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id ON daily_summaries(user_id);

        -- Enable RLS
        ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Gamification schema initialized successfully',
      data
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
