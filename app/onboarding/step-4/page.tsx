'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';

export default function Step4Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();

  const handleNext = () => {
    if (!data.cigs_per_day || data.cigs_per_day < 1) {
      alert('Bitte gib eine gültige Anzahl ein');
      return;
    }
    setStep(5);
    router.push('/onboarding/step-5');
  };

  const cigsPerDay = (data.cigs_per_day as number) || 0;
  const monthly = cigsPerDay ? Math.round(cigsPerDay * 0.4 * 30) : 0;
  const yearly = cigsPerDay ? Math.round(cigsPerDay * 0.4 * 365) : 0;

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= 4 ? 'bg-teal-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-wide mb-2">Schritt 4 von 5</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Wie viel rauchst du?</h1>
        <p className="text-slate-400 mt-2">Für deine persönliche Ersparnis-Berechnung.</p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 space-y-4">
        <label className="block text-sm font-semibold text-slate-300">
          🚬 Zigaretten pro Tag
        </label>
        <input
          type="number"
          value={data.cigs_per_day || ''}
          onChange={(e) => setData('cigs_per_day', parseInt(e.target.value) || 0)}
          min="1"
          max="100"
          placeholder="z.B. 15"
          className="w-full px-4 py-4 text-2xl font-black rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
        />
        <p className="text-slate-500 text-xs text-center">Durchschnittliche Anzahl pro Tag</p>
      </div>

      {/* Savings preview */}
      {cigsPerDay > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-5">
          <p className="text-emerald-400 font-bold text-sm mb-3">💰 Deine Ersparnis wenn rauchfrei:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
              <p className="text-emerald-300 font-black text-xl">€{monthly}</p>
              <p className="text-emerald-400/60 text-xs mt-1">Nach 30 Tagen</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
              <p className="text-emerald-300 font-black text-xl">€{yearly}</p>
              <p className="text-emerald-400/60 text-xs mt-1">Nach 1 Jahr</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-teal-500/20 bg-teal-500/8 p-4">
        <p className="text-sm text-teal-300/80 leading-relaxed">
          💡 Diese Zahl hilft uns, deinen Fortschritt präzise zu berechnen.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => { setStep(3); router.push('/onboarding/step-3'); }}
          className="px-5 py-3 text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-medium"
        >
          ← Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={!data.cigs_per_day || data.cigs_per_day < 1}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/20"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
