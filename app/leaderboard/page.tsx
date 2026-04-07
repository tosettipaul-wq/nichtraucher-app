'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  current_streak: number;
  xp_points: number;
  total_badges: number;
  days_smoke_free: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, current_streak, xp_points, total_badges, quit_date')
        .order('current_streak', { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboard = (data || []).map((u: any) => {
        const quitDate = new Date(u.quit_date);
        const today = new Date();
        const daysSober = Math.floor((today.getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: u.id,
          full_name: u.full_name || 'Anonym',
          current_streak: u.current_streak || daysSober,
          xp_points: u.xp_points || 0,
          total_badges: u.total_badges || 0,
          days_smoke_free: daysSober,
        };
      });

      setEntries(leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const topStreak = entries[0]?.current_streak || 0;
  const avgStreak = entries.length ? Math.round(entries.reduce((s, e) => s + e.current_streak, 0) / entries.length) : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-base">
              🏆
            </div>
            <h1 className="font-black text-white text-base">Leaderboard</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Teilnehmer', value: String(entries.length), icon: '👥', color: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/8' },
            { label: 'Beste Streak', value: `${topStreak}d`, icon: '🔥', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/8' },
            { label: 'Ø Streak', value: `${avgStreak}d`, icon: '⭐', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/8' },
          ].map(({ label, value, icon, color, border, bg }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 text-center`}>
              <p className="text-2xl mb-1">{icon}</p>
              <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-4">🏆</p>
              <p className="text-slate-300 font-semibold">Noch keine Einträge</p>
              <p className="text-slate-500 text-sm mt-2">Schließe das Onboarding ab, um auf dem Leaderboard zu erscheinen</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-[2.5rem_1fr_6rem_6rem_6rem] gap-2 px-5 py-3 border-b border-slate-800/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>Name</div>
                <div className="text-center">Streak</div>
                <div className="text-center hidden sm:block">XP</div>
                <div className="text-center hidden sm:block">Tage</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-800/60">
                {entries.map((entry, idx) => {
                  const isMe = entry.id === currentUserId;
                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[2.5rem_1fr_6rem_6rem_6rem] gap-2 px-5 py-4 items-center transition-all ${
                        isMe
                          ? 'bg-teal-500/8 border-l-2 border-teal-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-lg">
                        {idx < 3 ? MEDALS[idx] : (
                          <span className="text-slate-500 text-sm font-bold tabular-nums">#{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isMe ? 'text-teal-300' : 'text-white'}`}>
                          {entry.full_name}
                          {isMe && <span className="ml-2 text-xs text-teal-400/60">(Du)</span>}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-orange-400 font-black text-sm">🔥 {entry.current_streak}</span>
                      </div>
                      <div className="text-center hidden sm:block">
                        <span className="text-violet-400 font-semibold text-sm">{entry.xp_points}</span>
                      </div>
                      <div className="text-center hidden sm:block">
                        <span className="text-slate-400 text-sm">{entry.days_smoke_free}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <h2 className="font-bold text-white mb-3 text-sm">📋 Wie es funktioniert</h2>
          <div className="space-y-2">
            {[
              ['🔥 Streak', 'Tage ohne Zigaretten zählen'],
              ['⭐ XP', 'Punkte für Verlangen-Einträge & Meilensteine'],
              ['🏆 Badges', 'Abzeichen nach 7, 30, 100, 365 Tagen'],
            ].map(([term, desc]) => (
              <div key={term} className="flex gap-3 text-sm">
                <span className="text-teal-400 font-bold w-20 shrink-0">{term}</span>
                <span className="text-slate-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
