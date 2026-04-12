/**
 * GET /api/gamification/achievement-notifications - Get unread achievement notifications
 * POST /api/gamification/achievement-notifications/:id - Mark as read/dismissed
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

    // Get current user's ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    // Get unread achievement notifications
    const { data, error } = await supabase
      .from('achievement_notifications')
      .select(`
        id,
        user_id,
        achievement_id,
        status,
        should_animate,
        created_at,
        achievements (
          id,
          achievement_name,
          description,
          icon_emoji,
          rarity,
          milestone_day
        )
      `)
      .eq('user_id', userData?.id)
      .eq('status', 'unread')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
      unreadCount: (data || []).length,
    });
  } catch (error) {
    console.error('Achievement notifications GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notification_id, status } = await req.json(); // status: 'read' | 'dismissed'

    // Get current user's ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    // Update notification status
    const { data, error } = await supabase
      .from('achievement_notifications')
      .update({
        status,
        read_at: status === 'read' ? new Date().toISOString() : null,
      })
      .eq('id', notification_id)
      .eq('user_id', userData?.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error('Achievement notifications POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
