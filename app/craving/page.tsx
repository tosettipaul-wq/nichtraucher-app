'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

const TRIGGERS = [
  { label: 'Stress', icon: '😤' },
  { label: 'Langeweile', icon: '😑' },
  { label: 'Soziale Situation', icon: '👥' },
  { label: 'Nach Essen', icon: '🍽️' },
  { label: 'Mit Kaffee', icon: '☕' },
  { label: 'Fahrt zur Arbeit', icon: '🚗' },
  { label: 'Arbeitspause', icon: '⏸️' },
  { label: 'Feier/Event', icon: '🎉' },
  { label: 'Sonstiges', icon: '🔮' },
];

const COPING_STRATEGIES = [
  { label: 'Spaziergang', icon: '🚶' },
  { label: 'Wasser trinken', icon: '💧' },
  { label: 'Kaugummi', icon: '🔵' },
  { label: 'Tief atmen', icon: '🫁' },
  { label: 'Mit jemandem reden', icon: '💬' },
  { label: 'Sport', icon: '🏋️' },
  { label: 'Duschen', icon: '🚿' },
  { label: 'Etwas essen', icon: '🍎' },
];

export default function CravingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [trigger, setTrigger] = useState<string>('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [handled_by, setHandledBy] = useState('');
  const [succeeded, setSucceeded] = useState<boolean | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!trigger) {
      setError('Bitte wähle einen Auslöser');
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        setError('Benutzerprofil nicht gefunden');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('craving_events').insert([{
        user_id: userData.id,
        type: 'regular',
        trigger: [trigger],
        intensity,
        duration_minutes: 5,
        emotion: notes ? [notes] : [],
        response: handled_by || null,
        response_text: succeeded === true ? 'success' : succeeded === false ? 'failed' : null,
        timestamp: new Date().toISOString(),
      }]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTrigger('');
        setIntensity(5);
        setNotes('');
        setHandledBy('');
        setSucceeded(null);
        setTimeout(() => router.push('/dashboard'), 1800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  const intensityColor = intensity <= 3 ? 'text-emerald-400' : intensity <= 6 ? 'text-amber-400' : 'text-red-400';
  const intensityLabel = intensity <= 3 ? 'Leicht' : intensity <= 6 ? 'Mittel' : 'Stark';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Zurück
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-base">
              😤
            </div>
            <div>
              <p className="font-bold text-white text-sm">Verlangen Logger</p>
              <p className="text-slate-500 text-xs">Dokumentiere deinen Moment</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-emerald-300 font-bold">Eintrag gespeichert! Weiter zur Übersicht...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-300 text-sm">❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trigger */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
            <label className="block text-sm font-semibold text-white">
              Was hat das Verlangen ausgelöst?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRIGGERS.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTrigger(trigger === label ? '' : label)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    trigger === label
                      ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                      : 'border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="text-lg mb-1">{icon}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Intensität des Verlangens</label>
              <div className="flex items-center gap-2">
                <span className={`font-black text-2xl tabular-nums ${intensityColor}`}>{intensity}</span>
                <span className={`text-xs font-medium ${intensityColor}`}>{intensityLabel}</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Kaum spürbar</span>
              <span>Extremes Verlangen</span>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
            <label className="block text-sm font-semibold text-white">Notizen (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Wie fühlst du dich gerade? Was geht dir durch den Kopf?"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Coping strategy */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
            <label className="block text-sm font-semibold text-white">Wie bist du damit umgegangen?</label>
            <div className="grid grid-cols-4 gap-2">
              {COPING_STRATEGIES.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setHandledBy(handled_by === label ? '' : label)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                    handled_by === label
                      ? 'border-teal-500/60 bg-teal-500/15 text-teal-300'
                      : 'border-slate-700/60 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-base mb-1">{icon}</div>
                  <div className="text-[11px] leading-tight">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Outcome */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
            <label className="block text-sm font-semibold text-white">Verlangen überstanden?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSucceeded(succeeded === true ? null : true)}
                className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  succeeded === true
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700/60 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                ✅ Ja, stark geblieben!
              </button>
              <button
                type="button"
                onClick={() => setSucceeded(succeeded === false ? null : false)}
                className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  succeeded === false
                    ? 'border-red-500/60 bg-red-500/15 text-red-300'
                    : 'border-slate-700/60 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                ❌ Bin schwach geworden
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !trigger}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl font-black text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-teal-500/20"
          >
            {submitting ? 'Wird gespeichert...' : '💾 Eintrag speichern'}
          </button>
        </form>
      </main>
    </div>
  );
}
