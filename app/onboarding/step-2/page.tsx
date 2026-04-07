'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';

export default function Step2Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();

  const handleNext = () => {
    if (!data.quit_date) {
      alert('Bitte wähle ein Datum aus');
      return;
    }
    setStep(3);
    router.push('/onboarding/step-3');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${s <= 2 ? 'bg-teal-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-wide mb-2">Schritt 2 von 5</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Dein Quit-Datum</h1>
        <p className="text-slate-400 mt-2">Wann startest du dein rauchfreies Leben?</p>
      </div>

      {/* Date input */}
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            📅 Quit-Datum wählen
          </label>
          <input
            type="date"
            value={data.quit_date || today}
            onChange={(e) => setData('quit_date', e.target.value)}
            min={today}
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="rounded-xl border border-teal-500/20 bg-teal-500/8 p-4">
          <p className="text-sm text-teal-300/80 leading-relaxed">
            💡 <strong className="text-teal-300">Tipp:</strong> Wähle ein Datum bald, aber nicht überstürzt.
            Ein oder zwei Tage Vorbereitung helfen enorm!
          </p>
        </div>

        {data.quit_date && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Dein Start:</p>
            <p className="text-white font-bold text-xl">
              {new Date(data.quit_date + 'T12:00:00').toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-teal-400 text-sm mt-2">
              {Math.ceil((new Date(data.quit_date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage noch
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => { setStep(1); router.push('/onboarding/step-1'); }}
          className="px-5 py-3 text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-medium"
        >
          ← Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={!data.quit_date}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/20"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
