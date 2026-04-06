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

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Nicht angemeldet');
        setLoading(false);
        return;
      }

      // Update user profile in Supabase
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

      // Reset onboarding state and redirect
      reset();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Schritt 5 von 5</h1>
        <p className="text-gray-300 text-lg mt-2">Lass dich kennen!</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dein Name
          </label>
          <input
            type="text"
            value={data.full_name || ''}
            onChange={(e) => setData('full_name', e.target.value)}
            placeholder="z.B. Paul"
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500"
            disabled={loading}
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
          <h3 className="font-bold text-white">Deine Quitter-Zusammenfassung:</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Grund:</span>
              <span className="font-medium text-gray-200 ml-2">{data.reason}</span>
            </p>
            <p>
              <span className="text-gray-400">Quit-Datum:</span>
              <span className="font-medium text-gray-200 ml-2">{data.quit_date}</span>
            </p>
            <p>
              <span className="text-gray-400">Zigaretten/Tag:</span>
              <span className="font-medium text-gray-200 ml-2">{data.cigs_per_day}</span>
            </p>
            <p>
              <span className="text-gray-400">Auslöser:</span>
              <span className="font-medium text-gray-200 ml-2">
                {(data.triggers || []).join(', ')}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded-lg p-3">
            <p className="text-red-200 text-sm">❌ {error}</p>
          </div>
        )}

        <div className="bg-emerald-900 bg-opacity-40 border border-emerald-700 rounded-lg p-4">
          <p className="text-emerald-300 font-medium">🚀 Du bist bereit!</p>
          <p className="text-emerald-200 text-sm mt-1">
            Deine Daten werden jetzt gespeichert und du bekommst Zugang zu deinem persönlichen
            Quitter-Dashboard.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={() => router.push('/onboarding/step-4')}
          className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
          disabled={loading}
        >
          ← Zurück
        </button>
        <button
          onClick={handleFinish}
          disabled={loading}
          className="flex-1 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition font-medium disabled:opacity-50"
        >
          {loading ? 'Wird gespeichert...' : '🎯 Starten!'}
        </button>
      </div>
    </div>
  );
}
