'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  goal_days: number;
  started_at: string;
  ends_at: string;
  status: string;
  memberCount: number;
  daysRemaining: number;
  userStatus?: string;
}

export default function TeamChallenges({ className = '' }: { className?: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    challenge_type: '30_day_streak',
    goal_days: 30,
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await fetch('/api/gamification/team-challenges?limit=10');
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + newChallenge.goal_days);

    try {
      const response = await fetch('/api/gamification/team-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newChallenge,
          ends_at: endDate.toISOString(),
          is_public: true,
        }),
      });

      if (response.ok) {
        setNewChallenge({
          name: '',
          description: '',
          challenge_type: '30_day_streak',
          goal_days: 30,
        });
        setShowCreateForm(false);
        loadChallenges();
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        await supabase
          .from('team_challenge_members')
          .insert({
            challenge_id: challengeId,
            user_id: userData.id,
          });

        loadChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <h2 className="font-bold text-white">Team-Herausforderungen</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 text-xs font-semibold text-teal-300 border border-teal-500/30 rounded-lg hover:border-teal-500/60 hover:bg-teal-500/10 transition-all"
        >
          + Neu
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateChallenge} className="mb-6 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 space-y-3">
          <input
            type="text"
            placeholder="Herausforderungsname"
            value={newChallenge.name}
            onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            required
          />
          <textarea
            placeholder="Beschreibung"
            value={newChallenge.description}
            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            rows={2}
          />
          <select
            value={newChallenge.challenge_type}
            onChange={(e) => setNewChallenge({ ...newChallenge, challenge_type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500/50"
          >
            <option value="7_day_win">7-Tage-Sieg</option>
            <option value="30_day_streak">30-Tage-Streak</option>
            <option value="group_support">Gruppensupport</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-teal-500 text-white font-semibold rounded-lg text-sm hover:bg-teal-600 transition-all"
            >
              Erstellen
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-3 py-2 border border-slate-700/50 text-slate-300 font-semibold rounded-lg text-sm hover:border-slate-700 transition-all"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Challenge List */}
      {challenges.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">Keine aktiven Herausforderungen</p>
          <p className="text-slate-500 text-xs mt-1">Erstelle eine neue Herausforderung, um dein Team zu motivieren!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/50 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{challenge.name}</h3>
                  {challenge.description && (
                    <p className="text-slate-400 text-xs mt-1">{challenge.description}</p>
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-teal-500/20 text-teal-300">
                  {challenge.goal_days}T
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                <span>👥 {challenge.memberCount} Teilnehmer</span>
                <span>⏱️ {Math.max(0, challenge.daysRemaining)} Tage verbleibend</span>
              </div>

              {challenge.userStatus ? (
                <div className="text-xs text-emerald-400 font-semibold">
                  ✓ Du nimmst teil
                </div>
              ) : (
                <button
                  onClick={() => handleJoinChallenge(challenge.id)}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-teal-300 border border-teal-500/30 rounded hover:border-teal-500/60 hover:bg-teal-500/10 transition-all"
                >
                  Beitreten
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
