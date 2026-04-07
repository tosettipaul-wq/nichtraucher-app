'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Confetti from 'react-confetti';

interface Badge {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  icon_emoji: string;
  unlock_date: string;
  is_new: boolean;
}

interface AchievementsBadgesProps {
  userId: string;
  totalBadges?: number;
  onNewAchievement?: (badge: Badge) => void;
}

const MILESTONE_GOALS = [
  { emoji: '🥉', name: 'Bronze', days: 7 },
  { emoji: '🥈', name: 'Silber', days: 30 },
  { emoji: '🥇', name: 'Gold', days: 100 },
  { emoji: '💎', name: 'Platin', days: 365 },
];

export default function AchievementsBadges({
  userId,
  totalBadges = 0,
  onNewAchievement,
}: AchievementsBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('achievements')
        .select('id, achievement_type, achievement_name, description, icon_emoji, unlock_date')
        .eq('user_id', userId)
        .order('unlock_date', { ascending: false });

      if (error) throw error;

      const badgesWithNewFlag = (data || []).map((badge: any, idx: number) => ({
        ...badge,
        is_new: idx === 0 && new Date(badge.unlock_date).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      }));

      setBadges(badgesWithNewFlag);

      const freshBadge = badgesWithNewFlag.find((b: Badge) => b.is_new);
      if (freshBadge) {
        setNewBadge(freshBadge);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        onNewAchievement?.(freshBadge);
      }
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1024}
          height={typeof window !== 'undefined' ? window.innerHeight : 768}
          recycle={false}
          numberOfPieces={150}
          gravity={0.8}
        />
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🏆 Achievements
            <span className="text-sm font-normal text-slate-400">({badges.length})</span>
          </h2>
          {newBadge && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30">
              <span className="text-lg">{newBadge.icon_emoji}</span>
              <span className="text-teal-300 text-xs font-bold">Neu!</span>
            </div>
          )}
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🔒</p>
            <p className="text-slate-400 text-sm mb-1">Noch keine Badges freigeschaltet</p>
            <p className="text-slate-500 text-xs">Meistere Meilensteine, um Badges zu verdienen!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`relative rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer border ${
                  badge.is_new
                    ? 'border-teal-500/60 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                    : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                {badge.is_new && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-slate-950 text-[8px] font-black">✓</span>
                  </div>
                )}
                <p className="text-3xl mb-2">{badge.icon_emoji}</p>
                <p className="text-white font-bold text-xs line-clamp-2">{badge.achievement_name}</p>
                <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">{badge.description}</p>
                <p className="text-slate-600 text-[10px] mt-1.5">
                  {new Date(badge.unlock_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Milestone goals */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">🎯 Meilensteine</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MILESTONE_GOALS.map((goal) => {
              const achieved = badges.some((b) => b.achievement_name.toLowerCase().includes(goal.name.toLowerCase()));
              return (
                <div
                  key={goal.name}
                  className={`rounded-xl p-3 text-center border text-xs font-medium ${
                    achieved
                      ? 'border-teal-500/30 bg-teal-500/8 text-teal-300'
                      : 'border-slate-700/60 bg-slate-800/40 text-slate-500'
                  }`}
                >
                  <span className="text-lg block mb-1">{goal.emoji}</span>
                  {achieved ? '✅ ' : '🔒 '}{goal.name}
                  <p className="text-[10px] mt-0.5 opacity-60">{goal.days} Tage</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
