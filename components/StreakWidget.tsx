'use client';

import React from 'react';
import { calculateStreak, formatStreak } from '@/lib/gamification-utils';

interface StreakWidgetProps {
  quitDate: string;
  currentStreak: number;
}

export default function StreakWidget({ quitDate, currentStreak }: StreakWidgetProps) {
  const streak = currentStreak || calculateStreak(quitDate);
  const formatted = formatStreak(streak);
  const progress = Math.min(100, (streak % 30) * 3.33);

  const nextMilestone =
    streak < 7 ? { label: '🥉 Bronze', daysLeft: 7 - streak } :
    streak < 30 ? { label: '🥈 Silber', daysLeft: 30 - streak } :
    streak < 100 ? { label: '🥇 Gold', daysLeft: 100 - streak } :
    streak < 365 ? { label: '💎 Platin', daysLeft: 365 - streak } :
    { label: '🎉 Legende!', daysLeft: 0 };

  const flameIntensity = Math.min(5, Math.floor(streak / 10) + 1);

  return (
    <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-6 relative overflow-hidden">
      {/* Decorative flame */}
      <div className="absolute top-4 right-5 text-6xl opacity-10 leading-none select-none">🔥</div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">🔥 Motivations-Streak</p>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(flameIntensity, 5) }).map((_, i) => (
              <span key={i} className="text-base" style={{ animationDelay: `${i * 0.15}s` }}>🔥</span>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <div>
            <p className="text-6xl font-black text-white tabular-nums leading-none">{streak}</p>
            <p className="text-orange-300 text-base font-semibold mt-1">{formatted}</p>
          </div>
          <div className="mb-1">
            <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
              {streak === 0 ? 'Starte heute!' : streak === 1 ? '1. Tag 💪' : `${streak} in Folge!`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Next milestone */}
        <p className="text-orange-300/70 text-sm">
          {nextMilestone.daysLeft > 0
            ? `${nextMilestone.daysLeft} Tag${nextMilestone.daysLeft !== 1 ? 'e' : ''} bis ${nextMilestone.label}`
            : nextMilestone.label
          }
        </p>
      </div>
    </div>
  );
}
