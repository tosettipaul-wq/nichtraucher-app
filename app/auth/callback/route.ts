import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    // Redirect to next page (usually dashboard)
    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_failed', request.url)
    );
  }
}
