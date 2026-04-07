'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';
import { useState } from 'react';

const COMMON_TRIGGERS = [
  { label: 'Stress', icon: '😤' },
  { label: 'Nach dem Essen', icon: '🍽️' },
  { label: 'Mit Freunden', icon: '👥' },
  { label: 'Beim Kaffee', icon: '☕' },
  { label: 'Beim Autofahren', icon: '🚗' },
  { label: 'Nach dem Sport', icon: '🏋️' },
];

export default function Step3Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();
  const [customTrigger, setCustomTrigger] = useState('');

  const currentTriggers = (data.triggers || []) as string[];

  const toggleTrigger = (trigger: string) => {
    const updated = currentTriggers.includes(trigger)
      ? currentTriggers.filter((t) => t !== trigger)
      : [...currentTriggers, trigger];
    setData('triggers', updated);
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !currentTriggers.includes(customTrigger.trim())) {
      setData('triggers', [...currentTriggers, customTrigger.trim()]);
      setCustomTrigger('');
    }
  };

  const handleNext = () => {
    if (currentTriggers.length === 0) {
      alert('Bitte wähle mindestens einen Auslöser aus');
      return;
    }
    setStep(4);
    router.push('/onboarding/step-4');
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= 3 ? 'bg-teal-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-wide mb-2">Schritt 3 von 5</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Deine Auslöser</h1>
        <p className="text-slate-400 mt-2">Wähle alle Situationen aus, in denen du normalerweise rauchst.</p>
      </div>

      {/* Trigger grid */}
      <div className="grid grid-cols-2 gap-3">
        {COMMON_TRIGGERS.map(({ label, icon }) => {
          const selected = currentTriggers.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggleTrigger(label)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                  : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className={`font-semibold text-sm ${selected ? 'text-teal-300' : 'text-white'}`}>{label}</span>
              </div>
              {selected && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-teal-400 text-xs font-medium">Ausgewählt</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom trigger */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customTrigger}
          onChange={(e) => setCustomTrigger(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addCustomTrigger(); }}
          placeholder="Eigener Auslöser hinzufügen..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
        />
        <button
          onClick={addCustomTrigger}
          disabled={!customTrigger.trim()}
          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-bold disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* Selected custom triggers */}
      {currentTriggers.filter(t => !COMMON_TRIGGERS.map(c => c.label).includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentTriggers.filter(t => !COMMON_TRIGGERS.map(c => c.label).includes(t)).map((trigger) => (
            <div
              key={trigger}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-teal-500/10 text-teal-300 border border-teal-500/30"
            >
              {trigger}
              <button
                onClick={() => setData('triggers', currentTriggers.filter(t => t !== trigger))}
                className="text-teal-400 hover:text-teal-200 font-bold leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {currentTriggers.length > 0 && (
        <p className="text-teal-400 text-sm font-medium">{currentTriggers.length} Auslöser ausgewählt ✓</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => { setStep(2); router.push('/onboarding/step-2'); }}
          className="px-5 py-3 text-slate-400 border border-slate-700 rounded-xl hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-medium"
        >
          ← Zurück
        </button>
        <button
          onClick={handleNext}
          disabled={currentTriggers.length === 0}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/20"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
