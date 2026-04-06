'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nichtraucher</h1>
          <p className="text-gray-300 mt-2">Dein Weg zur rauchfreien Zukunft</p>
        </div>

        {success ? (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-4">
            <p className="text-emerald-100 font-medium">✅ Magischer Link versendet!</p>
            <p className="text-emerald-200 text-sm mt-2">
              Bitte überprüfe dein E-Mail-Postfach (auch Spam-Ordner) für einen Link zum Einloggen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.com"
                required
                className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-red-100 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Wird gesendet...' : 'Magischer Link'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Du erhältst einen sicheren Link zum Einloggen. Kein Passwort nötig.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
