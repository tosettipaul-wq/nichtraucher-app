'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function Step5Page() {
  const router = useRouter();
  const { data, setData, reset } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!data.full_name) {
      alert('Bitte gib deinen Namen ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Nicht angemeldet');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          quit_date: data.quit_date,
          cigs_per_day_before: data.cigs_per_day,
          motivation: data.reason,
          status: 'planning',
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      reset();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="h-1 flex-1 rounded-full bg-teal-500" />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-wide mb-2">Schritt 5 von 5 — Fast geschafft!</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Wie heißt du?</h1>
        <p className="text-slate-400 mt-2">Dein persönliches Profil wird eingerichtet.</p>
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          👤 Dein Vorname
        </label>
        <input
          type="text"
          value={data.full_name || ''}
          onChange={(e) => setData('full_name', e.target.value)}
          placeholder="z.B. Paul"
          className="w-full px-4 py-4 text-xl font-semibold rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
          disabled={loading}
        />
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 space-y-3">
        <h3 className="font-bold text-white text-sm uppercase tracking-wide">📋 Deine Zusammenfassung</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Motivation', value: data.reason },
            { label: 'Quit-Datum', value: data.quit_date ? new Date(data.quit_date + 'T12:00:00').toLocaleDateString('de-DE') : '—' },
            { label: 'Zigaretten/Tag', value: data.cigs_per_day ? `${data.cigs_per_day} Stück` : '—' },
            { label: 'Auslöser', value: (data.triggers || []).slice(0, 3).join(', ') || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-slate-800/80 last:border-0">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className="text-slate-200 text-sm font-medium text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ready CTA */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-5">
        <p className="text-emerald-300 font-bold mb-1">🚀 Du bist bereit!</p>
        <p className="text-emerald-400/70 text-sm leading-relaxed">
          Dein persönliches Dashboard mit KI-Coach, Streak-Tracker und Gamification wartet auf dich.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-300 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/onboarding/step-4')}
          className="px-5 py-3 text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-medium"
          disabled={loading}
        >
          ← Zurück
        </button>
        <button
          onClick={handleFinish}
          disabled={loading || !data.full_name}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all font-black disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-teal-500/25 text-lg"
        >
          {loading ? 'Wird gespeichert...' : '🎯 Rauchfrei starten!'}
        </button>
      </div>
    </div>
  );
}
