import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get user profile ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch craving events for today
    const { data: cravings, error: cravingError } = await supabase
      .from('craving_events')
      .select('*')
      .eq('user_id', profile.id)
      .gte('timestamp', today.toISOString())
      .lt('timestamp', todayEnd.toISOString());

    if (cravingError) {
      return NextResponse.json(
        { error: cravingError.message },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const totalCravings = cravings?.length || 0;
    const successfulCravings = cravings?.filter((c) => c.response_text === 'success').length || 0;
    const failedCravings = cravings?.filter((c) => c.response_text === 'failed').length || 0;
    const avgIntensity = cravings?.length
      ? Math.round((cravings.reduce((sum, c) => sum + (c.intensity || 0), 0) / cravings.length) * 10) / 10
      : 0;
    const maxIntensity = cravings?.length
      ? Math.max(...cravings.map((c) => c.intensity || 0))
      : 0;

    // All triggers (from array)
    const allTriggers = new Set<string>();
    cravings?.forEach((c) => {
      if (c.trigger && Array.isArray(c.trigger)) {
        c.trigger.forEach((t: string) => allTriggers.add(t));
      }
    });

    const topTrigger = allTriggers.size > 0 ? Array.from(allTriggers)[0] : null;

    // Insert or update summary
    const { data: summary, error: summaryError } = await supabase
      .from('daily_summaries')
      .upsert([
        {
          user_id: profile.id,
          date: today.toISOString().split('T')[0],
          craving_count: totalCravings,
          victory_count: successfulCravings,
          slip_count: failedCravings,
          avg_intensity: avgIntensity,
          max_intensity: maxIntensity,
          top_trigger: topTrigger,
          all_triggers: Array.from(allTriggers),
        },
      ], { onConflict: 'user_id,date' })
      .select()
      .single();

    if (summaryError) {
      return NextResponse.json(
        { error: summaryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: {
        date: today.toISOString().split('T')[0],
        cravingCount: totalCravings,
        victoryCount: successfulCravings,
        slipCount: failedCravings,
        avgIntensity,
        maxIntensity,
        topTrigger,
      },
    });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date'); // YYYY-MM-DD format

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data: summaries, error } = await query.order('date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summaries: summaries || [],
    });
  } catch (error) {
    console.error('Summary fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
