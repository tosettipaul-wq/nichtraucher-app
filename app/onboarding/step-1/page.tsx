'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';

const REASONS = [
  { label: 'Gesundheit für mich selbst', icon: '💪' },
  { label: 'Für meine Familie', icon: '❤️' },
  { label: 'Finanzielle Gründe', icon: '💰' },
  { label: 'Fitness & Sport', icon: '🏃' },
  { label: 'Andere', icon: '✨' },
];

export default function Step1Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();

  const handleNext = () => {
    if (!data.reason) {
      alert('Bitte wähle einen Grund aus');
      return;
    }
    setStep(2);
    router.push('/onboarding/step-2');
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${s <= 1 ? 'bg-teal-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-wide mb-2">Schritt 1 von 5</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Warum aufhören?</h1>
        <p className="text-slate-400 mt-2">Dein persönlicher Grund ist dein stärkster Motivator.</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {REASONS.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setData('reason', label)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              data.reason === label
                ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{icon}</span>
              <span className={`font-semibold ${data.reason === label ? 'text-teal-300' : 'text-white'}`}>
                {label}
              </span>
              {data.reason === label && (
                <div className="ml-auto w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push('/')}
          className="px-5 py-3 text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-medium"
        >
          Abbrechen
        </button>
        <button
          onClick={handleNext}
          disabled={!data.reason}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/20"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
