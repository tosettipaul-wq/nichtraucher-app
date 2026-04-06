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

      // Mark first achievement as new
      const badgesWithNewFlag = (data || []).map((badge: any, idx: number) => ({
        ...badge,
        is_new: idx === 0,
      }));

      setBadges(badgesWithNewFlag);

      // Trigger confetti if we got a new badge
      if (badgesWithNewFlag.length > 0 && badgesWithNewFlag[0].is_new) {
        setNewBadge(badgesWithNewFlag[0]);
        setShowConfetti(true);
        onNewAchievement?.(badgesWithNewFlag[0]);
        
        // Auto-hide confetti after 3s
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">Badges werden geladen...</p>
      </div>
    );
  }

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

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🏆 Achievements ({badges.length})
          </h2>
          {newBadge && (
            <div className="animate-bounce text-center">
              <p className="text-teal-400 font-bold text-sm">✨ Neu!</p>
              <p className="text-2xl">{newBadge.icon_emoji}</p>
            </div>
          )}
        </div>

        {badges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg mb-2">Noch keine Badges freigeschaltet</p>
            <p className="text-gray-500 text-sm">
              Vermeide Verlangen und erreiche Meilensteine, um Badges zu erhalten!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`relative bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition transform hover:scale-105 cursor-pointer border-2 ${
                  badge.is_new ? 'border-teal-400 shadow-lg shadow-teal-500/50' : 'border-gray-600'
                }`}
              >
                {/* Glow effect for new badges */}
                {badge.is_new && (
                  <div className="absolute inset-0 bg-teal-400 opacity-10 rounded-lg animate-pulse" />
                )}

                <div className="relative z-10">
                  <p className="text-4xl mb-2">{badge.icon_emoji}</p>
                  <p className="text-white font-bold text-sm line-clamp-2">
                    {badge.achievement_name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(badge.unlock_date).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievement goals */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">🎯 Nächste Ziele:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { emoji: '🥉', name: 'Bronze Badge', days: 7 },
              { emoji: '🥈', name: 'Silver Badge', days: 30 },
              { emoji: '🥇', name: 'Gold Badge', days: 100 },
              { emoji: '💎', name: 'Platinum Badge', days: 365 },
            ].map((goal) => {
              const achieved = badges.some((b) =>
                b.achievement_name.includes(goal.name)
              );
              return (
                <div
                  key={goal.name}
                  className={`p-3 rounded-lg ${
                    achieved
                      ? 'bg-teal-900 border border-teal-600'
                      : 'bg-gray-700 border border-gray-600'
                  }`}
                >
                  <p className="text-sm">
                    {achieved ? '✅' : '🔒'} {goal.emoji} {goal.name} ({goal.days}d)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
