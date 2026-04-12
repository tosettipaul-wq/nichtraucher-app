'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import MilestoneTracker from '@/components/MilestoneTracker';

interface Badge {
  id: string;
  achievement_name: string;
  description: string;
  icon_emoji: string;
  rarity: string;
  milestone_day?: number;
  unlocked_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysSober, setDaysSober] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        const quitDate = new Date(profileData.quit_date);
        const today = new Date();
        const diff = today.getTime() - quitDate.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

        setDaysSober(days);
        const saved = Math.round((profileData.cigs_per_day_before || 0) * 0.4 * days);
        setMoneySaved(saved);
        setStreak(profileData.current_streak || days);

        // Load badges
        const { data: badgesData } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('shown_in_profile', true)
          .order('unlocked_at', { ascending: false });

        setBadges(badgesData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

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
          <p className="text-slate-400 text-sm">Profil wird geladen...</p>
        </div>
      </div>
    );
  }

  const rarityColors: Record<string, string> = {
    common: 'border-blue-500/30 bg-blue-500/10',
    rare: 'border-purple-500/30 bg-purple-500/10',
    epic: 'border-amber-500/30 bg-amber-500/10',
    legendary: 'border-orange-500/30 bg-orange-500/10',
  };

  const rarityTextColors: Record<string, string> = {
    common: 'text-blue-400',
    rare: 'text-purple-400',
    epic: 'text-amber-400',
    legendary: 'text-orange-400',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-base">
              👤
            </div>
            <h1 className="font-black text-white text-base">Profil</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Abmelden
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                {profile?.full_name || 'Willkommen'}
              </h1>
              <p className="text-slate-400 text-sm">
                Mitglied seit {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
              </p>
            </div>
            <div className="text-5xl">🎯</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Tage Rauchfrei', value: daysSober, icon: '🚭', color: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/10' },
              { label: 'Aktuelle Streak', value: `${streak}T`, icon: '🔥', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
              { label: 'Geld gespart', value: `€${moneySaved}`, icon: '💰', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
            ].map(({ label, value, icon, color, border, bg }) => (
              <div key={label} className={`rounded-xl border ${border} ${bg} p-4 text-center`}>
                <p className="text-3xl mb-1">{icon}</p>
                <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
                <p className="text-slate-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Tracker */}
        <MilestoneTracker currentStreak={streak} />

        {/* Badge Showcase */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏅</span>
            <h2 className="font-bold text-white">Abzeichen-Vitrine</h2>
            <span className="ml-auto text-sm text-slate-500">
              {badges.length} {badges.length === 1 ? 'Abzeichen' : 'Abzeichen'}
            </span>
          </div>

          {badges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-slate-400 font-semibold">Keine Abzeichen noch freigegeben</p>
              <p className="text-slate-500 text-sm mt-2">
                Erreiche deine Meilensteine (7, 30, 100, 365 Tage) um Abzeichen freizuschalten!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-lg border ${rarityColors[badge.rarity] || rarityColors['common']} p-4 text-center transition-all hover:scale-105`}
                >
                  <div className="text-4xl mb-2">{badge.icon_emoji}</div>
                  <h3 className={`font-bold text-sm ${rarityTextColors[badge.rarity] || rarityTextColors['common']}`}>
                    {badge.achievement_name}
                  </h3>
                  {badge.description && (
                    <p className="text-slate-400 text-xs mt-1">
                      {badge.description}
                    </p>
                  )}
                  {badge.milestone_day && (
                    <p className="text-slate-500 text-xs font-semibold mt-2">
                      Tag {badge.milestone_day}
                    </p>
                  )}
                  <p className="text-slate-600 text-xs mt-2">
                    {new Date(badge.unlocked_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
          <h2 className="font-bold text-white mb-4">⚙️ Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
              <span className="text-slate-400 text-sm">Email-Adresse</span>
              <span className="text-white font-semibold text-sm">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 text-sm">Benachrichtigungen</span>
              <span className="text-teal-400 font-semibold text-sm">Aktiviert</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
