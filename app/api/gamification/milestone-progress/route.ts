/**
 * GET /api/gamification/milestone-progress
 * Returns visual milestone progress for current user (7/30/100/365 days)
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const { data: userData } = await supabase
      .from('users')
      .select('id, current_streak, quit_date')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get milestone progress
    const { data: milestoneData, error } = await supabase
      .from('milestone_progress')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error is OK
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Calculate current progress manually if not in DB
    const currentStreak = userData.current_streak || 0;
    const milestones = [
      { days: 7, label: '1 Woche', icon: '🌟', unlocked: currentStreak >= 7 },
      { days: 30, label: '1 Monat', icon: '🏆', unlocked: currentStreak >= 30 },
      { days: 100, label: '100 Tage', icon: '💎', unlocked: currentStreak >= 100 },
      { days: 365, label: '1 Jahr', icon: '👑', unlocked: currentStreak >= 365 },
    ];

    // Find next milestone
    const nextMilestone = milestones.find(m => !m.unlocked) || milestones[milestones.length - 1];
    const progressPercent = Math.min(100, Math.floor((currentStreak / nextMilestone.days) * 100));

    return NextResponse.json({
      success: true,
      currentStreak,
      nextMilestone: {
        days: nextMilestone.days,
        label: nextMilestone.label,
        daysRemaining: Math.max(0, nextMilestone.days - currentStreak),
        progressPercent,
      },
      milestones,
      milestoneProgress: milestoneData || {
        current_streak_days: currentStreak,
        days_7_unlocked: currentStreak >= 7,
        days_30_unlocked: currentStreak >= 30,
        days_100_unlocked: currentStreak >= 100,
        days_365_unlocked: currentStreak >= 365,
        progress_percent: progressPercent,
      },
    });
  } catch (error) {
    console.error('Milestone progress error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
