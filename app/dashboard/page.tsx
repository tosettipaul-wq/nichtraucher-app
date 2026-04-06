'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import {
  requestNotificationPermission,
  sendTestNotification,
  scheduleDailyNotification,
} from '@/lib/notification-service';
import StreakWidget from '@/components/StreakWidget';
import AchievementsBadges from '@/components/AchievementsBadges';
import { getLevelFromXP } from '@/lib/gamification-utils';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysSober, setDaysSober] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpLevel, setXpLevel] = useState({ level: 1, nextLevelXP: 500, progressPercent: 0 });
  const [totalBadges, setTotalBadges] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Request notification permission
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        setNotificationsEnabled(true);
        scheduleDailyNotification('20:00'); // 8 PM daily
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Load user profile
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData);

        // Calculate days sober
        const quitDate = new Date(profileData.quit_date);
        const today = new Date();
        const diff = today.getTime() - quitDate.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        setDaysSober(days);

        // Calculate money saved (€0.40 per cigarette)
        const saved = Math.round((profileData.cigs_per_day_before || 0) * 0.4 * days);
        setMoneySaved(saved);

        // Load gamification data
        setStreak(profileData.current_streak || days);
        setTotalBadges(profileData.total_badges || 0);
        const level = getLevelFromXP(profileData.xp_points || 0);
        setXpLevel(level);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-gray-400">Wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-400">Nichtraucher</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Abmelden
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Days Sober */}
          <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-lg shadow-lg p-8 border-l-4 border-teal-400">
            <div className="text-teal-300 text-sm uppercase tracking-wide font-semibold">
              Tage rauchfrei
            </div>
            <div className="mt-2 text-5xl font-bold text-teal-400">{daysSober}</div>
            {profile?.quit_date && (
              <p className="text-teal-200 text-sm mt-3">
                Seit {new Date(profile.quit_date).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>

          {/* Money Saved */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg shadow-lg p-8 border-l-4 border-emerald-400">
            <div className="text-emerald-300 text-sm uppercase tracking-wide font-semibold">
              Geld gespart
            </div>
            <div className="mt-2 text-5xl font-bold text-emerald-400">€{moneySaved}</div>
            <p className="text-emerald-200 text-sm mt-3">
              bei {profile?.cigs_per_day_before} Zigaretten/Tag
            </p>
          </div>

          {/* XP Level */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-lg p-8 border-l-4 border-purple-400">
            <div className="text-purple-300 text-sm uppercase tracking-wide font-semibold">
              ⭐ Level
            </div>
            <div className="mt-2 text-5xl font-bold text-purple-400">{xpLevel.level}</div>
            <div className="mt-3 w-full bg-purple-950 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${xpLevel.progressPercent}%` }}
              />
            </div>
            <p className="text-purple-200 text-xs mt-2">{profile?.xp_points || 0} XP</p>
          </div>
        </div>

        {/* Streak Widget */}
        {profile?.quit_date && (
          <div className="mb-8">
            <StreakWidget quitDate={profile.quit_date} currentStreak={streak} />
          </div>
        )}

        {/* Profile Section */}
        {profile && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Dein Profil</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-gray-400 font-medium">Name:</span>
                <p className="text-gray-200 text-lg">{profile.full_name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Email:</span>
                <p className="text-gray-200 text-lg">{user?.email}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Grund:</span>
                <p className="text-gray-200 text-lg">{profile.motivation || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Status:</span>
                <p className="text-gray-200 text-lg capitalize">
                  {profile.status === 'planning' ? '📅 Vorbereitung' : profile.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {user && (
          <div className="mb-8">
            <AchievementsBadges userId={user.id} totalBadges={totalBadges} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <button
            onClick={() => router.push('/leaderboard')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition border border-gray-700"
          >
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-bold text-white">Leaderboard</h3>
            <p className="text-gray-400 text-sm">Mit Freunden konkurrieren</p>
          </button>

          <button
            onClick={() => router.push('/craving')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition border border-gray-700"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-bold text-white">Craving Eintrag</h3>
            <p className="text-gray-400 text-sm">Dein aktuelles Verlangen</p>
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition border border-gray-700"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-white">Quitter-Buddy Chat</h3>
            <p className="text-gray-400 text-sm">Sprich mit deinem Coach</p>
          </button>

          <button
            onClick={() => router.push('/friends')}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition border border-gray-700"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-bold text-white">Accountability</h3>
            <p className="text-gray-400 text-sm">Freunde einladen</p>
          </button>

          <button
            onClick={() => sendTestNotification()}
            className={`rounded-lg shadow-md p-6 text-left transition border ${
              notificationsEnabled
                ? 'bg-emerald-900 hover:bg-emerald-800 border-emerald-700'
                : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
            }`}
          >
            <div className="text-2xl mb-2">{notificationsEnabled ? '🔔' : '🔕'}</div>
            <h3 className={`font-bold ${notificationsEnabled ? 'text-emerald-300' : 'text-white'}`}>
              {notificationsEnabled ? 'Benachrichtigungen An' : 'Benachrichtigungen Aus'}
            </h3>
            <p className={`text-sm ${notificationsEnabled ? 'text-emerald-200' : 'text-gray-400'}`}>
              {notificationsEnabled ? 'Klick für Test' : 'Zum Aktivieren klicken'}
            </p>
          </button>
        </div>

        {/* Debug */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <details>
            <summary className="text-sm font-medium text-gray-300 cursor-pointer">
              🔧 Debug Info
            </summary>
            <pre className="mt-2 text-xs text-gray-400 overflow-auto bg-gray-900 p-2 rounded">
              {JSON.stringify({ user: user?.email, profile }, null, 2)}
            </pre>
          </details>
        </div>
      </main>
    </div>
  );
}
