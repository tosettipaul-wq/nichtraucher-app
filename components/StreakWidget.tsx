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

  // Flame animation based on streak
  const flameIntensity = Math.min(5, Math.floor(streak / 10) + 1);
  
  return (
    <div className="relative bg-gradient-to-br from-orange-900 to-red-900 rounded-lg shadow-lg p-8 border-l-4 border-orange-400 overflow-hidden">
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 bg-orange-500 opacity-0 animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      
      <div className="relative z-10">
        {/* Fire emojis cascade animation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-orange-300 text-sm uppercase tracking-wide font-semibold">
            🔥 Motivations-Streak
          </h3>
          <div className="flex gap-1 animate-bounce" style={{ animationDuration: '2s' }}>
            {Array.from({ length: Math.min(flameIntensity, 3) }).map((_, i) => (
              <span key={i} className="text-2xl" style={{ animationDelay: `${i * 0.1}s` }}>
                🔥
              </span>
            ))}
          </div>
        </div>

        {/* Main streak display */}
        <div className="mb-4">
          <div className="text-6xl font-black text-orange-300 leading-none">
            {streak}
          </div>
          <p className="text-orange-200 text-lg font-medium mt-2">
            {formatted} ohne Pause
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-orange-950 rounded-full h-2 overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (streak % 30) * 3.33)}%` }}
          />
        </div>

        {/* Milestone text */}
        <p className="text-orange-200 text-sm">
          {streak < 7 && `${7 - streak} Tage bis 🥉 Bronze Badge`}
          {streak >= 7 && streak < 30 && `${30 - streak} Tage bis 🥈 Silver Badge`}
          {streak >= 30 && streak < 100 && `${100 - streak} Tage bis 🥇 Gold Badge`}
          {streak >= 100 && streak < 365 && `${365 - streak} Tage bis 💎 Platinum Badge`}
          {streak >= 365 && '🎉 Ein ganzes Jahr! Du bist eine Legende!'}
        </p>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">
        🔥
      </div>
    </div>
  );
}
