'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/onboarding-store';
import { useState } from 'react';

export default function Step3Page() {
  const router = useRouter();
  const { data, setData, setStep } = useOnboarding();
  const [customTrigger, setCustomTrigger] = useState('');

  const commonTriggers = [
    'Stress',
    'Nach dem Essen',
    'Mit Freunden',
    'Beim Kaffee',
    'Beim Autofahren',
    'Nach dem Sport',
  ];

  const currentTriggers = (data.triggers || []) as string[];

  const toggleTrigger = (trigger: string) => {
    const updated = currentTriggers.includes(trigger)
      ? currentTriggers.filter((t) => t !== trigger)
      : [...currentTriggers, trigger];
    setData('triggers', updated);
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !currentTriggers.includes(customTrigger)) {
      setData('triggers', [...currentTriggers, customTrigger]);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Schritt 3 von 5</h1>
        <p className="text-gray-300 text-lg mt-2">Was sind deine Raucher-Auslöser?</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {commonTriggers.map((trigger) => (
            <button
              key={trigger}
              onClick={() => toggleTrigger(trigger)}
              className={`p-3 rounded-lg border-2 text-left transition font-medium ${
                currentTriggers.includes(trigger)
                  ? 'border-teal-500 bg-teal-900 bg-opacity-30 text-teal-400'
                  : 'border-gray-700 bg-gray-800 text-white hover:border-gray-600'
              }`}
            >
              {currentTriggers.includes(trigger) ? '✓ ' : ''}{trigger}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customTrigger}
            onChange={(e) => setCustomTrigger(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCustomTrigger();
              }
            }}
            placeholder="Eigener Auslöser..."
            className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500"
          />
          <button
            onClick={addCustomTrigger}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
          >
            +
          </button>
        </div>

        {currentTriggers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentTriggers.map((trigger) => (
              <div
                key={trigger}
                className="bg-teal-900 bg-opacity-40 text-teal-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-teal-700"
              >
                {trigger}
                <button
                  onClick={() =>
                    setData(
                      'triggers',
                      currentTriggers.filter((t) => t !== trigger)
                    )
                  }
                  className="font-bold text-teal-400 hover:text-teal-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={() => {
            setStep(2);
            router.push('/onboarding/step-2');
          }}
          className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
        >
          ← Zurück
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition font-medium"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
