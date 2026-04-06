'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface CravingEntry {
  trigger: string;
  intensity: number;
  notes: string;
  handled_by: string;
}

const TRIGGERS = [
  'Stress',
  'Langeweile',
  'Soziale Situation',
  'Nach Essen',
  'Mit Kaffee',
  'Fahrt zur Arbeit',
  'Arbeitspause',
  'Feier/Event',
  'Sonstiges',
];

const COPING_STRATEGIES = [
  'Spaziergang',
  'Wasser trinken',
  'Kaugummi',
  'Tief atmen',
  'Mit jemandem reden',
  'Sport',
  'Duschen',
  'Etwas essen',
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      // Get user_id from database
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

      const { error: insertError } = await supabase.from('craving_events').insert([
        {
          user_id: userData.id,
          type: 'regular',
          trigger: [trigger],
          intensity,
          duration_minutes: 5,
          emotion: notes ? [notes] : [],
          response: handled_by || null,
          response_text: succeeded === true ? 'success' : succeeded === false ? 'failed' : null,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTrigger('');
        setIntensity(5);
        setNotes('');
        setHandledBy('');
        setSucceeded(null);

        // Auto-redirect after 2s
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-gray-400">Wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Verlangen Logger</h1>
            <p className="text-gray-400 text-sm mt-2">Dokumentiere dein Verlangen und wie du damit umgegangen bist</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            ← Zurück
          </button>
        </div>

        {success && (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-4 mb-6">
            <p className="text-emerald-100 font-medium">✅ Eintrag gespeichert!</p>
            <p className="text-emerald-200 text-sm mt-1">Wird zum Dashboard zurückgeleitet...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-100 font-medium">❌ Fehler</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-6">
          {/* Trigger Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Was hat das Verlangen ausgelöst?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TRIGGERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrigger(t)}
                  className={`p-3 rounded-lg border transition text-sm font-medium ${
                    trigger === t
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-teal-500 hover:bg-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Intensität des Verlangens: <span className="text-teal-400">{intensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Leicht</span>
              <span>Extremes Verlangen</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Notizen (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Beschreibe deine Gedanken und Gefühle..."
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500 resize-none"
              rows={4}
            />
          </div>

          {/* Coping Strategy */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Wie bin du damit umgegangen? (optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COPING_STRATEGIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHandledBy(handled_by === s ? '' : s)}
                  className={`p-2 rounded-lg border transition text-sm font-medium ${
                    handled_by === s
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-emerald-500 hover:bg-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Verlangen überstanden?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSucceeded(true)}
                className={`flex-1 p-3 rounded-lg border transition font-medium ${
                  succeeded === true
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-emerald-500 hover:bg-gray-600'
                }`}
              >
                ✅ Ja, ich habe nicht geraucht!
              </button>
              <button
                type="button"
                onClick={() => setSucceeded(false)}
                className={`flex-1 p-3 rounded-lg border transition font-medium ${
                  succeeded === false
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-red-500 hover:bg-gray-600'
                }`}
              >
                ❌ Nein, ich bin schwach geworden
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !trigger}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-8"
          >
            {submitting ? 'Wird gespeichert...' : '💾 Eintrag speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
