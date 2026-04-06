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

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUserId(user.id);

      // Fetch all users with streaks (simulating leaderboard)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, current_streak, xp_points, total_badges, quit_date')
        .order('current_streak', { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboard = (data || []).map((user: any) => {
        const quitDate = new Date(user.quit_date);
        const today = new Date();
        const diffTime = today.getTime() - quitDate.getTime();
        const daysSober = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: user.id,
          full_name: user.full_name || 'Anonym',
          current_streak: user.current_streak || daysSober,
          xp_points: user.xp_points || 0,
          total_badges: user.total_badges || 0,
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

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎖️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Leaderboard wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-400">🏆 Leaderboard</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-lg shadow-lg p-6 border-l-4 border-teal-400">
            <p className="text-teal-300 text-sm uppercase font-semibold">Teilnehmer</p>
            <p className="text-4xl font-bold text-teal-400 mt-2">{entries.length}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-400">
            <p className="text-orange-300 text-sm uppercase font-semibold">🔥 Längste Streak</p>
            <p className="text-4xl font-bold text-orange-400 mt-2">
              {entries.length > 0 ? entries[0].current_streak : 0} Tage
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg shadow-lg p-6 border-l-4 border-emerald-400">
            <p className="text-emerald-300 text-sm uppercase font-semibold">⭐ Durchschnitt</p>
            <p className="text-4xl font-bold text-emerald-400 mt-2">
              {Math.round(
                entries.reduce((sum, e) => sum + e.current_streak, 0) / (entries.length || 1)
              )}{' '}
              Tage
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    🔥 Streak
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    ⭐ XP
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    🏆 Badges
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                    📅 Tage
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isCurrentUser = entry.id === currentUserId;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-700 transition ${
                        isCurrentUser
                          ? 'bg-teal-900 bg-opacity-30 border-teal-600'
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getMedalEmoji(idx + 1)}</span>
                          <span className="text-lg font-bold text-gray-300">#{idx + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${isCurrentUser ? 'text-teal-400' : 'text-white'}`}>
                          {entry.full_name}
                          {isCurrentUser && ' (Du)'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-orange-400 font-bold text-lg">
                          🔥 {entry.current_streak}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-teal-400 font-semibold">⭐ {entry.xp_points}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-emerald-400 font-semibold">🏆 {entry.total_badges}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-gray-300">{entry.days_smoke_free}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg">Keine Leaderboard-Einträge vorhanden</p>
              <p className="text-gray-500 text-sm mt-2">
                Schließen Sie die Onboarding ab, um in der Leaderboard zu erscheinen
              </p>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Wie es funktioniert:</h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex gap-3">
              <span className="text-teal-400 font-bold">1.</span>
              <span>
                <strong>Streak:</strong> Anzahl der Tage ohne Zigaretten. Jeder Tag ohne Rückfall
                zählt!
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 font-bold">2.</span>
              <span>
                <strong>XP:</strong> Verdienen Sie Punkte, indem Sie Verlangen melden und widerstehen.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 font-bold">3.</span>
              <span>
                <strong>Badges:</strong> Erhalten Sie Abzeichen für Meilensteine (7, 30, 100,
                365 Tage)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 font-bold">4.</span>
              <span>
                <strong>Ranking:</strong> Die Leaderboard wird täglich aktualisiert und nach Streak
                sortiert.
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
