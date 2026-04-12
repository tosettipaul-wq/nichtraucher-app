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
import MilestoneTracker from '@/components/MilestoneTracker';
import TeamChallenges from '@/components/TeamChallenges';
import AchievementNotifications from '@/components/AchievementNotifications';
import { getLevelFromXP } from '@/lib/gamification-utils';

const QUICK_ACTIONS = [
  { icon: '🏆', label: 'Leaderboard', sub: 'Rangliste', href: '/leaderboard' },
  { icon: '😤', label: 'Craving', sub: 'Verlangen loggen', href: '/craving' },
  { icon: '🤖', label: 'KI-Coach', sub: 'Quitter-Buddy', href: '/chat' },
  { icon: '👥', label: 'Freunde', sub: 'Accountability', href: '/friends' },
  { icon: '👤', label: 'Profil', sub: 'Abzeichen', href: '/profile' },
];

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

      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        setNotificationsEnabled(true);
        scheduleDailyNotification('20:00');
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData);
        const quitDate = new Date(profileData.quit_date);
        const today = new Date();
        const diff = today.getTime() - quitDate.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        setDaysSober(days);
        const saved = Math.round((profileData.cigs_per_day_before || 0) * 0.4 * days);
        setMoneySaved(saved);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Dashboard lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-base shadow-lg shadow-teal-500/20">
              🚭
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Nichtraucher<span className="text-teal-400">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {profile?.full_name && (
              <span className="text-slate-400 text-sm hidden sm:inline">Hey, {profile.full_name}!</span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-200 transition-all"
            >
              Abmelden
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Days Sober */}
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-teal-600/5 p-6 relative overflow-hidden">
            <div className="absolute top-3 right-4 text-teal-500/20 text-5xl font-black">🚭</div>
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-widest mb-2">Tage rauchfrei</p>
            <p className="text-5xl font-black text-white tabular-nums mb-1">{daysSober}</p>
            {profile?.quit_date && (
              <p className="text-teal-400/60 text-xs">
                seit {new Date(profile.quit_date).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>

          {/* Money Saved */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 relative overflow-hidden">
            <div className="absolute top-3 right-4 text-emerald-500/20 text-5xl font-black">€</div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">Geld gespart</p>
            <p className="text-5xl font-black text-white tabular-nums mb-1">€{moneySaved}</p>
            <p className="text-emerald-400/60 text-xs">
              {profile?.cigs_per_day_before} Zig/Tag × €0,40
            </p>
          </div>

          {/* XP Level */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-6 relative overflow-hidden">
            <div className="absolute top-3 right-4 text-violet-500/20 text-5xl font-black">⭐</div>
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-2">Level</p>
            <p className="text-5xl font-black text-white tabular-nums mb-2">{xpLevel.level}</p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${xpLevel.progressPercent}%` }}
              />
            </div>
            <p className="text-violet-400/60 text-xs mt-1">{profile?.xp_points || 0} XP</p>
          </div>
        </div>

        {/* Streak Widget */}
        {profile?.quit_date && (
          <StreakWidget quitDate={profile.quit_date} currentStreak={streak} />
        )}

        {/* Achievement Notifications */}
        <AchievementNotifications />

        {/* Milestone Tracker */}
        <MilestoneTracker currentStreak={streak} />

        {/* Team Challenges */}
        <TeamChallenges />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map(({ icon, label, sub, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-900 p-5 text-left transition-all hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5 group"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <p className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        {/* Notification toggle */}
        <button
          onClick={() => sendTestNotification()}
          className={`w-full rounded-2xl border p-4 flex items-center gap-4 transition-all ${
            notificationsEnabled
              ? 'border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12'
              : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600'
          }`}
        >
          <span className="text-2xl">{notificationsEnabled ? '🔔' : '🔕'}</span>
          <div className="text-left">
            <p className={`font-semibold text-sm ${notificationsEnabled ? 'text-emerald-300' : 'text-white'}`}>
              {notificationsEnabled ? 'Tägliche Erinnerungen aktiv' : 'Benachrichtigungen aktivieren'}
            </p>
            <p className={`text-xs mt-0.5 ${notificationsEnabled ? 'text-emerald-400/60' : 'text-slate-500'}`}>
              {notificationsEnabled ? '20:00 Uhr täglich — Klick für Test' : 'Jeden Abend um 20:00 Uhr'}
            </p>
          </div>
        </button>

        {/* Profile summary */}
        {profile && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
            <h2 className="text-lg font-bold text-white mb-4">👤 Profil</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Name', value: profile.full_name || '—' },
                { label: 'E-Mail', value: user?.email },
                { label: 'Motivation', value: profile.motivation || '—' },
                { label: 'Status', value: profile.status === 'planning' ? '📅 Vorbereitung' : profile.status || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-800/60 p-3">
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-slate-200 text-sm font-medium truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {user && (
          <AchievementsBadges userId={user.id} totalBadges={totalBadges} />
        )}
      </main>
    </div>
  );
}
