'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full z-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-6 shadow-2xl shadow-teal-500/25">
            <span className="text-4xl">🚭</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Nichtraucher<span className="text-teal-400">.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Dein KI-Coach auf dem Weg zur rauchfreien Zukunft.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-sm shadow-2xl p-8">
          <div className="space-y-4 mb-8">
            {[
              { icon: '📊', text: 'Tage & Geld-Tracker in Echtzeit' },
              { icon: '🤖', text: 'KI Buddy (Doctor + Coach)' },
              { icon: '🔥', text: 'Streaks, Badges & Leaderboard' },
              { icon: '👥', text: 'Accountability-Partner' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="w-full py-4 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/25 active:scale-[0.98] mb-3"
          >
            Jetzt starten →
          </button>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 px-6 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition-all"
          >
            Bereits registriert? Einloggen
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          MVP v1.0 · April 2026 · Powered by Next.js + Claude AI
        </p>
      </div>
    </div>
  );
}
