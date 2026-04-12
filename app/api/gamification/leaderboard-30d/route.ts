/**
 * GET /api/gamification/leaderboard-30d
 * Returns top performers in the last 30 days (friend competition)
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's ID
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    // Get leaderboard filtered to active users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, current_streak, xp_points, total_badges, quit_date, updated_at')
      .gt('updated_at', thirtyDaysAgo.toISOString())
      .order('current_streak', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const leaderboard = (data || []).map((user: any, idx: number) => ({
      rank: offset + idx + 1,
      id: user.id,
      name: user.full_name || 'Anonym',
      streak: user.current_streak || 0,
      xp: user.xp_points || 0,
      badges: user.total_badges || 0,
      isCurrentUser: currentUser?.id === user.id,
      lastActive: user.updated_at,
    }));

    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('updated_at', thirtyDaysAgo.toISOString());

    return NextResponse.json({
      success: true,
      leaderboard,
      totalCount: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Leaderboard 30d error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
