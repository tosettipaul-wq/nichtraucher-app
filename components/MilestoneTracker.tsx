'use client';

import React, { useEffect, useState } from 'react';

interface Milestone {
  days: number;
  label: string;
  icon: string;
  unlocked: boolean;
}

interface MilestoneTrackerProps {
  currentStreak: number;
  className?: string;
}

export default function MilestoneTracker({ currentStreak, className = '' }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nextMilestone, setNextMilestone] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const milestoneData = [
      { days: 7, label: '1 Woche', icon: '🌟', unlocked: currentStreak >= 7 },
      { days: 30, label: '1 Monat', icon: '🏆', unlocked: currentStreak >= 30 },
      { days: 100, label: '100 Tage', icon: '💎', unlocked: currentStreak >= 100 },
      { days: 365, label: '1 Jahr', icon: '👑', unlocked: currentStreak >= 365 },
    ];

    setMilestones(milestoneData);

    const next = milestoneData.find(m => !m.unlocked) || milestoneData[milestoneData.length - 1];
    setNextMilestone(next);

    const progressPercent = Math.min(100, Math.floor((currentStreak / next.days) * 100));
    setProgress(progressPercent);
  }, [currentStreak]);

  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="font-bold text-white">Meilensteine</h2>
      </div>

      {/* Milestone Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {milestones.map((milestone) => (
          <div
            key={milestone.days}
            className={`rounded-lg border p-3 text-center transition-all ${
              milestone.unlocked
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-slate-700/50 bg-slate-800/30'
            }`}
          >
            <div className="text-2xl mb-1">{milestone.icon}</div>
            <p className={`text-xs font-bold ${milestone.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
              {milestone.label}
            </p>
            <p className="text-xs text-slate-600">{milestone.days}T</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {nextMilestone && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">
              Nächster Meilenstein:{' '}
              <span className="font-bold text-teal-400">{nextMilestone.label}</span>
            </p>
            <p className="text-sm font-semibold text-teal-400">{progress}%</p>
          </div>
          <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {Math.max(0, nextMilestone.days - currentStreak)} Tage bis {nextMilestone.label}
          </p>
        </div>
      )}
    </div>
  );
}
