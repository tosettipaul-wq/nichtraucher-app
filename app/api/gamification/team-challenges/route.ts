/**
 * GET /api/gamification/team-challenges - List all public challenges
 * POST /api/gamification/team-challenges - Create a new team challenge
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
    const status = searchParams.get('status') || 'active';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user ? 
      (await supabase.from('users').select('id').eq('auth_id', user.id).single()).data?.id 
      : null;

    // Fetch public challenges
    const { data, error } = await supabase
      .from('team_challenges')
      .select(`
        id,
        name,
        description,
        challenge_type,
        goal_days,
        started_at,
        ends_at,
        status,
        is_public,
        max_members,
        creator_id,
        created_at
      `)
      .eq('is_public', true)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch member counts for each challenge
    const challengesWithMembers = await Promise.all(
      (data || []).map(async (challenge: any) => {
        const { count } = await supabase
          .from('team_challenge_members')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);

        const userMembership = currentUserId ? 
          (await supabase
            .from('team_challenge_members')
            .select('status')
            .eq('challenge_id', challenge.id)
            .eq('user_id', currentUserId)
            .single()).data
          : null;

        return {
          ...challenge,
          memberCount: count || 0,
          userStatus: userMembership?.status || null,
          daysRemaining: Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        };
      })
    );

    return NextResponse.json({
      success: true,
      challenges: challengesWithMembers,
      total: challengesWithMembers.length,
    });
  } catch (error) {
    console.error('Team challenges GET error:', error);
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

    const { name, description, challenge_type, goal_days, ends_at, is_public, max_members } = await req.json();

    // Get current user's database ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create challenge
    const { data, error } = await supabase
      .from('team_challenges')
      .insert({
        creator_id: userData.id,
        name,
        description,
        challenge_type,
        goal_days,
        ends_at,
        is_public: is_public || false,
        max_members: max_members || 10,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Add creator as first member
    await supabase
      .from('team_challenge_members')
      .insert({
        challenge_id: data.id,
        user_id: userData.id,
        is_leader: true,
      });

    return NextResponse.json({
      success: true,
      challenge: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Team challenges POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
