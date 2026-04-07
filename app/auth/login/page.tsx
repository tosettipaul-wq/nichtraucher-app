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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-5 shadow-xl shadow-teal-500/20">
            <span className="text-3xl">🚭</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Nichtraucher</h1>
          <p className="text-slate-400 mt-2 text-sm">Melde dich an, um fortzufahren</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-sm shadow-2xl p-8">
          {success ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
              <div className="text-3xl mb-3">📧</div>
              <p className="text-emerald-300 font-bold text-base mb-2">Magischer Link versendet!</p>
              <p className="text-emerald-400/70 text-sm leading-relaxed">
                Bitte überprüfe dein E-Mail-Postfach (auch Spam-Ordner).
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-red-300 text-sm">❌ {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Wird gesendet...' : '✉️ Magischer Link senden'}
              </button>

              <p className="text-center text-xs text-slate-500 leading-relaxed">
                Kein Passwort nötig — du erhältst einen sicheren Einmal-Link.
              </p>
            </form>
          )}
        </div>

        <p className="text-center mt-5 text-sm">
          <button
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Zurück zur Startseite
          </button>
        </p>
      </div>
    </div>
  );
}
