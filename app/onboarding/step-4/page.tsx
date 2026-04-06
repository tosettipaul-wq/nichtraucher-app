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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Schritt 4 von 5</h1>
        <p className="text-gray-300 text-lg mt-2">
          Wie viele Zigaretten rauchst du derzeit pro Tag?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Durchschnittliche Zigaretten pro Tag
          </label>
          <input
            type="number"
            value={data.cigs_per_day || ''}
            onChange={(e) => setData('cigs_per_day', parseInt(e.target.value) || 0)}
            min="1"
            max="100"
            placeholder="z.B. 15"
            className="w-full px-4 py-3 text-lg border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500"
          />
        </div>

        {data.cigs_per_day && (
          <div className="bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg p-4 space-y-2">
            <p className="font-medium text-amber-300">💰 Kosteneinsparung:</p>
            <div className="space-y-1 text-sm text-amber-200">
              <p>
                Nach 30 Tagen: ca.{' '}
                <strong>€ {Math.round((data.cigs_per_day * 0.4 * 30) / 10) * 10}</strong>
              </p>
              <p>
                Nach 1 Jahr: ca.{' '}
                <strong>€ {Math.round((data.cigs_per_day * 0.4 * 365) / 100) * 100}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="bg-teal-900 bg-opacity-30 border border-teal-700 rounded-lg p-4">
          <p className="text-sm text-teal-200">
            💡 Diese Zahl hilft uns, deine Fortschritte und Ersparnisse zu berechnen.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={() => {
            setStep(3);
            router.push('/onboarding/step-3');
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
