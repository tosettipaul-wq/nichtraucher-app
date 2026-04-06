import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/gamification/sync-streak
 * Syncs streak, XP, and achievements for current user
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id required' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate streak
    const quitDate = new Date(user.quit_date);
    const today = new Date();
    quitDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - quitDate.getTime();
    const streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Get XP from daily summaries
    const { data: summaries } = await supabase
      .from('daily_summaries')
      .select('xp_earned')
      .eq('user_id', user_id);

    const xp = (summaries || []).reduce((sum: number, s: any) => sum + (s.xp_earned || 0), 0);

    // Count achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', user_id);

    const badgeCount = achievements?.length || 0;

    // Update user with new values
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        current_streak: streak,
        xp_points: xp,
        total_badges: badgeCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Check for new achievement unlocks
    const newAchievements = [];

    // 7-day streak
    if (streak >= 7 && badgeCount === 0) {
      const { error: insertError } = await supabase
        .from('achievements')
        .insert({
          user_id,
          achievement_type: 'streak_7',
          achievement_name: '🥉 Bronze Badge',
          description: '7 Tage Streak erreicht',
          icon_emoji: '🥉',
        })
        .select()
        .single();
      
      if (!insertError) newAchievements.push('streak_7');
    }

    // 30-day streak
    if (streak >= 30 && badgeCount < 2) {
      const exists = achievements?.some((a: any) => a.achievement_type === 'streak_30');
      if (!exists) {
        await supabase
          .from('achievements')
          .insert({
            user_id,
            achievement_type: 'streak_30',
            achievement_name: '🥈 Silver Badge',
            description: '30 Tage Streak erreicht',
            icon_emoji: '🥈',
          });
        newAchievements.push('streak_30');
      }
    }

    // 100-day streak
    if (streak >= 100 && badgeCount < 3) {
      const exists = achievements?.some((a: any) => a.achievement_type === 'streak_100');
      if (!exists) {
        await supabase
          .from('achievements')
          .insert({
            user_id,
            achievement_type: 'streak_100',
            achievement_name: '🥇 Gold Badge',
            description: '100 Tage Streak erreicht',
            icon_emoji: '🥇',
          });
        newAchievements.push('streak_100');
      }
    }

    // 365-day streak
    if (streak >= 365 && badgeCount < 4) {
      const exists = achievements?.some((a: any) => a.achievement_type === 'streak_365');
      if (!exists) {
        await supabase
          .from('achievements')
          .insert({
            user_id,
            achievement_type: 'streak_365',
            achievement_name: '💎 Platinum Badge',
            description: '1 Jahr rauchfrei!',
            icon_emoji: '💎',
          });
        newAchievements.push('streak_365');
      }
    }

    return NextResponse.json({
      success: true,
      user_id,
      streak,
      xp,
      badges: badgeCount + newAchievements.length,
      newAchievements,
    });
  } catch (error) {
    console.error('Gamification sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
